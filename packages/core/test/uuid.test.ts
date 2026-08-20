import { describe, it, expect } from 'vitest';
import { generateUuidV4, generateUuidV7, validateUuid, generateBatchUuids } from '../src/uuid';

describe('UUID Utilities', () => {
  it('should generate a valid UUID v4', () => {
    const id = generateUuidV4();
    const validation = validateUuid(id);
    expect(validation.isValid).toBe(true);
    expect(validation.version).toBe(4);
  });

  it('should generate a valid UUID v7 (time-ordered)', () => {
    const id = generateUuidV7();
    const validation = validateUuid(id);
    expect(validation.isValid).toBe(true);
    expect(validation.version).toBe(7);
  });

  it('should generate time-ordered sequence in UUID v7', () => {
    const id1 = generateUuidV7(1000);
    const id2 = generateUuidV7(2000);
    expect(id1 < id2).toBe(true);
  });

  it('should batch generate formatted UUIDs', () => {
    const list = generateBatchUuids('v4', { quantity: 5, uppercase: true, hyphens: false });
    expect(list.length).toBe(5);
    list.forEach(id => {
      expect(id).toMatch(/^[0-9A-F]{32}$/);
    });
  });
});
