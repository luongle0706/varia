import { describe, it, expect } from 'vitest';
import { convertUrl, cleanSearchParams, extractHost } from './urlConverter';
import { DEFAULT_LINK_CONVERTER_CONFIG } from './defaults';

describe('urlConverter', () => {
  describe('extractHost', () => {
    it('extracts clean hostnames', () => {
      expect(extractHost('https://fixupx.com')).toBe('fixupx.com');
      expect(extractHost('fxtwitter.com')).toBe('fxtwitter.com');
      expect(extractHost('https://cunnyx.com/subpath')).toBe('cunnyx.com');
    });
  });

  describe('cleanSearchParams', () => {
    it('removes tracking query parameters', () => {
      const params = new URLSearchParams('id=123&s=20&t=abcdef&utm_source=twitter&valid=true');
      cleanSearchParams(params);
      expect(params.get('id')).toBe('123');
      expect(params.get('valid')).toBe('true');
      expect(params.has('s')).toBe(false);
      expect(params.has('t')).toBe(false);
      expect(params.has('utm_source')).toBe(false);
    });
  });

  describe('convertUrl', () => {
    it('converts X post link to fixupx.com by default and strips tracking', () => {
      const input = 'https://x.com/k_skxz/status/1895000000000000000?s=20&t=xyz';
      const result = convertUrl(input, DEFAULT_LINK_CONVERTER_CONFIG);

      expect(result.matched).toBe(true);
      expect(result.converted).toBe('https://fixupx.com/k_skxz/status/1895000000000000000');
      expect(result.engine).toBe('fixupx.com');
    });

    it('converts twitter.com to custom engine like cunnyx.com', () => {
      const customConfig = {
        ...DEFAULT_LINK_CONVERTER_CONFIG,
        xEngine: 'https://cunnyx.com',
      };
      const input = 'https://twitter.com/elonmusk/status/123456789';
      const result = convertUrl(input, customConfig);

      expect(result.matched).toBe(true);
      expect(result.converted).toBe('https://cunnyx.com/elonmusk/status/123456789');
      expect(result.engine).toBe('cunnyx.com');
    });

    it('converts reddit and instagram links using presets', () => {
      const redditUrl = 'https://www.reddit.com/r/webdev/comments/12345/cool_post/';
      const igUrl = 'https://www.instagram.com/p/Cxyz12345/';

      const redditResult = convertUrl(redditUrl, DEFAULT_LINK_CONVERTER_CONFIG);
      expect(redditResult.matched).toBe(true);
      expect(redditResult.converted).toBe('https://rxddit.com/r/webdev/comments/12345/cool_post/');

      const igResult = convertUrl(igUrl, DEFAULT_LINK_CONVERTER_CONFIG);
      expect(igResult.matched).toBe(true);
      expect(igResult.converted).toBe('https://vxinstagram.com/p/Cxyz12345/');
    });

    it('returns unmatched for unknown domains', () => {
      const input = 'https://example.com/some/path';
      const result = convertUrl(input, DEFAULT_LINK_CONVERTER_CONFIG);
      expect(result.matched).toBe(false);
      expect(result.converted).toBe(input);
    });
  });
});
