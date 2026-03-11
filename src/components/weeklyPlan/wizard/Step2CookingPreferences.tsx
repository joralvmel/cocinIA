import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Section, SwitchItem, NumberInput, DaySelector, Input } from '@/components/ui';
import { useWeeklyPlanStore } from '@/stores';
import { DAYS_OF_WEEK, type DayOfWeek, type BatchConfig, type PlanMealType } from '@/types';
import { getMealTypeLabel, getMealTypeIcon, MEAL_TYPE_ORDER } from '@/utils';

// Map DayOfWeek names to display indices (0=Monday, ..., 6=Sunday)
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
};
const INDEX_TO_DAY: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function Step2CookingPreferences() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const {
    selectedDays,
    batchCookingEnabled,
    batchConfig,
    cookingTimeByMealType,
    setBatchCookingEnabled,
    setBatchConfig,
    setCookingTimeByMealType,
    dayConfigs,
  } = useWeeklyPlanStore();

  // Get unique meal types from all selected days
  const uniqueMealTypes = useMemo(() => {
    const types = new Set<PlanMealType>();
    selectedDays.forEach((day) => dayConfigs[day].meals.forEach((m) => types.add(m)));
    return Array.from(types).sort((a, b) => {
      return (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99);
    });
  }, [selectedDays, dayConfigs]);

  const dayLabels = useMemo(() => {
    const isSpanish = i18n.language?.startsWith('es');
    return isSpanish
      ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
      : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }, [i18n.language]);

  // Prep day indices for DaySelector
  const prepDayIndices = useMemo(
    () => batchConfig.prep_days.map((d) => DAY_TO_INDEX[d]),
    [batchConfig.prep_days]
  );

  const handlePrepDaysChange = (indices: number[]) => {
    const days = indices.map((i) => INDEX_TO_DAY[i]).filter(Boolean) as DayOfWeek[];
    setBatchConfig({ prep_days: days });
  };

  const reuseStrategies: { value: BatchConfig['reuse_strategy']; icon: string }[] = [
    { value: 'maximize_reuse', icon: 'recycle' },
    { value: 'balanced', icon: 'balance-scale' },
    { value: 'variety', icon: 'random' },
  ];

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
    >
      {/* Cooking time by meal type */}
      <Section
        title={t('weeklyPlan.wizard.cookingTime')}
        subtitle={t('weeklyPlan.wizard.cookingTimeHint')}
        className="mb-6"
      >
        <View className="mt-3 gap-4">
          {uniqueMealTypes.map((mealType) => (
            <View key={mealType}>
              <View className="flex-row items-center gap-2 mb-2">
                <FontAwesome name={getMealTypeIcon(mealType) as any} size={14} color={colors.primary} />
                <Text className="font-medium text-gray-700 dark:text-gray-300">
                  {getMealTypeLabel(mealType, t)}
                </Text>
              </View>
              <NumberInput
                value={cookingTimeByMealType[mealType] ?? 30}
                onChange={(val) => setCookingTimeByMealType(mealType, val)}
                min={5}
                max={480}
                step={5}
                unit="min"
              />
            </View>
          ))}
        </View>
      </Section>

      {/* Batch Cooking Toggle */}
      <View className="mb-6">
        <SwitchItem
          icon="fire"
          label={t('weeklyPlan.wizard.batchCooking')}
          description={t('weeklyPlan.wizard.batchCookingDescription')}
          value={batchCookingEnabled}
          onValueChange={setBatchCookingEnabled}
          className="rounded-xl"
        />
      </View>

      {/* Batch Cooking Options */}
      {batchCookingEnabled && (
        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 gap-5">
          {/* Prep days */}
          <Section
            title={t('weeklyPlan.wizard.prepDays')}
            subtitle={t('weeklyPlan.wizard.prepDaysHint')}
          >
            <DaySelector
              selectedDays={prepDayIndices}
              onChange={handlePrepDaysChange}
              labels={dayLabels}
              className="mt-3"
            />
          </Section>

          {/* Max prep time */}
          <Section title={t('weeklyPlan.wizard.maxPrepTime')}>
            <NumberInput
              value={batchConfig.max_prep_time_minutes || 180}
              onChange={(val) => setBatchConfig({ max_prep_time_minutes: val })}
              min={30}
              max={480}
              step={15}
              unit="min"
            />
          </Section>

          {/* Base preparations count */}
          <Section
            title={t('weeklyPlan.wizard.basePrepsCount')}
            subtitle={t('weeklyPlan.wizard.basePrepsHint')}
          >
            <NumberInput
              value={batchConfig.base_preparations_count}
              onChange={(val) => setBatchConfig({ base_preparations_count: val })}
              min={1}
              max={10}
              step={1}
            />
          </Section>

          {/* Reuse strategy */}
          <Section
            title={t('weeklyPlan.wizard.reuseStrategy')}
          >
            <View className="gap-2 mt-3">
              {reuseStrategies.map((strategy) => {
                const isSelected = batchConfig.reuse_strategy === strategy.value;
                return (
                  <Pressable
                    key={strategy.value}
                    onPress={() => setBatchConfig({ reuse_strategy: strategy.value })}
                    className={`flex-row items-center p-3 rounded-xl border ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-600 dark:border-primary-400'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        isSelected
                          ? 'bg-primary-600 dark:bg-primary-500'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <FontAwesome
                        name={strategy.icon as any}
                        size={18}
                        color={isSelected ? '#fff' : colors.textSecondary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${
                          isSelected
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-900 dark:text-gray-50'
                        }`}
                      >
                        {t(`weeklyPlan.wizard.reuse${strategy.value === 'maximize_reuse' ? 'Maximize' : strategy.value === 'balanced' ? 'Balanced' : 'Variety'}` as any)}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t(`weeklyPlan.wizard.reuse${strategy.value === 'maximize_reuse' ? 'Maximize' : strategy.value === 'balanced' ? 'Balanced' : 'Variety'}Desc` as any)}
                      </Text>
                    </View>
                    {isSelected && (
                      <FontAwesome name="check-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Batch notes */}
          <Input
            label={t('weeklyPlan.wizard.batchNotes')}
            placeholder={t('weeklyPlan.wizard.batchNotesPlaceholder')}
            value={batchConfig.notes || ''}
            onChangeText={(text) => setBatchConfig({ notes: text })}
            multiline
            numberOfLines={3}
          />
        </View>
      )}
    </ScrollView>
  );
}




