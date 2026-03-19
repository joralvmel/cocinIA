/**
 * Weekly Plan Generation Service — day-by-day plan generation, base preparations, single meal regeneration
 */
import { FALLBACK_MODELS, WEEKLY_PLAN_AI_CONFIG } from "@/config";
import i18n from "@/i18n";
import {
  type AIPlanMeal,
  AIRecipeResponseSchema,
  type AIWeeklyPlanResponse,
  type BasePreparation,
  type DayOfWeek,
  type PlanMealType,
  type WeeklyPlanForm,
} from "@/types";
import { MEAL_TYPE_ORDER } from "@/utils";
import { type Profile, type ProfileRestriction } from "../profile";
import { type RecipeGenerationResponse } from "./recipeGeneration";
import {
  type Language,
  delay,
  genAI,
  getJsonStructureExample,
  getLanguage,
  normalizeMealTypes,
  parseJsonResponse,
  resolveChipName,
  safetySettings,
  tp,
} from "./shared";

/* ------------------------------------------------------------------ */
/*  Response types                                                     */
/* ------------------------------------------------------------------ */

export interface WeeklyPlanGenerationResponse {
  plan: AIWeeklyPlanResponse | null;
  success: boolean;
  error?: string;
}

export interface DayGenerationResponse {
  meals: AIPlanMeal[];
  success: boolean;
  error?: string;
}

function getUniqueNonEmpty(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function pickRandomItems(items: string[], count: number): string[] {
  if (count <= 0) return [];

  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, Math.min(count, copy.length));
}

function pickRandomOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getBatchReuseInstruction(lang: Language, reuseStrategy?: string): string {
  if (reuseStrategy === 'maximize_reuse') {
    return tp('wpBatchReuseMaximize', lang);
  }
  if (reuseStrategy === 'variety') {
    return tp('wpBatchReuseVariety', lang);
  }
  return tp('wpBatchReuseBalanced', lang);
}

/* ------------------------------------------------------------------ */
/*  Base Preparations prompt                                           */
/* ------------------------------------------------------------------ */

function buildBasePreparationsPrompt(
  form: WeeklyPlanForm,
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language,
): string {
  const t = (key: string, vars?: Record<string, unknown>) =>
    tp(key, lang, vars);
  const config = form.batchConfig!;
  const numDays = form.selectedDays.length;
  const numPreps = config.base_preparations_count || 3;

  const parts: string[] = [
    t("systemIntro"),
    "",
    tp("languageInstruction", lang),
    "",
    tp("batchPreparationRules", lang, {
      numPreps,
      numDays,
      maxPrepTime: config.max_prep_time_minutes || 180,
      reuseStrategy: config.reuse_strategy,
    }),
    "",
  ];

  // Restrictions
  const allergies = restrictions
    .filter((r) => r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);
  const preferences = restrictions
    .filter((r) => !r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);
  if (allergies.length > 0)
    parts.push(`${t("allergiesWarning")}: ${allergies.join(", ")}`);
  if (preferences.length > 0)
    parts.push(`${t("dietaryPreferences")}: ${preferences.join(", ")}`);

  if (profile?.country) parts.push(`${t("country")}: ${profile.country}`);
  if (profile?.currency) parts.push(`${t("currency")}: ${profile.currency}`);

  if (form.cuisines.length > 0) {
    parts.push(
      `${t("cuisineType")}: ${form.cuisines.map(resolveChipName).join(", ")}`,
    );
  }
  if (form.equipment.length > 0) {
    parts.push(
      `${t("availableEquipment")}: ${form.equipment.map(resolveChipName).join(", ")}`,
    );
  }

  if (form.ingredientsToInclude.length > 0) {
    parts.push(
      tp("batchKeyIngredients", lang, {
        list: form.ingredientsToInclude.join(", "),
      }),
    );
  }
  if (form.ingredientsToExclude.length > 0) {
    parts.push(
      `${t("excludeIngredients")}: ${form.ingredientsToExclude.join(", ")}`,
    );
  }

  if (config.notes) {
    parts.push(`${tp("batchNotesLabel", lang)}: ${config.notes}`);
    parts.push(tp("batchNotesReinforce", lang, { notes: config.notes }));
  }
  if (form.specialNotes)
    parts.push(`${tp("specialNotesLabel", lang)}: ${form.specialNotes}`);

  // JSON format example
  parts.push(
    "",
    tp("batchFormatInstruction", lang),
    "",
    `[
  {
    "name": "Pollo deshebrado al chipotle",
    "type": "protein",
    "description": "Pechuga de pollo cocida y deshebrada con adobo de chipotle",
    "recipe": ${getJsonStructureExample(lang)},
    "storage_instructions": "Refrigerar en recipiente hermético hasta 5 días",
    "estimated_time_minutes": 45
  }
]`,
  );

  parts.push("", tp("batchValidTypes", lang));

  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Generate base preparations                                         */
/* ------------------------------------------------------------------ */

async function generateBasePreparations(
  form: WeeklyPlanForm,
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language,
): Promise<BasePreparation[]> {
  const prompt = buildBasePreparationsPrompt(form, profile, restrictions, lang);

  if (__DEV__) {
    console.log("=== BATCH: BASE PREPARATIONS PROMPT ===");
    console.log(prompt);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await delay(2000 * attempt);

      const model = genAI.getGenerativeModel({
        model: FALLBACK_MODELS[0],
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
        },
      });

      const raw = (await model.generateContent(prompt)).response.text();
      const parsed = parseJsonResponse(raw);

      const prepsArray = Array.isArray(parsed)
        ? parsed
        : parsed.preparations || [parsed];
      const validPreps = prepsArray.filter((p: any) => p?.name && p?.type);
      if (validPreps.length === 0) continue;

      return validPreps.map((p: any) => {
        let validatedRecipe = undefined;
        if (p.recipe?.title && p.recipe?.ingredients) {
          try {
            if (p.recipe?.meal_types)
              p.recipe.meal_types = normalizeMealTypes(p.recipe.meal_types);
            validatedRecipe = AIRecipeResponseSchema.parse(p.recipe);
          } catch {
            // Lenient parse — fill missing optional fields
            try {
              validatedRecipe = AIRecipeResponseSchema.parse({
                ...p.recipe,
                meal_types: p.recipe.meal_types || ["lunch"],
                cuisine: p.recipe.cuisine || "other",
                tags: p.recipe.tags || [],
                chef_tips: p.recipe.chef_tips || [],
                storage_instructions: p.recipe.storage_instructions || "",
                variations: p.recipe.variations || [],
                estimated_cost: p.recipe.estimated_cost ?? 0,
                cost_currency: p.recipe.cost_currency || "EUR",
                cost_per_serving: p.recipe.cost_per_serving ?? 0,
              });
            } catch {
              if (__DEV__)
                console.warn(
                  `Base prep "${p.name}" recipe could not be parsed`,
                );
            }
          }
        }
        return {
          name: p.name,
          type: p.type || "other",
          description: p.description || "",
          recipe: validatedRecipe,
          used_in_days: p.used_in_days || [],
          used_in_meals: p.used_in_meals || ["lunch"],
          estimated_time_minutes: p.estimated_time_minutes,
          storage_instructions: p.storage_instructions,
        } as BasePreparation;
      });
    } catch (err: any) {
      console.error(
        `Base preparations attempt ${attempt} failed:`,
        err?.message?.substring(0, 150),
      );
      if (attempt === 3) return [];
    }
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Day plan system prompt                                             */
/* ------------------------------------------------------------------ */

function buildDayPlanSystemPrompt(
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  form: WeeklyPlanForm,
  lang: Language,
): string {
  const t = (key: string, vars?: Record<string, unknown>) =>
    tp(key, lang, vars);

  const parts: string[] = [
    t("systemIntro"),
    tp("wpDayTask", lang),
    "",
    tp("languageInstruction", lang),
    "",
  ];

  // Restrictions
  const allergies = restrictions
    .filter((r) => r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);
  const preferences = restrictions
    .filter((r) => !r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);

  if (allergies.length > 0)
    parts.push(`${t("allergiesWarning")}: ${allergies.join(", ")}`);
  if (preferences.length > 0)
    parts.push(`${t("dietaryPreferences")}: ${preferences.join(", ")}`);
  if (!allergies.length && !preferences.length)
    parts.push(t("noRestrictionsActive"));

  // Profile context
  if (profile) {
    if (profile.country) parts.push(`${t("country")}: ${profile.country}`);
    if (profile.currency) parts.push(`${t("currency")}: ${profile.currency}`);
    if (profile.measurement_system) {
      parts.push(
        `${t("measurementSystem")}: ${profile.measurement_system === "metric" ? t("metric") : t("imperial")}`,
      );
    }
  }

  if (form.dailyCalorieTarget) {
    parts.push(
      tp("wpCalorieTarget", lang, { calories: form.dailyCalorieTarget }),
    );
  }

  // Servings
  const servings = form.servings && form.servings > 1 ? form.servings : 1;
  parts.push(tp("wpServings", lang, { count: servings }));

  if (form.cuisines.length > 0) {
    parts.push(
      `${t("cuisineType")}: ${form.cuisines.map(resolveChipName).join(", ")}`,
    );
  }
  if (form.equipment.length > 0) {
    parts.push(
      `${t("availableEquipment")}: ${form.equipment.map(resolveChipName).join(", ")}`,
    );
  }
  if (form.ingredientsToExclude.length > 0) {
    parts.push(
      `${t("excludeIngredients")}: ${form.ingredientsToExclude.join(", ")}`,
    );
  }

  // Batch cooking
  if (form.batchCookingEnabled && form.batchConfig) {
    parts.push(
      tp("wpBatchCookingMode", lang, {
        strategy: form.batchConfig.reuse_strategy,
      }),
    );
    if (form.batchConfig.notes) {
      parts.push(`${tp("batchNotesLabel", lang)}: ${form.batchConfig.notes}`);
    }
  }

  if (form.specialNotes) {
    parts.push(`${tp("specialNotesLabel", lang)}: ${form.specialNotes}`);
  }

  // Response format
  parts.push(
    "",
    tp("wpResponseFormat", lang),
    "",
    `[
  {
    "meal_type": "breakfast|lunch|dinner|snack",
    "recipe": ${getJsonStructureExample(lang)},
    "estimated_calories": 350
  }
]`,
  );

  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Day user prompt                                                    */
/* ------------------------------------------------------------------ */

function buildDayUserPrompt(
  day: DayOfWeek,
  mealTypes: PlanMealType[],
  cookingTimeMinutes: number,
  favoriteIngredients: string[],
  form: WeeklyPlanForm,
  previousDaysSummary: string,
  lang: Language,
  basePreparations: BasePreparation[] = [],
): string {
  const dayName = i18n.t(`weeklyPlan.days.${day}`, { lng: lang }) as string;
  const parts: string[] = [];

  // Day header
  parts.push(tp("wpGenerateForDay", lang, { day: dayName.toUpperCase() }));
  parts.push(tp("wpMealsToGenerate", lang, { meals: mealTypes.join(", ") }));

  // Calorie consistency rules (per serving)
  if (form.dailyCalorieTarget) {
    const tolerance = Math.max(80, Math.round(form.dailyCalorieTarget * 0.12));
    parts.push(tp("wpCaloriesPerServingRule", lang));
    parts.push(
      tp("wpDailyCaloriesConsistencyRule", lang, {
        calories: form.dailyCalorieTarget,
        tolerance,
        mealCount: mealTypes.length,
      }),
    );
  }

  // Cooking time
  if (
    form.cookingTimeByMealType &&
    Object.keys(form.cookingTimeByMealType).length > 0
  ) {
    const details = mealTypes
      .map(
        (mt) =>
          `${mt}: ${form.cookingTimeByMealType[mt] ?? cookingTimeMinutes} min`,
      )
      .join(", ");
    parts.push(tp("wpMaxCookingTimeDetailed", lang, { details }));
  } else {
    parts.push(tp("wpMaxCookingTime", lang, { minutes: cookingTimeMinutes }));
  }

  // Include ingredients
  if (form.ingredientsToInclude.length > 0) {
    parts.push(
      tp("wpTryIngredients", lang, {
        list: form.ingredientsToInclude.join(", "),
      }),
    );
  }

  // Favorite ingredients
  if (form.useFavoriteIngredients && favoriteIngredients.length > 0) {
    const uniqueFavorites = getUniqueNonEmpty(favoriteIngredients);
    const maxSampleSize = Math.min(4, uniqueFavorites.length);
    const sampleSize =
      maxSampleSize <= 1
        ? maxSampleSize
        : 2 + Math.floor(Math.random() * (maxSampleSize - 1));
    const sampledFavorites = pickRandomItems(uniqueFavorites, sampleSize);

    parts.push(
      tp("preferFavoriteIngredients", lang, {
        list: sampledFavorites.join(", "),
      }),
    );
    parts.push(tp("favoriteSelectionMode", lang));
  }

  // Routine meals
  if (form.routineMeals) {
    const routineMap: Record<string, string | undefined> = {
      breakfast: form.routineMeals.breakfast,
      lunch: form.routineMeals.lunch,
      dinner: form.routineMeals.dinner,
      snack: form.routineMeals.snack,
    };
    for (const mt of mealTypes) {
      const routine = routineMap[mt]?.trim();
      if (routine) {
        const mealLabel = i18n.t(`weeklyPlan.mealTypes.${mt}`, {
          lng: lang,
        }) as string;
        parts.push(tp("wpRoutineMealRotation", lang, { mealLabel, routine }));
      }
    }
  }

  // Quick meal guidance
  if (mealTypes.some((mt) => mt === "breakfast" || mt === "dinner")) {
    parts.push(tp("wpQuickMealGuidance", lang));
  }

  // Reinforce cuisines
  if (form.cuisines.length > 0) {
    const resolvedCuisines = form.cuisines.map(resolveChipName);
    parts.push(
      tp("wpCuisineReminder", lang, { list: resolvedCuisines.join(", ") }),
    );
    if (resolvedCuisines.length > 1) {
      const selectedCuisine = pickRandomOne(resolvedCuisines);
      parts.push(
        tp("selectedCuisineForThisRecipe", lang, { cuisine: selectedCuisine }),
      );
    }
  }

  // Special notes
  if (form.specialNotes) {
    parts.push(
      tp("wpSpecialNotesReminder", lang, { notes: form.specialNotes }),
    );
  }

  // Excluded ingredients
  if (form.ingredientsToExclude.length > 0) {
    parts.push(
      tp("wpForbiddenIngredients", lang, {
        list: form.ingredientsToExclude.join(", "),
      }),
    );
  }

  // Batch cooking assembly
  if (
    form.batchCookingEnabled &&
    basePreparations.length > 0 &&
    mealTypes.includes("lunch")
  ) {
    const prepList = basePreparations
      .map((p, i) => `${i + 1}. ${p.name} (${p.type}): ${p.description}`)
      .join("\n");

    const DAYS_ORDER: DayOfWeek[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const sorted = form.selectedDays
      .slice()
      .sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    const dayIndex = sorted.indexOf(day);
    const totalDays = sorted.length;
    const reuseStrategy = form.batchConfig?.reuse_strategy || 'balanced';
    const reuseInstruction = getBatchReuseInstruction(lang, reuseStrategy);

    // Rotate protein
    const proteinPreps = basePreparations.filter((p) => p.type === "protein");
    const nonProteinPreps = basePreparations.filter(
      (p) => p.type !== "protein",
    );
    const suggestedProtein =
      reuseStrategy === 'maximize_reuse'
        ? proteinPreps[0]?.name
        : proteinPreps.length > 1
          ? proteinPreps[dayIndex % proteinPreps.length]?.name
          : proteinPreps[0]?.name;

    // Build combo suggestion with reuse strategy-aware intensity.
    const comboPreps: string[] = [];
    if (suggestedProtein) comboPreps.push(suggestedProtein);
    if (nonProteinPreps.length > 0) {
      let count = Math.min(2, nonProteinPreps.length);
      if (reuseStrategy === 'maximize_reuse') count = Math.min(1, nonProteinPreps.length);

      for (let i = 0; i < count; i += 1) {
        const idx = reuseStrategy === 'maximize_reuse'
          ? i
          : (dayIndex + i) % nonProteinPreps.length;
        comboPreps.push(nonProteinPreps[idx]?.name);
      }
    }

    const dishFormats = reuseStrategy === 'maximize_reuse'
      ? ["bowl", "wrap/tortilla", "tupper salteado/stir-fry"]
      : [
          "tacos/burritos",
          "ensalada/salad",
          "wrap/tortilla",
          "stir-fry/salteado",
          "pasta",
          "bowl",
          "sándwich/torta",
          "quesadilla",
          "sopa/soup",
          "plato al horno",
        ];
    const suggestedFormat = dishFormats[dayIndex % dishFormats.length];

    const suggestedCombo =
      lang === "es"
        ? `Usa: ${comboPreps.join(" + ")}. Formato sugerido: ${suggestedFormat}.`
        : `Use: ${comboPreps.join(" + ")}. Suggested format: ${suggestedFormat}.`;

    parts.push("");
    parts.push(
      tp("wpBatchAssembly", lang, {
        prepList,
        dayIndex: dayIndex + 1,
        totalDays,
        suggestedProtein: suggestedProtein || "",
        suggestedCombo,
        reuseInstruction,
      }),
    );
  }

  // Previous days
  if (previousDaysSummary) {
    parts.push(tp("wpAvoidRepetition", lang, { titles: previousDaysSummary }));
  }

  parts.push("");
  parts.push(tp("wpReturnJsonOnly", lang));

  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export const weeklyPlanGenerationService = {
  /**
   * Generate a full weekly plan day-by-day
   */
  async generateWeeklyPlan(
    form: WeeklyPlanForm,
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    favoriteIngredients: string[] = [],
    lang: Language = "es",
    onDayProgress?: (day: DayOfWeek) => void | Promise<void>,
  ): Promise<WeeklyPlanGenerationResponse> {
    const normalizedLang = getLanguage(lang);

    try {
      const allMeals: AIPlanMeal[] = [];
      const generatedTitles: string[] = [];
      let basePreparations: BasePreparation[] = [];

      const DAYS_ORDER: DayOfWeek[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const sortedDays = form.selectedDays.sort(
        (a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b),
      );

      // Phase 1: base preparations (batch cooking)
      if (form.batchCookingEnabled && form.batchConfig) {
        if (__DEV__)
          console.log("=== BATCH COOKING: Generating base preparations ===");
        basePreparations = await generateBasePreparations(
          form,
          profile,
          restrictions,
          normalizedLang,
        );
        if (__DEV__)
          console.log(
            `Generated ${basePreparations.length} base preparations:`,
            basePreparations.map((p) => p.name),
          );
        if (basePreparations.length > 0) await delay(1500);
      }

      // Build system prompt once
      const systemPrompt = buildDayPlanSystemPrompt(
        profile,
        restrictions,
        form,
        normalizedLang,
      );

      // Phase 2: generate each day
      for (const day of sortedDays) {
        // Call the progress callback (supports both sync and async)
        const callbackResult = onDayProgress?.(day);
        if (callbackResult instanceof Promise) {
          await callbackResult;
        }

        const dayConfig = form.dayConfigs[day];
        if (!dayConfig) continue;

        const mealsToGenerate = [...dayConfig.meals].sort(
          (a, b) => (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99),
        );
        if (mealsToGenerate.length === 0) continue;

        const userPrompt = buildDayUserPrompt(
          day,
          mealsToGenerate,
          dayConfig.cookingTimeMinutes,
          favoriteIngredients,
          form,
          generatedTitles.join(", "),
          normalizedLang,
          basePreparations,
        );

        const fullPrompt = `${systemPrompt}\n\n${"=".repeat(50)}\n\n${userPrompt}`;

        if (__DEV__) {
          console.log(`=== WEEKLY PLAN: ${day.toUpperCase()} PROMPT ===`);
          console.log(fullPrompt);
        }

        const maxRetries = 5;
        let dayMeals: AIPlanMeal[] | null = null;
        let currentModelIndex = 0;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            if (attempt > 1) {
              const backoff = Math.min(2000 * Math.pow(2, attempt - 2), 16000);
              console.log(
                `Day ${day} retry ${attempt}, waiting ${backoff}ms...`,
              );
              await delay(backoff);
            }

            const modelName =
              FALLBACK_MODELS[currentModelIndex] || FALLBACK_MODELS[0];
            const model = genAI.getGenerativeModel({
              model: modelName,
              safetySettings,
              generationConfig: {
                temperature: WEEKLY_PLAN_AI_CONFIG.temperature,
                maxOutputTokens: WEEKLY_PLAN_AI_CONFIG.perDayTokens,
                responseMimeType: "application/json",
              },
            });

            const rawResponse = (
              await model.generateContent(fullPrompt)
            ).response.text();
            if (!rawResponse) {
              console.warn(`Day ${day} attempt ${attempt}: empty response`);
              continue;
            }

            if (__DEV__) {
              console.log(
                `Day ${day} attempt ${attempt} (${modelName}) raw length: ${rawResponse.length}, first 200:`,
                rawResponse.substring(0, 200),
              );
            }

            const parsed = parseJsonResponse(rawResponse);
            const mealsArray = Array.isArray(parsed)
              ? parsed
              : parsed.meals || [parsed];
            const validMeals = mealsArray.filter(
              (m: any) => m?.recipe?.title && m?.recipe?.ingredients,
            );

            if (validMeals.length === 0) {
              console.warn(`Day ${day} attempt ${attempt}: no valid meals`);
              continue;
            }

            dayMeals = validMeals.map((m: any, index: number) => {
              if (m.recipe?.meal_types && Array.isArray(m.recipe.meal_types)) {
                m.recipe.meal_types = normalizeMealTypes(m.recipe.meal_types);
              }
              const validatedRecipe = AIRecipeResponseSchema.parse(m.recipe);
              return {
                day_of_week: day,
                meal_type: m.meal_type || mealsToGenerate[index] || "lunch",
                recipe: validatedRecipe,
                is_prep_day: false,
                is_external: false,
                estimated_calories:
                  m.estimated_calories || validatedRecipe.nutrition.calories,
              } as AIPlanMeal;
            });

            if (dayMeals && dayMeals.length < mealsToGenerate.length) {
              console.warn(
                `Day ${day}: got ${dayMeals.length}/${mealsToGenerate.length} meals`,
              );
            }
            break;
          } catch (parseError: any) {
            const msg = parseError?.message || String(parseError);
            const isServerError =
              msg.includes("503") ||
              msg.includes("404") ||
              msg.includes("429") ||
              msg.includes("high demand") ||
              msg.includes("no longer available") ||
              msg.includes("rate");
            const errorType = msg.includes("503")
              ? "503"
              : msg.includes("404")
                ? "404"
                : msg.includes("429")
                  ? "429"
                  : "parse";
            console.error(
              `Day ${day} attempt ${attempt} failed (${errorType}):`,
              msg.substring(0, 150),
            );

            if (
              isServerError &&
              currentModelIndex < FALLBACK_MODELS.length - 1
            ) {
              currentModelIndex++;
              console.log(
                `Day ${day}: fallback to ${FALLBACK_MODELS[currentModelIndex]}`,
              );
            }

            if (attempt === maxRetries) {
              if (dayMeals && dayMeals.length > 0) {
                console.warn(`Day ${day}: using partial meals`);
                break;
              }
              return {
                plan: null,
                success: false,
                error: `Failed to generate meals for ${day} after ${maxRetries} attempts`,
              };
            }
          }
        }

        if (dayMeals) {
          allMeals.push(...dayMeals);
          generatedTitles.push(...dayMeals.map((m) => m.recipe.title));
        }

        if (sortedDays.indexOf(day) < sortedDays.length - 1) await delay(1500);
      }

      // Populate used_in_days on base preparations
      if (form.batchCookingEnabled && basePreparations.length > 0) {
        const lunchDays = sortedDays.filter((d) =>
          form.dayConfigs[d]?.meals?.includes("lunch"),
        );
        for (const prep of basePreparations) {
          if (prep.used_in_days.length === 0)
            prep.used_in_days = [...lunchDays];
          if (prep.used_in_meals.length === 0) prep.used_in_meals = ["lunch"];
        }
      }

      const plan: AIWeeklyPlanResponse = {
        plan_name:
          form.planName ||
          `Plan ${new Date(form.startDate || Date.now()).toLocaleDateString()}`,
        meals: allMeals.filter((m) => m.recipe?.title),
        base_preparations: basePreparations,
        total_estimated_calories: allMeals.reduce(
          (sum, m) => sum + (m.estimated_calories || 0),
          0,
        ),
        shopping_summary: [],
        tips: [],
      };

      return { plan, success: true };
    } catch (error) {
      console.error("Weekly plan generation error:", error);
      return {
        plan: null,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error generating plan",
      };
    }
  },

  /**
   * Regenerate a single meal in the plan
   */
  async regenerateSingleMeal(
    day: DayOfWeek,
    mealType: PlanMealType,
    currentPlanMeals: AIPlanMeal[],
    cookingTimeMinutes: number,
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    favoriteIngredients: string[] = [],
    form: WeeklyPlanForm,
    lang: Language = "es",
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);

    const existingTitles = currentPlanMeals
      .filter((m) => m.recipe?.title)
      .map((m) => m.recipe.title);

    // Build a combined prompt
    const t = (key: string, vars?: Record<string, unknown>) =>
      tp(key, normalizedLang, vars);

    // System prompt — reuse the recipe system prompt for single-recipe output
    const systemParts: string[] = [
      t("systemIntro"),
      t("systemTask"),
      "",
      tp("languageInstruction", normalizedLang),
      "",
    ];

    // Restrictions
    const allergies = restrictions
      .filter((r) => r.is_allergy)
      .map((r) => r.custom_value || r.restriction_type);
    const preferences = restrictions
      .filter((r) => !r.is_allergy)
      .map((r) => r.custom_value || r.restriction_type);
    if (allergies.length > 0)
      systemParts.push(`${t("allergiesWarning")}: ${allergies.join(", ")}`);
    if (preferences.length > 0)
      systemParts.push(`${t("dietaryPreferences")}: ${preferences.join(", ")}`);
    if (!allergies.length && !preferences.length)
      systemParts.push(t("noRestrictionsActive"));

    if (profile?.country)
      systemParts.push(`${t("country")}: ${profile.country}`);
    if (profile?.currency)
      systemParts.push(`${t("currency")}: ${profile.currency}`);
    if (profile?.measurement_system) {
      systemParts.push(
        `${t("measurementSystem")}: ${profile.measurement_system === "metric" ? t("metric") : t("imperial")}`,
      );
    }

    systemParts.push(
      "",
      t("jsonInstruction"),
      "",
      t("jsonStructure"),
      "",
      getJsonStructureExample(normalizedLang),
    );
    const systemPrompt = systemParts.join("\n");

    // User prompt
    const dayName = i18n.t(`weeklyPlan.days.${day}`, {
      lng: normalizedLang,
    }) as string;
    const mealName = i18n.t(`weeklyPlan.mealTypes.${mealType}`, {
      lng: normalizedLang,
    }) as string;

    const userParts: string[] = [];
    userParts.push(
      tp("wpRegenMealInstruction", normalizedLang, {
        meal: mealName,
        day: dayName,
        minutes: cookingTimeMinutes,
      }),
    );

    if (existingTitles.length > 0) {
      userParts.push(
        tp("wpDoNotRepeat", normalizedLang, {
          titles: existingTitles.join(", "),
        }),
      );
    }

    if (form.cuisines.length > 0) {
      userParts.push(
        `${t("cuisineType")}: ${form.cuisines.map(resolveChipName).join(", ")}`,
      );
    }

    // Routine meals
    if (form.routineMeals) {
      const routine = (form.routineMeals as any)[mealType]?.trim();
      if (routine) {
        userParts.push(
          tp("wpRoutineMealRotation", normalizedLang, {
            mealLabel: mealName,
            routine,
          }),
        );
      }
    }

    if (mealType === "breakfast" || mealType === "dinner") {
      userParts.push(tp("wpQuickMealGuidance", normalizedLang));
    }

    if (form.specialNotes)
      userParts.push(
        `${tp("specialNotesLabel", normalizedLang)}: ${form.specialNotes}`,
      );
    if (form.servings && form.servings >= 1)
      userParts.push(`${t("servings")}: ${form.servings}`);

    if (form.ingredientsToExclude.length > 0) {
      userParts.push(
        tp("wpForbiddenIngredients", normalizedLang, {
          list: form.ingredientsToExclude.join(", "),
        }),
      );
    }

    const fullPrompt = `${systemPrompt}\n\n${userParts.join(". ")}`;

    // Retry with fallback models
    for (let i = 0; i < FALLBACK_MODELS.length; i++) {
      const modelName = FALLBACK_MODELS[i];
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (i > 0 || attempt > 1) await delay(2000 * attempt);

          const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings,
            generationConfig: {
              temperature: WEEKLY_PLAN_AI_CONFIG.temperature + 0.1,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          });

          const rawResponse = (
            await model.generateContent(fullPrompt)
          ).response.text();
          if (!rawResponse) continue;

          if (__DEV__) {
            console.log(
              `Regenerate meal (${modelName}) attempt ${attempt} raw length:`,
              rawResponse.length,
            );
          }

          const parsed = parseJsonResponse(rawResponse);
          const recipeObj = Array.isArray(parsed)
            ? parsed[0]?.recipe || parsed[0]
            : parsed.recipe || parsed;

          if (recipeObj.meal_types && Array.isArray(recipeObj.meal_types)) {
            recipeObj.meal_types = normalizeMealTypes(recipeObj.meal_types);
          }

          const validated = AIRecipeResponseSchema.parse(recipeObj);
          return { recipe: validated, success: true, rawResponse };
        } catch (error: any) {
          const msg = error?.message || "";
          const isServerError =
            msg.includes("503") || msg.includes("404") || msg.includes("429");
          console.error(
            `Regenerate meal (${modelName}) attempt ${attempt}:`,
            msg.substring(0, 120),
          );
          if (isServerError) break;
          if (i === FALLBACK_MODELS.length - 1 && attempt === 2) {
            return {
              recipe: null,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }
      }
    }

    return { recipe: null, success: false, error: "All models failed" };
  },
};
