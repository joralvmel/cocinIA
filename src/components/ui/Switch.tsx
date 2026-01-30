import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  className = '',
}: SwitchProps) {
  const { colors } = useAppTheme();
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  const bgColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 20 : 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(bgColor, {
        toValue: value ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const handlePress = () => {
    if (!disabled) onValueChange(!value);
  };

  const backgroundColor = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center justify-between ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {(label || description) && (
        <View className="flex-1 mr-4">
          {label && <Text className="font-medium text-gray-900 dark:text-gray-50">{label}</Text>}
          {description && (
            <Text className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{description}</Text>
          )}
        </View>
      )}
      <Animated.View
        style={{
          backgroundColor,
          width: 48,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}
      >
        <Animated.View
          className="shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            width: 24,
            height: 24,
            borderRadius: 12,
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

// SwitchItem for list items
export interface SwitchItemProps extends SwitchProps {
  icon?: keyof typeof FontAwesome.glyphMap;
}

export function SwitchItem({ icon, className = '', ...props }: SwitchItemProps) {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row items-center py-3 px-4 bg-gray-50 dark:bg-gray-800 ${className}`}>
      {icon && (
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-primary-100 dark:bg-primary-900">
          <FontAwesome name={icon} size={18} color={colors.primary} />
        </View>
      )}
      <Switch {...props} className="flex-1" />
    </View>
  );
}
