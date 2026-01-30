import React from 'react';
import { View, Text } from 'react-native';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return <View className={`w-px self-stretch bg-gray-200 dark:bg-gray-700 ${className}`} />;
  }
  return <View className={`h-px w-full bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

// DividerWithText for "or" dividers
export interface DividerWithTextProps {
  text: string;
  className?: string;
}

export function DividerWithText({ text, className = '' }: DividerWithTextProps) {
  return (
    <View className={`flex-row items-center ${className}`}>
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <Text className="px-4 text-sm text-gray-400 dark:text-gray-500">{text}</Text>
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}
