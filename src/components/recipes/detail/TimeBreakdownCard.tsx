import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';

interface TimeBreakdownCardProps {
  prepTime: number;
  cookTime: number;
  totalTime: number;
}

export function TimeBreakdownCard({ prepTime, cookTime, totalTime }: TimeBreakdownCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-around">
        <View className="items-center">
          <FontAwesome name="clock-o" size={20} color={colors.primary} />
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
            {prepTime} min
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.prepTime')}
          </Text>
        </View>
        <View className="items-center">
          <FontAwesome name="fire" size={20} color={colors.primary} />
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
            {cookTime} min
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.cookTime')}
          </Text>
        </View>
        <View className="items-center">
          <FontAwesome name="hourglass-end" size={20} color={colors.primary} />
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
            {totalTime} min
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.totalTime')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

