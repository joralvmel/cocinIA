import React from 'react';
import { View, Text } from 'react-native';

export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right';
  color?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  showLabel = false,
  labelPosition = 'right',
  className = '',
}: ProgressBarProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  if (labelPosition === 'top' && showLabel) {
    return (
      <View className={className}>
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Progress</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {Math.round(normalizedProgress)}%
          </Text>
        </View>
        <View className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <View
            className="h-full rounded-full bg-primary-600 dark:bg-primary-500"
            style={{ width: `${normalizedProgress}%` }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <View className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <View
          className="h-full rounded-full bg-primary-600 dark:bg-primary-500"
          style={{ width: `${normalizedProgress}%` }}
        />
      </View>
      {showLabel && (
        <Text className="ml-3 text-sm font-medium min-w-[40px] text-gray-900 dark:text-gray-50">
          {Math.round(normalizedProgress)}%
        </Text>
      )}
    </View>
  );
}

// Stepper Progress for multi-step forms
export interface StepperProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepperProgress({ steps, currentStep, className = '' }: StepperProgressProps) {
  return (
    <View className={className}>
      <View className="flex-row items-center justify-between">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center z-10 ${index <= currentStep ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className={`font-semibold ${index <= currentStep ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                className={`flex-1 h-0.5 -mx-1 ${index < currentStep ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-100 dark:bg-gray-700'}`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <View className="flex-row justify-between mt-2">
        {steps.map((step, index) => (
          <View key={index} className="items-center" style={{ width: 60 }}>
            <Text
              className={`text-xs text-center ${index <= currentStep ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-500'}`}
              numberOfLines={1}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
