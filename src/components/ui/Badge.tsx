import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof FontAwesome.glyphMap;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-gray-700',
  primary: 'bg-primary-100 dark:bg-primary-900',
  success: 'bg-primary-100 dark:bg-primary-900',
  warning: 'bg-amber-100 dark:bg-amber-900',
  error: 'bg-red-100 dark:bg-red-900',
  info: 'bg-blue-100 dark:bg-blue-900',
};

const variantTextColors: Record<BadgeVariant, string> = {
  default: 'text-gray-600 dark:text-gray-400',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const sizeClasses = { sm: 'py-0.5 px-1.5', md: 'py-1 px-2.5' };
const fontSizes = { sm: 'text-[11px]', md: 'text-[13px]' };
const iconSizes = { sm: 10, md: 12 };

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const { colors } = useAppTheme();

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'success': return '#16a34a';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      case 'info': return '#2563eb';
      default: return colors.textSecondary;
    }
  };

  return (
    <View className={`flex-row items-center rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <FontAwesome name={icon} size={iconSizes[size]} color={getIconColor()} className="mr-1" />}
      <Text className={`font-medium ${fontSizes[size]} ${variantTextColors[variant]}`}>
        {label}
      </Text>
    </View>
  );
}

// InfoBadge for displaying recipe info (time, calories, servings, etc.)
export interface InfoBadgeProps {
  icon: keyof typeof FontAwesome.glyphMap;
  value: string | number;
  label?: string;
  className?: string;
}

export function InfoBadge({ icon, value, label, className = '' }: InfoBadgeProps) {
  const { colors } = useAppTheme();

  return (
    <View className={`items-center ${className}`}>
      <View className="flex-row items-center rounded-lg px-3 py-1.5 bg-gray-100 dark:bg-gray-700">
        <FontAwesome name={icon} size={14} color={colors.primary} className="mr-1.5" />
        <Text className="font-semibold text-gray-900 dark:text-gray-50">{value}</Text>
      </View>
      {label && <Text className="text-xs mt-1 text-gray-400 dark:text-gray-500">{label}</Text>}
    </View>
  );
}

// BadgeGroup for displaying multiple badges
export interface BadgeGroupProps {
  badges: Array<{ icon: keyof typeof FontAwesome.glyphMap; value: string | number; label?: string }>;
  className?: string;
}

export function BadgeGroup({ badges, className = '' }: BadgeGroupProps) {
  return (
    <View className={`flex-row flex-wrap gap-3 ${className}`}>
      {badges.map((badge, index) => (
        <InfoBadge key={index} {...badge} />
      ))}
    </View>
  );
}
