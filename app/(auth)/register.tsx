import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Input, Loader, AlertModal, Logo } from '@/components/ui';
import { authService } from '@/services';
import { GoogleIcon } from '@/assets/icons';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // AlertModal states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'info' | 'warning' | 'danger'>('info');
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email) {
      newErrors.email = t('auth.invalidEmail');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    if (!password) {
      newErrors.password = t('auth.passwordTooShort');
    } else if (password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await authService.signUpWithEmail(email, password);

      // Check if email confirmation is required
      if (result?.user && !result?.session) {
        // Email confirmation required
        setAlertTitle('Registration Successful');
        setAlertMessage('Please check your email to confirm your account before logging in.');
        setAlertVariant('info');
        setShouldRedirectToLogin(true);
        setAlertVisible(true);
      } else if (result?.session) {
        // Auto-logged in (email confirmation disabled)
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      let errorMessage = error.message || t('auth.registerError');

      // Handle common errors
      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      }

      setAlertTitle('Registration Failed');
      setAlertMessage(errorMessage);
      setAlertVariant('danger');
      setShouldRedirectToLogin(false);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle();

      if (Platform.OS !== 'web') {
        if (result) {
          router.replace('/(app)/home');
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      setAlertTitle('Registration Failed');
      setAlertMessage(error.message || t('auth.registerError'));
      setAlertVariant('danger');
      setShouldRedirectToLogin(false);
      setAlertVisible(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 bg-white dark:bg-gray-900"
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
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
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
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          if (shouldRedirectToLogin) {
            router.replace('/(auth)/login');
          }
        }}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
        confirmLabel="OK"
        onConfirm={() => {
          setAlertVisible(false);
          if (shouldRedirectToLogin) {
            router.replace('/(auth)/login');
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
