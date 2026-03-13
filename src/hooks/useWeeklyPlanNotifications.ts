import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { notificationChannelsService } from '@/services';

const isExpoGo = Constants.appOwnership === 'expo';
const PROGRESS_UPDATE_COOLDOWN_MS = 1200;

async function getNotificationsModule() {
  if (isExpoGo) return null;
  try {
    const mod = await import('expo-notifications');
    return mod;
  } catch {
    return null;
  }
}

export function useWeeklyPlanNotifications() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith('es') ? 'es' : 'en') as 'es' | 'en';

  const progressNotificationIdRef = useRef<string | null>(null);
  const lastProgressKeyRef = useRef<string>('');
  const lastProgressTsRef = useRef<number>(0);

  useEffect(() => {
    const init = async () => {
      if (isExpoGo) return;

      const Notifications = await getNotificationsModule();
      if (!Notifications) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      await notificationChannelsService.initializeChannels();

      try {
        await Notifications.requestPermissionsAsync();
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    init();
  }, []);

  const showProgressNotification = async (day: string, completed: number, total: number) => {
    if (isExpoGo) return;
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      const percentage = Math.max(0, Math.min(100, Math.round((completed / Math.max(total, 1)) * 100)));
      const progressKey = `${day}-${completed}-${total}-${percentage}`;
      const now = Date.now();

      // Avoid noisy updates when values barely changed.
      if (
          progressKey === lastProgressKeyRef.current ||
          now - lastProgressTsRef.current < PROGRESS_UPDATE_COOLDOWN_MS
      ) {
        return;
      }

      lastProgressKeyRef.current = progressKey;
      lastProgressTsRef.current = now;

      const title = currentLang === 'es' ? 'Generando plan semanal' : 'Generating weekly plan';
      const body =
          currentLang === 'es'
              ? `${day} - ${completed}/${total} (${percentage}%)`
              : `${day} - ${completed}/${total} (${percentage}%)`;

      if (progressNotificationIdRef.current) {
        await Notifications.dismissNotificationAsync(progressNotificationIdRef.current);
      }

      progressNotificationIdRef.current = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: false,
          ...(Platform.OS === 'android' ? { channelId: 'plan-generation-progress' } : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing progress notification:', error);
    }
  };

  const showCompletionNotification = async (planName: string, mealCount: number) => {
    if (isExpoGo) return;
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      if (progressNotificationIdRef.current) {
        await Notifications.dismissNotificationAsync(progressNotificationIdRef.current);
        progressNotificationIdRef.current = null;
      }

      const title = currentLang === 'es' ? 'Plan generado' : 'Plan generated';
      const body =
          currentLang === 'es'
              ? `${planName}\n${mealCount} comidas listas para esta semana`
              : `${planName}\n${mealCount} meals ready for this week`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: false,
          ...(Platform.OS === 'android' ? { channelId: 'plan-generation-completion' } : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing completion notification:', error);
    }
  };

  const showErrorNotification = async (errorMessage: string) => {
    if (isExpoGo) return;
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      if (progressNotificationIdRef.current) {
        await Notifications.dismissNotificationAsync(progressNotificationIdRef.current);
        progressNotificationIdRef.current = null;
      }

      const title = currentLang === 'es' ? 'Error en la generacion' : 'Generation error';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: errorMessage.substring(0, 120),
          sound: false,
          ...(Platform.OS === 'android' ? { channelId: 'plan-generation-error' } : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing error notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (isExpoGo) return;
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      if (progressNotificationIdRef.current) {
        await Notifications.dismissNotificationAsync(progressNotificationIdRef.current);
        progressNotificationIdRef.current = null;
      }
      lastProgressKeyRef.current = '';
      lastProgressTsRef.current = 0;
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return {
    showProgressNotification,
    showCompletionNotification,
    showErrorNotification,
    clearAllNotifications,
  };
}
