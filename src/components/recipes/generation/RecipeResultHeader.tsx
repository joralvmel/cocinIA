import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { getDifficultyColor, getDifficultyLabel } from '@/utils/recipeHelpers';
import type { AIRecipeResponse } from '@/types';

interface RecipeResultHeaderProps {
  recipe: AIRecipeResponse;
}

export function RecipeResultHeader({ recipe }: RecipeResultHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Description */}
      <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {recipe.description}
      </Text>

      {/* Quick Info Badges */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Badge
          variant={getDifficultyColor(recipe.difficulty) as any}
          label={getDifficultyLabel(recipe.difficulty, t as any)}
        />
        <Badge variant="info" label={`⏱️ ${recipe.total_time_minutes} min`} />
        <Badge
          variant="default"
          label={`👥 ${recipe.servings} ${t('recipeGeneration.servingsLabel')}`}
        />
        <Badge variant="default" label={recipe.cuisine} />
      </View>
    </>
  );
}

