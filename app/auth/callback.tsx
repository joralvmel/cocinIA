import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Only run on client side (web) or mobile
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (Platform.OS === 'web') {
        // Get the hash params from URL on web
        const hashParams = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(hashParams);

        accessToken = urlParams.get('access_token');
        refreshToken = urlParams.get('refresh_token');
      } else {
        // On mobile, get params from the route params
        accessToken = params.access_token as string;
        refreshToken = params.refresh_token as string;
      }

      if (accessToken && refreshToken) {
        // Set the session with the tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          router.replace('/(auth)/login');
          return;
        }

        // Successfully authenticated, redirect to home
        router.replace('/(app)/home');
      } else {
        // No tokens found, redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}
