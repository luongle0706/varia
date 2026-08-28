/**
 * Type-safe Storage Engine for Chrome Extension
 * Supports chrome.storage.sync / local with fallback for web dev mode.
 */

export class StorageEngine {
  /**
   * Get an item from chrome.storage
   */
  static async get<T>(key: string, defaultValue: T): Promise<T> {
    if (typeof chrome !== 'undefined' && chrome?.storage?.sync) {
      try {
        const result = await chrome.storage.sync.get([key]);
        if (result[key] !== undefined) {
          return result[key] as T;
        }
      } catch (err) {
        console.warn(`[StorageEngine] Failed to read "${key}" from chrome.storage.sync:`, err);
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`varia_ext_${key}`);
        if (raw !== null) {
          return JSON.parse(raw) as T;
        }
      } catch (err) {
        console.warn(`[StorageEngine] Failed to read "${key}" from localStorage:`, err);
      }
    }
    return defaultValue;
  }

  /**
   * Set an item in chrome.storage
   */
  static async set<T>(key: string, value: T): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome?.storage?.sync) {
      try {
        await chrome.storage.sync.set({ [key]: value });
        return;
      } catch (err) {
        console.warn(`[StorageEngine] Failed to save "${key}" to chrome.storage.sync:`, err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`varia_ext_${key}`, JSON.stringify(value));
      } catch (err) {
        console.warn(`[StorageEngine] Failed to save "${key}" to localStorage:`, err);
      }
    }
  }

  /**
   * Subscribe to changes for a specific storage key
   */
  static subscribe<T>(key: string, callback: (newValue: T, oldValue?: T) => void): () => void {
    if (typeof chrome !== 'undefined' && chrome?.storage?.onChanged) {
      const listener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string,
      ) => {
        if (areaName === 'sync' && changes[key]) {
          callback(changes[key].newValue as T, changes[key].oldValue as T);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }

    // Fallback window storage event
    if (typeof window !== 'undefined') {
      const listener = (e: StorageEvent) => {
        if (e.key === `varia_ext_${key}` && e.newValue !== null) {
          try {
            callback(
              JSON.parse(e.newValue) as T,
              e.oldValue ? (JSON.parse(e.oldValue) as T) : undefined,
            );
          } catch {
            // Ignore parse errors
          }
        }
      };
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    }

    return () => {};
  }
}
