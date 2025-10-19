import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem, getObject, setObject } from '@/src/lib/storage';

/**
 * Hook for managing string values in storage
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [value, setValue, removeValue, loading]
 *
 * @example
 * const [theme, setTheme, removeTheme, loading] = useStorage('theme', 'light');
 */
export function useStorage(
  key: string,
  initialValue?: string,
): [string | null, (value: string) => Promise<void>, () => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await getItem(key);
        setStoredValue(value ?? initialValue ?? null);
      } catch (error) {
        console.error(`Failed to load storage key "${key}":`, error);
        setStoredValue(initialValue ?? null);
      } finally {
        setLoading(false);
      }
    };

    void loadValue();
  }, [key, initialValue]);

  const setValue = useCallback(
    async (value: string) => {
      try {
        await setItem(key, value);
        setStoredValue(value);
      } catch (error) {
        console.error(`Failed to set storage key "${key}":`, error);
        throw error;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      await removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      throw error;
    }
  }, [key]);

  return [storedValue, setValue, removeValue, loading];
}

/**
 * Hook for managing object values in storage
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [value, setValue, removeValue, loading]
 *
 * @example
 * const [user, setUser, removeUser, loading] = useStorageObject<User>('user', null);
 */
export function useStorageObject<T>(
  key: string,
  initialValue?: T,
): [T | null, (value: T) => Promise<void>, () => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await getObject<T>(key);
        setStoredValue(value ?? initialValue ?? null);
      } catch (error) {
        console.error(`Failed to load storage key "${key}":`, error);
        setStoredValue(initialValue ?? null);
      } finally {
        setLoading(false);
      }
    };

    void loadValue();
  }, [key, initialValue]);

  const setValue = useCallback(
    async (value: T) => {
      try {
        await setObject(key, value);
        setStoredValue(value);
      } catch (error) {
        console.error(`Failed to set storage key "${key}":`, error);
        throw error;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      await removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      throw error;
    }
  }, [key]);

  return [storedValue, setValue, removeValue, loading];
}

/**
 * Hook for managing boolean values in storage
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [value, setValue, toggle, loading]
 *
 * @example
 * const [notificationsEnabled, setNotifications, toggleNotifications, loading] = useStorageBoolean('notifications', true);
 */
export function useStorageBoolean(
  key: string,
  initialValue: boolean = false,
): [boolean, (value: boolean) => Promise<void>, () => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<boolean>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await getItem(key);
        setStoredValue(value === 'true' ? true : value === 'false' ? false : initialValue);
      } catch (error) {
        console.error(`Failed to load storage key "${key}":`, error);
        setStoredValue(initialValue);
      } finally {
        setLoading(false);
      }
    };

    void loadValue();
  }, [key, initialValue]);

  const setValue = useCallback(
    async (value: boolean) => {
      try {
        await setItem(key, value.toString());
        setStoredValue(value);
      } catch (error) {
        console.error(`Failed to set storage key "${key}":`, error);
        throw error;
      }
    },
    [key],
  );

  const toggle = useCallback(async () => {
    await setValue(!storedValue);
  }, [setValue, storedValue]);

  return [storedValue, setValue, toggle, loading];
}
