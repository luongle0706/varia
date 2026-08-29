/**
 * Image Transformation & Geometry Engine
 * Handles rotation, free rotate angle math, flipping, and aspect ratio crop calculations.
 */

import type {
  AspectRatioPreset,
  CropRect,
  ImageDimensions,
  ImageTransformConfig,
} from './types.js';

/**
 * Calculates the bounding box dimensions of a rotated rectangle.
 */
export function calculateRotatedDimensions(
  width: number,
  height: number,
  angleDegrees: number,
): ImageDimensions {
  const rad = (angleDegrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const rotatedWidth = Math.round(width * cos + height * sin);
  const rotatedHeight = Math.round(width * sin + height * cos);

  return {
    width: Math.max(1, rotatedWidth),
    height: Math.max(1, rotatedHeight),
  };
}

/**
 * Computes the default crop rectangle for an image given an aspect ratio preset.
 */
export function calculateAspectCropRect(
  imageWidth: number,
  imageHeight: number,
  preset: AspectRatioPreset,
): CropRect {
  if (preset === 'freeform') {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  let targetRatio = 1;
  switch (preset) {
    case '1:1':
    case 'circular':
      targetRatio = 1;
      break;
    case '16:9':
      targetRatio = 16 / 9;
      break;
    case '9:16':
      targetRatio = 9 / 16;
      break;
    case '4:5':
      targetRatio = 4 / 5;
      break;
    case '4:3':
      targetRatio = 4 / 3;
      break;
  }

  const currentRatio = imageWidth / imageHeight;
  let cropW = imageWidth;
  let cropH = imageHeight;

  if (currentRatio > targetRatio) {
    // Current image is wider than target aspect ratio -> crop width
    cropW = Math.round(imageHeight * targetRatio);
  } else {
    // Current image is taller than target aspect ratio -> crop height
    cropH = Math.round(imageWidth / targetRatio);
  }

  cropW = Math.min(imageWidth, Math.max(1, cropW));
  cropH = Math.min(imageHeight, Math.max(1, cropH));

  const cropX = Math.round((imageWidth - cropW) / 2);
  const cropY = Math.round((imageHeight - cropH) / 2);

  return {
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH,
  };
}

/**
 * Clamps crop coordinates so they remain strictly within the image boundaries.
 */
export function clampCropRect(crop: CropRect, bounds: ImageDimensions): CropRect {
  const x = Math.max(0, Math.min(crop.x, bounds.width - 1));
  const y = Math.max(0, Math.min(crop.y, bounds.height - 1));
  const width = Math.max(1, Math.min(crop.width, bounds.width - x));
  const height = Math.max(1, Math.min(crop.height, bounds.height - y));

  return { x, y, width, height };
}

/**
 * Applies geometric transformations (rotation, free rotate angle, flipping) to a canvas context.
 */
export function applyGeometricTransform(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  transform: ImageTransformConfig,
): void {
  ctx.save();

  // Move origin to center of destination canvas
  ctx.translate(targetWidth / 2, targetHeight / 2);

  // Apply free rotation
  if (transform.rotate !== 0) {
    ctx.rotate((transform.rotate * Math.PI) / 180);
  }

  // Apply flip
  const scaleX = transform.flipHorizontal ? -1 : 1;
  const scaleY = transform.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Draw centered
  ctx.translate(-sourceWidth / 2, -sourceHeight / 2);
}
