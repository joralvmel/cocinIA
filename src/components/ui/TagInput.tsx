import React, { useRef } from 'react';
import { View, Pressable, TextInput } from 'react-native';
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
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    if (canAdd) {
      onAdd();
      // Keep focus on the input so the keyboard stays open
      inputRef.current?.focus();
    }
  };

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
            ref={inputRef}
            placeholder={placeholder}
            value={inputText}
            onChangeText={onChangeText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            submitBehavior="submit"
          />
        </View>
        <Pressable
          onPress={handleAdd}
          onStartShouldSetResponder={() => true}
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

