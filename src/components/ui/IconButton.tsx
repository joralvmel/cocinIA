import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconButtonProps {
  icon: keyof typeof FontAwesome.glyphMap;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

const iconSizes: Record<IconButtonSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 26,
};

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    if (isDisabled) return 'bg-gray-200 dark:bg-gray-700';
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 dark:bg-primary-500';
      case 'secondary':
        return 'bg-primary-100 dark:bg-primary-900';
      case 'outline':
        return 'bg-transparent border-[1.5px] border-primary-600 dark:border-primary-400';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-transparent';
    }
  };

  const getIconColor = () => {
    if (isDisabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-full ${sizeClasses[size]} ${getVariantClasses()} ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <FontAwesome name={icon} size={iconSizes[size]} color={getIconColor()} />
      )}
    </Pressable>
  );
}
