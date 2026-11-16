import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { User } from '@/types/index';

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  isValidatingEmail?: (email: string) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const { user, isLoading, isAuthenticated, error, setUser, setIsLoading, setIsAuthenticated, setError } =
    useAuthStore();
  const [sessionRestored, setSessionRestored] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();

        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setSessionRestored(true);
      }
    };

    restoreSession();
  }, [setUser, setIsLoading, setIsAuthenticated]);

  // Listen to auth state changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setUser(user);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Error on sign in:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
      } else if (event === 'USER_UPDATED' && session) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setUser(user);
          }
        } catch (err) {
          console.error('Error on user update:', err);
        }
      }
    });

    return () => {
      data?.subscription?.unsubscribe?.();
    };
  }, [setUser, setIsAuthenticated, setError]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const user = await authService.signUp(email, password, fullName);
        setUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setIsLoading, setIsAuthenticated, setError]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const user = await authService.login(email, password);
        setUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setIsLoading, setIsAuthenticated, setError]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading, setIsAuthenticated, setError]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await authService.resetPassword(email);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    login,
    logout,
    resetPassword,
    clearError,
  };
};
