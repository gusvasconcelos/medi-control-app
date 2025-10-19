import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import type { RefreshTokenResponse } from '@/src/@types';
import { API_BASE_URL, API_ROUTES, API_TIMEOUT } from '@/src/constants/api';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/src/lib/storage/auth-storage';
import { keysToCamel, keysToSnake } from '@/src/lib/utils/case-converter';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  // Convert request data from camelCase to snake_case
  if (config.data) {
    config.data = keysToSnake(config.data);
  }

  // Convert query params from camelCase to snake_case
  if (config.params) {
    config.params = keysToSnake(config.params);
  }

  return config;
});

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => {
    // Convert response data from snake_case to camelCase
    if (response.data) {
      response.data = keysToCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const axiosError = error as AxiosError;
    const originalRequest = (axiosError.config ?? {}) as RetryableRequestConfig;

    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await api.post<RefreshTokenResponse>(
            API_ROUTES.auth.refresh,
            {
              refreshToken,
            },
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          );

          await saveTokens({ accessToken: data.accessToken, refreshToken });

          if (originalRequest.headers instanceof axios.AxiosHeaders) {
            originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
          }
          

          return api(originalRequest);
        } catch (refreshError) {
          await clearTokens();
          // Redirect to login screen on refresh token failure
          router.replace('/(auth)/auth');
          return Promise.reject(refreshError);
        }
      }
    }

    // Convert error response data from snake_case to camelCase
    const errorData = axiosError.response?.data ? keysToCamel(axiosError.response.data) : null;

    return Promise.reject({
      reqId: errorData?.reqId || '',
      message: errorData?.message ?? axiosError.message ?? 'Request failed',
      statusCode: axiosError.response?.status ?? 500,
      code: errorData?.code || 'UNKNOWN_ERROR',
      details: errorData?.details || null,
    });
  },
);

export type ApiClient = typeof api;

export default api;