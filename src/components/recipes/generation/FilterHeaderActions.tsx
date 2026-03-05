import React from 'react';
import { View, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

interface FilterHeaderActionsProps {
  onClear: () => void;
  onReset: () => void;
  clearPressed: boolean;
  resetPressed: boolean;
}

export function FilterHeaderActions({
  onClear,
  onReset,
  clearPressed,
  resetPressed,
}: FilterHeaderActionsProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onClear}
        className={`p-2 rounded-lg ${clearPressed ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
      >
        <FontAwesome
          name="trash-o"
          size={18}
          color={clearPressed ? '#ef4444' : colors.textSecondary}
        />
      </Pressable>
      <Pressable
        onPress={onReset}
        className={`p-2 rounded-lg ${resetPressed ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}
      >
        <FontAwesome
          name="refresh"
          size={18}
          color={resetPressed ? '#22c55e' : colors.primary}
        />
      </Pressable>
    </View>
  );
}

