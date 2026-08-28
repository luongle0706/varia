import { LinkConverterConfig, PlatformPreset } from './types';

export const DEFAULT_PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'x',
    name: 'X (Twitter)',
    matchDomains: ['x.com', 'twitter.com'],
    engines: [
      'https://fixupx.com',
      'https://fxtwitter.com',
      'https://cunnyx.com',
      'https://vxtwitter.com',
      'https://twittpr.com',
    ],
    selectedEngine: 'https://fixupx.com',
    enabled: true,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    matchDomains: ['reddit.com', 'old.reddit.com'],
    engines: ['https://rxddit.com', 'https://vxreddit.com'],
    selectedEngine: 'https://rxddit.com',
    enabled: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    matchDomains: ['instagram.com', 'instagr.am'],
    engines: ['https://vxinstagram.com', 'https://ddinstagram.com'],
    selectedEngine: 'https://vxinstagram.com',
    enabled: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    matchDomains: ['tiktok.com', 'vm.tiktok.com'],
    engines: ['https://tnktok.com', 'https://tfxktok.com', 'https://vxtiktok.com'],
    selectedEngine: 'https://tnktok.com',
    enabled: true,
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    matchDomains: ['bsky.app'],
    engines: ['https://fxbsky.app'],
    selectedEngine: 'https://fxbsky.app',
    enabled: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    matchDomains: ['youtube.com', 'youtu.be', 'music.youtube.com', 'm.youtube.com'],
    engines: ['https://youtu.be', 'https://www.youtube.com', 'https://music.youtube.com'],
    selectedEngine: 'https://youtu.be',
    enabled: true,
  },
  {
    id: 'threads',
    name: 'Threads',
    matchDomains: ['threads.net'],
    engines: ['https://vxthreads.net', 'https://fixthreads.net'],
    selectedEngine: 'https://vxthreads.net',
    enabled: true,
  },
  {
    id: 'pixiv',
    name: 'Pixiv',
    matchDomains: ['pixiv.net'],
    engines: ['https://phixiv.net'],
    selectedEngine: 'https://phixiv.net',
    enabled: true,
  },
];

export const DEFAULT_LINK_CONVERTER_CONFIG: LinkConverterConfig = {
  enabled: true,
  xEngine: 'https://fixupx.com',
  stripTrackingParams: true,
  showToast: true,
  showInShareMenu: true,
  autoConvertClipboard: false,
  platforms: DEFAULT_PLATFORM_PRESETS,
};

export const STORAGE_KEY_LINK_CONVERTER = 'varia_link_converter_config';

/**
 * Merge user-saved storage with the latest default presets & engines
 */
export function mergeConfigWithDefaults(
  stored?: Partial<LinkConverterConfig> | null,
): LinkConverterConfig {
  if (!stored) return DEFAULT_LINK_CONVERTER_CONFIG;

  const storedPlatforms = Array.isArray(stored.platforms) ? stored.platforms : [];

  const mergedPlatforms: PlatformPreset[] = DEFAULT_PLATFORM_PRESETS.map(defaultPlatform => {
    const existing = storedPlatforms.find(p => p.id === defaultPlatform.id);
    if (!existing) return defaultPlatform;

    const safeSelected =
      existing.selectedEngine && defaultPlatform.engines.includes(existing.selectedEngine)
        ? existing.selectedEngine
        : defaultPlatform.selectedEngine;

    return {
      ...defaultPlatform,
      selectedEngine: safeSelected,
      enabled: existing.enabled !== undefined ? existing.enabled : defaultPlatform.enabled,
    };
  });

  return {
    ...DEFAULT_LINK_CONVERTER_CONFIG,
    ...stored,
    platforms: mergedPlatforms,
  };
}
