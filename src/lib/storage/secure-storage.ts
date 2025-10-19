import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage adapter for sensitive data (tokens, passwords, etc.)
 * - Mobile (iOS/Android): Uses expo-secure-store (encrypted device keychain)
 * - Web: Uses localStorage with a warning (not truly secure, but best available option)
 */

const isWeb = Platform.OS === 'web';

/**
 * Securely store a key-value pair
 * @param key - Storage key
 * @param value - Value to store
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    // Web fallback: localStorage (not encrypted, but only option available)
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store item in localStorage:', error);
      throw error;
    }
  } else {
    // Native: Use expo-secure-store
    await SecureStore.setItemAsync(key, value);
  }
};

/**
 * Retrieve a securely stored value
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item from localStorage:', error);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

/**
 * Delete a securely stored item
 * @param key - Storage key
 */
export const deleteSecureItem = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to delete item from localStorage:', error);
      throw error;
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

/**
 * Check if secure storage is available
 * @returns true if secure storage is available, false otherwise
 */
export const isSecureStorageAvailable = async (): Promise<boolean> => {
  if (isWeb) {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  } else {
    return await SecureStore.isAvailableAsync();
  }
};
