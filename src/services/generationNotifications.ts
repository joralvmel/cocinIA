import { Platform } from "react-native";
import { notificationChannelsService } from "./notificationChannels";

type AppLanguage = "es" | "en";
type ProgressKind = "weekly-plan" | "recipe";

const PROGRESS_UPDATE_COOLDOWN_MS = 1200;

const progressNotificationIdMap: Record<ProgressKind, string | null> = {
  "weekly-plan": null,
  recipe: null,
};

const lastProgressState: Record<ProgressKind, { key: string; ts: number }> = {
  "weekly-plan": { key: "", ts: 0 },
  recipe: { key: "", ts: 0 },
};

let notificationsInitialized = false;
let initPromise: Promise<void> | null = null;

async function getNotificationsModule() {
  try {
    const mod = await import("expo-notifications");
    return mod;
  } catch {
    return null;
  }
}

async function dismissProgressNotification(kind: ProgressKind): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  const id = progressNotificationIdMap[kind];
  if (!id) return;

  try {
    await Notifications.dismissNotificationAsync(id);
  } catch {
    // Best-effort dismiss.
  }

  progressNotificationIdMap[kind] = null;
}

export const generationNotificationsService = {
  async initialize(): Promise<void> {
    if (notificationsInitialized) return;

    if (!initPromise) {
      initPromise = (async () => {
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
          console.error("Error requesting notification permissions:", error);
        }

        notificationsInitialized = true;
      })();
    }

    await initPromise;
  },

  async showWeeklyPlanProgress(
    dayLabel: string,
    completed: number,
    total: number,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    const percentage = Math.max(
      0,
      Math.min(100, Math.round((completed / Math.max(total, 1)) * 100)),
    );
    const progressKey = `${dayLabel}-${completed}-${total}-${percentage}`;
    const now = Date.now();

    if (
      progressKey === lastProgressState["weekly-plan"].key ||
      now - lastProgressState["weekly-plan"].ts < PROGRESS_UPDATE_COOLDOWN_MS
    ) {
      return;
    }

    lastProgressState["weekly-plan"] = { key: progressKey, ts: now };

    const title =
      lang === "es" ? "Generando plan semanal" : "Generating weekly plan";
    const body = `${dayLabel} - ${completed}/${total} (${percentage}%)`;

    await dismissProgressNotification("weekly-plan");

    try {
      progressNotificationIdMap["weekly-plan"] =
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: false,
            data: {
              target: "weekly-plan",
              status: "progress",
            },
            ...(Platform.OS === "android"
              ? { channelId: "plan-generation-progress" }
              : {}),
          },
          trigger: null,
        });
    } catch (error) {
      console.error("Error showing weekly plan progress notification:", error);
    }
  },

  async showWeeklyPlanCompletion(
    planName: string,
    mealCount: number,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await dismissProgressNotification("weekly-plan");

    const title = lang === "es" ? "Plan generado" : "Plan generated";
    const body =
      lang === "es"
        ? `${planName}\n${mealCount} comidas listas para esta semana`
        : `${planName}\n${mealCount} meals ready for this week`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: false,
          data: {
            target: "weekly-plan",
            status: "completed",
          },
          ...(Platform.OS === "android"
            ? { channelId: "plan-generation-completion" }
            : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error(
        "Error showing weekly plan completion notification:",
        error,
      );
    }
  },

  async showWeeklyPlanError(
    errorMessage: string,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await dismissProgressNotification("weekly-plan");

    const title = lang === "es" ? "Error en la generacion" : "Generation error";

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: errorMessage.substring(0, 120),
          sound: false,
          data: {
            target: "weekly-plan",
            status: "error",
          },
          ...(Platform.OS === "android"
            ? { channelId: "plan-generation-error" }
            : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error showing weekly plan error notification:", error);
    }
  },

  async showRecipeProgress(
    stepLabel: string,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    const progressKey = stepLabel.trim().toLowerCase();
    const now = Date.now();

    if (
      progressKey === lastProgressState.recipe.key ||
      now - lastProgressState.recipe.ts < PROGRESS_UPDATE_COOLDOWN_MS
    ) {
      return;
    }

    lastProgressState.recipe = { key: progressKey, ts: now };

    const title = lang === "es" ? "Generando receta" : "Generating recipe";

    await dismissProgressNotification("recipe");

    try {
      progressNotificationIdMap.recipe =
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: stepLabel,
            sound: false,
            data: {
              target: "recipe",
              status: "progress",
            },
            ...(Platform.OS === "android"
              ? { channelId: "recipe-generation-progress" }
              : {}),
          },
          trigger: null,
        });
    } catch (error) {
      console.error("Error showing recipe progress notification:", error);
    }
  },

  async showRecipeCompletion(
    recipeTitle: string,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await dismissProgressNotification("recipe");

    const title = lang === "es" ? "Receta generada" : "Recipe generated";
    const body =
      recipeTitle ||
      (lang === "es" ? "Tu receta ya esta lista" : "Your recipe is ready");

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: false,
          data: {
            target: "recipe",
            status: "completed",
          },
          ...(Platform.OS === "android"
            ? { channelId: "recipe-generation-completion" }
            : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error showing recipe completion notification:", error);
    }
  },

  async showRecipeError(
    errorMessage: string,
    lang: AppLanguage,
  ): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await dismissProgressNotification("recipe");

    const title =
      lang === "es" ? "Error al generar receta" : "Recipe generation error";

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: errorMessage.substring(0, 120),
          sound: false,
          data: {
            target: "recipe",
            status: "error",
          },
          ...(Platform.OS === "android"
            ? { channelId: "recipe-generation-error" }
            : {}),
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error showing recipe error notification:", error);
    }
  },

  async clearAllNotifications(): Promise<void> {
    await this.initialize();
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      await dismissProgressNotification("weekly-plan");
      await dismissProgressNotification("recipe");

      lastProgressState["weekly-plan"] = { key: "", ts: 0 };
      lastProgressState.recipe = { key: "", ts: 0 };

      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },
};
