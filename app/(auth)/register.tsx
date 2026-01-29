import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
      <Text className="text-primary-600 text-3xl font-bold mb-2">Create account</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-12">
        Join CocinIA
      </Text>

      {/* Placeholder - implement registration later */}
      <View className="w-full gap-4">
        <Pressable className="bg-primary-500 py-4 rounded-xl active:bg-primary-600">
          <Text className="text-white text-center font-semibold text-lg">
            Register
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="py-4">
            <Text className="text-gray-500 text-center">
              Already got an account? <Text className="text-primary-600">Login</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
