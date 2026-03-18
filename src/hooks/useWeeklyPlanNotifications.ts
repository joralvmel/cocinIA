import { generationNotificationsService } from "@/services";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useWeeklyPlanNotifications() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("es") ? "es" : "en") as
    | "es"
    | "en";

  useEffect(() => {
    generationNotificationsService.initialize();
  }, []);

  const showProgressNotification = async (
    day: string,
    completed: number,
    total: number,
  ) => {
    await generationNotificationsService.showWeeklyPlanProgress(
      day,
      completed,
      total,
      currentLang,
    );
  };

  const showCompletionNotification = async (
    planName: string,
    mealCount: number,
  ) => {
    await generationNotificationsService.showWeeklyPlanCompletion(
      planName,
      mealCount,
      currentLang,
    );
  };

  const showErrorNotification = async (errorMessage: string) => {
    await generationNotificationsService.showWeeklyPlanError(
      errorMessage,
      currentLang,
    );
  };

  const clearAllNotifications = async () => {
    await generationNotificationsService.clearAllNotifications();
  };

  return {
    showProgressNotification,
    showCompletionNotification,
    showErrorNotification,
    clearAllNotifications,
  };
}
