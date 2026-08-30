import { describe, it, expect } from 'vitest';
import {
  MOCK_PNG_1X1_BYTES,
  MOCK_JPEG_1X1_BYTES,
  createMockImageData,
  createMockCanvasContext,
  HASH_TEST_VECTORS,
  UUID_V4_REGEX,
  UUID_V7_REGEX,
  SAMPLE_YOUTUBE_LINKS,
  SAMPLE_X_TWITTER_LINKS,
  TRACKING_PARAM_SAMPLES,
  INVALID_OR_MALICIOUS_LINKS,
  MOCK_FFMPEG_LOGS,
  MOCK_YTDLP_LOGS,
} from './fixtures/index.js';
import { isValidYouTubeUrl, extractYouTubeVideoId, parseYtDlpProgress } from '../src/youtube.js';
import { parseFfmpegProgress } from '../src/media.js';
import { generateUuidV4, generateUuidV7, validateUuid } from '../src/uuid.js';
import { hashText } from '../src/hash.js';

describe('Shared Workspace Test Fixtures & Regressions Suite', () => {
  describe('Media & Canvas Fixtures', () => {
    it('provides valid binary headers for PNG and JPEG fixtures', () => {
      // PNG magic number: 0x89, 'P', 'N', 'G'
      expect(MOCK_PNG_1X1_BYTES[0]).toBe(0x89);
      expect(MOCK_PNG_1X1_BYTES[1]).toBe(0x50);
      expect(MOCK_PNG_1X1_BYTES[2]).toBe(0x4e);
      expect(MOCK_PNG_1X1_BYTES[3]).toBe(0x47);

      // JPEG magic number: 0xFF, 0xD8
      expect(MOCK_JPEG_1X1_BYTES[0]).toBe(0xff);
      expect(MOCK_JPEG_1X1_BYTES[1]).toBe(0xd8);
    });

    it('generates predictable ImageData structures', () => {
      const img = createMockImageData(4, 4, [0, 255, 0, 255]);
      expect(img.width).toBe(4);
      expect(img.height).toBe(4);
      expect(img.data.length).toBe(4 * 4 * 4); // 64 bytes
      expect(img.data[0]).toBe(0);
      expect(img.data[1]).toBe(255);
      expect(img.data[2]).toBe(0);
      expect(img.data[3]).toBe(255);
    });

    it('provides a functional mock canvas 2D context', () => {
      const ctx = createMockCanvasContext({ charWidth: 8 });
      expect(ctx.measureText('hello').width).toBe(40);
      const testImg = ctx.getImageData(0, 0, 2, 2);
      expect(testImg.width).toBe(2);
      expect(testImg.height).toBe(2);
    });
  });

  describe('Crypto & UUID Vector Fixtures', () => {
    it('validates RFC MD5 test vectors against core hash engine', async () => {
      expect(await hashText(HASH_TEST_VECTORS.empty.input, 'MD5')).toBe(
        HASH_TEST_VECTORS.empty.expectedMd5,
      );
      expect(await hashText(HASH_TEST_VECTORS.abc.input, 'MD5')).toBe(
        HASH_TEST_VECTORS.abc.expectedMd5,
      );
      expect(await hashText(HASH_TEST_VECTORS.quickBrownFox.input, 'MD5')).toBe(
        HASH_TEST_VECTORS.quickBrownFox.expectedMd5,
      );
    });

    it('validates RFC SHA-256 test vectors against core hash engine', async () => {
      expect(await hashText(HASH_TEST_VECTORS.empty.input, 'SHA-256')).toBe(
        HASH_TEST_VECTORS.empty.expectedSha256,
      );
      expect(await hashText(HASH_TEST_VECTORS.abc.input, 'SHA-256')).toBe(
        HASH_TEST_VECTORS.abc.expectedSha256,
      );
      expect(await hashText(HASH_TEST_VECTORS.quickBrownFox.input, 'SHA-256')).toBe(
        HASH_TEST_VECTORS.quickBrownFox.expectedSha256,
      );
    });

    it('validates UUID generation against regex fixtures', () => {
      const v4 = generateUuidV4();
      expect(v4).toMatch(UUID_V4_REGEX);
      expect(validateUuid(v4).isValid).toBe(true);
      expect(validateUuid(v4).version).toBe(4);

      const v7 = generateUuidV7();
      expect(v7).toMatch(UUID_V7_REGEX);
      expect(validateUuid(v7).isValid).toBe(true);
      expect(validateUuid(v7).version).toBe(7);
    });
  });

  describe('Links & Social URL Fixtures', () => {
    it('validates all sample YouTube URLs without regression', () => {
      Object.entries(SAMPLE_YOUTUBE_LINKS).forEach(([key, url]) => {
        expect(isValidYouTubeUrl(url), `Failed for ${key}: ${url}`).toBe(true);
        const id = extractYouTubeVideoId(url);
        expect(id).toBeDefined();
        expect(id?.length).toBe(11);
      });
    });

    it('contains expected status patterns for sample X/Twitter links', () => {
      Object.entries(SAMPLE_X_TWITTER_LINKS).forEach(([key, url]) => {
        expect(url, `Failed for ${key}: ${url}`).toContain('status/');
      });
    });

    it('rejects all malicious or invalid links', () => {
      INVALID_OR_MALICIOUS_LINKS.forEach(url => {
        expect(isValidYouTubeUrl(url), `Should reject ${url}`).toBe(false);
      });
    });

    it('detects tracking parameter tokens', () => {
      expect(TRACKING_PARAM_SAMPLES.length).toBeGreaterThan(5);
      TRACKING_PARAM_SAMPLES.forEach(param => {
        expect(param).toContain('=');
      });
    });
  });

  describe('FFmpeg Log Parsing Fixtures', () => {
    it('correctly calculates progress percentages across all log stages', () => {
      const durationTotal = 60; // 60 seconds total

      const p25 = parseFfmpegProgress(MOCK_FFMPEG_LOGS.progress25, durationTotal);
      expect(p25?.percent).toBe(25);

      const p50 = parseFfmpegProgress(MOCK_FFMPEG_LOGS.progress50, durationTotal);
      expect(p50?.percent).toBe(50);

      const p75 = parseFfmpegProgress(MOCK_FFMPEG_LOGS.progress75, durationTotal);
      expect(p75?.percent).toBe(75);

      const p100 = parseFfmpegProgress(MOCK_FFMPEG_LOGS.progress100, durationTotal);
      expect(p100?.percent).toBe(100);
    });

    it('correctly parses yt-dlp downloading and merging logs', () => {
      const download = parseYtDlpProgress(MOCK_YTDLP_LOGS.downloadProgress);
      expect(download?.stage).toBe('downloading');
      expect(download?.percent).toBe(45.2);

      const merge = parseYtDlpProgress(MOCK_YTDLP_LOGS.ffmpegMerge);
      expect(merge?.stage).toBe('merging');
      expect(merge?.percent).toBe(96);
    });
  });
});
