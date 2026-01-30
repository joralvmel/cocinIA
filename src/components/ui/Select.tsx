import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  className = '',
}: SelectProps) {
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      return selectedValues
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(', ');
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
        className={`flex-row items-center justify-between rounded-xl px-4 py-3 border-[1.5px] ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} ${disabled ? 'bg-gray-100 dark:bg-gray-700 opacity-60' : 'bg-gray-50 dark:bg-gray-800'}`}
      >
        <Text
          className={`flex-1 ${selectedValues.length > 0 ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}`}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        <FontAwesome
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textSecondary}
        />
      </Pressable>
      {error && <Text className="text-xs mt-1 ml-1 text-red-500">{error}</Text>}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable
          className="flex-1 justify-center items-center px-6 bg-black/40"
          onPress={() => setIsOpen(false)}
        >
          <View className="w-full max-h-96 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
            {label && (
              <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50">{label}</Text>
              </View>
            )}
            <ScrollView>
              {options.map((option) => (
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
              ))}
            </ScrollView>
            {multiple && (
              <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="py-2 rounded-lg items-center bg-primary-600 dark:bg-primary-500"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
