import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge, ProgressBar, FullScreenModal, Divider } from '@/components/ui';
import {
  NutritionCard,
  IngredientsList,
  StepsList,
  ChefTips,
} from '@/components/recipes/detail';
import {
  type WeeklyPlanWithMeals,
  type WeeklyPlanMealWithRecipe,
  type DayOfWeek,
  DAYS_OF_WEEK,
  type Recipe,
} from '@/types';
import { recipeService } from '@/services';
import { getDayLabel, getMealTypeLabel, getMealTypeIcon, formatDateRange, getCurrentDayOfWeek } from '@/utils';

interface ActivePlanViewProps {
  plan: WeeklyPlanWithMeals;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onCompletePlan?: () => void;
  onDeletePlan?: () => void;
  onViewHistory?: () => void;
  progress: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function ActivePlanView({
  plan,
  selectedDay,
  onSelectDay,
  progress,
  isRefreshing,
  onRefresh,
}: ActivePlanViewProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const currentDay = getCurrentDayOfWeek();

  // Recipe detail modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [loadingPrepRecipe, setLoadingPrepRecipe] = useState<string | null>(null);
  const [prepsVisible, setPrepsVisible] = useState(false);

  // Group meals by day
  const mealsByDay: Record<DayOfWeek, WeeklyPlanMealWithRecipe[]> = {} as any;
  for (const day of DAYS_OF_WEEK) {
    mealsByDay[day] = plan.meals
      .filter((m) => m.day_of_week === day)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const selectedDayMeals = mealsByDay[selectedDay] || [];
  const dayCalories = selectedDayMeals.reduce(
    (sum, m) => sum + (m.estimated_calories || m.recipe?.nutrition?.calories || 0),
    0
  );

  // Open recipe detail in a modal instead of navigating away
  const handleMealPress = (meal: WeeklyPlanMealWithRecipe) => {
    if (meal.recipe && !meal.is_external) {
      setSelectedRecipe(meal.recipe);
      setShowRecipeModal(true);
    }
  };

  // Fetch and open a base preparation recipe by ID
  const handleBasePrepPress = async (recipeId: string) => {
    setLoadingPrepRecipe(recipeId);
    try {
      const recipe = await recipeService.getRecipeById(recipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        setShowRecipeModal(true);
      }
    } catch (err) {
      console.error('Error fetching base prep recipe:', err);
    } finally {
      setLoadingPrepRecipe(null);
    }
  };

  return (
    <>
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 pt-4 pb-8">
        {/* Plan header */}
        <Card variant="elevated" className="mb-4">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {plan.name}
                  </Text>
                  <Badge variant="success" size="sm" label={t('weeklyPlan.active.planActive')} />
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDateRange(plan.start_date, plan.end_date)}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View className="mt-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('weeklyPlan.active.progressLabel', {
                    current: Math.max(1, Math.ceil(progress * plan.days_included.length)),
                    total: plan.days_included.length,
                  })}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <ProgressBar progress={progress * 100} />
            </View>
          </View>
        </Card>

        {/* Day tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerClassName="gap-2"
        >
          {plan.days_included
            .sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b))
            .map((day) => {
              const isSelected = day === selectedDay;
              const isToday = day === currentDay;
              const hasMeals = (mealsByDay[day]?.length || 0) > 0;

              return (
                <Pressable
                  key={day}
                  onPress={() => onSelectDay(day)}
                  className={`px-4 py-3 rounded-xl border min-w-[70px] items-center ${
                    isSelected
                      ? 'bg-primary-600 dark:bg-primary-500 border-primary-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {t(`weeklyPlan.daysShort.${day}` as any)}
                  </Text>
                  <Text
                    className={`font-bold text-base ${
                      isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-50'
                    }`}
                  >
                    {t(`weeklyPlan.daysInitial.${day}` as any)}
                  </Text>
                  {isToday && !isSelected && (
                    <View className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-1" />
                  )}
                  {!hasMeals && (
                    <Text className="text-xs text-gray-400 mt-0.5">—</Text>
                  )}
                </Pressable>
              );
            })}
        </ScrollView>

        {/* Selected day header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {getDayLabel(selectedDay, t)}
            </Text>
            {selectedDay === currentDay && (
              <Badge variant="primary" size="sm" label={t('weeklyPlan.active.today')} />
            )}
          </View>
          {dayCalories > 0 && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {dayCalories} cal
            </Text>
          )}
        </View>

        {/* Meals for selected day */}
        {selectedDayMeals.length > 0 ? (
          <View className="gap-3">
            {selectedDayMeals.map((meal) => (
              <ActiveMealCard
                key={meal.id}
                meal={meal}
                onPress={() => handleMealPress(meal)}
              />
            ))}
          </View>
        ) : (
          <View className="py-8 items-center">
            <FontAwesome name="calendar-o" size={32} color={colors.textMuted} />
            <Text className="text-gray-400 dark:text-gray-500 mt-3 text-center">
              {t('weeklyPlan.active.noPlanForToday')}
            </Text>
          </View>
        )}

        {/* Batch cooking base preparations — collapsible, hidden by default */}
        {plan.is_batch_cooking && (plan.batch_config as any)?.saved_base_preparations?.length > 0 && (
          <Card variant="outlined" className="mt-4">
            <Pressable onPress={() => setPrepsVisible((v) => !v)}>
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-2">
                  <FontAwesome name="tasks" size={16} color={colors.primary} />
                  <Text className="font-bold text-gray-900 dark:text-gray-50">
                    {t('weeklyPlan.result.basePreparations')}
                  </Text>
                  <Badge
                    variant="warning"
                    size="sm"
                    label={String((plan.batch_config as any).saved_base_preparations.length)}
                  />
                </View>
                <FontAwesome
                  name={prepsVisible ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
            {prepsVisible && (
              <View className="px-4 pb-4 gap-2">
                {((plan.batch_config as any).saved_base_preparations as Array<{ name: string; type: string; recipe_id: string; description: string }>).map((bp, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleBasePrepPress(bp.recipe_id)}
                    disabled={loadingPrepRecipe === bp.recipe_id}
                    className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3"
                  >
                    <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 items-center justify-center mr-3">
                      {loadingPrepRecipe === bp.recipe_id ? (
                        <ActivityIndicator size="small" color="#F59E0B" />
                      ) : (
                        <FontAwesome name="fire" size={14} color="#F59E0B" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                        {bp.name}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {bp.description}
                      </Text>
                    </View>
                    <Badge variant="info" size="sm" label={bp.type} />
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Spacer for FAB */}
        <View className="h-24" />
      </View>
    </ScrollView>

    {/* Recipe Detail Modal — shows recipe without navigating away */}
    <FullScreenModal
      visible={showRecipeModal}
      onClose={() => { setShowRecipeModal(false); setSelectedRecipe(null); }}
      title={selectedRecipe?.title || ''}
      useChevron
    >
      {selectedRecipe && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-4 pb-24">
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedRecipe.description}
            </Text>

            {selectedRecipe.nutrition && (
              <NutritionCard nutrition={selectedRecipe.nutrition} />
            )}

            <Divider className="my-4" />

            {selectedRecipe.ingredients && (
              <IngredientsList ingredients={selectedRecipe.ingredients} />
            )}

            <Divider className="my-4" />

            {selectedRecipe.steps && (
              <StepsList
                steps={selectedRecipe.steps}
                expandedTips={{}}
                onToggleTip={() => {}}
              />
            )}

            {selectedRecipe.chef_tips && selectedRecipe.chef_tips.length > 0 && (
              <ChefTips tips={selectedRecipe.chef_tips} />
            )}
          </View>
        </ScrollView>
      )}
    </FullScreenModal>
    </>
  );
}

// Individual meal card for the active plan view
function ActiveMealCard({
  meal,
  onPress,
}: {
  meal: WeeklyPlanMealWithRecipe;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const icon = getMealTypeIcon(meal.meal_type);
  const label = getMealTypeLabel(meal.meal_type, t);
  const calories = meal.estimated_calories || meal.recipe?.nutrition?.calories || 0;

  if (meal.is_external) {
    return (
      <Card variant="outlined" className="opacity-60">
        <View className="p-4 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 items-center justify-center mr-3">
            <FontAwesome name="cutlery" size={20} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
              {label}
            </Text>
            <Text className="font-medium text-amber-700 dark:text-amber-400 mt-0.5">
              {t('weeklyPlan.result.eatingOutLabel')}
            </Text>
            {meal.external_description && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {meal.external_description}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Card variant="outlined">
        <View className="p-4 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 items-center justify-center mr-3">
            <FontAwesome name={icon as any} size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
              {label}
            </Text>
            <Text
              className="font-semibold text-gray-900 dark:text-gray-50 mt-0.5"
              numberOfLines={2}
            >
              {meal.recipe?.title || t('weeklyPlan.result.noRecipe')}
            </Text>
            <View className="flex-row items-center gap-3 mt-1">
              {calories > 0 && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {calories} cal
                </Text>
              )}
              {meal.recipe?.total_time_minutes ? (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  ⏱ {meal.recipe.total_time_minutes} min
                </Text>
              ) : null}
            </View>
          </View>
          <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}






