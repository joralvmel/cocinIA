import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { validateEmail } from '@/utils';
import { useAlertModal } from './useAlertModal';

export function useRegisterForm() {
  const { t } = useTranslation();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Alert
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  // Field change handlers (clear errors on change)
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
    },
    [errors.email],
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
    },
    [errors.password],
  );

  const handleConfirmPasswordChange = useCallback(
    (text: string) => {
      setConfirmPassword(text);
      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    },
    [errors.confirmPassword],
  );

  // Register
  const handleRegister = useCallback(async () => {
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

      if (result?.user && !result?.session) {
        // Email confirmation required
        setShouldRedirectToLogin(true);
        showAlert(
          'Registration Successful',
          'Please check your email to confirm your account before logging in.',
          'info',
        );
      } else if (result?.session) {
        router.replace('/');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      let errorMessage = error.message || t('auth.registerError');

      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      }

      setShouldRedirectToLogin(false);
      showAlert('Registration Failed', errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, t, showAlert]);

  // Google signup
  const handleGoogleSignup = useCallback(async () => {
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
      setShouldRedirectToLogin(false);
      showAlert('Registration Failed', error.message || t('auth.registerError'), 'danger');
      setLoading(false);
    }
  }, [t, showAlert]);

  // Alert dismiss
  const handleAlertClose = useCallback(() => {
    hideAlert();
    if (shouldRedirectToLogin) {
      router.replace('/(auth)/login');
    }
  }, [hideAlert, shouldRedirectToLogin]);

  return {
    // Form state
    email,
    password,
    confirmPassword,
    loading,
    errors,

    // Field handlers
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,

    // Actions
    handleRegister,
    handleGoogleSignup,

    // Alert
    alert,
    handleAlertClose,
  };
}

