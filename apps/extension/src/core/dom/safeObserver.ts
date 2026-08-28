/**
 * High-performance DOM Observer Utility
 * Listens to specific modal/portal layers (e.g. #layers on X) rather than observing document.body.
 */

export interface SafeObserverOptions {
  containerSelector: string;
  targetSelector: string;
  onTargetFound: (element: HTMLElement) => void;
  debounceMs?: number;
}

export class SafeObserver {
  private observer: MutationObserver | null = null;
  private isObserving = false;
  private timeoutId: number | null = null;

  constructor(private options: SafeObserverOptions) {}

  public start(): void {
    if (this.isObserving) return;
    this.isObserving = true;

    const attach = () => {
      const container = document.querySelector(this.options.containerSelector) || document.body;

      // Check if target already exists immediately
      const existing = container.querySelector(this.options.targetSelector);
      if (existing) {
        this.options.onTargetFound(existing as HTMLElement);
      }

      this.observer = new MutationObserver(mutations => {
        let hasRelevantChange = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            hasRelevantChange = true;
            break;
          }
        }

        if (!hasRelevantChange) return;

        if (this.options.debounceMs && this.options.debounceMs > 0) {
          if (this.timeoutId !== null) window.clearTimeout(this.timeoutId);
          this.timeoutId = window.setTimeout(() => {
            const el = container.querySelector(this.options.targetSelector);
            if (el) this.options.onTargetFound(el as HTMLElement);
          }, this.options.debounceMs);
        } else {
          const el = container.querySelector(this.options.targetSelector);
          if (el) this.options.onTargetFound(el as HTMLElement);
        }
      });

      this.observer.observe(container, {
        childList: true,
        subtree: true,
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach, { once: true });
    } else {
      attach();
    }
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isObserving = false;
  }
}
