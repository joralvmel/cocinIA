import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ProfileLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-personal" />
      <Stack.Screen name="edit-nutrition" />
      <Stack.Screen name="edit-preferences" />
      <Stack.Screen name="edit-ingredients" />
      <Stack.Screen name="edit-routine-meals" />
    </Stack>
  );
}
