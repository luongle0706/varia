/**
 * Lightweight Floating Toast Notification for Injected Content Scripts
 */

export function showToast(message: string, durationMs = 2500): void {
  // Remove existing toast if any
  const existing = document.getElementById('varia-extension-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'varia-extension-toast';
  toast.setAttribute(
    'style',
    `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background-color: #1d9bf0;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 4px;
    font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 15px;
    line-height: 20px;
    font-weight: 400;
    text-align: center;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;
    z-index: 2147483647;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  `,
  );

  toast.innerHTML = `<span>${message}</span>`;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Hide & cleanup
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, durationMs);
}
