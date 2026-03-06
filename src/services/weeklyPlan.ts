import { supabase } from './supabase';
import {
  type WeeklyPlan,
  type WeeklyPlanMeal,
  type WeeklyPlanWithMeals,
  type CreateWeeklyPlanPayload,
  type SavePlanMealPayload,
} from '@/types';

export const weeklyPlanService = {
  /**
   * Create a new weekly plan
   */
  async createPlan(payload: CreateWeeklyPlanPayload): Promise<WeeklyPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('weekly_plans')
      .insert({
        user_id: user.id,
        name: payload.name,
        start_date: payload.start_date,
        end_date: payload.end_date,
        days_included: payload.days_included,
        meals_per_day: payload.meals_per_day,
        daily_calorie_target: payload.daily_calorie_target || null,
        is_batch_cooking: payload.is_batch_cooking,
        batch_config: payload.batch_config || null,
        is_active: true,
        is_completed: false,
        notes: payload.notes || null,
        special_requests: payload.special_requests || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating weekly plan:', error);
      throw new Error(error.message || 'Error creating weekly plan');
    }

    return data;
  },

  /**
   * Save multiple plan meals in bulk
   */
  async savePlanMeals(meals: SavePlanMealPayload[]): Promise<WeeklyPlanMeal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('weekly_plan_meals')
      .insert(meals)
      .select();

    if (error) {
      console.error('Error saving plan meals:', error);
      throw new Error(error.message || 'Error saving plan meals');
    }

    return data || [];
  },

  /**
   * Get the active plan with all meals and joined recipes
   */
  async getActivePlan(): Promise<WeeklyPlanWithMeals | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: plan, error: planError } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (planError) {
      if (planError.code === 'PGRST116') return null; // No rows
      throw planError;
    }

    if (!plan) return null;

    // Fetch meals with joined recipes
    const { data: meals, error: mealsError } = await supabase
      .from('weekly_plan_meals')
      .select('*, recipe:recipes!weekly_plan_meals_recipe_id_fkey(*)')
      .eq('weekly_plan_id', plan.id)
      .order('sort_order', { ascending: true });

    if (mealsError) throw mealsError;

    return {
      ...plan,
      meals: meals || [],
    };
  },

  /**
   * Get a plan by ID with all meals
   */
  async getPlanById(id: string): Promise<WeeklyPlanWithMeals | null> {
    const { data: plan, error: planError } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (planError) {
      if (planError.code === 'PGRST116') return null;
      throw planError;
    }

    if (!plan) return null;

    const { data: meals, error: mealsError } = await supabase
      .from('weekly_plan_meals')
      .select('*, recipe:recipes!weekly_plan_meals_recipe_id_fkey(*)')
      .eq('weekly_plan_id', plan.id)
      .order('sort_order', { ascending: true });

    if (mealsError) throw mealsError;

    return {
      ...plan,
      meals: meals || [],
    };
  },

  /**
   * Get plan history (all completed/inactive plans)
   */
  async getPlanHistory(): Promise<WeeklyPlan[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update a weekly plan
   */
  async updatePlan(id: string, updates: Partial<WeeklyPlan>): Promise<WeeklyPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('weekly_plans')
      .update({
        ...updates,
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
   * Update a single meal
   */
  async updateMeal(mealId: string, updates: Partial<WeeklyPlanMeal>): Promise<WeeklyPlanMeal> {
    const { data, error } = await supabase
      .from('weekly_plan_meals')
      .update(updates)
      .eq('id', mealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Replace a meal's recipe
   */
  async replaceMealRecipe(mealId: string, newRecipeId: string): Promise<WeeklyPlanMeal> {
    return this.updateMeal(mealId, { recipe_id: newRecipeId } as Partial<WeeklyPlanMeal>);
  },

  /**
   * Mark a meal as eating out
   */
  async markMealExternal(mealId: string, description?: string): Promise<WeeklyPlanMeal> {
    return this.updateMeal(mealId, {
      is_external: true,
      external_description: description || null,
      recipe_id: null,
    } as Partial<WeeklyPlanMeal>);
  },

  /**
   * Unmark a meal as eating out (restore)
   */
  async unmarkMealExternal(mealId: string): Promise<WeeklyPlanMeal> {
    return this.updateMeal(mealId, {
      is_external: false,
      external_description: null,
    } as Partial<WeeklyPlanMeal>);
  },

  /**
   * Delete a weekly plan and all its meals (cascade)
   */
  async deletePlan(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete meals first
    await supabase
      .from('weekly_plan_meals')
      .delete()
      .eq('weekly_plan_id', id);

    // Then delete plan
    const { error } = await supabase
      .from('weekly_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Deactivate all user plans
   */
  async deactivateAllPlans(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('weekly_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
  },

  /**
   * Activate a plan (deactivates all others first)
   */
  async activatePlan(id: string): Promise<WeeklyPlan> {
    await this.deactivateAllPlans();
    return this.updatePlan(id, { is_active: true } as Partial<WeeklyPlan>);
  },

  /**
   * Complete a plan
   */
  async completePlan(id: string): Promise<WeeklyPlan> {
    return this.updatePlan(id, {
      is_completed: true,
      is_active: false,
    } as Partial<WeeklyPlan>);
  },

  /**
   * Clone a plan with new dates
   */
  async clonePlan(id: string, newStartDate: string): Promise<WeeklyPlan> {
    const original = await this.getPlanById(id);
    if (!original) throw new Error('Plan not found');

    // Calculate new end date
    const start = new Date(newStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    // Create new plan
    const newPlan = await this.createPlan({
      name: `${original.name} (copy)`,
      start_date: newStartDate,
      end_date: end.toISOString().split('T')[0],
      days_included: original.days_included,
      meals_per_day: original.meals_per_day,
      daily_calorie_target: original.daily_calorie_target || undefined,
      is_batch_cooking: original.is_batch_cooking,
      batch_config: original.batch_config || undefined,
      notes: original.notes || undefined,
      special_requests: original.special_requests || undefined,
    });

    // Clone meals
    if (original.meals.length > 0) {
      const mealPayloads: SavePlanMealPayload[] = original.meals.map((meal) => ({
        weekly_plan_id: newPlan.id,
        recipe_id: meal.recipe_id,
        day_of_week: meal.day_of_week,
        meal_type: meal.meal_type,
        servings: meal.servings,
        notes: meal.notes || undefined,
        is_prep_day: meal.is_prep_day,
        prep_instructions: meal.prep_instructions || undefined,
        is_external: meal.is_external,
        external_description: meal.external_description || undefined,
        estimated_calories: meal.estimated_calories || undefined,
        sort_order: meal.sort_order,
      }));

      await this.savePlanMeals(mealPayloads);
    }

    return newPlan;
  },

  /**
   * Delete a single meal
   */
  async deleteMeal(mealId: string): Promise<void> {
    const { error } = await supabase
      .from('weekly_plan_meals')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
  },
};


