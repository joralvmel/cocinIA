import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.replace('/(app)/home');
  };

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <Text style={{ color: colors.primary }} className="text-4xl font-bold mb-2">
        {t('auth.loginTitle')}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mb-12">
        {t('auth.loginSubtitle')}
      </Text>

      {/* Placeholder - implement auth later */}
      <View className="w-full gap-4">
        <Pressable
          onPress={handleLogin}
          className="bg-primary-500 py-4 rounded-xl active:bg-primary-600"
        >
          <Text className="text-white text-center font-semibold text-lg">
            {t('auth.login')}
          </Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable
            className="py-4 rounded-xl"
            style={{ borderWidth: 1, borderColor: colors.primary }}
          >
            <Text style={{ color: colors.primary }} className="text-center font-semibold text-lg">
              {t('auth.createAccount')}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
