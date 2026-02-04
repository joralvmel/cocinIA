import { useThemeStore } from '@/stores/themeStore';
import { appColors } from '@/constants/theme';

/**
 * Custom hook that returns the effective theme based on user preference
 */
export function useAppTheme() {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const colors = isDark ? appColors.dark : appColors.light;

  return {
    isDark,
    colorScheme: mode,
    mode,
    colors,
  };
}
