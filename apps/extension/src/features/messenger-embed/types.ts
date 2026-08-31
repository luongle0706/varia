import { SocialPlatform } from '@varia/core';

export interface MessengerEmbedConfig {
  enabled: boolean;
  enabledPlatforms: Record<Exclude<SocialPlatform, 'unknown' | 'reddit'>, boolean>;
  muteByDefault: boolean;
  autoPauseOthers: boolean;
  maxHeightPx: number;
  autoCollapse: boolean;
}

export type MediaDisplayType = 'video' | 'image' | 'gallery' | 'iframe';

export interface MediaEmbedPayload {
  id: string;
  platform: SocialPlatform;
  originalUrl: string;
  cleanUrl: string;
  title?: string;
  description?: string;
  authorName?: string;
  authorHandle?: string;
  mediaType: MediaDisplayType;
  mediaUrl?: string; // Direct MP4 or high-res image
  iframeSrc?: string;
  thumbnailUrl?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  images?: string[];
  durationSeconds?: number;
  timestampMs: number;
}

export interface ResolveMediaMessage {
  type: 'VARIA_RESOLVE_MEDIA';
  url: string;
}

export interface ClearMediaCacheMessage {
  type: 'VARIA_CLEAR_MEDIA_CACHE';
}

export interface FetchMediaBlobMessage {
  type: 'VARIA_FETCH_MEDIA_BLOB' | 'VARIA_FETCH_MEDIA_CHUNKS';
  url: string;
}

export interface ResolveMediaResponse {
  success: boolean;
  data?: MediaEmbedPayload;
  error?: string;
}

export interface FetchMediaBlobResponse {
  success: boolean;
  dataUrl?: string;
  chunks?: string[];
  mimeType?: string;
  totalSize?: number;
  error?: string;
}
