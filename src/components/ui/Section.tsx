import React from 'react';
import { View, Text } from 'react-native';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  subtitle,
  children,
  right,
  className = '',
}: SectionProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {(title || right) && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            {title && (
              <Text className="font-semibold text-lg text-gray-900 dark:text-gray-50">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
                {subtitle}
              </Text>
            )}
          </View>
          {right && <View>{right}</View>}
        </View>
      )}
      {children}
    </View>
  );
}

// SectionHeader for standalone section headers
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <View className={`mb-3 ${className}`}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm mt-1 text-gray-400 dark:text-gray-500">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
