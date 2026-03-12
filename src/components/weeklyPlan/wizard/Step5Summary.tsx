import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge } from '@/components/ui';
import { useWeeklyPlanStore, useProfileStore } from '@/stores';
import { DAYS_OF_WEEK } from '@/types';
import { getMealTypeLabel } from '@/utils';

export function Step5Summary() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const {
    selectedDays,
    dayConfigs,
    batchCookingEnabled,
    batchConfig,
    cookingTimeByMealType,
    cuisines,
    ingredientsToInclude,
    ingredientsToExclude,
    useFavoriteIngredients,
    dailyCalorieTarget,
    specialNotes,
    planName,
    startDate,
    useProfileRoutineMeals,
  } = useWeeklyPlanStore();

  const profileRoutineMeals = useProfileStore((s) => s.routineMeals);
  const hasProfileRoutineMeals = profileRoutineMeals.some((m) => m.description.trim());

  // Effective routine meals (only from profile when enabled)
  const effectiveRoutineMeals = React.useMemo(() => {
    if (useProfileRoutineMeals && hasProfileRoutineMeals) {
      const result: Record<string, string> = {};
      for (const rm of profileRoutineMeals) {
        if (rm.description.trim()) result[rm.meal_type] = rm.description;
      }
      return result;
    }
    return {};
  }, [useProfileRoutineMeals, hasProfileRoutineMeals, profileRoutineMeals]);

  // Calculate total meals
  const totalMeals = selectedDays.reduce((sum, day) => {
    return sum + dayConfigs[day].meals.length;
  }, 0);

  const SummaryRow = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string;
    label: string;
    value: string;
    color?: string;
  }) => (
    <View className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700/50">
      <View className="w-8 items-center">
        <FontAwesome name={icon as any} size={16} color={color || colors.textSecondary} />
      </View>
      <Text className="flex-1 text-gray-600 dark:text-gray-400 ml-2">{label}</Text>
      <Text className="font-semibold text-gray-900 dark:text-gray-50">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
    >
      {/* Plan name */}
      {planName ? (
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 text-center">
          {planName}
        </Text>
      ) : (
        <Text className="text-base text-gray-400 dark:text-gray-500 mb-4 text-center italic">
          {t('weeklyPlan.wizard.planNameAuto')}
        </Text>
      )}

      {/* Overview card */}
      <Card variant="outlined" className="mb-4">
        <View className="p-4">
          <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50 mb-3">
            {t('weeklyPlan.wizard.summaryTitle')}
          </Text>

          <SummaryRow
            icon="calendar"
            label={t('weeklyPlan.wizard.daysSelected', { count: selectedDays.length })}
            value={selectedDays
              .sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b))
              .map((d) => t(`weeklyPlan.daysShort.${d}` as any))
              .join(', ')}
          />

          <SummaryRow
            icon="cutlery"
            label={t('weeklyPlan.wizard.totalMeals', { count: totalMeals })}
            value={`${totalMeals}`}
          />

          <SummaryRow
            icon="fire"
            label={
              dailyCalorieTarget
                ? t('weeklyPlan.wizard.calorieTarget', { calories: dailyCalorieTarget })
                : t('weeklyPlan.wizard.noCalorieTarget')
            }
            value={dailyCalorieTarget ? `${dailyCalorieTarget} cal` : '—'}
          />

          <SummaryRow
            icon={batchCookingEnabled ? 'check-circle' : 'circle-o'}
            label={
              batchCookingEnabled
                ? t('weeklyPlan.wizard.batchCookingOn')
                : t('weeklyPlan.wizard.batchCookingOff')
            }
            value={
              batchCookingEnabled
                ? batchConfig.prep_days
                    .map((d) => t(`weeklyPlan.daysShort.${d}` as any))
                    .join(', ')
                : '—'
            }
            color={batchCookingEnabled ? colors.primary : undefined}
          />

          {cuisines.length > 0 && (
            <SummaryRow
              icon="globe"
              label={t('weeklyPlan.wizard.cuisinesSelected', { count: cuisines.length })}
              value={`${cuisines.length}`}
            />
          )}

          {startDate && (
            <SummaryRow
              icon="calendar-check-o"
              label={t('weeklyPlan.wizard.startDate')}
              value={new Date(startDate).toLocaleDateString()}
            />
          )}
        </View>
      </Card>

      {/* Days detail */}
      <Card variant="outlined" className="mb-4">
        <View className="p-4">
          <Text className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
            {t('weeklyPlan.wizard.step1Title')}
          </Text>
          {selectedDays
            .sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b))
            .map((day) => {
              const cfg = dayConfigs[day];
              return (
                <View key={day} className="flex-row items-start py-2 border-b border-gray-100 dark:border-gray-700/50">
                  <Text className="font-medium text-gray-900 dark:text-gray-50 w-16">
                    {t(`weeklyPlan.daysShort.${day}` as any)}
                  </Text>
                  <View className="flex-1 flex-row flex-wrap gap-1">
                    {cfg.meals.map((meal) => (
                      <Badge
                        key={meal}
                        variant="primary"
                        size="sm"
                        label={getMealTypeLabel(meal, t)}
                      />
                    ))}
                  </View>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">
                    {cfg.meals
                      .filter((m) => !(batchCookingEnabled && m === 'lunch'))
                      .reduce((sum, m) => sum + (cookingTimeByMealType[m] ?? 30), 0)}min
                  </Text>
                </View>
              );
            })}
        </View>
      </Card>

      {/* Batch cooking details */}
      {batchCookingEnabled && (
        <Card variant="outlined" className="mb-4">
          <View className="p-4 gap-2">
            <View className="flex-row items-center gap-2 mb-1">
              <FontAwesome name="tasks" size={16} color={colors.primary} />
              <Text className="font-semibold text-gray-900 dark:text-gray-50">
                Batch Cooking
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <FontAwesome name="calendar" size={12} color={colors.textSecondary} />
              <Text className="text-gray-600 dark:text-gray-400">
                {t('weeklyPlan.wizard.prepDays')}: {batchConfig.prep_days
                  .map((d) => t(`weeklyPlan.daysShort.${d}` as any))
                  .join(', ') || '—'}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <FontAwesome name="cubes" size={12} color={colors.textSecondary} />
              <Text className="text-gray-600 dark:text-gray-400">
                {t('weeklyPlan.wizard.basePrepsCount')}: {batchConfig.base_preparations_count || 3}
              </Text>
            </View>

            {batchConfig.max_prep_time_minutes ? (
              <View className="flex-row items-center gap-2">
                <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
                <Text className="text-gray-600 dark:text-gray-400">
                  {t('weeklyPlan.wizard.maxPrepTime')}: {batchConfig.max_prep_time_minutes} min
                </Text>
              </View>
            ) : null}

            {batchConfig.notes ? (
              <View className="mt-1">
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('weeklyPlan.wizard.batchNotes' as any)}:
                </Text>
                <Text className="text-gray-700 dark:text-gray-300 italic">
                  "{batchConfig.notes}"
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      )}

      {/* Ingredients & extras */}
      {(ingredientsToInclude.length > 0 ||
        ingredientsToExclude.length > 0 ||
        useFavoriteIngredients ||
        specialNotes ||
        Object.keys(effectiveRoutineMeals).length > 0) && (
        <Card variant="outlined" className="mb-4">
          <View className="p-4 gap-2">
            {useFavoriteIngredients && (
              <View className="flex-row items-center gap-2">
                <FontAwesome name="heart" size={14} color={colors.primary} />
                <Text className="text-gray-700 dark:text-gray-300">
                  {t('weeklyPlan.wizard.useFavoriteIngredients')}
                </Text>
              </View>
            )}

            {ingredientsToInclude.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('weeklyPlan.wizard.ingredientsToInclude')}:
                </Text>
                <Text className="text-gray-900 dark:text-gray-50">
                  {ingredientsToInclude.join(', ')}
                </Text>
              </View>
            )}

            {ingredientsToExclude.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('weeklyPlan.wizard.ingredientsToExclude')}:
                </Text>
                <Text className="text-red-600 dark:text-red-400">
                  {ingredientsToExclude.join(', ')}
                </Text>
              </View>
            )}

            {/* Routine meals summary */}
            {Object.keys(effectiveRoutineMeals).length > 0 && (
              <View>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('weeklyPlan.wizard.routineMeals')}:
                </Text>
                {effectiveRoutineMeals.breakfast ? (
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    🍳 {effectiveRoutineMeals.breakfast}
                  </Text>
                ) : null}
                {effectiveRoutineMeals.lunch ? (
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    🍲 {effectiveRoutineMeals.lunch}
                  </Text>
                ) : null}
                {effectiveRoutineMeals.dinner ? (
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    🌙 {effectiveRoutineMeals.dinner}
                  </Text>
                ) : null}
                {effectiveRoutineMeals.snack ? (
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    🍎 {effectiveRoutineMeals.snack}
                  </Text>
                ) : null}
              </View>
            )}

            {specialNotes ? (
              <View>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('weeklyPlan.wizard.specialNotes')}:
                </Text>
                <Text className="text-gray-700 dark:text-gray-300 italic">
                  "{specialNotes}"
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}




