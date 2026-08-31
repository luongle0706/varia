/**
 * Main Background Service Worker
 * Initializes all registered background feature handlers.
 */

import { initLinkConverterBackground } from '../features/link-converter/background/linkConverterBackground';
import { initMediaResolverBackgroundListener } from '../features/messenger-embed/background/mediaResolverWorker';

// Initialize Feature Background Workers
initLinkConverterBackground();
initMediaResolverBackgroundListener();

console.log('[Varia Extension] Background Service Worker Initialized.');

