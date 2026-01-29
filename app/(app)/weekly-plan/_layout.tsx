import { Stack } from 'expo-router';

export default function WeeklyPlanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Weekly Plan',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
