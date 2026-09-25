import { SafeObserver } from '../../../core/dom/safeObserver';
import { StorageEngine } from '../../../core/storage/storageEngine';
import { showToast } from '../../../core/dom/toast';
import { DEFAULT_LINK_CONVERTER_CONFIG, STORAGE_KEY_LINK_CONVERTER } from '../defaults';
import { LinkConverterConfig } from '../types';
import { convertUrl } from '../urlConverter';

let cachedConfig: LinkConverterConfig = { ...DEFAULT_LINK_CONVERTER_CONFIG };

function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  return Promise.resolve();
}

function extractCurrentTweetUrl(): string {
  // 1. Try to find the specific tweet article with an active/expanded menu or focused element
  const activeArticle =
    (document.querySelector(
      'article[data-testid="tweet"]:has(button[aria-expanded="true"])',
    ) as HTMLElement | null) ||
    (document.activeElement?.closest('article[data-testid="tweet"]') as HTMLElement | null) ||
    (document.querySelector('article[data-testid="tweet"]:hover') as HTMLElement | null);

  if (activeArticle) {
    const timeLink = activeArticle.querySelector('time')?.closest('a') as HTMLAnchorElement | null;
    if (timeLink && timeLink.href) {
      return timeLink.href;
    }
  }

  // 2. Fall back to current window location (e.g. standalone status page or photo viewer)
  return window.location.href;
}

function dismissTwitterDropdown(menu: HTMLElement): void {
  // Locate the specific dropdown overlay layer under #layers
  const layers = document.getElementById('layers');
  let dropdownLayer: HTMLElement | null = menu;

  while (
    dropdownLayer &&
    dropdownLayer.parentElement &&
    dropdownLayer.parentElement !== layers &&
    dropdownLayer.parentElement !== document.body
  ) {
    dropdownLayer = dropdownLayer.parentElement;
  }

  // If found within #layers, dismiss specifically within this dropdown layer
  if (dropdownLayer && dropdownLayer !== layers && dropdownLayer !== document.body) {
    const dropdownMask = dropdownLayer.querySelector('[data-testid="mask"]') as HTMLElement | null;
    if (dropdownMask) {
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
        dropdownMask.dispatchEvent(
          new MouseEvent(type, { bubbles: true, cancelable: true, view: window }),
        );
      });
    }

    // Fallback: Ensure dropdown container is removed if React does not unmount it immediately
    setTimeout(() => {
      if (document.body.contains(menu)) {
        if (dropdownLayer && dropdownLayer.parentElement) {
          dropdownLayer.remove();
        } else {
          menu.remove();
        }
      }
    }, 60);
    return;
  }

  // Fallback: If not inside #layers, remove menu directly
  menu.remove();
}

function injectEmbedOptionIntoMenu(menu: HTMLElement): void {
  if (!cachedConfig.enabled || !cachedConfig.showInShareMenu) return;
  if (menu.querySelector('[data-varia-embed-btn="true"]')) return;

  // Find all menu items
  const items = Array.from(menu.querySelectorAll('div[role="menuitem"], [role="menuitem"]'));

  // Find the native "Copy link" item
  const copyLinkItem = (items.find(item => {
    const text = item.textContent?.toLowerCase() || '';
    return (
      text.includes('copy link') ||
      text.includes('sao chép liên kết') ||
      text.includes('link') ||
      text.includes('liên kết') ||
      text.includes('コピー') ||
      text.includes('copiar')
    );
  }) || items[0]) as HTMLElement | undefined;

  if (!copyLinkItem || !copyLinkItem.parentElement) return;

  // Clone native item to preserve all styles, theme colors, hover effects, and transitions
  const embedItem = copyLinkItem.cloneNode(true) as HTMLElement;
  embedItem.setAttribute('data-varia-embed-btn', 'true');
  embedItem.setAttribute('id', 'varia-x-copy-embed-item');

  // Format label text
  const spans = embedItem.querySelectorAll('span');
  if (spans.length > 0) {
    const textSpan = Array.from(spans).reverse().find(s => s.textContent?.trim().length);
    if (textSpan) {
      textSpan.textContent = 'Copy embed link';
    } else {
      spans[spans.length - 1]!.textContent = 'Copy embed link';
    }
  }

  // Handle click on our injected embed button
  embedItem.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const rawTweetUrl = extractCurrentTweetUrl();
      const result = convertUrl(rawTweetUrl, cachedConfig);

      await copyTextToClipboard(result.converted);

      if (cachedConfig.showToast) {
        showToast(
          result.engine ? `Copied embed link` : 'Copied embed link to clipboard',
        );
      }

      // Close Twitter's dropdown menu safely without closing the modal
      dismissTwitterDropdown(menu);
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

  // 2. Start high-performance observer targeted strictly at Twitter's modal portal layer (#layers)
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
