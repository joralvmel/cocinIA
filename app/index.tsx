import { Redirect } from 'expo-router';

/**
 * Entry point - redirects to main app
 * Later: check auth state and redirect to (auth) or (app)
 */
export default function Index() {
  // TODO: Add auth check
  // const { session } = useAuth();
  // if (!session) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(app)/home" />;
}
