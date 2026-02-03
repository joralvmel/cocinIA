import type { Profile, ProfileRestriction, ProfileEquipment, FavoriteIngredient } from '@/services';

/**
 * Calculate profile completion percentage
 * Returns a value between 0 and 100
 */
export interface ProfileCompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingCategories: string[];
}

export function calculateProfileCompletion(
  profile: Profile | null,
  restrictions: ProfileRestriction[] = [],
  equipment: ProfileEquipment[] = [],
  favoriteIngredients: FavoriteIngredient[] = []
): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: 15,
      missingCategories: ['basic', 'personal', 'nutrition', 'preferences', 'equipment', 'ingredients'],
    };
  }

  let completedFields = 0;
  const totalFields = 15; // Total number of significant fields to track
  const missingCategories: string[] = [];

  // Basic Info (3 fields) - weight: 20%
  let basicCompleted = 0;
  if (profile.display_name) basicCompleted++;
  if (profile.country) basicCompleted++;
  if (profile.currency) basicCompleted++;

  if (basicCompleted === 0) missingCategories.push('basic');
  completedFields += basicCompleted;

  // Personal Info (5 fields) - weight: 30%
  let personalCompleted = 0;
  if (profile.birth_date) personalCompleted++;
  if (profile.gender) personalCompleted++;
  if (profile.height_cm) personalCompleted++;
  if (profile.weight_kg) personalCompleted++;
  if (profile.activity_level) personalCompleted++;

  if (personalCompleted === 0) missingCategories.push('personal');
  completedFields += personalCompleted;

  // Nutrition Goals (4 fields) - weight: 25%
  let nutritionCompleted = 0;
  if (profile.fitness_goal) nutritionCompleted++;
  if (profile.daily_calorie_goal) nutritionCompleted++;
  if (profile.protein_goal_g) nutritionCompleted++;
  if (profile.carbs_goal_g && profile.fat_goal_g) nutritionCompleted++;

  if (nutritionCompleted === 0) missingCategories.push('nutrition');
  completedFields += nutritionCompleted;

  // Preferences (1 field) - weight: 15%
  let preferencesCompleted = 0;
  if (restrictions.length > 0 || (profile.preferred_cuisines && profile.preferred_cuisines.length > 0)) {
    preferencesCompleted++;
  }

  if (preferencesCompleted === 0) missingCategories.push('preferences');
  completedFields += preferencesCompleted;

  // Equipment (1 field) - weight: 10%
  let equipmentCompleted = 0;
  if (equipment.length > 0) {
    equipmentCompleted++;
  }

  if (equipmentCompleted === 0) missingCategories.push('equipment');
  completedFields += equipmentCompleted;

  // Favorite Ingredients (1 field) - weight: 5%
  let ingredientsCompleted = 0;
  if (favoriteIngredients.length > 0) {
    ingredientsCompleted++;
  }

  if (ingredientsCompleted === 0) missingCategories.push('ingredients');
  completedFields += ingredientsCompleted;

  // Calculate percentage
  const percentage = Math.round((completedFields / totalFields) * 100);

  return {
    percentage,
    completedFields,
    totalFields,
    missingCategories,
  };
}

/**
 * Get completion message based on percentage
 */
export function getCompletionMessage(percentage: number, t: (key: string) => string): string {
  if (percentage === 100) {
    return t('profile.completion.perfect');
  } else if (percentage >= 80) {
    return t('profile.completion.almostThere');
  } else if (percentage >= 50) {
    return t('profile.completion.halfWay');
  } else if (percentage >= 25) {
    return t('profile.completion.goodStart');
  } else {
    return t('profile.completion.getStarted');
  }
}

/**
 * Get next recommended category to complete
 */
export function getNextRecommendedCategory(missingCategories: string[]): string | null {
  // Priority order: basic -> personal -> nutrition -> preferences -> equipment -> ingredients
  const priorityOrder = ['basic', 'personal', 'nutrition', 'preferences', 'equipment', 'ingredients'];

  for (const category of priorityOrder) {
    if (missingCategories.includes(category)) {
      return category;
    }
  }

  return null;
}
