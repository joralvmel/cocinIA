import React from 'react';
import { View, Text, Modal } from 'react-native';
import { IconButton } from './IconButton';

export interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function FullScreenModal({
  visible,
  onClose,
  title,
  children,
  rightAction,
}: FullScreenModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <IconButton icon="times" variant="ghost" onPress={onClose} />
          {title && (
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {title}
            </Text>
          )}
          {rightAction || <View className="w-10" />}
        </View>
        <View className="flex-1">{children}</View>
      </View>
    </Modal>
  );
}
