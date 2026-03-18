import Constants from "expo-constants";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

async function getNotificationsModule() {
  if (isExpoGo) return null;
  try {
    const mod = await import("expo-notifications");
    return mod;
  } catch {
    return null;
  }
}

/**
 * Service to create and manage notification channels for Android 8.0+
 */
export const notificationChannelsService = {
  async initializeChannels(): Promise<void> {
    if (Platform.OS !== "android" || isExpoGo) return;

    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    try {
      await Notifications.setNotificationChannelAsync(
        "plan-generation-progress",
        {
          name: "Plan Generation Progress",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: null,
          bypassDnd: false,
          enableVibrate: true,
          enableLights: false,
        },
      );

      await Notifications.setNotificationChannelAsync(
        "plan-generation-completion",
        {
          name: "Plan Generation Complete",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: "#FF231F7C",
          sound: null,
          bypassDnd: true,
          enableVibrate: true,
          enableLights: true,
        },
      );

      await Notifications.setNotificationChannelAsync("plan-generation-error", {
        name: "Plan Generation Errors",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 100, 500],
        lightColor: "#FF231F7C",
        sound: null,
        bypassDnd: true,
        enableVibrate: true,
        enableLights: true,
      });

      await Notifications.setNotificationChannelAsync(
        "recipe-generation-progress",
        {
          name: "Recipe Generation Progress",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 150, 200],
          lightColor: "#FF231F7C",
          sound: null,
          bypassDnd: false,
          enableVibrate: true,
          enableLights: false,
        },
      );

      await Notifications.setNotificationChannelAsync(
        "recipe-generation-completion",
        {
          name: "Recipe Generation Complete",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 400, 200, 400],
          lightColor: "#FF231F7C",
          sound: null,
          bypassDnd: true,
          enableVibrate: true,
          enableLights: true,
        },
      );

      await Notifications.setNotificationChannelAsync(
        "recipe-generation-error",
        {
          name: "Recipe Generation Errors",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 100, 500],
          lightColor: "#FF231F7C",
          sound: null,
          bypassDnd: true,
          enableVibrate: true,
          enableLights: true,
        },
      );
    } catch (error) {
      console.error("Error initializing notification channels:", error);
    }
  },
};
