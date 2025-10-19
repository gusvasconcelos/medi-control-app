import { setSecureItem, getSecureItem, deleteSecureItem } from './secure-storage';

const ACCESS_TOKEN_KEY = 'medi-control.access-token';
const REFRESH_TOKEN_KEY = 'medi-control.refresh-token';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

/**
 * Save authentication tokens to secure storage
 * - Mobile: Uses encrypted keychain (expo-secure-store)
 * - Web: Uses localStorage (best available option)
 */
export const saveTokens = async ({ accessToken, refreshToken }: AuthTokens) => {
  await setSecureItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    await setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Retrieve the access token from secure storage
 * @returns Access token or null if not found
 */
export const getAccessToken = async () => getSecureItem(ACCESS_TOKEN_KEY);

/**
 * Retrieve the refresh token from secure storage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = async () => getSecureItem(REFRESH_TOKEN_KEY);

/**
 * Clear all authentication tokens from secure storage
 */
export const clearTokens = async () => {
  await deleteSecureItem(ACCESS_TOKEN_KEY);
  await deleteSecureItem(REFRESH_TOKEN_KEY);
};

