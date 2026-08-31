import {
  ResolveMediaMessage,
  ClearMediaCacheMessage,
  FetchMediaBlobMessage,
  ResolveMediaResponse,
  FetchMediaBlobResponse,
} from '../types';
import { mediaCache } from '../cache/mediaCache';
import { resolveMediaEmbed } from '../resolvers';
import { DEFAULT_MESSENGER_EMBED_CONFIG, STORAGE_KEY_MESSENGER_EMBED } from '../defaults';

/**
 * Handle background media resolution and binary fetch requests
 */
export function initMediaResolverBackgroundListener(): void {
  if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== 'object') return false;

    // 1. Resolve Media
    if ((message as ResolveMediaMessage).type === 'VARIA_RESOLVE_MEDIA') {
      const { url } = message as ResolveMediaMessage;
      handleResolveMedia(url)
        .then(res => sendResponse(res))
        .catch(err => {
          sendResponse({
            success: false,
            error: err instanceof Error ? err.message : 'Unknown resolution error',
          });
        });
      return true; // Keep message channel open for async response
    }

    // 2. Clear Cache
    if ((message as ClearMediaCacheMessage).type === 'VARIA_CLEAR_MEDIA_CACHE') {
      mediaCache
        .clear()
        .then(() => sendResponse({ success: true }))
        .catch(err =>
          sendResponse({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to clear cache',
          }),
        );
      return true;
    }

    // 3. Fetch Media Stream / Blob (Bypasses Host Page CSP & CDN 403 blocks)
    if ((message as FetchMediaBlobMessage).type === 'VARIA_FETCH_MEDIA_BLOB') {
      const { url } = message as FetchMediaBlobMessage;
      handleFetchMediaBlob(url)
        .then(res => sendResponse(res))
        .catch(err => {
          sendResponse({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to fetch media stream',
          });
        });
      return true;
    }

    return false;
  });
}

async function handleResolveMedia(url: string): Promise<ResolveMediaResponse> {
  if (!url) {
    return { success: false, error: 'Empty URL provided' };
  }

  // Load config to enforce enabled/disabled platforms
  let config = DEFAULT_MESSENGER_EMBED_CONFIG;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const stored = await chrome.storage.local.get(STORAGE_KEY_MESSENGER_EMBED);
      if (stored[STORAGE_KEY_MESSENGER_EMBED]) {
        config = {
          ...DEFAULT_MESSENGER_EMBED_CONFIG,
          ...stored[STORAGE_KEY_MESSENGER_EMBED],
        };
      }
    }
  } catch {
    // Use defaults
  }

  if (!config.enabled) {
    return { success: false, error: 'Messenger embed feature is disabled' };
  }

  // 1. Check Cache
  const cached = await mediaCache.get(url);
  if (cached) {
    return { success: true, data: cached };
  }

  // 2. Resolve via Platform Extractors with config
  const payload = await resolveMediaEmbed(url, config);
  if (!payload) {
    return { success: false, error: 'Unsupported or unresolvable social media URL' };
  }

  // 3. Store in Cache
  await mediaCache.set(url, payload);

  return { success: true, data: payload };
}

async function handleFetchMediaBlob(url: string): Promise<FetchMediaBlobResponse> {
  if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
    return { success: false, error: 'Invalid or unsupported media URL scheme' };
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: '*/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(20000)
          : undefined,
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status} from media host` };
    }

    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'video/mp4';
    const bytes = new Uint8Array(buffer);
    const totalSize = bytes.byteLength;

    // Split into safe 1MB Base64 chunks to avoid IPC message length caps
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const chunks: string[] = [];

    for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
      const slice = bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, totalSize));
      chunks.push(uint8ArrayToBase64(slice));
    }

    return {
      success: true,
      chunks,
      mimeType,
      totalSize,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB inner batch
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}
