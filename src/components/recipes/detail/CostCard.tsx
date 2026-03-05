import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';

interface CostCardProps {
  estimatedCost: number;
  costCurrency: string;
  costPerServing?: number | null;
}

export function CostCard({ estimatedCost, costCurrency, costPerServing }: CostCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('recipeGeneration.estimatedCost')}
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {costCurrency} {estimatedCost.toFixed(2)}
          </Text>
        </View>
        {costPerServing != null && (
          <View className="items-end">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t('recipeGeneration.perServing')}
            </Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {costCurrency} {costPerServing.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

