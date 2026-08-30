import { describe, it, expect } from 'vitest';
import {
  calculateRotatedDimensions,
  calculateAspectCropRect,
  clampCropRect,
} from '../transform.js';
import { wrapText, getTextXPosition, calculateBannerHeight } from '../meme.js';
import { buildCssFilterString } from '../filter.js';
import {
  getMimeTypeForFormat,
  getFileExtensionForFormat,
  getOutputFileName,
  getSmartCompressionQuality,
} from '../compress.js';
import { quantizeImageData } from '../quantize.js';
import type { MemeTextConfig, ImageFilterConfig } from '../types.js';

describe('Image Transform Engine', () => {
  it('calculates rotated dimensions for 0, 90, 180, and 45 degrees', () => {
    const dims0 = calculateRotatedDimensions(800, 600, 0);
    expect(dims0).toEqual({ width: 800, height: 600 });

    const dims90 = calculateRotatedDimensions(800, 600, 90);
    expect(dims90).toEqual({ width: 600, height: 800 });

    const dims180 = calculateRotatedDimensions(800, 600, 180);
    expect(dims180).toEqual({ width: 800, height: 600 });

    const dims45 = calculateRotatedDimensions(100, 100, 45);
    expect(dims45.width).toBeGreaterThan(140);
    expect(dims45.height).toBeGreaterThan(140);
  });

  it('calculates aspect ratio crop rectangles accurately', () => {
    // 1920x1080 -> 1:1 square crop should be centered 1080x1080
    const crop1to1 = calculateAspectCropRect(1920, 1080, '1:1');
    expect(crop1to1.width).toBe(1080);
    expect(crop1to1.height).toBe(1080);
    expect(crop1to1.x).toBe((1920 - 1080) / 2);
    expect(crop1to1.y).toBe(0);

    // 1000x1000 -> 16:9 crop
    const crop16to9 = calculateAspectCropRect(1000, 1000, '16:9');
    expect(crop16to9.width).toBe(1000);
    expect(crop16to9.height).toBe(Math.round(1000 / (16 / 9)));
    expect(crop16to9.x).toBe(0);

    // Freeform returns full bounds
    const cropFree = calculateAspectCropRect(800, 600, 'freeform');
    expect(cropFree).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });

  it('clamps crop rectangles within boundaries', () => {
    const clamped = clampCropRect(
      { x: -50, y: -20, width: 2000, height: 1500 },
      { width: 1000, height: 800 },
    );
    expect(clamped.x).toBe(0);
    expect(clamped.y).toBe(0);
    expect(clamped.width).toBe(1000);
    expect(clamped.height).toBe(800);
  });
});

describe('Meme Generator Engine', () => {
  it('calculates text X position based on alignment', () => {
    const leftX = getTextXPosition('left', 20, 400, 100);
    expect(leftX).toBe(20);

    const centerX = getTextXPosition('center', 20, 400, 100);
    expect(centerX).toBe(20 + (400 - 100) / 2); // 170

    const rightX = getTextXPosition('right', 20, 400, 100);
    expect(rightX).toBe(20 + 400 - 100); // 320
  });

  it('wraps text correctly across lines', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as unknown as CanvasRenderingContext2D;

    const lines = wrapText(mockCtx, 'Short text', 200);
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('Short text');

    const emptyLines = wrapText(mockCtx, '', 200);
    expect(emptyLines.length).toBe(0);
  });

  it('calculates banner height based on text content and font size', () => {
    // Mock canvas context
    const mockCtx = {
      font: '',
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as unknown as CanvasRenderingContext2D;

    const config: MemeTextConfig = {
      topText: '',
      bottomText: '',
      bannerText: 'Hello World Meme',
      style: 'caption-banner',
      align: 'left',
      fontFamily: 'Inter',
      fontSize: 24,
      uppercase: false,
      textColor: '#ffffff',
      outlineColor: '#000000',
      outlineWidth: 2,
      bannerBgColor: '#ffffff',
      bannerTextColor: '#000000',
    };

    const height = calculateBannerHeight(mockCtx, config, 800);
    expect(height).toBeGreaterThan(0);
  });
});

describe('Image Filter Engine', () => {
  it('builds CSS filter strings for adjustments and presets', () => {
    const emptyConfig: ImageFilterConfig = {
      preset: 'none',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpen: 0,
    };
    expect(buildCssFilterString(emptyConfig)).toBe('none');

    const adjustedConfig: ImageFilterConfig = {
      preset: 'none',
      brightness: 20,
      contrast: -10,
      saturation: 30,
      blur: 4,
      sharpen: 0,
    };
    const css = buildCssFilterString(adjustedConfig);
    expect(css).toContain('brightness(120%)');
    expect(css).toContain('contrast(90%)');
    expect(css).toContain('saturate(130%)');
    expect(css).toContain('blur(4px)');

    const sepiaConfig: ImageFilterConfig = {
      ...emptyConfig,
      preset: 'sepia',
    };
    expect(buildCssFilterString(sepiaConfig)).toContain('sepia(80%)');
  });
});

describe('Compression Helpers', () => {
  it('resolves correct MIME types and extensions', () => {
    expect(getMimeTypeForFormat('webp')).toBe('image/webp');
    expect(getMimeTypeForFormat('jpeg')).toBe('image/jpeg');
    expect(getMimeTypeForFormat('png')).toBe('image/png');
    expect(getMimeTypeForFormat('avif')).toBe('image/avif');

    expect(getFileExtensionForFormat('webp')).toBe('.webp');
    expect(getFileExtensionForFormat('jpeg')).toBe('.jpg');
    expect(getFileExtensionForFormat('png')).toBe('.png');
  });

  it('generates proper output filenames', () => {
    expect(getOutputFileName('my-photo.png', 'webp')).toBe('my-photo_compressed.webp');
    expect(getOutputFileName('vacation.jpg', 'avif')).toBe('vacation_compressed.avif');
  });

  it('provides smart compression quality defaults', () => {
    expect(getSmartCompressionQuality('webp')).toBe(82);
    expect(getSmartCompressionQuality('jpeg')).toBe(80);
  });
});

describe('Color Quantization', () => {
  it('quantizes image data within bounds', () => {
    const width = 2;
    const height = 2;
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // Red
      0, 255, 0, 255, // Green
      0, 0, 255, 255, // Blue
      128, 128, 128, 255, // Gray
    ]);

    const imgData = {
      width,
      height,
      data,
      colorSpace: 'srgb' as PredefinedColorSpace,
    } as ImageData;

    const result = quantizeImageData(imgData, 64, false);
    expect(result.data.length).toBe(16);
    expect(result.data[0]).toBeDefined();
  });
});
