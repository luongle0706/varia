/**
 * Image Adjustments & Creative Filters Engine
 */

import type { ImageFilterConfig } from './types.js';

/**
 * Builds CSS filter string from filter configuration for hardware-accelerated canvas rendering.
 */
export function buildCssFilterString(config: ImageFilterConfig): string {
  const filters: string[] = [];

  // Brightness: config.brightness is -100 to +100 -> css 0% to 200% (default 100%)
  if (config.brightness !== 0) {
    const b = Math.max(0, 100 + config.brightness);
    filters.push(`brightness(${b}%)`);
  }

  // Contrast: config.contrast is -100 to +100 -> css 0% to 200% (default 100%)
  if (config.contrast !== 0) {
    const c = Math.max(0, 100 + config.contrast);
    filters.push(`contrast(${c}%)`);
  }

  // Saturation: config.saturation is -100 to +100 -> css 0% to 200% (default 100%)
  if (config.saturation !== 0) {
    const s = Math.max(0, 100 + config.saturation);
    filters.push(`saturate(${s}%)`);
  }

  // Blur: in pixels (0 to 20px)
  if (config.blur > 0) {
    filters.push(`blur(${config.blur}px)`);
  }

  // Apply Preset Filters
  switch (config.preset) {
    case 'grayscale':
      filters.push('grayscale(100%)');
      break;
    case 'sepia':
      filters.push('sepia(80%)');
      break;
    case 'vintage':
      filters.push('sepia(40%) contrast(115%) brightness(95%) saturate(120%)');
      break;
    case 'cyberpunk':
      filters.push('hue-rotate(280deg) saturate(180%) contrast(130%)');
      break;
    case 'high-contrast':
      filters.push('contrast(160%) saturate(110%)');
      break;
    case 'invert':
      filters.push('invert(100%)');
      break;
    case 'none':
    default:
      break;
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Applies a 3x3 sharpen convolution filter to an ImageData buffer for fine detail enhancement.
 */
export function applySharpenConvolution(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number, // 0 to 100
): void {
  if (intensity <= 0) return;

  const factor = (intensity / 100) * 0.8;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const copy = new Uint8ClampedArray(src);

  // Kernel: [0, -factor, 0, -factor, 1 + 4*factor, -factor, 0, -factor, 0]
  const centerWeight = 1 + 4 * factor;
  const edgeWeight = -factor;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        // Red, Green, Blue
        const top = copy[((y - 1) * width + x) * 4 + c]!;
        const bottom = copy[((y + 1) * width + x) * 4 + c]!;
        const left = copy[(y * width + (x - 1)) * 4 + c]!;
        const right = copy[(y * width + (x + 1)) * 4 + c]!;
        const center = copy[idx + c]!;

        const val =
          center * centerWeight +
          (top + bottom + left + right) * edgeWeight;

        src[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
