import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, useRouter, useSegments } from 'expo-router';
import { Loader } from '@/components/ui';
import { useAuth } from '@/contexts';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth screens, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth screens, redirect to home
      router.replace('/(app)/home');
    }
  }, [isAuthenticated, loading, segments]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  // Default redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
