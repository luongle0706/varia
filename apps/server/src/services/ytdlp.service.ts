import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { FastifyReply } from 'fastify';
import ffmpegPath from 'ffmpeg-static';
import {
  type YouTubeVideoInfo,
  type YouTubeDownloadQuery,
  type YouTubeResolutionQuality,
  type YouTubeJobProgress,
  isValidYouTubeUrl,
  filterResolutionsUpTo,
  formatVideoDuration,
  parseYtDlpProgress,
  YOUTUBE_VIDEO_CODECS,
} from '@varia/core';
import { execYtDlp, spawnYtDlp } from './ytdlp-bin.js';

interface RawFormat {
  format_id?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  filesize_approx?: number;
}

interface RawMetadata {
  id?: string;
  webpage_url?: string;
  title?: string;
  uploader?: string;
  uploader_url?: string;
  duration?: number;
  thumbnail?: string;
  view_count?: number;
  upload_date?: string;
  formats?: RawFormat[];
}

interface ActiveJob {
  jobId: string;
  query: YouTubeDownloadQuery;
  progress: YouTubeJobProgress;
  listeners: Set<(p: YouTubeJobProgress) => void>;
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  timeoutId?: NodeJS.Timeout;
}

const activeJobs = new Map<string, ActiveJob>();

/**
 * Fetch and normalize YouTube video metadata and available resolution matrix
 */
export async function fetchYouTubeInfo(url: string): Promise<YouTubeVideoInfo> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL provided.');
  }

  console.log(`[Varia:Server-YTDLP] Fetching metadata for: ${url}`);
  const stdout = await execYtDlp(['--dump-single-json', '--no-warnings', '--skip-download', url]);

  let data: RawMetadata;
  try {
    data = JSON.parse(stdout);
  } catch (err) {
    console.error('[Varia:Server-YTDLP] Failed to parse yt-dlp JSON output:', err);
    throw new Error('Failed to parse video metadata from YouTube.');
  }

  const formats = data.formats || [];

  // Determine highest available video height
  let maxHeight = 0;
  for (const f of formats) {
    if (f.vcodec && f.vcodec !== 'none' && typeof f.height === 'number') {
      if (f.height > maxHeight) {
        maxHeight = f.height;
      }
    }
  }

  // Fallback to 1080p if unable to detect
  if (maxHeight === 0) {
    maxHeight = 1080;
  }

  const availableResolutions = filterResolutionsUpTo(maxHeight);
  const maxResolution: YouTubeResolutionQuality = availableResolutions[0]?.quality || '1080p';

  return {
    id: data.id || 'video',
    url: data.webpage_url || url,
    title: data.title || 'YouTube Video',
    author: data.uploader || 'Unknown Channel',
    authorUrl: data.uploader_url,
    durationSeconds: data.duration || 0,
    durationFormatted: formatVideoDuration(data.duration || 0),
    thumbnail: data.thumbnail || '',
    viewCount: data.view_count,
    publishDate: data.upload_date,
    maxResolution,
    availableResolutions,
    availableAudioBitrates: [
      { bitrate: '320k', label: '320 kbps (Ultra HQ)' },
      { bitrate: '256k', label: '256 kbps (High)' },
      { bitrate: '192k', label: '192 kbps (Standard / CD)' },
      { bitrate: '128k', label: '128 kbps (Compact)' },
    ],
  };
}

/**
 * Start asynchronous download job with live progress broadcasting
 */
export async function startYouTubeDownloadJob(
  query: YouTubeDownloadQuery,
): Promise<{ jobId: string }> {
  if (!isValidYouTubeUrl(query.url)) {
    throw new Error('Invalid YouTube URL provided');
  }

  const jobId = `varia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isAudioOnly = query.format === 'mp3';
  const targetResolution = query.resolution || '1080p';
  const targetHeight = parseInt(targetResolution.replace('p', ''), 10) || 1080;
  const codecKey = query.videoCodec || 'h264';
  const codecFlag = YOUTUBE_VIDEO_CODECS[codecKey]?.formatFlag || 'avc1';
  const audioBitrate = query.audioBitrate || '320k';

  const tempDir = path.join(os.tmpdir(), 'varia_downloads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const outputTemplate = path.join(tempDir, `${jobId}.%(ext)s`);

  const job: ActiveJob = {
    jobId,
    query,
    progress: {
      jobId,
      stage: 'fetching',
      percent: 5,
      message: 'Connecting to stream...',
    },
    listeners: new Set(),
  };

  activeJobs.set(jobId, job);

  // Auto cleanup job file after 10 minutes to allow multiple or retried client downloads
  job.timeoutId = setTimeout(
    () => {
      cleanupJob(jobId);
    },
    10 * 60 * 1000,
  );

  const args: string[] = ['--no-warnings', '--no-playlist', '--newline'];

  const ffmpegExecutable = typeof ffmpegPath === 'string' ? ffmpegPath : null;
  if (ffmpegExecutable) {
    args.push('--ffmpeg-location', ffmpegExecutable);
  }

  if (isAudioOnly) {
    args.push(
      '-f',
      'bestaudio/best',
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      audioBitrate,
      '-o',
      outputTemplate,
      query.url,
    );
  } else {
    const formatSelector = `bestvideo[height<=${targetHeight}][vcodec^=${codecFlag}]+bestaudio/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`;
    args.push(
      '-f',
      formatSelector,
      '--merge-output-format',
      'mp4',
      '-o',
      outputTemplate,
      query.url,
    );
  }

  console.log(
    `[Varia:Server-YTDLP] Starting Job ${jobId} (${query.format.toUpperCase()}):`,
    args.join(' '),
  );

  (async () => {
    try {
      const proc = await spawnYtDlp(args);

      proc.stdout?.on('data', chunk => {
        const text = chunk.toString();
        const lines = text.split('\n');
        for (const line of lines) {
          const parsed = parseYtDlpProgress(line);
          if (parsed) {
            updateJobProgress(jobId, parsed);
          }
        }
      });

      proc.stderr?.on('data', chunk => {
        const text = chunk.toString();
        if (text.includes('ERROR:')) {
          console.error(`[Varia:Server-YTDLP Job ${jobId} stderr]:`, text.trim());
        }
      });

      proc.on('close', code => {
        if (code === 0) {
          // Locate the generated file
          const matchingFiles = fs.readdirSync(tempDir).filter(f => f.startsWith(jobId));
          if (matchingFiles.length > 0 && matchingFiles[0]) {
            const fileName = matchingFiles[0];
            const filePath = path.join(tempDir, fileName);
            const stat = fs.statSync(filePath);
            const ext = isAudioOnly ? 'mp3' : 'mp4';
            const mimeType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';

            job.filePath = filePath;
            job.fileName = `${jobId}.${ext}`;
            job.mimeType = mimeType;
            job.fileSize = stat.size;

            updateJobProgress(jobId, {
              stage: 'ready',
              percent: 100,
              message: 'Download ready!',
              downloadUrl: `/api/youtube/download/file?jobId=${jobId}`,
            });
            console.log(`[Varia:Server-YTDLP] Job ${jobId} ready (${stat.size} bytes).`);
          } else {
            updateJobProgress(jobId, {
              stage: 'error',
              error: 'Processed media file could not be located on server',
            });
          }
        } else {
          updateJobProgress(jobId, {
            stage: 'error',
            error: `yt-dlp exited with non-zero status code: ${code}`,
          });
        }
      });

      proc.on('error', err => {
        updateJobProgress(jobId, {
          stage: 'error',
          error: err.message,
        });
      });
    } catch (err) {
      updateJobProgress(jobId, {
        stage: 'error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  return { jobId };
}

function updateJobProgress(jobId: string, partial: Partial<YouTubeJobProgress>) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.progress = {
    ...job.progress,
    ...partial,
  };

  for (const listener of job.listeners) {
    try {
      listener(job.progress);
    } catch {
      // Ignore listener error
    }
  }
}

/**
 * Subscribe to live progress updates via Server-Sent Events (SSE)
 */
export function subscribeToJobProgress(
  jobId: string,
  onProgress: (p: YouTubeJobProgress) => void,
): () => void {
  const job = activeJobs.get(jobId);
  if (!job) {
    onProgress({
      jobId,
      stage: 'error',
      percent: 0,
      error: 'Job not found or expired',
    });
    return () => {};
  }

  // Send current state immediately
  onProgress(job.progress);

  job.listeners.add(onProgress);
  return () => {
    job.listeners.delete(onProgress);
  };
}

/**
 * Serve the completed job binary file safely to client
 */
export function serveJobFile(jobId: string, reply: FastifyReply): FastifyReply {
  const job = activeJobs.get(jobId);
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return reply.status(404).send({ error: 'Download file not found or expired.' });
  }

  const filePath = job.filePath;
  const fileName = job.fileName || 'download.mp4';
  const mimeType = job.mimeType || 'video/mp4';
  const fileSize = job.fileSize || fs.statSync(filePath).size;

  reply.header('Content-Type', mimeType);
  reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
  reply.header('Content-Length', fileSize);
  reply.header('Cache-Control', 'no-cache');

  const stream = fs.createReadStream(filePath);
  return reply.send(stream);
}

function cleanupJob(jobId: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  if (job.timeoutId) clearTimeout(job.timeoutId);
  if (job.filePath && fs.existsSync(job.filePath)) {
    try {
      fs.unlinkSync(job.filePath);
      console.log(`[Varia:Server-YTDLP] Cleaned up job file: ${job.filePath}`);
    } catch {
      // Ignore
    }
  }
  activeJobs.delete(jobId);
}
