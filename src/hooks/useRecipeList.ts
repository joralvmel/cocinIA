import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { recipeService } from '@/services';
import { type MealType, type DifficultyLevel } from '@/types';
import { recipeEvents } from '@/utils';
import { useRecipesStore } from '@/stores';
import { getDifficultyChips, getMealTypeChips, TIME_CHIPS } from '@/utils/recipeHelpers';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecipeFilters {
  searchQuery?: string;
  difficulty?: DifficultyLevel[];
  mealTypes?: MealType[];
  maxTime?: number;
  maxCalories?: number;
  cuisines?: string[];
  ingredients?: string[];
}

export interface RecipeListFilterState {
  selectedDifficulties: string[];
  selectedMealTypes: string[];
  selectedMaxTime: string[];
  maxCalories: number | undefined;
  selectedCuisines: string[];
  selectedIngredients: string[];
  showFilters: boolean;
  showIngredientPicker: boolean;
  showCuisinePicker: boolean;
  ingredientSearch: string;
  cuisineSearch: string;
  hasActiveFilters: boolean;
}

export interface RecipeListFilterActions {
  setSelectedDifficulties: (v: string[]) => void;
  setSelectedMealTypes: (v: string[]) => void;
  setSelectedMaxTime: (v: string[]) => void;
  setMaxCalories: (v: number | undefined) => void;
  setSelectedCuisines: (v: string[]) => void;
  setSelectedIngredients: (v: string[]) => void;
  setShowFilters: (v: boolean) => void;
  setShowIngredientPicker: (v: boolean) => void;
  setShowCuisinePicker: (v: boolean) => void;
  setIngredientSearch: (v: string) => void;
  setCuisineSearch: (v: string) => void;
  handleClearFilters: () => void;
  handleApplyFilters: () => void;
  handleClearAll: () => void;
}

export interface RecipeListChipDefs {
  difficultyChips: { id: string; label: string }[];
  mealTypeChips: { id: string; label: string }[];
  timeChips: { id: string; label: string }[];
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useRecipeList() {
  const { t } = useTranslation();

  // ---- Store ----
  const {
    recipes,
    filterOptions,
    isLoaded: storeIsLoaded,
    setRecipes,
    setFilterOptions,
    setLoaded,
  } = useRecipesStore();

  // ---- Loading state ----
  const [isLoading, setIsLoading] = useState(!storeIsLoaded);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ---- Search (instant, client-side) ----
  const [searchQuery, setSearchQuery] = useState('');

  // ---- Filter UI toggles ----
  const [showFilters, setShowFilters] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [showCuisinePicker, setShowCuisinePicker] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [cuisineSearch, setCuisineSearch] = useState('');

  // ---- Filter selections ----
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedMaxTime, setSelectedMaxTime] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // ---- Applied filters (only update on "Apply") ----
  const [appliedFilters, setAppliedFilters] = useState<RecipeFilters>({});

  // ---- Data loading ----
  const loadData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setIsRefreshing(true);
        else if (!storeIsLoaded) setIsLoading(true);

        const [recipesData, optionsData] = await Promise.all([
          recipeService.getFilteredRecipes(appliedFilters),
          filterOptions ? Promise.resolve(filterOptions) : recipeService.getFilterOptions(),
        ]);

        setRecipes(recipesData);
        if (optionsData) setFilterOptions(optionsData);
        setLoaded(true);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [appliedFilters, storeIsLoaded, filterOptions, setRecipes, setFilterOptions, setLoaded],
  );

  // Initial load — only fetch when no cached data
  useEffect(() => {
    if (!storeIsLoaded) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when applied filters change (skip first mount)
  const [isFirstMount, setIsFirstMount] = useState(true);
  useEffect(() => {
    if (isFirstMount) {
      setIsFirstMount(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // Subscribe to recipe-change events from other screens
  useEffect(() => {
    return recipeEvents.subscribe(() => {
      loadData();
    });
  }, [loadData]);

  // ---- Client-side text search ----
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const query = searchQuery.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title?.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query),
    );
  }, [recipes, searchQuery]);

  // ---- Derived filter options ----
  const cuisineOptions = useMemo(() => {
    if (!filterOptions?.cuisines) return [];
    return filterOptions.cuisines.map((c: string) => ({ value: c, label: c }));
  }, [filterOptions?.cuisines]);

  const ingredientOptions = useMemo(() => {
    if (!filterOptions?.ingredients) return [];
    return filterOptions.ingredients.map((ing: string) => ({
      value: ing,
      label: ing.charAt(0).toUpperCase() + ing.slice(1),
    }));
  }, [filterOptions?.ingredients]);

  const hasActiveFilters = useMemo(
    () =>
      selectedDifficulties.length > 0 ||
      selectedMealTypes.length > 0 ||
      selectedMaxTime.length > 0 ||
      maxCalories !== undefined ||
      selectedCuisines.length > 0 ||
      selectedIngredients.length > 0,
    [selectedDifficulties, selectedMealTypes, selectedMaxTime, maxCalories, selectedCuisines, selectedIngredients],
  );

  // ---- Actions ----
  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedMealTypes([]);
    setSelectedMaxTime([]);
    setMaxCalories(undefined);
    setSelectedCuisines([]);
    setSelectedIngredients([]);
  };

  const handleApplyFilters = () => {
    const filters: RecipeFilters = {};

    if (selectedDifficulties.length > 0) {
      filters.difficulty = selectedDifficulties as DifficultyLevel[];
    }
    if (selectedMealTypes.length > 0) {
      filters.mealTypes = selectedMealTypes as MealType[];
    }
    if (selectedMaxTime.length > 0) {
      filters.maxTime = Math.max(...selectedMaxTime.map((v) => parseInt(v)));
    }
    if (maxCalories !== undefined) {
      filters.maxCalories = maxCalories;
    }
    if (selectedCuisines.length > 0) {
      filters.cuisines = selectedCuisines;
    }
    if (selectedIngredients.length > 0) {
      filters.ingredients = selectedIngredients;
    }

    setAppliedFilters(filters);
    setShowFilters(false);
  };

  /** Clears selections + applied filters + search query */
  const handleClearAll = () => {
    setSearchQuery('');
    handleClearFilters();
    setAppliedFilters({});
  };

  // ---- Chip definitions (depend on t) ----
  const chipDefs: RecipeListChipDefs = useMemo(
    () => ({
      difficultyChips: getDifficultyChips(t as any),
      mealTypeChips: getMealTypeChips(t as any),
      timeChips: TIME_CHIPS,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return {
    // Data
    recipes,
    filteredRecipes,
    isLoading,
    isRefreshing,
    refresh: () => loadData(true),

    // Search
    searchQuery,
    setSearchQuery,

    // Filter state
    filterState: {
      selectedDifficulties,
      selectedMealTypes,
      selectedMaxTime,
      maxCalories,
      selectedCuisines,
      selectedIngredients,
      showFilters,
      showIngredientPicker,
      showCuisinePicker,
      ingredientSearch,
      cuisineSearch,
      hasActiveFilters,
    } as RecipeListFilterState,

    // Filter actions
    filterActions: {
      setSelectedDifficulties,
      setSelectedMealTypes,
      setSelectedMaxTime,
      setMaxCalories,
      setSelectedCuisines,
      setSelectedIngredients,
      setShowFilters,
      setShowIngredientPicker,
      setShowCuisinePicker,
      setIngredientSearch,
      setCuisineSearch,
      handleClearFilters,
      handleApplyFilters,
      handleClearAll,
    } as RecipeListFilterActions,

    // Options for pickers
    cuisineOptions,
    ingredientOptions,

    // Chip definitions
    chipDefs,
  };
}




