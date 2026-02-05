import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SearchInput } from './SearchInput';

export interface SelectOption {
  value: string;
  label: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiple?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  showClearButton?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  multiple = false,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  showClearButton = false,
  className = '',
}: SelectProps) {
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Maximum characters to show in trigger before showing +N
  const MAX_DISPLAY_CHARS = 30;

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      const labels = selectedValues
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean) as string[];

      if (labels.length === 0) return placeholder;

      // Build display text with +N for overflow
      let displayText = labels[0];
      let displayedCount = 1;

      for (let i = 1; i < labels.length; i++) {
        const nextText = `${displayText}, ${labels[i]}`;
        if (nextText.length > MAX_DISPLAY_CHARS) {
          break;
        }
        displayText = nextText;
        displayedCount++;
      }

      const remaining = labels.length - displayedCount;
      if (remaining > 0) {
        return `${displayText} +${remaining}`;
      }
      return displayText;
    }
    return options.find((o) => o.value === selectedValues[0])?.label || placeholder;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange(multiple ? [] : '');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

  return (
    <View className={className}>
      {label && (
        <Text className={`font-medium mb-2 text-sm ${error ? 'text-red-500' : 'text-gray-900 dark:text-gray-50'}`}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={`flex-row items-center justify-between rounded-xl px-4 py-3 border-[1.5px] ${
          error 
            ? 'border-red-500' 
            : isOpen 
              ? 'border-primary-500' 
              : 'border-gray-200 dark:border-gray-700'
        } ${disabled ? 'bg-gray-100 dark:bg-gray-700 opacity-60' : 'bg-gray-50 dark:bg-gray-800'}`}
      >
        <Text
          className={`flex-1 ${selectedValues.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}`}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        <View className="flex-row items-center">
          {showClearButton && selectedValues.length > 0 && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              hitSlop={8}
              className="mr-2"
            >
              <FontAwesome name="times-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
          <FontAwesome
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>
      {error && <Text className="text-xs mt-1 ml-1 text-red-500">{error}</Text>}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable
          className="flex-1 justify-center items-center px-6 bg-black/40"
          onPress={handleClose}
        >
          <Pressable
            className="w-full max-h-96 rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with title */}
            {label && (
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50">{label}</Text>
              </View>
            )}

            {/* Search Input */}
            {searchable && (
              <View className="px-4 pt-3 pb-2">
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  onClear={() => setSearchQuery('')}
                  className="h-10"
                />
              </View>
            )}

            <ScrollView>
              {filteredOptions.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 dark:text-gray-400">No results found</Text>
                </View>
              ) : (
                filteredOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => !option.disabled && handleSelect(option.value)}
                    className={`flex-row items-center px-4 py-3 ${isSelected(option.value) ? 'bg-primary-100 dark:bg-primary-900' : ''} ${option.disabled ? 'opacity-50' : ''}`}
                  >
                    {option.icon && (
                      <FontAwesome
                        name={option.icon}
                        size={18}
                        color={isSelected(option.value) ? colors.primary : colors.textSecondary}
                        className="mr-3"
                      />
                    )}
                    <Text
                      className={`flex-1 font-medium ${isSelected(option.value) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-50'}`}
                    >
                      {option.label}
                    </Text>
                    {isSelected(option.value) && (
                      <FontAwesome name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
            {multiple && (
              <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Pressable
                  onPress={handleClose}
                  className="py-2 rounded-lg items-center bg-primary-600 dark:bg-primary-500"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
