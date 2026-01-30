import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  editable?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  unit,
  disabled = false,
  editable = true,
  className = '',
}: NumberInputProps) {
  const { colors } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleDecrement = () => {
    if (!disabled && value > min) onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (!disabled && value < max) onChange(Math.min(max, value + step));
  };

  const handleTextChange = (text: string) => {
    setTempValue(text.replace(/[^0-9]/g, ''));
  };

  const handleFocus = () => {
    setIsEditing(true);
    setTempValue(value.toString());
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(tempValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(max, Math.max(min, numValue));
      onChange(clampedValue);
      setTempValue(clampedValue.toString());
    } else {
      setTempValue(value.toString());
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View className={className}>
      {label && (
        <Text className="font-medium mb-2 text-gray-900 dark:text-gray-50">{label}</Text>
      )}
      <View className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Pressable
          onPress={handleDecrement}
          disabled={disabled || !canDecrement}
          className={`w-12 h-12 items-center justify-center ${canDecrement && !disabled ? '' : 'opacity-30'}`}
        >
          <FontAwesome name="minus" size={14} color={colors.primary} />
        </Pressable>
        <View className="flex-1 items-center flex-row justify-center">
          {editable ? (
            <TextInput
              value={isEditing ? tempValue : value.toString()}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              keyboardType="numeric"
              editable={!disabled}
              selectTextOnFocus
              className="text-center text-lg font-semibold min-w-[40px] p-0 text-gray-900 dark:text-gray-50"
            />
          ) : (
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">{value}</Text>
          )}
          {unit && <Text className="text-lg ml-1 text-gray-500 dark:text-gray-400">{unit}</Text>}
        </View>
        <Pressable
          onPress={handleIncrement}
          disabled={disabled || !canIncrement}
          className={`w-12 h-12 items-center justify-center ${canIncrement && !disabled ? '' : 'opacity-30'}`}
        >
          <FontAwesome name="plus" size={14} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

// Compact number input for inline use
export interface CompactNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function CompactNumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  disabled = false,
  className = '',
}: CompactNumberInputProps) {
  const { colors } = useAppTheme();

  const handleDecrement = () => {
    if (!disabled && value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (!disabled && value < max) onChange(value + 1);
  };

  return (
    <View className={`flex-row items-center rounded-lg bg-gray-100 dark:bg-gray-700 ${className}`}>
      <Pressable
        onPress={handleDecrement}
        disabled={disabled || value <= min}
        className={`w-8 h-8 items-center justify-center ${value > min && !disabled ? '' : 'opacity-30'}`}
      >
        <FontAwesome name="minus" size={12} color={colors.textSecondary} />
      </Pressable>
      <Text className="min-w-[32px] text-center font-semibold text-gray-900 dark:text-gray-50">
        {value}
      </Text>
      <Pressable
        onPress={handleIncrement}
        disabled={disabled || value >= max}
        className={`w-8 h-8 items-center justify-center ${value < max && !disabled ? '' : 'opacity-30'}`}
      >
        <FontAwesome name="plus" size={12} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}
