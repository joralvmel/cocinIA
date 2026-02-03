import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect, useRouter, useSegments } from 'expo-router';
import { Loader } from '@/components/ui';
import { useAuth } from '@/contexts';
import { profileService } from '@/services';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] as string;
    const inAuthGroup = currentSegment === '(auth)';
    const inOnboardingGroup = currentSegment === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth screens, check onboarding
      checkOnboardingStatus();
    } else if (isAuthenticated && !inOnboardingGroup && needsOnboarding === null) {
      // Check onboarding status for authenticated users
      checkOnboardingStatus();
    }
  }, [isAuthenticated, loading, segments]);

  const checkOnboardingStatus = async () => {
    setCheckingOnboarding(true);
    try {
      const needs = await profileService.needsOnboarding();
      setNeedsOnboarding(needs);

      if (needs) {
        router.replace('/(onboarding)' as any);
      } else {
        router.replace('/(app)/home');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If error, assume onboarding is needed
      router.replace('/(onboarding)' as any);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Show loading screen while checking authentication or onboarding
  if (loading || checkingOnboarding) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  // Default redirect based on authentication status
  if (isAuthenticated) {
    if (needsOnboarding === true) {
      return <Redirect href={'/(onboarding)' as any} />;
    }
    if (needsOnboarding === false) {
      return <Redirect href="/(app)/home" />;
    }
    // Still determining, show loader
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return <Redirect href="/(auth)/login" />;
}
