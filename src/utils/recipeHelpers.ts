import type { Ingredient } from '@/types';

/**
 * Returns a Badge-compatible color string for a difficulty level.
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Returns the localised label for a difficulty level.
 */
export function getDifficultyLabel(
  difficulty: string,
  t: (key: string) => string,
): string {
  switch (difficulty) {
    case 'easy':
      return String(t('recipeGeneration.difficultyEasy'));
    case 'medium':
      return String(t('recipeGeneration.difficultyMedium'));
    case 'hard':
      return String(t('recipeGeneration.difficultyHard'));
    default:
      return difficulty;
  }
}

/**
 * Adjusts ingredient quantities by a serving ratio.
 * Returns a new array — does not mutate.
 */
export function adjustIngredientsForServings(
  ingredients: Ingredient[],
  ratio: number,
): Ingredient[] {
  if (ratio === 1) return ingredients;
  return ingredients.map((ing) => ({
    ...ing,
    quantity: Math.round(ing.quantity * ratio * 100) / 100,
  }));
}

/**
 * Adjusts a total cost value by a serving ratio.
 */
export function adjustCostForServings(
  cost: number,
  ratio: number,
): number {
  if (ratio === 1) return cost;
  return Math.round(cost * ratio * 100) / 100;
}

/**
 * Builds the difficulty chip definitions for filter UIs.
 */
export function getDifficultyChips(t: (key: string) => string) {
  return [
    { id: 'easy', label: String(t('recipeGeneration.difficultyEasy')) },
    { id: 'medium', label: String(t('recipeGeneration.difficultyMedium')) },
    { id: 'hard', label: String(t('recipeGeneration.difficultyHard')) },
  ];
}

/**
 * Builds the meal-type chip definitions for filter UIs.
 */
export function getMealTypeChips(t: (key: string) => string) {
  return [
    { id: 'breakfast', label: String(t('recipeGeneration.mealTypes.breakfast')) },
    { id: 'lunch', label: String(t('recipeGeneration.mealTypes.lunch')) },
    { id: 'dinner', label: String(t('recipeGeneration.mealTypes.dinner')) },
    { id: 'snack', label: String(t('recipeGeneration.mealTypes.snack')) },
    { id: 'dessert', label: String(t('recipeGeneration.mealTypes.dessert')) },
  ];
}

/**
 * Static time-range chip definitions for filter UIs.
 */
export const TIME_CHIPS = [
  { id: '15', label: '≤ 15 min' },
  { id: '30', label: '≤ 30 min' },
  { id: '45', label: '≤ 45 min' },
  { id: '60', label: '≤ 1h' },
  { id: '90', label: '≤ 1.5h' },
  { id: '120', label: '≤ 2h' },
];

