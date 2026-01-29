import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function WeeklyPlanScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.textSecondary }} className="text-lg">
        📅 {t('weeklyPlan.title')}
      </Text>
      <Text style={{ color: colors.textMuted }} className="mt-2 text-sm">
        {t('weeklyPlan.subtitle')}
      </Text>
    </View>
  );
}
