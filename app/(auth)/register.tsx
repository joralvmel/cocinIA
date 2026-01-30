import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

export default function RegisterScreen() {
  const { t } = useTranslation();

  const handleRegister = () => {
    // TODO: Implement actual registration logic
    router.replace('/(app)/home');
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400">
        {t('auth.registerTitle')}
      </Text>
      <Text className="mb-12 text-gray-500 dark:text-gray-400">
        {t('auth.registerSubtitle')}
      </Text>

      <View className="w-full gap-4">
        <Button onPress={handleRegister} variant="primary" size="lg" fullWidth>
          {t('auth.register')}
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button variant="ghost" fullWidth>
            <Text className="text-gray-500 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Text className="text-primary-600 dark:text-primary-400">{t('auth.login')}</Text>
            </Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
