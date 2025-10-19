/**
 * Centralized storage keys for the application
 *
 * Benefits:
 * - Prevents typos
 * - Easy to find all storage keys in one place
 * - Type-safe key management
 * - Easy to migrate/rename keys
 */

export const STORAGE_KEYS = {
  // Authentication
  AUTH: {
    ACCESS_TOKEN: 'medi-control.access-token',
    REFRESH_TOKEN: 'medi-control.refresh-token',
  },

  // User Preferences
  PREFERENCES: {
    THEME: 'medi-control.preferences.theme',
    LANGUAGE: 'medi-control.preferences.language',
    NOTIFICATIONS_ENABLED: 'medi-control.preferences.notifications',
  },

  // App State
  APP: {
    ONBOARDING_COMPLETED: 'medi-control.app.onboarding-completed',
    LAST_SYNC: 'medi-control.app.last-sync',
    APP_VERSION: 'medi-control.app.version',
  },

  // Cache
  CACHE: {
    USER_PROFILE: 'medi-control.cache.user-profile',
    MEDICAL_DATA: 'medi-control.cache.medical-data',
  },
} as const;

/**
 * Type helper for storage keys
 */
export type StorageKey =
  | typeof STORAGE_KEYS.AUTH[keyof typeof STORAGE_KEYS.AUTH]
  | typeof STORAGE_KEYS.PREFERENCES[keyof typeof STORAGE_KEYS.PREFERENCES]
  | typeof STORAGE_KEYS.APP[keyof typeof STORAGE_KEYS.APP]
  | typeof STORAGE_KEYS.CACHE[keyof typeof STORAGE_KEYS.CACHE];
