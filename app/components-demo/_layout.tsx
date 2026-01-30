import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { brandColors } from '@/constants/theme';

export default function ComponentsDemoLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Components Demo',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-2 mr-2">
              <FontAwesome
                name="arrow-left"
                size={20}
                color={isDark ? brandColors.primary[400] : brandColors.primary[600]}
              />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
