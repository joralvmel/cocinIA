import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup, Section, RangeSlider } from '@/components/ui';
import type { ChipOption } from '@/hooks/useRecipeFilters';
import type { RecipeSearchForm } from '@/types';

interface FilterOptionsSectionProps {
  form: RecipeSearchForm;

  // Option arrays
  mealTypeOptions: ChipOption[];
  servingsOptions: ChipOption[];
  timeOptions: ChipOption[];
  difficultyOptions: ChipOption[];
  allCuisineOptions: ChipOption[];
  allEquipmentOptions: ChipOption[];

  // Callbacks
  onMealTypesChange: (ids: string[]) => void;
  onServingsChange: (ids: string[]) => void;
  onMaxTimeChange: (ids: string[]) => void;
  onMaxCaloriesChange: (value: number) => void;
  onCuisinesChange: (ids: string[]) => void;
  onEquipmentChange: (ids: string[]) => void;
  onDifficultyChange: (ids: string[]) => void;
}

export function FilterOptionsSection({
  form,
  mealTypeOptions,
  servingsOptions,
  timeOptions,
  difficultyOptions,
  allCuisineOptions,
  allEquipmentOptions,
  onMealTypesChange,
  onServingsChange,
  onMaxTimeChange,
  onMaxCaloriesChange,
  onCuisinesChange,
  onEquipmentChange,
  onDifficultyChange,
}: FilterOptionsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Meal Type */}
      <Section title={String(t('recipeGeneration.mealType'))}>
        <ChipGroup
          chips={mealTypeOptions}
          selectedIds={form.mealTypes}
          onSelectionChange={onMealTypesChange}
          multiple
        />
      </Section>

      {/* Servings */}
      <Section title={String(t('recipeGeneration.servings'))}>
        <ChipGroup
          chips={servingsOptions}
          selectedIds={form.servings ? [String(form.servings)] : []}
          onSelectionChange={onServingsChange}
          multiple={false}
        />
      </Section>

      {/* Max Time */}
      <Section title={String(t('recipeGeneration.maxTime'))}>
        <ChipGroup
          chips={timeOptions}
          selectedIds={form.maxTime ? [String(form.maxTime)] : []}
          onSelectionChange={onMaxTimeChange}
          multiple={false}
        />
      </Section>

      {/* Max Calories */}
      <Section title={String(t('recipeGeneration.maxCalories' as any))}>
        <RangeSlider
          min={100}
          max={1500}
          step={50}
          value={form.maxCalories ?? 1500}
          onValueChange={onMaxCaloriesChange}
          formatLabel={(v) =>
            v >= 1500 ? String(t('recipeGeneration.noLimit' as any)) : `${v} kcal`
          }
        />
      </Section>

      {/* Cuisine */}
      <Section title={String(t('recipeGeneration.cuisine'))}>
        <ChipGroup
          chips={allCuisineOptions}
          selectedIds={form.cuisines}
          onSelectionChange={onCuisinesChange}
          multiple
        />
      </Section>

      {/* Equipment */}
      <Section title={String(t('profile.equipment'))}>
        <ChipGroup
          chips={allEquipmentOptions}
          selectedIds={form.equipment || []}
          onSelectionChange={onEquipmentChange}
          multiple
        />
      </Section>

      {/* Difficulty */}
      <Section title={String(t('recipeGeneration.difficulty'))}>
        <ChipGroup
          chips={difficultyOptions}
          selectedIds={form.difficulty ? [form.difficulty] : []}
          onSelectionChange={onDifficultyChange}
          multiple={false}
        />
      </Section>
    </>
  );
}

