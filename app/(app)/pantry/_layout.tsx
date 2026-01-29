import { Stack } from 'expo-router';

export default function PantryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Pantry',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
