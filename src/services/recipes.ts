import { supabase } from './supabase';
import { type AIRecipeResponse, type Recipe } from '@/types';

export interface SaveRecipePayload {
  recipe: AIRecipeResponse;
  originalPrompt: string;
  generationParams?: Record<string, unknown>;
  aiModel?: string;
}

export const recipeService = {
  /**
   * Save a generated recipe to the database
   */
  async saveRecipe(payload: SaveRecipePayload): Promise<Recipe> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { recipe, originalPrompt, generationParams, aiModel } = payload;

    // Build the insert object with only defined fields
    // Note: total_time_minutes and cost_per_serving are generated columns in Supabase
    const insertData: Record<string, unknown> = {
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      // total_time_minutes is auto-calculated by Supabase
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      nutrition: recipe.nutrition,
      estimated_cost: recipe.estimated_cost,
      cost_currency: recipe.cost_currency,
      // cost_per_serving is auto-calculated by Supabase
      meal_types: recipe.meal_types,
      cuisine: recipe.cuisine,
      tags: recipe.tags,
      is_ai_generated: true,
      ai_model: aiModel || 'gpt-4o-mini',
      original_prompt: originalPrompt,
      generation_params: generationParams || null,
      is_edited: false,
    };

    // Only add optional fields if they exist (in case table doesn't have them yet)
    if (recipe.chef_tips && recipe.chef_tips.length > 0) {
      insertData.chef_tips = recipe.chef_tips;
    }
    if (recipe.storage_instructions) {
      insertData.storage_instructions = recipe.storage_instructions;
    }
    if (recipe.variations && recipe.variations.length > 0) {
      insertData.variations = recipe.variations;
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving recipe:', error);
      throw new Error(error.message || 'Error saving recipe');
    }

    return data;
  },

  /**
   * Get all recipes for the current user
   */
  async getMyRecipes(): Promise<Recipe[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Update a recipe (mark as edited)
   */
  async updateRecipe(id: string, updates: Partial<AIRecipeResponse>): Promise<Recipe> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .update({
        ...updates,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
