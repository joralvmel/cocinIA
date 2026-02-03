import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface RangeSliderProps {
  min: number;
  max: number;
  value?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatLabel?: (value: number) => string;
  showLabels?: boolean;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  value,
  step = 1,
  onValueChange,
  formatLabel = (v) => String(v),
  showLabels = true,
  className = '',
}: RangeSliderProps) {
  const { colors } = useAppTheme();

  const [currentValue, setCurrentValue] = useState(value ?? max);

  const handleChange = (val: number) => {
    setCurrentValue(val);
    onValueChange?.(val);
  };

  return (
    <View className={className}>
      {showLabels && (
        <View className="flex-row justify-center mb-2">
          <Text className="text-lg font-semibold text-primary-600 dark:text-primary-400">
            {formatLabel(currentValue)}
          </Text>
        </View>
      )}

      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={currentValue}
        onValueChange={handleChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      {/* Min/Max labels */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {formatLabel(min)}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {formatLabel(max)}
        </Text>
      </View>
    </View>
  );
}
