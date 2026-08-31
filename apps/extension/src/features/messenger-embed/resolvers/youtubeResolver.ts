import { parseYouTubeLink } from '@varia/core';
import { MediaEmbedPayload } from '../types';

export function resolveYouTubeEmbed(url: string): MediaEmbedPayload | null {
  const parsed = parseYouTubeLink(url);
  if (!parsed || !parsed.id) return null;

  const videoId = parsed.id;
  const timeQuery = parsed.timeParam ? `&start=${parsed.timeParam}` : '';
  const iframeSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0${timeQuery}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    id: `yt-${videoId}`,
    platform: 'youtube',
    originalUrl: url,
    cleanUrl: parsed.cleanUrl,
    title: parsed.isShortFormVideo ? 'YouTube Shorts' : 'YouTube Video',
    mediaType: 'iframe',
    iframeSrc,
    thumbnailUrl,
    aspectRatio: parsed.isShortFormVideo ? '9:16' : '16:9',
    timestampMs: Date.now(),
  };
}
