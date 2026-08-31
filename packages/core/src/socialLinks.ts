/**
 * Social Links Parsing & ID Extraction Utilities
 * Pure TypeScript utilities for detecting, normalizing, and extracting IDs from social media URLs.
 */

export type SocialPlatform =
  | 'youtube'
  | 'x-twitter'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'reddit'
  | 'unknown';

export interface ParsedSocialLink {
  platform: SocialPlatform;
  id: string | null;
  originalUrl: string;
  cleanUrl: string;
  authorHandle?: string;
  timeParam?: string;
  isShortFormVideo: boolean;
}

const TRACKING_QUERY_PARAMS = new Set([
  's',
  't',
  'fbclid',
  'igshid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref_src',
  'ref_url',
  'twclid',
  'si',
  'feature',
  'cxt',
  'source_ve_path',
  'embeds_referring_euri',
  'embeds_referring_origin',
  'is_from_webapp',
  'sender_device',
  'mibextid',
  'rdid',
  'refid',
  '__cft__',
  '__tn__',
]);

/**
 * Remove tracking parameters from a URL string
 */
export function sanitizeSocialUrl(rawUrl: string): string {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return rawUrl;
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);

    const toDelete: string[] = [];
    url.searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (TRACKING_QUERY_PARAMS.has(lower) || lower.startsWith('utm_') || lower.startsWith('__')) {
        toDelete.push(key);
      }
    });
    toDelete.forEach(k => url.searchParams.delete(k));

    // Remove empty search query string `?` if all params were stripped
    const search = url.searchParams.toString();
    return `${url.protocol}//${url.hostname}${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
  } catch {
    return rawUrl;
  }
}

/**
 * YouTube parser: handles shorts, watch, youtu.be, embed, music
 */
const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export function parseYouTubeLink(url: string): ParsedSocialLink | null {
  const match = url.trim().match(YOUTUBE_REGEX);
  if (!match || !match[1]) {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) {
        const isShorts = parsed.pathname.includes('/shorts/');
        return {
          platform: 'youtube',
          id: v,
          originalUrl: url,
          cleanUrl: sanitizeSocialUrl(url),
          timeParam: parsed.searchParams.get('t') ?? undefined,
          isShortFormVideo: isShorts,
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  const id = match[1];
  const isShorts = url.includes('/shorts/');
  let timeParam: string | undefined;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const t = parsed.searchParams.get('t');
    if (t) timeParam = t;
  } catch {
    // Ignore URL parse error
  }

  return {
    platform: 'youtube',
    id,
    originalUrl: url,
    cleanUrl: sanitizeSocialUrl(url),
    timeParam,
    isShortFormVideo: isShorts,
  };
}

/**
 * X (Twitter) parser: handles x.com and twitter.com status links
 */
const X_TWITTER_REGEX =
  /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,30})\/status\/([0-9]+)/i;

export function parseXTwitterLink(url: string): ParsedSocialLink | null {
  const match = url.trim().match(X_TWITTER_REGEX);
  if (!match || !match[1] || !match[2]) return null;

  return {
    platform: 'x-twitter',
    id: match[2],
    authorHandle: match[1],
    originalUrl: url,
    cleanUrl: sanitizeSocialUrl(url),
    isShortFormVideo: false,
  };
}

/**
 * Instagram parser: handles /p/, /reel/, /tv/
 */
const INSTAGRAM_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i;

export function parseInstagramLink(url: string): ParsedSocialLink | null {
  const match = url.trim().match(INSTAGRAM_REGEX);
  if (!match || !match[1]) return null;

  const isReel = url.includes('/reel/');
  return {
    platform: 'instagram',
    id: match[1],
    originalUrl: url,
    cleanUrl: sanitizeSocialUrl(url),
    isShortFormVideo: isReel,
  };
}

/**
 * Facebook parser: handles /reel/, /share/r/, /share/v/, /share/p/, /share/, /watch/?v=, /videos/, fb.watch
 */
const FB_REEL_REGEX = /^(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/reel\/([0-9a-zA-Z_-]+)/i;
const FB_SHARE_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/share\/(?:(r|v|p|post)\/)?([0-9a-zA-Z_-]+)/i;
const FB_SHORT_WATCH_REGEX = /^(?:https?:\/\/)?(?:www\.)?fb\.watch\/([0-9a-zA-Z_-]+)/i;
const FB_WATCH_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/(?:watch\/\?v=|.*\/videos\/)([0-9a-zA-Z_-]+)/i;

export function parseFacebookLink(url: string): ParsedSocialLink | null {
  // 1. Direct Reel: facebook.com/reel/{id}
  const reelMatch = url.trim().match(FB_REEL_REGEX);
  if (reelMatch && reelMatch[1]) {
    return {
      platform: 'facebook',
      id: reelMatch[1],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: true,
    };
  }

  // 2. Share Link: facebook.com/share/r/{id} or facebook.com/share/{id}
  const shareMatch = url.trim().match(FB_SHARE_REGEX);
  if (shareMatch && shareMatch[2]) {
    const shareType = shareMatch[1]?.toLowerCase();
    const isReel = shareType === 'r';
    return {
      platform: 'facebook',
      id: shareMatch[2],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: isReel,
    };
  }

  // 3. Short link: fb.watch/{id}
  const shortWatchMatch = url.trim().match(FB_SHORT_WATCH_REGEX);
  if (shortWatchMatch && shortWatchMatch[1]) {
    return {
      platform: 'facebook',
      id: shortWatchMatch[1],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: false,
    };
  }

  // 4. Watch / Videos: facebook.com/watch/?v={id}
  const watchMatch = url.trim().match(FB_WATCH_REGEX);
  if (watchMatch && watchMatch[1]) {
    return {
      platform: 'facebook',
      id: watchMatch[1],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: false,
    };
  }

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')) {
      const v = parsed.searchParams.get('v');
      if (v) {
        return {
          platform: 'facebook',
          id: v,
          originalUrl: url,
          cleanUrl: sanitizeSocialUrl(url),
          isShortFormVideo: false,
        };
      }
    }
  } catch {
    // Ignore URL parse error
  }

  return null;
}

/**
 * TikTok parser: handles @user/video/id and vm.tiktok.com/id
 */
const TIKTOK_STANDARD_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.-]+)\/video\/([0-9]+)/i;
const TIKTOK_SHORT_REGEX = /^(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/([a-zA-Z0-9_-]+)/i;

export function parseTikTokLink(url: string): ParsedSocialLink | null {
  const stdMatch = url.trim().match(TIKTOK_STANDARD_REGEX);
  if (stdMatch && stdMatch[1] && stdMatch[2]) {
    return {
      platform: 'tiktok',
      id: stdMatch[2],
      authorHandle: stdMatch[1],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: true,
    };
  }

  const shortMatch = url.trim().match(TIKTOK_SHORT_REGEX);
  if (shortMatch && shortMatch[1]) {
    return {
      platform: 'tiktok',
      id: shortMatch[1],
      originalUrl: url,
      cleanUrl: sanitizeSocialUrl(url),
      isShortFormVideo: true,
    };
  }

  return null;
}

/**
 * Master parser: detects social media platform and extracts metadata
 * Optimized with fast-path domain substring checks before regex execution.
 */
export function parseSocialLink(rawUrl: string): ParsedSocialLink | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  // Fast pre-filter: return early if no supported social domain is in URL
  const isCandidate =
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('x.com') ||
    lower.includes('twitter.com') ||
    lower.includes('instagram.com') ||
    lower.includes('instagr.am') ||
    lower.includes('facebook.com') ||
    lower.includes('fb.watch') ||
    lower.includes('tiktok.com');

  if (!isCandidate) return null;

  // 1. YouTube
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    const yt = parseYouTubeLink(trimmed);
    if (yt) return yt;
  }

  // 2. X (Twitter)
  if (lower.includes('x.com') || lower.includes('twitter.com')) {
    const x = parseXTwitterLink(trimmed);
    if (x) return x;
  }

  // 3. Instagram
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    const ig = parseInstagramLink(trimmed);
    if (ig) return ig;
  }

  // 4. Facebook
  if (lower.includes('facebook.com')) {
    const fb = parseFacebookLink(trimmed);
    if (fb) return fb;
  }

  // 5. TikTok
  if (lower.includes('tiktok.com')) {
    const tt = parseTikTokLink(trimmed);
    if (tt) return tt;
  }

  return null;
}
