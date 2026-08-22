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
    route: '/audio-converter',
    status: 'ready',
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
    route: '/gif-studio',
    status: 'coming-soon',
  },
  {
    id: 'tool-image-studio',
    name: 'Image Compressor & WebP',
    description:
      'Lossless & lossy image compression for PNG, JPEG, and WebP directly in your browser.',
    category: 'media',
    icon: 'image',
    tags: ['image', 'webp', 'compress', 'resize'],
    route: '/image-studio',
    status: 'coming-soon',
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
    route: '/uuid-forge',
    status: 'coming-soon',
  },
  {
    id: 'tool-jwt-base64',
    name: 'JWT & Base64 Inspector',
    description:
      'Decode and inspect JSON Web Tokens, parse payloads, check expiration, and encode/decode Base64.',
    category: 'dev',
    icon: 'code',
    tags: ['jwt', 'base64', 'auth', 'decoder'],
    route: '/jwt-base64',
    status: 'coming-soon',
  },
  {
    id: 'tool-hash-studio',
    name: 'Hash & Checksum Studio',
    description:
      'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes for text and large files using Web Crypto.',
    category: 'dev',
    icon: 'hash',
    tags: ['hash', 'sha256', 'md5', 'checksum', 'crypto'],
    route: '/hash-studio',
    status: 'coming-soon',
  },
  {
    id: 'tool-regex-playground',
    name: 'RegEx Playground',
    description:
      'Real-time regular expression tester with capture groups highlighting and cheat-sheet reference.',
    category: 'dev',
    icon: 'code',
    tags: ['regex', 'tester', 'pattern', 'syntax'],
    route: '/regex-playground',
    status: 'coming-soon',
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
    route: '/speedtest',
    status: 'coming-soon',
  },
  {
    id: 'tool-ip-inspector',
    name: 'Public IP & Geo Inspector',
    description:
      'Inspect public IPv4/IPv6, ISP provider, Geo-location, browser capabilities, and WebRTC leak test.',
    category: 'network',
    icon: 'speed',
    tags: ['ip', 'geo', 'isp', 'webrtc'],
    route: '/ip-inspector',
    status: 'coming-soon',
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
    route: '/youtube-downloader',
    status: 'ready',
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
    route: '/markdown-studio',
    status: 'coming-soon',
  },
  {
    id: 'tool-qr-studio',
    name: 'QR Code Studio',
    description:
      'Create customized QR codes with logos, colors, gradients and scan QR codes with webcam.',
    category: 'text',
    icon: 'text',
    tags: ['qr', 'qrcode', 'scanner', 'generator'],
    route: '/qr-studio',
    status: 'coming-soon',
  },
];
