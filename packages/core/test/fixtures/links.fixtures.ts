/**
 * Social Links & URL Sanitization Fixtures
 * Contains comprehensive test datasets across social platforms with tracking queries and edge cases.
 */

export interface LinkTestCase {
  category: string;
  input: string;
  expectedNormalized: string;
  expectedVideoId?: string;
  hasTrackingParams: boolean;
}

export const SAMPLE_YOUTUBE_LINKS: Record<string, string> = {
  standardWatch: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  standardWatchWithTracking: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&si=abc123xyz',
  shorts: 'https://www.youtube.com/shorts/3jz1D8S7K10',
  shortsWithTracking: 'https://www.youtube.com/shorts/3jz1D8S7K10?feature=share&si=track987',
  shortlink: 'https://youtu.be/dQw4w9WgXcQ',
  shortlinkTimestamped: 'https://youtu.be/dQw4w9WgXcQ?t=120',
  music: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
  mobile: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
  playlistItem: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123456789&index=1',
};

export const SAMPLE_X_TWITTER_LINKS: Record<string, string> = {
  standardTweet: 'https://x.com/jack/status/20',
  standardTweetWithTracking: 'https://x.com/jack/status/20?s=20&t=abcdef123456',
  legacyTwitter: 'https://twitter.com/OpenAI/status/1780000000000000000',
  legacyTwitterWithTracking: 'https://twitter.com/OpenAI/status/1780000000000000000?ref_src=twsrc%5Etfw',
  mobileX: 'https://mobile.x.com/user/status/123456789',
};

export const SAMPLE_INSTAGRAM_LINKS: Record<string, string> = {
  post: 'https://www.instagram.com/p/C-abc123xyz/',
  postWithTracking: 'https://www.instagram.com/p/C-abc123xyz/?igshid=MzRlODBiNWFlZA==',
  reel: 'https://www.instagram.com/reel/C-xyz987abc/',
  reelWithTracking: 'https://www.instagram.com/reel/C-xyz987abc/?utm_source=ig_web_copy_link',
};

export const SAMPLE_TIKTOK_LINKS: Record<string, string> = {
  standardVideo: 'https://www.tiktok.com/@user/video/7123456789012345678',
  standardVideoWithTracking: 'https://www.tiktok.com/@user/video/7123456789012345678?is_from_webapp=1&sender_device=pc',
  shortlink: 'https://vm.tiktok.com/ZM8abc123/',
};

export const SAMPLE_FACEBOOK_LINKS: Record<string, string> = {
  reel: 'https://www.facebook.com/reel/1234567890123456',
  watch: 'https://www.facebook.com/watch/?v=987654321098765',
  watchWithTracking: 'https://www.facebook.com/watch/?v=987654321098765&ref=sharing&fbclid=IwAR123',
};

export const TRACKING_PARAM_SAMPLES: string[] = [
  'fbclid=IwAR294719247192',
  'igshid=MzRlODBiNWFlZA==',
  'utm_source=twitter',
  'utm_medium=social',
  'utm_campaign=summer_sale',
  'utm_term=memes',
  'utm_content=logolink',
  'ref_src=twsrc%5Etfw',
  'twclid=12345',
  'si=abcdef123456',
  'feature=share',
];

export const INVALID_OR_MALICIOUS_LINKS: string[] = [
  'javascript:alert(1)',
  'file:///etc/passwd',
  'data:text/html,<script>alert("xss")</script>',
  'http://localhost:3000/api/secret',
  'not-a-valid-url',
  '',
  '   ',
  'https://',
];
