import type { DayOfWeek, RecipeSearchForm, WeeklyPlanForm } from "@/types";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  type RecipeGenerationResponse,
  type WeeklyPlanGenerationResponse,
} from "./ai";
import { geminiRecipeGenerationService as recipeGenerationService } from "./ai/recipeGeneration";
import { weeklyPlanGenerationService } from "./ai/weeklyPlanGeneration";
import { generationNotificationsService } from "./generationNotifications";
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
  task: (
    reportProgress: (message: string, progress?: number) => Promise<void>,
  ) => Promise<T>,
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
      ? "Starting generation..."
      : "Starting generation...";

  const linkingURI =
    taskType === "weekly-plan"
      ? "cocinia://weekly-plan?openResult=1&status=progress"
      : "cocinia://home?openResult=1&status=progress";

  const updateForeground = async (message: string, progress?: number) => {
    try {
      if (typeof BackgroundService.updateNotification !== "function") return;

      const normalizedProgress =
        typeof progress === "number"
          ? Math.max(0, Math.min(100, Math.round(progress)))
          : undefined;

      await BackgroundService.updateNotification({
        taskDesc: message,
        progressBar:
          typeof normalizedProgress === "number"
            ? {
                max: 100,
                value: normalizedProgress,
                indeterminate: false,
              }
            : {
                max: 100,
                value: 0,
                indeterminate: true,
              },
      });
    } catch {
      // Ignore notification update failures.
    }
  };

  return await new Promise<T>((resolve, reject) => {
    const runTask = async () => {
      try {
        const result = await task(updateForeground);
        resolve(result);
      } catch (error) {
        await updateForeground("Generation failed", 100);
        await new Promise((r) => setTimeout(r, 10000));
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
      linkingURI,
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
        0,
      );

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await recipeGenerationService.generateRecipe(
          form,
          profile,
          restrictions,
          favoriteIngredients,
          lang,
        );

        if (result.success && result.recipe) {
          await reportProgress(
            lang === "es" ? "Receta generada" : "Recipe generated",
            100,
          );
          await generationNotificationsService.showRecipeCompletion(
            result.recipe.title ||
              (lang === "es" ? "Tu receta" : "Your recipe"),
            lang,
          );
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

      await reportProgress(
        lang === "es" ? "Error al generar receta" : "Recipe generation error",
        100,
      );
      const errorMsg =
        lastError ||
        (lang === "es" ? "Error generando receta" : "Error generating recipe");
      await new Promise((r) => setTimeout(r, 1200));
      await generationNotificationsService.showRecipeError(errorMsg, lang);

      return {
        recipe: null,
        success: false,
        error: errorMsg,
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
        5,
      );

      const result = await weeklyPlanGenerationService.generateWeeklyPlan(
        form,
        profile,
        restrictions,
        favoriteIngredients,
        lang,
        async (day) => {
          const pct = Math.round(
            (completedDays / Math.max(totalDays, 1)) * 100,
          );
          const message =
            lang === "es"
              ? `Generando plan ${completedDays}/${totalDays} (${pct}%)`
              : `Generating plan ${completedDays}/${totalDays} (${pct}%)`;

          await reportProgress(message, pct);

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

      if (result.success && result.plan) {
        await reportProgress(
          lang === "es" ? "Plan semanal generado" : "Weekly plan generated",
          100,
        );
        await generationNotificationsService.showWeeklyPlanCompletion(
          result.plan.plan_name || (lang === "es" ? "Tu plan" : "Your plan"),
          result.plan.meals.length,
          lang,
        );
      } else {
        await reportProgress(
          lang === "es"
            ? "Error al generar plan"
            : "Weekly plan generation error",
          100,
        );
        const errorMsg =
          result.error ||
          (lang === "es" ? "Error generando plan" : "Error generating plan");
        await new Promise((r) => setTimeout(r, 1200));
        await generationNotificationsService.showWeeklyPlanError(
          errorMsg,
          lang,
        );
      }

      return result;
    });
  },
};
