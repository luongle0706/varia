/**
 * YouTube Downloader Types, URL Validators & Resolution Matrix
 */

export type YouTubeResolutionQuality =
  '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';

export type YouTubeVideoCodec = 'h264' | 'vp9' | 'av1';

export type YouTubeAudioBitrate = '320k' | '256k' | '192k' | '128k';

export interface YouTubeResolutionOption {
  quality: YouTubeResolutionQuality;
  label: string;
  height: number;
  fps?: number;
  estimatedSizeBytes?: number;
  isOriginalMax?: boolean;
}

export interface YouTubeAudioOption {
  bitrate: YouTubeAudioBitrate;
  label: string;
  estimatedSizeBytes?: number;
}

export interface YouTubeVideoInfo {
  id: string;
  url: string;
  title: string;
  author: string;
  authorUrl?: string;
  authorAvatar?: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnail: string;
  viewCount?: number;
  publishDate?: string;
  maxResolution: YouTubeResolutionQuality;
  availableResolutions: YouTubeResolutionOption[];
  availableAudioBitrates: YouTubeAudioOption[];
}

export interface YouTubeDownloadQuery {
  url: string;
  format: 'mp4' | 'mp3';
  resolution?: YouTubeResolutionQuality;
  videoCodec?: YouTubeVideoCodec;
  audioBitrate?: YouTubeAudioBitrate;
}

export interface YouTubeJobProgress {
  jobId: string;
  stage: 'idle' | 'fetching' | 'downloading' | 'merging' | 'ready' | 'error';
  percent: number;
  speed?: string;
  eta?: string;
  totalSize?: string;
  message?: string;
  downloadUrl?: string;
  error?: string;
}

/**
 * Parse yt-dlp stdout line for real-time progress percentage, speed, and ETA
 */
export function parseYtDlpProgress(line: string): Partial<YouTubeJobProgress> | null {
  if (!line || typeof line !== 'string') return null;

  // Example: [download]  45.2% of 12.34MiB at 10.50MiB/s ETA 00:03
  const downloadMatch = line.match(
    /\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/i,
  );
  if (downloadMatch && downloadMatch[1]) {
    return {
      stage: 'downloading',
      percent: Math.min(100, parseFloat(downloadMatch[1])),
      totalSize: downloadMatch[2],
      speed: downloadMatch[3],
      eta: downloadMatch[4],
    };
  }

  // Example: [Merger] Merging formats into ...
  if (line.includes('[Merger]') || line.includes('[ExtractAudio]')) {
    return {
      stage: 'merging',
      percent: 96,
      message: 'Merging media streams with FFmpeg...',
    };
  }

  return null;
}

export const YOUTUBE_RESOLUTION_TIERS: Array<{
  quality: YouTubeResolutionQuality;
  height: number;
  label: string;
}> = [
  { quality: '2160p', height: 2160, label: '2160p (4K UHD)' },
  { quality: '1440p', height: 1440, label: '1440p (2K QHD)' },
  { quality: '1080p', height: 1080, label: '1080p (Full HD)' },
  { quality: '720p', height: 720, label: '720p (HD)' },
  { quality: '480p', height: 480, label: '480p (SD)' },
  { quality: '360p', height: 360, label: '360p' },
  { quality: '240p', height: 240, label: '240p' },
  { quality: '144p', height: 144, label: '144p' },
];

export const YOUTUBE_VIDEO_CODECS: Record<
  YouTubeVideoCodec,
  { name: string; description: string; formatFlag: string }
> = {
  h264: {
    name: 'H.264 / AVC',
    description: 'Default (Maximum device & TV compatibility)',
    formatFlag: 'avc1',
  },
  vp9: {
    name: 'VP9',
    description: 'High efficiency modern web codec',
    formatFlag: 'vp9',
  },
  av1: {
    name: 'AV1',
    description: 'Next-Gen pristine visual quality',
    formatFlag: 'av01',
  },
};

export const YOUTUBE_AUDIO_BITRATES: Record<
  YouTubeAudioBitrate,
  { name: string; description: string; kbps: number }
> = {
  '320k': {
    name: '320 kbps',
    description: 'Ultra High Quality (Studio Master)',
    kbps: 320,
  },
  '256k': {
    name: '256 kbps',
    description: 'High Quality (Audiophile)',
    kbps: 256,
  },
  '192k': {
    name: '192 kbps',
    description: 'CD Quality (Recommended)',
    kbps: 192,
  },
  '128k': {
    name: '128 kbps',
    description: 'Standard / Compact',
    kbps: 128,
  },
};

/**
 * Strict regex for YouTube video URLs (watch, shorts, youtu.be, embed, music)
 */
const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})([?&].*)?$/;

/**
 * Validate whether a string is a legitimate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return YOUTUBE_REGEX.test(trimmed);
}

/**
 * Extract 11-character YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(YOUTUBE_REGEX);
  return match && match[5] ? match[5] : null;
}

/**
 * Filter resolution options from 144p up to the video's actual max height
 */
export function filterResolutionsUpTo(maxHeight: number): YouTubeResolutionOption[] {
  // Find matching tiers <= maxHeight, sorted descending
  const matchedTiers = YOUTUBE_RESOLUTION_TIERS.filter(tier => tier.height <= maxHeight);

  // If video height is between tiers (e.g. 1080p), ensure we have at least 144p
  if (matchedTiers.length === 0) {
    return [{ quality: '144p', height: 144, label: '144p', isOriginalMax: true }];
  }

  return matchedTiers.map((tier, index) => ({
    quality: tier.quality,
    label: tier.label,
    height: tier.height,
    isOriginalMax: index === 0,
  }));
}

/**
 * Format duration in seconds to standard MM:SS or HH:MM:SS
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}
