/**
 * GIF Studio & Video to GIF Core Utilities
 */

export type GifScalePreset = 'original' | '480p' | '360p' | '240p' | '160p';
export type GifDitherMode = 'bayer' | 'floyd_steinberg' | 'sierra2_4a' | 'none';

export interface GifCropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GifConversionOptions {
  fps?: number; // e.g. 10, 12, 15, 20, 24, 30 (default 15)
  scalePreset?: GifScalePreset;
  customWidth?: number; // e.g. 480 (forces aspect ratio scale if customHeight is -1)
  customHeight?: number; // -1 for auto
  preserveAspectRatio?: boolean;
  crop?: GifCropRegion;
  rotate?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  reverse?: boolean;
  speed?: number; // 0.25 to 3.0 (default 1.0)
  trimStart?: number; // seconds
  trimEnd?: number; // seconds
  loopCount?: number; // 0 = infinite (default), 1 = once, N = N times
  dither?: GifDitherMode; // default 'bayer'
  bayerScale?: number; // 1 to 5 (default 2)
  maxColors?: number; // 32 to 256 (default 256)
}

export type ErrorCategory = 'user_validation' | 'system_runtime' | 'memory_limit';

export interface StructuredError {
  category: ErrorCategory;
  title: string;
  message: string;
  technicalDetails?: string;
  field?: 'trim' | 'crop' | 'dimensions' | 'file';
  actionType?: 'clamp_trim' | 'reset_crop' | 'reset_settings' | 'retry';
  actionLabel?: string;
}

export const SCALE_PRESET_RESOLUTIONS: Record<GifScalePreset, number> = {
  original: 0,
  '480p': 480,
  '360p': 360,
  '240p': 240,
  '160p': 160,
};

export const COMMON_GIF_FPS = [10, 12, 15, 20, 24, 30] as const;

/**
 * Validate user-provided GIF conversion options before launching transcode
 */
export function validateGifOptions(
  options: GifConversionOptions,
  videoMeta?: { duration?: number; width?: number; height?: number },
): StructuredError | null {
  const trimStart = options.trimStart ?? 0;
  const trimEnd = options.trimEnd;

  // 1. Trim validation
  if (typeof trimEnd === 'number' && trimEnd > 0) {
    if (trimStart >= trimEnd) {
      return {
        category: 'user_validation',
        title: 'Invalid Time Range',
        message: `Start time (${trimStart.toFixed(2)}s) cannot be greater than or equal to end time (${trimEnd.toFixed(2)}s).`,
        field: 'trim',
        actionType: 'clamp_trim',
        actionLabel: 'Reset to Full Video',
      };
    }

    const duration = trimEnd - trimStart;
    if (duration < 0.1) {
      return {
        category: 'user_validation',
        title: 'Clip Too Short',
        message: 'Selected GIF duration must be at least 0.1 seconds.',
        field: 'trim',
        actionType: 'clamp_trim',
        actionLabel: 'Extend Duration',
      };
    }

    // Guard against excessive browser memory usage (e.g. > 60s GIF)
    if (duration > 60) {
      return {
        category: 'memory_limit',
        title: 'Duration Exceeds Recommended Limit',
        message:
          'Generating GIFs longer than 60 seconds may cause browser memory exhaustion. We recommend keeping clips under 30 seconds.',
        field: 'trim',
      };
    }
  }

  // 2. Crop validation
  if (options.crop && videoMeta?.width && videoMeta?.height) {
    const { x, y, width, height } = options.crop;
    if (width <= 0 || height <= 0) {
      return {
        category: 'user_validation',
        title: 'Invalid Crop Dimensions',
        message: 'Crop area width and height must be greater than zero.',
        field: 'crop',
        actionType: 'reset_crop',
        actionLabel: 'Reset Crop',
      };
    }

    if (x + width > videoMeta.width || y + height > videoMeta.height || x < 0 || y < 0) {
      return {
        category: 'user_validation',
        title: 'Crop Area Out of Bounds',
        message: `Crop area (${Math.round(x)}, ${Math.round(y)}, ${Math.round(width)}x${Math.round(height)}) exceeds source video bounds (${videoMeta.width}x${videoMeta.height}).`,
        field: 'crop',
        actionType: 'reset_crop',
        actionLabel: 'Fit Crop to Bounds',
      };
    }
  }

  // 3. Custom Dimensions validation
  if (typeof options.customWidth === 'number' && options.customWidth > 0) {
    if (options.customWidth > 1920) {
      return {
        category: 'memory_limit',
        title: 'Dimensions Too Large for GIF',
        message:
          'GIFs wider than 1920px consume heavy memory and produce massive file sizes. We recommend 480px–800px.',
        field: 'dimensions',
      };
    }
  }

  return null;
}

/**
 * Build optimized two-pass FFmpeg argument list for high quality Video-to-GIF conversion
 */
export function buildFfmpegGifArgs(
  inputFileName: string,
  outputFileName: string,
  options: GifConversionOptions,
  _totalDurationSeconds?: number,
): string[] {
  const args: string[] = [];

  // 1. Fast seek input and input duration (BEFORE -i so the demuxer only reads [trimStart, trimEnd])
  if (typeof options.trimStart === 'number' && options.trimStart > 0) {
    args.push('-ss', options.trimStart.toString());
  }

  if (typeof options.trimEnd === 'number' && options.trimEnd > 0) {
    const start = typeof options.trimStart === 'number' ? Math.max(0, options.trimStart) : 0;
    const duration = Math.max(0.05, options.trimEnd - start);
    args.push('-t', duration.toString());
  }

  args.push('-i', inputFileName);

  // Build video filter graph for video processing before palette generation
  const vFilters: string[] = [];

  // Reset timestamps so filters receive clean 0-based PTS
  vFilters.push('setpts=PTS-STARTPTS');

  // 1. Speed Adjustment (setpts=(1/speed)*PTS)
  const speed = options.speed ?? 1.0;
  if (speed !== 1.0 && speed > 0) {
    const ptsFactor = (1 / speed).toFixed(4);
    vFilters.push(`setpts=${ptsFactor}*PTS`);
  }

  // 2. Playback Reverse
  if (options.reverse) {
    vFilters.push('reverse');
  }

  // 3. Crop Filter (crop=w:h:x:y)
  if (options.crop) {
    const { width, height, x, y } = options.crop;
    // Ensure even integers for FFmpeg codec safety
    const cw = Math.max(2, Math.floor(width / 2) * 2);
    const ch = Math.max(2, Math.floor(height / 2) * 2);
    const cx = Math.max(0, Math.floor(x));
    const cy = Math.max(0, Math.floor(y));
    vFilters.push(`crop=${cw}:${ch}:${cx}:${cy}`);
  }

  // 4. Rotation & Flips
  if (options.rotate === 90) {
    vFilters.push('transpose=1'); // 90 deg clockwise
  } else if (options.rotate === 180) {
    vFilters.push('transpose=1,transpose=1');
  } else if (options.rotate === 270) {
    vFilters.push('transpose=2'); // 90 deg counter-clockwise
  }

  if (options.flipHorizontal) {
    vFilters.push('hflip');
  }
  if (options.flipVertical) {
    vFilters.push('vflip');
  }

  // 5. Frame Rate (FPS)
  const fps = Math.min(60, Math.max(1, Math.round(options.fps || 15)));
  vFilters.push(`fps=${fps}`);

  // 6. Scale & Resolution
  let targetWidth = -1;
  let targetHeight = -1;

  if (typeof options.customWidth === 'number' && options.customWidth > 0) {
    targetWidth = Math.floor(options.customWidth / 2) * 2;
    if (typeof options.customHeight === 'number' && options.customHeight > 0) {
      targetHeight = Math.floor(options.customHeight / 2) * 2;
    } else {
      targetHeight = -2; // auto aspect ratio preserved to even number
    }
  } else if (options.scalePreset && options.scalePreset !== 'original') {
    targetWidth = SCALE_PRESET_RESOLUTIONS[options.scalePreset];
    targetHeight = -2; // auto aspect ratio preserved to even number
  }

  if (targetWidth > 0) {
    vFilters.push(`scale=${targetWidth}:${targetHeight}:flags=lanczos`);
  }

  // 7. High-Quality Two-Pass Palette Generation & Palette Application
  const maxColors = Math.min(256, Math.max(16, options.maxColors || 128));
  const paletteGen = `palettegen=max_colors=${maxColors}:stats_mode=full`;

  const ditherMode = options.dither || 'bayer';
  let paletteUse = 'paletteuse';
  if (ditherMode === 'bayer') {
    const bScale = Math.min(5, Math.max(1, options.bayerScale || 2));
    paletteUse = `paletteuse=dither=bayer:bayer_scale=${bScale}`;
  } else if (ditherMode === 'floyd_steinberg') {
    paletteUse = 'paletteuse=dither=floyd_steinberg';
  } else if (ditherMode === 'sierra2_4a') {
    paletteUse = 'paletteuse=dither=sierra2_4a';
  } else if (ditherMode === 'none') {
    paletteUse = 'paletteuse=dither=none';
  }

  // Combine into single split filtergraph:
  // [0:v] <vFilters>,split [a][b]; [a] <paletteGen> [p]; [b][p] <paletteUse>
  const preFilterString = vFilters.length > 0 ? `${vFilters.join(',')},` : '';
  const complexFilter = `[0:v] ${preFilterString}split [a][b]; [a] ${paletteGen} [p]; [b][p] ${paletteUse}`;

  args.push('-filter_complex', complexFilter);

  // 8. Loop Count
  // -loop 0 is infinite, -loop -1 is no loop (plays once), -loop N repeats N times
  const loop = typeof options.loopCount === 'number' ? options.loopCount : 0;
  args.push('-loop', loop.toString());

  // Disable audio stream for GIF
  args.push('-an');

  // Overwrite output
  args.push('-y', outputFileName);

  return args;
}

/**
 * Estimate output GIF file size and frame count based on options
 */
export function calculateEstimatedGifSize(
  options: GifConversionOptions,
  durationSeconds: number,
  videoWidth = 640,
  videoHeight = 360,
): { estimatedBytes: number; frameCount: number } {
  const speed = options.speed || 1.0;
  const effectiveDuration = Math.max(0.1, durationSeconds / speed);
  const fps = options.fps || 15;
  const frameCount = Math.round(effectiveDuration * fps);

  let targetW = videoWidth;
  let targetH = videoHeight;

  if (options.crop) {
    targetW = options.crop.width;
    targetH = options.crop.height;
  }

  if (typeof options.customWidth === 'number' && options.customWidth > 0) {
    const ratio = targetH / targetW;
    targetW = options.customWidth;
    targetH =
      typeof options.customHeight === 'number' && options.customHeight > 0
        ? options.customHeight
        : Math.round(targetW * ratio);
  } else if (options.scalePreset && options.scalePreset !== 'original') {
    const maxDimension = SCALE_PRESET_RESOLUTIONS[options.scalePreset];
    if (targetW > maxDimension) {
      const ratio = targetH / targetW;
      targetW = maxDimension;
      targetH = Math.round(targetW * ratio);
    }
  }

  // Average compressed GIF frame byte size estimation: ~0.15 to 0.25 bytes per pixel
  const pixelsPerFrame = targetW * targetH;
  const maxColors = options.maxColors || 256;
  const colorFactor = maxColors / 256;
  const bytesPerFrame = pixelsPerFrame * 0.18 * colorFactor;

  const estimatedBytes = Math.round(frameCount * bytesPerFrame);
  return { estimatedBytes, frameCount };
}
