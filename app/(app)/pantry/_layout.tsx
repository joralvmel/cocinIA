import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function PantryLayout() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FontAwesome name="archive" size={20} color={colors.primary} />
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.primary }}>
                {t('pantry.title')}
              </Text>
            </View>
          ),
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
