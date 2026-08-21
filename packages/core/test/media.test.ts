import { describe, it, expect } from 'vitest';
import {
  formatTimecode,
  buildFfmpegAudioArgs,
  parseFfmpegProgress,
  isMediaFileSupported,
  SUPPORTED_AUDIO_FORMATS,
} from '../src/media';

describe('Media Utilities', () => {
  describe('formatTimecode', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTimecode(0)).toBe('00:00');
      expect(formatTimecode(65)).toBe('01:05');
      expect(formatTimecode(599)).toBe('09:59');
    });

    it('should format hours to HH:MM:SS', () => {
      expect(formatTimecode(3665)).toBe('01:01:05');
    });

    it('should include milliseconds when requested', () => {
      expect(formatTimecode(65.432, true)).toBe('01:05.432');
    });
  });

  describe('isMediaFileSupported', () => {
    it('should identify supported video and audio files', () => {
      expect(isMediaFileSupported({ name: 'clip.mp4' })).toBe(true);
      expect(isMediaFileSupported({ name: 'movie.mkv' })).toBe(true);
      expect(isMediaFileSupported({ name: 'song.wav' })).toBe(true);
      expect(isMediaFileSupported({ name: 'song.flac' })).toBe(true);
      expect(isMediaFileSupported({ name: 'document.pdf' })).toBe(false);
    });
  });

  describe('buildFfmpegAudioArgs', () => {
    it('should build basic MP3 conversion args with 192k bitrate', () => {
      const args = buildFfmpegAudioArgs('input.mp4', 'output.mp3', {
        format: 'mp3',
        bitrate: '192k',
      });

      expect(args).toContain('-i');
      expect(args).toContain('input.mp4');
      expect(args).toContain('-vn');
      expect(args).toContain('-c:a');
      expect(args).toContain('libmp3lame');
      expect(args).toContain('-b:a');
      expect(args).toContain('192k');
      expect(args).toContain('output.mp3');
    });

    it('should include volume boost and fade in/out filters', () => {
      const args = buildFfmpegAudioArgs(
        'input.mov',
        'output.mp3',
        {
          format: 'mp3',
          volumeBoost: 1.5,
          fadeIn: 3,
          fadeOut: 2,
        },
        30,
      );

      const filterIdx = args.indexOf('-af');
      expect(filterIdx).toBeGreaterThan(-1);
      const filterStr = args[filterIdx + 1];
      expect(filterStr).toContain('volume=1.50');
      expect(filterStr).toContain('afade=t=in:ss=0:d=3.00');
      expect(filterStr).toContain('afade=t=out:st=28.00:d=2.00');
    });

    it('should include trim start and duration', () => {
      const args = buildFfmpegAudioArgs('input.mp4', 'output.wav', {
        format: 'wav',
        trimStart: 5,
        trimEnd: 15,
      });

      expect(args).toContain('-ss');
      expect(args).toContain('5');
      expect(args).toContain('-t');
      expect(args).toContain('10');
      expect(args).toContain('-c:a');
      expect(args).toContain('pcm_s16le');
    });

    it('should support FLAC and AAC formats', () => {
      const flacArgs = buildFfmpegAudioArgs('input.wav', 'output.flac', { format: 'flac' });
      expect(flacArgs).toContain('-c:a');
      expect(flacArgs).toContain('flac');

      const aacArgs = buildFfmpegAudioArgs('input.mp4', 'output.aac', {
        format: 'aac',
        bitrate: '256k',
      });
      expect(aacArgs).toContain('-c:a');
      expect(aacArgs).toContain('aac');
      expect(aacArgs).toContain('256k');
    });
  });

  describe('parseFfmpegProgress', () => {
    it('should extract progress percentage from FFmpeg log lines', () => {
      const log = 'size=   1024kB time=00:01:00.00 bitrate= 139.8kbits/s speed=5.4x';
      const progress = parseFfmpegProgress(log, 120);

      expect(progress).not.toBeNull();
      expect(progress?.timeSeconds).toBe(60);
      expect(progress?.percent).toBe(50);
    });
  });

  describe('SUPPORTED_AUDIO_FORMATS', () => {
    it('should declare all 5 target formats', () => {
      expect(Object.keys(SUPPORTED_AUDIO_FORMATS)).toEqual(['mp3', 'wav', 'aac', 'ogg', 'flac']);
    });
  });
});
