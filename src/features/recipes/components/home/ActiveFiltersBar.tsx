import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Chip } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FilterChip } from '@/utils/recipeFilters';

interface ActiveFiltersBarProps {
  chips: FilterChip[];
  hasFilters: boolean;
  onPress: () => void;
}

export function ActiveFiltersBar({ chips, hasFilters, onPress }: ActiveFiltersBarProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <FontAwesome
            name="sliders"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('recipeGeneration.advancedOptions')}
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
      </View>

      {hasFilters ? (
        <View className="flex-row flex-wrap gap-1">
          {chips.map((chip) => (
            <Chip key={chip.key} size="sm" label={chip.label} />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-gray-400 dark:text-gray-500">
          {String(t('recipeGeneration.noFiltersActive' as any))}
        </Text>
      )}
    </Pressable>
  );
}

