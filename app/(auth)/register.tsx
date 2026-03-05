import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Divider, Input, Loader, AlertModal, Logo } from '@/components/ui';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { GoogleIcon } from '@/assets/icons';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const {
    email,
    password,
    confirmPassword,
    loading,
    errors,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleRegister,
    handleGoogleSignup,
    alert,
    handleAlertClose,
  } = useRegisterForm();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md mx-auto">
            <View className="items-center mb-6">
              <Logo size="lg" />
            </View>
            <Text className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400 text-center">
              {t('auth.registerTitle')}
            </Text>
            <Text className="mb-8 text-gray-500 dark:text-gray-400 text-center">
              {t('auth.registerSubtitle')}
            </Text>

            <View className="w-full gap-4">
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="••••••••"
                secureTextEntry
                error={errors.confirmPassword}
              />

              <Button
                onPress={handleRegister}
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {t('auth.register')}
              </Button>

              <View className="my-2">
                <Divider />
                <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-white dark:bg-gray-900">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common.or')}
                  </Text>
                </View>
              </View>

              <Button
                onPress={handleGoogleSignup}
                variant="outline"
                size="lg"
                fullWidth
                disabled={loading}
                leftIcon={<GoogleIcon size={20} />}
              >
                {t('auth.continueWithGoogle')}
              </Button>

              <Link href="/(auth)/login" asChild>
                <Button variant="ghost" fullWidth>
                  <Text className="text-gray-600 dark:text-gray-400">
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Text className="text-primary-600 dark:text-primary-400 font-semibold">
                      {t('auth.login')}
                    </Text>
                  </Text>
                </Button>
              </Link>
            </View>
          </View>
        </ScrollView>

        {/* Success/Error AlertModal */}
        <AlertModal
          visible={alert.visible}
          onClose={handleAlertClose}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
          confirmLabel="OK"
          onConfirm={handleAlertClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
