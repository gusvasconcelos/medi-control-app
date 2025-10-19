import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * General purpose storage adapter for non-sensitive data
 * - Mobile (iOS/Android): Uses @react-native-async-storage/async-storage
 * - Web: Uses localStorage
 */

const isWeb = Platform.OS === 'web';

/**
 * Store a string value
 * @param key - Storage key
 * @param value - Value to store
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store item in localStorage:', error);
      throw error;
    }
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

/**
 * Retrieve a stored string value
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
export const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item from localStorage:', error);
      return null;
    }
  } else {
    return await AsyncStorage.getItem(key);
  }
};

/**
 * Remove an item from storage
 * @param key - Storage key
 */
export const removeItem = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
      throw error;
    }
  } else {
    await AsyncStorage.removeItem(key);
  }
};

/**
 * Store a JSON object
 * @param key - Storage key
 * @param value - Object to store
 */
export const setObject = async <T>(key: string, value: T): Promise<void> => {
  const jsonValue = JSON.stringify(value);
  await setItem(key, jsonValue);
};

/**
 * Retrieve a stored JSON object
 * @param key - Storage key
 * @returns The parsed object or null if not found
 */
export const getObject = async <T>(key: string): Promise<T | null> => {
  const jsonValue = await getItem(key);
  if (!jsonValue) return null;

  try {
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error('Failed to parse JSON from storage:', error);
    return null;
  }
};

/**
 * Get all keys in storage
 * @returns Array of all storage keys
 */
export const getAllKeys = async (): Promise<readonly string[]> => {
  if (isWeb) {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Failed to get keys from localStorage:', error);
      return [];
    }
  } else {
    return await AsyncStorage.getAllKeys();
  }
};

/**
 * Remove multiple items from storage
 * @param keys - Array of storage keys to remove
 */
export const multiRemove = async (keys: string[]): Promise<void> => {
  if (isWeb) {
    try {
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to remove items from localStorage:', error);
      throw error;
    }
  } else {
    await AsyncStorage.multiRemove(keys);
  }
};

/**
 * Clear all storage (use with caution!)
 */
export const clear = async (): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  } else {
    await AsyncStorage.clear();
  }
};

/**
 * Get multiple items from storage
 * @param keys - Array of storage keys
 * @returns Array of [key, value] pairs
 */
export const multiGet = async (keys: readonly string[]): Promise<readonly [string, string | null][]> => {
  if (isWeb) {
    try {
      return keys.map(key => [key, localStorage.getItem(key)] as [string, string | null]);
    } catch (error) {
      console.error('Failed to get items from localStorage:', error);
      return [];
    }
  } else {
    return await AsyncStorage.multiGet(keys);
  }
};

/**
 * Set multiple items in storage
 * @param keyValuePairs - Array of [key, value] pairs
 */
export const multiSet = async (keyValuePairs: [string, string][]): Promise<void> => {
  if (isWeb) {
    try {
      keyValuePairs.forEach(([key, value]) => localStorage.setItem(key, value));
    } catch (error) {
      console.error('Failed to set items in localStorage:', error);
      throw error;
    }
  } else {
    await AsyncStorage.multiSet(keyValuePairs);
  }
};
