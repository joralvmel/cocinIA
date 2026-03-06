import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  FullScreenModal,
  Loader,
  MultiActionButton,
  BottomSheet,
  Divider,
  ProgressBar,
} from '@/components/ui';
import { useWeeklyPlanStore } from '@/stores';
import { type DayOfWeek, type PlanMealType, type AIPlanMeal, type Recipe, DAYS_OF_WEEK } from '@/types';
import { DayCard } from './DayCard';
import { BatchPreparationsCard } from './BatchPreparationsCard';
import { RecipePickerSheet } from './RecipePickerSheet';
import { ModifyRecipeSheet } from '@/components/recipes/generation/ModifyRecipeSheet';

// Import recipe detail components for preview
import {
  NutritionCard,
  IngredientsList,
  StepsList,
  ChefTips,
} from '@/components/recipes/detail';

interface PlanResultModalProps {
  visible: boolean;
  onClose: () => void;
  isGenerating?: boolean;
  generationProgress?: string;
  onRegeneratePlan: () => void;
  onRegenerateMeal: (day: DayOfWeek, mealType: PlanMealType) => void;
  onSavePlan: () => void;
  onDiscard: () => void;
  onMarkEatingOut: (day: DayOfWeek, mealType: PlanMealType) => void;
  onSwapMeal?: (day: DayOfWeek, mealType: PlanMealType, recipe: Recipe) => void;
  isSaving: boolean;
  regeneratingMeal?: { day: DayOfWeek; mealType: PlanMealType } | null;
  modifyingMeal?: { day: DayOfWeek; mealType: PlanMealType } | null;
  onModifyMeal?: (day: DayOfWeek, mealType: PlanMealType, modification: string) => void;
}

export function PlanResultModal({
  visible,
  onClose,
  isGenerating,
  generationProgress,
  onRegeneratePlan,
  onRegenerateMeal,
  onSavePlan,
  onDiscard,
  onMarkEatingOut,
  onSwapMeal,
  isSaving,
  regeneratingMeal,
  modifyingMeal,
  onModifyMeal,
}: PlanResultModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { generatedPlan } = useWeeklyPlanStore();

  // State for recipe preview
  const [previewMeal, setPreviewMeal] = useState<AIPlanMeal | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Keep preview in sync with plan changes (after modify/regenerate)
  useEffect(() => {
    if (previewMeal && generatedPlan && showPreview) {
      const updatedMeal = generatedPlan.meals.find(
        (m) => m.day_of_week === previewMeal.day_of_week && m.meal_type === previewMeal.meal_type
      );
      if (updatedMeal && updatedMeal !== previewMeal) {
        setPreviewMeal(updatedMeal);
      }
    }
  }, [generatedPlan]);

  // State for meal actions
  const [actionMeal, setActionMeal] = useState<{
    day: DayOfWeek;
    mealType: PlanMealType;
    isExternal?: boolean;
  } | null>(null);
  const [showActions, setShowActions] = useState(false);

  // State for recipe picker (swap from cookbook)
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    day: DayOfWeek;
    mealType: PlanMealType;
  } | null>(null);

  // State for modify recipe sheet
  const [showModifySheet, setShowModifySheet] = useState(false);
  const [modifyText, setModifyText] = useState('');
  const [modifyTarget, setModifyTarget] = useState<{
    day: DayOfWeek;
    mealType: PlanMealType;
  } | null>(null);

  // Don't render if not visible
  if (!visible) return null;

  // Parse generation progress
  let progressInfo: { day: string; pct: number; completed: number; total: number } | null = null;
  if (generationProgress) {
    try { progressInfo = JSON.parse(generationProgress); } catch {}
  }

  // Show loading state while generating
  if (isGenerating || !generatedPlan) {
    return (
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={t('weeklyPlan.wizard.generatingPlan')}
        useChevron
      >
        <View className="flex-1 items-center justify-center px-8">
          <Loader size="lg" />
          <Text className="mt-6 text-lg font-bold text-gray-900 dark:text-gray-50 text-center">
            {t('weeklyPlan.wizard.generatingPlan')}
          </Text>
          {progressInfo ? (
            <View className="w-full mt-6">
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                {t('weeklyPlan.wizard.generatingDay', { day: progressInfo.day })}
              </Text>
              <ProgressBar progress={progressInfo.pct} showLabel labelPosition="top" />
              <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                {progressInfo.completed} / {progressInfo.total} {t('weeklyPlan.wizard.steps.days').toLowerCase()}
              </Text>
            </View>
          ) : (
            <Text className="mt-2 text-sm text-gray-400 dark:text-gray-500 text-center">
              {t('weeklyPlan.result.preparingPlan')}
            </Text>
          )}
        </View>
      </FullScreenModal>
    );
  }

  // Group meals by day
  const mealsByDay: Record<DayOfWeek, AIPlanMeal[]> = {} as any;
  for (const day of DAYS_OF_WEEK) {
    mealsByDay[day] = generatedPlan.meals
      .filter((m) => m.day_of_week === day)
      .sort((a, b) => {
        const order = { breakfast: 0, lunch: 1, snack: 2, dinner: 3 };
        return (order[a.meal_type] || 99) - (order[b.meal_type] || 99);
      });
  }

  const activeDays = DAYS_OF_WEEK.filter((d) => mealsByDay[d].length > 0);

  // FAB actions
  const fabOptions = [
    {
      id: 'save',
      label: t('weeklyPlan.result.savePlan'),
      icon: 'check' as const,
      color: '#22C55E',
      onPress: onSavePlan,
    },
    {
      id: 'regenerate',
      label: t('weeklyPlan.result.regeneratePlan'),
      icon: 'refresh' as const,
      color: '#3B82F6',
      onPress: onRegeneratePlan,
    },
    {
      id: 'shopping',
      label: t('weeklyPlan.result.addToShoppingList'),
      icon: 'shopping-cart' as const,
      color: '#F59E0B',
      onPress: () => {
        // Placeholder
        Alert.alert(t('weeklyPlan.result.addToShoppingListPlaceholder'));
      },
    },
    {
      id: 'discard',
      label: t('weeklyPlan.result.discardPlan'),
      icon: 'trash' as const,
      color: '#EF4444',
      onPress: onDiscard,
    },
  ];

  // Handle meal tap -> show preview
  const handleMealPress = (day: DayOfWeek, mealType: PlanMealType) => {
    const meal = generatedPlan.meals.find(
      (m) => m.day_of_week === day && m.meal_type === mealType
    );
    if (meal?.recipe?.title) {
      setPreviewMeal(meal);
      setShowPreview(true);
    }
  };

  // Handle meal long press -> show actions
  const handleMealLongPress = (day: DayOfWeek, mealType: PlanMealType) => {
    const meal = generatedPlan.meals.find(
      (m) => m.day_of_week === day && m.meal_type === mealType
    );
    setActionMeal({ day, mealType, isExternal: !!meal?.is_external });
    setShowActions(true);
  };

  // Handle swap from cookbook
  const handleSwapFromCookbook = (day: DayOfWeek, mealType: PlanMealType) => {
    setPickerTarget({ day, mealType });
    setShowActions(false);
    setShowRecipePicker(true);
  };

  const handleRecipeSelected = (recipe: Recipe) => {
    if (pickerTarget && onSwapMeal) {
      onSwapMeal(pickerTarget.day, pickerTarget.mealType, recipe);
    }
    setPickerTarget(null);
  };

  return (
    <>
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={generatedPlan.plan_name || t('weeklyPlan.result.title')}
        useChevron
      >
        {/* Saving overlay */}
        {isSaving && (
          <View className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 items-center justify-center">
            <Loader size="lg" />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium">
              {t('weeklyPlan.result.saving')}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-4 pb-24">
            {/* Summary header */}
            <View className="flex-row items-center justify-between mb-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  {generatedPlan.plan_name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activeDays.length} {t('weeklyPlan.wizard.steps.days').toLowerCase()} •{' '}
                  {generatedPlan.meals.filter(m => !m.is_external).length} {t('weeklyPlan.wizard.totalMeals', { count: generatedPlan.meals.filter(m => !m.is_external).length }).toLowerCase()}
                </Text>
              </View>
              {generatedPlan.total_estimated_calories
                ? (
                  <View className="items-end">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Total</Text>
                    <Text className="font-bold text-primary-600 dark:text-primary-400">
                      {generatedPlan.total_estimated_calories} cal
                    </Text>
                  </View>
                )
                : null
              }
            </View>

            {/* Long-press hint */}
            <View className="flex-row items-center gap-2 mb-4 px-2">
              <FontAwesome name="hand-pointer-o" size={14} color={colors.textMuted} />
              <Text className="text-xs text-gray-400 dark:text-gray-500 italic flex-1">
                {t('weeklyPlan.result.longPressHint')}
              </Text>
            </View>

            {/* Batch preparations */}
            {generatedPlan.base_preparations.length > 0 && (
              <BatchPreparationsCard preparations={generatedPlan.base_preparations} />
            )}

            {/* Day cards */}
            {activeDays.map((day) => (
              <DayCard
                key={day}
                day={day}
                meals={mealsByDay[day]}
                onMealPress={handleMealPress}
                onMealLongPress={handleMealLongPress}
                regeneratingMeal={regeneratingMeal}
                modifyingMeal={modifyingMeal}
              />
            ))}

            {/* Tips */}
            {generatedPlan.tips.length > 0 && (
              <ChefTips tips={generatedPlan.tips} />
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="primary-600"
            loading={isSaving}
            disabled={isSaving}
            options={fabOptions}
          />
        </View>
      </FullScreenModal>

      {/* Recipe Preview — Full screen modal for better display */}
      <FullScreenModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        title={previewMeal?.recipe?.title || ''}
        useChevron
      >
        {previewMeal?.recipe && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-4 pt-4 pb-24">
              <Text className="text-gray-600 dark:text-gray-400 mb-4">
                {previewMeal.recipe.description}
              </Text>

              <NutritionCard nutrition={previewMeal.recipe.nutrition} />

              <Divider className="my-4" />

              <IngredientsList ingredients={previewMeal.recipe.ingredients} />

              <Divider className="my-4" />

              <StepsList
                steps={previewMeal.recipe.steps}
                expandedTips={{}}
                onToggleTip={() => {}}
              />

              {previewMeal.recipe.chef_tips && previewMeal.recipe.chef_tips.length > 0 && (
                <ChefTips tips={previewMeal.recipe.chef_tips} />
              )}
            </View>
          </ScrollView>
        )}

        {/* Modifying overlay */}
        {modifyingMeal && previewMeal &&
          modifyingMeal.day === previewMeal.day_of_week &&
          modifyingMeal.mealType === previewMeal.meal_type && (
          <View className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 items-center justify-center">
            <Loader size="lg" />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium">
              {t('recipeGeneration.modifyingMessage')}
            </Text>
          </View>
        )}

        {/* FAB for actions on the previewed meal */}
        {previewMeal && !previewMeal.is_external && (
          <View className="absolute bottom-6 right-6">
            <MultiActionButton
              icon="ellipsis-v"
              variant="floating"
              floatingColor="primary-600"
              loading={!!modifyingMeal}
              disabled={!!modifyingMeal}
              options={[
                {
                  id: 'modify',
                  label: t('recipeGeneration.modify'),
                  icon: 'pencil',
                  color: '#F59E0B',
                  onPress: () => {
                    if (previewMeal) {
                      setModifyTarget({
                        day: previewMeal.day_of_week,
                        mealType: previewMeal.meal_type,
                      });
                      setShowModifySheet(true);
                    }
                  },
                },
                {
                  id: 'regenerate',
                  label: t('weeklyPlan.result.regenerateMeal'),
                  icon: 'refresh',
                  color: '#3B82F6',
                  onPress: () => {
                    const day = previewMeal.day_of_week;
                    const mealType = previewMeal.meal_type;
                    setShowPreview(false);
                    onRegenerateMeal(day, mealType);
                  },
                },
                {
                  id: 'swap',
                  label: t('weeklyPlan.result.swapFromCookbook'),
                  icon: 'exchange',
                  color: '#8B5CF6',
                  onPress: () => {
                    const day = previewMeal.day_of_week;
                    const mealType = previewMeal.meal_type;
                    setShowPreview(false);
                    handleSwapFromCookbook(day, mealType);
                  },
                },
                {
                  id: 'eating-out',
                  label: previewMeal.is_external
                    ? t('weeklyPlan.result.restoreMeal')
                    : t('weeklyPlan.result.markEatingOut'),
                  icon: 'cutlery',
                  color: '#22C55E',
                  onPress: () => {
                    const day = previewMeal.day_of_week;
                    const mealType = previewMeal.meal_type;
                    setShowPreview(false);
                    onMarkEatingOut(day, mealType);
                  },
                },
              ]}
            />
          </View>
        )}
      </FullScreenModal>

      {/* Meal Actions Sheet */}
      <BottomSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        title={
          actionMeal
            ? `${t(`weeklyPlan.days.${actionMeal.day}` as any)} - ${t(`weeklyPlan.mealTypes.${actionMeal.mealType}` as any)}`
            : ''
        }
      >
        <View className="px-4 pb-6 gap-3">
          {/* Only show regenerate/swap/modify if not eating out */}
          {!actionMeal?.isExternal && (
            <>
              <MealActionButton
                icon="pencil"
                label={t('recipeGeneration.modify')}
                onPress={() => {
                  if (actionMeal) {
                    setModifyTarget({ day: actionMeal.day, mealType: actionMeal.mealType });
                    setShowActions(false);
                    setShowModifySheet(true);
                  }
                }}
              />
              <MealActionButton
                icon="refresh"
                label={t('weeklyPlan.result.regenerateMeal')}
                onPress={() => {
                  if (actionMeal) {
                    onRegenerateMeal(actionMeal.day, actionMeal.mealType);
                  }
                  setShowActions(false);
                }}
              />
              <MealActionButton
                icon="exchange"
                label={t('weeklyPlan.result.swapFromCookbook')}
                onPress={() => {
                  if (actionMeal) {
                    handleSwapFromCookbook(actionMeal.day, actionMeal.mealType);
                  }
                }}
              />
            </>
          )}
          <MealActionButton
            icon="cutlery"
            label={actionMeal?.isExternal
              ? t('weeklyPlan.result.restoreMeal')
              : t('weeklyPlan.result.markEatingOut')
            }
            onPress={() => {
              if (actionMeal) {
                onMarkEatingOut(actionMeal.day, actionMeal.mealType);
              }
              setShowActions(false);
            }}
          />
        </View>
      </BottomSheet>

      {/* Recipe Picker for swapping from cookbook */}
      <RecipePickerSheet
        visible={showRecipePicker}
        onClose={() => { setShowRecipePicker(false); setPickerTarget(null); }}
        onSelect={handleRecipeSelected}
        title={
          pickerTarget
            ? `${t('weeklyPlan.result.swapFromCookbook')} — ${t(`weeklyPlan.mealTypes.${pickerTarget.mealType}` as any)}`
            : undefined
        }
      />

      {/* Modify Recipe Sheet */}
      <ModifyRecipeSheet
        visible={showModifySheet}
        onClose={() => { setShowModifySheet(false); setModifyText(''); }}
        modifyText={modifyText}
        onModifyTextChange={setModifyText}
        onSubmit={() => {
          if (modifyTarget && modifyText.trim() && onModifyMeal) {
            onModifyMeal(modifyTarget.day, modifyTarget.mealType, modifyText.trim());
            setShowModifySheet(false);
            setModifyText('');
          }
        }}
        isModifying={!!modifyingMeal}
      />
    </>
  );
}

// Simple action button for the bottom sheet
function MealActionButton({
  icon,
  label,
  onPress,
  variant = 'default',
}: {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-700 mr-3">
        <FontAwesome
          name={icon as any}
          size={18}
          color={variant === 'danger' ? '#EF4444' : colors.primary}
        />
      </View>
      <Text
        className={`font-medium ${
          variant === 'danger'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-50'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}





