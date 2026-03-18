/**
 * External services and API clients
 */

export {
    geminiRecipeGenerationService as recipeGenerationService,
    weeklyPlanGenerationService, type DayGenerationResponse, type RecipeGenerationResponse,
    type WeeklyPlanGenerationResponse
} from "./ai";
export { authService } from "./auth";
export { backgroundGenerationService } from "./backgroundGeneration";
export { generationNotificationsService } from "./generationNotifications";
export { notificationChannelsService } from "./notificationChannels";
export {
    profileService, type FavoriteIngredient, type Profile, type ProfileCuisine, type ProfileEquipment, type ProfileRestriction, type ProfileUpdatePayload,
    type RestrictionPayload, type RoutineMeal
} from "./profile";
export { queryClient } from "./queryClient";
export {
    recipeService, type RecipeFilterOptions, type RecipeFilters, type SaveRecipePayload
} from "./recipes";
export { supabase } from "./supabase";
export { weeklyPlanService } from "./weeklyPlan";

