import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function RegisterScreen() {
  const { t } = useTranslation();
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
        {t('auth.registerTitle')}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="mb-12">
        {t('auth.registerSubtitle')}
      </Text>

      {/* Placeholder - implement registration later */}
      <View className="w-full gap-4">
        <Pressable
          onPress={handleRegister}
          className="bg-primary-500 py-4 rounded-xl active:bg-primary-600"
        >
          <Text className="text-white text-center font-semibold text-lg">
            {t('auth.register')}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="py-4">
            <Text style={{ color: colors.textSecondary }} className="text-center">
              {t('auth.alreadyHaveAccount')}{' '}
              <Text style={{ color: colors.primary }}>{t('auth.login')}</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
