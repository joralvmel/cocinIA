import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-primary-600 text-3xl font-bold">🍳 CocinIA</Text>
      <Text className="text-gray-500 dark:text-gray-400 mt-2">
        Your AI cooking assistant
      </Text>
      <Text className="text-gray-400 mt-8 text-sm">
        Home Screen Placeholder
      </Text>
    </View>
  );
}
