import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'cocinia://auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) throw error;

    // On web, browser handles redirect automatically
    if (Platform.OS === 'web') {
      return data;
    }

    // On mobile, handle OAuth with WebBrowser
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
      );

      if (result.type === 'success' && result.url) {
        // Parse the URL to get tokens
        const url = new URL(result.url);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        // Also check in hash fragment
        if (!accessToken && url.hash) {
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');

          if (hashAccessToken && hashRefreshToken) {
            const { data: sessionData, error: sessionError } =
                await supabase.auth.setSession({
                  access_token: hashAccessToken,
                  refresh_token: hashRefreshToken,
                });

            if (sessionError) throw sessionError;
            return sessionData;
          }
        }

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

          if (sessionError) throw sessionError;
          return sessionData;
        }
      }

      // If we got here, something went wrong
      throw new Error('OAuth failed: No tokens received');
    }

    return null;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/reset-password`
        : 'cocinia://auth/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
