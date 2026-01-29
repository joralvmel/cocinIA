import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function WeeklyPlanScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.textSecondary }} className="text-lg">
        📅 Weekly Plan
      </Text>
      <Text style={{ color: colors.textMuted }} className="mt-2 text-sm">
        Plan your meals for the week
      </Text>
    </View>
  );
}
