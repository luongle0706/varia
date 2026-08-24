import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getStoredFavorites,
  setStoredFavorites,
  DEFAULT_FAVORITE_TOOL_IDS,
  FAVORITES_STORAGE_KEY,
} from '@varia/core';

export interface UseUserPreferencesReturn {
  favoriteToolIds: string[];
  isFavorite: (toolId: string) => boolean;
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  reorderFavorites: (newOrder: string[]) => void;
  resetFavorites: () => void;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const [favoriteToolIds, setFavoriteToolIds] = useState<string[]>(() => getStoredFavorites());

  // Listen for storage events across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        setFavoriteToolIds(getStoredFavorites());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const persistAndSet = useCallback((updater: (prev: string[]) => string[]) => {
    setFavoriteToolIds(prev => {
      const next = updater(prev);
      setStoredFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string): boolean => {
      return favoriteToolIds.includes(toolId);
    },
    [favoriteToolIds],
  );

  const addFavorite = useCallback(
    (toolId: string) => {
      persistAndSet(prev => (prev.includes(toolId) ? prev : [...prev, toolId]));
    },
    [persistAndSet],
  );

  const removeFavorite = useCallback(
    (toolId: string) => {
      persistAndSet(prev => prev.filter(id => id !== toolId));
    },
    [persistAndSet],
  );

  const toggleFavorite = useCallback(
    (toolId: string) => {
      persistAndSet(prev =>
        prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId],
      );
    },
    [persistAndSet],
  );

  const reorderFavorites = useCallback(
    (newOrder: string[]) => {
      persistAndSet(() => newOrder);
    },
    [persistAndSet],
  );

  const resetFavorites = useCallback(() => {
    persistAndSet(() => [...DEFAULT_FAVORITE_TOOL_IDS]);
  }, [persistAndSet]);

  return useMemo(
    () => ({
      favoriteToolIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      reorderFavorites,
      resetFavorites,
    }),
    [
      favoriteToolIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      reorderFavorites,
      resetFavorites,
    ],
  );
}
