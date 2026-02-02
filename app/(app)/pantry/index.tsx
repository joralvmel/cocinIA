import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Card } from '@/components/ui';

export default function PantryScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6 pb-8">
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
