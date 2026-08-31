import { parseTikTokLink } from '@varia/core';
import { MediaEmbedPayload } from '../types';

interface TikWmResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    title: string;
    play: string;
    wmplay?: string;
    cover: string;
    duration: number;
    author?: {
      id: string;
      unique_id: string;
      nickname: string;
      avatar: string;
    };
  };
}

interface TikTokOEmbedResponse {
  title: string;
  author_name: string;
  author_unique_id: string;
  thumbnail_url: string;
}

export async function resolveTikTokEmbed(url: string): Promise<MediaEmbedPayload | null> {
  const parsed = parseTikTokLink(url);
  if (!parsed || !parsed.id) return null;

  const videoId = parsed.id;
  const authorHandle = parsed.authorHandle ? `@${parsed.authorHandle}` : undefined;

  // 1. Try TikWM Direct Video API (Returns direct playable MP4 + full post caption)
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(parsed.cleanUrl)}`;
    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(3500)
          : undefined,
    });

    if (res.ok) {
      const data = (await res.json()) as TikWmResponse;
      if (data.code === 0 && data.data && data.data.play) {
        const item = data.data;
        const authorName = item.author?.nickname || parsed.authorHandle;
        const screenHandle = item.author?.unique_id ? `@${item.author.unique_id}` : authorHandle;

        return {
          id: `tt-${videoId}`,
          platform: 'tiktok',
          originalUrl: url,
          cleanUrl: parsed.cleanUrl,
          title: screenHandle || authorName || 'TikTok Video',
          description: item.title,
          authorName,
          authorHandle: screenHandle,
          mediaType: 'video',
          mediaUrl: item.play,
          thumbnailUrl: item.cover,
          durationSeconds: item.duration,
          aspectRatio: '9:16',
          timestampMs: Date.now(),
        };
      }
    }
  } catch {
    // Continue to oEmbed fallback
  }

  // 2. Try TikTok Official oEmbed API (for caption text and high-res thumbnail)
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.cleanUrl)}`;
    const oembedRes = await fetch(oembedUrl, {
      headers: { Accept: 'application/json' },
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(2500)
          : undefined,
    });

    if (oembedRes.ok) {
      const oembedData = (await oembedRes.json()) as TikTokOEmbedResponse;
      const screenHandle = oembedData.author_unique_id
        ? `@${oembedData.author_unique_id}`
        : authorHandle;

      return {
        id: `tt-${videoId}`,
        platform: 'tiktok',
        originalUrl: url,
        cleanUrl: parsed.cleanUrl,
        title: screenHandle || oembedData.author_name || 'TikTok Video',
        description: oembedData.title,
        authorName: oembedData.author_name,
        authorHandle: screenHandle,
        mediaType: 'iframe',
        iframeSrc: `https://www.tiktok.com/embed/v2/${videoId}`,
        thumbnailUrl: oembedData.thumbnail_url,
        aspectRatio: '9:16',
        timestampMs: Date.now(),
      };
    }
  } catch {
    // Continue to standard iframe fallback
  }

  // 3. Fallback to clean standard iframe
  return {
    id: `tt-${videoId}`,
    platform: 'tiktok',
    originalUrl: url,
    cleanUrl: parsed.cleanUrl,
    title: authorHandle || 'TikTok Video',
    authorHandle,
    mediaType: 'iframe',
    iframeSrc: `https://www.tiktok.com/embed/v2/${videoId}`,
    aspectRatio: '9:16',
    timestampMs: Date.now(),
  };
}
