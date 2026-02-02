import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Card } from '@/components/ui';

export default function WeeklyPlanScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6 pb-8">
      <Card variant="outlined" className="flex-1">
        <EmptyState
          icon="calendar"
          title={t('weeklyPlan.title')}
          description={t('weeklyPlan.subtitle')}
        />
      </Card>
    </View>
  );
}
