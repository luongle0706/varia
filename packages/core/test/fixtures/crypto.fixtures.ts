/**
 * Cryptographic & Identifier Test Vectors
 * Provides standard NIST/RFC test vectors for MD5, SHA, UUID, and JWT inspection.
 */

export interface HashTestVector {
  input: string;
  expectedMd5: string;
  expectedSha1: string;
  expectedSha256: string;
  expectedSha512: string;
}

export const HASH_TEST_VECTORS: {
  empty: HashTestVector;
  abc: HashTestVector;
  quickBrownFox: HashTestVector;
} = {
  empty: {
    input: '',
    expectedMd5: 'd41d8cd98f00b204e9800998ecf8427e',
    expectedSha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    expectedSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expectedSha512:
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
  },
  abc: {
    input: 'abc',
    expectedMd5: '900150983cd24fb0d6963f7d28e17f72',
    expectedSha1: 'a9993e364706816aba3e25717850c26c9cd0d89d',
    expectedSha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    expectedSha512:
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a0ebee7e994a9d816a73c3933c09b673ec56a908',
  },
  quickBrownFox: {
    input: 'The quick brown fox jumps over the lazy dog',
    expectedMd5: '9e107d9d372bb6826bd81d3542a419d6',
    expectedSha1: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12',
    expectedSha256: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    expectedSha512:
      '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6',
  },
};

export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Standard test JWT tokens (Header: { alg: "HS256", typ: "JWT" })
 */
export const SAMPLE_JWT_TOKENS = {
  /**
   * Payload: { sub: "1234567890", name: "John Doe", iat: 1516239022 }
   */
  valid:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  /**
   * Payload: { sub: "1234567890", exp: 1 } (Expired in 1970)
   */
  expired:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.gKkP0v_JtV6K2G2h96R1V9Y0a5LzC8qE_X9j4L6p5jY',
  /**
   * Malformed tokens
   */
  malformedSingleSegment: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  malformedInvalidBase64: 'invalid.base64.token',
};
