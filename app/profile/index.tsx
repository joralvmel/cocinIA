import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-gray-500 dark:text-gray-400 text-lg">
        👤 Your Profile
      </Text>
      <Text className="text-gray-400 mt-2 text-sm">
        Preferences and settings will appear here.
      </Text>
    </View>
  );
}
