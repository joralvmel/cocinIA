/**
 * AI services barrel — re-exports everything consumers need
 */
export {
  geminiRecipeGenerationService,
  type RecipeGenerationResponse,
} from './recipeGeneration';

export {
  weeklyPlanGenerationService,
  type WeeklyPlanGenerationResponse,
  type DayGenerationResponse,
} from './weeklyPlanGeneration';

