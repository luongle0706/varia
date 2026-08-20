import { describe, it, expect } from 'vitest';
import { hashText } from '../src/hash';

describe('Hash Utilities', () => {
  it('should generate correct SHA-256 hash', async () => {
    const hash = await hashText('hello varia', 'SHA-256');
    expect(hash.length).toBe(64);
  });

  it('should generate correct MD5 hash', async () => {
    const hash = await hashText('hello', 'MD5');
    expect(hash).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});
