/**
 * IndexedDB Cache Manager for FFmpeg WASM Core Binaries
 */

const DB_NAME = 'varia_wasm_cache';
const DB_VERSION = 1;
const STORE_NAME = 'binaries';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached binary Blob from IndexedDB
 */
export async function getCachedBinary(key: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[Varia:WASM-Cache] Failed to read from IndexedDB cache:', err);
    return null;
  }
}

/**
 * Store binary Blob into IndexedDB
 */
export async function setCachedBinary(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(blob, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[Varia:WASM-Cache] Failed to write binary to IndexedDB cache:', err);
  }
}

/**
 * Fetch and cache URL as a Blob URL, loading from IndexedDB if available
 */
export async function fetchWithCache(
  url: string,
  mimeType: string,
  onProgress?: (received: number, total: number) => void,
): Promise<string> {
  const cachedBlob = await getCachedBinary(url);
  if (cachedBlob) {
    return URL.createObjectURL(cachedBlob);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch WASM asset: ${url} (${response.status} ${response.statusText})`,
    );
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body || total === 0 || !onProgress) {
    const blob = await response.blob();
    await setCachedBinary(url, blob);
    return URL.createObjectURL(blob);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      onProgress(received, total);
    }
  }

  const combinedBlob = new Blob(chunks as unknown as BlobPart[], { type: mimeType });
  await setCachedBinary(url, combinedBlob);
  return URL.createObjectURL(combinedBlob);
}
