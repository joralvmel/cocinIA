import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
      <Text className="text-primary-600 text-4xl font-bold mb-2">CocinIA</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-12">
        Your AI cooking assistant
      </Text>

      {/* Placeholder - implement auth later */}
      <View className="w-full gap-4">
        <Pressable className="bg-primary-500 py-4 rounded-xl active:bg-primary-600">
          <Text className="text-white text-center font-semibold text-lg">
            Login
          </Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="border border-primary-500 py-4 rounded-xl active:bg-primary-50">
            <Text className="text-primary-600 text-center font-semibold text-lg">
              Create account
            </Text>
          </Pressable>
        </Link>

        {/* Temp: skip to app */}
        <Link href="/(app)/home" asChild>
          <Pressable className="py-4">
            <Text className="text-gray-400 text-center">
              Continue without an account
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
