import { SafeObserver } from '../../../core/dom/safeObserver';
import { StorageEngine } from '../../../core/storage/storageEngine';
import { DEFAULT_LINK_CONVERTER_CONFIG, STORAGE_KEY_LINK_CONVERTER } from '../defaults';
import { LinkConverterConfig } from '../types';
import { convertUrl, extractHost, formatYouTubeUrl, extractYouTubeId } from '../urlConverter';

let cachedConfig: LinkConverterConfig = { ...DEFAULT_LINK_CONVERTER_CONFIG };

function getYouTubePresetEngine(): string {
  const ytPreset = cachedConfig.platforms.find(p => p.id === 'youtube');
  return ytPreset?.selectedEngine || 'https://youtu.be';
}

function getYouTubeMenuLabels(): { standard: string; withTime: string } {
  const engine = getYouTubePresetEngine();
  const host = extractHost(engine);

  if (host === 'youtu.be') {
    return {
      standard: 'Copy shortened link',
      withTime: 'Copy shortened link at current time',
    };
  }
  if (host.includes('youtube.com')) {
    return {
      standard: 'Copy clean link',
      withTime: 'Copy clean link at current time',
    };
  }
  return {
    standard: 'Copy embed link',
    withTime: 'Copy embed link at current time',
  };
}

/**
 * Native YouTube Center-Screen Bezel Feedback Indicator (Link Icon)
 */
function showYouTubeBezelFeedback(): void {
  const player = document.querySelector('.html5-video-player, #movie_player') as HTMLElement | null;
  const container = player || document.body;

  // Remove existing bezel if any
  const existing = container.querySelector('#varia-yt-bezel-indicator');
  if (existing) {
    existing.remove();
  }

  const bezel = document.createElement('div');
  bezel.id = 'varia-yt-bezel-indicator';
  bezel.setAttribute(
    'style',
    `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(28, 28, 28, 0.88);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease-out, transform 0.15s ease-out;
  `,
  );

  // SVG Link Icon matching YouTube's native link indicator
  bezel.innerHTML = `
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  `;

  container.appendChild(bezel);

  // Animate in
  requestAnimationFrame(() => {
    bezel.style.opacity = '1';
    bezel.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Animate out & remove
  setTimeout(() => {
    bezel.style.opacity = '0';
    bezel.style.transform = 'translate(-50%, -50%) scale(1.15)';
    setTimeout(() => bezel.remove(), 250);
  }, 700);
}

function dismissYouTubeContextMenu(menu: HTMLElement): void {
  // 1. Hide context menu container
  const popup = menu.closest('.ytp-popup, .ytp-contextmenu') as HTMLElement | null;
  if (popup) {
    popup.style.display = 'none';
  }

  // 2. Dispatch Escape key event
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

  // 3. Reset focus
  const player = document.querySelector('.html5-video-player, #movie_player') as HTMLElement | null;
  if (player) {
    player.focus();
  }
}

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

function injectYouTubePlayerContextMenu(menu: HTMLElement): void {
  if (!cachedConfig.enabled) return;
  if (menu.querySelector('[data-varia-yt-btn="true"]')) return;

  // Find native menu items inside .ytp-panel-menu
  const menuItems = Array.from(menu.querySelectorAll('.ytp-menuitem'));
  const copyUrlItem = menuItems.find(item => {
    const label = item.querySelector('.ytp-menuitem-label')?.textContent?.toLowerCase() || '';
    return (
      label.includes('copy video url') ||
      label.includes('sao chép url') ||
      label.includes('copy url')
    );
  }) as HTMLElement | undefined;

  if (!copyUrlItem || !copyUrlItem.parentElement) return;

  const labels = getYouTubeMenuLabels();
  const selectedEngine = getYouTubePresetEngine();

  // 1. Standard Link Item
  const embedItem = copyUrlItem.cloneNode(true) as HTMLElement;
  embedItem.setAttribute('data-varia-yt-btn', 'true');
  embedItem.setAttribute('id', 'varia-yt-copy-embed-item');

  const labelEl = embedItem.querySelector('.ytp-menuitem-label');
  if (labelEl) {
    labelEl.textContent = labels.standard;
  }

  embedItem.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const currentUrl = window.location.href;
      const result = convertUrl(currentUrl, cachedConfig);
      await copyTextToClipboard(result.converted);

      dismissYouTubeContextMenu(menu);
      if (cachedConfig.showToast) {
        showYouTubeBezelFeedback();
      }
    } catch (err) {
      console.error('[Varia Extension] Failed to copy YouTube link:', err);
    }
  });

  // 2. Link at Current Time Item
  const timeItem = copyUrlItem.cloneNode(true) as HTMLElement;
  timeItem.setAttribute('data-varia-yt-btn', 'true');
  timeItem.setAttribute('id', 'varia-yt-copy-time-item');

  const timeLabelEl = timeItem.querySelector('.ytp-menuitem-label');
  if (timeLabelEl) {
    timeLabelEl.textContent = labels.withTime;
  }

  timeItem.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const currentUrl = window.location.href;
      const video = document.querySelector('video') as HTMLVideoElement | null;
      const seconds = video ? Math.floor(video.currentTime) : null;
      const videoId = extractYouTubeId(currentUrl);

      const finalUrl = videoId
        ? formatYouTubeUrl(videoId, selectedEngine, seconds !== null ? `${seconds}s` : null)
        : convertUrl(currentUrl, cachedConfig).converted;

      await copyTextToClipboard(finalUrl);

      dismissYouTubeContextMenu(menu);
      if (cachedConfig.showToast) {
        showYouTubeBezelFeedback();
      }
    } catch (err) {
      console.error('[Varia Extension] Failed to copy YouTube link with time:', err);
    }
  });

  // Insert both items directly after "Copy video URL"
  copyUrlItem.parentElement.insertBefore(timeItem, copyUrlItem.nextSibling);
  copyUrlItem.parentElement.insertBefore(embedItem, timeItem);
}

/**
 * Clean up playlist parameters from YouTube Share Modal input
 */
function handleYouTubeShareModal(panel: HTMLElement): void {
  if (!cachedConfig.enabled) return;

  const urlInput = panel.querySelector(
    'input#share-url, input.style-scope.yt-copy-link-renderer',
  ) as HTMLInputElement | null;
  if (urlInput && urlInput.value) {
    const result = convertUrl(urlInput.value, cachedConfig);
    if (result.matched && result.converted !== urlInput.value) {
      urlInput.value = result.converted;
    }
  }
}

/**
 * Initialize YouTube Context Menu & Share Modal Injector
 */
export function initYouTubeInjector(): void {
  // 1. Sync stored configurations
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

  // 2. High-performance observer on YouTube video player context menu
  const menuObserver = new SafeObserver({
    containerSelector: '.html5-video-player, #movie_player, ytd-app, body',
    targetSelector: '.ytp-contextmenu .ytp-panel-menu, .ytp-popup.ytp-contextmenu',
    onTargetFound: el => {
      const panelMenu = el.classList.contains('ytp-panel-menu')
        ? el
        : el.querySelector('.ytp-panel-menu');
      if (panelMenu) {
        injectYouTubePlayerContextMenu(panelMenu as HTMLElement);
      }
    },
    debounceMs: 10,
  });

  menuObserver.start();

  // 3. Observer on YouTube Share Modal
  const shareObserver = new SafeObserver({
    containerSelector: 'ytd-popup-container, ytd-app, body',
    targetSelector: 'ytd-unified-share-panel-renderer, ytd-share-target-renderer',
    onTargetFound: panel => {
      handleYouTubeShareModal(panel);
    },
    debounceMs: 50,
  });

  shareObserver.start();
}
