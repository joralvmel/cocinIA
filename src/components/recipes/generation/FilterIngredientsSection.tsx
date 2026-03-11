import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Checkbox, Section, TagInput } from '@/components/ui';

interface ProfileFavoriteIngredient {
  ingredient_name: string;
  is_always_available: boolean;
}

interface FilterIngredientsSectionProps {
  ingredientsToUseItems: string[];
  ingredientsToUseText: string;
  onIngredientsToUseTextChange: (text: string) => void;
  onAddIngredientToUse: () => void;
  onRemoveIngredientToUse: (item: string) => void;
  ingredientsToExcludeItems: string[];
  ingredientsToExcludeText: string;
  onIngredientsToExcludeTextChange: (text: string) => void;
  onAddIngredientToExclude: () => void;
  onRemoveIngredientToExclude: (item: string) => void;
  useFavoriteIngredients: boolean;
  onUseFavoriteIngredientsChange: (checked: boolean) => void;
  favoriteIngredients: ProfileFavoriteIngredient[];
}

export function FilterIngredientsSection({
  ingredientsToUseItems,
  ingredientsToUseText,
  onIngredientsToUseTextChange,
  onAddIngredientToUse,
  onRemoveIngredientToUse,
  ingredientsToExcludeItems,
  ingredientsToExcludeText,
  onIngredientsToExcludeTextChange,
  onAddIngredientToExclude,
  onRemoveIngredientToExclude,
  useFavoriteIngredients,
  onUseFavoriteIngredientsChange,
  favoriteIngredients,
}: FilterIngredientsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Ingredients to Use */}
      <Section title={String(t('recipeGeneration.ingredientsToUse'))}>
        <TagInput
          items={ingredientsToUseItems}
          inputText={ingredientsToUseText}
          onChangeText={onIngredientsToUseTextChange}
          onAdd={onAddIngredientToUse}
          onRemove={onRemoveIngredientToUse}
          placeholder={String(t('recipeGeneration.ingredientsPlaceholder'))}
          chipSize="sm"
        />
      </Section>

      {/* Ingredients to Exclude */}
      <Section title={String(t('recipeGeneration.ingredientsToExclude'))}>
        <TagInput
          items={ingredientsToExcludeItems}
          inputText={ingredientsToExcludeText}
          onChangeText={onIngredientsToExcludeTextChange}
          onAdd={onAddIngredientToExclude}
          onRemove={onRemoveIngredientToExclude}
          placeholder={String(t('recipeGeneration.excludePlaceholder'))}
          chipSize="sm"
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

