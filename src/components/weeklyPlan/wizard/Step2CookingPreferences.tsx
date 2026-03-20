import { NumberInput, Section } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useWeeklyPlanStore } from "@/stores";
import { type PlanMealType } from "@/types";
import { getMealTypeIcon, getMealTypeLabel, MEAL_TYPE_ORDER } from "@/utils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export function Step2CookingPreferences() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const {
    selectedDays,
    batchCookingEnabled,
    cookingTimeByMealType,
    setCookingTimeByMealType,
    dayConfigs,
  } = useWeeklyPlanStore();

  // Get unique meal types from all selected days, excluding lunch when batch cooking
  const uniqueMealTypes = useMemo(() => {
    const types = new Set<PlanMealType>();
    selectedDays.forEach((day) =>
      dayConfigs[day].meals.forEach((m) => types.add(m)),
    );
    // When batch cooking is active, lunch time is covered by the batch prep time
    if (batchCookingEnabled) types.delete("lunch");
    return Array.from(types).sort((a, b) => {
      return (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99);
    });
  }, [selectedDays, dayConfigs, batchCookingEnabled]);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
      keyboardShouldPersistTaps="handled"
    >
      {/* Cooking time by meal type */}
      <Section
        title={t("weeklyPlan.wizard.cookingTime")}
        subtitle={t("weeklyPlan.wizard.cookingTimeHint")}
        className="mb-6"
      >
        {batchCookingEnabled && (
          <View className="flex-row items-center gap-2 mt-2 mb-1 px-1">
            <FontAwesome name="info-circle" size={13} color={colors.primary} />
            <Text className="text-xs text-primary-600 dark:text-primary-400 flex-1">
              {t("weeklyPlan.wizard.batchLunchTimeNote")}
            </Text>
          </View>
        )}

        {uniqueMealTypes.length > 0 ? (
          <View className="mt-3 gap-4">
            {uniqueMealTypes.map((mealType) => (
              <View key={mealType}>
                <View className="flex-row items-center gap-2 mb-2">
                  <FontAwesome
                    name={getMealTypeIcon(mealType) as any}
                    size={14}
                    color={colors.primary}
                  />
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
        ) : (
          <View className="mt-3 items-center py-4">
            <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
              {t("weeklyPlan.wizard.onlyBatchMeals")}
            </Text>
          </View>
        )}
      </Section>
    </ScrollView>
  );
}
