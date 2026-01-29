import './global.css';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme, Pressable, View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/services/queryClient';
import { useThemeStore } from '@/stores/themeStore';
import {
  lightNavigationTheme,
  darkNavigationTheme,
  lightPaperTheme,
  darkPaperTheme,
  brandColors,
} from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colorScheme as nativeWindColorScheme } from 'nativewind';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();

  // Determine effective theme
  const isDark = mode === 'system'
    ? systemColorScheme === 'dark'
    : mode === 'dark';

  // Sync NativeWind with our theme store
  useEffect(() => {
    nativeWindColorScheme.set(isDark ? 'dark' : 'light');
  }, [isDark]);

  const navigationTheme = isDark ? darkNavigationTheme : lightNavigationTheme;
  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
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
                <Stack.Screen name="(app)" />
                <Stack.Screen
                  name="profile"
                  options={{
                    headerShown: true,
                    title: 'Profile',
                    presentation: 'card',
                    animation: 'slide_from_right',
                    headerStyle: { backgroundColor: navigationTheme.colors.card },
                    headerTintColor: navigationTheme.colors.text,
                    headerShadowVisible: false,
                    headerLeft: () => (
                      <Pressable onPress={() => router.back()} className="p-2 mr-2">
                        <FontAwesome
                          name="arrow-left"
                          size={20}
                          color={isDark ? brandColors.primary[400] : brandColors.primary[600]}
                        />
                      </Pressable>
                    ),
                  }}
                />
              </Stack>
            </View>
          </ThemeProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
