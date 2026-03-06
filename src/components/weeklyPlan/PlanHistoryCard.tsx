import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge, Button } from '@/components/ui';
import { type WeeklyPlan } from '@/types';
import { formatDateRange } from '@/utils';

interface PlanHistoryCardProps {
  plan: WeeklyPlan;
  onPress: () => void;
  onRepeat: () => void;
  onDelete: () => void;
}

export function PlanHistoryCard({
  plan,
  onPress,
  onRepeat,
  onDelete,
}: PlanHistoryCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress}>
      <Card variant="outlined" className="mb-3">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 flex-row items-center gap-2">
              <FontAwesome name="calendar" size={16} color={colors.primary} />
              <Text
                className="text-base font-semibold text-gray-900 dark:text-gray-50"
                numberOfLines={1}
              >
                {plan.name}
              </Text>
            </View>
            {plan.is_completed && (
              <Badge variant="success" size="sm" label={t('weeklyPlan.active.planCompleted')} />
            )}
          </View>

          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {formatDateRange(plan.start_date, plan.end_date)}
          </Text>

          <View className="flex-row items-center gap-3 mb-3">
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {plan.days_included.length} {t('weeklyPlan.wizard.steps.days').toLowerCase()}
            </Text>
            {plan.is_batch_cooking && (
              <Badge variant="warning" size="sm" label="Batch" />
            )}
            {plan.daily_calorie_target && (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {plan.daily_calorie_target} cal/día
              </Text>
            )}
          </View>

          <View className="flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="repeat"
              onPress={onRepeat}
              className="flex-1"
            >
              {t('weeklyPlan.history.repeatPlan')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onPress={onDelete}
            >
              {t('weeklyPlan.history.deletePlan')}
            </Button>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}




