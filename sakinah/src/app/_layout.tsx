import { DarkTheme, DefaultTheme, ThemeProvider , Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthContext , AuthContextProvider } from '@/context/AuthContext';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [isSplashReady, setIsSplashReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      setIsSplashReady(true);
    }
  }, [isLoading]);

  if (!isSplashReady) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <RootLayoutContent />
    </AuthContextProvider>
  );
}
