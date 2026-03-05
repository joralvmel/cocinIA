import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/stores/languageStore';
import { supportedLanguages, type LanguageCode } from '@/i18n';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfileScreen } from '@/hooks';
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
  const { language, setLanguage } = useLanguageStore();

  const {
    isAuthenticated,
    isLoaded,
    isDarkMode,
    displayName,
    countryData,
    currentLanguage,
    handleThemeToggle,
    confirmSignOut,
  } = useProfileScreen();

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [signOutAlertVisible, setSignOutAlertVisible] = useState(false);

  const handleSignOut = () => setSignOutAlertVisible(true);

  const handleConfirmSignOut = async () => {
    await confirmSignOut();
    setSignOutAlertVisible(false);
  };

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

            {/* Profile Settings */}
            {isAuthenticated && (
              <Section title={t('profile.editProfile')} className="mb-4">
                <ListGroup>
                  <ListItem leftIcon="user" title={t('profile.profileInfo')} subtitle={t('profile.profileInfoDesc')} showChevron onPress={() => router.push('/profile/edit-personal' as any)} />
                  <ListItem leftIcon="line-chart" title={t('profile.nutritionGoals')} subtitle={t('profile.nutritionGoalsDesc')} showChevron onPress={() => router.push('/profile/edit-nutrition' as any)} />
                  <ListItem leftIcon="cutlery" title={t('profile.cookingPreferences')} subtitle={t('profile.cookingPreferencesDesc')} showChevron onPress={() => router.push('/profile/edit-preferences' as any)} />
                  <ListItem leftIcon="lemon-o" title={t('profile.favoriteIngredients')} subtitle={t('profile.favoriteIngredientsDesc')} showChevron onPress={() => router.push('/profile/edit-ingredients' as any)} />
                </ListGroup>
              </Section>
            )}

            {/* Appearance */}
            <Section title={t('profile.appearance')} className="mb-4">
              <ListGroup>
                <ListItem
                  leftIcon="moon-o"
                  title={t('profile.theme')}
                  subtitle={isDarkMode ? t('profile.themeDark') : t('profile.themeLight')}
                  right={<Switch value={isDarkMode} onValueChange={handleThemeToggle} />}
                />
                <ListItem
                  leftIcon="globe"
                  title={t('profile.language')}
                  right={<Text className="text-gray-500 dark:text-gray-400">{currentLanguage?.nativeName}</Text>}
                  showChevron
                  onPress={() => setLanguageSheetVisible(true)}
                />
              </ListGroup>
            </Section>

            {/* Sign Out */}
            {isAuthenticated && (
              <View className="mt-2 mb-4">
                <Button variant="outline" onPress={handleSignOut}>
                  🚪 {t('auth.signOut')}
                </Button>
              </View>
            )}

            {/* Language Selector */}
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

            {/* Sign Out Confirmation */}
            <AlertModal
              visible={signOutAlertVisible}
              onClose={() => setSignOutAlertVisible(false)}
              title={t('auth.signOut')}
              message={t('auth.signOutConfirm')}
              variant="warning"
              confirmLabel={t('auth.signOut')}
              cancelLabel={t('common.cancel')}
              onConfirm={handleConfirmSignOut}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
