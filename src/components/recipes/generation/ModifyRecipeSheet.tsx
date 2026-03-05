import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Input, Button } from '@/components/ui';

interface ModifyRecipeSheetProps {
  visible: boolean;
  onClose: () => void;
  modifyText: string;
  onModifyTextChange: (text: string) => void;
  onSubmit: () => void;
  isModifying?: boolean;
}

export function ModifyRecipeSheet({
  visible,
  onClose,
  modifyText,
  onModifyTextChange,
  onSubmit,
  isModifying = false,
}: ModifyRecipeSheetProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={String(t('recipeGeneration.modify'))}
    >
      <View className="gap-4 pb-4">
        <Text className="text-gray-600 dark:text-gray-400">
          {t('recipeGeneration.modifyDescription')}
        </Text>
        <Input
          placeholder={String(t('recipeGeneration.modifyPlaceholder'))}
          value={modifyText}
          onChangeText={onModifyTextChange}
          multiline
          numberOfLines={3}
        />
        <View className="flex-row gap-3">
          <Button variant="outline" onPress={onClose} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button
            onPress={onSubmit}
            loading={isModifying}
            disabled={!modifyText.trim()}
            className="flex-1"
          >
            {t('recipeGeneration.applyChanges')}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

