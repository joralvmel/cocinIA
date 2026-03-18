import type { DayOfWeek, RecipeSearchForm, WeeklyPlanForm } from "@/types";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
    type RecipeGenerationResponse,
    type WeeklyPlanGenerationResponse,
} from "./ai";
import { geminiRecipeGenerationService as recipeGenerationService } from "./ai/recipeGeneration";
import { weeklyPlanGenerationService } from "./ai/weeklyPlanGeneration";
import type { Profile, ProfileRestriction } from "./profile";

type AppLanguage = "es" | "en";

interface RunRecipeInBackgroundParams {
  form: RecipeSearchForm;
  profile: Profile | null;
  restrictions: ProfileRestriction[];
  favoriteIngredients: string[];
  lang: AppLanguage;
  maxRetries?: number;
  onAttemptFailed?: (
    attempt: number,
    maxRetries: number,
    message: string,
  ) => void | Promise<void>;
}

interface RunWeeklyPlanInBackgroundParams {
  form: WeeklyPlanForm;
  profile: Profile | null;
  restrictions: ProfileRestriction[];
  favoriteIngredients: string[];
  lang: AppLanguage;
  onDayProgress?: (progress: {
    day: DayOfWeek;
    completed: number;
    total: number;
  }) => void | Promise<void>;
}

type BackgroundTaskType = "recipe" | "weekly-plan";

const isExpoGo = Constants.appOwnership === "expo";

function shouldUseBackgroundService(): boolean {
  return Platform.OS === "android" && !isExpoGo;
}

async function runWithOptionalBackground<T>(
  taskType: BackgroundTaskType,
  task: (reportProgress: (message: string) => Promise<void>) => Promise<T>,
): Promise<T> {
  const isAndroidBackgroundSupported = shouldUseBackgroundService();

  if (!isAndroidBackgroundSupported) {
    return task(async () => {
      // No foreground-service notification updates in unsupported environments.
    });
  }

  let BackgroundService: any;
  try {
    const mod = await import("react-native-background-actions");
    BackgroundService = mod?.default;
  } catch (error) {
    console.warn(
      "react-native-background-actions could not be loaded; running in foreground",
      error,
    );
    return task(async () => {
      // Best-effort fallback.
    });
  }

  if (!BackgroundService) {
    return task(async () => {
      // Best-effort fallback.
    });
  }

  if (
    typeof BackgroundService.isRunning === "function" &&
    BackgroundService.isRunning()
  ) {
    throw new Error("Another background generation task is already running");
  }

  const taskTitle =
    taskType === "weekly-plan"
      ? "CocinIA - Weekly plan"
      : "CocinIA - Recipe generation";

  const initialTaskDesc =
    taskType === "weekly-plan"
      ? "Generating weekly plan in background"
      : "Generating recipe in background";

  return await new Promise<T>((resolve, reject) => {
    const runTask = async () => {
      try {
        const result = await task(async (message: string) => {
          try {
            if (typeof BackgroundService.updateNotification === "function") {
              await BackgroundService.updateNotification({ taskDesc: message });
            }
          } catch {
            // Ignore notification update failures.
          }
        });

        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        try {
          if (
            typeof BackgroundService.isRunning === "function" &&
            BackgroundService.isRunning()
          ) {
            await BackgroundService.stop();
          }
        } catch {
          // Ignore stop errors.
        }
      }
    };

    BackgroundService.start(runTask, {
      taskName: taskTitle,
      taskTitle,
      taskDesc: initialTaskDesc,
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#22c55e",
      linkingURI: "cocinia://",
      parameters: {},
      progressBar: {
        max: 100,
        value: 0,
        indeterminate: true,
      },
    }).catch((error: unknown) => {
      reject(error);
    });
  });
}

export const backgroundGenerationService = {
  isBackgroundExecutionSupported(): boolean {
    return shouldUseBackgroundService();
  },

  async generateRecipeWithRetryInBackground({
    form,
    profile,
    restrictions,
    favoriteIngredients,
    lang,
    maxRetries = 3,
    onAttemptFailed,
  }: RunRecipeInBackgroundParams): Promise<RecipeGenerationResponse> {
    return runWithOptionalBackground("recipe", async (reportProgress) => {
      let lastError: string | null = null;

      await reportProgress(
        lang === "es" ? "Generando receta..." : "Generating recipe...",
      );

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await reportProgress(
          lang === "es"
            ? `Intento ${attempt}/${maxRetries}`
            : `Attempt ${attempt}/${maxRetries}`,
        );

        const result = await recipeGenerationService.generateRecipe(
          form,
          profile,
          restrictions,
          favoriteIngredients,
          lang,
        );

        if (result.success && result.recipe) {
          return result;
        }

        lastError =
          result.error ||
          (lang === "es"
            ? "Error generando receta"
            : "Error generating recipe");

        if (onAttemptFailed) {
          await onAttemptFailed(attempt, maxRetries, lastError);
        }
      }

      return {
        recipe: null,
        success: false,
        error:
          lastError ||
          (lang === "es"
            ? "Error generando receta"
            : "Error generating recipe"),
      };
    });
  },

  async generateWeeklyPlanInBackground({
    form,
    profile,
    restrictions,
    favoriteIngredients,
    lang,
    onDayProgress,
  }: RunWeeklyPlanInBackgroundParams): Promise<WeeklyPlanGenerationResponse> {
    return runWithOptionalBackground("weekly-plan", async (reportProgress) => {
      const totalDays = form.selectedDays.length;
      let completedDays = 0;

      await reportProgress(
        lang === "es"
          ? "Generando plan semanal..."
          : "Generating weekly plan...",
      );

      return weeklyPlanGenerationService.generateWeeklyPlan(
        form,
        profile,
        restrictions,
        favoriteIngredients,
        lang,
        async (day) => {
          const message =
            lang === "es"
              ? `Procesando ${day} (${completedDays}/${totalDays})`
              : `Processing ${day} (${completedDays}/${totalDays})`;

          await reportProgress(message);

          if (onDayProgress) {
            await onDayProgress({
              day,
              completed: completedDays,
              total: totalDays,
            });
          }

          completedDays++;
        },
      );
    });
  },
};
