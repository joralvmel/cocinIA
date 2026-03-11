/**
 * Utility functions
 * Export all your helpers from here
 */

// Nutrition calculations
export {
  calculateBMR,
  calculateTDEE,
  calculateAge,
  calculateNutritionGoals,
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  type FitnessGoal,
  type NutritionGoals,
} from './nutrition';

// Profile completion
export {
  calculateProfileCompletion,
  getCompletionMessage,
  getNextRecommendedCategory,
  type ProfileCompletionResult,
} from './profileCompletion';

// Recipe events
export { recipeEvents } from './recipeEvents';

// Weekly plan events
export { weeklyPlanEvents } from './weeklyPlanEvents';

// Weekly plan helpers
export {
  getDayLabel,
  getDayShortLabel,
  getMealTypeLabel,
  getMealTypeIcon,
  getDayIndex,
  groupMealsByDay,
  calculatePlanCalories,
  calculateDayCalories,
  getWeekDateRange,
  formatDateRange,
  getNextMonday,
  getCurrentDayOfWeek,
  getMealTypeSortOrder,
  countPlanMeals,
  isDateInPlan,
  getDefaultDayConfigs,
  MEAL_TYPE_ORDER,
  sortMealTypes,
} from './weeklyPlanHelpers';

// Recipe filter helpers
export {
  hasActiveFilters,
  buildActiveFilterChips,
  type FilterChip,
} from './recipeFilters';

// Recipe helpers
export {
  getDifficultyColor,
  getDifficultyLabel,
  adjustIngredientsForServings,
  adjustCostForServings,
  getDifficultyChips,
  getMealTypeChips,
  TIME_CHIPS,
} from './recipeHelpers';

// Validation
export { validateEmail } from './validation';

// Profile option builders
export {
  getGenderOptions,
  getActivityOptions,
  getGoalOptions,
  getMeasurementOptions,
  getCountryOptions,
  getCurrencyOptions,
} from './profileOptions';

