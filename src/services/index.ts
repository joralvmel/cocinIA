/**
 * External services and API clients
 */

export { supabase } from './supabase';
export { queryClient } from './queryClient';
export { geminiRecipeGenerationService as recipeGenerationService, type RecipeGenerationResponse } from './gemini';
export { authService } from './auth';
export { profileService, type Profile, type ProfileRestriction, type ProfileEquipment, type ProfileCuisine, type ProfileQuickFilter, type FavoriteIngredient, type ProfileUpdatePayload, type RestrictionPayload } from './profile';
export { recipeService, type SaveRecipePayload, type RecipeFilters, type RecipeFilterOptions } from './recipes';
