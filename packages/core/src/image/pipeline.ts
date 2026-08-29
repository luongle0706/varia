/**
 * Deterministic Image Processing Pipeline
 * Orchestrates geometry transformations, cropping, filters, meme text overlays,
 * color quantization, and encoding into a unified execution flow.
 */

import type {
  ImageProcessResult,
  ImageStudioPipelineConfig,
} from './types.js';
import {
  calculateRotatedDimensions,
  applyGeometricTransform,
  clampCropRect,
} from './transform.js';
import { buildCssFilterString, applySharpenConvolution } from './filter.js';
import {
  calculateBannerHeight,
  renderCaptionBanner,
  renderClassicMemeText,
} from './meme.js';
import { quantizeImageData } from './quantize.js';
import { encodeCanvasImage } from './compress.js';

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement.
 */
export async function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image source'));
    };
  });
}

/**
 * Creates an OffscreenCanvas or fallback HTMLCanvasElement.
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/**
 * Executes the complete deterministic image pipeline on a source image.
 */
export async function processImagePipeline(
  source: HTMLImageElement | File | Blob | string,
  config: ImageStudioPipelineConfig,
  originalSize: number = 0,
  originalFileName: string = 'image.png',
): Promise<ImageProcessResult> {
  const img = source instanceof HTMLImageElement ? source : await loadImageElement(source);
  const rawWidth = img.naturalWidth || img.width;
  const rawHeight = img.naturalHeight || img.height;

  // Step 1: Geometric Transform (Rotate, Free Rotate, Flip)
  const rotatedDims = calculateRotatedDimensions(rawWidth, rawHeight, config.transform.rotate);
  const transformCanvas = createCanvas(rotatedDims.width, rotatedDims.height);
  const transformCtx = transformCanvas.getContext('2d', { willReadFrequently: true });

  if (!transformCtx) {
    throw new Error('Failed to get 2D canvas context for transform');
  }

  // Draw with geometric transformations
  applyGeometricTransform(
    transformCtx,
    rawWidth,
    rawHeight,
    rotatedDims.width,
    rotatedDims.height,
    config.transform,
  );
  transformCtx.drawImage(img, 0, 0);
  transformCtx.restore();

  // Step 2: Cropping
  let croppedCanvas: HTMLCanvasElement;
  if (config.crop.rect) {
    const clampedCrop = clampCropRect(config.crop.rect, rotatedDims);
    croppedCanvas = createCanvas(clampedCrop.width, clampedCrop.height);
    const cropCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });
    if (!cropCtx) throw new Error('Failed to get crop canvas context');

    if (config.crop.circular) {
      cropCtx.beginPath();
      cropCtx.arc(
        clampedCrop.width / 2,
        clampedCrop.height / 2,
        Math.min(clampedCrop.width, clampedCrop.height) / 2,
        0,
        Math.PI * 2,
      );
      cropCtx.clip();
    }

    cropCtx.drawImage(
      transformCanvas,
      clampedCrop.x,
      clampedCrop.y,
      clampedCrop.width,
      clampedCrop.height,
      0,
      0,
      clampedCrop.width,
      clampedCrop.height,
    );
  } else {
    croppedCanvas = transformCanvas;
  }

  // Step 3: Color Adjustments & Filters
  const filterString = buildCssFilterString(config.filters);
  const filterCanvas = createCanvas(croppedCanvas.width, croppedCanvas.height);
  const filterCtx = filterCanvas.getContext('2d', { willReadFrequently: true });
  if (!filterCtx) throw new Error('Failed to get filter canvas context');

  if (filterString !== 'none') {
    filterCtx.filter = filterString;
  }
  filterCtx.drawImage(croppedCanvas, 0, 0);
  filterCtx.filter = 'none';

  // Apply Sharpen Convolution if configured
  if (config.filters.sharpen > 0) {
    applySharpenConvolution(
      filterCtx,
      filterCanvas.width,
      filterCanvas.height,
      config.filters.sharpen,
    );
  }

  // Step 4: Meme Generator & Caption Banner Overlays
  let finalCanvas: HTMLCanvasElement;
  const tempCtx = filterCanvas.getContext('2d');
  const bannerHeight =
    config.meme.style === 'caption-banner' && tempCtx
      ? calculateBannerHeight(tempCtx, config.meme, filterCanvas.width)
      : 0;

  if (bannerHeight > 0) {
    // Caption banner expands canvas vertically
    finalCanvas = createCanvas(filterCanvas.width, filterCanvas.height + bannerHeight);
    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!finalCtx) throw new Error('Failed to get final canvas context');

    // Render banner at top
    renderCaptionBanner(finalCtx, config.meme, bannerHeight, filterCanvas.width);

    // Draw image below banner
    finalCtx.drawImage(filterCanvas, 0, bannerHeight);
  } else {
    finalCanvas = filterCanvas;
    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (finalCtx && config.meme.style === 'classic') {
      renderClassicMemeText(finalCtx, config.meme, finalCanvas.width, finalCanvas.height);
    }
  }

  // Step 5: Color Quantization (Palette reduction)
  if (config.compression.maxColors && config.compression.maxColors < 256) {
    const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (finalCtx) {
      const imgData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
      const quantized = quantizeImageData(imgData, config.compression.maxColors, true);
      finalCtx.putImageData(quantized, 0, 0);
    }
  }

  // Step 6: Compression & Encoding
  return await encodeCanvasImage(
    finalCanvas,
    config.compression,
    originalSize,
    originalFileName,
  );
}
