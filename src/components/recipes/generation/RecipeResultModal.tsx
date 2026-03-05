import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  FullScreenModal,
  Divider,
  Loader,
  MultiActionButton,
} from '@/components/ui';
import { useRecipeResult, type UseRecipeResultOptions } from '@/hooks/useRecipeResult';
import { type AIRecipeResponse } from '@/types';

// Reuse detail sub-components
import {
  NutritionCard,
  CostCard,
  TimeBreakdownCard,
  IngredientsList,
  StepsList,
  ChefTips,
  StorageCard,
  VariationsCard,
  TagsRow,
} from '../detail';

// Generation sub-components
import { RecipeResultHeader } from './RecipeResultHeader';
import { ModifyRecipeSheet } from './ModifyRecipeSheet';

interface RecipeResultModalProps extends UseRecipeResultOptions {
  visible: boolean;
  onClose: () => void;
  recipe: AIRecipeResponse | null;
  isLoading?: boolean;
}

export function RecipeResultModal({
  visible,
  onClose,
  recipe,
  isLoading = false,
  onRegenerate,
  onModify,
  onSave,
  onDiscard,
  isSaving = false,
  isModifying = false,
}: RecipeResultModalProps) {
  const { t } = useTranslation();

  const {
    expandedTips,
    toggleStepTip,
    showModifySheet,
    modifyText,
    setModifyText,
    handleModifySubmit,
    handleCloseModifySheet,
    fabOptions,
  } = useRecipeResult({
    onRegenerate,
    onModify,
    onSave,
    onDiscard,
    isSaving,
    isModifying,
  });

  // Loading state
  if (isLoading) {
    return (
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={String(t('recipeGeneration.generating'))}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Loader size="lg" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            {t('recipeGeneration.generatingMessage')}
          </Text>
        </View>
      </FullScreenModal>
    );
  }

  if (!recipe) return null;

  return (
    <>
      <FullScreenModal visible={visible} onClose={onClose} title={recipe.title} useChevron>
        {/* Modifying overlay */}
        {isModifying && (
          <View className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 items-center justify-center">
            <Loader size="lg" />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium">
              {t('recipeGeneration.modifyingMessage')}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-4 pb-24">
            <RecipeResultHeader recipe={recipe} />

            <NutritionCard nutrition={recipe.nutrition} />

            <CostCard
              estimatedCost={recipe.estimated_cost}
              costCurrency={recipe.cost_currency}
              costPerServing={recipe.cost_per_serving}
            />

            <TimeBreakdownCard
              prepTime={recipe.prep_time_minutes}
              cookTime={recipe.cook_time_minutes}
              totalTime={recipe.total_time_minutes}
            />

            <Divider className="my-4" />

            <IngredientsList ingredients={recipe.ingredients} />

            <Divider className="my-4" />

            <StepsList
              steps={recipe.steps}
              expandedTips={expandedTips}
              onToggleTip={toggleStepTip}
            />

            {recipe.chef_tips && <ChefTips tips={recipe.chef_tips} />}

            {recipe.storage_instructions && (
              <StorageCard instructions={recipe.storage_instructions} />
            )}

            {recipe.variations && <VariationsCard variations={recipe.variations} />}

            {recipe.tags && <TagsRow tags={recipe.tags} />}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="primary-600"
            loading={isSaving || isModifying}
            disabled={isSaving || isModifying}
            options={fabOptions}
          />
        </View>
      </FullScreenModal>

      {/* Modify Recipe Sheet */}
      <ModifyRecipeSheet
        visible={showModifySheet}
        onClose={handleCloseModifySheet}
        modifyText={modifyText}
        onModifyTextChange={setModifyText}
        onSubmit={handleModifySubmit}
        isModifying={isModifying}
      />
    </>
  );
}

