import './global.css';
import { Stack, router } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme, Pressable } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { queryClient } from '@/services/queryClient';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: true,
              title: 'Profile',
              presentation: 'card',
              headerLeft: () => (
                <Pressable onPress={() => router.back()} className="p-2">
                  <FontAwesome name="arrow-left" size={20} color="#16a34a" />
                </Pressable>
              ),
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
