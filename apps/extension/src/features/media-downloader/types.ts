/**
 * Media Downloader (IDM Feature) Types
 * Extensible data contracts for future video/audio stream sniffer & download manager.
 */

export interface SniffedMediaStream {
  id: string;
  url: string;
  sourcePageUrl: string;
  title: string;
  type: 'video' | 'audio' | 'stream' | 'hls' | 'dash';
  mimeType?: string;
  quality?: string;
  estimatedSize?: number;
  detectedAt: number;
}

export interface MediaDownloaderConfig {
  enabled: boolean;
  autoSniff: boolean;
  bridgeToVariaHub: boolean;
  variaHubPort: number;
  supportedFormats: string[];
}

export const DEFAULT_MEDIA_DOWNLOADER_CONFIG: MediaDownloaderConfig = {
  enabled: false,
  autoSniff: true,
  bridgeToVariaHub: true,
  variaHubPort: 4000,
  supportedFormats: ['mp4', 'm3u8', 'webm', 'mp3', 'wav'],
};

export const STORAGE_KEY_MEDIA_DOWNLOADER = 'varia_media_downloader_config';
