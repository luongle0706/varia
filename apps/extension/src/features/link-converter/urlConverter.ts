import { LinkConverterConfig, ConversionResult } from './types';

// Common tracking & playlist parameters to strip for cleaner embed links
const TRACKING_PARAMS = new Set([
  's',
  't', // will be preserved conditionally if numeric timestamp
  'ref_src',
  'ref_url',
  'twclid',
  'fbclid',
  'igshid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'feature',
  'si',
  'cxt',
  'list',
  'index',
  'pp',
  'ab_channel',
  'start_radio',
  'themeRefresh',
  'embeds_referring_euri',
  'embeds_referring_origin',
  'source_ve_path',
]);

/**
 * Strict regex for YouTube video IDs (watch, shorts, youtu.be, embed, music)
 */
const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export function extractYouTubeId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_REGEX);
  if (match && match[5]) {
    return match[5];
  }
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const v = parsed.searchParams.get('v');
    if (v && v.length === 11) return v;
  } catch {
    // Ignore error
  }
  return null;
}

export function formatYouTubeUrl(
  videoId: string,
  targetEngine: string,
  timeParam?: string | null,
): string {
  const host = extractHost(targetEngine);
  const timeQuery = timeParam ? `?t=${timeParam}` : '';

  if (host === 'youtu.be') {
    return `https://youtu.be/${videoId}${timeQuery}`;
  }
  if (host.includes('music.youtube.com')) {
    return `https://music.youtube.com/watch?v=${videoId}${timeQuery}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}${timeQuery}`;
}

/**
 * Clean tracking parameters from a URLSearchParams object
 */
export function cleanSearchParams(searchParams: URLSearchParams): void {
  const keysToDelete: string[] = [];
  searchParams.forEach((_, key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => searchParams.delete(key));
}

/**
 * Format domain or URL to normalized hostname (e.g. "https://fixupx.com" -> "fixupx.com")
 */
export function extractHost(engineUrl: string): string {
  try {
    const parsed = new URL(engineUrl.startsWith('http') ? engineUrl : `https://${engineUrl}`);
    return parsed.hostname;
  } catch {
    return engineUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

/**
 * Converts a given URL into its configured embed provider URL
 */
export function convertUrl(rawUrl: string, config: LinkConverterConfig): ConversionResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { original: rawUrl, converted: rawUrl, matched: false };
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // 1. Check Special X (Twitter) Engine override
    const isXDomain =
      hostname === 'x.com' ||
      hostname === 'twitter.com' ||
      hostname.endsWith('.x.com') ||
      hostname.endsWith('.twitter.com');
    if (isXDomain) {
      if (config.stripTrackingParams) {
        cleanSearchParams(parsed.searchParams);
      }

      const targetHost = extractHost(config.xEngine || 'https://fixupx.com');
      parsed.hostname = targetHost;

      const search = parsed.searchParams.toString();
      const finalUrl = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${search ? `?${search}` : ''}${parsed.hash}`;

      return {
        original: rawUrl,
        converted: finalUrl,
        matched: true,
        platform: 'X (Twitter)',
        engine: targetHost,
      };
    }

    // 2. Check other platform presets
    for (const platform of config.platforms) {
      if (!platform.enabled) continue;

      const matches = platform.matchDomains.some(d => {
        const normD = d.replace(/^www\./, '').toLowerCase();
        return hostname === normD || hostname.endsWith(`.${normD}`);
      });

      if (matches) {
        // Special case: YouTube (smart trimming for playlists, shorts, timestamps, and youtu.be shortlinks)
        if (platform.id === 'youtube') {
          const videoId = extractYouTubeId(trimmed);
          if (videoId) {
            const timeParam = parsed.searchParams.get('t');
            const finalUrl = formatYouTubeUrl(videoId, platform.selectedEngine, timeParam);
            const targetHost = extractHost(platform.selectedEngine);

            return {
              original: rawUrl,
              converted: finalUrl,
              matched: true,
              platform: 'YouTube',
              engine: targetHost,
            };
          }
        }

        if (config.stripTrackingParams) {
          cleanSearchParams(parsed.searchParams);
        }

        const targetHost = extractHost(platform.selectedEngine);
        parsed.hostname = targetHost;

        const search = parsed.searchParams.toString();
        const finalUrl = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${search ? `?${search}` : ''}${parsed.hash}`;

        return {
          original: rawUrl,
          converted: finalUrl,
          matched: true,
          platform: platform.name,
          engine: targetHost,
        };
      }
    }
  } catch {
    // If URL is invalid, return untouched
  }

  return { original: rawUrl, converted: rawUrl, matched: false };
}
