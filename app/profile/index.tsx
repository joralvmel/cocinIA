import { View, Text, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useProfileStore } from '@/stores/profileStore';
import { useRecipesStore } from '@/stores/recipesStore';
import { supportedLanguages, type LanguageCode } from '@/i18n';
import { useAuth } from '@/hooks';
import { useAppTheme } from '@/hooks/useAppTheme';
import { authService, profileService } from '@/services';
import { getCountryByCode } from '@/constants';
import {
  Avatar,
  Section,
  ListItem,
  ListGroup,
  Switch,
  Button,
  ScreenHeader,
  SelectBottomSheet,
  AlertModal,
} from '@/components/ui';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { mode, setMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { user, isAuthenticated } = useAuth();

  // Read from shared profile store — already populated by home screen
  const { profile, isLoaded, setProfile, clear: clearProfileStore } = useProfileStore();
  const { clear: clearRecipesStore } = useRecipesStore();

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [signOutAlertVisible, setSignOutAlertVisible] = useState(false);

  const isDarkMode = mode === 'dark';

  // Refresh profile data in background when screen gains focus
  useFocusEffect(
    useCallback(() => {
      profileService.getProfile().then((data) => {
        if (data) setProfile(data);
      }).catch(console.error);
    }, [])
  );

  const handleThemeToggle = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  const handleSignOut = () => {
    setSignOutAlertVisible(true);
  };

  const confirmSignOut = async () => {
    try {
      await authService.signOut();
      clearProfileStore();
      clearRecipesStore();
      setSignOutAlertVisible(false);
      router.replace('/(auth)/login');
    } catch (error: any) {
      setSignOutAlertVisible(false);
    }
  };

  const currentLanguage = supportedLanguages.find((l) => l.code === language);
  const displayName = profile?.display_name || (isLoaded ? (user?.email || t('profile.guestUser')) : '');
  const countryData = profile?.country ? getCountryByCode(profile.country) : null;


  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.title')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            className="flex-1"
        contentContainerClassName="px-4 pt-6 pb-8"
        showsVerticalScrollIndicator={false}
      >
      {/* Profile Header */}
      <View className="items-center mb-6">
        <Avatar size="xl" name={displayName} className="mb-3" />
        {!isLoaded ? (
          <View className="h-6 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
        ) : (
          <>
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {displayName}
            </Text>
            {countryData && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {countryData.flag} {countryData.name}
              </Text>
            )}
            {!isAuthenticated && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.signInToSync')}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Profile Settings Section */}
      {isAuthenticated && (
        <Section title={t('profile.editProfile')} className="mb-4">
          <ListGroup>
            <ListItem
              leftIcon="user"
              title={t('profile.profileInfo')}
              subtitle={t('profile.profileInfoDesc')}
              showChevron
              onPress={() => router.push('/profile/edit-personal' as any)}
            />
            <ListItem
              leftIcon="line-chart"
              title={t('profile.nutritionGoals')}
              subtitle={t('profile.nutritionGoalsDesc')}
              showChevron
              onPress={() => router.push('/profile/edit-nutrition' as any)}
            />
            <ListItem
              leftIcon="cutlery"
              title={t('profile.cookingPreferences')}
              subtitle={t('profile.cookingPreferencesDesc')}
              showChevron
              onPress={() => router.push('/profile/edit-preferences' as any)}
            />
            <ListItem
              leftIcon="lemon-o"
              title={t('profile.favoriteIngredients')}
              subtitle={t('profile.favoriteIngredientsDesc')}
              showChevron
              onPress={() => router.push('/profile/edit-ingredients' as any)}
            />
          </ListGroup>
        </Section>
      )}

      {/* Appearance Settings Section */}
      <Section title={t('profile.appearance')} className="mb-4">
        <ListGroup>
          <ListItem
            leftIcon="moon-o"
            title={t('profile.theme')}
            subtitle={isDarkMode ? t('profile.themeDark') : t('profile.themeLight')}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
              />
            }
          />
          <ListItem
            leftIcon="globe"
            title={t('profile.language')}
            right={
              <Text className="text-gray-500 dark:text-gray-400">
                {currentLanguage?.nativeName}
              </Text>
            }
            showChevron
            onPress={() => setLanguageSheetVisible(true)}
          />
        </ListGroup>
      </Section>

      {/* Sign Out Button */}
      {isAuthenticated && (
        <View className="mt-2 mb-4">
          <Button
            variant="outline"
            onPress={handleSignOut}
          >
            🚪 {t('auth.signOut')}
          </Button>
        </View>
      )}

      {/* Developer Section - commented out for production */}
      {/* <View className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          icon="paint-brush"
          onPress={() => router.push('/components-demo' as any)}
        >
          🎨 Components Demo
        </Button>
      </View> */}

      {/* Language Selector Bottom Sheet */}
      <SelectBottomSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
        title={t('profile.language')}
        options={supportedLanguages.map((lang) => ({
          value: lang.code,
          label: lang.nativeName,
          subtitle: lang.name,
        }))}
        value={language}
        onChange={(v) => setLanguage(v as LanguageCode)}
      />

      {/* Sign Out Confirmation Alert */}
      <AlertModal
        visible={signOutAlertVisible}
        onClose={() => setSignOutAlertVisible(false)}
        title={t('auth.signOut')}
        message={t('auth.signOutConfirm')}
        variant="warning"
        confirmLabel={t('auth.signOut')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmSignOut}
      />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
