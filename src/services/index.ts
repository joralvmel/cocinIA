/**
 * External services and API clients
 */

export { supabase } from './supabase';
export { queryClient } from './queryClient';
export { geminiRecipeGenerationService as recipeGenerationService, weeklyPlanGenerationService, type RecipeGenerationResponse, type WeeklyPlanGenerationResponse, type DayGenerationResponse } from './ai';
export { authService } from './auth';
export { profileService, type Profile, type ProfileRestriction, type ProfileEquipment, type ProfileCuisine, type FavoriteIngredient, type RoutineMeal, type ProfileUpdatePayload, type RestrictionPayload } from './profile';
export { recipeService, type SaveRecipePayload, type RecipeFilters, type RecipeFilterOptions } from './recipes';
export { weeklyPlanService } from './weeklyPlan';
export { notificationChannelsService } from './notificationChannels';

