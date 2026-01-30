import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftIcon?: keyof typeof FontAwesome.glyphMap;
  rightIcon?: keyof typeof FontAwesome.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
  showChevron = false,
  className = '',
}: ListItemProps) {
  const { colors } = useAppTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center py-3 px-4 bg-gray-50 dark:bg-gray-800 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {left && <View className="mr-3">{left}</View>}
      {leftIcon && !left && (
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-primary-100 dark:bg-primary-900">
          <FontAwesome name={leftIcon} size={18} color={colors.primary} />
        </View>
      )}
      <View className="flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-50">{title}</Text>
        {subtitle && (
          <Text className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{subtitle}</Text>
        )}
      </View>
      {right && <View className="ml-3">{right}</View>}
      {rightIcon && !right && (
        <FontAwesome name={rightIcon} size={16} color={colors.textSecondary} className="ml-3" />
      )}
      {showChevron && !right && !rightIcon && (
        <FontAwesome name="chevron-right" size={14} color={colors.textMuted} className="ml-3" />
      )}
    </Container>
  );
}

// ListItemSeparator
export function ListItemSeparator() {
  return <View className="ml-16 h-px bg-gray-200 dark:bg-gray-700" />;
}

// ListGroup for grouping list items
export interface ListGroupProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  className?: string;
}

export function ListGroup({ children, header, footer, className = '' }: ListGroupProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {header && (
        <Text className="text-xs font-semibold uppercase tracking-wide mb-2 ml-4 text-gray-500 dark:text-gray-400">
          {header}
        </Text>
      )}
      <View className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
        {React.Children.map(children, (child, index) => (
          <>
            {child}
            {index < React.Children.count(children) - 1 && <ListItemSeparator />}
          </>
        ))}
      </View>
      {footer && (
        <Text className="text-xs mt-2 ml-4 text-gray-400 dark:text-gray-500">{footer}</Text>
      )}
    </View>
  );
}
