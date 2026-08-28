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
    matchDomains: ['youtube.com', 'youtu.be'],
    engines: ['https://yout-ube.com'],
    selectedEngine: 'https://yout-ube.com',
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
  customXEngines: [],
  stripTrackingParams: true,
  showToast: true,
  showInShareMenu: true,
  autoConvertClipboard: false,
  platforms: DEFAULT_PLATFORM_PRESETS,
};

export const STORAGE_KEY_LINK_CONVERTER = 'varia_link_converter_config';
