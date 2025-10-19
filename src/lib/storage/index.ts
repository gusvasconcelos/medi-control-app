/**
 * Storage Module
 *
 * Provides cross-platform storage solutions for the Medi Control app:
 *
 * 1. Secure Storage (secure-storage.ts):
 *    - For sensitive data: tokens, passwords, keys
 *    - Mobile: expo-secure-store (encrypted keychain)
 *    - Web: localStorage (fallback, not encrypted)
 *
 * 2. Async Storage (async-storage.ts):
 *    - For general non-sensitive data: preferences, cache, etc.
 *    - Mobile: @react-native-async-storage/async-storage
 *    - Web: localStorage
 *
 * 3. Auth Storage (auth-storage.ts):
 *    - Specialized storage for authentication tokens
 *    - Uses secure storage under the hood
 */

// Secure Storage - for sensitive data
export {
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
  isSecureStorageAvailable,
} from './secure-storage';

// Async Storage - for general data
export {
  setItem,
  getItem,
  removeItem,
  setObject,
  getObject,
  getAllKeys,
  multiRemove,
  multiGet,
  multiSet,
  clear,
} from './async-storage';

// Auth Storage - for authentication tokens
export {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  type AuthTokens,
} from './auth-storage';
