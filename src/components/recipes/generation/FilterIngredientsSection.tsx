import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input, Checkbox, Section } from '@/components/ui';

interface ProfileFavoriteIngredient {
  ingredient_name: string;
  is_always_available: boolean;
}

interface FilterIngredientsSectionProps {
  ingredientsToUseText: string;
  onIngredientsToUseChange: (text: string) => void;
  ingredientsToExcludeText: string;
  onIngredientsToExcludeChange: (text: string) => void;
  useFavoriteIngredients: boolean;
  onUseFavoriteIngredientsChange: (checked: boolean) => void;
  favoriteIngredients: ProfileFavoriteIngredient[];
}

export function FilterIngredientsSection({
  ingredientsToUseText,
  onIngredientsToUseChange,
  ingredientsToExcludeText,
  onIngredientsToExcludeChange,
  useFavoriteIngredients,
  onUseFavoriteIngredientsChange,
  favoriteIngredients,
}: FilterIngredientsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Ingredients to Use */}
      <Section title={String(t('recipeGeneration.ingredientsToUse'))}>
        <Input
          placeholder={String(t('recipeGeneration.ingredientsPlaceholder'))}
          value={ingredientsToUseText}
          onChangeText={onIngredientsToUseChange}
          multiline
          numberOfLines={2}
        />
      </Section>

      {/* Ingredients to Exclude */}
      <Section title={String(t('recipeGeneration.ingredientsToExclude'))}>
        <Input
          placeholder={String(t('recipeGeneration.excludePlaceholder'))}
          value={ingredientsToExcludeText}
          onChangeText={onIngredientsToExcludeChange}
          multiline
          numberOfLines={2}
        />
      </Section>

      {/* Use Favorite Ingredients */}
      {favoriteIngredients.length > 0 && (
        <View>
          <Checkbox
            checked={useFavoriteIngredients}
            onChange={onUseFavoriteIngredientsChange}
            label={String(t('recipeGeneration.useFavoriteIngredients' as any))}
            strikethrough={false}
          />
          {useFavoriteIngredients && (
            <View className="mt-2 ml-7 flex-row flex-wrap" style={{ gap: 6 }}>
              {favoriteIngredients.map((ing) => (
                <View
                  key={ing.ingredient_name}
                  className="bg-primary-100 dark:bg-primary-900 px-2.5 py-1 rounded-full"
                >
                  <Text className="text-xs text-primary-700 dark:text-primary-300">
                    {ing.ingredient_name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );
}

