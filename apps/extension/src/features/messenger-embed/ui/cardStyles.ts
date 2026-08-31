/**
 * Scoped CSS styles for Messenger embedded media cards
 * Ensures zero style pollution into Messenger host DOM.
 */

export const EMBED_CARD_STYLES = `
.varia-embed-container {
  display: block;
  margin-top: 8px;
  margin-bottom: 4px;
  width: 100%;
  max-width: 420px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.varia-embed-card {
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}

.varia-embed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(24, 24, 27, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  user-select: none;
}

.varia-embed-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.varia-embed-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #f4f4f5;
  white-space: nowrap;
}

.varia-embed-badge-youtube { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.varia-embed-badge-x { background: rgba(255, 255, 255, 0.15); color: #ffffff; }
.varia-embed-badge-instagram { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
.varia-embed-badge-facebook { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.varia-embed-badge-tiktok { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }

.varia-embed-title {
  font-size: 12px;
  font-weight: 500;
  color: #d4d4d8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.varia-embed-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.varia-embed-btn {
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.varia-embed-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.varia-embed-body {
  position: relative;
  width: 100%;
  background: #09090b;
  overflow: hidden;
}

.varia-embed-body.collapsed {
  display: none;
}

.varia-embed-description {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.45;
  color: #f4f4f5;
  background: #18181b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  word-break: break-word;
  white-space: pre-wrap;
}

.varia-embed-video-container {
  position: relative;
  width: 100%;
  max-height: 480px;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.varia-embed-video {
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  outline: none;
}

.varia-embed-iframe {
  width: 100%;
  height: 340px;
  border: none;
  display: block;
}

.varia-embed-iframe-short {
  height: 480px;
}

.varia-embed-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  display: block;
}

.varia-embed-gallery {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px;
  scroll-snap-type: x mandatory;
}

.varia-embed-gallery-img {
  flex: 0 0 auto;
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
  scroll-snap-align: start;
}
`;
