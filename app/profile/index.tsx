import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { supportedLanguages, type LanguageCode } from '@/i18n';
import {
  Avatar,
  Section,
  ListItem,
  ListGroup,
  Switch,
  Button,
  BottomSheet,
} from '@/components/ui';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, setMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);

  const isDarkMode = mode === 'dark';

  const handleThemeToggle = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  const currentLanguage = supportedLanguages.find((l) => l.code === language);

  return (
    <View className="flex-1 px-4 pt-6 bg-white dark:bg-gray-900">
      {/* Profile Header */}
      <View className="items-center mb-8">
        <Avatar size="xl" name={t('profile.guestUser')} className="mb-3" />
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {t('profile.guestUser')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('profile.signInToSync')}
        </Text>
      </View>

      {/* Settings Section */}
      <Section title={t('profile.appearance')}>
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

      {/* Developer Section */}
      <View className="flex-1 justify-center items-center px-4">
        <Button
          variant="outline"
          icon="paint-brush"
          onPress={() => router.push('/components-demo' as any)}
        >
          🎨 Components Demo
        </Button>
      </View>

      {/* Language Selector Bottom Sheet */}
      <BottomSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
        title={t('profile.language')}
      >
        <View className="gap-2">
          {supportedLanguages.map((lang) => (
            <ListItem
              key={lang.code}
              title={lang.nativeName}
              subtitle={lang.name}
              right={
                language === lang.code ? (
                  <Text className="text-primary-600 dark:text-primary-400">✓</Text>
                ) : null
              }
              onPress={() => {
                setLanguage(lang.code as LanguageCode);
                setLanguageSheetVisible(false);
              }}
              className="rounded-xl"
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
