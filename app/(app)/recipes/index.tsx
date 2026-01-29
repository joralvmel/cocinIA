import { View, Text } from 'react-native';

export default function RecipesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-gray-500 dark:text-gray-400 text-lg">
        📖 Recipes
      </Text>
      <Text className="text-gray-400 mt-2 text-sm">
        Browse and discover recipes
      </Text>
    </View>
  );
}
