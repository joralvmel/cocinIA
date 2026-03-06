import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWeeklyPlanStore, useProfileStore } from '@/stores';
import {
  weeklyPlanGenerationService,
  weeklyPlanService,
  recipeService,
  recipeGenerationService,
} from '@/services';
import { AI_CONFIG } from '@/config';
import { weeklyPlanEvents, recipeEvents } from '@/utils';
import {
  type DayOfWeek,
  type PlanMealType,
  type SavePlanMealPayload,
} from '@/types';

/**
 * Hook that encapsulates weekly plan generation, saving, and management
 */
export function useGenerateWeeklyPlan() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith('es') ? 'es' : 'en') as 'es' | 'en';

  const {
    generatedPlan,
    isGenerating,
    generationError,
    setGeneratedPlan,
    setIsGenerating,
    setGenerationError,
    setGenerationProgress,
    setShowWizard,
    setShowResult,
    setActivePlan,
    setActivePlanLoaded,
    getWizardForm,
    resetWizard,
    clearAll,
  } = useWeeklyPlanStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showRetryError, setShowRetryError] = useState(false);
  const [regeneratingMeal, setRegeneratingMeal] = useState<{ day: DayOfWeek; mealType: PlanMealType } | null>(null);
  const [modifyingMeal, setModifyingMeal] = useState<{ day: DayOfWeek; mealType: PlanMealType } | null>(null);

  const getProfileData = () => {
    const { profile, restrictions, favoriteIngredients } = useProfileStore.getState();
    return { profile, restrictions, favoriteIngredients };
  };

  // ---- Generate full plan ----
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setShowWizard(false);
    // Show progress inside the result modal
    setShowResult(true);

    const form = getWizardForm();
    const { profile, restrictions, favoriteIngredients } = getProfileData();
    const favNames = favoriteIngredients.map((i) => i.ingredient_name);
    const totalDays = form.selectedDays.length;
    let completedDays = 0;

    const result = await weeklyPlanGenerationService.generateWeeklyPlan(
      form,
      profile,
      restrictions,
      favNames,
      currentLang,
      (day: DayOfWeek) => {
        completedDays++;
        const dayLabel = t(`weeklyPlan.days.${day}` as any);
        const pct = Math.round((completedDays / totalDays) * 100);
        setGenerationProgress(
          JSON.stringify({ day: dayLabel, pct, completed: completedDays, total: totalDays })
        );
      },
    );

    setIsGenerating(false);
    setGenerationProgress('');

    if (result.success && result.plan) {
      setGeneratedPlan(result.plan);
      // Now open the result modal
      setShowResult(true);
    } else {
      setGenerationError(result.error || t('weeklyPlan.result.generateError'));
      setShowResult(false);
      setShowRetryError(true);
    }
  };

  // ---- Regenerate entire plan ----
  const handleRegeneratePlan = async () => {
    setGeneratedPlan(null);
    await handleGenerate();
  };

  // ---- Regenerate a single meal ----
  const handleRegenerateMeal = async (day: DayOfWeek, mealType: PlanMealType) => {
    if (!generatedPlan) return;

    setRegeneratingMeal({ day, mealType });

    const form = getWizardForm();
    const { profile, restrictions, favoriteIngredients } = getProfileData();
    const favNames = favoriteIngredients.map((i) => i.ingredient_name);
    const dayConfig = form.dayConfigs[day];

    const result = await weeklyPlanGenerationService.regenerateSingleMeal(
      day,
      mealType,
      generatedPlan.meals,
      dayConfig?.cookingTimeMinutes || 60,
      profile,
      restrictions,
      favNames,
      form,
      currentLang,
    );

    setRegeneratingMeal(null);

    if (result.success && result.recipe) {
      // Replace the meal in the plan
      const updatedMeals = generatedPlan.meals.map((meal) => {
        if (meal.day_of_week === day && meal.meal_type === mealType) {
          return {
            ...meal,
            recipe: result.recipe!,
            estimated_calories: result.recipe!.nutrition.calories,
          };
        }
        return meal;
      });

      setGeneratedPlan({
        ...generatedPlan,
        meals: updatedMeals,
      });
    } else {
      Alert.alert(
        String(t('common.error')),
        result.error || String(t('weeklyPlan.result.regenerateError'))
      );
    }
  };

  // ---- Modify a single meal with AI ----
  const handleModifyMeal = async (day: DayOfWeek, mealType: PlanMealType, modification: string) => {
    if (!generatedPlan) return;

    const meal = generatedPlan.meals.find(
      (m) => m.day_of_week === day && m.meal_type === mealType
    );
    if (!meal?.recipe) return;

    setModifyingMeal({ day, mealType });

    const { profile, restrictions } = getProfileData();

    const result = await recipeGenerationService.modifyRecipe(
      meal.recipe,
      modification,
      profile,
      restrictions,
      currentLang,
    );

    setModifyingMeal(null);

    if (result.success && result.recipe) {
      const updatedMeals = generatedPlan.meals.map((m) => {
        if (m.day_of_week === day && m.meal_type === mealType) {
          return {
            ...m,
            recipe: result.recipe!,
            estimated_calories: result.recipe!.nutrition.calories,
          };
        }
        return m;
      });

      setGeneratedPlan({
        ...generatedPlan,
        meals: updatedMeals,
      });
    } else {
      Alert.alert(
        String(t('common.error')),
        result.error || String(t('weeklyPlan.result.modifyError' as any))
      );
    }
  };

  // ---- Save plan ----
  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    setIsSaving(true);
    try {
      const form = getWizardForm();

      // 1. Deactivate any current active plans
      await weeklyPlanService.deactivateAllPlans();

      // 2. Save all recipes to the cookbook (deduplicate by title)
      const recipeIdMap = new Map<string, string>(); // day-mealType key → recipe id
      const titleToIdMap = new Map<string, string>(); // recipe title → recipe id (dedup)

      for (const meal of generatedPlan.meals) {
        if (meal.is_external) continue; // Skip eating out meals
        if (!meal.recipe?.title) continue;

        const key = `${meal.day_of_week}-${meal.meal_type}`;

        // If swapped from cookbook, use existing recipe id
        if ((meal as any)._swapped_recipe_id) {
          recipeIdMap.set(key, (meal as any)._swapped_recipe_id);
          continue;
        }

        // Check if this recipe title was already saved (dedup)
        const existingId = titleToIdMap.get(meal.recipe.title);
        if (existingId) {
          recipeIdMap.set(key, existingId);
          continue;
        }

        const saved = await recipeService.saveRecipe({
          recipe: meal.recipe,
          originalPrompt: `Weekly plan: ${generatedPlan.plan_name} - ${meal.day_of_week} ${meal.meal_type}`,
          generationParams: { weekly_plan: true, day: meal.day_of_week, meal_type: meal.meal_type },
          aiModel: AI_CONFIG.model,
        });

        recipeIdMap.set(key, saved.id);
        titleToIdMap.set(meal.recipe.title, saved.id);
      }

      // 3. Calculate end date
      const startDate = form.startDate || new Date().toISOString().split('T')[0];
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // 4. Create the weekly plan
      const plan = await weeklyPlanService.createPlan({
        name: generatedPlan.plan_name,
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        days_included: form.selectedDays,
        meals_per_day: [...new Set(form.selectedDays.flatMap((d) => form.dayConfigs[d].meals))],
        daily_calorie_target: form.dailyCalorieTarget,
        is_batch_cooking: form.batchCookingEnabled,
        batch_config: form.batchConfig,
        notes: form.specialNotes || undefined,
        special_requests: form.specialNotes || undefined,
      });

      // 5. Save plan meals
      let sortOrder = 0;
      const mealPayloads: SavePlanMealPayload[] = [];

      for (const meal of generatedPlan.meals) {
        const key = `${meal.day_of_week}-${meal.meal_type}`;
        const recipeId = recipeIdMap.get(key) || null;
        const isExternal = !!meal.is_external;

        mealPayloads.push({
          weekly_plan_id: plan.id,
          recipe_id: isExternal ? null : recipeId,
          day_of_week: meal.day_of_week,
          meal_type: meal.meal_type,
          servings: meal.recipe?.servings || 1,
          is_prep_day: meal.is_prep_day || false,
          is_external: isExternal,
          external_description: isExternal ? 'Eating out' : undefined,
          estimated_calories: meal.estimated_calories || meal.recipe?.nutrition?.calories || 0,
          sort_order: sortOrder++,
        });
      }

      await weeklyPlanService.savePlanMeals(mealPayloads);

      // 6. Fetch the saved plan with full data
      const savedPlan = await weeklyPlanService.getActivePlan();
      if (savedPlan) {
        setActivePlan(savedPlan);
        setActivePlanLoaded(true);
      }

      // 7. Emit events
      weeklyPlanEvents.emit();
      recipeEvents.emit();

      // 8. Show success
      setShowSaveSuccess(true);
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert(
        String(t('common.error')),
        String(t('weeklyPlan.result.saveError'))
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Save success confirmation ----
  const handleSaveSuccessConfirm = () => {
    setShowSaveSuccess(false);
    setShowResult(false);
    clearAll();
  };

  // ---- Discard plan ----
  const handleDiscard = () => {
    setShowResult(false);
    setGeneratedPlan(null);
    resetWizard();
  };

  // ---- Dismiss retry error ----
  const handleDismissRetryError = () => {
    setShowRetryError(false);
    setShowWizard(true);
  };

  // ---- Mark a meal as eating out (toggle) ----
  const handleMarkEatingOut = (day: DayOfWeek, mealType: PlanMealType) => {
    if (!generatedPlan) return;

    const updatedMeals = generatedPlan.meals.map((m) => {
      if (m.day_of_week === day && m.meal_type === mealType) {
        // Toggle eating out state
        const isCurrentlyExternal = m.is_external;
        return {
          ...m,
          is_external: !isCurrentlyExternal,
        };
      }
      return m;
    });

    setGeneratedPlan({
      ...generatedPlan,
      meals: updatedMeals,
    });
  };

  // ---- Swap a meal with a recipe from the cookbook ----
  const handleSwapMeal = (day: DayOfWeek, mealType: PlanMealType, recipe: any) => {
    if (!generatedPlan) return;

    const updatedMeals = generatedPlan.meals.map((meal) => {
      if (meal.day_of_week === day && meal.meal_type === mealType) {
        return {
          ...meal,
          recipe: {
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            prep_time_minutes: recipe.prep_time_minutes,
            cook_time_minutes: recipe.cook_time_minutes,
            total_time_minutes: recipe.total_time_minutes || (recipe.prep_time_minutes + recipe.cook_time_minutes),
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            nutrition: recipe.nutrition,
            estimated_cost: recipe.estimated_cost,
            cost_currency: recipe.cost_currency,
            cost_per_serving: recipe.cost_per_serving || (recipe.estimated_cost / (recipe.servings || 1)),
            meal_types: recipe.meal_types,
            cuisine: recipe.cuisine,
            tags: recipe.tags,
            chef_tips: recipe.chef_tips || [],
            storage_instructions: recipe.storage_instructions || '',
            variations: recipe.variations || [],
          },
          estimated_calories: recipe.nutrition?.calories || 0,
          is_external: false,
          _swapped_recipe_id: recipe.id,
        } as typeof meal;
      }
      return meal;
    });

    setGeneratedPlan({
      ...generatedPlan,
      meals: updatedMeals,
    });
  };

  return {
    // State
    generatedPlan,
    isGenerating,
    generationError,
    isSaving,
    showSaveSuccess,
    showRetryError,
    regeneratingMeal,
    modifyingMeal,

    // Handlers
    handleGenerate,
    handleRegeneratePlan,
    handleRegenerateMeal,
    handleModifyMeal,
    handleSavePlan,
    handleSaveSuccessConfirm,
    handleDiscard,
    handleDismissRetryError,
    handleMarkEatingOut,
    handleSwapMeal,
  };
}


