import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge } from '@/components/ui';
import { useWeeklyPlanStore } from '@/stores';
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
    cuisines,
    ingredientsToInclude,
    ingredientsToExclude,
    useFavoriteIngredients,
    dailyCalorieTarget,
    specialNotes,
    planName,
    startDate,
  } = useWeeklyPlanStore();

  // Calculate total meals
  const totalMeals = selectedDays.reduce((sum, day) => {
    const cfg = dayConfigs[day];
    const homeMeals = cfg.meals.filter((m) => !cfg.eatingOut.includes(m)).length;
    return sum + homeMeals;
  }, 0);

  const totalEatingOut = selectedDays.reduce((sum, day) => {
    return sum + dayConfigs[day].eatingOut.length;
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
            value={`${totalMeals} + ${totalEatingOut} ${t('weeklyPlan.wizard.eatingOut' as any)}`}
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
                    {cfg.meals.map((meal) => {
                      const isEatingOut = cfg.eatingOut.includes(meal);
                      return (
                        <Badge
                          key={meal}
                          variant={isEatingOut ? 'warning' : 'primary'}
                          size="sm"
                          label={`${getMealTypeLabel(meal, t)}${isEatingOut ? ' 🍽️' : ''}`}
                        />
                      );
                    })}
                  </View>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">
                    {cfg.cookingTimeMinutes}min
                  </Text>
                </View>
              );
            })}
        </View>
      </Card>

      {/* Ingredients & extras */}
      {(ingredientsToInclude.length > 0 ||
        ingredientsToExclude.length > 0 ||
        useFavoriteIngredients ||
        specialNotes) && (
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




