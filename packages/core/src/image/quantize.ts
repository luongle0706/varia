/**
 * Color Quantization & Floyd-Steinberg Dithering Engine
 * Reduces the color palette of an image to 16-256 colors for dramatic file size reduction.
 */

/**
 * Quantizes image colors using uniform color space subdivision with Floyd-Steinberg error diffusion.
 */
export function quantizeImageData(
  imageData: ImageData,
  maxColors: number = 256,
  dither: boolean = true,
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Determine color step levels per channel (e.g. 256 colors -> ~6x6x6 or 8x8x4)
  const levels = Math.max(2, Math.round(Math.cbrt(maxColors)));
  const step = 255 / (levels - 1);

  const quantizeChannel = (val: number) => {
    return Math.round(Math.round(val / step) * step);
  };

  if (!dither) {
    // Simple nearest color quantization
    for (let i = 0; i < data.length; i += 4) {
      data[i] = quantizeChannel(data[i]!); // R
      data[i + 1] = quantizeChannel(data[i + 1]!); // G
      data[i + 2] = quantizeChannel(data[i + 2]!); // B
    }
    return imageData;
  }

  // Floyd-Steinberg Error Diffusion Dithering
  // Error distribution: right (7/16), down-left (3/16), down (5/16), down-right (1/16)
  const errorBuffer = new Float32Array(width * height * 3);

  // Initialize error buffer with original RGB values
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    errorBuffer[j] = data[i]!;
    errorBuffer[j + 1] = data[i + 1]!;
    errorBuffer[j + 2] = data[i + 2]!;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const dataIdx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const oldVal = Math.max(0, Math.min(255, errorBuffer[idx + c]!));
        const newVal = quantizeChannel(oldVal);
        const err = oldVal - newVal;

        data[dataIdx + c] = newVal;

        // Distribute error to neighboring pixels
        if (x + 1 < width) {
          errorBuffer[(y * width + (x + 1)) * 3 + c] =
            (errorBuffer[(y * width + (x + 1)) * 3 + c] ?? 0) + (err * 7) / 16;
        }
        if (y + 1 < height) {
          if (x > 0) {
            errorBuffer[((y + 1) * width + (x - 1)) * 3 + c] =
              (errorBuffer[((y + 1) * width + (x - 1)) * 3 + c] ?? 0) + (err * 3) / 16;
          }
          errorBuffer[((y + 1) * width + x) * 3 + c] =
            (errorBuffer[((y + 1) * width + x) * 3 + c] ?? 0) + (err * 5) / 16;
          if (x + 1 < width) {
            errorBuffer[((y + 1) * width + (x + 1)) * 3 + c] =
              (errorBuffer[((y + 1) * width + (x + 1)) * 3 + c] ?? 0) + (err * 1) / 16;
          }
        }
      }
    }
  }

  return imageData;
}
