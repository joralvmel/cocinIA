import { View, Text } from 'react-native';

export default function WeeklyPlanScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-gray-500 dark:text-gray-400 text-lg">
        📅 Weekly Plan
      </Text>
      <Text className="text-gray-400 mt-2 text-sm">
        Plan your meals for the week
      </Text>
    </View>
  );
}
