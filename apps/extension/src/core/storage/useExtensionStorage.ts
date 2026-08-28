import { useState, useEffect, useCallback } from 'react';
import { StorageEngine } from './storageEngine';

/**
 * React hook to synchronize state with extension storage (chrome.storage.sync)
 */
export function useExtensionStorage<T>(
  key: string,
  initialValue: T,
  migrator?: (val: T) => T,
): [T, (val: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(() => (migrator ? migrator(initialValue) : initialValue));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    StorageEngine.get<T>(key, initialValue).then(val => {
      if (mounted) {
        const transformed = migrator ? migrator(val) : val;
        setValue(transformed);
        setLoading(false);
      }
    });

    const unsubscribe = StorageEngine.subscribe<T>(key, newVal => {
      if (mounted && newVal !== undefined) {
        const transformed = migrator ? migrator(newVal) : newVal;
        setValue(transformed);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [key, migrator]);

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
