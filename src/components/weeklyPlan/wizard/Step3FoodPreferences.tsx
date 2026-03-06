import React, { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Section, ChipGroup, SwitchItem, Input } from '@/components/ui';
import { useWeeklyPlanStore, useProfileStore } from '@/stores';
import { cuisines as cuisineConstants } from '@/constants/cuisines';
import { equipment as equipmentConstants } from '@/constants/equipment';

interface ChipOption {
  id: string;
  label: string;
}

export function Step3FoodPreferences() {
  const { t } = useTranslation();
  const [includeText, setIncludeText] = useState('');
  const [excludeText, setExcludeText] = useState('');

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

  const { customCuisines: profileCustomCuisines, equipment: profileEquipment } = useProfileStore();

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

  // Ingredient chip handling
  const handleAddInclude = () => {
    const trimmed = includeText.trim();
    if (trimmed && !ingredientsToInclude.includes(trimmed)) {
      setIngredientsToInclude([...ingredientsToInclude, trimmed]);
      setIncludeText('');
    }
  };

  const handleRemoveInclude = (ingredient: string) => {
    setIngredientsToInclude(ingredientsToInclude.filter((i) => i !== ingredient));
  };

  const handleAddExclude = () => {
    const trimmed = excludeText.trim();
    if (trimmed && !ingredientsToExclude.includes(trimmed)) {
      setIngredientsToExclude([...ingredientsToExclude, trimmed]);
      setExcludeText('');
    }
  };

  const handleRemoveExclude = (ingredient: string) => {
    setIngredientsToExclude(ingredientsToExclude.filter((i) => i !== ingredient));
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-8"
    >
      {/* Cuisine preferences */}
      <Section
        title={t('weeklyPlan.wizard.cuisinePreferences')}
        subtitle={t('weeklyPlan.wizard.cuisineHint')}
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
        title={t('weeklyPlan.wizard.equipmentAvailable')}
        subtitle={t('weeklyPlan.wizard.equipmentHint')}
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
      <View className="mb-6">
        <SwitchItem
          icon="heart"
          label={t('weeklyPlan.wizard.useFavoriteIngredients')}
          description={t('weeklyPlan.wizard.useFavoriteIngredientsHint')}
          value={useFavoriteIngredients}
          onValueChange={setUseFavoriteIngredients}
          className="rounded-xl"
        />
      </View>

      {/* Ingredients to include */}
      <Section
        title={t('weeklyPlan.wizard.ingredientsToInclude')}
        className="mb-6"
      >
        <Input
          placeholder={t('weeklyPlan.wizard.ingredientsToIncludePlaceholder')}
          value={includeText}
          onChangeText={setIncludeText}
          onSubmitEditing={handleAddInclude}
          returnKeyType="done"
        />
        {ingredientsToInclude.length > 0 && (
          <ChipGroup
            chips={ingredientsToInclude.map((i) => ({ id: i, label: i }))}
            selectedIds={ingredientsToInclude}
            onSelectionChange={(ids) => {
              // If chip was deselected, remove it
              const removed = ingredientsToInclude.filter((i) => !ids.includes(i));
              removed.forEach(handleRemoveInclude);
            }}
            multiple
          />
        )}
      </Section>

      {/* Ingredients to exclude */}
      <Section
        title={t('weeklyPlan.wizard.ingredientsToExclude')}
        className="mb-6"
      >
        <Input
          placeholder={t('weeklyPlan.wizard.ingredientsToExcludePlaceholder')}
          value={excludeText}
          onChangeText={setExcludeText}
          onSubmitEditing={handleAddExclude}
          returnKeyType="done"
        />
        {ingredientsToExclude.length > 0 && (
          <ChipGroup
            chips={ingredientsToExclude.map((i) => ({ id: i, label: i }))}
            selectedIds={ingredientsToExclude}
            onSelectionChange={(ids) => {
              const removed = ingredientsToExclude.filter((i) => !ids.includes(i));
              removed.forEach(handleRemoveExclude);
            }}
            multiple
          />
        )}
      </Section>
    </ScrollView>
  );
}

