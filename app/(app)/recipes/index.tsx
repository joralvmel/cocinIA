import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Card } from '@/components/ui';

export default function RecipesScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6 pb-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        📖 {t('recipes.title')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-6">
        {t('recipes.subtitle')}
      </Text>

      <Card variant="outlined" className="flex-1">
        <EmptyState
          icon="book"
          title={t('recipes.title')}
          description={t('recipes.subtitle')}
        />
      </Card>
    </View>
  );
}
