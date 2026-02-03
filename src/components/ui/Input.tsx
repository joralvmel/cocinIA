import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  leftIcon?: keyof typeof FontAwesome.glyphMap;
  rightIcon?: keyof typeof FontAwesome.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  className = '',
  ...rest
}: InputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getBorderClasses = () => {
    if (error) return 'border-red-500';
    if (isFocused) return 'border-primary-600 dark:border-primary-400';
    return 'border-gray-200 dark:border-gray-700';
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const minHeight = multiline ? numberOfLines * 24 + 24 : 48;

  return (
    <View className={className}>
      {label && (
        <Text className={`font-medium mb-2 text-sm ${error ? 'text-red-500' : 'text-gray-900 dark:text-gray-50'}`}>
          {label}
        </Text>
      )}
      <View
        className={`flex-row rounded-xl px-4 border-[1.5px] ${multiline ? 'items-start' : 'items-center'} ${getBorderClasses()} ${disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`}
        style={{ minHeight }}
      >
        {leftIcon && (
          <View style={{ paddingTop: multiline ? 12 : 0, paddingBottom: multiline ? 12 : 0, justifyContent: multiline ? 'flex-start' : 'center' }}>
            <FontAwesome
              name={leftIcon}
              size={18}
              color={error ? colors.error : colors.textSecondary}
              style={{ marginRight: 12 }}
            />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className={`flex-1 text-base text-gray-900 dark:text-gray-50 py-3`}
          style={{ textAlignVertical: multiline ? 'top' : 'center' }}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePasswordVisibility} className="ml-2 p-1">
            <FontAwesome
              name={isPasswordVisible ? 'eye' : 'eye-slash'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
        {rightIcon && !secureTextEntry && (
          <Pressable onPress={onRightIconPress} className="ml-2 p-1" disabled={!onRightIconPress}>
            <FontAwesome name={rightIcon} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <Text className={`text-xs mt-1 ml-1 ${error ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}
