import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Section, Input, NumberInput, DatePicker } from '@/components/ui';
import { useWeeklyPlanStore, useProfileStore } from '@/stores';

export function Step4NutritionAndNotes() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const {
    dailyCalorieTarget,
    specialNotes,
    planName,
    startDate,
    servings,
    setDailyCalorieTarget,
    setSpecialNotes,
    setPlanName,
    setStartDate,
    setServings,
  } = useWeeklyPlanStore();

  const profile = useProfileStore((s) => s.profile);
  const profileCalories = profile?.daily_calorie_goal;

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


