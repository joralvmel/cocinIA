import React from 'react';
import { View, Text, Modal } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Button } from './Button';

export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: 'info' | 'warning' | 'danger';
  icon?: keyof typeof FontAwesome.glyphMap;
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'info',
  icon,
}: AlertModalProps) {
  const { colors } = useAppTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'warning':
        return '#d97706';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getDefaultIcon = (): keyof typeof FontAwesome.glyphMap => {
    switch (variant) {
      case 'warning':
        return 'exclamation-triangle';
      case 'danger':
        return 'trash';
      default:
        return 'info-circle';
    }
  };

  const getIconBgClass = () => {
    switch (variant) {
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-primary-100 dark:bg-primary-900';
    }
  };

  const variantColor = getVariantColor();
  const displayIcon = icon || getDefaultIcon();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center px-6 bg-black/40">
        <View className="w-full rounded-2xl p-6 bg-white dark:bg-gray-800">
          <View className="items-center mb-4">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${getIconBgClass()}`}
            >
              <FontAwesome name={displayIcon} size={32} color={variantColor} />
            </View>
            <Text className="text-xl font-bold text-center text-gray-900 dark:text-gray-50">
              {title}
            </Text>
            {message && (
              <Text className="text-center mt-2 text-gray-500 dark:text-gray-400">
                {message}
              </Text>
            )}
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={onClose} fullWidth>
                {cancelLabel}
              </Button>
            </View>
            {onConfirm && (
              <View className="flex-1">
                <Button
                  variant={variant === 'danger' ? 'danger' : 'primary'}
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                  fullWidth
                >
                  {confirmLabel}
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
