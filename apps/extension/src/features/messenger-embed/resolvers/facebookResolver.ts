import { parseFacebookLink } from '@varia/core';
import { MediaEmbedPayload } from '../types';

export async function resolveFacebookEmbed(url: string): Promise<MediaEmbedPayload | null> {
  const parsed = parseFacebookLink(url);
  if (!parsed || !parsed.id) return null;

  const isReel = parsed.isShortFormVideo;
  let canonicalUrl = parsed.cleanUrl;

  // 1. If it is a numeric ID (e.g. 1234567890123456), form canonical reel/video URL
  if (/^\d+$/.test(parsed.id)) {
    canonicalUrl = isReel
      ? `https://www.facebook.com/reel/${parsed.id}`
      : `https://www.facebook.com/watch/?v=${parsed.id}`;
  }

  // 2. Try to fetch direct video and metadata via background worker
  try {
    const fetchTarget = canonicalUrl;
    const res = await fetch(fetchTarget, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(3500)
          : undefined,
    });

    if (res.ok) {
      if (res.url && !res.url.includes('/share/')) {
        canonicalUrl = res.url;
      }

      const html = await res.text();

      // Extract direct playable video URL from OpenGraph or JSON script payload
      const videoMatch =
        html.match(/<meta\s+(?:property|name)=["']og:video(?::secure_url)?["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+(?:property|name)=["']og:video:url["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+(?:property|name)=["']twitter:player:stream["']\s+content=["'](.*?)["']/i) ||
        html.match(/"playable_url(?:_quality_hd)?":\s*"([^"]+)"/i) ||
        html.match(/"browser_native_hd_url":\s*"([^"]+)"/i) ||
        html.match(/"browser_native_sd_url":\s*"([^"]+)"/i);

      // Extract thumbnail image
      const imageMatch =
        html.match(/<meta\s+(?:property|name)=["']og:image(?::secure_url)?["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["'](.*?)["']/i) ||
        html.match(/"preferred_thumbnail":\s*\{\s*"image":\s*\{\s*"uri":\s*"([^"]+)"/i);

      // Extract title
      const titleMatch =
        html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i) ||
        html.match(/<title>([^<]+)<\/title>/i);

      const rawVideoUrl = videoMatch && videoMatch[1] ? cleanJsonUrl(videoMatch[1]) : undefined;
      const rawImageUrl = imageMatch && imageMatch[1] ? cleanJsonUrl(imageMatch[1]) : undefined;
      const title = titleMatch && titleMatch[1] ? decodeHtmlEntities(titleMatch[1]) : undefined;

      if (rawVideoUrl && rawVideoUrl.startsWith('http')) {
        return {
          id: `fb-${parsed.id}`,
          platform: 'facebook',
          originalUrl: url,
          cleanUrl: canonicalUrl,
          title: title || (isReel ? 'Facebook Reel' : 'Facebook Video'),
          mediaType: 'video',
          mediaUrl: rawVideoUrl,
          thumbnailUrl: rawImageUrl,
          aspectRatio: isReel ? '9:16' : '16:9',
          timestampMs: Date.now(),
        };
      }
    }
  } catch {
    // If direct fetch fails, do not inject broken iframe
  }

  // If direct playable video cannot be extracted (due to Facebook login/cookie wall),
  // return null so we NEVER display a broken "Video unavailable" iframe over native Messenger attachments.
  return null;
}

function cleanJsonUrl(str: string): string {
  return decodeHtmlEntities(
    str
      .replace(/\\u0025/g, '%')
      .replace(/\\u0026/g, '&')
      .replace(/\\\//g, '/')
      .replace(/\\/g, ''),
  );
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
