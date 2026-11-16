import { theme } from './index';
import { useColorScheme } from 'react-native';

export interface ThemeContextValue {
  theme: typeof theme;
  isDark: boolean;
  isRTL: boolean;
}

export const useTheme = (): ThemeContextValue => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || colorScheme === null; // Default to dark

  // Check if the app is in RTL mode (can be extended with i18n language detection)
  const isRTL = false; // Will be integrated with i18n later

  return {
    theme,
    isDark,
    isRTL,
  };
};

export default useTheme;
