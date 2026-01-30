import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, DividerWithText } from '@/components/ui';

export default function LoginScreen() {
  const { t } = useTranslation();

  const handleLogin = () => {
    // TODO: Implement actual login logic
    router.replace('/(app)/home');
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-gray-900">
      <Text className="text-4xl font-bold mb-2 text-primary-600 dark:text-primary-400">
        {t('auth.loginTitle')}
      </Text>
      <Text className="mb-12 text-gray-500 dark:text-gray-400">
        {t('auth.loginSubtitle')}
      </Text>

      <View className="w-full gap-4">
        <Button onPress={handleLogin} variant="primary" size="lg" fullWidth>
          {t('auth.login')}
        </Button>

        <DividerWithText text={t('common.or')} />

        <Link href="/(auth)/register" asChild>
          <Button variant="outline" size="lg" fullWidth>
            {t('auth.createAccount')}
          </Button>
        </Link>
      </View>
    </View>
  );
}
