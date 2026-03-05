import type { RecipeSearchForm } from '@/types';

export interface FilterChip {
  key: string;
  label: string;
}

/**
 * Returns true when the form has at least one advanced filter set.
 */
export function hasActiveFilters(form: RecipeSearchForm): boolean {
  return (
    form.ingredientsToUse.length > 0 ||
    form.ingredientsToExclude.length > 0 ||
    form.mealTypes.length > 0 ||
    form.cuisines.length > 0 ||
    (form.equipment != null && form.equipment.length > 0) ||
    form.maxTime != null ||
    form.difficulty != null ||
    form.servings != null ||
    form.maxCalories != null ||
    form.useFavoriteIngredients
  );
}

/**
 * Builds a plain array of filter chips from the current form state.
 *
 * `t` is the i18next translation function so we keep this file free of
 * React imports while still producing localised labels.
 */
export function buildActiveFilterChips(
  form: RecipeSearchForm,
  t: (key: string, opts?: Record<string, unknown>) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];

  if (form.useFavoriteIngredients) {
    chips.push({ key: 'favorites', label: `❤️ ${String(t('recipeGeneration.favorites'))}` });
  }
  if (form.ingredientsToUse.length > 0) {
    chips.push({
      key: 'ingredients',
      label: `+${form.ingredientsToUse.length} ${t('recipeGeneration.ingredients')}`,
    });
  }
  if (form.ingredientsToExclude.length > 0) {
    chips.push({
      key: 'excluded',
      label: `-${form.ingredientsToExclude.length} ${t('recipeGeneration.excluded')}`,
    });
  }
  form.mealTypes.forEach((type) => {
    chips.push({ key: type, label: t(`recipeGeneration.mealTypes.${type}`) });
  });
  if (form.servings) {
    chips.push({ key: 'servings', label: `👥 ${form.servings}` });
  }
  form.cuisines.slice(0, 2).forEach((cuisine) => {
    const displayName = cuisine.startsWith('custom:')
      ? cuisine.substring('custom:'.length)
      : t(`cuisines.${cuisine}`, { defaultValue: cuisine });
    chips.push({ key: cuisine, label: displayName });
  });
  if (form.cuisines.length > 2) {
    chips.push({ key: 'more-cuisines', label: `+${form.cuisines.length - 2}` });
  }
  if (form.equipment && form.equipment.length > 0) {
    chips.push({ key: 'equipment', label: `🔧 ${form.equipment.length}` });
  }
  if (form.maxTime) {
    chips.push({ key: 'time', label: `⏱️ ${form.maxTime}min` });
  }
  if (form.maxCalories) {
    chips.push({ key: 'calories', label: `🔥 <${form.maxCalories}` });
  }
  if (form.difficulty) {
    const diffLabel =
      form.difficulty === 'easy'
        ? String(t('recipeGeneration.difficultyEasy'))
        : form.difficulty === 'medium'
          ? String(t('recipeGeneration.difficultyMedium'))
          : String(t('recipeGeneration.difficultyHard'));
    chips.push({ key: 'difficulty', label: diffLabel });
  }

  return chips;
}


