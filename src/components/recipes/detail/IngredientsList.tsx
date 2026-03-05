import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Section } from '@/components/ui';
import type { Ingredient } from '@/types';

interface IngredientsListProps {
  ingredients: Ingredient[];
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
  const { t } = useTranslation();

  return (
    <Section title={`🥗 ${t('recipeGeneration.ingredients')}`}>
      <Card variant="outlined" padding="none">
        {ingredients.map((ingredient, index) => (
          <View
            key={index}
            className={`flex-row py-3 px-4 ${
              index < ingredients.length - 1
                ? 'border-b border-gray-100 dark:border-gray-800'
                : ''
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
                  <Text className="text-gray-400 text-sm">
                    {' '}
                    ({t('recipeGeneration.optional')})
                  </Text>
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
  );
}

