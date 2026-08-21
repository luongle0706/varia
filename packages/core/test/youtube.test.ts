import { describe, it, expect } from 'vitest';
import {
  isValidYouTubeUrl,
  extractYouTubeVideoId,
  filterResolutionsUpTo,
  formatVideoDuration,
  parseYtDlpProgress,
  YOUTUBE_VIDEO_CODECS,
  YOUTUBE_AUDIO_BITRATES,
} from '../src/youtube';

describe('YouTube Core Utilities', () => {
  describe('isValidYouTubeUrl & extractYouTubeVideoId', () => {
    it('should accurately validate standard desktop YouTube watch URLs', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(isValidYouTubeUrl(url)).toBe(true);
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should accurately validate short URLs (youtu.be)', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?si=abcdef12345';
      expect(isValidYouTubeUrl(url)).toBe(true);
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should validate YouTube Shorts URLs', () => {
      const url = 'https://www.youtube.com/shorts/3jz1D8S7K10';
      expect(isValidYouTubeUrl(url)).toBe(true);
      expect(extractYouTubeVideoId(url)).toBe('3jz1D8S7K10');
    });

    it('should validate YouTube Music & mobile URLs', () => {
      expect(isValidYouTubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('should reject invalid, malicious, or non-YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isValidYouTubeUrl('https://google.com')).toBe(false);
      expect(isValidYouTubeUrl('file:///etc/passwd')).toBe(false);
      expect(isValidYouTubeUrl('http://localhost:3000')).toBe(false);
      expect(isValidYouTubeUrl('')).toBe(false);
      expect(extractYouTubeVideoId('invalid-url')).toBe(null);
    });
  });

  describe('filterResolutionsUpTo', () => {
    it('should generate 144p to 1080p when original video max is 1080p', () => {
      const resolutions = filterResolutionsUpTo(1080);
      expect(resolutions.length).toBe(6); // 1080p, 720p, 480p, 360p, 240p, 144p
      expect(resolutions[0]?.quality).toBe('1080p');
      expect(resolutions[0]?.isOriginalMax).toBe(true);
      expect(resolutions[resolutions.length - 1]?.quality).toBe('144p');
    });

    it('should generate 144p to 720p when original video max is 720p', () => {
      const resolutions = filterResolutionsUpTo(720);
      expect(resolutions.length).toBe(5); // 720p, 480p, 360p, 240p, 144p
      expect(resolutions[0]?.quality).toBe('720p');
      expect(resolutions[0]?.isOriginalMax).toBe(true);
    });

    it('should include 4K UHD when max is 2160p', () => {
      const resolutions = filterResolutionsUpTo(2160);
      expect(resolutions[0]?.quality).toBe('2160p');
      expect(resolutions.length).toBe(8);
    });

    it('should handle small resolution videos (< 240p)', () => {
      const resolutions = filterResolutionsUpTo(144);
      expect(resolutions.length).toBe(1);
      expect(resolutions[0]?.quality).toBe('144p');
    });
  });

  describe('formatVideoDuration', () => {
    it('should format seconds into MM:SS and HH:MM:SS', () => {
      expect(formatVideoDuration(65)).toBe('1:05');
      expect(formatVideoDuration(212)).toBe('3:32');
      expect(formatVideoDuration(3665)).toBe('1:01:05');
      expect(formatVideoDuration(0)).toBe('0:00');
    });
  });

  describe('parseYtDlpProgress', () => {
    it('should correctly parse standard yt-dlp downloading progress lines', () => {
      const line = '[download]  45.2% of ~12.34MiB at 10.50MiB/s ETA 00:03';
      const progress = parseYtDlpProgress(line);
      expect(progress).not.toBeNull();
      expect(progress?.stage).toBe('downloading');
      expect(progress?.percent).toBe(45.2);
      expect(progress?.totalSize).toBe('12.34MiB');
      expect(progress?.speed).toBe('10.50MiB/s');
      expect(progress?.eta).toBe('00:03');
    });

    it('should parse FFmpeg merging indicator', () => {
      const line = '[Merger] Merging formats into "video.mp4"';
      const progress = parseYtDlpProgress(line);
      expect(progress).not.toBeNull();
      expect(progress?.stage).toBe('merging');
      expect(progress?.percent).toBe(96);
    });

    it('should return null for unrelated output lines', () => {
      expect(parseYtDlpProgress('[youtube] Extracting URL: ...')).toBeNull();
      expect(parseYtDlpProgress('')).toBeNull();
    });
  });

  describe('Codec and Bitrate Tables', () => {
    it('should have H.264 as primary video codec and 320k as top audio bitrate', () => {
      expect(YOUTUBE_VIDEO_CODECS.h264.name).toContain('H.264');
      expect(YOUTUBE_AUDIO_BITRATES['320k'].kbps).toBe(320);
    });
  });
});
