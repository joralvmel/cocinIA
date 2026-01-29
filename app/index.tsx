import { Redirect } from 'expo-router';

/**
 * Entry point - redirects based on auth state
 * TODO: Add actual auth check with Supabase
 */
export default function Index() {
  // TODO: Add auth check
  // const { session, isLoading } = useAuth();
  // if (isLoading) return <LoadingScreen />;
  // if (session) return <Redirect href="/(app)/home" />;

  // For now, redirect to login
  return <Redirect href="/(auth)/login" />;
}
