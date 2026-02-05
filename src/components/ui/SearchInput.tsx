import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  onClear,
  onFilterPress,
  showFilter = false,
  autoFocus = false,
  className = '',
}: SearchInputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center rounded-xl px-4 h-12 bg-gray-50 dark:bg-gray-800 border-[1.5px] ${
        isFocused ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
      } ${className}`}
    >
      <FontAwesome name="search" size={16} color={isFocused ? colors.primary : colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        returnKeyType="search"
        className="flex-1 mx-3 text-base text-gray-900 dark:text-gray-50"
      />
      {value.length > 0 && (
        <Pressable onPress={onClear || (() => onChangeText(''))} hitSlop={8}>
          <FontAwesome name="times-circle" size={18} color={colors.textMuted} />
        </Pressable>
      )}
      {showFilter && (
        <>
          <View className="w-px h-6 mx-3 bg-gray-200 dark:bg-gray-700" />
          <Pressable onPress={onFilterPress} hitSlop={8}>
            <FontAwesome name="sliders" size={18} color={colors.primary} />
          </Pressable>
        </>
      )}
    </View>
  );
}
