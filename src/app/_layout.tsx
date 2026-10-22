import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';

import { StoreProvider } from '@/store/app-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StoreProvider>
        <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(shipper)" options={{ headerShown: false }} />
          <Stack.Screen name="(carrier)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="load/[id]" options={{ title: 'Chargement' }} />
          <Stack.Screen name="carrier/[id]" options={{ title: 'Transporteur' }} />
          <Stack.Screen name="register-truck" options={{ title: 'Inscription transporteur', presentation: 'modal' }} />
        </Stack>
      </StoreProvider>
    </ThemeProvider>
  );
}
