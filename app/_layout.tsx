import {
  darkNavigationTheme,
  darkPaperTheme,
  lightNavigationTheme,
  lightPaperTheme,
} from "@/constants/theme";
import { AuthProvider } from "@/contexts";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import "@/i18n"; // Initialize i18n
import { queryClient } from "@/services/queryClient";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { colorScheme as nativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// Suppress non-fatal NativeWind CSS interop debug warning (dev only)
LogBox.ignoreLogs(["Couldn't find a navigation context"]);

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  useNotificationNavigation();

  // Sync NativeWind with our theme store
  useEffect(() => {
    nativeWindColorScheme.set(isDark ? "dark" : "light");
  }, [isDark]);

  const navigationTheme = isDark ? darkNavigationTheme : lightNavigationTheme;
  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navigationTheme}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: navigationTheme.colors.background,
                }}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: navigationTheme.colors.background,
                    },
                    animation: "fade",
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
                      presentation: "card",
                      animation: "slide_from_right",
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
