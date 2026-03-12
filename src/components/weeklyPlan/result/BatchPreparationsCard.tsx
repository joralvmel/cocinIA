import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge } from '@/components/ui';
import { type BasePreparation } from '@/types';

interface BatchPreparationsCardProps {
  preparations: BasePreparation[];
  onPrepPress?: (prep: BasePreparation, index: number) => void;
  onPrepLongPress?: (prep: BasePreparation, index: number) => void;
  /** Index of the prep currently being regenerated/modified — shows a loading indicator */
  loadingIndex?: number | null;
}

export function BatchPreparationsCard({ preparations, onPrepPress, onPrepLongPress, loadingIndex }: BatchPreparationsCardProps) {
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

  const totalTime = preparations.reduce((sum, p) => sum + (p.estimated_time_minutes || 0), 0);

  return (
    <Card variant="outlined" className="mb-4">
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-1">
          <FontAwesome name="tasks" size={18} color={colors.primary} />
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-50 flex-1">
            {t('weeklyPlan.result.basePreparations')}
          </Text>
          {totalTime > 0 && (
            <View className="flex-row items-center gap-1">
              <FontAwesome name="clock-o" size={12} color={colors.textMuted} />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {totalTime} min
              </Text>
            </View>
          )}
        </View>

        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('weeklyPlan.result.basePrepsDescription')}
        </Text>

        <View className="gap-3">
          {preparations.map((prep, index) => {
            const hasRecipe = !!prep.recipe?.title;
            const isLoading = loadingIndex === index;
            return (
              <Pressable
                key={index}
                onPress={() => hasRecipe && !isLoading && onPrepPress?.(prep, index)}
                onLongPress={() => hasRecipe && !isLoading && onPrepLongPress?.(prep, index)}
                className={`bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50 ${
                  isLoading ? 'opacity-60' : hasRecipe ? 'active:bg-amber-100 dark:active:bg-amber-900/40' : ''
                }`}
              >
                {isLoading && (
                  <View className="absolute inset-0 z-10 rounded-xl items-center justify-center bg-amber-50/70 dark:bg-amber-900/40">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('weeklyPlan.result.regenerating')}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-2 mb-1">
                  <FontAwesome
                    name={getTypeIcon(prep.type) as any}
                    size={14}
                    color={colors.primary}
                  />
                  <Text className="font-semibold text-gray-900 dark:text-gray-50 flex-1">
                    {prep.name}
                  </Text>
                  <Badge variant="info" size="sm" label={prep.type} />
                  {hasRecipe && (
                    <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
                  )}
                </View>

                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {prep.description}
                </Text>

                <View className="flex-row items-center gap-3 mt-1">
                  {prep.estimated_time_minutes != null && (
                    <View className="flex-row items-center gap-1">
                      <FontAwesome name="clock-o" size={11} color={colors.textMuted} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {prep.estimated_time_minutes} min
                      </Text>
                    </View>
                  )}

                  {prep.storage_instructions && (
                    <View className="flex-row items-center gap-1 flex-1">
                      <FontAwesome name="snowflake-o" size={11} color={colors.textMuted} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {prep.storage_instructions}
                      </Text>
                    </View>
                  )}
                </View>

                {hasRecipe && (
                  <View className="flex-row items-center gap-1 mt-2">
                    <FontAwesome name="eye" size={11} color={colors.primary} />
                    <Text className="text-xs text-primary-600 dark:text-primary-400">
                      {t('weeklyPlan.result.viewRecipe')}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Card>
  );
}



