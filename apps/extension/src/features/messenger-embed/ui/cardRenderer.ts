import { MediaEmbedPayload, MessengerEmbedConfig, FetchMediaBlobResponse } from '../types';
import { EMBED_CARD_STYLES } from './cardStyles';

const STYLESHEET_ID = 'varia-messenger-embed-styles';
const EVENT_VIDEO_PLAY = 'varia-media-play-event';

/**
 * Injects the scoped stylesheet once into document head
 */
export function ensureEmbedStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (!document.getElementById(STYLESHEET_ID)) {
    const style = document.createElement('style');
    style.id = STYLESHEET_ID;
    style.textContent = EMBED_CARD_STYLES;
    document.head.appendChild(style);
  }
}

/**
 * Creates an interactive DOM card element for a resolved media embed
 */
export function createMediaEmbedCard(
  payload: MediaEmbedPayload,
  config?: MessengerEmbedConfig,
): HTMLElement {
  ensureEmbedStylesInjected();

  const container = document.createElement('div');
  container.className = 'varia-embed-container';
  container.setAttribute('data-varia-embed-id', payload.id);

  const card = document.createElement('div');
  card.className = 'varia-embed-card';

  // 1. Header
  const header = document.createElement('div');
  header.className = 'varia-embed-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'varia-embed-header-left';

  // Badge
  const badge = document.createElement('span');
  badge.className = `varia-embed-badge varia-embed-badge-${getBadgeClass(payload.platform)}`;
  badge.textContent = getPlatformDisplayName(payload.platform);
  headerLeft.appendChild(badge);

  // Title / Author
  const title = document.createElement('span');
  title.className = 'varia-embed-title';
  title.textContent = payload.authorHandle || payload.authorName || payload.title || '';
  title.title = payload.title || payload.originalUrl;
  headerLeft.appendChild(title);

  header.appendChild(headerLeft);

  // Header Actions
  const headerActions = document.createElement('div');
  headerActions.className = 'varia-embed-header-actions';

  // Replay Button (↺)
  const replayBtn = document.createElement('button');
  replayBtn.className = 'varia-embed-btn';
  replayBtn.setAttribute('aria-label', 'Replay media');
  replayBtn.textContent = '↺';
  replayBtn.title = 'Replay / Reload media';

  // Collapse / Expand button
  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'varia-embed-btn';
  collapseBtn.setAttribute('aria-label', 'Collapse or expand media');
  collapseBtn.textContent = '—';
  collapseBtn.title = 'Collapse media';

  // External link button
  const linkBtn = document.createElement('a');
  linkBtn.className = 'varia-embed-btn';
  linkBtn.href = payload.cleanUrl || payload.originalUrl;
  linkBtn.target = '_blank';
  linkBtn.rel = 'noopener noreferrer';
  linkBtn.setAttribute('data-varia-embedded', 'true');
  linkBtn.textContent = '↗';
  linkBtn.title = 'Open original link';

  headerActions.appendChild(replayBtn);
  headerActions.appendChild(collapseBtn);
  headerActions.appendChild(linkBtn);
  header.appendChild(headerActions);
  card.appendChild(header);

  // 2. Post Description (if available)
  if (payload.description && payload.description.trim().length > 0) {
    const descBox = document.createElement('div');
    descBox.className = 'varia-embed-description';
    descBox.textContent = payload.description.trim();
    card.appendChild(descBox);
  }

  // 3. Body
  const body = document.createElement('div');
  body.className = 'varia-embed-body';

  let isCollapsed = config?.autoCollapse ?? false;
  if (isCollapsed) {
    body.classList.add('collapsed');
    collapseBtn.textContent = '+';
    collapseBtn.title = 'Expand media';
  }

  collapseBtn.addEventListener('click', e => {
    e.stopPropagation();
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      body.classList.add('collapsed');
      collapseBtn.textContent = '+';
      collapseBtn.title = 'Expand media';
    } else {
      body.classList.remove('collapsed');
      collapseBtn.textContent = '—';
      collapseBtn.title = 'Collapse media';
    }
  });

  // Replay handler
  replayBtn.addEventListener('click', e => {
    e.stopPropagation();
    const video = body.querySelector<HTMLVideoElement>('video');
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }

    const iframe = body.querySelector<HTMLIFrameElement>('iframe');
    if (iframe && payload.iframeSrc) {
      iframe.src = payload.iframeSrc;
    }
  });

  // Render specific media type
  renderMediaContent(body, payload, config);

  card.appendChild(body);
  container.appendChild(card);

  return container;
}

function renderMediaContent(
  container: HTMLElement,
  payload: MediaEmbedPayload,
  config?: MessengerEmbedConfig,
): void {
  const isMuted = config?.muteByDefault ?? true;

  // 1. Native Video Player with CSP Blob URL streaming
  if (payload.mediaType === 'video' && payload.mediaUrl) {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'varia-embed-video-container';

    const video = document.createElement('video');
    video.className = 'varia-embed-video';
    video.controls = true;
    video.playsInline = true;
    video.loop = true;
    video.muted = isMuted;
    video.preload = 'metadata';

    if (payload.thumbnailUrl) {
      video.poster = payload.thumbnailUrl;
    }

    let activeBlobUrl: string | null = null;

    // Proactively stream media binary via background worker into a CSP-compliant Blob URL
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime
        .sendMessage({
          type: 'VARIA_FETCH_MEDIA_BLOB',
          url: payload.mediaUrl,
        })
        .then((res: FetchMediaBlobResponse) => {
          if (res && res.success && res.chunks && res.chunks.length > 0) {
            const byteArrays: Uint8Array[] = res.chunks.map(chunk => {
              const binaryString = atob(chunk);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes;
            });

            const blob = new Blob(byteArrays as BlobPart[], {
              type: res.mimeType || 'video/mp4',
            });
            if (activeBlobUrl) {
              URL.revokeObjectURL(activeBlobUrl);
            }
            activeBlobUrl = URL.createObjectURL(blob);
            video.src = activeBlobUrl;
            video.play().catch(() => {});
          } else if (res && res.success && res.dataUrl) {
            video.src = res.dataUrl;
            video.play().catch(() => {});
          } else {
            video.src = payload.mediaUrl!;
          }
        })
        .catch(() => {
          video.src = payload.mediaUrl!;
        });
    } else {
      video.src = payload.mediaUrl;
    }

    // Single active video player listener
    const cardId = payload.id;
    video.addEventListener('play', () => {
      document.dispatchEvent(
        new CustomEvent(EVENT_VIDEO_PLAY, { detail: { activeId: cardId } }),
      );
    });

    const pauseOtherVideos = (e: Event) => {
      const custom = e as CustomEvent<{ activeId: string }>;
      if (custom.detail && custom.detail.activeId !== cardId) {
        if (!video.paused) {
          video.pause();
        }
      }
    };
    document.addEventListener(EVENT_VIDEO_PLAY, pauseOtherVideos);

    videoWrapper.appendChild(video);
    container.appendChild(videoWrapper);
    return;
  }

  // 2. Iframe Embed (for YouTube, standard iframes)
  if (payload.mediaType === 'iframe' && payload.iframeSrc) {
    const iframe = document.createElement('iframe');
    iframe.src = payload.iframeSrc;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.className = `varia-embed-iframe ${payload.aspectRatio === '9:16' ? 'varia-embed-iframe-short' : ''}`;
    container.appendChild(iframe);
    return;
  }

  // 3. Multi-image Gallery
  if (payload.mediaType === 'gallery' && payload.images && payload.images.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'varia-embed-gallery';

    payload.images.forEach(imgUrl => {
      const img = document.createElement('img');
      img.className = 'varia-embed-gallery-img';
      img.src = imgUrl;
      img.referrerPolicy = 'no-referrer';
      img.loading = 'lazy';
      gallery.appendChild(img);
    });

    container.appendChild(gallery);
    return;
  }

  // 4. Single Image
  if (payload.mediaUrl || payload.thumbnailUrl) {
    const img = document.createElement('img');
    img.className = 'varia-embed-img';
    img.src = (payload.mediaUrl || payload.thumbnailUrl)!;
    img.referrerPolicy = 'no-referrer';
    img.loading = 'lazy';
    img.alt = payload.title || 'Image';

    container.appendChild(img);
    return;
  }
}

function getBadgeClass(platform: string): string {
  switch (platform) {
    case 'youtube':
      return 'youtube';
    case 'x-twitter':
      return 'x';
    case 'instagram':
      return 'instagram';
    case 'facebook':
      return 'facebook';
    case 'tiktok':
      return 'tiktok';
    default:
      return 'badge';
  }
}

function getPlatformDisplayName(platform: string): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'x-twitter':
      return '𝕏 Post';
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'tiktok':
      return 'TikTok';
    default:
      return 'Media';
  }
}
