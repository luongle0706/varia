import { describe, it, expect } from 'vitest';
import {
  buildFfmpegGifArgs,
  validateGifOptions,
  calculateEstimatedGifSize,
  type GifConversionOptions,
} from '../src/gif';

describe('GIF Utilities', () => {
  describe('validateGifOptions', () => {
    it('should pass for valid options', () => {
      const error = validateGifOptions(
        {
          trimStart: 1.0,
          trimEnd: 4.5,
          fps: 15,
          scalePreset: '480p',
        },
        { duration: 10, width: 1280, height: 720 },
      );
      expect(error).toBeNull();
    });

    it('should return user_validation error if trimStart >= trimEnd', () => {
      const error = validateGifOptions({
        trimStart: 5.0,
        trimEnd: 3.0,
      });

      expect(error).not.toBeNull();
      expect(error?.category).toBe('user_validation');
      expect(error?.field).toBe('trim');
      expect(error?.actionType).toBe('clamp_trim');
    });

    it('should return user_validation error if crop is out of video bounds', () => {
      const error = validateGifOptions(
        {
          crop: { x: 500, y: 400, width: 1000, height: 500 },
        },
        { width: 1280, height: 720 },
      );

      expect(error).not.toBeNull();
      expect(error?.category).toBe('user_validation');
      expect(error?.field).toBe('crop');
      expect(error?.actionType).toBe('reset_crop');
    });

    it('should return memory_limit error if duration is excessively long', () => {
      const error = validateGifOptions({
        trimStart: 0,
        trimEnd: 75,
      });

      expect(error).not.toBeNull();
      expect(error?.category).toBe('memory_limit');
    });
  });

  describe('buildFfmpegGifArgs', () => {
    it('should generate basic two-pass split filtergraph with default palettegen/paletteuse', () => {
      const args = buildFfmpegGifArgs('input.mp4', 'output.gif', {
        fps: 15,
        scalePreset: '480p',
      });

      expect(args).toContain('-i');
      expect(args).toContain('input.mp4');
      expect(args).toContain('-filter_complex');
      expect(args).toContain('-loop');
      expect(args).toContain('0');
      expect(args).toContain('-an');
      expect(args).toContain('output.gif');

      const filterComplex = args[args.indexOf('-filter_complex') + 1];
      expect(filterComplex).toContain('fps=15');
      expect(filterComplex).toContain('scale=480:-2:flags=lanczos');
      expect(filterComplex).toContain('split [a][b]');
      expect(filterComplex).toContain('palettegen=max_colors=128:stats_mode=full');
      expect(filterComplex).toContain('paletteuse=dither=bayer:bayer_scale=2');
    });

    it('should include crop, rotation, reverse, and speed filters', () => {
      const options: GifConversionOptions = {
        trimStart: 2.0,
        trimEnd: 6.0,
        fps: 20,
        speed: 1.5,
        reverse: true,
        rotate: 90,
        flipHorizontal: true,
        crop: { x: 50, y: 30, width: 300, height: 300 },
        dither: 'floyd_steinberg',
        maxColors: 128,
        loopCount: -1, // Play once
      };

      const args = buildFfmpegGifArgs('clip.mkv', 'animated.gif', options);

      expect(args).toContain('-ss');
      expect(args).toContain('2');
      expect(args).toContain('-t');
      expect(args).toContain('4');
      expect(args).toContain('-loop');
      expect(args).toContain('-1');

      const filterComplex = args[args.indexOf('-filter_complex') + 1];
      expect(filterComplex).toContain('setpts=0.6667*PTS');
      expect(filterComplex).toContain('reverse');
      expect(filterComplex).toContain('crop=300:300:50:30');
      expect(filterComplex).toContain('transpose=1');
      expect(filterComplex).toContain('hflip');
      expect(filterComplex).toContain('fps=20');
      expect(filterComplex).toContain('palettegen=max_colors=128:stats_mode=full');
      expect(filterComplex).toContain('paletteuse=dither=floyd_steinberg');
    });
  });

  describe('calculateEstimatedGifSize', () => {
    it('should estimate byte size and frame count correctly', () => {
      const result = calculateEstimatedGifSize(
        {
          fps: 15,
          scalePreset: '360p',
          speed: 1.0,
        },
        4.0,
        640,
        360,
      );

      expect(result.frameCount).toBe(60); // 4s * 15fps
      expect(result.estimatedBytes).toBeGreaterThan(10000);
    });
  });
});
