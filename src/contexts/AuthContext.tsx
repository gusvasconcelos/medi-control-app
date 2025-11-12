import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import type { ApiError, LoginRequest, RegisterRequest, User } from '@/src/@types';
import { getCurrentUser, login, logout, register as registerUser } from '@/src/api/services/auth';
import { clearTokens, getAccessToken, saveTokens } from '@/src/lib/storage/auth-storage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: ApiError | null;
  register: (request: RegisterRequest) => Promise<void>;
  signIn: (request: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
      setError(null);
    } catch (err) {
      setUser(null);
      throw err;
    }
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();

      if (accessToken) {
        await refreshProfile();
      }
    } catch (err) {
      await clearTokens();
    } finally {
      setIsInitializing(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const register = useCallback(
    async (request: RegisterRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await registerUser(request);
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signIn = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const tokens = await login(request);
        await saveTokens(tokens);
        await refreshProfile();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProfile],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);

    try {
      await logout();
    } catch (err) {
      console.warn('Failed to call logout endpoint', err);
    } finally {
      await clearTokens();
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isLoading,
      error,
      register,
      signIn,
      signOut,
      refreshProfile,
      clearError,
    }),
    [isInitializing, isLoading, error, refreshProfile, register, signIn, signOut, user, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

