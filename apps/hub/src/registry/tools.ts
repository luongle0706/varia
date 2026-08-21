import type { VariaToolManifest } from '@varia/core';

export const REGISTERED_TOOLS: VariaToolManifest[] = [
  // Media Studio
  {
    id: 'tool-audio-converter',
    name: 'MP4 to MP3 Converter',
    description:
      'High quality client-side audio extraction with custom bitrates, volume boost and waveform trimmer.',
    category: 'media',
    icon: 'audio',
    tags: ['audio', 'mp4', 'mp3', 'ffmpeg', 'freeconvert'],
    isOfflineReady: true,
    wasmRequired: true,
    route: '/audio-converter',
    component: () => import('../tools/audio-converter/AudioConverterTool'),
  },
  {
    id: 'tool-gif-studio',
    name: 'GIF Studio & Editor',
    description:
      'Full-featured GIF maker, trimmer, crop, speed adjustment, and color quantization optimizer.',
    category: 'media',
    icon: 'gif',
    tags: ['gif', 'ezgif', 'video', 'crop', 'optimize'],
    isOfflineReady: true,
    wasmRequired: true,
    route: '/gif-studio',
  },
  {
    id: 'tool-image-studio',
    name: 'Image Compressor & WebP',
    description:
      'Lossless & lossy image compression for PNG, JPEG, and WebP directly in your browser.',
    category: 'media',
    icon: 'image',
    tags: ['image', 'webp', 'compress', 'resize'],
    isOfflineReady: true,
    route: '/image-studio',
  },

  // Developer Utilities
  {
    id: 'tool-uuid-forge',
    name: 'UUID & NanoID Forge',
    description:
      'Instant generator for UUID v4 (Random), UUID v7 (Time-Ordered), ULID and NanoID in batch.',
    category: 'dev',
    icon: 'uuid',
    tags: ['uuid', 'uuidv7', 'ulid', 'nanoid', 'generator'],
    isOfflineReady: true,
    route: '/uuid-forge',
  },
  {
    id: 'tool-jwt-base64',
    name: 'JWT & Base64 Inspector',
    description:
      'Decode and inspect JSON Web Tokens, parse payloads, check expiration, and encode/decode Base64.',
    category: 'dev',
    icon: 'code',
    tags: ['jwt', 'base64', 'auth', 'decoder'],
    isOfflineReady: true,
    route: '/jwt-base64',
  },
  {
    id: 'tool-hash-studio',
    name: 'Hash & Checksum Studio',
    description:
      'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes for text and large files using Web Crypto.',
    category: 'dev',
    icon: 'hash',
    tags: ['hash', 'sha256', 'md5', 'checksum', 'crypto'],
    isOfflineReady: true,
    route: '/hash-studio',
  },
  {
    id: 'tool-regex-playground',
    name: 'RegEx Playground',
    description:
      'Real-time regular expression tester with capture groups highlighting and cheat-sheet reference.',
    category: 'dev',
    icon: 'code',
    tags: ['regex', 'tester', 'pattern', 'syntax'],
    isOfflineReady: true,
    route: '/regex-playground',
  },

  // Network & Connectivity
  {
    id: 'tool-speedtest',
    name: 'Varia SpeedTest',
    description:
      'Measure download speed, upload bandwidth, real-time ping latency and jitter with smooth gauges.',
    category: 'network',
    icon: 'speed',
    tags: ['speedtest', 'bandwidth', 'ping', 'latency'],
    isOfflineReady: false,
    route: '/speedtest',
  },
  {
    id: 'tool-ip-inspector',
    name: 'Public IP & Geo Inspector',
    description:
      'Inspect public IPv4/IPv6, ISP provider, Geo-location, browser capabilities, and WebRTC leak test.',
    category: 'network',
    icon: 'speed',
    tags: ['ip', 'geo', 'isp', 'webrtc'],
    isOfflineReady: false,
    route: '/ip-inspector',
  },

  // Social & Downloader
  {
    id: 'tool-youtube-downloader',
    name: 'YouTube Video & MP3 Downloader',
    description:
      'High-speed video & audio extraction via yt-dlp. Supports MP4 up to original max resolution, H.264 codec and 320k MP3.',
    category: 'social',
    icon: 'social',
    tags: ['youtube', 'video', 'mp3', 'download', 'ytdlp', 'shorts'],
    isOfflineReady: false,
    requiresServer: true,
    route: '/youtube-downloader',
    component: () => import('../tools/youtube-downloader/YouTubeDownloaderTool'),
  },

  // Text & Productivity
  {
    id: 'tool-markdown-studio',
    name: 'Markdown Live Studio',
    description:
      'Split-screen real-time Markdown editor supporting GitHub Flavored Markdown, Mermaid, and PDF export.',
    category: 'text',
    icon: 'text',
    tags: ['markdown', 'gfm', 'mermaid', 'editor'],
    isOfflineReady: true,
    route: '/markdown-studio',
  },
  {
    id: 'tool-qr-studio',
    name: 'QR Code Studio',
    description:
      'Create customized QR codes with logos, colors, gradients and scan QR codes with webcam.',
    category: 'text',
    icon: 'text',
    tags: ['qr', 'qrcode', 'scanner', 'generator'],
    isOfflineReady: true,
    route: '/qr-studio',
  },
];
