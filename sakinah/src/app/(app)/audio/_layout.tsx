import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';

export default function AudioLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="upload" options={{ title: t('audio.upload') }} />
      <Stack.Screen name="record" options={{ title: t('audio.record') }} />
      <Stack.Screen name="list" options={{ title: t('audio.list') }} />
    </Stack>
  );
}
