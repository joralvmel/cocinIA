import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.primary }} className="text-3xl font-bold">
        🍳 {t('home.title')}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mt-2">
        {t('home.subtitle')}
      </Text>
      <Text style={{ color: colors.textMuted }} className="mt-8 text-sm">
        {t('home.placeholder')}
      </Text>
    </View>
  );
}
