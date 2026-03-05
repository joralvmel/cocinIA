import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { validateEmail } from '@/utils';
import { useAlertModal } from './useAlertModal';

export function useLoginForm() {
  const { t } = useTranslation();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Alert
  const { alert, showAlert, hideAlert } = useAlertModal();
  const [showResetOption, setShowResetOption] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

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

  // Login
  const handleLogin = useCallback(async () => {
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

      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in. Check your inbox.';
        variant = 'warning';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
        variant = 'danger';
        showReset = true;
      }

      setShowResetOption(showReset);
      showAlert('Login Failed', errorMessage, variant);
    } finally {
      setLoading(false);
    }
  }, [email, password, t, showAlert]);

  // Reset password
  const handleResetPassword = useCallback(async () => {
    if (!email || !validateEmail(email)) {
      setShowResetOption(false);
      showAlert(
        'Email Required',
        'Please enter a valid email address to reset your password.',
        'warning',
      );
      return;
    }

    setResetPasswordLoading(true);
    hideAlert();

    try {
      await authService.resetPassword(email);
      setShowResetOption(false);
      showAlert(
        'Check Your Email',
        'We sent you a password reset link. Please check your email.',
        'info',
      );
    } catch (error: any) {
      setShowResetOption(false);
      showAlert(
        'Error',
        error.message || 'Failed to send reset email. Please try again.',
        'danger',
      );
    } finally {
      setResetPasswordLoading(false);
    }
  }, [email, showAlert, hideAlert]);

  // Google login
  const handleGoogleLogin = useCallback(async () => {
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
      setShowResetOption(false);
      showAlert('Login Failed', error.message || t('auth.loginError'), 'danger');
      setLoading(false);
    }
  }, [t, showAlert]);

  // Alert dismiss handlers
  const handleAlertConfirm = useCallback(() => {
    if (showResetOption) {
      handleResetPassword();
    } else {
      hideAlert();
    }
  }, [showResetOption, handleResetPassword, hideAlert]);

  const handleAlertClose = useCallback(() => {
    hideAlert();
  }, [hideAlert]);

  return {
    // Form state
    email,
    password,
    loading,
    errors,

    // Field handlers
    handleEmailChange,
    handlePasswordChange,

    // Actions
    handleLogin,
    handleGoogleLogin,

    // Alert
    alert,
    showResetOption,
    resetPasswordLoading,
    handleAlertConfirm,
    handleAlertClose,
  };
}

