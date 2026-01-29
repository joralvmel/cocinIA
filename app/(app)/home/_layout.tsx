import { Stack, Link } from 'expo-router';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'CocinIA',
          headerLargeTitle: true,
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable className="mr-4">
                {({ pressed }) => (
                  <FontAwesome
                    name="user-circle"
                    size={26}
                    color={colors.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="recipe/[id]"
        options={{
          title: 'Recipe',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
