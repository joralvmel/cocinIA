import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  FullScreenModal,
  Card,
  Badge,
  Divider,
  Loader,
  Section,
  BottomSheet,
  Input,
  Button,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type AIRecipeResponse } from '@/types';

interface RecipeResultModalProps {
  visible: boolean;
  onClose: () => void;
  recipe: AIRecipeResponse | null;
  isLoading?: boolean;
  onRegenerate: () => void;
  onModify: (modification: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  isModifying?: boolean;
}

export function RecipeResultModal({
  visible,
  onClose,
  recipe,
  isLoading = false,
  onRegenerate,
  onModify,
  onSave,
  isSaving = false,
  isModifying = false,
}: RecipeResultModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});
  const [showModifySheet, setShowModifySheet] = useState(false);
  const [modifyText, setModifyText] = useState('');

  const toggleStepTip = (stepNumber: number) => {
    setExpandedTips(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleModifyPress = () => {
    setShowFabMenu(false);
    setShowModifySheet(true);
  };

  const handleModifySubmit = () => {
    if (modifyText.trim()) {
      onModify(modifyText.trim());
      setModifyText('');
      setShowModifySheet(false);
    }
  };

  const handleRegeneratePress = () => {
    setShowFabMenu(false);
    onRegenerate();
  };

  const handleSavePress = () => {
    setShowFabMenu(false);
    onSave();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return String(t('recipeGeneration.difficultyEasy'));
      case 'medium': return String(t('recipeGeneration.difficultyMedium'));
      case 'hard': return String(t('recipeGeneration.difficultyHard'));
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <FullScreenModal visible={visible} onClose={onClose} title={String(t('recipeGeneration.generating'))}>
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
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={recipe.title}
      >
        {/* Loading overlay when modifying */}
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

            {/* Description */}
            <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {recipe.description}
            </Text>

            {/* Quick Info Badges */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              <Badge
                variant={getDifficultyColor(recipe.difficulty) as any}
                label={getDifficultyLabel(recipe.difficulty)}
              />
              <Badge variant="info" label={`⏱️ ${recipe.total_time_minutes} min`} />
              <Badge variant="default" label={`👥 ${recipe.servings} ${t('recipeGeneration.servingsLabel')}`} />
              <Badge variant="default" label={recipe.cuisine} />
            </View>

            {/* Nutrition Card */}
            <Card variant="default" className="mb-4">
              <View className="flex-row justify-around py-2">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {recipe.nutrition.calories}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">kcal</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {recipe.nutrition.protein_g}g
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.protein')}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {recipe.nutrition.carbs_g}g
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.carbs')}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {recipe.nutrition.fat_g}g
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.fat')}</Text>
                </View>
              </View>
            </Card>

            {/* Cost Card */}
            <Card variant="outlined" className="mb-4">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">{t('recipeGeneration.estimatedCost')}</Text>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {recipe.cost_currency} {recipe.estimated_cost.toFixed(2)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">{t('recipeGeneration.perServing')}</Text>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {recipe.cost_currency} {recipe.cost_per_serving.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Time Breakdown Card */}
            <Card variant="outlined" className="mb-4">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <FontAwesome name="clock-o" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.prep_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.prepTime')}</Text>
                </View>
                <View className="items-center">
                  <FontAwesome name="fire" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.cook_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.cookTime')}</Text>
                </View>
                <View className="items-center">
                  <FontAwesome name="hourglass-end" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.total_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.totalTime')}</Text>
                </View>
              </View>
            </Card>

            <Divider className="my-4" />

            {/* Ingredients */}
            <Section title={`🥗 ${t('recipeGeneration.ingredients')}`}>
              <Card variant="outlined" padding="none">
                {recipe.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    className={`flex-row py-3 px-4 ${
                      index < recipe.ingredients.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    <View className="w-24 mr-3">
                      <Text className="text-primary-600 dark:text-primary-400 font-medium text-right">
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 dark:text-gray-50">
                        {ingredient.name}
                        {ingredient.is_optional && (
                          <Text className="text-gray-400 text-sm"> ({t('recipeGeneration.optional')})</Text>
                        )}
                      </Text>
                      {ingredient.notes && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {ingredient.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            </Section>

            <Divider className="my-4" />

            {/* Steps - List style like profile */}
            <Section title={`👨‍🍳 ${t('recipeGeneration.preparation')}`}>
              <Card variant="outlined" padding="none">
                {recipe.steps.map((step, index) => (
                  <View
                    key={step.step_number}
                    className={`${
                      index < recipe.steps.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    <View className="flex-row p-4">
                      <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center mr-3 flex-shrink-0">
                        <Text className="text-white font-bold text-sm">{step.step_number}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-gray-50 leading-relaxed">
                          {step.instruction}
                        </Text>

                        {/* Time and Tip row */}
                        {(step.duration_minutes || step.tip) && (
                          <View className="flex-row items-center mt-2 gap-3">
                            {step.duration_minutes && (
                              <View className="flex-row items-center">
                                <FontAwesome name="clock-o" size={12} color={colors.textMuted} />
                                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  {step.duration_minutes} min
                                </Text>
                              </View>
                            )}
                            {step.tip && (
                              <Pressable
                                onPress={() => toggleStepTip(step.step_number)}
                                className="flex-row items-center"
                              >
                                <FontAwesome
                                  name={expandedTips[step.step_number] ? "chevron-down" : "chevron-right"}
                                  size={10}
                                  color="#EAB308"
                                />
                                <FontAwesome name="lightbulb-o" size={12} color="#EAB308" className="ml-1" />
                                <Text className="text-xs text-yellow-600 dark:text-yellow-400 ml-1 font-medium">
                                  {t('recipeGeneration.tipLabel')}
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Expanded tip */}
                    {step.tip && expandedTips[step.step_number] && (
                      <View className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 {step.tip}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            </Section>

            {/* Chef Tips */}
            {recipe.chef_tips && recipe.chef_tips.length > 0 && (
              <>
                <Divider className="my-4" />
                <Section title={`💡 ${t('recipeGeneration.chefTips')}`}>
                  <Card variant="default" className="bg-amber-50 dark:bg-amber-900/20">
                    {recipe.chef_tips.map((tip, index) => (
                      <View key={index} className="flex-row py-2">
                        <Text className="text-amber-600 dark:text-amber-400 mr-2">•</Text>
                        <Text className="flex-1 text-amber-800 dark:text-amber-200">{tip}</Text>
                      </View>
                    ))}
                  </Card>
                </Section>
              </>
            )}

            {/* Storage Instructions */}
            {recipe.storage_instructions && (
              <>
                <Divider className="my-4" />
                <Section title={`📦 ${t('recipeGeneration.storage')}`}>
                  <Card variant="outlined">
                    <Text className="text-gray-700 dark:text-gray-300">{recipe.storage_instructions}</Text>
                  </Card>
                </Section>
              </>
            )}

            {/* Variations */}
            {recipe.variations && recipe.variations.length > 0 && (
              <>
                <Divider className="my-4" />
                <Section title={`🔄 ${t('recipeGeneration.variations')}`}>
                  <Card variant="outlined">
                    {recipe.variations.map((variation, index) => (
                      <View key={index} className="flex-row py-2">
                        <Text className="text-primary-600 dark:text-primary-400 mr-2">•</Text>
                        <Text className="flex-1 text-gray-700 dark:text-gray-300">{variation}</Text>
                      </View>
                    ))}
                  </Card>
                </Section>
              </>
            )}

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-4">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="default" label={`#${tag}`} size="sm" />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* FAB Menu Overlay */}
        {showFabMenu && (
          <Pressable
            className="absolute inset-0 bg-black/30"
            onPress={() => setShowFabMenu(false)}
          />
        )}

        {/* FAB Menu Options */}
        {showFabMenu && (
          <View className="absolute bottom-24 right-4 items-end gap-3">
            {/* Save Option */}
            <Pressable
              onPress={handleSavePress}
              disabled={isSaving}
              className="flex-row items-center"
            >
              <View className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mr-2 shadow-md">
                <Text className="text-gray-900 dark:text-gray-50 font-medium">
                  {t('recipeGeneration.saveRecipe')}
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center shadow-lg">
                {isSaving ? (
                  <Loader size="sm" />
                ) : (
                  <FontAwesome name="bookmark" size={20} color="white" />
                )}
              </View>
            </Pressable>

            {/* Modify Option */}
            <Pressable
              onPress={handleModifyPress}
              disabled={isModifying}
              className="flex-row items-center"
            >
              <View className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mr-2 shadow-md">
                <Text className="text-gray-900 dark:text-gray-50 font-medium">
                  {t('recipeGeneration.modify')}
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center shadow-lg">
                {isModifying ? (
                  <Loader size="sm" />
                ) : (
                  <FontAwesome name="pencil" size={20} color="white" />
                )}
              </View>
            </Pressable>

            {/* Regenerate Option */}
            <Pressable
              onPress={handleRegeneratePress}
              disabled={isModifying || isSaving}
              className="flex-row items-center"
            >
              <View className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mr-2 shadow-md">
                <Text className="text-gray-900 dark:text-gray-50 font-medium">
                  {t('recipeGeneration.regenerate')}
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center shadow-lg">
                <FontAwesome name="refresh" size={20} color="white" />
              </View>
            </Pressable>
          </View>
        )}

        {/* Main FAB Button */}
        <Pressable
          onPress={() => setShowFabMenu(!showFabMenu)}
          disabled={isSaving || isModifying}
          className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg"
          style={{ elevation: 8 }}
        >
          {isSaving || isModifying ? (
            <Loader size="sm" />
          ) : (
            <FontAwesome
              name={showFabMenu ? "times" : "ellipsis-v"}
              size={24}
              color="white"
            />
          )}
        </Pressable>
      </FullScreenModal>

      {/* Modify Recipe BottomSheet */}
      <BottomSheet
        visible={showModifySheet}
        onClose={() => setShowModifySheet(false)}
        title={String(t('recipeGeneration.modify'))}
      >
        <View className="gap-4 pb-4">
          <Text className="text-gray-600 dark:text-gray-400">
            {t('recipeGeneration.modifyDescription')}
          </Text>
          <Input
            placeholder={String(t('recipeGeneration.modifyPlaceholder'))}
            value={modifyText}
            onChangeText={setModifyText}
            multiline
            numberOfLines={3}
          />
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={() => setShowModifySheet(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onPress={handleModifySubmit}
              loading={isModifying}
              disabled={!modifyText.trim()}
              className="flex-1"
            >
              {t('recipeGeneration.applyChanges')}
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
