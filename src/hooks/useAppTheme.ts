import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import { appColors } from '@/constants/theme';

/**
 * Custom hook that returns the effective theme based on user preference
 * Use this instead of useColorScheme from react-native
 */
export function useAppTheme() {
  const systemColorScheme = useSystemColorScheme();
  const { mode } = useThemeStore();

  const isDark = mode === 'system'
    ? systemColorScheme === 'dark'
    : mode === 'dark';

  const colors = isDark ? appColors.dark : appColors.light;

  return {
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
    mode,
    colors,
  } as const;
}
