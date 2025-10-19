export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const API_TIMEOUT = 10000;

export const API_ROUTES = {
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },
} as const;

