import './global.css';
import '@/i18n'; // Initialize i18n
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/services/queryClient';
import { useThemeStore } from '@/stores/themeStore';
import { AuthProvider } from '@/contexts';
import {
  lightNavigationTheme,
  darkNavigationTheme,
  lightPaperTheme,
  darkPaperTheme,
} from '@/constants/theme';
import { colorScheme as nativeWindColorScheme } from 'nativewind';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  // Sync NativeWind with our theme store
  useEffect(() => {
    nativeWindColorScheme.set(isDark ? 'dark' : 'light');
  }, [isDark]);

  const navigationTheme = isDark ? darkNavigationTheme : lightNavigationTheme;
  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navigationTheme}>
              <View style={{ flex: 1, backgroundColor: navigationTheme.colors.background }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: navigationTheme.colors.background },
                    animation: 'fade',
                    animationDuration: 150,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(onboarding)" />
                  <Stack.Screen name="(app)" />
                  <Stack.Screen
                    name="profile"
                    options={{
                      headerShown: false,
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                </Stack>
              </View>
            </ThemeProvider>
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
