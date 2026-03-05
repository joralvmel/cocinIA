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

// Auth & Onboarding hooks
export { useAlertModal, type AlertVariant, type AlertModalState as AlertModalHookState } from './useAlertModal';
export { useLoginForm } from './useLoginForm';
export { useRegisterForm } from './useRegisterForm';
export { useAuthCallback } from './useAuthCallback';
export { useOnboardingStep1 } from './useOnboardingStep1';
export { useOnboardingStep2 } from './useOnboardingStep2';
export { useOnboardingStep3 } from './useOnboardingStep3';
export { useOnboardingComplete } from './useOnboardingComplete';

