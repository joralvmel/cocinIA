import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof FontAwesome.glyphMap;
  onRemove?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'py-1 px-2.5',
  md: 'py-2 px-3.5',
};

const fontSizes = {
  sm: 'text-xs',
  md: 'text-sm',
};

const iconSizes = {
  sm: 12,
  md: 14,
};

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  onRemove,
  disabled = false,
  size = 'md',
  className = '',
}: ChipProps) {
  const { colors } = useAppTheme();
  const isInteractive = onPress || onRemove;
  const isDisabled = disabled && isInteractive;

  const getVariantClasses = () => {
    if (isDisabled) return 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700';
    if (selected) return 'bg-primary-100 dark:bg-primary-900 border-primary-600 dark:border-primary-400';
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const getTextColor = () => {
    if (isDisabled) return colors.textMuted;
    if (selected) return colors.primary;
    return colors.text;
  };

  const textColor = getTextColor();

  const baseClasses = `flex-row items-center rounded-full border ${sizeClasses[size]} ${getVariantClasses()} ${isDisabled ? 'opacity-60' : ''} ${className}`;

  const content = (
    <>
      {icon && (
        <FontAwesome name={icon} size={iconSizes[size]} color={textColor} className="mr-1.5" />
      )}
      <Text style={{ color: textColor }} className={`font-medium ${fontSizes[size]}`}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-2 -mr-1" hitSlop={8}>
          <FontAwesome name="times" size={iconSizes[size]} color={textColor} />
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={isDisabled ? true : undefined} className={baseClasses}>
        {content}
      </Pressable>
    );
  }

  return <View className={baseClasses}>{content}</View>;
}

// ChipGroup for selecting from multiple options
export interface ChipGroupProps {
  chips: Array<{ id: string; label: string; icon?: keyof typeof FontAwesome.glyphMap }>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  multiple?: boolean;
  scrollable?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ChipGroup({
  chips,
  selectedIds,
  onSelectionChange,
  multiple = true,
  scrollable = false,
  size = 'md',
  className = '',
}: ChipGroupProps) {
  const handleChipPress = (id: string) => {
    if (multiple) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    } else {
      onSelectionChange(selectedIds.includes(id) ? [] : [id]);
    }
  };

  const content = (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          icon={chip.icon}
          selected={selectedIds.includes(chip.id)}
          onPress={() => handleChipPress(chip.id)}
          size={size}
        />
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return content;
}
