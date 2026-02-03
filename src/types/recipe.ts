import { z } from 'zod';

/**
 * Difficulty level enum matching Supabase
 */
export const DifficultyLevel = z.enum(['easy', 'medium', 'hard']);
export type DifficultyLevel = z.infer<typeof DifficultyLevel>;

/**
 * Meal type enum matching Supabase
 */
export const MealType = z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']);
export type MealType = z.infer<typeof MealType>;

/**
 * Ingredient schema for recipe ingredients
 * More lenient to handle AI variations
 */
export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.coerce.number(), // coerce to handle string numbers
  unit: z.string(),
  notes: z.string().optional().nullable(),
  is_optional: z.boolean().optional().default(false),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

/**
 * Recipe step schema
 */
export const RecipeStepSchema = z.object({
  step_number: z.coerce.number(),
  instruction: z.string(),
  duration_minutes: z.coerce.number().optional().nullable(),
  tip: z.string().optional().nullable(),
});
export type RecipeStep = z.infer<typeof RecipeStepSchema>;

/**
 * Nutrition info schema
 */
export const NutritionSchema = z.object({
  calories: z.coerce.number(),
  protein_g: z.coerce.number(),
  carbs_g: z.coerce.number(),
  fat_g: z.coerce.number(),
  fiber_g: z.coerce.number().optional().nullable(),
  sugar_g: z.coerce.number().optional().nullable(),
  sodium_mg: z.coerce.number().optional().nullable(),
});
export type Nutrition = z.infer<typeof NutritionSchema>;

/**
 * Schema for the AI-generated recipe response
 * This is what OpenAI should return
 * Using coerce for numbers to handle string responses from AI
 */
export const AIRecipeResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(IngredientSchema),
  steps: z.array(RecipeStepSchema),
  prep_time_minutes: z.coerce.number(),
  cook_time_minutes: z.coerce.number(),
  total_time_minutes: z.coerce.number(),
  servings: z.coerce.number(),
  difficulty: DifficultyLevel,
  nutrition: NutritionSchema,
  estimated_cost: z.coerce.number(),
  cost_currency: z.string(),
  cost_per_serving: z.coerce.number(),
  meal_types: z.array(MealType),
  cuisine: z.string(),
  tags: z.array(z.string()).default([]),
  chef_tips: z.array(z.string()).optional().default([]),
  storage_instructions: z.string().optional().nullable(),
  variations: z.array(z.string()).optional().default([]),
});
export type AIRecipeResponse = z.infer<typeof AIRecipeResponseSchema>;

/**
 * Full recipe schema as stored in database
 */
export const RecipeSchema = AIRecipeResponseSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  image_url: z.string().nullable().optional(),
  is_ai_generated: z.boolean().default(true),
  ai_model: z.string().nullable().optional(),
  original_prompt: z.string().nullable().optional(),
  generation_params: z.record(z.string(), z.unknown()).nullable().optional(),
  is_edited: z.boolean().default(false),
  parent_recipe_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

/**
 * Recipe search/generation form schema
 */
export const RecipeSearchFormSchema = z.object({
  // Main prompt
  prompt: z.string().min(1, 'Escribe qué quieres cocinar'),

  // Quick filters
  quickFilters: z.array(z.string()).default([]),

  // Advanced options
  recipeName: z.string().optional(),
  ingredientsToUse: z.array(z.string()).default([]),
  ingredientsToExclude: z.array(z.string()).default([]),
  useFavoriteIngredients: z.boolean().default(false),
  mealTypes: z.array(MealType).default([]),
  servings: z.number().min(1).max(20).optional(),
  maxTime: z.number().min(5).max(480).optional(),
  maxCalories: z.number().min(100).max(2000).optional(),
  cuisines: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  difficulty: DifficultyLevel.optional(),
});
export type RecipeSearchForm = z.infer<typeof RecipeSearchFormSchema>;

/**
 * Quick filter options
 */
export const QUICK_FILTERS = [
  { id: 'quick', label: '< 30 min', icon: '⚡' },
  { id: 'healthy', label: 'Saludable', icon: '🥗' },
  { id: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
  { id: 'cheap', label: 'Económico', icon: '💰' },
  { id: 'easy', label: 'Fácil', icon: '👌' },
  { id: 'high_protein', label: 'Alto en proteína', icon: '💪' },
] as const;

export type QuickFilterId = typeof QUICK_FILTERS[number]['id'];
