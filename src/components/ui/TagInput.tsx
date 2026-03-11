import React from 'react';
import { View, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Input } from './Input';
import { Chip } from './Chip';

export interface TagInputProps {
  items: string[];
  inputText: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
  placeholder?: string;
  chipSize?: 'sm' | 'md';
  className?: string;
}

export function TagInput({
  items,
  inputText,
  onChangeText,
  onAdd,
  onRemove,
  placeholder,
  chipSize = 'sm',
  className = '',
}: TagInputProps) {
  const canAdd = inputText.trim().length > 0;

  return (
    <View className={className}>
      {/* Existing items as removable chips */}
      {items.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {items.map((item) => (
            <Chip
              key={item}
              label={item}
              selected
              onRemove={() => onRemove(item)}
              size={chipSize}
            />
          ))}
        </View>
      )}

      {/* Input + add button */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            placeholder={placeholder}
            value={inputText}
            onChangeText={onChangeText}
            onSubmitEditing={onAdd}
            returnKeyType="done"
          />
        </View>
        <Pressable
          onPress={onAdd}
          className="w-10 h-10 rounded-full items-center justify-center bg-primary-600 dark:bg-primary-500"
          style={{ opacity: canAdd ? 1 : 0.4 }}
          disabled={!canAdd}
        >
          <FontAwesome name="plus" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

