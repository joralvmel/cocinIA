import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.primary }} className="text-3xl font-bold">
        🍳 CocinIA
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mt-2">
        Your AI cooking assistant
      </Text>
      <Text style={{ color: colors.textMuted }} className="mt-8 text-sm">
        Home Screen Placeholder
      </Text>
    </View>
  );
}
