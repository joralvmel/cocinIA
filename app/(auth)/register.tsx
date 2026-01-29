import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function RegisterScreen() {
  const { colors } = useAppTheme();

  const handleRegister = () => {
    // TODO: Implement actual registration logic
    router.replace('/(app)/home');
  };

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.primary }} className="text-3xl font-bold mb-2">
        Create account
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mb-12">
        Join CocinIA
      </Text>

      {/* Placeholder - implement registration later */}
      <View className="w-full gap-4">
        <Pressable
          onPress={handleRegister}
          className="bg-primary-500 py-4 rounded-xl active:bg-primary-600"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Register
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="py-4">
            <Text style={{ color: colors.textSecondary }} className="text-center">
              Already got an account?{' '}
              <Text style={{ color: colors.primary }}>Login</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
