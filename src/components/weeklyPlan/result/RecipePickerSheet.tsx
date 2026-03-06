import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  FullScreenModal,
  SearchInput,
  BottomSheet,
  ChipGroup,
  RangeSlider,
  Section,
} from '@/components/ui';
import { recipeService } from '@/services';
import { type Recipe } from '@/types';

interface RecipePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  title?: string;
}

export function RecipePickerSheet({
  visible,
  onClose,
  onSelect,
  title,
}: RecipePickerSheetProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [selectedMaxTime, setSelectedMaxTime] = useState<string[]>([]);

  // Cuisine picker sub-sheet
  const [showCuisinePicker, setShowCuisinePicker] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');

  // Fetch recipes when visible
  useEffect(() => {
    if (visible) {
      loadRecipes();
    }
  }, [visible]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await recipeService.getMyRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes for picker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chip definitions
  const mealTypeChips = useMemo(() => [
    { id: 'breakfast', label: String(t('recipeGeneration.mealTypes.breakfast')) },
    { id: 'lunch', label: String(t('recipeGeneration.mealTypes.lunch')) },
    { id: 'dinner', label: String(t('recipeGeneration.mealTypes.dinner')) },
    { id: 'snack', label: String(t('recipeGeneration.mealTypes.snack')) },
  ], [t]);

  const difficultyChips = useMemo(() => [
    { id: 'easy', label: String(t('recipeGeneration.difficultyEasy')) },
    { id: 'medium', label: String(t('recipeGeneration.difficultyMedium')) },
    { id: 'hard', label: String(t('recipeGeneration.difficultyHard')) },
  ], [t]);

  const timeChips = useMemo(() => [
    { id: '15', label: '15 min' },
    { id: '30', label: '30 min' },
    { id: '45', label: '45 min' },
    { id: '60', label: `1 ${t('recipeGeneration.hour')}` },
    { id: '120', label: `2+ ${t('recipeGeneration.hours')}` },
  ], [t]);

  // Extract unique cuisines from recipes
  const cuisineOptions = useMemo(() => {
    const cuisines = new Set<string>();
    recipes.forEach((r) => { if (r.cuisine) cuisines.add(r.cuisine); });
    return Array.from(cuisines).sort().map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
  }, [recipes]);

  // Active filters count
  const hasActiveFilters = selectedMealTypes.length > 0 || selectedDifficulties.length > 0 ||
    selectedCuisines.length > 0 || maxCalories !== undefined || selectedMaxTime.length > 0;

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }
    if (selectedMealTypes.length > 0) {
      result = result.filter((r) =>
        r.meal_types?.some((mt: string) => selectedMealTypes.includes(mt))
      );
    }
    if (selectedDifficulties.length > 0) {
      result = result.filter((r) =>
        r.difficulty && selectedDifficulties.includes(r.difficulty)
      );
    }
    if (selectedCuisines.length > 0) {
      result = result.filter((r) =>
        r.cuisine && selectedCuisines.includes(r.cuisine)
      );
    }
    if (maxCalories !== undefined) {
      result = result.filter((r) =>
        !r.nutrition?.calories || r.nutrition.calories <= maxCalories
      );
    }
    if (selectedMaxTime.length > 0) {
      const maxTime = parseInt(selectedMaxTime[0], 10);
      if (!isNaN(maxTime)) {
        result = result.filter((r) =>
          !r.total_time_minutes || r.total_time_minutes <= maxTime
        );
      }
    }
    return result;
  }, [recipes, search, selectedMealTypes, selectedDifficulties, selectedCuisines, maxCalories, selectedMaxTime]);

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe);
    handleClose();
  };

  const clearFilters = () => {
    setSelectedMealTypes([]);
    setSelectedDifficulties([]);
    setSelectedCuisines([]);
    setMaxCalories(undefined);
    setSelectedMaxTime([]);
  };

  const handleClose = () => {
    onClose();
    setSearch('');
    clearFilters();
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <Pressable
      onPress={() => handleSelect(item)}
      className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800"
    >
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row items-center gap-3 mt-1">
          {item.nutrition?.calories > 0 && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              🔥 {item.nutrition.calories} cal
            </Text>
          )}
          {item.total_time_minutes > 0 && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              ⏱ {item.total_time_minutes} min
            </Text>
          )}
          {item.difficulty && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {item.difficulty}
            </Text>
          )}
          {item.cuisine && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {item.cuisine}
            </Text>
          )}
        </View>
      </View>
      <FontAwesome name="plus-circle" size={20} color={colors.primary} />
    </Pressable>
  );

  // Filter header actions
  const filterHeaderActions = (
    <View className="flex-row items-center gap-3">
      {hasActiveFilters && (
        <Pressable
          onPress={clearFilters}
          className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-700"
        >
          <FontAwesome name="refresh" size={14} color={colors.error} />
        </Pressable>
      )}
    </View>
  );

  return (
    <FullScreenModal
      visible={visible}
      onClose={handleClose}
      title={title || t('weeklyPlan.result.swapFromCookbook')}
      useChevron
    >
      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={String(t('common.search'))}
          showFilter
          onFilterPress={() => setShowFilters(true)}
        />
      </View>

      {/* Active filter indicators */}
      {hasActiveFilters && (
        <View className="px-4 pb-2 flex-row items-center gap-2">
          <Text className="text-xs text-primary-600 dark:text-primary-400 font-medium">
            {t('recipes.filters.active' as any)}
          </Text>
          <Pressable onPress={clearFilters}>
            <Text className="text-xs text-red-500">{t('recipeGeneration.clearAll')}</Text>
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12 px-4">
          <FontAwesome name="book" size={32} color={colors.textMuted} />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
            {recipes.length === 0
              ? t('weeklyPlan.result.noCookbookRecipes')
              : t('weeklyPlan.result.noMatchingRecipes')
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filters BottomSheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title={String(t('recipes.filters.title' as any))}
        showOkButton
        okLabel={String(t('common.apply'))}
        onOk={() => setShowFilters(false)}
        headerActions={filterHeaderActions}
      >
        <View className="pb-6">
          {/* Cuisine */}
          {cuisineOptions.length > 0 && (
            <Section title={String(t('recipes.filters.cuisine' as any))} className="mb-4">
              <Pressable
                onPress={() => setShowCuisinePicker(true)}
                className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text className={selectedCuisines.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
                  {selectedCuisines.length > 0
                    ? `${selectedCuisines.length} ${String(t('common.selected' as any))}`
                    : String(t('recipes.filters.selectCuisine' as any))}
                </Text>
                <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
              </Pressable>
              {selectedCuisines.length > 0 && (
                <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                  {selectedCuisines.map((cuisine) => (
                    <Pressable
                      key={cuisine}
                      onPress={() => setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine))}
                      className="flex-row items-center bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-full"
                    >
                      <Text className="text-xs text-primary-700 dark:text-primary-300 mr-1">
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </Text>
                      <FontAwesome name="times" size={10} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </Section>
          )}

          {/* Max Calories */}
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
          <View className="max-h-80">
            {cuisineOptions
              .filter((opt) => !cuisineSearch.trim() || opt.label.toLowerCase().includes(cuisineSearch.toLowerCase()))
              .map((opt) => {
                const isSelected = selectedCuisines.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() =>
                      setSelectedCuisines(
                        isSelected
                          ? selectedCuisines.filter((c) => c !== opt.value)
                          : [...selectedCuisines, opt.value],
                      )
                    }
                    className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                  >
                    <Text className={`flex-1 text-base ${isSelected ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-900 dark:text-gray-50'}`}>
                      {opt.label}
                    </Text>
                    {isSelected && <FontAwesome name="check" size={16} color={colors.primary} />}
                  </Pressable>
                );
              })}
          </View>
        </View>
      </BottomSheet>
    </FullScreenModal>
  );
}

