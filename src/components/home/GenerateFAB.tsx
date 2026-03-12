import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MultiActionButton } from '@/components/ui';
import type { AIRecipeResponse } from '@/types';

interface GenerateFABProps {
  hasUnsavedRecipe: boolean;
  generatedRecipe: AIRecipeResponse | null;
  isLoading: boolean;
  keyboardHeight: number;
  onGenerate: () => void;
  onReopenRecipe: () => void;
  onDiscard: () => void;
}

export function GenerateFAB({
  hasUnsavedRecipe,
  generatedRecipe,
  isLoading,
  keyboardHeight,
  onGenerate,
  onReopenRecipe,
  onDiscard,
}: GenerateFABProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute right-6"
      style={{ bottom: keyboardHeight > 0 ? keyboardHeight - (50 + insets.bottom) + 12 : 24 }}
    >
      {hasUnsavedRecipe && generatedRecipe ? (
        <MultiActionButton
          icon="ellipsis-v"
          variant="floating"
          floatingColor="amber-500"
          loading={isLoading}
          disabled={isLoading}
          options={[
            {
              id: 'view',
              label: t('recipeGeneration.viewRecipe' as any),
              icon: 'file-text-o',
              color: 'blue',
              onPress: onReopenRecipe,
            },
            {
              id: 'generate',
              label: t('recipeGeneration.generateNew' as any),
              icon: 'magic',
              color: 'green',
              onPress: onGenerate,
              disabled: isLoading,
            },
            {
              id: 'discard',
              label: t('recipeGeneration.discard'),
              icon: 'trash',
              color: 'red',
              onPress: onDiscard,
            },
          ]}
        />
      ) : (
        <MultiActionButton
          icon="magic"
          label={String(t('recipeGeneration.generateButton'))}
          variant="floating"
          floatingColor="primary-600"
          loading={isLoading}
          disabled={isLoading}
          options={[
            {
              id: 'generate',
              label: t('recipeGeneration.generate' as any),
              icon: 'magic',
              color: 'primary',
              onPress: onGenerate,
            },
          ]}
        />
      )}
    </View>
  );
}

