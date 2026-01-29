import { View, Text } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useThemeStore } from '@/stores/themeStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ProfileScreen() {
  const { mode, setMode } = useThemeStore();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 px-4 pt-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Profile Header */}
      <View className="items-center mb-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <FontAwesome name="user" size={40} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text }} className="text-xl font-bold">
          Guest User
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Sign in to sync your data
        </Text>
      </View>

      {/* Settings Section */}
      <View className="mb-6">
        <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase mb-3 px-1">
          Appearance
        </Text>

        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.text }} className="font-medium mb-3">
            Theme
          </Text>
          <SegmentedButtons
            value={mode}
            onValueChange={(value) => setMode(value as ThemeMode)}
            buttons={[
              {
                value: 'light',
                label: 'Light',
                icon: 'white-balance-sunny',
              },
              {
                value: 'dark',
                label: 'Dark',
                icon: 'moon-waning-crescent',
              },
            ]}
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
      </View>

      {/* Placeholder for more settings */}
      <View className="flex-1 items-center justify-center">
        <Text style={{ color: colors.textMuted }} className="text-sm">
          More settings coming soon
        </Text>
      </View>
    </View>
  );
}
