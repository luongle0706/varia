// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveYouTubeEmbed,
  resolveInstagramEmbed,
  resolveFacebookEmbed,
  resolveTikTokEmbed,
  resolveMediaEmbed,
} from '../src/features/messenger-embed/resolvers';
import { MediaCacheManager } from '../src/features/messenger-embed/cache/mediaCache';
import { createMediaEmbedCard } from '../src/features/messenger-embed/ui/cardRenderer';
import { scanAndInjectEmbeds } from '../src/features/messenger-embed/content/messengerInjector';
import { DEFAULT_MESSENGER_EMBED_CONFIG } from '../src/features/messenger-embed/defaults';
import { MediaEmbedPayload } from '../src/features/messenger-embed/types';

describe('Messenger Rich Media Embed Feature (apps/extension)', () => {
  describe('Resolvers Engine', () => {
    it('resolves YouTube Shorts to 9:16 iframe embed with thumbnail', () => {
      const url = 'https://www.youtube.com/shorts/3jz1D8S7K10';
      const embed = resolveYouTubeEmbed(url);

      expect(embed).not.toBeNull();
      expect(embed?.platform).toBe('youtube');
      expect(embed?.aspectRatio).toBe('9:16');
      expect(embed?.iframeSrc).toContain('3jz1D8S7K10');
      expect(embed?.thumbnailUrl).toContain('3jz1D8S7K10');
    });

    it('resolves standard YouTube video to 16:9 iframe embed with timestamp', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?t=45';
      const embed = resolveYouTubeEmbed(url);

      expect(embed).not.toBeNull();
      expect(embed?.aspectRatio).toBe('16:9');
      expect(embed?.iframeSrc).toContain('start=45');
    });

    it('resolves Instagram Reel to responsive embed or direct media', async () => {
      const url = 'https://www.instagram.com/reel/C-xyz987abc/';
      const embed = await resolveInstagramEmbed(url);

      expect(embed).not.toBeNull();
      expect(embed?.platform).toBe('instagram');
      expect(embed?.aspectRatio).toBe('9:16');
      if (embed?.mediaType === 'iframe') {
        expect(embed?.iframeSrc).toBe('https://www.instagram.com/reel/C-xyz987abc/embed');
      } else {
        expect(embed?.mediaType).toBe('video');
        expect(embed?.mediaUrl).toBeDefined();
      }
    });

    it('resolves Facebook Reel and mobile share link correctly', async () => {
      const url = 'https://www.facebook.com/reel/1234567890123456';
      const embed = await resolveFacebookEmbed(url);
      if (embed) {
        expect(embed.platform).toBe('facebook');
        expect(embed.aspectRatio).toBe('9:16');
      }

      // Test mobile share link
      const shareUrl = 'https://www.facebook.com/share/r/198aiTxWHC/?mibextid=wwXIfr';
      const embedShare = await resolveFacebookEmbed(shareUrl);
      if (embedShare) {
        expect(embedShare.platform).toBe('facebook');
        expect(embedShare.aspectRatio).toBe('9:16');
      }
    });

    it('resolves TikTok video to TikTok embed player', async () => {
      const url = 'https://www.tiktok.com/@user/video/7123456789012345678';
      const embed = await resolveTikTokEmbed(url);

      expect(embed).not.toBeNull();
      expect(embed?.platform).toBe('tiktok');
      expect(embed?.aspectRatio).toBe('9:16');
    });

    it('master resolveMediaEmbed respects disabled platform configs', async () => {
      const disabledYtConfig = {
        ...DEFAULT_MESSENGER_EMBED_CONFIG,
        enabledPlatforms: {
          ...DEFAULT_MESSENGER_EMBED_CONFIG.enabledPlatforms,
          youtube: false,
        },
      };

      const result = await resolveMediaEmbed(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        disabledYtConfig,
      );
      expect(result).toBeNull();
    });
  });

  describe('2-Tier Media Cache', () => {
    let cache: MediaCacheManager;

    beforeEach(() => {
      cache = new MediaCacheManager();
    });

    it('retrieves stored payload from in-memory cache instantly', async () => {
      const samplePayload: MediaEmbedPayload = {
        id: 'test-1',
        platform: 'youtube',
        originalUrl: 'https://youtu.be/abc',
        cleanUrl: 'https://youtu.be/abc',
        mediaType: 'iframe',
        aspectRatio: '16:9',
        timestampMs: Date.now(),
      };

      await cache.set('https://youtu.be/abc', samplePayload);
      const retrieved = await cache.get('https://youtu.be/abc');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-1');
    });

    it('evicts expired items beyond TTL', async () => {
      const expiredPayload: MediaEmbedPayload = {
        id: 'expired-1',
        platform: 'youtube',
        originalUrl: 'https://youtu.be/old',
        cleanUrl: 'https://youtu.be/old',
        mediaType: 'iframe',
        aspectRatio: '16:9',
        timestampMs: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago (TTL is 7 days)
      };

      await cache.set('https://youtu.be/old', expiredPayload);
      const retrieved = await cache.get('https://youtu.be/old');
      expect(retrieved).toBeNull();
    });

    it('clears all cached entries', async () => {
      await cache.set('https://youtu.be/1', {
        id: '1',
        platform: 'youtube',
        originalUrl: '1',
        cleanUrl: '1',
        mediaType: 'iframe',
        aspectRatio: '16:9',
        timestampMs: Date.now(),
      });
      expect(cache.getCacheSize()).toBe(1);

      await cache.clear();
      expect(cache.getCacheSize()).toBe(0);
    });
  });

  describe('Card Renderer Component', () => {
    it('creates a compliant DOM card structure for video media', () => {
      const payload: MediaEmbedPayload = {
        id: 'x-12345',
        platform: 'x-twitter',
        authorName: 'Elon Musk',
        authorHandle: '@elonmusk',
        title: 'Meme video clip',
        description: 'Check out this funny clip from last night stream #gaming',
        originalUrl: 'https://x.com/elonmusk/status/12345',
        cleanUrl: 'https://x.com/elonmusk/status/12345',
        mediaType: 'video',
        mediaUrl: 'https://video.twimg.com/clip.mp4',
        thumbnailUrl: 'https://pbs.twimg.com/thumb.jpg',
        aspectRatio: '16:9',
        timestampMs: Date.now(),
      };

      const card = createMediaEmbedCard(payload, DEFAULT_MESSENGER_EMBED_CONFIG);
      expect(card).toBeDefined();
      expect(card.classList.contains('varia-embed-container')).toBe(true);
      expect(card.getAttribute('data-varia-embed-id')).toBe('x-12345');

      const desc = card.querySelector('.varia-embed-description');
      expect(desc).not.toBeNull();
      expect(desc?.textContent).toBe('Check out this funny clip from last night stream #gaming');

      const replayBtn = card.querySelector<HTMLButtonElement>('button[aria-label="Replay media"]');
      expect(replayBtn).not.toBeNull();
      expect(replayBtn?.textContent).toBe('↺');

      const video = card.querySelector('video');
      expect(video).not.toBeNull();
      expect(video?.src).toBe('https://video.twimg.com/clip.mp4');
      expect(video?.muted).toBe(true); // Default muted UX
      expect(video?.loop).toBe(true); // Infinite replay loop
    });

    it('toggles collapse and expand states on button click', () => {
      const payload: MediaEmbedPayload = {
        id: 'ig-123',
        platform: 'instagram',
        originalUrl: 'https://instagram.com/reel/123',
        cleanUrl: 'https://instagram.com/reel/123',
        mediaType: 'iframe',
        iframeSrc: 'https://instagram.com/reel/123/embed',
        aspectRatio: '9:16',
        timestampMs: Date.now(),
      };

      const card = createMediaEmbedCard(payload, DEFAULT_MESSENGER_EMBED_CONFIG);
      const collapseBtn = card.querySelector<HTMLButtonElement>('button[aria-label="Collapse or expand media"]');
      const body = card.querySelector('.varia-embed-body');

      expect(collapseBtn).not.toBeNull();
      expect(body?.classList.contains('collapsed')).toBe(false);

      // Click collapse
      collapseBtn?.click();
      expect(body?.classList.contains('collapsed')).toBe(true);
      expect(collapseBtn?.textContent).toBe('+');

      // Click expand
      collapseBtn?.click();
      expect(body?.classList.contains('collapsed')).toBe(false);
      expect(collapseBtn?.textContent).toBe('—');
    });
  });

  describe('Messenger DOM Scanner & Injector', () => {
    it('detects links inside chat bubble DOM and injects cards without duplicates', async () => {
      const mockChatContainer = document.createElement('div');
      mockChatContainer.innerHTML = `
        <div role="row" class="chat-row">
          <div class="message-bubble">
            <span>Check this out:</span>
            <a href="https://www.youtube.com/shorts/3jz1D8S7K10">https://www.youtube.com/shorts/3jz1D8S7K10</a>
          </div>
        </div>
      `;
      document.body.appendChild(mockChatContainer);

      const testConfig = {
        ...DEFAULT_MESSENGER_EMBED_CONFIG,
        enabledPlatforms: {
          ...DEFAULT_MESSENGER_EMBED_CONFIG.enabledPlatforms,
          youtube: true,
        },
      };

      await scanAndInjectEmbeds(mockChatContainer, testConfig);

      const anchor = mockChatContainer.querySelector('a');
      expect(anchor?.getAttribute('data-varia-embedded')).toBe('true');

      const injectedCard = mockChatContainer.querySelector('.varia-embed-container');
      expect(injectedCard).not.toBeNull();
      expect(injectedCard?.getAttribute('data-varia-embed-id')).toBe('yt-3jz1D8S7K10');

      // Second scan should NOT duplicate cards
      await scanAndInjectEmbeds(mockChatContainer, testConfig);
      const allCards = mockChatContainer.querySelectorAll('.varia-embed-container');
      expect(allCards.length).toBe(1);

      document.body.removeChild(mockChatContainer);
    });

    it('strictly ignores links inside Facebook News Feed or Reels carousel trays', async () => {
      const mockFeedContainer = document.createElement('div');
      mockFeedContainer.innerHTML = `
        <div role="feed" class="facebook-news-feed">
          <div data-pagelet="Reels" aria-label="Reels">
            <a href="https://www.facebook.com/reel/1234567890123456">Reel in feed</a>
          </div>
        </div>
      `;
      document.body.appendChild(mockFeedContainer);

      await scanAndInjectEmbeds(mockFeedContainer, DEFAULT_MESSENGER_EMBED_CONFIG);

      const injectedCard = mockFeedContainer.querySelector('.varia-embed-container');
      expect(injectedCard).toBeNull(); // Must NOT inject into feed!

      document.body.removeChild(mockFeedContainer);
    });

    it('strictly rejects links inside Facebook Reel video overlay and comment sidebar', async () => {
      const mockReelContainer = document.createElement('div');
      mockReelContainer.innerHTML = `
        <div data-pagelet="Reels_viewer" aria-label="Reels">
          <div role="dialog">
            <div dir="auto">
              <span>Caption on reel:</span>
              <a href="https://x.com/tech/status/123456">https://x.com/tech/status/123456</a>
            </div>
            <div aria-label="Comments">
              <div role="row">
                <a href="https://www.instagram.com/reel/abcdef">Check comment</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(mockReelContainer);

      await scanAndInjectEmbeds(mockReelContainer, DEFAULT_MESSENGER_EMBED_CONFIG);

      const cards = mockReelContainer.querySelectorAll('.varia-embed-container');
      expect(cards.length).toBe(0); // Must NOT inject into Reel player or comments!

      document.body.removeChild(mockReelContainer);
    });

    it('successfully detects links inside Facebook floating Messenger chat tabs', async () => {
      const mockChatTab = document.createElement('div');
      mockChatTab.innerHTML = `
        <div data-pagelet="ChatTab" class="fbDockChatTabFlyout">
          <div role="dialog" aria-label="Messenger - John Doe">
            <div role="row">
              <div class="message-bubble">
                <a href="https://x.com/user/status/987654">https://x.com/user/status/987654</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(mockChatTab);

      await scanAndInjectEmbeds(mockChatTab, DEFAULT_MESSENGER_EMBED_CONFIG);

      const injectedCard = mockChatTab.querySelector('.varia-embed-container');
      expect(injectedCard).not.toBeNull();
      expect(injectedCard?.getAttribute('data-varia-embed-id')).toBe('x-987654');

      document.body.removeChild(mockChatTab);
    });
  });
});
