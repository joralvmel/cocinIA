import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { profileService } from '@/services';
import { useOnboardingStore } from '@/stores';

export function useOnboardingComplete() {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { displayName, reset } = useOnboardingStore();

  // Complete onboarding when screen loads
  useEffect(() => {
    const completeOnboarding = async () => {
      setCompleting(true);
      try {
        await profileService.completeOnboarding();
        setCompleted(true);
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setCompleting(false);
      }
    };

    completeOnboarding();
  }, []);

  const handleGetStarted = useCallback(() => {
    reset();
    router.replace('/(app)/home');
  }, [reset, router]);

  return {
    completing,
    completed,
    displayName,
    handleGetStarted,
  };
}

