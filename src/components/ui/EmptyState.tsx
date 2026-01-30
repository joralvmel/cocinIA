import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Button } from './Button';

export type EmptyStateVariant = 'default' | 'search' | 'error';

export interface EmptyStateProps {
  icon?: keyof typeof FontAwesome.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  const getDefaultIcon = (): keyof typeof FontAwesome.glyphMap => {
    switch (variant) {
      case 'search':
        return 'search';
      case 'error':
        return 'exclamation-circle';
      default:
        return 'inbox';
    }
  };

  const displayIcon = icon || getDefaultIcon();
  const iconColor = variant === 'error' ? colors.error : colors.textMuted;

  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      <View className="w-20 h-20 rounded-full items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
        <FontAwesome name={displayIcon} size={36} color={iconColor} />
      </View>
      <Text className="text-lg font-semibold text-center mb-2 text-gray-900 dark:text-gray-50">
        {title}
      </Text>
      {description && (
        <Text className="text-center mb-6 max-w-[280px] text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
