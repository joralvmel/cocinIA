import { Stack } from 'expo-router';

export default function ShoppingListLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Shopping List',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
