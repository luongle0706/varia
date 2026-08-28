import { LinkConverterConfig, ConversionResult } from './types';

// Common tracking parameters to strip for cleaner embed links
const TRACKING_PARAMS = new Set([
  's',
  't',
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
]);

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
