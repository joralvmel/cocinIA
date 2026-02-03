import { create } from 'zustand';
import { type AIRecipeResponse, type RecipeSearchForm } from '@/types';

interface RecipeGenerationState {
  // Form state
  form: RecipeSearchForm;

  // Generated recipe
  generatedRecipe: AIRecipeResponse | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  showAdvancedOptions: boolean;
  showRecipeResult: boolean;

  // Original prompt for regeneration
  originalPrompt: string;

  // Actions
  setFormField: <K extends keyof RecipeSearchForm>(field: K, value: RecipeSearchForm[K]) => void;
  toggleQuickFilter: (filterId: string) => void;
  resetForm: () => void;
  setGeneratedRecipe: (recipe: AIRecipeResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowAdvancedOptions: (show: boolean) => void;
  setShowRecipeResult: (show: boolean) => void;
  setOriginalPrompt: (prompt: string) => void;
  clearAll: () => void;
}

const initialForm: RecipeSearchForm = {
  prompt: '',
  quickFilters: [],
  recipeName: '',
  ingredientsToUse: [],
  ingredientsToExclude: [],
  useFavoriteIngredients: false,
  mealTypes: [],
  servings: undefined,
  maxTime: undefined,
  maxCalories: undefined,
  cuisines: [],
  equipment: [],
  difficulty: undefined,
};

export const useRecipeGenerationStore = create<RecipeGenerationState>((set, get) => ({
  // Initial state
  form: initialForm,
  generatedRecipe: null,
  isLoading: false,
  error: null,
  showAdvancedOptions: false,
  showRecipeResult: false,
  originalPrompt: '',

  // Actions
  setFormField: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
    }));
  },

  toggleQuickFilter: (filterId) => {
    set((state) => {
      const currentFilters = state.form.quickFilters;
      const newFilters = currentFilters.includes(filterId)
        ? currentFilters.filter((f) => f !== filterId)
        : [...currentFilters, filterId];
      return {
        form: { ...state.form, quickFilters: newFilters },
      };
    });
  },

  resetForm: () => {
    set({ form: initialForm, error: null });
  },

  setGeneratedRecipe: (recipe) => {
    set({ generatedRecipe: recipe, showRecipeResult: recipe !== null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  setShowAdvancedOptions: (show) => {
    set({ showAdvancedOptions: show });
  },

  setShowRecipeResult: (show) => {
    set({ showRecipeResult: show });
  },

  setOriginalPrompt: (prompt) => {
    set({ originalPrompt: prompt });
  },

  clearAll: () => {
    set({
      form: initialForm,
      generatedRecipe: null,
      isLoading: false,
      error: null,
      showAdvancedOptions: false,
      showRecipeResult: false,
      originalPrompt: '',
    });
  },
}));
