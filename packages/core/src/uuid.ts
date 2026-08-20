/**
 * UUID Utility supporting both UUID v4 (Random) and UUID v7 (Timestamp-ordered RFC 9562)
 */

export interface UuidOptions {
  uppercase?: boolean;
  hyphens?: boolean;
  quantity?: number;
}

/**
 * Generate a standard RFC 4122 Version 4 (Random) UUID
 */
export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant 10xx
  return bytesToUuid(bytes);
}

/**
 * Generate an RFC 9562 Version 7 (Time-Ordered) UUID
 * First 48 bits: Unix timestamp in milliseconds
 * Next 16 bits: Version 7 (0111) + random sub-millisecond precision
 * Last 64 bits: Variant + random
 */
export function generateUuidV7(timestampMs = Date.now()): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit timestamp
  const tsHigh = Math.floor(timestampMs / 0x100000000);
  const tsLow = timestampMs % 0x100000000;

  bytes[0] = (tsHigh >>> 8) & 0xff;
  bytes[1] = tsHigh & 0xff;
  bytes[2] = (tsLow >>> 24) & 0xff;
  bytes[3] = (tsLow >>> 16) & 0xff;
  bytes[4] = (tsLow >>> 8) & 0xff;
  bytes[5] = tsLow & 0xff;

  // Version 7
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  // Variant 10xx
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

/**
 * Format raw 16-byte buffer to standard UUID hex string
 */
function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Bulk generate UUIDs with formatting options
 */
export function generateBatchUuids(version: 'v4' | 'v7', options: UuidOptions = {}): string[] {
  const { uppercase = false, hyphens = true, quantity = 1 } = options;
  const clampedQty = Math.max(1, Math.min(quantity, 1000));
  const results: string[] = [];

  for (let i = 0; i < clampedQty; i++) {
    let id = version === 'v7' ? generateUuidV7() : generateUuidV4();
    if (!hyphens) {
      id = id.replace(/-/g, '');
    }
    if (uppercase) {
      id = id.toUpperCase();
    }
    results.push(id);
  }

  return results;
}

/**
 * Validate UUID format and detect version
 */
export function validateUuid(uuid: string): { isValid: boolean; version?: number } {
  const normalized = uuid.trim().toLowerCase();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const match = normalized.match(uuidRegex);

  if (!match) {
    return { isValid: false };
  }

  return {
    isValid: true,
    version: parseInt(match[1]!, 10),
  };
}
