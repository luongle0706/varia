/**
 * Main Content Script Router
 * Dispatches domain-specific feature scripts based on the active website.
 */

import { initXShareInjector } from '../features/link-converter/content/xShareInjector';

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

  // Future feature hooks can be added here (e.g. YouTube IDM sniffer, Reddit converter)
}

// Execute routing
routeContentFeatures();
