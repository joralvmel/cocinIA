import { supabase } from './supabase';
import { type AIRecipeResponse, type Recipe, type MealType, type DifficultyLevel } from '@/types';

export interface SaveRecipePayload {
  recipe: AIRecipeResponse;
  originalPrompt: string;
  generationParams?: Record<string, unknown>;
  aiModel?: string;
}

export interface RecipeFilters {
  searchQuery?: string;
  difficulty?: DifficultyLevel[];
  mealTypes?: MealType[];
  maxTime?: number;
  maxCalories?: number;
  cuisines?: string[];
  ingredients?: string[];
}

export interface RecipeFilterOptions {
  difficulties: DifficultyLevel[];
  mealTypes: MealType[];
  cuisines: string[];
  ingredients: string[];
  maxTime: number;
  maxCalories: number;
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

  /**
   * Get unique ingredient names from user's saved recipes
   */
  async getIngredientsFromRecipes(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('recipes')
      .select('ingredients')
      .eq('user_id', user.id);

    if (error) throw error;

    // Extract unique ingredient names
    const ingredientSet = new Set<string>();
    data?.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ing: { name: string }) => {
          if (ing.name) {
            ingredientSet.add(ing.name.toLowerCase());
          }
        });
      }
    });

    return Array.from(ingredientSet).sort();
  },

  /**
   * Get available filter options based on user's recipes
   */
  async getFilterOptions(): Promise<RecipeFilterOptions> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
      difficulties: [],
      mealTypes: [],
      cuisines: [],
      ingredients: [],
      maxTime: 0,
      maxCalories: 0,
    };

    const { data, error } = await supabase
      .from('recipes')
      .select('difficulty, meal_types, cuisine, ingredients, total_time_minutes, nutrition')
      .eq('user_id', user.id);

    if (error) throw error;

    const difficulties = new Set<DifficultyLevel>();
    const mealTypes = new Set<MealType>();
    const cuisines = new Set<string>();
    const ingredients = new Set<string>();
    let maxTime = 0;
    let maxCalories = 0;

    data?.forEach(recipe => {
      if (recipe.difficulty) difficulties.add(recipe.difficulty as DifficultyLevel);
      if (recipe.meal_types) {
        recipe.meal_types.forEach((mt: MealType) => mealTypes.add(mt));
      }
      if (recipe.cuisine) cuisines.add(recipe.cuisine);
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ing: { name: string }) => {
          if (ing.name) ingredients.add(ing.name);
        });
      }
      if (recipe.total_time_minutes && recipe.total_time_minutes > maxTime) {
        maxTime = recipe.total_time_minutes;
      }
      if (recipe.nutrition?.calories && recipe.nutrition.calories > maxCalories) {
        maxCalories = recipe.nutrition.calories;
      }
    });

    return {
      difficulties: Array.from(difficulties),
      mealTypes: Array.from(mealTypes),
      cuisines: Array.from(cuisines).sort(),
      ingredients: Array.from(ingredients).sort(),
      maxTime,
      maxCalories,
    };
  },

  /**
   * Get filtered recipes
   */
  async getFilteredRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters - we'll do most filtering client-side for flexibility
    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    // Client-side filtering for complex conditions
    return data.filter(recipe => {
      // Search query - search in title and description
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = recipe.title?.toLowerCase().includes(query);
        const matchesDescription = recipe.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Difficulty filter
      if (filters.difficulty && filters.difficulty.length > 0) {
        if (!recipe.difficulty || !filters.difficulty.includes(recipe.difficulty as DifficultyLevel)) {
          return false;
        }
      }

      // Meal types filter
      if (filters.mealTypes && filters.mealTypes.length > 0) {
        if (!recipe.meal_types || !recipe.meal_types.some((mt: MealType) => filters.mealTypes!.includes(mt))) {
          return false;
        }
      }

      // Max time filter
      if (filters.maxTime && filters.maxTime > 0) {
        if (!recipe.total_time_minutes || recipe.total_time_minutes > filters.maxTime) {
          return false;
        }
      }

      // Max calories filter
      if (filters.maxCalories && filters.maxCalories > 0) {
        if (!recipe.nutrition?.calories || recipe.nutrition.calories > filters.maxCalories) {
          return false;
        }
      }

      // Cuisine filter
      if (filters.cuisines && filters.cuisines.length > 0) {
        if (!recipe.cuisine || !filters.cuisines.includes(recipe.cuisine)) {
          return false;
        }
      }

      // Ingredients filter - recipe must contain ALL selected ingredients
      if (filters.ingredients && filters.ingredients.length > 0) {
        const recipeIngredientNames = (recipe.ingredients || []).map((ing: { name: string }) =>
          ing.name?.toLowerCase()
        );
        const hasAllIngredients = filters.ingredients.every(ing =>
          recipeIngredientNames.some((name: string) => name?.includes(ing.toLowerCase()))
        );
        if (!hasAllIngredients) return false;
      }

      return true;
    });
  },

  /**
   * Upload recipe image to Supabase Storage
   */
  async uploadRecipeImage(recipeId: string, imageUri: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get file extension from URI
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/${recipeId}.${ext}`;

    // Fetch the image as blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(uploadError.message || 'Error uploading image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Update recipe with image URL
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', recipeId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return imageUrl;
  },

  /**
   * Delete recipe image from Supabase Storage
   */
  async deleteRecipeImage(recipeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current recipe to find image URL
    const recipe = await this.getRecipeById(recipeId);
    if (!recipe || !recipe.image_url) return;

    // Extract file path from URL
    const urlParts = recipe.image_url.split('/recipe-images/');
    if (urlParts.length < 2) return;
    const filePath = urlParts[1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('recipe-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete storage error:', deleteError);
    }

    // Update recipe to remove image URL
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq('id', recipeId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;
  },
};
