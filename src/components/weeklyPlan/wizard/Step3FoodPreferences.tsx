import {
    Chip,
    ChipGroup,
    Section,
    SwitchItem,
    TagInput,
} from "@/components/ui";
import { cuisines as cuisineConstants } from "@/constants/cuisines";
import { equipment as equipmentConstants } from "@/constants/equipment";
import { useProfileStore, useWeeklyPlanStore } from "@/stores";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

interface ChipOption {
  id: string;
  label: string;
}

export function Step3FoodPreferences() {
  const { t } = useTranslation();
  const [includeText, setIncludeText] = useState("");
  const [excludeText, setExcludeText] = useState("");
  const [hasPrePopulated, setHasPrePopulated] = useState(false);

  const {
    cuisines,
    equipment,
    ingredientsToInclude,
    ingredientsToExclude,
    useFavoriteIngredients,
    setCuisines,
    setEquipment,
    setIngredientsToInclude,
    setIngredientsToExclude,
    setUseFavoriteIngredients,
  } = useWeeklyPlanStore();

  const {
    profile,
    customCuisines: profileCustomCuisines,
    equipment: profileEquipment,
    favoriteIngredients,
  } = useProfileStore();

  // Pre-populate from profile when entering this step for the first time
  useEffect(() => {
    if (hasPrePopulated) return;
    setHasPrePopulated(true);

    // Cuisines: merge profile preferred_cuisines + custom cuisines
    if (cuisines.length === 0) {
      const predefined = profile?.preferred_cuisines || [];
      const customIds = (profileCustomCuisines || [])
        .filter((c) => c.custom_name)
        .map((c) => `custom:${c.custom_name}`);
      const all = [...predefined, ...customIds];
      if (all.length > 0) {
        setCuisines(all);
      }
    }

    // Equipment: merge profile equipment
    if (equipment.length === 0) {
      const allEquip = (profileEquipment || []).map((e) =>
        e.custom_name ? `custom:${e.custom_name}` : e.equipment_type,
      );
      if (allEquip.length > 0) {
        setEquipment(allEquip);
      }
    }
  }, [hasPrePopulated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build cuisine options — with emoji icons like the home recipe filters
  const allCuisineOptions: ChipOption[] = useMemo(() => {
    const standard = cuisineConstants.map((c) => ({
      id: c.id,
      label: `${c.icon} ${String(t(c.labelKey as any, { defaultValue: c.defaultLabel }))}`,
    }));

    const custom = profileCustomCuisines
      .filter((c) => c.custom_name)
      .map((c) => ({
        id: `custom:${c.custom_name}`,
        label: `🍽️ ${c.custom_name}`,
      }));

    return [...standard, ...custom];
  }, [t, profileCustomCuisines]);

  // Build equipment options — with emoji icons like the home recipe filters
  const allEquipmentOptions: ChipOption[] = useMemo(() => {
    const standard = equipmentConstants.map((e) => ({
      id: e.id,
      label: `${e.icon} ${String(t(e.labelKey as any, { defaultValue: e.defaultLabel }))}`,
    }));

    const custom = profileEquipment
      .filter((e) => e.custom_name)
      .map((e) => ({
        id: `custom:${e.custom_name}`,
        label: `🔧 ${e.custom_name}`,
      }));

    return [...standard, ...custom];
  }, [t, profileEquipment]);

  // Ingredient handlers
  const handleAddInclude = () => {
    const trimmed = includeText.trim();
    if (trimmed && !ingredientsToInclude.includes(trimmed)) {
      setIngredientsToInclude([...ingredientsToInclude, trimmed]);
      setIncludeText("");
    }
  };

  const handleAddExclude = () => {
    const trimmed = excludeText.trim();
    if (trimmed && !ingredientsToExclude.includes(trimmed)) {
      setIngredientsToExclude([...ingredientsToExclude, trimmed]);
      setExcludeText("");
    }
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Cuisine preferences */}
      <Section
        title={t("weeklyPlan.wizard.cuisinePreferences")}
        subtitle={t("weeklyPlan.wizard.cuisineHint")}
        className="mb-6"
      >
        <ChipGroup
          chips={allCuisineOptions}
          selectedIds={cuisines}
          onSelectionChange={setCuisines}
          multiple
        />
      </Section>

      {/* Equipment */}
      <Section
        title={t("weeklyPlan.wizard.equipmentAvailable")}
        subtitle={t("weeklyPlan.wizard.equipmentHint")}
        className="mb-6"
      >
        <ChipGroup
          chips={allEquipmentOptions}
          selectedIds={equipment}
          onSelectionChange={setEquipment}
          multiple
        />
      </Section>

      {/* Use favorite ingredients */}
      <View className="mb-3">
        <SwitchItem
          icon="heart"
          label={t("weeklyPlan.wizard.useFavoriteIngredients")}
          description={t("weeklyPlan.wizard.useFavoriteIngredientsHint")}
          value={useFavoriteIngredients}
          onValueChange={setUseFavoriteIngredients}
          className="rounded-xl"
        />
      </View>

      {/* Show selected favorite ingredients when toggled on */}
      {useFavoriteIngredients && favoriteIngredients.length > 0 && (
        <View className="mb-6 px-1">
          <View className="flex-row flex-wrap gap-1.5">
            {favoriteIngredients.map((ing) => (
              <Chip
                key={ing.ingredient_name}
                label={ing.ingredient_name}
                selected
                size="sm"
                icon="heart"
              />
            ))}
          </View>
        </View>
      )}

      {useFavoriteIngredients && favoriteIngredients.length === 0 && (
        <View className="mb-6 px-1">
          <Text className="text-sm text-gray-400 dark:text-gray-500 italic">
            {t("weeklyPlan.wizard.noFavoriteIngredients")}
          </Text>
        </View>
      )}

      {/* Ingredients to include */}
      <Section
        title={t("weeklyPlan.wizard.ingredientsToInclude")}
        className="mb-6"
      >
        <TagInput
          items={ingredientsToInclude}
          inputText={includeText}
          onChangeText={setIncludeText}
          onAdd={handleAddInclude}
          onRemove={(item) =>
            setIngredientsToInclude(
              ingredientsToInclude.filter((i) => i !== item),
            )
          }
          placeholder={t("weeklyPlan.wizard.ingredientsToIncludePlaceholder")}
          chipSize="sm"
        />
      </Section>

      {/* Ingredients to exclude */}
      <Section
        title={t("weeklyPlan.wizard.ingredientsToExclude")}
        className="mb-6"
      >
        <TagInput
          items={ingredientsToExclude}
          inputText={excludeText}
          onChangeText={setExcludeText}
          onAdd={handleAddExclude}
          onRemove={(item) =>
            setIngredientsToExclude(
              ingredientsToExclude.filter((i) => i !== item),
            )
          }
          placeholder={t("weeklyPlan.wizard.ingredientsToExcludePlaceholder")}
          chipSize="sm"
        />
      </Section>
    </ScrollView>
  );
}
