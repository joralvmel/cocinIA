import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Card } from '@/components/ui';

export default function PantryScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        🥫 {t('pantry.title')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-6">
        {t('pantry.subtitle')}
      </Text>

      <Card variant="outlined" className="flex-1">
        <EmptyState
          icon="archive"
          title={t('pantry.title')}
          description={t('pantry.subtitle')}
        />
      </Card>
    </View>
  );
}
