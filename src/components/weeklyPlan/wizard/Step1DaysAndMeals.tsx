import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Section, ToggleButtonGroup, SwitchItem, DaySelector } from '@/components/ui';
import { useWeeklyPlanStore } from '@/stores';
import { DAYS_OF_WEEK, PLAN_MEAL_TYPES, type DayOfWeek, type PlanMealType } from '@/types';
import { getDayLabel, getMealTypeLabel, getMealTypeIcon } from '@/utils';

// Map DayOfWeek names to display indices (0=Monday, ..., 6=Sunday)
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
};
const INDEX_TO_DAY: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Step1DaysAndMeals() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const [perDayMode, setPerDayMode] = useState(false);

  const {
    selectedDays,
    dayConfigs,
    toggleDay,
    setDayMeals,
    toggleDayEatingOut,
  } = useWeeklyPlanStore();

  // Day options for toggle group (no longer needed since we use DaySelector)
  const dayLabels = useMemo(() => {
    const isSpanish = i18n.language?.startsWith('es');
    return isSpanish
      ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }, [i18n.language]);

  // Convert between DayOfWeek names and numeric indices
  const selectedDayIndices = useMemo(
    () => selectedDays.map((d) => DAY_TO_INDEX[d]),
    [selectedDays]
  );

  const handleDayIndicesChange = (indices: number[]) => {
    const days = indices.map((i) => INDEX_TO_DAY[i]).filter(Boolean);
    // Use toggleDay approach to sync configs
    const currentSet = new Set(selectedDays);
    const newSet = new Set(days);
    // Remove deselected
    for (const d of selectedDays) {
      if (!newSet.has(d)) toggleDay(d);
    }
    // Add newly selected
    for (const d of days) {
      if (!currentSet.has(d)) toggleDay(d);
    }
  };

  // Meal type options
  const mealTypeOptions = PLAN_MEAL_TYPES.map((type) => ({
    value: type,
    label: getMealTypeLabel(type, t),
    icon: getMealTypeIcon(type) as any,
  }));

  // Get all unique meals across selected days for default mode
  const getDefaultMeals = (): PlanMealType[] => {
    if (selectedDays.length === 0) return ['lunch', 'dinner'];
    return dayConfigs[selectedDays[0]].meals;
  };

  const handleDefaultMealsChange = (meals: string[]) => {
    const typedMeals = meals as PlanMealType[];
    selectedDays.forEach((day) => setDayMeals(day, typedMeals));
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
    >
      {/* Days Selection */}
      <Section
        title={t('weeklyPlan.wizard.selectDays')}
        subtitle={t('weeklyPlan.wizard.selectDaysHint')}
        className="mb-6"
      >
        <DaySelector
          selectedDays={selectedDayIndices}
          onChange={handleDayIndicesChange}
          labels={dayLabels}
          className="mt-3"
        />
      </Section>

      {selectedDays.length === 0 && (
        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
          <Text className="text-amber-700 dark:text-amber-400 text-center font-medium">
            {t('weeklyPlan.wizard.noDaysSelected')}
          </Text>
        </View>
      )}

      {selectedDays.length > 0 && (
        <>
          {/* Per-day toggle */}
          <View className="flex-row items-center justify-between mb-4 gap-2">
            <Text className="font-medium text-gray-700 dark:text-gray-300 flex-1 flex-shrink" numberOfLines={1}>
              {perDayMode
                ? t('weeklyPlan.wizard.perDayConfig')
                : t('weeklyPlan.wizard.defaultMeals')}
            </Text>
            <Pressable
              onPress={() => setPerDayMode(!perDayMode)}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
            >
              <FontAwesome
                name={perDayMode ? 'th-list' : 'th-large'}
                size={14}
                color={colors.primary}
              />
              <Text className="text-xs font-medium text-primary-600 dark:text-primary-400" numberOfLines={1}>
                {perDayMode
                  ? t('weeklyPlan.wizard.switchToDefault')
                  : t('weeklyPlan.wizard.switchToPerDay')}
              </Text>
            </Pressable>
          </View>

          {/* Default meals for all days */}
          {!perDayMode && (
            <Section title={t('weeklyPlan.wizard.defaultMeals')} className="mb-6">
              <ToggleButtonGroup
                options={mealTypeOptions}
                values={getDefaultMeals()}
                onChange={handleDefaultMealsChange}
                className="mt-3"
              />
            </Section>
          )}

          {/* Per-day configuration */}
          {perDayMode &&
            selectedDays
              .sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b))
              .map((day) => (
                <View
                  key={day}
                  className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
                >
                  <Text className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
                    {getDayLabel(day, t)}
                  </Text>

                  {/* Meal types for this day */}
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t('weeklyPlan.wizard.step1Title')}
                  </Text>
                  <ToggleButtonGroup
                    options={mealTypeOptions}
                    values={dayConfigs[day].meals}
                    onChange={(meals) => setDayMeals(day, meals as PlanMealType[])}
                    className="mb-3"
                  />

                  {/* Eating out for this day */}
                  {dayConfigs[day].meals.length > 0 && (
                    <>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t('weeklyPlan.wizard.eatingOut')}
                      </Text>
                      <View className="gap-1">
                        {dayConfigs[day].meals.map((mealType) => (
                          <SwitchItem
                            key={`${day}-${mealType}`}
                            icon={getMealTypeIcon(mealType) as any}
                            label={getMealTypeLabel(mealType, t)}
                            description={t('weeklyPlan.wizard.eatingOutHint')}
                            value={dayConfigs[day].eatingOut.includes(mealType)}
                            onValueChange={() => toggleDayEatingOut(day, mealType)}
                            className="rounded-lg"
                          />
                        ))}
                      </View>
                    </>
                  )}
                </View>
              ))}
        </>
      )}
    </ScrollView>
  );
}

