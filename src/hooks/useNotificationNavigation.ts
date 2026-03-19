import { useRouter } from "expo-router";
import { useEffect } from "react";

const WEEKLY_PLAN_ROUTE = "/(app)/weekly-plan";
const HOME_ROUTE = "/(app)/home";
const handledNotificationIds = new Set<string>();
let initialResponseProcessed = false;

function buildRoute(target: "weekly-plan" | "recipe", status?: string): string {
  const base = target === "weekly-plan" ? WEEKLY_PLAN_ROUTE : HOME_ROUTE;
  if (status === "progress" || status === "completed") {
    return `${base}?openResult=1&status=${status}`;
  }
  return base;
}

/**
 * Handles notification taps and routes users to the right screen.
 * It avoids unnecessary route pushes to prevent visual "jumps".
 */
export function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const handleResponse = (response: any) => {
      const responseId = response?.notification?.request?.identifier as
        | string
        | undefined;
      if (responseId && handledNotificationIds.has(responseId)) return;
      if (responseId) handledNotificationIds.add(responseId);

      const data = response?.notification?.request?.content?.data as
        | { target?: "weekly-plan" | "recipe"; status?: string }
        | undefined;

      if (!data?.target) return;

      const desiredRoute = buildRoute(data.target, data.status);

      router.replace(desiredRoute as any);
    };

    const setup = async () => {
      try {
        const Notifications = await import("expo-notifications");

        // App opened from killed/background state by tapping a notification
        const initialResponse =
          await Notifications.getLastNotificationResponseAsync();
        if (initialResponse && !initialResponseProcessed) {
          initialResponseProcessed = true;
          handleResponse(initialResponse);
          if (
            typeof Notifications.clearLastNotificationResponseAsync ===
            "function"
          ) {
            await Notifications.clearLastNotificationResponseAsync();
          }
        }

        // App already running, user taps notification
        subscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            handleResponse(response);
          },
        );
      } catch {
        // Notifications module may be unavailable in some environments.
      }
    };

    setup();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [router]);
}
