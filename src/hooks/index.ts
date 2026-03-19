/**
 * Global custom hooks
 * Export all your hooks from here
 */

export { useAuth } from "@/contexts";
export { useAppTheme } from "./useAppTheme";
export { useAutoSaveOnBack } from "./useAutoSaveOnBack";
export {
    useEditIngredientsForm,
    type IngredientState
} from "./useEditIngredientsForm";
export { useEditNutritionForm } from "./useEditNutritionForm";
export { useEditPersonalForm } from "./useEditPersonalForm";
export {
    useEditPreferencesForm, type CuisineState,
    type EquipmentState, type RestrictionState
} from "./useEditPreferencesForm";
export {
    useEditRoutineMealsForm,
    type RoutineMealState
} from "./useEditRoutineMealsForm";
export { useGenerateRecipe } from "./useGenerateRecipe";
export { useKeyboardHeight } from "./useKeyboardHeight";
export { useProfileScreen } from "./useProfileScreen";
export {
    useRecipeDetail,
    type AlertModalState, type RecipeEditActions, type RecipeEditState
} from "./useRecipeDetail";
export { useRecipeImage } from "./useRecipeImage";
export { useRecipeList } from "./useRecipeList";
export { useUserProfile } from "./useUserProfile";

// Auth & Onboarding hooks
export {
    useAlertModal, type AlertModalState as AlertModalHookState, type AlertVariant
} from "./useAlertModal";
export { useAuthCallback } from "./useAuthCallback";
export { useLoginForm } from "./useLoginForm";
export { useNotificationNavigation } from "./useNotificationNavigation";
export { useOnboardingComplete } from "./useOnboardingComplete";
export { useOnboardingStep1 } from "./useOnboardingStep1";
export { useOnboardingStep2 } from "./useOnboardingStep2";
export { useOnboardingStep3 } from "./useOnboardingStep3";
export { useRegisterForm } from "./useRegisterForm";

// Recipe generation hooks
export {
    useRecipeFilters, type ChipOption, type UseRecipeFiltersOptions
} from "./useRecipeFilters";
export {
    useRecipeResult,
    type UseRecipeResultOptions
} from "./useRecipeResult";

// Weekly plan hooks
export { useActivePlan } from "./useActivePlan";
export { useGenerateWeeklyPlan } from "./useGenerateWeeklyPlan";
export { usePlanHistory } from "./usePlanHistory";
export { useWeeklyPlanNotifications } from "./useWeeklyPlanNotifications";

