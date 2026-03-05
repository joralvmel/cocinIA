import { useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

/**
 * Encapsulates the auto-save-on-back pattern shared by all profile edit screens.
 *
 * Handles both the Android hardware back button and the ScreenHeader back action.
 */
export function useAutoSaveOnBack(
  saveFn: () => Promise<any>,
  deps: unknown[],
) {
  const router = useRouter();
  const isNavigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isNavigating.current) return true;
        isNavigating.current = true;
        saveFn().then(() => {
          router.back();
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  );

  /** Call this from ScreenHeader `onBack` */
  const handleBack = useCallback(async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    await saveFn();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveFn]);

  return { handleBack };
}

