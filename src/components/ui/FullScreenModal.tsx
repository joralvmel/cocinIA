import React from 'react';
import { View, Text, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';

export interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  /** Use chevron-down instead of X for close button */
  useChevron?: boolean;
}

export function FullScreenModal({
  visible,
  onClose,
  title,
  children,
  rightAction,
  useChevron = false,
}: FullScreenModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <IconButton
            icon={useChevron ? "chevron-down" : "times"}
            variant="ghost"
            onPress={onClose}
          />
          {title && (
            <Text
              className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-50 mx-3"
              numberOfLines={2}
            >
              {title}
            </Text>
          )}
          {rightAction || <View className="w-10" />}
        </View>
        <View className="flex-1">{children}</View>
      </SafeAreaView>
    </Modal>
  );
}
