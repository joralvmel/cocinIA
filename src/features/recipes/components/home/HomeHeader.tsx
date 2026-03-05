import React from 'react';
import { View, Text } from 'react-native';

interface HomeHeaderProps {
  greeting: string;
  question: string;
  subtitle: string;
}

export function HomeHeader({ greeting, question, subtitle }: HomeHeaderProps) {
  return (
    <View className="mb-6">
      {greeting ? (
        <Text className="text-base text-gray-500 dark:text-gray-400 mb-1">
          {greeting}
        </Text>
      ) : null}
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
        {question}
      </Text>
      <Text className="text-sm text-gray-400 dark:text-gray-500">
        {subtitle}
      </Text>
    </View>
  );
}

