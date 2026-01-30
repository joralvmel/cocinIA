import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof FontAwesome.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-4 px-6',
};

const fontSizes: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}: ButtonProps) {
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
      case 'danger':
        return 'bg-red-500 dark:bg-red-400';
      default:
        return 'bg-primary-600';
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#ffffff';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return '#ffffff';
    }
  };

  const textColor = getTextColor();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-xl flex-row items-center justify-center ${sizeClasses[size]} ${getVariantClasses()} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <FontAwesome name={icon} size={iconSizes[size]} color={textColor} className="mr-2" />
          )}
          <Text style={{ color: textColor }} className={`font-semibold text-center ${fontSizes[size]}`}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <FontAwesome name={icon} size={iconSizes[size]} color={textColor} className="ml-2" />
          )}
        </>
      )}
    </Pressable>
  );
}
