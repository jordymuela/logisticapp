import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

import { I18nProvider, useI18n } from '@/i18n';
import { StoreProvider } from '@/store/app-store';

function RootStack() {
  const { t } = useI18n();
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(shipper)" options={{ headerShown: false }} />
      <Stack.Screen name="(carrier)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="load/[id]" options={{ title: t('tabLoads') }} />
      <Stack.Screen name="carrier/[id]" options={{ title: t('roleCarrier') }} />
      <Stack.Screen name="register-truck" options={{ title: t('registration'), presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <I18nProvider>
        <StoreProvider>
          <RootStack />
        </StoreProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
