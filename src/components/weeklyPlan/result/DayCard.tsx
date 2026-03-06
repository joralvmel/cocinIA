import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card, Badge } from '@/components/ui';
import { type AIPlanMeal, type DayOfWeek, type PlanMealType } from '@/types';
import { getMealTypeLabel, getMealTypeIcon, getDayLabel } from '@/utils';

interface DayCardProps {
  day: DayOfWeek;
  meals: AIPlanMeal[];
  isPrepDay?: boolean;
  onMealPress?: (day: DayOfWeek, mealType: PlanMealType) => void;
  onMealLongPress?: (day: DayOfWeek, mealType: PlanMealType) => void;
  isToday?: boolean;
  regeneratingMeal?: { day: DayOfWeek; mealType: PlanMealType } | null;
  modifyingMeal?: { day: DayOfWeek; mealType: PlanMealType } | null;
}

export function DayCard({
  day,
  meals,
  isPrepDay = false,
  onMealPress,
  onMealLongPress,
  isToday = false,
  regeneratingMeal,
  modifyingMeal,
}: DayCardProps) {
  const { t } = useTranslation();

  const dayCalories = meals.reduce(
    (sum, m) => sum + (m.estimated_calories || m.recipe?.nutrition?.calories || 0),
    0
  );

  return (
    <Card
      variant="outlined"
      className={`mb-3 ${isToday ? 'border-primary-500 dark:border-primary-400 border-2' : ''}`}
    >
      <View className="p-4">
        {/* Day header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            {isToday && (
              <View className="bg-primary-600 dark:bg-primary-500 px-2 py-0.5 rounded">
                <Text className="text-xs font-bold text-white">
                  {t('weeklyPlan.active.today')}
                </Text>
              </View>
            )}
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {getDayLabel(day, t)}
            </Text>
            {isPrepDay && (
              <Badge variant="warning" size="sm" label={t('weeklyPlan.result.prepDay')} />
            )}
          </View>
          {dayCalories > 0 && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t('weeklyPlan.result.dailyCalories', { calories: dayCalories })}
            </Text>
          )}
        </View>

        {/* Meals */}
        <View className="gap-2">
          {meals.map((meal, index) => (
            <MealSlot
              key={`${meal.day_of_week}-${meal.meal_type}-${index}`}
              meal={meal}
              onPress={() => onMealPress?.(day, meal.meal_type)}
              onLongPress={() => onMealLongPress?.(day, meal.meal_type)}
              isRegenerating={
                (regeneratingMeal?.day === day && regeneratingMeal?.mealType === meal.meal_type) ||
                (modifyingMeal?.day === day && modifyingMeal?.mealType === meal.meal_type)
              }
            />
          ))}
        </View>
      </View>
    </Card>
  );
}

interface MealSlotProps {
  meal: AIPlanMeal;
  onPress?: () => void;
  onLongPress?: () => void;
  isRegenerating?: boolean;
}

function MealSlot({ meal, onPress, onLongPress, isRegenerating }: MealSlotProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const icon = getMealTypeIcon(meal.meal_type);
  const label = getMealTypeLabel(meal.meal_type, t);
  const isExternal = !!meal.is_external;
  const hasRecipe = !!meal.recipe?.title && !isExternal;
  const calories = meal.estimated_calories || meal.recipe?.nutrition?.calories || 0;

  return (
    <Pressable
      onPress={isRegenerating ? undefined : onPress}
      onLongPress={isRegenerating ? undefined : onLongPress}
      className={`flex-row items-center rounded-xl p-3 ${
        isRegenerating
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : isExternal
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            : 'bg-gray-50 dark:bg-gray-800/50'
      }`}
    >
      {/* Meal type icon */}
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
        isRegenerating
          ? 'bg-blue-100 dark:bg-blue-900/40'
          : isExternal
            ? 'bg-amber-100 dark:bg-amber-900/40'
            : 'bg-primary-100 dark:bg-primary-900/40'
      }`}>
        {isRegenerating ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <FontAwesome
            name={isExternal ? 'cutlery' : (icon as any)}
            size={18}
            color={isExternal ? '#d97706' : colors.primary}
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
          {label}
        </Text>
        {isRegenerating ? (
          <Text className="font-medium text-blue-600 dark:text-blue-400 mt-0.5 italic">
            {t('weeklyPlan.result.regenerating')}
          </Text>
        ) : isExternal ? (
          <Text className="font-medium text-amber-700 dark:text-amber-400 mt-0.5">
            🍽️ {t('weeklyPlan.result.eatingOut')}
          </Text>
        ) : hasRecipe ? (
          <Text
            className="font-semibold text-gray-900 dark:text-gray-50 mt-0.5"
            numberOfLines={2}
          >
            {meal.recipe.title}
          </Text>
        ) : (
          <Text className="text-gray-400 dark:text-gray-500 italic mt-0.5">
            {t('weeklyPlan.result.noRecipe')}
          </Text>
        )}

        {/* Meta info */}
        {hasRecipe && (
          <View className="flex-row items-center gap-3 mt-1">
            {calories > 0 && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {calories} cal
              </Text>
            )}
            {meal.recipe.total_time_minutes > 0 && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                ⏱ {meal.recipe.total_time_minutes} min
              </Text>
            )}
            {meal.recipe.difficulty && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {meal.recipe.difficulty}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Chevron or external icon */}
      {hasRecipe && (
        <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
      )}
    </Pressable>
  );
}



