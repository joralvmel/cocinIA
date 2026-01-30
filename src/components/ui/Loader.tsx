import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from 'react-i18next';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderVariant = 'default' | 'overlay' | 'inline';

export interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  text?: string;
  showText?: boolean;
  className?: string;
}

export function Loader({
  size = 'md',
  variant = 'default',
  text,
  showText = true,
  className = '',
}: LoaderProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const getSize = (): 'small' | 'large' => {
    return size === 'sm' ? 'small' : 'large';
  };

  const getScale = () => {
    switch (size) {
      case 'sm':
        return 0.8;
      case 'md':
        return 1;
      case 'lg':
        return 1.5;
    }
  };

  const displayText = text || t('common.loading');

  if (variant === 'overlay') {
    return (
      <View className="absolute inset-0 items-center justify-center z-50 bg-black/40">
        <View className="rounded-2xl p-6 items-center bg-gray-50 dark:bg-gray-800">
          <ActivityIndicator
            size={getSize()}
            color={colors.primary}
            style={{ transform: [{ scale: getScale() }] }}
          />
          {showText && (
            <Text className="mt-4 font-medium text-gray-900 dark:text-gray-50">
              {displayText}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View className={`flex-row items-center ${className}`}>
        <ActivityIndicator size="small" color={colors.primary} />
        {showText && (
          <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {displayText}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={`items-center justify-center py-8 ${className}`}>
      <ActivityIndicator
        size={getSize()}
        color={colors.primary}
        style={{ transform: [{ scale: getScale() }] }}
      />
      {showText && (
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          {displayText}
        </Text>
      )}
    </View>
  );
}

// Full screen loader
export function FullScreenLoader({ text }: { text?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Loader size="lg" text={text} />
    </View>
  );
}
