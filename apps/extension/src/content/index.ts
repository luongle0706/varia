/**
 * Main Content Script Router
 * Dispatches domain-specific feature scripts based on the active website.
 */

import { initXShareInjector } from '../features/link-converter/content/xShareInjector';
import { initYouTubeInjector } from '../features/link-converter/content/youtubeInjector';
import { initMessengerEmbedInjector } from '../features/messenger-embed/content/messengerInjector';

function routeContentFeatures(): void {
  const hostname = window.location.hostname.toLowerCase();

  // 1. 𝕏 (Twitter) Feature Hook
  if (
    hostname === 'x.com' ||
    hostname === 'twitter.com' ||
    hostname.endsWith('.x.com') ||
    hostname.endsWith('.twitter.com')
  ) {
    initXShareInjector();
  }

  // 2. YouTube Feature Hook (Player context menu & Share dialog clean link)
  if (
    hostname === 'youtube.com' ||
    hostname === 'youtu.be' ||
    hostname.endsWith('.youtube.com') ||
    hostname.endsWith('.youtu.be')
  ) {
    initYouTubeInjector();
  }

  // 3. Meta Messenger Feature Hook (Inline Rich Media Embeds)
  if (
    hostname === 'messenger.com' ||
    hostname === 'facebook.com' ||
    hostname.endsWith('.messenger.com') ||
    hostname.endsWith('.facebook.com')
  ) {
    initMessengerEmbedInjector();
  }
}

// Execute routing
routeContentFeatures();
