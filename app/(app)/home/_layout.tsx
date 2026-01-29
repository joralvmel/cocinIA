import { Stack, Link } from 'expo-router';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeLayout() {
  return (
    <Stack>
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
                    color="#16a34a"
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
        }}
      />
    </Stack>
  );
}
