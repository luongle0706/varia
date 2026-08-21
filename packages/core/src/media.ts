/**
 * Media & Audio Conversion Core Utilities
 */

export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac';
export type BitrateMode = 'cbr' | 'vbr';

export interface AudioConversionOptions {
  format: AudioFormat;
  bitrate?: string; // e.g. '128k', '192k', '256k', '320k'
  bitrateMode?: BitrateMode;
  vbrQuality?: number; // 0 (best) to 9 (worst) for MP3 -q:a
  sampleRate?: number; // e.g. 44100, 48000, 96000
  channels?: 1 | 2; // 1 = Mono, 2 = Stereo
  volumeBoost?: number; // 1.0 = 100%, 0.5 = 50%, 2.0 = 200%
  fadeIn?: number; // Duration in seconds
  fadeOut?: number; // Duration in seconds
  trimStart?: number; // Start offset in seconds
  trimEnd?: number; // End offset in seconds
}

export interface EngineLoadProgress {
  stage: string;
  progress: number;
}

export interface TranscodeProgress {
  jobId: string;
  percent: number;
  timeSeconds: number;
  totalDuration?: number;
}

export interface TranscodeResult {
  jobId: string;
  outputBuffer: ArrayBuffer;
  outputName: string;
  format: AudioFormat;
  mimeType: string;
  originalSize: number;
  outputSize: number;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  options: AudioConversionOptions;
  status: 'idle' | 'loading' | 'converting' | 'done' | 'error' | 'cancelled';
  progress: number;
  result?: TranscodeResult;
  error?: string;
}

export interface FormatInfo {
  format: AudioFormat;
  label: string;
  extension: string;
  mimeType: string;
  description: string;
  recommendedBitrates: string[];
}

export const SUPPORTED_AUDIO_FORMATS: Record<AudioFormat, FormatInfo> = {
  mp3: {
    format: 'mp3',
    label: 'MP3 (MPEG Audio)',
    extension: '.mp3',
    mimeType: 'audio/mpeg',
    description: 'Universal compatibility across all devices and players.',
    recommendedBitrates: ['64k', '128k', '192k', '256k', '320k'],
  },
  wav: {
    format: 'wav',
    label: 'WAV (Uncompressed PCM)',
    extension: '.wav',
    mimeType: 'audio/wav',
    description: 'Studio master lossless audio with zero compression artifacts.',
    recommendedBitrates: [],
  },
  aac: {
    format: 'aac',
    label: 'AAC (Advanced Audio Coding)',
    extension: '.aac',
    mimeType: 'audio/aac',
    description: 'Superior audio fidelity and compression compared to MP3.',
    recommendedBitrates: ['96k', '128k', '192k', '256k'],
  },
  ogg: {
    format: 'ogg',
    label: 'OGG (Vorbis)',
    extension: '.ogg',
    mimeType: 'audio/ogg',
    description: 'Open-source lossy audio format optimized for web & gaming.',
    recommendedBitrates: ['96k', '128k', '160k', '192k', '256k', '320k'],
  },
  flac: {
    format: 'flac',
    label: 'FLAC (Free Lossless Audio Codec)',
    extension: '.flac',
    mimeType: 'audio/flac',
    description: 'Bit-perfect lossless compression at ~50% the size of WAV.',
    recommendedBitrates: [],
  },
};

export const SUPPORTED_INPUT_EXTENSIONS = [
  // Video
  '.mp4',
  '.mkv',
  '.webm',
  '.avi',
  '.mov',
  '.flv',
  '.wmv',
  '.m4v',
  '.3gp',
  '.ts',
  // Audio
  '.wav',
  '.mp3',
  '.m4a',
  '.aac',
  '.ogg',
  '.flac',
  '.wma',
  '.opus',
  '.aiff',
];

/**
 * Check if a file is supported based on name or MIME type
 */
export function isMediaFileSupported(file: { name: string; type?: string }): boolean {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (SUPPORTED_INPUT_EXTENSIONS.includes(ext)) {
    return true;
  }
  if (file.type && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
    return true;
  }
  return false;
}

/**
 * Format seconds into HH:MM:SS.mmm or MM:SS
 */
export function formatTimecode(seconds: number, includeMilliseconds = false): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const base =
    hrs > 0
      ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (includeMilliseconds) {
    return `${base}.${ms.toString().padStart(3, '0')}`;
  }
  return base;
}

/**
 * Parse FFmpeg command line arguments from conversion options
 */
export function buildFfmpegAudioArgs(
  inputFileName: string,
  outputFileName: string,
  options: AudioConversionOptions,
  totalDurationSeconds?: number,
): string[] {
  const args: string[] = [];

  // Fast seek if trimStart is provided
  if (typeof options.trimStart === 'number' && options.trimStart > 0) {
    args.push('-ss', options.trimStart.toString());
  }

  // Input file
  args.push('-i', inputFileName);

  // Duration limit if trimEnd is provided
  if (typeof options.trimEnd === 'number' && options.trimEnd > 0) {
    const start = options.trimStart ?? 0;
    const duration = Math.max(0.1, options.trimEnd - start);
    args.push('-t', duration.toString());
  }

  // Disable video stream extraction
  args.push('-vn');

  // Build audio filter chain
  const audioFilters: string[] = [];

  // Volume boost
  if (typeof options.volumeBoost === 'number' && options.volumeBoost !== 1.0) {
    audioFilters.push(`volume=${options.volumeBoost.toFixed(2)}`);
  }

  // Fade in
  if (typeof options.fadeIn === 'number' && options.fadeIn > 0) {
    audioFilters.push(`afade=t=in:ss=0:d=${options.fadeIn.toFixed(2)}`);
  }

  // Fade out (requires duration knowledge)
  if (typeof options.fadeOut === 'number' && options.fadeOut > 0) {
    const effectiveDuration =
      typeof options.trimEnd === 'number' && options.trimEnd > 0
        ? options.trimEnd - (options.trimStart ?? 0)
        : totalDurationSeconds;

    if (typeof effectiveDuration === 'number' && effectiveDuration > options.fadeOut) {
      const fadeOutStart = effectiveDuration - options.fadeOut;
      audioFilters.push(`afade=t=out:st=${fadeOutStart.toFixed(2)}:d=${options.fadeOut.toFixed(2)}`);
    }
  }

  if (audioFilters.length > 0) {
    args.push('-af', audioFilters.join(','));
  }

  // Sample Rate
  if (typeof options.sampleRate === 'number' && options.sampleRate > 0) {
    args.push('-ar', options.sampleRate.toString());
  }

  // Audio Channels
  if (typeof options.channels === 'number') {
    args.push('-ac', options.channels.toString());
  }

  // Codec and Bitrate configuration based on target format
  switch (options.format) {
    case 'mp3':
      args.push('-c:a', 'libmp3lame');
      if (options.bitrateMode === 'vbr' && typeof options.vbrQuality === 'number') {
        args.push('-q:a', options.vbrQuality.toString());
      } else {
        args.push('-b:a', options.bitrate || '192k');
      }
      break;

    case 'aac':
      args.push('-c:a', 'aac');
      args.push('-b:a', options.bitrate || '192k');
      break;

    case 'ogg':
      args.push('-c:a', 'libvorbis');
      if (options.bitrateMode === 'vbr' && typeof options.vbrQuality === 'number') {
        args.push('-q:a', options.vbrQuality.toString());
      } else {
        args.push('-b:a', options.bitrate || '192k');
      }
      break;

    case 'flac':
      args.push('-c:a', 'flac');
      break;

    case 'wav':
      args.push('-c:a', 'pcm_s16le');
      break;
  }

  // Overwrite output file without asking
  args.push('-y', outputFileName);

  return args;
}

/**
 * Parse FFmpeg stderr log lines to extract progress and elapsed time
 */
export function parseFfmpegProgress(
  logLine: string,
  totalDurationSeconds?: number,
): { timeSeconds: number; percent: number } | null {
  // Typical FFmpeg output: "size=     512kB time=00:00:23.45 bitrate= 178.6kbits/s speed=4.2x"
  const timeMatch = logLine.match(/time=\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (!timeMatch || !timeMatch[1] || !timeMatch[2] || !timeMatch[3]) {
    return null;
  }

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = parseFloat(timeMatch[3]);
  const timeSeconds = hours * 3600 + minutes * 60 + seconds;

  let percent = 0;
  if (typeof totalDurationSeconds === 'number' && totalDurationSeconds > 0) {
    percent = Math.min(100, Math.max(0, Math.round((timeSeconds / totalDurationSeconds) * 100)));
  }

  return { timeSeconds, percent };
}
