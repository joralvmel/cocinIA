import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Whether to strike through the label when checked (useful for shopping lists) */
  strikethrough?: boolean;
}

const boxSizes = {
  sm: 'w-[18px] h-[18px]',
  md: 'w-[22px] h-[22px]',
  lg: 'w-[26px] h-[26px]',
};
const iconSizes = { sm: 12, md: 14, lg: 18 };

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  strikethrough = false,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) onChange(!checked);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      <View
        className={`items-center justify-center rounded ${boxSizes[size]} ${
          checked
            ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
            : 'bg-transparent border-gray-300 dark:border-gray-600'
        } border-2`}
      >
        {checked && (
          <FontAwesome
            name="check"
            size={iconSizes[size]}
            color="#ffffff"
          />
        )}
      </View>
      {(label || description) && (
        <View className="flex-1 ml-3">
          {label && (
            <Text
              className={`font-medium text-gray-900 dark:text-gray-50 ${
                checked && strikethrough ? 'line-through' : ''
              }`}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text className="text-sm mt-0.5 text-gray-400 dark:text-gray-500">
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

// CheckboxItem for list items (like shopping list)
export interface CheckboxItemProps extends CheckboxProps {
  right?: React.ReactNode;
}

export function CheckboxItem({
  right,
  className = '',
  ...props
}: CheckboxItemProps) {
  return (
    <View
      className={`flex-row items-center py-3 px-4 bg-gray-50 dark:bg-gray-800 ${className}`}
    >
      <Checkbox {...props} className="flex-1" />
      {right && <View className="ml-2">{right}</View>}
    </View>
  );
}
