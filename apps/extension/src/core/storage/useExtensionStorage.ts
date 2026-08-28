import { useState, useEffect, useCallback } from 'react';
import { StorageEngine } from './storageEngine';

/**
 * React hook to synchronize state with extension storage (chrome.storage.sync)
 */
export function useExtensionStorage<T>(
  key: string,
  initialValue: T,
): [T, (val: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    StorageEngine.get<T>(key, initialValue).then(val => {
      if (mounted) {
        setValue(val);
        setLoading(false);
      }
    });

    const unsubscribe = StorageEngine.subscribe<T>(key, newVal => {
      if (mounted && newVal !== undefined) {
        setValue(newVal);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [key]);

  const updateValue = useCallback(
    async (valOrUpdater: T | ((prev: T) => T)) => {
      setValue(current => {
        const next =
          typeof valOrUpdater === 'function'
            ? (valOrUpdater as (prev: T) => T)(current)
            : valOrUpdater;
        StorageEngine.set(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, updateValue, loading];
}
