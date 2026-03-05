/**
 * Global custom hooks
 * Export all your hooks from here
 */

export { useAppTheme } from './useAppTheme';
export { useAuth } from '@/contexts';
export { useKeyboardHeight } from './useKeyboardHeight';
export { useUserProfile } from './useUserProfile';
export { useGenerateRecipe } from './useGenerateRecipe';
export { useRecipeList } from './useRecipeList';
export { useRecipeDetail, type AlertModalState, type RecipeEditState, type RecipeEditActions } from './useRecipeDetail';
export { useRecipeImage } from './useRecipeImage';
export { useAutoSaveOnBack } from './useAutoSaveOnBack';
export { useProfileScreen } from './useProfileScreen';
export { useEditPersonalForm } from './useEditPersonalForm';
export { useEditNutritionForm } from './useEditNutritionForm';
export { useEditIngredientsForm, type IngredientState } from './useEditIngredientsForm';
export { useEditPreferencesForm, type RestrictionState, type CuisineState, type EquipmentState } from './useEditPreferencesForm';
