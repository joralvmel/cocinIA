import {
  DaySelector,
  Input,
  NumberInput,
  Section,
  SwitchItem,
  ToggleButtonGroup,
} from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useWeeklyPlanStore } from "@/stores";
import {
  DAYS_OF_WEEK,
  PLAN_MEAL_TYPES,
  type BatchConfig,
  type DayOfWeek,
  type PlanMealType,
} from "@/types";
import { getDayLabel, getMealTypeIcon, getMealTypeLabel } from "@/utils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

// Map DayOfWeek names to display indices (0=Monday, ..., 6=Sunday)
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};
const INDEX_TO_DAY: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function Step1DaysAndMeals() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const [perDayMode, setPerDayMode] = useState(false);

  const {
    selectedDays,
    dayConfigs,
    batchCookingEnabled,
    batchConfig,
    toggleDay,
    setDayMeals,
    setBatchCookingEnabled,
    setBatchConfig,
  } = useWeeklyPlanStore();

  // Day options for toggle group (no longer needed since we use DaySelector)
  const dayLabels = useMemo(() => {
    const isSpanish = i18n.language?.startsWith("es");
    return isSpanish
      ? ["L", "M", "X", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
  }, [i18n.language]);

  // Convert between DayOfWeek names and numeric indices
  const selectedDayIndices = useMemo(
    () => selectedDays.map((d) => DAY_TO_INDEX[d]),
    [selectedDays],
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
    if (selectedDays.length === 0) return ["lunch", "dinner"];
    return dayConfigs[selectedDays[0]].meals;
  };

  const handleDefaultMealsChange = (meals: string[]) => {
    const typedMeals = meals as PlanMealType[];
    selectedDays.forEach((day) => setDayMeals(day, typedMeals));
  };

  // Batch cooking: prep day selection
  const prepDayIndices = useMemo(
    () => batchConfig.prep_days.map((d) => DAY_TO_INDEX[d]),
    [batchConfig.prep_days],
  );

  const handlePrepDaysChange = (indices: number[]) => {
    const days = indices
      .map((i) => INDEX_TO_DAY[i])
      .filter(Boolean) as DayOfWeek[];
    setBatchConfig({ prep_days: days });
  };

  const handleBatchToggle = (enabled: boolean) => {
    setBatchCookingEnabled(enabled);
    // When batch enabled, ensure lunch is in all selected days
    if (enabled) {
      selectedDays.forEach((day) => {
        const meals = dayConfigs[day].meals;
        if (!meals.includes("lunch")) {
          setDayMeals(day, [...meals, "lunch"]);
        }
      });
    }
  };

  const reuseStrategies: {
    value: BatchConfig["reuse_strategy"];
    icon: string;
  }[] = [
    { value: "maximize_reuse", icon: "recycle" },
    { value: "balanced", icon: "balance-scale" },
    { value: "variety", icon: "random" },
  ];

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Days Selection */}
      <Section
        title={t("weeklyPlan.wizard.selectDays")}
        subtitle={t("weeklyPlan.wizard.selectDaysHint")}
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
            {t("weeklyPlan.wizard.noDaysSelected")}
          </Text>
        </View>
      )}

      {selectedDays.length > 0 && (
        <>
          {/* Per-day toggle */}
          <View className="flex-row items-center justify-between mb-4 gap-2">
            <Text
              className="font-medium text-gray-700 dark:text-gray-300 flex-1 flex-shrink"
              numberOfLines={1}
            >
              {perDayMode
                ? t("weeklyPlan.wizard.perDayConfig")
                : t("weeklyPlan.wizard.defaultMeals")}
            </Text>
            <Pressable
              onPress={() => setPerDayMode(!perDayMode)}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
            >
              <FontAwesome
                name={perDayMode ? "th-list" : "th-large"}
                size={14}
                color={colors.primary}
              />
              <Text
                className="text-xs font-medium text-primary-600 dark:text-primary-400"
                numberOfLines={1}
              >
                {perDayMode
                  ? t("weeklyPlan.wizard.switchToDefault")
                  : t("weeklyPlan.wizard.switchToPerDay")}
              </Text>
            </Pressable>
          </View>

          {/* Default meals for all days */}
          {!perDayMode && (
            <Section
              title={t("weeklyPlan.wizard.defaultMeals")}
              className="mb-6"
            >
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
                    {t("weeklyPlan.wizard.step1Title")}
                  </Text>
                  <ToggleButtonGroup
                    options={mealTypeOptions}
                    values={dayConfigs[day].meals}
                    onChange={(meals) =>
                      setDayMeals(day, meals as PlanMealType[])
                    }
                  />
                </View>
              ))}
        </>
      )}

      {/* Batch Cooking */}
      {selectedDays.length > 0 && (
        <>
          <View className="mb-4 mt-2">
            <SwitchItem
              icon="fire"
              label={t("weeklyPlan.wizard.batchCooking")}
              description={t("weeklyPlan.wizard.batchCookingDescription")}
              value={batchCookingEnabled}
              onValueChange={handleBatchToggle}
              className="rounded-xl"
            />
          </View>

          {batchCookingEnabled && (
            <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 gap-5 mb-4">
              {/* Batch info */}
              <View className="flex-row items-center gap-2">
                <FontAwesome
                  name="info-circle"
                  size={14}
                  color={colors.primary}
                />
                <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  {t("weeklyPlan.wizard.batchLunchOnly")}
                </Text>
              </View>

              {/* Prep days */}
              <Section
                title={t("weeklyPlan.wizard.prepDays")}
                subtitle={t("weeklyPlan.wizard.prepDaysHint")}
              >
                <DaySelector
                  selectedDays={prepDayIndices}
                  onChange={handlePrepDaysChange}
                  labels={dayLabels}
                  className="mt-3"
                />
              </Section>

              {/* Max prep time */}
              <Section title={t("weeklyPlan.wizard.maxPrepTime")}>
                <NumberInput
                  value={batchConfig.max_prep_time_minutes || 180}
                  onChange={(val) =>
                    setBatchConfig({ max_prep_time_minutes: val })
                  }
                  min={30}
                  max={480}
                  step={15}
                  unit="min"
                />
              </Section>

              {/* Base preparations count */}
              <Section
                title={t("weeklyPlan.wizard.basePrepsCount")}
                subtitle={t("weeklyPlan.wizard.basePrepsHint")}
              >
                <NumberInput
                  value={batchConfig.base_preparations_count}
                  onChange={(val) =>
                    setBatchConfig({ base_preparations_count: val })
                  }
                  min={1}
                  max={10}
                  step={1}
                />
              </Section>

              {/* Reuse strategy */}
              <Section title={t("weeklyPlan.wizard.reuseStrategy")}>
                <View className="gap-2 mt-3">
                  {reuseStrategies.map((strategy) => {
                    const isSelected =
                      batchConfig.reuse_strategy === strategy.value;
                    return (
                      <Pressable
                        key={strategy.value}
                        onPress={() =>
                          setBatchConfig({ reuse_strategy: strategy.value })
                        }
                        className={`flex-row items-center p-3 rounded-xl border ${
                          isSelected
                            ? "bg-primary-100 dark:bg-primary-900/40 border-primary-600 dark:border-primary-400"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                            isSelected
                              ? "bg-primary-600 dark:bg-primary-500"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <FontAwesome
                            name={strategy.icon as any}
                            size={18}
                            color={isSelected ? "#fff" : colors.textSecondary}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-semibold ${
                              isSelected
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-900 dark:text-gray-50"
                            }`}
                          >
                            {t(
                              `weeklyPlan.wizard.reuse${strategy.value === "maximize_reuse" ? "Maximize" : strategy.value === "balanced" ? "Balanced" : "Variety"}` as any,
                            )}
                          </Text>
                          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {t(
                              `weeklyPlan.wizard.reuse${strategy.value === "maximize_reuse" ? "Maximize" : strategy.value === "balanced" ? "Balanced" : "Variety"}Desc` as any,
                            )}
                          </Text>
                        </View>
                        {isSelected && (
                          <FontAwesome
                            name="check-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {/* Batch notes */}
              <Input
                label={t("weeklyPlan.wizard.batchNotes")}
                placeholder={t("weeklyPlan.wizard.batchNotesPlaceholder")}
                value={batchConfig.notes || ""}
                onChangeText={(text) => setBatchConfig({ notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
