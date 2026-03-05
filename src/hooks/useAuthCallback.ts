import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services';

/**
 * Handles OAuth callback token extraction and session setting
 */
export function useAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (Platform.OS === 'web') {
        const hashParams = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(hashParams);
        accessToken = urlParams.get('access_token');
        refreshToken = urlParams.get('refresh_token');
      } else {
        accessToken = params.access_token as string;
        refreshToken = params.refresh_token as string;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          router.replace('/(auth)/login');
          return;
        }

        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  return { loading };
}

