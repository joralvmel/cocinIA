import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Input, Loader, AlertModal, Logo } from '@/components/ui';
import { authService } from '@/services';
import { GoogleIcon } from '@/assets/icons';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // AlertModal states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'info' | 'warning' | 'danger'>('info');
  const [showResetOption, setShowResetOption] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await authService.signInWithEmail(email, password);
      router.replace('/');
    } catch (error: any) {
      let errorMessage = error.message || t('auth.loginError');
      let variant: 'info' | 'warning' | 'danger' = 'danger';
      let showReset = false;

      // Handle common error cases
      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in. Check your inbox.';
        variant = 'warning';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
        variant = 'danger';
        showReset = true;
      }

      setAlertTitle('Login Failed');
      setAlertMessage(errorMessage);
      setAlertVariant(variant);
      setShowResetOption(showReset);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !validateEmail(email)) {
      setAlertTitle('Email Required');
      setAlertMessage('Please enter a valid email address to reset your password.');
      setAlertVariant('warning');
      setShowResetOption(false);
      setAlertVisible(true);
      return;
    }

    setResetPasswordLoading(true);
    setAlertVisible(false);

    try {
      await authService.resetPassword(email);
      setAlertTitle('Check Your Email');
      setAlertMessage('We sent you a password reset link. Please check your email.');
      setAlertVariant('info');
      setShowResetOption(false);
      setAlertVisible(true);
    } catch (error: any) {
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to send reset email. Please try again.');
      setAlertVariant('danger');
      setShowResetOption(false);
      setAlertVisible(true);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle();

      if (Platform.OS !== 'web') {
        if (result) {
          router.replace('/');
        } else {
          setLoading(false);
        }
      }
    } catch (error: any) {
      setAlertTitle('Login Failed');
      setAlertMessage(error.message || t('auth.loginError'));
      setAlertVariant('danger');
      setShowResetOption(false);
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
            <Logo size="xl" />
          </View>
          <Text className="text-4xl font-bold mb-2 text-primary-600 dark:text-primary-400 text-center">
            {t('auth.loginTitle')}
          </Text>
          <Text className="mb-8 text-gray-500 dark:text-gray-400 text-center">
            {t('auth.loginSubtitle')}
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

            <Button
              onPress={handleLogin}
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {t('auth.login')}
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
              onPress={handleGoogleLogin}
              variant="outline"
              size="lg"
              fullWidth
              disabled={loading}
              leftIcon={<GoogleIcon size={20} />}
            >
              {t('auth.continueWithGoogle')}
            </Button>

            <Link href="/(auth)/register" asChild>
              <Button variant="ghost" fullWidth>
                <Text className="text-gray-600 dark:text-gray-400">
                  {t('auth.noAccount')}{' '}
                  <Text className="text-primary-600 dark:text-primary-400 font-semibold">
                    {t('auth.createAccount')}
                  </Text>
                </Text>
              </Button>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Error/Info AlertModal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
        confirmLabel={showResetOption ? 'Reset Password' : 'OK'}
        cancelLabel={showResetOption ? 'Cancel' : undefined}
        onConfirm={showResetOption ? handleResetPassword : () => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
