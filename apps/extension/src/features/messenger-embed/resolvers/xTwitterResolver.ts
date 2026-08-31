import { parseXTwitterLink } from '@varia/core';
import { MediaEmbedPayload } from '../types';

interface FxTwitterResponse {
  code: number;
  message: string;
  tweet?: {
    id: string;
    url: string;
    text: string;
    created_at: string;
    author?: {
      name: string;
      screen_name: string;
      avatar_url?: string;
    };
    media?: {
      photos?: Array<{ url: string; width?: number; height?: number }>;
      videos?: Array<{
        url: string;
        thumbnail_url?: string;
        width?: number;
        height?: number;
        format?: string;
      }>;
      mosaic?: {
        formats?: {
          jpeg?: string;
          webp?: string;
        };
      };
    };
  };
}

export async function resolveXTwitterEmbed(url: string): Promise<MediaEmbedPayload | null> {
  const parsed = parseXTwitterLink(url);
  if (!parsed || !parsed.id) return null;

  const tweetId = parsed.id;
  const authorHandle = parsed.authorHandle || 'i';

  try {
    const apiUrl = `https://api.fxtwitter.com/${authorHandle}/status/${tweetId}`;
    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(3000)
          : undefined,
    });

    if (res.ok) {
      const data = (await res.json()) as FxTwitterResponse;
      const tweet = data.tweet;

      if (tweet) {
        const authorName = tweet.author?.name || authorHandle;
        const screenName = tweet.author?.screen_name || authorHandle;
        const text = tweet.text || '';

        // 1. Check for Video
        const videos = tweet.media?.videos;
        if (videos && videos.length > 0 && videos[0]?.url) {
          const video = videos[0];
          return {
            id: `x-${tweetId}`,
            platform: 'x-twitter',
            originalUrl: url,
            cleanUrl: parsed.cleanUrl,
            title: `@${screenName}`,
            description: text,
            authorName,
            authorHandle: `@${screenName}`,
            mediaType: 'video',
            mediaUrl: video.url,
            thumbnailUrl: video.thumbnail_url,
            aspectRatio:
              video.width && video.height && video.height > video.width ? '9:16' : '16:9',
            timestampMs: Date.now(),
          };
        }

        // 2. Check for Photos / Mosaic
        const photos = tweet.media?.photos;
        if (photos && photos.length > 0) {
          const imageUrls = photos.map(p => p.url).filter(Boolean);
          const firstPhoto = photos[0];
          return {
            id: `x-${tweetId}`,
            platform: 'x-twitter',
            originalUrl: url,
            cleanUrl: parsed.cleanUrl,
            title: `@${screenName}`,
            description: text,
            authorName,
            authorHandle: `@${screenName}`,
            mediaType: imageUrls.length > 1 ? 'gallery' : 'image',
            mediaUrl: firstPhoto?.url,
            images: imageUrls,
            aspectRatio: '1:1',
            timestampMs: Date.now(),
          };
        }

        // 3. Text tweet with no media
        return {
          id: `x-${tweetId}`,
          platform: 'x-twitter',
          originalUrl: url,
          cleanUrl: parsed.cleanUrl,
          title: `@${screenName}`,
          description: text,
          authorName,
          authorHandle: `@${screenName}`,
          mediaType: 'image',
          thumbnailUrl: tweet.author?.avatar_url,
          aspectRatio: '16:9',
          timestampMs: Date.now(),
        };
      }
    }
  } catch {
    // If API fetch fails, proceed to fallback
  }

  // Fallback: Embed via twitframe
  return {
    id: `x-${tweetId}`,
    platform: 'x-twitter',
    originalUrl: url,
    cleanUrl: parsed.cleanUrl,
    title: `Post by @${authorHandle}`,
    authorHandle: `@${authorHandle}`,
    mediaType: 'iframe',
    iframeSrc: `https://twitframe.com/show?url=${encodeURIComponent(parsed.cleanUrl)}`,
    aspectRatio: '16:9',
    timestampMs: Date.now(),
  };
}
