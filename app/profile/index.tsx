import { View, Text, Pressable } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { supportedLanguages, type LanguageCode } from '@/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ThemeMode = 'light' | 'dark';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, setMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 px-4 pt-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Profile Header */}
      <View className="items-center mb-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <FontAwesome name="user" size={40} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          {t('profile.guestUser')}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {t('profile.signInToSync')}
        </Text>
      </View>

      {/* Settings Section */}
      <View className="mb-6">
        <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase mb-3 px-1">
          {t('profile.appearance')}
        </Text>

        {/* Theme Selector */}
        <View
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.text }} className="font-medium mb-3">
            {t('profile.theme')}
          </Text>
          <SegmentedButtons
            value={mode}
            onValueChange={(value) => setMode(value as ThemeMode)}
            buttons={[
              {
                value: 'light',
                label: t('profile.themeLight'),
                icon: 'white-balance-sunny',
              },
              {
                value: 'dark',
                label: t('profile.themeDark'),
                icon: 'moon-waning-crescent',
              },
            ]}
            style={{ backgroundColor: 'transparent' }}
          />
        </View>

        {/* Language Selector */}
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.text }} className="font-medium mb-3">
            {t('profile.language')}
          </Text>
          <SegmentedButtons
            value={language}
            onValueChange={(value) => setLanguage(value as LanguageCode)}
            buttons={supportedLanguages.map((lang) => ({
              value: lang.code,
              label: lang.nativeName,
            }))}
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
      </View>

      {/* Developer Section */}
      <View className="flex-1 justify-center items-center px-4">
        <Pressable
          className="rounded-xl px-6 py-4 border-2 border-dashed"
          style={{ borderColor: colors.border }}
          onPress={() => router.push('/components-demo' as any)}
        >
          <View className="items-center">
            <FontAwesome name="paint-brush" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={{ color: colors.text }} className="font-semibold text-base mb-1">
              🎨 Components Demo
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-sm text-center">
              View all UI components
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
