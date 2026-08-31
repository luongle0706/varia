import { describe, it, expect } from 'vitest';
import {
  parseSocialLink,
  parseYouTubeLink,
  parseXTwitterLink,
  parseInstagramLink,
  parseFacebookLink,
  parseTikTokLink,
  sanitizeSocialUrl,
} from '../src/socialLinks.js';
import {
  SAMPLE_YOUTUBE_LINKS,
  SAMPLE_X_TWITTER_LINKS,
  SAMPLE_INSTAGRAM_LINKS,
  SAMPLE_TIKTOK_LINKS,
  SAMPLE_FACEBOOK_LINKS,
  INVALID_OR_MALICIOUS_LINKS,
} from './fixtures/index.js';

describe('Social Links Engine (@varia/core)', () => {
  describe('sanitizeSocialUrl', () => {
    it('strips tracking query parameters while preserving core path', () => {
      const dirty =
        'https://x.com/elonmusk/status/1234567890?s=20&t=abcdef&utm_source=twitter&fbclid=IwAR123';
      const clean = sanitizeSocialUrl(dirty);
      expect(clean).toBe('https://x.com/elonmusk/status/1234567890');
      expect(clean).not.toContain('utm_source');
      expect(clean).not.toContain('fbclid');
    });

    it('preserves clean URLs intact', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(sanitizeSocialUrl(url)).toBe(url);
    });
  });

  describe('parseYouTubeLink', () => {
    it('extracts ID and timestamp from standard and short YouTube links', () => {
      const res = parseYouTubeLink(SAMPLE_YOUTUBE_LINKS.shortlinkTimestamped!);
      expect(res).not.toBeNull();
      expect(res?.platform).toBe('youtube');
      expect(res?.id).toBe('dQw4w9WgXcQ');
      expect(res?.timeParam).toBe('120');
      expect(res?.isShortFormVideo).toBe(false);
    });

    it('detects YouTube Shorts correctly', () => {
      const res = parseYouTubeLink(SAMPLE_YOUTUBE_LINKS.shorts!);
      expect(res).not.toBeNull();
      expect(res?.id).toBe('3jz1D8S7K10');
      expect(res?.isShortFormVideo).toBe(true);
    });
  });

  describe('parseXTwitterLink', () => {
    it('extracts tweet ID and author handle from x.com and twitter.com', () => {
      const resX = parseXTwitterLink(SAMPLE_X_TWITTER_LINKS.standardTweet!);
      expect(resX).not.toBeNull();
      expect(resX?.platform).toBe('x-twitter');
      expect(resX?.id).toBe('20');
      expect(resX?.authorHandle).toBe('jack');

      const resTwitter = parseXTwitterLink(SAMPLE_X_TWITTER_LINKS.legacyTwitter!);
      expect(resTwitter).not.toBeNull();
      expect(resTwitter?.id).toBe('1780000000000000000');
      expect(resTwitter?.authorHandle).toBe('OpenAI');
    });
  });

  describe('parseInstagramLink', () => {
    it('extracts post and reel IDs', () => {
      const resPost = parseInstagramLink(SAMPLE_INSTAGRAM_LINKS.post!);
      expect(resPost).not.toBeNull();
      expect(resPost?.id).toBe('C-abc123xyz');
      expect(resPost?.isShortFormVideo).toBe(false);

      const resReel = parseInstagramLink(SAMPLE_INSTAGRAM_LINKS.reel!);
      expect(resReel).not.toBeNull();
      expect(resReel?.id).toBe('C-xyz987abc');
      expect(resReel?.isShortFormVideo).toBe(true);
    });
  });

  describe('parseFacebookLink', () => {
    it('extracts Facebook Reel and Watch IDs', () => {
      const resReel = parseFacebookLink(SAMPLE_FACEBOOK_LINKS.reel!);
      expect(resReel).not.toBeNull();
      expect(resReel?.platform).toBe('facebook');
      expect(resReel?.id).toBe('1234567890123456');
      expect(resReel?.isShortFormVideo).toBe(true);

      const resWatch = parseFacebookLink(SAMPLE_FACEBOOK_LINKS.watch!);
      expect(resWatch).not.toBeNull();
      expect(resWatch?.id).toBe('987654321098765');
      expect(resWatch?.isShortFormVideo).toBe(false);
    });

    it('extracts Facebook mobile share Reel and Post links with mibextid tracking', () => {
      const shareReelUrl = 'https://www.facebook.com/share/r/198aiTxWHC/?mibextid=wwXIfr';
      const resShare = parseFacebookLink(shareReelUrl);
      expect(resShare).not.toBeNull();
      expect(resShare?.platform).toBe('facebook');
      expect(resShare?.id).toBe('198aiTxWHC');
      expect(resShare?.isShortFormVideo).toBe(true);
      expect(resShare?.cleanUrl).not.toContain('mibextid');

      const fbWatchUrl = 'https://fb.watch/abcdef123/';
      const resFbWatch = parseFacebookLink(fbWatchUrl);
      expect(resFbWatch).not.toBeNull();
      expect(resFbWatch?.id).toBe('abcdef123');
    });
  });

  describe('parseTikTokLink', () => {
    it('extracts TikTok video ID and handle', () => {
      const res = parseTikTokLink(SAMPLE_TIKTOK_LINKS.standardVideo!);
      expect(res).not.toBeNull();
      expect(res?.platform).toBe('tiktok');
      expect(res?.id).toBe('7123456789012345678');
      expect(res?.authorHandle).toBe('user');
      expect(res?.isShortFormVideo).toBe(true);

      const resShort = parseTikTokLink(SAMPLE_TIKTOK_LINKS.shortlink!);
      expect(resShort).not.toBeNull();
      expect(resShort?.id).toBe('ZM8abc123');
    });
  });

  describe('parseSocialLink (Master Dispatcher)', () => {
    it('correctly identifies and routes each platform', () => {
      expect(parseSocialLink(SAMPLE_YOUTUBE_LINKS.shorts!)?.platform).toBe('youtube');
      expect(parseSocialLink(SAMPLE_X_TWITTER_LINKS.standardTweet!)?.platform).toBe('x-twitter');
      expect(parseSocialLink(SAMPLE_INSTAGRAM_LINKS.reel!)?.platform).toBe('instagram');
      expect(parseSocialLink(SAMPLE_FACEBOOK_LINKS.reel!)?.platform).toBe('facebook');
      expect(parseSocialLink(SAMPLE_TIKTOK_LINKS.standardVideo!)?.platform).toBe('tiktok');
    });

    it('safely returns null for invalid or malicious links', () => {
      INVALID_OR_MALICIOUS_LINKS.forEach(url => {
        expect(parseSocialLink(url)).toBeNull();
      });
    });
  });
});
