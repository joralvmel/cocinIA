import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import type { Nutrition } from '@/types';

interface NutritionCardProps {
  nutrition: Nutrition;
}

export function NutritionCard({ nutrition }: NutritionCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="default" className="mb-4">
      <View className="flex-row justify-around py-2">
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {nutrition.calories}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">kcal</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {nutrition.protein_g}g
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.protein')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {nutrition.carbs_g}g
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.carbs')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {nutrition.fat_g}g
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.fat')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

