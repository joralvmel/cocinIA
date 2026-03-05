import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheet, Input, NumberInput, Button } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Recipe } from '@/types';
import type { RecipeEditState, RecipeEditActions } from '@/hooks/useRecipeDetail';

interface EditRecipeSheetProps {
  recipe: Recipe;
  editState: RecipeEditState;
  editActions: RecipeEditActions;
  isSaving: boolean;
  onPickImage: () => void;
  onDeleteImage: () => void;
}

export function EditRecipeSheet({
  recipe,
  editState,
  editActions,
  isSaving,
  onPickImage,
  onDeleteImage,
}: EditRecipeSheetProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <BottomSheet
      visible={editState.isEditing}
      onClose={() => editActions.setIsEditing(false)}
      title={String(t('recipes.detail.editTitle' as any))}
    >
      <View className="gap-4 pb-4">
        <Input
          label={String(t('recipes.detail.titleLabel' as any))}
          value={editState.editedTitle}
          onChangeText={editActions.setEditedTitle}
          placeholder={String(t('recipes.detail.titlePlaceholder' as any))}
        />
        <Input
          label={String(t('recipes.detail.descriptionLabel' as any))}
          value={editState.editedDescription}
          onChangeText={editActions.setEditedDescription}
          placeholder={String(t('recipes.detail.descriptionPlaceholder' as any))}
          multiline
          numberOfLines={3}
        />
        <NumberInput
          label={String(t('recipes.detail.servingsLabel' as any))}
          value={editState.editedServings}
          onChange={editActions.setEditedServings}
          min={1}
          max={50}
        />

        {/* Photo Section */}
        <View className="mt-2">
          <Text className="font-medium mb-2 text-gray-900 dark:text-gray-50">
            {t('recipes.detail.photoLabel' as any)}
          </Text>
          {recipe.image_url ? (
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: recipe.image_url }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 gap-2">
                <Button variant="outline" size="sm" onPress={onPickImage}>
                  {t('recipes.detail.changePhoto' as any)}
                </Button>
                <Button variant="danger" size="sm" onPress={onDeleteImage}>
                  {t('recipes.detail.deletePhoto' as any)}
                </Button>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={onPickImage}
              className="flex-row items-center p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
            >
              <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
                <FontAwesome name="camera" size={18} color={colors.primary} />
              </View>
              <Text className="flex-1 text-gray-500 dark:text-gray-400">
                {t('recipes.detail.addPhoto' as any)}
              </Text>
              <FontAwesome name="plus" size={14} color={colors.primary} />
            </Pressable>
          )}
        </View>

        <View className="flex-row gap-3 mt-4">
          <Button
            variant="outline"
            onPress={() => editActions.setIsEditing(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onPress={editActions.handleSaveEdits}
            loading={isSaving}
            disabled={!editState.editedTitle.trim()}
            className="flex-1"
          >
            {t('common.save')}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

