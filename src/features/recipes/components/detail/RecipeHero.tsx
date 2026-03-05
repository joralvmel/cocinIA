import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { getDifficultyColor, getDifficultyLabel } from '@/utils/recipeHelpers';
import type { Recipe } from '@/types';

interface RecipeHeroProps {
  recipe: Recipe;
}

export function RecipeHero({ recipe }: RecipeHeroProps) {
  const { t } = useTranslation();

  return (
    <>
      {recipe.image_url && (
        <Image
          source={{ uri: recipe.image_url }}
          className="w-full h-56"
          resizeMode="cover"
        />
      )}
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          {recipe.title}
        </Text>
        <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {recipe.description}
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {recipe.difficulty && (
            <Badge
              variant={getDifficultyColor(recipe.difficulty) as any}
              label={getDifficultyLabel(recipe.difficulty, t as any)}
            />
          )}
          <Badge variant="info" label={`⏱️ ${recipe.total_time_minutes} min`} />
          <Badge
            variant="default"
            label={`👥 ${recipe.servings} ${t('recipeGeneration.servingsLabel')}`}
          />
          {recipe.cuisine && <Badge variant="default" label={recipe.cuisine} />}
        </View>
      </View>
    </>
  );
}

