export const FAVORITES_STORAGE_KEY = 'varia_user_favorites_v1';

export const DEFAULT_FAVORITE_TOOL_IDS: string[] = [
  'tool-audio-converter',
  'tool-gif-studio',
  'tool-youtube-downloader',
];

export interface VariaFavoritesStorage {
  version: 1;
  toolIds: string[];
}

/**
 * Safely loads user's favorite tool IDs from localStorage.
 * Falls back to DEFAULT_FAVORITE_TOOL_IDS if empty or in case of storage errors.
 */
export function getStoredFavorites(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [...DEFAULT_FAVORITE_TOOL_IDS];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_FAVORITE_TOOL_IDS];
    }

    const parsed = JSON.parse(raw) as Partial<VariaFavoritesStorage> | string[];
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string');
    }

    if (parsed && Array.isArray(parsed.toolIds)) {
      return parsed.toolIds.filter((id): id is string => typeof id === 'string');
    }

    return [...DEFAULT_FAVORITE_TOOL_IDS];
  } catch (err) {
    console.warn('Failed to retrieve user favorites from localStorage:', err);
    return [...DEFAULT_FAVORITE_TOOL_IDS];
  }
}

/**
 * Safely persists user's favorite tool IDs into localStorage.
 */
export function setStoredFavorites(toolIds: string[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const payload: VariaFavoritesStorage = {
      version: 1,
      toolIds,
    };
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Failed to persist user favorites into localStorage:', err);
    return false;
  }
}
