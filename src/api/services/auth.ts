import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterRequest,
  User
} from '@/src/@types';
import { api } from '@/src/api/index';
import { API_ROUTES } from '@/src/constants/api';

export const register = async (payload: RegisterRequest) => {
  const { data } = await api.post<User>(API_ROUTES.auth.register, payload);

  return data;
}

export const login = async (payload: LoginRequest) => {
  const { data } = await api.post<LoginResponse>(API_ROUTES.auth.login, payload);

  return data;
};

export const logout = async () => {
  const { data } = await api.post<LogoutResponse>(API_ROUTES.auth.logout);

  return data;
};

export const refreshToken = async (refreshTokenValue: string) => {
  const { data } = await api.post<RefreshTokenResponse>(API_ROUTES.auth.refresh, {
    refreshToken: refreshTokenValue,
  });

  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get<User>(API_ROUTES.auth.me);

  return data;
};
