import React from 'react';
import { View, Text, Pressable } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-50 dark:bg-gray-800';
      case 'outlined':
        return 'bg-transparent border border-gray-200 dark:border-gray-700';
      case 'elevated':
        return 'bg-gray-50 dark:bg-gray-800 shadow-sm';
    }
  };

  const baseClasses = `rounded-xl ${paddingClasses[padding]} ${getVariantClasses()} ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={baseClasses}>
        {children}
      </Pressable>
    );
  }

  return <View className={baseClasses}>{children}</View>;
}

// Card subcomponents
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, right, className = '' }: CardHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between mb-3 ${className}`}>
      <View className="flex-1">
        <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={className}>{children}</View>;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <View className={`flex-row items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </View>
  );
}
