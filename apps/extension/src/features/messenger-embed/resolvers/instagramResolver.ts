import { parseInstagramLink } from '@varia/core';
import { MediaEmbedPayload } from '../types';

interface InstagramApiItem {
  code?: string;
  caption?: { text?: string };
  user?: { username?: string; full_name?: string };
  video_versions?: Array<{ url: string; width?: number; height?: number }>;
  image_versions2?: { candidates?: Array<{ url: string }> };
}

interface InstagramApiResponse {
  items?: InstagramApiItem[];
  graphql?: {
    shortcode_media?: {
      edge_media_to_caption?: { edges?: Array<{ node?: { text?: string } }> };
      owner?: { username?: string; full_name?: string };
      video_url?: string;
      display_url?: string;
      is_video?: boolean;
    };
  };
}

export async function resolveInstagramEmbed(url: string): Promise<MediaEmbedPayload | null> {
  const parsed = parseInstagramLink(url);
  if (!parsed || !parsed.id) return null;

  const postId = parsed.id;
  const isReel = parsed.isShortFormVideo;

  // 1. Direct Instagram Web API with Official Client App ID
  try {
    const igApiUrl = `https://www.instagram.com/reel/${postId}/?__a=1&__d=dis`;
    const igRes = await fetch(igApiUrl, {
      headers: {
        Accept: 'application/json',
        'X-IG-App-ID': '936619743392459',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      },
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(3500)
          : undefined,
    });

    if (igRes.ok) {
      const data = (await igRes.json()) as InstagramApiResponse;
      const item = data.items?.[0];
      const media = data.graphql?.shortcode_media;

      const videoUrl = item?.video_versions?.[0]?.url || media?.video_url;
      const imageUrl = item?.image_versions2?.candidates?.[0]?.url || media?.display_url;
      const caption =
        item?.caption?.text || media?.edge_media_to_caption?.edges?.[0]?.node?.text;
      const username = item?.user?.username || media?.owner?.username;
      const fullName = item?.user?.full_name || media?.owner?.full_name;

      if (videoUrl && videoUrl.startsWith('http')) {
        const handle = username ? `@${username}` : undefined;
        return {
          id: `ig-${postId}`,
          platform: 'instagram',
          originalUrl: url,
          cleanUrl: parsed.cleanUrl,
          title: handle || fullName || (isReel ? 'Instagram Reel' : 'Instagram Video'),
          description: caption,
          authorName: fullName || username,
          authorHandle: handle,
          mediaType: 'video',
          mediaUrl: videoUrl,
          thumbnailUrl: imageUrl,
          aspectRatio: isReel ? '9:16' : '1:1',
          timestampMs: Date.now(),
        };
      }
    }
  } catch {
    // Continue to proxy fallbacks
  }

  // 2. Try DDInstagram & VxInstagram Web Scraping
  const hosts = [
    'https://www.ddinstagram.com',
    'https://www.vxinstagram.com',
    'https://g.ddinstagram.com',
  ];

  for (const host of hosts) {
    try {
      const proxyUrl = `${host}/${isReel ? 'reel' : 'p'}/${postId}`;
      const res = await fetch(proxyUrl, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal:
          typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
            ? AbortSignal.timeout(3000)
            : undefined,
      });

      if (res.ok) {
        const html = await res.text();

        // Extract direct video URL
        const videoMatch =
          html.match(/<meta\s+(?:property|name)=["']og:video(?::secure_url|:url)?["']\s+content=["'](.*?)["']/i) ||
          html.match(/<meta\s+(?:property|name)=["']twitter:player:stream["']\s+content=["'](.*?)["']/i) ||
          html.match(/<source\s+src=["'](.*?)["']/i) ||
          html.match(/<video[^>]+src=["'](.*?)["']/i);

        // Extract direct image thumbnail
        const imageMatch =
          html.match(/<meta\s+(?:property|name)=["']og:image(?::secure_url|:url)?["']\s+content=["'](.*?)["']/i) ||
          html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["'](.*?)["']/i);

        // Extract author & post description
        const titleMatch =
          html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i) ||
          html.match(/<title>([^<]+)<\/title>/i);

        const descMatch =
          html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["'](.*?)["']/i) ||
          html.match(/<meta\s+(?:property|name)=["']twitter:description["']\s+content=["'](.*?)["']/i);

        const videoUrl = videoMatch && videoMatch[1] ? decodeHtmlEntities(videoMatch[1]) : undefined;
        const imageUrl = imageMatch && imageMatch[1] ? decodeHtmlEntities(imageMatch[1]) : undefined;
        const rawTitle = titleMatch && titleMatch[1] ? decodeHtmlEntities(titleMatch[1]) : undefined;
        const rawDesc = descMatch && descMatch[1] ? decodeHtmlEntities(descMatch[1]) : undefined;

        // Parse author
        let authorHandle: string | undefined;
        let authorName: string | undefined;
        if (rawTitle) {
          const authorMatch = rawTitle.match(/^([^(]+?)\s*(?:\((@?[^)]+)\))?\s*on Instagram/i);
          if (authorMatch) {
            authorName = authorMatch[1]?.trim();
            authorHandle = authorMatch[2]
              ? authorMatch[2].startsWith('@')
                ? authorMatch[2]
                : `@${authorMatch[2]}`
              : undefined;
          }
        }

        // Clean description (filter out default proxy strings)
        let cleanDescription = rawDesc || (rawTitle && !rawTitle.includes('Instagram') ? rawTitle : undefined);
        if (cleanDescription === 'vxinstagram' || cleanDescription === 'ddinstagram') {
          cleanDescription = undefined;
        }

        if (videoUrl && videoUrl.startsWith('http')) {
          return {
            id: `ig-${postId}`,
            platform: 'instagram',
            originalUrl: url,
            cleanUrl: parsed.cleanUrl,
            title: authorHandle || authorName || (isReel ? 'Instagram Reel' : 'Instagram Video'),
            description: cleanDescription,
            authorName,
            authorHandle,
            mediaType: 'video',
            mediaUrl: videoUrl,
            thumbnailUrl: imageUrl,
            aspectRatio: isReel ? '9:16' : '1:1',
            timestampMs: Date.now(),
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. Fallback to clean standard embed iframe
  const iframeSrc = `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${postId}/embed`;

  return {
    id: `ig-${postId}`,
    platform: 'instagram',
    originalUrl: url,
    cleanUrl: parsed.cleanUrl,
    title: isReel ? 'Instagram Reel' : 'Instagram Post',
    mediaType: 'iframe',
    iframeSrc,
    aspectRatio: isReel ? '9:16' : '1:1',
    timestampMs: Date.now(),
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
