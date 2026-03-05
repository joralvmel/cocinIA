import React from 'react';
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
import { type Recipe } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRecipeList } from '@/hooks';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const {
    recipes,
    filteredRecipes,
    isLoading,
    isRefreshing,
    refresh,
    searchQuery,
    setSearchQuery,
    filterState,
    filterActions,
    cuisineOptions,
    ingredientOptions,
    chipDefs,
  } = useRecipeList();

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
      {filterState.hasActiveFilters && (
        <Pressable
          onPress={filterActions.handleClearFilters}
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
          onFilterPress={() => filterActions.setShowFilters(true)}
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
              onAction={filterActions.handleClearAll}
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
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Filters BottomSheet */}
      <BottomSheet
        visible={filterState.showFilters}
        onClose={() => filterActions.setShowFilters(false)}
        title={String(t('recipes.filters.title' as any))}
        showOkButton
        okLabel={String(t('common.apply'))}
        onOk={filterActions.handleApplyFilters}
        headerActions={filterHeaderActions}
      >
        <View className="pb-6">
          {/* Ingredients Multi-Select */}
          {ingredientOptions.length > 0 && (
            <Section title={String(t('recipes.filters.ingredients' as any))} className="mb-4">
              <Pressable
                onPress={() => filterActions.setShowIngredientPicker(true)}
                className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text className={filterState.selectedIngredients.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
                  {filterState.selectedIngredients.length > 0
                    ? String(t('profile.selectedCount', { count: filterState.selectedIngredients.length } as any))
                    : String(t('recipes.filters.selectIngredients' as any))}
                </Text>
                <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
              </Pressable>
              {filterState.selectedIngredients.length > 0 && (
                <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                  {filterState.selectedIngredients.map((ing) => (
                    <Pressable
                      key={ing}
                      onPress={() => filterActions.setSelectedIngredients(filterState.selectedIngredients.filter((i) => i !== ing))}
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
                onPress={() => filterActions.setShowCuisinePicker(true)}
                className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Text className={filterState.selectedCuisines.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}>
                  {filterState.selectedCuisines.length > 0
                    ? String(t('profile.selectedCount', { count: filterState.selectedCuisines.length } as any))
                    : String(t('recipes.filters.selectCuisine' as any))}
                </Text>
                <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
              </Pressable>
              {filterState.selectedCuisines.length > 0 && (
                <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                  {filterState.selectedCuisines.map((cuisine) => (
                    <Pressable
                      key={cuisine}
                      onPress={() => filterActions.setSelectedCuisines(filterState.selectedCuisines.filter((c) => c !== cuisine))}
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
              value={filterState.maxCalories ?? 2000}
              step={50}
              onValueChange={(v) => filterActions.setMaxCalories(v >= 2000 ? undefined : v)}
              formatLabel={(v) => v >= 2000 ? String(t('recipeGeneration.noLimit' as any)) : `${v} kcal`}
            />
          </Section>

          {/* Difficulty */}
          <Section title={String(t('recipes.filters.difficulty' as any))} className="mb-4">
            <ChipGroup
              chips={chipDefs.difficultyChips}
              selectedIds={filterState.selectedDifficulties}
              onSelectionChange={filterActions.setSelectedDifficulties}
              multiple
            />
          </Section>

          {/* Meal Types */}
          <Section title={String(t('recipes.filters.mealType' as any))} className="mb-4">
            <ChipGroup
              chips={chipDefs.mealTypeChips}
              selectedIds={filterState.selectedMealTypes}
              onSelectionChange={filterActions.setSelectedMealTypes}
              multiple
            />
          </Section>

          {/* Max Time */}
          <Section title={String(t('recipes.filters.maxTime' as any))} className="mb-4">
            <ChipGroup
              chips={chipDefs.timeChips}
              selectedIds={filterState.selectedMaxTime}
              onSelectionChange={(ids) => filterActions.setSelectedMaxTime(ids.slice(-1))}
              multiple={false}
            />
          </Section>
        </View>
      </BottomSheet>

      {/* Ingredient Picker BottomSheet */}
      <BottomSheet
        visible={filterState.showIngredientPicker}
        onClose={() => { filterActions.setShowIngredientPicker(false); filterActions.setIngredientSearch(''); }}
        title={String(t('recipes.filters.ingredients' as any))}
      >
        <View className="pb-4">
          <SearchInput
            value={filterState.ingredientSearch}
            onChangeText={filterActions.setIngredientSearch}
            placeholder={String(t('common.search'))}
            className="mb-3"
          />
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {ingredientOptions
              .filter((opt) => !filterState.ingredientSearch.trim() || opt.label.toLowerCase().includes(filterState.ingredientSearch.toLowerCase()))
              .map((opt) => {
                const isSelected = filterState.selectedIngredients.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() =>
                      filterActions.setSelectedIngredients(
                        isSelected
                          ? filterState.selectedIngredients.filter((i) => i !== opt.value)
                          : [...filterState.selectedIngredients, opt.value],
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
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Cuisine Picker BottomSheet */}
      <BottomSheet
        visible={filterState.showCuisinePicker}
        onClose={() => { filterActions.setShowCuisinePicker(false); filterActions.setCuisineSearch(''); }}
        title={String(t('recipes.filters.cuisine' as any))}
      >
        <View className="pb-4">
          <SearchInput
            value={filterState.cuisineSearch}
            onChangeText={filterActions.setCuisineSearch}
            placeholder={String(t('common.search'))}
            className="mb-3"
          />
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {cuisineOptions
              .filter((opt) => !filterState.cuisineSearch.trim() || opt.label.toLowerCase().includes(filterState.cuisineSearch.toLowerCase()))
              .map((opt) => {
                const isSelected = filterState.selectedCuisines.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() =>
                      filterActions.setSelectedCuisines(
                        isSelected
                          ? filterState.selectedCuisines.filter((c) => c !== opt.value)
                          : [...filterState.selectedCuisines, opt.value],
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
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
