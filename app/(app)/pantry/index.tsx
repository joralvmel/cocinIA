import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function PantryScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.textSecondary }} className="text-lg">
        🥫 Pantry
      </Text>
      <Text style={{ color: colors.textMuted }} className="mt-2 text-sm">
        Manage your pantry inventory
      </Text>
    </View>
  );
}
