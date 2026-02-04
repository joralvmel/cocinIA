import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, Theme } from '@react-navigation/native';

// CocinIA brand colors (from tailwind.config.js)
export const brandColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
};

// App colors - centralized for easy maintenance
export const appColors = {
  light: {
    background: brandColors.white,
    card: brandColors.white,
    surface: brandColors.gray[50],
    surfaceVariant: brandColors.gray[100],
    text: brandColors.gray[900],
    textSecondary: brandColors.gray[500],
    textMuted: brandColors.gray[400],
    primary: brandColors.primary[600],
    primaryLight: brandColors.primary[100],
    primaryDark: brandColors.primary[700],
    border: brandColors.gray[200],
    borderLight: brandColors.gray[100],
    error: '#ef4444',
    success: brandColors.primary[500],
  },
  dark: {
    background: brandColors.gray[900],
    card: brandColors.gray[800],
    surface: brandColors.gray[800],
    surfaceVariant: brandColors.gray[700],
    text: brandColors.gray[50],
    textSecondary: brandColors.gray[400],
    textMuted: brandColors.gray[500],
    primary: brandColors.primary[400],
    primaryLight: brandColors.primary[900],
    primaryDark: brandColors.primary[300],
    border: brandColors.gray[700],
    borderLight: brandColors.gray[600],
    error: '#f87171',
    success: brandColors.primary[400],
    warning: '#fbbf24',
  },
};

// Navigation themes (for React Navigation / Expo Router)
export const lightNavigationTheme: Theme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: appColors.light.primary,
    background: appColors.light.background,
    card: appColors.light.card,
    text: appColors.light.text,
    border: 'transparent',
    notification: brandColors.primary[500],
  },
};

export const darkNavigationTheme: Theme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: appColors.dark.primary,
    background: appColors.dark.background,
    card: appColors.dark.card,
    text: appColors.dark.text,
    border: 'transparent',
    notification: brandColors.primary[500],
  },
};

// Paper themes (for React Native Paper components)
export const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appColors.light.primary,
    primaryContainer: appColors.light.primaryLight,
    secondary: brandColors.primary[500],
    secondaryContainer: brandColors.primary[50],
    tertiary: appColors.light.primaryDark,
    surface: appColors.light.surface,
    surfaceVariant: appColors.light.surfaceVariant,
    background: appColors.light.background,
    error: appColors.light.error,
    onPrimary: brandColors.white,
    onPrimaryContainer: brandColors.primary[900],
    onSecondary: brandColors.white,
    onSurface: appColors.light.text,
    onSurfaceVariant: appColors.light.textSecondary,
    onBackground: appColors.light.text,
    outline: appColors.light.border,
    elevation: {
      level0: 'transparent',
      level1: brandColors.white,
      level2: brandColors.gray[50],
      level3: brandColors.gray[100],
      level4: brandColors.gray[200],
      level5: brandColors.gray[300],
    },
  },
};

export const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: appColors.dark.primary,
    primaryContainer: brandColors.primary[800],
    secondary: brandColors.primary[500],
    secondaryContainer: brandColors.primary[900],
    tertiary: appColors.dark.primaryDark,
    surface: appColors.dark.surface,
    surfaceVariant: appColors.dark.surfaceVariant,
    background: appColors.dark.background,
    error: appColors.dark.error,
    onPrimary: brandColors.gray[900],
    onPrimaryContainer: brandColors.primary[100],
    onSecondary: brandColors.gray[900],
    onSurface: appColors.dark.text,
    onSurfaceVariant: appColors.dark.textSecondary,
    onBackground: appColors.dark.text,
    outline: appColors.dark.border,
    elevation: {
      level0: 'transparent',
      level1: brandColors.gray[800],
      level2: brandColors.gray[700],
      level3: brandColors.gray[600],
      level4: brandColors.gray[500],
      level5: brandColors.gray[400],
    },
  },
};

// Type exports
export type PaperTheme = typeof lightPaperTheme;
export type NavigationTheme = typeof lightNavigationTheme;
export type AppColors = typeof appColors.light;
