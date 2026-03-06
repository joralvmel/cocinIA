import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge } from '@/components/ui';
import { type BasePreparation } from '@/types';

interface BatchPreparationsCardProps {
  preparations: BasePreparation[];
}

export function BatchPreparationsCard({ preparations }: BatchPreparationsCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!preparations || preparations.length === 0) return null;

  const getTypeIcon = (type: BasePreparation['type']): string => {
    const icons: Record<string, string> = {
      protein: 'fire',
      grain: 'leaf',
      sauce: 'tint',
      vegetable: 'envira',
      side: 'plus-square',
      other: 'ellipsis-h',
    };
    return icons[type] || 'ellipsis-h';
  };

  return (
    <Card variant="outlined" className="mb-4">
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <FontAwesome name="tasks" size={18} color={colors.primary} />
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {t('weeklyPlan.result.basePreparations')}
          </Text>
        </View>

        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('weeklyPlan.result.basePrepsDescription')}
        </Text>

        <View className="gap-3">
          {preparations.map((prep, index) => (
            <View
              key={index}
              className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3"
            >
              <View className="flex-row items-center gap-2 mb-1">
                <FontAwesome
                  name={getTypeIcon(prep.type) as any}
                  size={14}
                  color={colors.primary}
                />
                <Text className="font-semibold text-gray-900 dark:text-gray-50">
                  {prep.name}
                </Text>
                <Badge variant="info" size="sm" label={prep.type} />
              </View>

              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {prep.description}
              </Text>

              {prep.estimated_time_minutes && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('weeklyPlan.result.prepTime', { minutes: prep.estimated_time_minutes })}
                </Text>
              )}

              {prep.used_in_days.length > 0 && (
                <View className="flex-row items-center flex-wrap gap-1 mt-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {t('weeklyPlan.result.usedIn')}
                  </Text>
                  {prep.used_in_days.map((day) => (
                    <Badge key={day} variant="default" size="sm" label={t(`weeklyPlan.daysShort.${day}` as any) as string} />
                  ))}
                </View>
              )}

              {prep.storage_instructions && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  {prep.storage_instructions}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}



