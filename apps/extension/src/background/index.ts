/**
 * Main Background Service Worker
 * Initializes all registered background feature handlers.
 */

import { initLinkConverterBackground } from '../features/link-converter/background/linkConverterBackground';

// Initialize Feature Background Workers
initLinkConverterBackground();

console.log('[Varia Extension] Background Service Worker Initialized.');
