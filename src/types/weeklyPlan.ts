import { z } from 'zod';
import { AIRecipeResponseSchema, type Recipe } from './recipe';

/**
 * Day of week enum matching Supabase custom type
 */
export const DayOfWeek = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

/**
 * All days in order for iteration
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Meal types used for weekly planning (subset without dessert by default)
 */
export const PlanMealType = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);
export type PlanMealType = z.infer<typeof PlanMealType>;

export const PLAN_MEAL_TYPES: PlanMealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Base preparation for batch cooking
 */
export const BasePreparationSchema = z.object({
  name: z.string(),
  type: z.enum(['protein', 'grain', 'sauce', 'vegetable', 'side', 'other']),
  description: z.string(),
  recipe: AIRecipeResponseSchema.optional(),
  used_in_days: z.array(DayOfWeek).default([]),
  used_in_meals: z.array(PlanMealType).default([]),
  estimated_time_minutes: z.coerce.number().optional(),
  storage_instructions: z.string().optional(),
});
export type BasePreparation = z.infer<typeof BasePreparationSchema>;

/**
 * Batch cooking configuration stored in weekly_plans.batch_config
 */
export const BatchConfigSchema = z.object({
  prep_days: z.array(DayOfWeek).default([]),
  max_prep_time_minutes: z.coerce.number().optional(),
  base_preparations_count: z.coerce.number().min(1).max(10).default(3),
  reuse_strategy: z.enum(['maximize_reuse', 'balanced', 'variety']).default('balanced'),
  base_preparations: z.array(BasePreparationSchema).default([]),
  notes: z.string().optional(),
});
export type BatchConfig = z.infer<typeof BatchConfigSchema>;

/**
 * Weekly plan as stored in Supabase
 */
export interface WeeklyPlan {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  days_included: DayOfWeek[];
  meals_per_day: PlanMealType[];
  daily_calorie_target: number | null;
  is_batch_cooking: boolean;
  batch_config: BatchConfig | null;
  is_active: boolean;
  is_completed: boolean;
  notes: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Weekly plan meal as stored in Supabase
 */
export interface WeeklyPlanMeal {
  id: string;
  weekly_plan_id: string;
  recipe_id: string | null;
  day_of_week: DayOfWeek;
  meal_type: PlanMealType;
  servings: number;
  notes: string | null;
  is_prep_day: boolean;
  prep_instructions: string | null;
  is_external: boolean;
  external_description: string | null;
  estimated_calories: number | null;
  sort_order: number;
  created_at: string;
}

/**
 * Meal with joined recipe data
 */
export interface WeeklyPlanMealWithRecipe extends WeeklyPlanMeal {
  recipe: Recipe | null;
}

/**
 * Full plan with all meals and recipes
 */
export interface WeeklyPlanWithMeals extends WeeklyPlan {
  meals: WeeklyPlanMealWithRecipe[];
}

/**
 * Day configuration in the wizard
 */
export interface DayConfig {
  day: DayOfWeek;
  enabled: boolean;
  meals: PlanMealType[];
  cookingTimeMinutes: number;
}

/**
 * Wizard form state for plan creation
 */
export const WeeklyPlanFormSchema = z.object({
  // Days and meals
  selectedDays: z.array(DayOfWeek).min(1),
  dayConfigs: z.record(DayOfWeek, z.object({
    meals: z.array(PlanMealType).min(1),
    cookingTimeMinutes: z.coerce.number().min(5).max(480).default(60),
  })),

  // Batch cooking
  batchCookingEnabled: z.boolean().default(false),
  batchConfig: BatchConfigSchema.optional(),
  cookingTimeByMealType: z.record(z.string(), z.number()).default({}),

  // Food preferences
  cuisines: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  ingredientsToInclude: z.array(z.string()).default([]),
  ingredientsToExclude: z.array(z.string()).default([]),
  useFavoriteIngredients: z.boolean().default(false),

  // Nutrition
  dailyCalorieTarget: z.coerce.number().min(500).max(10000).optional(),
  servings: z.coerce.number().min(1).max(20).default(1),

  // Routine meals — what the user typically eats (rotate instead of inventing)
  routineMeals: z.object({
    breakfast: z.string().default(''),
    lunch: z.string().default(''),
    dinner: z.string().default(''),
    snack: z.string().default(''),
  }).default({ breakfast: '', lunch: '', dinner: '', snack: '' }),

  // Notes
  specialNotes: z.string().default(''),

  // Plan meta
  planName: z.string().default(''),
  startDate: z.string().optional(),
});
export type WeeklyPlanForm = z.infer<typeof WeeklyPlanFormSchema>;

/**
 * AI response for a single meal slot in the plan
 */
export const AIPlanMealSchema = z.object({
  day_of_week: DayOfWeek,
  meal_type: PlanMealType,
  recipe: AIRecipeResponseSchema,
  is_prep_day: z.boolean().default(false),
  prep_instructions: z.string().optional(),
  estimated_calories: z.coerce.number().optional(),
  is_external: z.boolean().default(false),
  /** Tracks a swapped cookbook recipe id (used during save) */
  _swapped_recipe_id: z.string().optional(),
});
export type AIPlanMeal = z.infer<typeof AIPlanMealSchema>;

/**
 * AI response for the full weekly plan
 */
export const AIWeeklyPlanResponseSchema = z.object({
  plan_name: z.string(),
  meals: z.array(AIPlanMealSchema),
  base_preparations: z.array(BasePreparationSchema).default([]),
  total_estimated_calories: z.coerce.number().optional(),
  shopping_summary: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
});
export type AIWeeklyPlanResponse = z.infer<typeof AIWeeklyPlanResponseSchema>;

/**
 * Payload for saving a weekly plan meal
 */
export interface SavePlanMealPayload {
  weekly_plan_id: string;
  recipe_id: string | null;
  day_of_week: DayOfWeek;
  meal_type: string;
  servings: number;
  notes?: string;
  is_prep_day: boolean;
  prep_instructions?: string;
  is_external: boolean;
  external_description?: string;
  estimated_calories?: number;
  sort_order: number;
}

/**
 * Payload for creating a weekly plan
 */
export interface CreateWeeklyPlanPayload {
  name: string;
  start_date: string;
  end_date: string;
  days_included: DayOfWeek[];
  meals_per_day: string[];
  daily_calorie_target?: number;
  is_batch_cooking: boolean;
  batch_config?: BatchConfig;
  notes?: string;
  special_requests?: string;
}


