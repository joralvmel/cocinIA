import { create } from 'zustand';
import type { Recipe } from '@/types';
import type { RecipeFilterOptions } from '@/services/recipes';

interface RecipesState {
  recipes: Recipe[];
  filterOptions: RecipeFilterOptions | null;
  appliedFilters: Record<string, unknown>;
  isLoaded: boolean;

  setRecipes: (recipes: Recipe[]) => void;
  setFilterOptions: (options: RecipeFilterOptions) => void;
  setAppliedFilters: (filters: Record<string, unknown>) => void;
  setLoaded: (loaded: boolean) => void;
  clear: () => void;
}

export const useRecipesStore = create<RecipesState>((set) => ({
  recipes: [],
  filterOptions: null,
  appliedFilters: {},
  isLoaded: false,

  setRecipes: (recipes) => set({ recipes }),
  setFilterOptions: (filterOptions) => set({ filterOptions }),
  setAppliedFilters: (appliedFilters) => set({ appliedFilters }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  clear: () => set({ recipes: [], filterOptions: null, appliedFilters: {}, isLoaded: false }),
}));

