import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheet } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';

interface PhotoOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

export function PhotoOptionsSheet({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}: PhotoOptionsSheetProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={String(t('recipes.detail.addPhotoTitle' as any))}
    >
      <View className="gap-3 pb-4">
        <Pressable
          onPress={onCameraPress}
          className="flex-row items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
        >
          <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
            <FontAwesome name="camera" size={18} color={colors.primary} />
          </View>
          <Text className="flex-1 font-medium text-gray-900 dark:text-gray-50">
            {t('recipes.detail.fromCamera' as any)}
          </Text>
          <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={onGalleryPress}
          className="flex-row items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
        >
          <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
            <FontAwesome name="image" size={18} color={colors.primary} />
          </View>
          <Text className="flex-1 font-medium text-gray-900 dark:text-gray-50">
            {t('recipes.detail.fromGallery' as any)}
          </Text>
          <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

