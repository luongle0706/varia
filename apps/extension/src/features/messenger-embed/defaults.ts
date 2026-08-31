import { MessengerEmbedConfig } from './types';

export const DEFAULT_MESSENGER_EMBED_CONFIG: MessengerEmbedConfig = {
  enabled: true,
  enabledPlatforms: {
    youtube: false,
    'x-twitter': true,
    instagram: true,
    facebook: false,
    tiktok: true,
  },
  muteByDefault: true,
  autoPauseOthers: true,
  maxHeightPx: 380,
  autoCollapse: false,
};

export const STORAGE_KEY_MESSENGER_EMBED = 'varia_messenger_embed_config';
export const STORAGE_KEY_MEDIA_CACHE = 'varia_media_embed_cache_v10';
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days TTL
export const CACHE_MAX_ENTRIES = 1000;
