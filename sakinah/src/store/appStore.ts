import { create } from 'zustand';

interface AppState {
  language: 'ar' | 'en';
  isRTL: boolean;
  theme: 'dark' | 'light';

  setLanguage: (language: 'ar' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleLanguage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'ar',
  isRTL: true,
  theme: 'dark',

  setLanguage: (language) =>
    set({
      language,
      isRTL: language === 'ar',
    }),

  setTheme: (theme) => set({ theme }),

  toggleLanguage: () =>
    set((state) => {
      const newLanguage = state.language === 'ar' ? 'en' : 'ar';
      return {
        language: newLanguage,
        isRTL: newLanguage === 'ar',
      };
    }),
}));
