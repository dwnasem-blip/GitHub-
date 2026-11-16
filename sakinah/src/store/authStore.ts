import { create } from 'zustand';
import { User } from '@types/index';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setError: (error) => set({ error }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  reset: () =>
    set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    }),
}));
