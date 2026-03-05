import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, FlatList, RefreshControl, Pressable, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  SearchInput,
  EmptyState,
  RecipeCard,
  BottomSheet,
  ChipGroup,
  RangeSlider,
  Section,
  Loader,
} from '@/components/ui';
import { recipeService } from '@/services';
import { type Recipe, type MealType, type DifficultyLevel } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { recipeEvents } from '@/utils';
import { useRecipesStore } from '@/stores';

interface RecipeFilters {
  searchQuery?: string;
  difficulty?: DifficultyLevel[];
  mealTypes?: MealType[];
  maxTime?: number;
  maxCalories?: number;
  cuisines?: string[];
  ingredients?: string[];
}

interface RecipeFilterOptions {
  difficulties: DifficultyLevel[];
  mealTypes: MealType[];
  cuisines: string[];
  ingredients: string[];
  maxTime: number;
  maxCalories: number;
}

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  // Recipes store — cached across tab switches
  const {
    recipes,
    filterOptions,
    isLoaded: storeIsLoaded,
    setRecipes,
    setFilterOptions,
    setLoaded,
  } = useRecipesStore();

  // Show loader only on very first load (no cached data yet)
  const [isLoading, setIsLoading] = useState(!storeIsLoaded);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [showCuisinePicker, setShowCuisinePicker] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [cuisineSearch, setCuisineSearch] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedMaxTime, setSelectedMaxTime] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Applied filters (only update when Apply is pressed)
  const [appliedFilters, setAppliedFilters] = useState<RecipeFilters>({});

  const loadData = useCallback(async (showRefresh = false) => {
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
  }, [appliedFilters, storeIsLoaded, filterOptions, setRecipes, setFilterOptions, setLoaded]);

  // Initial load — only fetch if not already cached
  useEffect(() => {
    if (!storeIsLoaded) {
      loadData();
    }
  }, []); // run once on mount

  // Reload when applied filters change (after first mount)
  const [isFirstMount, setIsFirstMount] = useState(true);
  useEffect(() => {
    if (isFirstMount) { setIsFirstMount(false); return; }
    loadData();
  }, [appliedFilters]);

  // Subscribe to recipe change events (save, edit, delete from other screens)
  useEffect(() => {
    const unsubscribe = recipeEvents.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  // Filter by search query (instant)
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe =>
      recipe.title?.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  // Difficulty options
  const difficultyChips = [
    { id: 'easy', label: String(t('recipeGeneration.difficultyEasy')) },
    { id: 'medium', label: String(t('recipeGeneration.difficultyMedium')) },
    { id: 'hard', label: String(t('recipeGeneration.difficultyHard')) },
  ];

  // Meal type options
  const mealTypeChips = [
    { id: 'breakfast', label: String(t('recipeGeneration.mealTypes.breakfast')) },
    { id: 'lunch', label: String(t('recipeGeneration.mealTypes.lunch')) },
    { id: 'dinner', label: String(t('recipeGeneration.mealTypes.dinner')) },
    { id: 'snack', label: String(t('recipeGeneration.mealTypes.snack')) },
    { id: 'dessert', label: String(t('recipeGeneration.mealTypes.dessert')) },
  ];

  // Time options
  const timeChips = [
    { id: '15', label: '≤ 15 min' },
    { id: '30', label: '≤ 30 min' },
    { id: '45', label: '≤ 45 min' },
    { id: '60', label: '≤ 1h' },
    { id: '90', label: '≤ 1.5h' },
    { id: '120', label: '≤ 2h' },
  ];

  // Cuisine options from filter data
  const cuisineOptions = useMemo(() => {
    if (!filterOptions?.cuisines) return [];
    return filterOptions.cuisines.map((c: string) => ({
      value: c,
      label: c,
    }));
  }, [filterOptions?.cuisines]);

  // Ingredient options from filter data
  const ingredientOptions = useMemo(() => {
    if (!filterOptions?.ingredients) return [];
    return filterOptions.ingredients.map((ing: string) => ({
      value: ing,
      label: ing.charAt(0).toUpperCase() + ing.slice(1),
    }));
  }, [filterOptions?.ingredients]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedDifficulties.length > 0 ||
      selectedMealTypes.length > 0 ||
      selectedMaxTime.length > 0 ||
      maxCalories !== undefined ||
      selectedCuisines.length > 0 ||
      selectedIngredients.length > 0;
  }, [selectedDifficulties, selectedMealTypes, selectedMaxTime, maxCalories, selectedCuisines, selectedIngredients]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedMealTypes([]);
    setSelectedMaxTime([]);
    setMaxCalories(undefined);
    setSelectedCuisines([]);
    setSelectedIngredients([]);
  };

  // Apply filters
  const handleApplyFilters = () => {
    const filters: RecipeFilters = {};

    if (selectedDifficulties.length > 0) {
      filters.difficulty = selectedDifficulties as DifficultyLevel[];
    }
    if (selectedMealTypes.length > 0) {
      filters.mealTypes = selectedMealTypes as MealType[];
    }
    if (selectedMaxTime.length > 0) {
      // Use the maximum of selected times
      const maxTime = Math.max(...selectedMaxTime.map(t => parseInt(t)));
      filters.maxTime = maxTime;
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

  // Navigate to recipe detail
  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}` as any);
  };

  // Render recipe card
  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <RecipeCard
      variant="horizontal"
      title={item.title}
      description={item.description}
      image={item.image_url || undefined}
      time={item.total_time_minutes ? `${item.total_time_minutes} min` : undefined}
      servings={item.servings}
      calories={item.nutrition?.calories}
      difficulty={item.difficulty as 'easy' | 'medium' | 'hard' | undefined}
      onPress={() => handleRecipePress(item)}
      className="mb-3"
    />
  );

  // Header actions for the BottomSheet
  const filterHeaderActions = (
    <View className="flex-row items-center gap-3">
      {hasActiveFilters && (
        <Pressable
          onPress={handleClearFilters}
          className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-700"
        >
          <FontAwesome name="refresh" size={14} color={colors.error} />
        </Pressable>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={String(t('recipes.searchPlaceholder' as any))}
          showFilter
          onFilterPress={() => setShowFilters(true)}
        />
      </View>

      {/* Recipe List or Empty State */}
      {filteredRecipes.length === 0 ? (
        <View className="flex-1 justify-center">
          {recipes.length === 0 ? (
            <EmptyState
              icon="book"
              title={String(t('recipes.emptyTitle' as any))}
              description={String(t('recipes.emptyDescription' as any))}
              actionLabel={String(t('recipes.emptyAction' as any))}
              onAction={() => router.push('/home')}
            />
          ) : (
            <EmptyState
              icon="search"
              title={String(t('recipes.noResultsTitle' as any))}
              description={String(t('recipes.noResultsDescription' as any))}
              variant="search"
              actionLabel={String(t('recipes.filters.clear' as any))}
              onAction={() => {
                setSearchQuery('');
                handleClearFilters();
                setAppliedFilters({});
              }}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Filters BottomSheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title={String(t('recipes.filters.title' as any))}
        showOkButton
        okLabel={String(t('common.apply'))}
        onOk={handleApplyFilters}
        headerActions={filterHeaderActions}
      >
        <View className="pb-6">
          {/* Ingredients Multi-Select */}
          {ingredientOptions.length > 0 && (
            <Section title={String(t('recipes.filters.ingredients' as any))} className="mb-4">
              <Pressable
                onPress={() => setShowIngredientPicker(true)}
                className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text className={selectedIngredients.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
                  {selectedIngredients.length > 0
                    ? String(t('profile.selectedCount', { count: selectedIngredients.length } as any))
                    : String(t('recipes.filters.selectIngredients' as any))}
                </Text>
                <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
              </Pressable>
              {selectedIngredients.length > 0 && (
                <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                  {selectedIngredients.map(ing => (
                    <Pressable
                      key={ing}
                      onPress={() => setSelectedIngredients(prev => prev.filter(i => i !== ing))}
                      className="flex-row items-center bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-full"
                    >
                      <Text className="text-xs text-primary-700 dark:text-primary-300 mr-1">{ing.charAt(0).toUpperCase() + ing.slice(1)}</Text>
                      <FontAwesome name="times" size={10} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </Section>
          )}

          {/* Cuisine Multi-Select */}
          {cuisineOptions.length > 0 && (
            <Section title={String(t('recipes.filters.cuisine' as any))} className="mb-4">
              <Pressable
                onPress={() => setShowCuisinePicker(true)}
                className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text className={selectedCuisines.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
                  {selectedCuisines.length > 0
                    ? String(t('profile.selectedCount', { count: selectedCuisines.length } as any))
                    : String(t('recipes.filters.selectCuisine' as any))}
                </Text>
                <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
              </Pressable>
              {selectedCuisines.length > 0 && (
                <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                  {selectedCuisines.map(cuisine => (
                    <Pressable
                      key={cuisine}
                      onPress={() => setSelectedCuisines(prev => prev.filter(c => c !== cuisine))}
                      className="flex-row items-center bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-full"
                    >
                      <Text className="text-xs text-primary-700 dark:text-primary-300 mr-1">{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</Text>
                      <FontAwesome name="times" size={10} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </Section>
          )}

          {/* Max Calories Slider */}
          <Section title={String(t('recipes.filters.maxCalories' as any))} className="mb-4">
            <RangeSlider
              min={100}
              max={2000}
              value={maxCalories ?? 2000}
              step={50}
              onValueChange={(v) => setMaxCalories(v >= 2000 ? undefined : v)}
              formatLabel={(v) => v >= 2000 ? String(t('recipeGeneration.noLimit' as any)) : `${v} kcal`}
            />
          </Section>

          {/* Difficulty */}
          <Section title={String(t('recipes.filters.difficulty' as any))} className="mb-4">
            <ChipGroup
              chips={difficultyChips}
              selectedIds={selectedDifficulties}
              onSelectionChange={setSelectedDifficulties}
              multiple
            />
          </Section>

          {/* Meal Types */}
          <Section title={String(t('recipes.filters.mealType' as any))} className="mb-4">
            <ChipGroup
              chips={mealTypeChips}
              selectedIds={selectedMealTypes}
              onSelectionChange={setSelectedMealTypes}
              multiple
            />
          </Section>

          {/* Max Time */}
          <Section title={String(t('recipes.filters.maxTime' as any))} className="mb-4">
            <ChipGroup
              chips={timeChips}
              selectedIds={selectedMaxTime}
              onSelectionChange={(ids) => setSelectedMaxTime(ids.slice(-1))}
              multiple={false}
            />
          </Section>
        </View>
      </BottomSheet>

      {/* Ingredient Picker BottomSheet */}
      <BottomSheet
        visible={showIngredientPicker}
        onClose={() => { setShowIngredientPicker(false); setIngredientSearch(''); }}
        title={String(t('recipes.filters.ingredients' as any))}
      >
        <View className="pb-4">
          <SearchInput
            value={ingredientSearch}
            onChangeText={setIngredientSearch}
            placeholder={String(t('common.search'))}
            className="mb-3"
          />
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {ingredientOptions
              .filter(opt => !ingredientSearch.trim() || opt.label.toLowerCase().includes(ingredientSearch.toLowerCase()))
              .map(opt => {
                const isSelected = selectedIngredients.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSelectedIngredients(prev =>
                      isSelected ? prev.filter(i => i !== opt.value) : [...prev, opt.value]
                    )}
                    className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                  >
                    <Text className={`flex-1 text-base ${isSelected ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-900 dark:text-gray-50'}`}>
                      {opt.label}
                    </Text>
                    {isSelected && <FontAwesome name="check" size={16} color={colors.primary} />}
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Cuisine Picker BottomSheet */}
      <BottomSheet
        visible={showCuisinePicker}
        onClose={() => { setShowCuisinePicker(false); setCuisineSearch(''); }}
        title={String(t('recipes.filters.cuisine' as any))}
      >
        <View className="pb-4">
          <SearchInput
            value={cuisineSearch}
            onChangeText={setCuisineSearch}
            placeholder={String(t('common.search'))}
            className="mb-3"
          />
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {cuisineOptions
              .filter(opt => !cuisineSearch.trim() || opt.label.toLowerCase().includes(cuisineSearch.toLowerCase()))
              .map(opt => {
                const isSelected = selectedCuisines.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSelectedCuisines(prev =>
                      isSelected ? prev.filter(c => c !== opt.value) : [...prev, opt.value]
                    )}
                    className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                  >
                    <Text className={`flex-1 text-base ${isSelected ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-900 dark:text-gray-50'}`}>
                      {opt.label}
                    </Text>
                    {isSelected && <FontAwesome name="check" size={16} color={colors.primary} />}
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
