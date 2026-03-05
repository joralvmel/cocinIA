import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/ui';
import { useRecipeFilters, type UseRecipeFiltersOptions } from '@/hooks/useRecipeFilters';
import { FilterHeaderActions } from './FilterHeaderActions';
import { FilterIngredientsSection } from './FilterIngredientsSection';
import { FilterOptionsSection } from './FilterOptionsSection';

type RecipeFiltersModalProps = UseRecipeFiltersOptions;

export function RecipeFiltersModal(props: RecipeFiltersModalProps) {
  const { t } = useTranslation();
  const {
    form,
    ingredientsToUseText,
    setIngredientsToUseText,
    ingredientsToExcludeText,
    setIngredientsToExcludeText,
    profileFavoriteIngredients,
    resetPressed,
    clearPressed,
    mealTypeOptions,
    difficultyOptions,
    timeOptions,
    servingsOptions,
    allCuisineOptions,
    allEquipmentOptions,
    handleReset,
    handleClearAll,
    handleApply,
    handleMaxCaloriesChange,
    setMealTypes,
    setServings,
    setMaxTime,
    setCuisines,
    setEquipment,
    setDifficulty,
    setUseFavoriteIngredients,
  } = useRecipeFilters(props);

  return (
    <BottomSheet
      visible={props.visible}
      onClose={handleApply}
      title={String(t('recipeGeneration.advancedOptions'))}
      showOkButton
      okLabel={String(t('common.apply'))}
      onOk={handleApply}
      showCloseButton={false}
      headerActions={
        <FilterHeaderActions
          onClear={handleClearAll}
          onReset={handleReset}
          clearPressed={clearPressed}
          resetPressed={resetPressed}
        />
      }
    >
      <View className="pb-10 gap-5">
        <FilterIngredientsSection
          ingredientsToUseText={ingredientsToUseText}
          onIngredientsToUseChange={setIngredientsToUseText}
          ingredientsToExcludeText={ingredientsToExcludeText}
          onIngredientsToExcludeChange={setIngredientsToExcludeText}
          useFavoriteIngredients={form.useFavoriteIngredients || false}
          onUseFavoriteIngredientsChange={setUseFavoriteIngredients}
          favoriteIngredients={profileFavoriteIngredients}
        />

        <FilterOptionsSection
          form={form}
          mealTypeOptions={mealTypeOptions}
          servingsOptions={servingsOptions}
          timeOptions={timeOptions}
          difficultyOptions={difficultyOptions}
          allCuisineOptions={allCuisineOptions}
          allEquipmentOptions={allEquipmentOptions}
          onMealTypesChange={setMealTypes}
          onServingsChange={setServings}
          onMaxTimeChange={setMaxTime}
          onMaxCaloriesChange={handleMaxCaloriesChange}
          onCuisinesChange={setCuisines}
          onEquipmentChange={setEquipment}
          onDifficultyChange={setDifficulty}
        />
      </View>
    </BottomSheet>
  );
}

