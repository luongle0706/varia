import { SafeObserver } from '../../../core/dom/safeObserver';
import { StorageEngine } from '../../../core/storage/storageEngine';
import { DEFAULT_LINK_CONVERTER_CONFIG, STORAGE_KEY_LINK_CONVERTER } from '../defaults';
import { LinkConverterConfig } from '../types';
import { convertUrl } from '../urlConverter';

let cachedConfig: LinkConverterConfig = { ...DEFAULT_LINK_CONVERTER_CONFIG };
let lastClickedShareTweetUrl: string | null = null;
let lastClickedTweetArticle: HTMLElement | null = null;

// Track which tweet share button was clicked on the timeline
function setupShareClickTracker(): void {
  document.addEventListener(
    'pointerdown',
    e => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or parent is the share button
      const shareBtn = target.closest(
        'button[data-testid="share"], [aria-label*="Share"], [aria-label*="share"]',
      );
      if (shareBtn) {
        // Find parent tweet article
        const article = shareBtn.closest('article[data-testid="tweet"]') as HTMLElement | null;
        if (article) {
          lastClickedTweetArticle = article;
          const timeLink = article.querySelector('time')?.closest('a') as HTMLAnchorElement | null;
          if (timeLink && timeLink.href) {
            lastClickedShareTweetUrl = timeLink.href;
          }
        }
      }
    },
    { capture: true, passive: true },
  );
}

function extractCurrentTweetUrl(): string {
  // 1. If we captured a specific tweet URL from the share button click on timeline
  if (lastClickedShareTweetUrl) {
    return lastClickedShareTweetUrl;
  }

  // 2. If viewing a standalone tweet status page
  if (window.location.pathname.includes('/status/')) {
    return window.location.href;
  }

  // 3. Fallback: check if an article is currently hovered/focused
  if (lastClickedTweetArticle) {
    const timeLink = lastClickedTweetArticle
      .querySelector('time')
      ?.closest('a') as HTMLAnchorElement | null;
    if (timeLink && timeLink.href) {
      return timeLink.href;
    }
  }

  return window.location.href;
}

function triggerReactClick(element: HTMLElement): boolean {
  try {
    const reactPropsKey = Object.keys(element).find(
      key =>
        key.startsWith('__reactProps$') ||
        key.startsWith('__reactEventHandlers$') ||
        key.startsWith('__reactFiber$'),
    );
    if (reactPropsKey) {
      const props = (element as unknown as Record<string, { onClick?: (e: unknown) => void }>)[
        reactPropsKey
      ];
      if (props?.onClick) {
        props.onClick({ stopPropagation: () => {}, preventDefault: () => {} });
        return true;
      }
    }
  } catch {
    // Ignore error
  }
  return false;
}

function dismissTwitterMenu(nativeItem?: HTMLElement): void {
  // 1. If native item exists, trigger React handler or click to close menu naturally
  if (nativeItem) {
    triggerReactClick(nativeItem);

    // Dispatch mouse events on native item
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
      nativeItem.dispatchEvent(
        new MouseEvent(type, { bubbles: true, cancelable: true, view: window }),
      );
    });
  }

  // 2. Dispatch click/pointer events on the overlay mask inside #layers
  const layers = document.getElementById('layers');
  if (layers) {
    const backdropElements = layers.querySelectorAll(
      '[data-testid="mask"], div[tabindex="-1"], div[aria-hidden="true"]',
    );
    backdropElements.forEach(el => {
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
    });
  }

  // 3. Fallback Escape key event
  ['keydown', 'keyup'].forEach(type => {
    document.dispatchEvent(
      new KeyboardEvent(type, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
      }),
    );
  });

  // 4. Click body
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function injectEmbedOptionIntoMenu(menu: HTMLElement): void {
  if (!cachedConfig.enabled || !cachedConfig.showInShareMenu) return;
  if (menu.querySelector('[data-varia-embed-btn="true"]')) return;

  // Find all menu items
  const items = Array.from(menu.querySelectorAll('div[role="menuitem"], [role="menuitem"]'));

  // Find the native "Copy link" item
  const copyLinkItem = items.find(item => {
    const text = item.textContent?.toLowerCase() || '';
    return text.includes('copy link') || text.includes('sao chép liên kết');
  }) as HTMLElement | undefined;

  if (!copyLinkItem || !copyLinkItem.parentElement) return;

  // Clone native item to preserve all styles, theme colors, hover effects, and transitions
  const embedItem = copyLinkItem.cloneNode(true) as HTMLElement;
  embedItem.setAttribute('data-varia-embed-btn', 'true');
  embedItem.setAttribute('id', 'varia-x-copy-embed-item');

  // Format label text
  const textSpan = embedItem.querySelector('span');
  if (textSpan) {
    textSpan.textContent = 'Copy embed link';
  }

  // Handle click on our injected embed button
  embedItem.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const rawTweetUrl = extractCurrentTweetUrl();
      const result = convertUrl(rawTweetUrl, cachedConfig);

      // Write embed URL to clipboard
      const copyToClipboard = async () => {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(result.converted);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = result.converted;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
      };

      await copyToClipboard();

      // Close Twitter's dropdown menu immediately
      dismissTwitterMenu(copyLinkItem);

      // Ensure our converted URL stays in clipboard even if native item handler ran
      setTimeout(copyToClipboard, 30);
      setTimeout(copyToClipboard, 100);
    } catch (err) {
      console.error('[Varia Extension] Failed to copy embed link:', err);
    }
  });

  // Insert directly after "Copy link"
  copyLinkItem.parentElement.insertBefore(embedItem, copyLinkItem.nextSibling);
}

/**
 * Initialize the X Share Menu Injector
 */
export function initXShareInjector(): void {
  // 1. Load initial config & subscribe to changes
  StorageEngine.get<LinkConverterConfig>(
    STORAGE_KEY_LINK_CONVERTER,
    DEFAULT_LINK_CONVERTER_CONFIG,
  ).then(config => {
    cachedConfig = config;
  });

  StorageEngine.subscribe<LinkConverterConfig>(STORAGE_KEY_LINK_CONVERTER, newConfig => {
    if (newConfig) {
      cachedConfig = newConfig;
    }
  });

  // 2. Setup share button click tracker on feed articles
  setupShareClickTracker();

  // 3. Start high-performance observer targeted at Twitter's modal portal layer (#layers)
  const observer = new SafeObserver({
    containerSelector: '#layers',
    targetSelector: 'div[role="menu"][data-testid="Dropdown"], div[role="menu"]',
    onTargetFound: menu => {
      injectEmbedOptionIntoMenu(menu);
    },
    debounceMs: 10,
  });

  observer.start();
}
