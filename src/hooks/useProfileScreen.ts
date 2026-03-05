import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useProfileStore } from '@/stores/profileStore';
import { useRecipesStore } from '@/stores/recipesStore';
import { authService, profileService } from '@/services';
import { getCountryByCode } from '@/constants';
import { supportedLanguages } from '@/i18n';
import { useAuth } from '@/contexts';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguageStore } from '@/stores/languageStore';

/**
 * Business logic for the main profile screen.
 */
export function useProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { mode, setMode } = useThemeStore();
  const { language } = useLanguageStore();
  const { profile, isLoaded, setProfile, clear: clearProfileStore } = useProfileStore();
  const { clear: clearRecipesStore } = useRecipesStore();

  // Refresh profile in background on focus
  useFocusEffect(
    useCallback(() => {
      profileService
        .getProfile()
        .then((data) => {
          if (data) setProfile(data);
        })
        .catch(console.error);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleThemeToggle = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  const confirmSignOut = async () => {
    try {
      await authService.signOut();
      clearProfileStore();
      clearRecipesStore();
      router.replace('/(auth)/login');
    } catch {
      // silently fail
    }
  };

  // Derived
  const isDarkMode = mode === 'dark';
  const currentLanguage = supportedLanguages.find((l) => l.code === language);
  const displayName = profile?.display_name || (isLoaded ? (user?.email || '') : '');
  const countryData = profile?.country ? getCountryByCode(profile.country) : null;

  return {
    isAuthenticated,
    isLoaded,
    isDarkMode,
    displayName,
    countryData,
    currentLanguage,
    handleThemeToggle,
    confirmSignOut,
  };
}


