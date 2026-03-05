import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card, Section } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RecipeStep } from '@/types';

interface StepsListProps {
  steps: RecipeStep[];
  expandedTips: Record<number, boolean>;
  onToggleTip: (stepNumber: number) => void;
}

export function StepsList({ steps, expandedTips, onToggleTip }: StepsListProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Section title={`👨‍🍳 ${t('recipeGeneration.preparation')}`}>
      <Card variant="outlined" padding="none">
        {steps.map((step, index) => (
          <View
            key={step.step_number}
            className={`${
              index < steps.length - 1
                ? 'border-b border-gray-100 dark:border-gray-800'
                : ''
            }`}
          >
            <View className="flex-row p-4">
              <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center mr-3 flex-shrink-0">
                <Text className="text-white font-bold text-sm">{step.step_number}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-gray-50 leading-relaxed">
                  {step.instruction}
                </Text>

                {(step.duration_minutes || step.tip) && (
                  <View className="flex-row items-center mt-2 gap-3">
                    {step.duration_minutes && (
                      <View className="flex-row items-center">
                        <FontAwesome name="clock-o" size={12} color={colors.textMuted} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          {step.duration_minutes} min
                        </Text>
                      </View>
                    )}
                    {step.tip && (
                      <Pressable
                        onPress={() => onToggleTip(step.step_number)}
                        className="flex-row items-center"
                      >
                        <FontAwesome
                          name={expandedTips[step.step_number] ? 'chevron-down' : 'chevron-right'}
                          size={10}
                          color="#EAB308"
                        />
                        <FontAwesome name="lightbulb-o" size={12} color="#EAB308" />
                        <Text className="text-xs text-yellow-600 dark:text-yellow-400 ml-1 font-medium">
                          {t('recipeGeneration.tipLabel')}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </View>

            {step.tip && expandedTips[step.step_number] && (
              <View className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 {step.tip}
                </Text>
              </View>
            )}
          </View>
        ))}
      </Card>
    </Section>
  );
}

