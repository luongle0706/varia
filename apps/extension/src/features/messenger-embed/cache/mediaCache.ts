import { MediaEmbedPayload } from '../types';
import { STORAGE_KEY_MEDIA_CACHE, CACHE_MAX_ENTRIES, CACHE_TTL_MS } from '../defaults';

export interface SerializedCache {
  version: number;
  entries: Record<string, MediaEmbedPayload>;
}

export class MediaCacheManager {
  // Tier 1: In-Memory RAM Cache (Instant 0ms latency for chat switching)
  private memoryCache = new Map<string, MediaEmbedPayload>();
  private isStorageLoaded = false;

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    if (this.isStorageLoaded) return;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get(STORAGE_KEY_MEDIA_CACHE);
        const cached = result[STORAGE_KEY_MEDIA_CACHE] as SerializedCache | undefined;
        if (cached && cached.entries) {
          const now = Date.now();
          for (const [key, payload] of Object.entries(cached.entries)) {
            // Check TTL
            if (now - payload.timestampMs < CACHE_TTL_MS) {
              this.memoryCache.set(key, payload);
            }
          }
        }
      }
    } catch {
      // Fallback to in-memory only
    }
    this.isStorageLoaded = true;
  }

  /**
   * Get cached media payload (Checks RAM first, then storage)
   */
  public async get(urlKey: string): Promise<MediaEmbedPayload | null> {
    const normalizedKey = this.normalizeKey(urlKey);

    // 1. Check RAM Cache (0ms)
    const inMem = this.memoryCache.get(normalizedKey);
    if (inMem) {
      if (Date.now() - inMem.timestampMs < CACHE_TTL_MS) {
        return inMem;
      }
      this.memoryCache.delete(normalizedKey);
    }

    // 2. Check Disk Cache
    await this.initStorage();
    const diskItem = this.memoryCache.get(normalizedKey);
    if (diskItem && Date.now() - diskItem.timestampMs < CACHE_TTL_MS) {
      return diskItem;
    }

    return null;
  }

  /**
   * Store media payload in RAM and Disk with LRU eviction
   */
  public async set(urlKey: string, payload: MediaEmbedPayload): Promise<void> {
    const normalizedKey = this.normalizeKey(urlKey);
    payload.timestampMs = payload.timestampMs ?? Date.now();

    // 1. Set RAM Cache
    this.memoryCache.set(normalizedKey, payload);

    // 2. LRU Eviction if over limit
    if (this.memoryCache.size > CACHE_MAX_ENTRIES) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    // 3. Persist to Disk Storage
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const serialized: SerializedCache = {
          version: 1,
          entries: Object.fromEntries(this.memoryCache.entries()),
        };
        await chrome.storage.local.set({ [STORAGE_KEY_MEDIA_CACHE]: serialized });
      }
    } catch {
      // Ignore storage persistence errors
    }
  }

  /**
   * Clear all cached media payloads
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.remove(STORAGE_KEY_MEDIA_CACHE);
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getCacheSize(): number {
    return this.memoryCache.size;
  }

  private normalizeKey(url: string): string {
    return url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export const mediaCache = new MediaCacheManager();
