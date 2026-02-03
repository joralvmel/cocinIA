import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheet } from './BottomSheet';
import { SearchInput } from './SearchInput';

export interface SelectBottomSheetOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
}

export interface SelectBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectBottomSheetOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function SelectBottomSheet({
  visible,
  onClose,
  title,
  options,
  value,
  onChange,
  searchable = false,
  searchPlaceholder = 'Search...',
}: SelectBottomSheetProps) {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options by search
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.subtitle?.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={title}>
      {searchable && (
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          className="mb-3"
        />
      )}
      <ScrollView
        className="max-h-80"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
              className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-900/30'
                  : ''
              }`}
              style={!isSelected ? { backgroundColor: 'transparent' } : undefined}
            >
              {option.icon && (
                <Text className="text-xl mr-3">{option.icon}</Text>
              )}
              <View className="flex-1">
                <Text
                  className={`text-base ${
                    isSelected
                      ? 'text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-900 dark:text-gray-50'
                  }`}
                >
                  {option.label}
                </Text>
                {option.subtitle && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {option.subtitle}
                  </Text>
                )}
              </View>
              {isSelected && (
                <FontAwesome name="check" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
        {filteredOptions.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-gray-400 dark:text-gray-500">
              No results found
            </Text>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

// Pressable trigger component for use with SelectBottomSheet
export interface SelectTriggerProps {
  label?: string;
  value: string;
  displayValue?: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectTrigger({
  label,
  value,
  displayValue,
  placeholder,
  onPress,
  error,
  disabled = false,
  className = '',
}: SelectTriggerProps) {
  return (
    <View className={className}>
      {label && (
        <Text
          className={`font-medium mb-2 text-sm ${
            error ? 'text-red-500' : 'text-gray-900 dark:text-gray-50'
          }`}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={disabled ? undefined : onPress}
        className={`flex-row items-center justify-between rounded-xl px-4 py-3 border-[1.5px] ${
          error
            ? 'border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        } ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-700 opacity-60'
            : 'bg-gray-50 dark:bg-gray-800'
        }`}
      >
        <Text
          className={`flex-1 ${
            value
              ? 'text-gray-900 dark:text-gray-50'
              : 'text-gray-400 dark:text-gray-500'
          }`}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={12}
          color="#9CA3AF"
          style={{ marginLeft: 8 }}
        />
      </Pressable>
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
