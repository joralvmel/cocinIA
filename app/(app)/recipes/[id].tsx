import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Divider,
  Loader,
  MultiActionButton,
  AlertModal,
  type ActionOption,
} from '@/components/ui';
import {
  RecipeHero,
  NutritionCard,
  CostCard,
  TimeBreakdownCard,
  IngredientsList,
  StepsList,
  ChefTips,
  StorageCard,
  VariationsCard,
  TagsRow,
  EditRecipeSheet,
  PhotoOptionsSheet,
} from '@/components/recipes';
import { useRecipeDetail, useRecipeImage } from '@/hooks';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  // ---- Hooks ----
  const {
    recipe,
    isLoading,
    isSaving,
    isDeleting,
    loadRecipe,
    editState,
    editActions,
    handleDelete,
    expandedTips,
    toggleStepTip,
    alertModal,
    setAlertModal,
  } = useRecipeDetail(id);

  const {
    isUploadingImage,
    showPhotoOptions,
    setShowPhotoOptions,
    handlePickImage,
    handleCameraPress,
    handleGalleryPress,
    handleDeleteImage,
  } = useRecipeImage({
    recipeId: id!,
    reloadRecipe: loadRecipe,
    setAlertModal,
  });

  // ---- FAB options ----
  const fabOptions: ActionOption[] = [
    {
      id: 'edit',
      label: String(t('common.edit')),
      icon: 'pencil',
      color: 'amber',
      onPress: () => editActions.setIsEditing(true),
    },
    {
      id: 'delete',
      label: String(t('common.delete')),
      icon: 'trash',
      color: 'red',
      onPress: handleDelete,
    },
  ] as ActionOption[];

  // ---- Loading / empty states ----
  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Loader size="lg" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-6">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          {t('recipes.detail.notFound' as any)}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Loading overlay for image operations */}
        {isUploadingImage && (
          <View className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 items-center justify-center">
            <Loader size="lg" />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium">
              {t('recipes.detail.uploadingImage' as any)}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <RecipeHero recipe={recipe} />

          <View className="px-4 pb-24">
            {/* Nutrition */}
            {recipe.nutrition && <NutritionCard nutrition={recipe.nutrition} />}

            {/* Cost */}
            {recipe.estimated_cost != null && (
              <CostCard
                estimatedCost={recipe.estimated_cost}
                costCurrency={recipe.cost_currency}
                costPerServing={recipe.cost_per_serving}
              />
            )}

            {/* Time Breakdown */}
            <TimeBreakdownCard
              prepTime={recipe.prep_time_minutes}
              cookTime={recipe.cook_time_minutes}
              totalTime={recipe.total_time_minutes}
            />

            <Divider className="my-4" />

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <IngredientsList ingredients={recipe.ingredients} />
            )}

            <Divider className="my-4" />

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <StepsList
                steps={recipe.steps}
                expandedTips={expandedTips}
                onToggleTip={toggleStepTip}
              />
            )}

            {/* Chef Tips */}
            {recipe.chef_tips && <ChefTips tips={recipe.chef_tips} />}

            {/* Storage */}
            {recipe.storage_instructions && (
              <StorageCard instructions={recipe.storage_instructions} />
            )}

            {/* Variations */}
            {recipe.variations && <VariationsCard variations={recipe.variations} />}

            {/* Tags */}
            {recipe.tags && <TagsRow tags={recipe.tags} />}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-4">
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="primary-600"
            loading={isSaving || isDeleting}
            disabled={isSaving || isDeleting}
            options={fabOptions}
          />
        </View>
      </View>

      {/* Edit BottomSheet */}
      <EditRecipeSheet
        recipe={recipe}
        editState={editState}
        editActions={editActions}
        isSaving={isSaving}
        onPickImage={handlePickImage}
        onDeleteImage={handleDeleteImage}
      />

      {/* Photo Options BottomSheet */}
      <PhotoOptionsSheet
        visible={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onConfirm={alertModal.onConfirm}
        confirmLabel={alertModal.onConfirm ? String(t('common.delete')) : String(t('common.ok'))}
        cancelLabel={String(t('common.cancel'))}
      />
    </>
  );
}
