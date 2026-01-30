import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Segment Control (like iOS segmented control)
export interface SegmentOption {
  value: string;
  label: string;
  icon?: keyof typeof FontAwesome.glyphMap;
}

export interface SegmentControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentControl({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentControlProps) {
  const { colors } = useAppTheme();
  const paddingClass = size === 'sm' ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const textClass = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <View className={`flex-row rounded-xl p-1 bg-gray-100 dark:bg-gray-700 ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 flex-row items-center justify-center rounded-lg ${paddingClass} ${isSelected ? 'bg-white dark:bg-gray-800' : ''}`}
          >
            {option.icon && (
              <FontAwesome
                name={option.icon}
                size={size === 'sm' ? 14 : 16}
                color={isSelected ? colors.primary : colors.textMuted}
                className="mr-1.5"
              />
            )}
            <Text
              className={`font-medium ${textClass} ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Toggle Button Group (for multi-select)
export interface ToggleButtonGroupProps {
  options: SegmentOption[];
  values: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ToggleButtonGroup({
  options,
  values,
  onChange,
  multiple = true,
  className = '',
}: ToggleButtonGroupProps) {
  const { colors } = useAppTheme();

  const handlePress = (optionValue: string) => {
    if (multiple) {
      if (values.includes(optionValue)) {
        onChange(values.filter((v) => v !== optionValue));
      } else {
        onChange([...values, optionValue]);
      }
    } else {
      onChange(values.includes(optionValue) ? [] : [optionValue]);
    }
  };

  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = values.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            className={`flex-row items-center rounded-lg py-2 px-4 border ${isSelected ? 'bg-primary-100 dark:bg-primary-900 border-primary-600 dark:border-primary-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
          >
            {option.icon && (
              <FontAwesome
                name={option.icon}
                size={16}
                color={isSelected ? colors.primary : colors.textSecondary}
                className="mr-2"
              />
            )}
            <Text className={`font-medium ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-50'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Day Selector (for weekly plan)
export interface DaySelectorProps {
  selectedDays: number[]; // 0-6 (Sunday-Saturday)
  onChange: (days: number[]) => void;
  multiple?: boolean;
  labels?: string[];
  className?: string;
}

export function DaySelector({
  selectedDays,
  onChange,
  multiple = true,
  labels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  className = '',
}: DaySelectorProps) {
  const handlePress = (day: number) => {
    if (multiple) {
      if (selectedDays.includes(day)) {
        onChange(selectedDays.filter((d) => d !== day));
      } else {
        onChange([...selectedDays, day].sort());
      }
    } else {
      onChange(selectedDays.includes(day) ? [] : [day]);
    }
  };

  return (
    <View className={`flex-row justify-between ${className}`}>
      {labels.map((label, index) => {
        const isSelected = selectedDays.includes(index);
        return (
          <Pressable
            key={index}
            onPress={() => handlePress(index)}
            className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
