import { supabase } from './supabase';

// Profile types
export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  currency: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  fitness_goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'eat_healthy' | null;
  daily_calorie_goal: number | null;
  protein_goal_g: number | null;
  carbs_goal_g: number | null;
  fat_goal_g: number | null;
  default_servings: number | null;
  preferred_cuisines: string[] | null;
  quick_filters: string[] | null;
  measurement_system: 'metric' | 'imperial' | null;
  onboarding_completed: boolean;
  onboarding_step: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRestriction {
  id: string;
  profile_id: string;
  restriction_type: string;
  custom_value: string | null;
  is_allergy: boolean;
  created_at: string;
}

export interface ProfileEquipment {
  id: string;
  profile_id: string;
  equipment_type: string;
  custom_name: string | null;
  created_at: string;
}

export interface FavoriteIngredient {
  id: string;
  profile_id: string;
  ingredient_name: string;
  always_available: boolean;
  created_at: string;
}

// Profile update payload
export interface ProfileUpdatePayload {
  display_name?: string;
  country?: string;
  currency?: string;
  height_cm?: number;
  weight_kg?: number;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitness_goal?: 'lose_weight' | 'maintain' | 'gain_muscle' | 'eat_healthy';
  daily_calorie_goal?: number;
  protein_goal_g?: number;
  carbs_goal_g?: number;
  fat_goal_g?: number;
  default_servings?: number;
  preferred_cuisines?: string[];
  quick_filters?: string[];
  measurement_system?: 'metric' | 'imperial';
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

// Restriction payload for saving
export interface RestrictionPayload {
  restriction_type: string;
  custom_value?: string;
  is_allergy: boolean;
}

export const profileService = {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Profile might not exist yet
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Create or update the current user's profile
   */
  async updateProfile(updates: ProfileUpdatePayload): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Save the onboarding step 1 data (basic info)
   */
  async saveBasicInfo(data: {
    displayName: string;
    country: string;
    currency: string;
  }): Promise<Profile> {
    return this.updateProfile({
      display_name: data.displayName,
      country: data.country,
      currency: data.currency,
      onboarding_step: 1,
    });
  },

  /**
   * Get user's dietary restrictions
   */
  async getRestrictions(): Promise<ProfileRestriction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('profile_restrictions')
      .select('*')
      .eq('profile_id', user.id);

    if (error) throw error;
    return data || [];
  },

  /**
   * Save dietary restrictions (replaces all existing ones)
   */
  async saveRestrictions(restrictions: RestrictionPayload[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete existing restrictions
    await supabase
      .from('profile_restrictions')
      .delete()
      .eq('profile_id', user.id);

    // Insert new restrictions if any
    if (restrictions.length > 0) {
      const { error } = await supabase
        .from('profile_restrictions')
        .insert(
          restrictions.map((r) => ({
            profile_id: user.id,
            restriction_type: r.restriction_type,
            custom_value: r.custom_value || null,
            is_allergy: r.is_allergy,
          }))
        );

      if (error) throw error;
    }

    // Update onboarding step
    await this.updateProfile({ onboarding_step: 2 });
  },

  /**
   * Save cuisine preferences
   */
  async saveCuisinePreferences(cuisines: string[]): Promise<Profile> {
    return this.updateProfile({
      preferred_cuisines: cuisines,
      onboarding_step: 3,
    });
  },

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<Profile> {
    return this.updateProfile({
      onboarding_completed: true,
      onboarding_step: 4,
    });
  },

  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(): Promise<boolean> {
    const profile = await this.getProfile();
    return !profile || !profile.onboarding_completed;
  },

  /**
   * Get user's equipment
   */
  async getEquipment(): Promise<ProfileEquipment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('profile_equipment')
      .select('*')
      .eq('profile_id', user.id);

    if (error) throw error;
    return data || [];
  },

  /**
   * Save equipment (replaces all existing ones)
   */
  async saveEquipment(equipment: { equipment_type: string; custom_name?: string }[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete existing equipment
    await supabase
      .from('profile_equipment')
      .delete()
      .eq('profile_id', user.id);

    // Insert new equipment if any
    if (equipment.length > 0) {
      const { error } = await supabase
        .from('profile_equipment')
        .insert(
          equipment.map((e) => ({
            profile_id: user.id,
            equipment_type: e.equipment_type,
            custom_name: e.custom_name || null,
          }))
        );

      if (error) throw error;
    }
  },

  /**
   * Get user's favorite ingredients
   */
  async getFavoriteIngredients(): Promise<FavoriteIngredient[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorite_ingredients')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Save favorite ingredients (replaces all existing ones)
   */
  async saveFavoriteIngredients(ingredients: { ingredient_name: string; always_available: boolean }[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete existing ingredients
    await supabase
      .from('favorite_ingredients')
      .delete()
      .eq('profile_id', user.id);

    // Insert new ingredients if any
    if (ingredients.length > 0) {
      const { error } = await supabase
        .from('favorite_ingredients')
        .insert(
          ingredients.map((i) => ({
            profile_id: user.id,
            ingredient_name: i.ingredient_name,
            always_available: i.always_available,
          }))
        );

      if (error) throw error;
    }
  },
};
