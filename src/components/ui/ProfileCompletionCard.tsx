import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from './Progress';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ProfileCompletionResult } from '@/utils';

interface ProfileCompletionCardProps {
  completion: ProfileCompletionResult;
  onPress?: () => void;
  compact?: boolean;
}

export function ProfileCompletionCard({
  completion,
  onPress,
  compact = false
}: ProfileCompletionCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const getCompletionMessage = (percentage: number): string => {
    if (percentage === 100) {
      return t('profile.completion.perfect');
    } else if (percentage >= 80) {
      return t('profile.completion.almostThere');
    } else if (percentage >= 50) {
      return t('profile.completion.halfWay');
    } else if (percentage >= 25) {
      return t('profile.completion.goodStart');
    } else {
      return t('profile.completion.getStarted');
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage === 100) return '#10b981'; // green
    if (percentage >= 80) return '#3b82f6'; // blue
    if (percentage >= 50) return '#f59e0b'; // amber
    return colors.primary;
  };

  const content = (
    <View
      className={`bg-white dark:bg-gray-800 rounded-xl ${compact ? 'p-3' : 'p-4'} border border-gray-100 dark:border-gray-700`}
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={`${compact ? 'text-sm' : 'text-base'} font-semibold`}
          style={{ color: colors.text }}
        >
          {t('profile.profileCompletion')}
        </Text>
        <Text
          className={`${compact ? 'text-sm' : 'text-base'} font-bold`}
          style={{ color: getProgressColor(completion.percentage) }}
        >
          {completion.percentage}%
        </Text>
      </View>

      <ProgressBar
        progress={completion.percentage}
        color={getProgressColor(completion.percentage)}
        height={compact ? 6 : 8}
      />

      {!compact && (
        <Text
          className="text-sm mt-2"
          style={{ color: colors.textSecondary }}
        >
          {getCompletionMessage(completion.percentage)}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
