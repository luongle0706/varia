/**
 * Smart Image Compression & Encoding Engine
 * Delivers perceptual visually lossless compression, format cross-conversion,
 * and fast iterative bisection search for target file sizes.
 */

import type {
  ImageCompressionConfig,
  ImageOutputFormat,
  ImageProcessResult,
} from './types.js';

export function getMimeTypeForFormat(format: ImageOutputFormat): string {
  switch (format) {
    case 'webp':
      return 'image/webp';
    case 'jpeg':
      return 'image/jpeg';
    case 'avif':
      return 'image/avif';
    case 'png':
    default:
      return 'image/png';
  }
}

export function getFileExtensionForFormat(format: ImageOutputFormat): string {
  switch (format) {
    case 'webp':
      return '.webp';
    case 'jpeg':
      return '.jpg';
    case 'avif':
      return '.avif';
    case 'png':
    default:
      return '.png';
  }
}

/**
 * Derives an output filename replacing the old extension.
 */
export function getOutputFileName(originalName: string, format: ImageOutputFormat): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const ext = getFileExtensionForFormat(format);
  return `${baseName}_compressed${ext}`;
}

/**
 * Converts a Canvas element to a Blob asynchronously with fallback.
 */
export async function canvasToBlobAsync(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  const normalizedQuality = Math.max(0.01, Math.min(1, quality / 100));

  if (typeof (canvas as OffscreenCanvas).convertToBlob === 'function') {
    return await (canvas as OffscreenCanvas).convertToBlob({
      type: mimeType,
      quality: normalizedQuality,
    });
  }

  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to encode canvas to ${mimeType}`));
        }
      },
      mimeType,
      normalizedQuality,
    );
  });
}

/**
 * Calculates optimal smart compression quality for perceptual visually lossless output.
 */
export function getSmartCompressionQuality(format: ImageOutputFormat): number {
  switch (format) {
    case 'webp':
      return 82; // WebP at 82% offers visually identical SSIM with ~75% size reduction
    case 'avif':
      return 78;
    case 'jpeg':
      return 80;
    case 'png':
      return 90;
  }
}

/**
 * Compresses canvas content to target format, running binary search bisection if target KB is set.
 */
export async function encodeCanvasImage(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: ImageCompressionConfig,
  originalSize: number,
  originalFileName: string,
): Promise<ImageProcessResult> {
  const format = config.format || 'webp';
  const mimeType = getMimeTypeForFormat(format);

  let initialQuality = config.smartMode
    ? getSmartCompressionQuality(format)
    : Math.max(1, Math.min(100, config.quality || 85));

  let effectiveQuality = initialQuality;
  let finalBlob: Blob;

  if (config.targetSizeKb && config.targetSizeKb > 0 && format !== 'png') {
    // Binary search bisection for target size in KB (max 6 iterations)
    const targetBytes = config.targetSizeKb * 1024;
    let low = 5;
    let high = 98;
    let bestBlob: Blob | null = null;
    let bestQuality = low;

    for (let i = 0; i < 6; i++) {
      const mid = Math.round((low + high) / 2);
      const testBlob = await canvasToBlobAsync(canvas, mimeType, mid);

      if (testBlob.size <= targetBytes) {
        bestBlob = testBlob;
        bestQuality = mid;
        low = mid + 1; // Try higher quality
      } else {
        high = mid - 1; // Try lower quality
      }
    }

    finalBlob = bestBlob || (await canvasToBlobAsync(canvas, mimeType, low));
    effectiveQuality = bestBlob ? bestQuality : low;
  } else {
    finalBlob = await canvasToBlobAsync(canvas, mimeType, initialQuality);
    effectiveQuality = initialQuality;
  }

  const compressedSize = finalBlob.size;
  const savingsBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercentage =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 1000) / 10)
      : 0;

  const url = URL.createObjectURL(finalBlob);
  const fileName = getOutputFileName(originalFileName, format);

  return {
    blob: finalBlob,
    url,
    width: canvas.width,
    height: canvas.height,
    originalSize,
    compressedSize,
    savingsBytes,
    savingsPercentage,
    format,
    mimeType,
    fileName,
    effectiveQuality,
  };
}
