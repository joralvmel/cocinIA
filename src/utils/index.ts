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

