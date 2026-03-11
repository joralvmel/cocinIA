import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Section, Input, NumberInput, DatePicker, SwitchItem } from '@/components/ui';
import { useWeeklyPlanStore, useProfileStore } from '@/stores';
import { getMealTypeLabel, MEAL_TYPE_ORDER } from '@/utils';
import type { PlanMealType } from '@/types';

const MEAL_EMOJI: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🍲',
  dinner: '🌙',
  snack: '🍎',
};

export function Step4NutritionAndNotes() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const {
    dailyCalorieTarget,
    specialNotes,
    planName,
    startDate,
    servings,
    useProfileRoutineMeals,
    selectedDays,
    dayConfigs,
    setDailyCalorieTarget,
    setSpecialNotes,
    setPlanName,
    setStartDate,
    setServings,
    setUseProfileRoutineMeals,
  } = useWeeklyPlanStore();

  const profile = useProfileStore((s) => s.profile);
  const profileCalories = profile?.daily_calorie_goal;
  const profileRoutineMeals = useProfileStore((s) => s.routineMeals);

  // Check if profile has any routine meals configured
  const hasProfileRoutineMeals = profileRoutineMeals.some((m) => m.description.trim());

  // Get unique meal types across selected days
  const uniqueMealTypes = React.useMemo(() => {
    const types = new Set<PlanMealType>();
    selectedDays.forEach((day) => dayConfigs[day].meals.forEach((m) => types.add(m)));
    return Array.from(types).sort((a, b) => {
      return (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99);
    });
  }, [selectedDays, dayConfigs]);

  // Get effective routine meal text for a given type (from profile)
  const getEffectiveRoutine = (mealType: string): string => {
    if (useProfileRoutineMeals) {
      return profileRoutineMeals.find((m) => m.meal_type === mealType)?.description || '';
    }
    return '';
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
    >
      {/* Plan name */}
      <Section className="mb-6">
        <Input
          label={t('weeklyPlan.wizard.planName')}
          placeholder={t('weeklyPlan.wizard.planNamePlaceholder')}
          value={planName}
          onChangeText={setPlanName}
        />
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {t('weeklyPlan.wizard.planNameAuto')}
        </Text>
      </Section>

      {/* Start date */}
      <Section className="mb-6">
        <DatePicker
          label={t('weeklyPlan.wizard.startDate')}
          value={startDate || ''}
          onChange={(date) => setStartDate(date)}
          minYear={new Date().getFullYear()}
          maxYear={new Date().getFullYear() + 1}
        />
      </Section>

      {/* Servings per recipe */}
      <Section
        title={t('weeklyPlan.wizard.servings')}
        subtitle={t('weeklyPlan.wizard.servingsHint')}
        className="mb-6"
      >
        <View className="mt-3">
          <NumberInput
            value={servings}
            onChange={setServings}
            min={1}
            max={20}
            step={1}
          />
        </View>
      </Section>

      {/* Daily calorie target */}
      <Section
        title={t('weeklyPlan.wizard.dailyCalorieTarget')}
        subtitle={t('weeklyPlan.wizard.dailyCalorieHint')}
        className="mb-6"
      >
        <View className="mt-3">
          <NumberInput
            value={dailyCalorieTarget || 2000}
            onChange={(val) => setDailyCalorieTarget(val || undefined)}
            min={500}
            max={10000}
            step={50}
            unit="cal"
          />

          {profileCalories && (
            <Pressable
              onPress={() => setDailyCalorieTarget(profileCalories)}
              className="flex-row items-center mt-2 gap-2"
            >
              <FontAwesome name="user" size={14} color={colors.primary} />
              <Text className="text-sm text-primary-600 dark:text-primary-400">
                {t('weeklyPlan.wizard.fromProfile')}: {profileCalories} cal
              </Text>
            </Pressable>
          )}
        </View>
      </Section>

      {/* Routine Meals */}
      <Section
        title={t('weeklyPlan.wizard.routineMeals')}
        subtitle={t('weeklyPlan.wizard.routineMealsHint')}
        className="mb-6"
      >
        {/* Toggle to use profile routine meals */}
        <View className="mt-3">
          <SwitchItem
            icon="user"
            label={t('weeklyPlan.wizard.useProfileRoutineMeals')}
            description={
              hasProfileRoutineMeals
                ? t('weeklyPlan.wizard.useProfileRoutineMealsHint')
                : t('weeklyPlan.wizard.noProfileRoutineMeals')
            }
            value={useProfileRoutineMeals && hasProfileRoutineMeals}
            onValueChange={setUseProfileRoutineMeals}
            disabled={!hasProfileRoutineMeals}
            className="rounded-xl"
          />
        </View>

        {/* Link to edit profile routine meals */}
        <Pressable
          onPress={() => router.push('/profile/edit-routine-meals' as any)}
          className="flex-row items-center gap-2 mt-3 px-1"
        >
          <FontAwesome name="pencil" size={12} color={colors.primary} />
          <Text className="text-sm text-primary-600 dark:text-primary-400">
            {t('weeklyPlan.wizard.editProfileRoutineMeals')}
          </Text>
        </Pressable>

        {/* Preview of active routine meals */}
        {(useProfileRoutineMeals && hasProfileRoutineMeals) && (
          <View className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 gap-2">
            {uniqueMealTypes.map((mealType) => {
              const text = getEffectiveRoutine(mealType);
              if (!text) return null;
              return (
                <View key={mealType} className="flex-row items-start gap-2">
                  <Text className="text-sm">{MEAL_EMOJI[mealType] || '🍽️'}</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {getMealTypeLabel(mealType, t)}
                    </Text>
                    <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={2}>
                      {text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Section>

      {/* Special notes */}
      <Section
        title={t('weeklyPlan.wizard.specialNotes')}
        className="mb-6"
      >
        <Input
          placeholder={t('weeklyPlan.wizard.specialNotesPlaceholder')}
          value={specialNotes}
          onChangeText={setSpecialNotes}
          multiline
          numberOfLines={4}
          className="mt-2"
        />
      </Section>
    </ScrollView>
  );
}


