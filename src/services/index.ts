/**
 * External services and API clients
 */

export { supabase } from './supabase';
export { queryClient } from './queryClient';
export { openai, chatService, type ChatMessage, type ChatResponse } from './openai';
export { authService } from './auth';
export { profileService, type Profile, type ProfileRestriction, type ProfileEquipment, type FavoriteIngredient, type ProfileUpdatePayload, type RestrictionPayload } from './profile';
