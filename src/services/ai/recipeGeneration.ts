/**
 * Recipe Generation Service — single recipe generation & modification
 */
import { AI_CONFIG } from "@/config";
import i18n from "@/i18n";
import {
  AIRecipeResponseSchema,
  type AIRecipeResponse,
  type RecipeSearchForm,
} from "@/types";
import { type Profile, type ProfileRestriction } from "../profile";
import {
  genAI,
  getJsonStructureExample,
  getLanguage,
  normalizeMealTypes,
  parseJsonResponse,
  resolveChipName,
  safetySettings,
  tp,
  tpNested,
  type Language,
} from "./shared";

/* ------------------------------------------------------------------ */
/*  Response types                                                     */
/* ------------------------------------------------------------------ */

export interface RecipeGenerationResponse {
  recipe: AIRecipeResponse | null;
  success: boolean;
  error?: string;
  rawResponse?: string;
}

/* ------------------------------------------------------------------ */
/*  Prompt builders                                                    */
/* ------------------------------------------------------------------ */

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

function buildRecipeSystemPrompt(
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language,
): string {
  const t = (key: string) => tp(key, lang);

  const parts: string[] = [
    t("systemIntro"),
    t("systemTask"),
    "",
    tp("languageInstruction", lang),
    "",
    "=".repeat(50),
    t("restrictionsImportant"),
    t("restrictionsRule"),
    t("restrictionsConditional"),
    t("restrictionsNoAssumptions"),
    "=".repeat(50),
    "",
    t("descriptionRule"),
    "",
    tp("mealTypesRule", lang),
    "",
    t("jsonInstruction"),
    "",
    t("jsonStructure"),
    "",
    getJsonStructureExample(lang),
    "",
    t("qualityStrategyTitle"),
    t("qualityStrategyRule1"),
    t("qualityStrategyRule2"),
    t("qualityStrategyRule3"),
    t("qualityStrategyRule4"),
    "",
    "=".repeat(50),
  ];

  // User context
  if (profile) {
    parts.push(t("userContext"));
    if (profile.country) parts.push(`${t("country")}: ${profile.country}`);
    if (profile.currency) parts.push(`${t("currency")}: ${profile.currency}`);
    if (profile.measurement_system) {
      const system =
        profile.measurement_system === "metric" ? t("metric") : t("imperial");
      parts.push(`${t("measurementSystem")}: ${system}`);
    }
    parts.push("");
  }

  // Restrictions
  const allergies = restrictions
    .filter((r) => r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);
  const preferences = restrictions
    .filter((r) => !r.is_allergy)
    .map((r) => r.custom_value || r.restriction_type);

  if (allergies.length > 0 || preferences.length > 0) {
    if (allergies.length > 0)
      parts.push(`${t("allergiesWarning")}: ${allergies.join(", ")}`);
    if (preferences.length > 0)
      parts.push(`${t("dietaryPreferences")}: ${preferences.join(", ")}`);
  } else {
    parts.push(t("noRestrictionsActive"));
  }

  parts.push("=".repeat(50));
  return parts.join("\n");
}

function buildUserPrompt(
  form: RecipeSearchForm,
  favoriteIngredients: string[],
  lang: Language,
): string {
  const t = (key: string) => tp(key, lang);

  const parts: string[] = [t("requirements")];
  const reqs: string[] = [];

  if (form.prompt) reqs.push(`- ${t("userRequest")}: ${form.prompt}`);

  if (form.ingredientsToUse.length > 0) {
    reqs.push(`- ${t("useIngredients")}: ${form.ingredientsToUse.join(", ")}`);
  }

  if (form.useFavoriteIngredients && favoriteIngredients.length > 0) {
    const uniqueFavorites = getUniqueNonEmpty(favoriteIngredients);
    const maxSampleSize = Math.min(3, uniqueFavorites.length);
    const sampleSize =
      maxSampleSize === 1 ? 1 : 1 + Math.floor(Math.random() * maxSampleSize);
    const sampledFavorites = pickRandomItems(uniqueFavorites, sampleSize);

    reqs.push(
      `- ${tp("preferFavoriteIngredients", lang, { list: sampledFavorites.join(", ") })}`,
    );
    reqs.push(`- ${t("favoriteSelectionMode")}`);
    reqs.push(`  ${t("favoriteIngredientsNote")}`);
  }

  if (form.ingredientsToExclude.length > 0) {
    reqs.push(
      `- ${t("excludeIngredients")}: ${form.ingredientsToExclude.join(", ")}`,
    );
  }

  if (form.mealTypes.length > 0) {
    const names = form.mealTypes.map((m) =>
      i18n.t(`recipeGeneration.mealTypes.${m}`, { lng: lang }),
    );
    reqs.push(`- ${t("mealType")}: ${names.join(", ")}`);
  }

  if (form.servings) reqs.push(`- ${t("servings")}: ${form.servings}`);

  if (form.maxTime)
    reqs.push(`- ${t("maxTime")}: ${form.maxTime} ${t("minutes")}`);

  if (form.maxCalories)
    reqs.push(
      `- ${t("maximum")} ${form.maxCalories} ${t("caloriesPerServing").toLowerCase()}`,
    );

  if (form.cuisines.length > 0) {
    const resolvedCuisines = form.cuisines.map(resolveChipName);
    reqs.push(`- ${t("cuisineType")}: ${resolvedCuisines.join(", ")}`);

    if (form.cuisines.length > 1) {
      const chosenCuisine = pickRandomOne(resolvedCuisines);
      reqs.push(
        `- ${tp("selectedCuisineForThisRecipe", lang, { cuisine: chosenCuisine })}`,
      );
      reqs.push(`  ${t("multipleCuisinesNote")}`);
    }
  }

  if (form.difficulty) {
    reqs.push(
      `- ${t("difficultyLabel")}: ${tpNested("difficultyLevels", form.difficulty, lang)}`,
    );
  }

  if (form.equipment?.length) {
    reqs.push(
      `- ${t("availableEquipment")}: ${form.equipment.map(resolveChipName).join(", ")}`,
    );
    reqs.push(`  ${t("equipmentConstraintNote")}`);
  }

  parts.push(reqs.join("\n"));
  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export const geminiRecipeGenerationService = {
  /**
   * Generate a single recipe from a user form
   */
  async generateRecipe(
    form: RecipeSearchForm,
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    favoriteIngredients: string[] = [],
    lang: Language = "es",
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);
    const zodError = i18n.t("recipeGeneration.zodError", {
      lng: normalizedLang,
    }) as string;
    const unknownError = i18n.t("recipeGeneration.unknownError", {
      lng: normalizedLang,
    }) as string;

    try {
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.model,
        safetySettings,
        generationConfig: {
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
          responseMimeType: "application/json",
        },
      });

      const systemPrompt = buildRecipeSystemPrompt(
        profile,
        restrictions,
        normalizedLang,
      );
      const userPrompt = buildUserPrompt(
        form,
        favoriteIngredients,
        normalizedLang,
      );
      const fullPrompt = `${systemPrompt}\n\n${"=".repeat(50)}\n\n${userPrompt}`;

      if (__DEV__) {
        console.log("=== FULL PROMPT SENT TO GEMINI ===");
        console.log(fullPrompt);
        console.log("=".repeat(50));
      }

      const result = await model.generateContent(fullPrompt);
      const rawResponse = result.response.text();

      if (!rawResponse) {
        return {
          recipe: null,
          success: false,
          error: "No response from Gemini",
        };
      }

      try {
        const parsed = parseJsonResponse(rawResponse);

        if (parsed.meal_types && Array.isArray(parsed.meal_types)) {
          parsed.meal_types = normalizeMealTypes(parsed.meal_types);
        }

        const validated = AIRecipeResponseSchema.parse(parsed);
        return { recipe: validated, success: true, rawResponse };
      } catch (parseError) {
        console.error("Zod validation error:", parseError);
        console.error("Raw response that failed:", rawResponse);
        return { recipe: null, success: false, error: zodError, rawResponse };
      }
    } catch (error) {
      console.error("Recipe Generation Error:", error);
      return {
        recipe: null,
        success: false,
        error: error instanceof Error ? error.message : unknownError,
      };
    }
  },

  /**
   * Modify an existing recipe with a user instruction
   */
  async modifyRecipe(
    currentRecipe: AIRecipeResponse,
    modification: string,
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    lang: Language = "es",
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);
    const t = (key: string) => tp(key, normalizedLang);
    const zodError = i18n.t("recipeGeneration.zodError", {
      lng: normalizedLang,
    }) as string;
    const unknownError = i18n.t("recipeGeneration.unknownError", {
      lng: normalizedLang,
    }) as string;

    try {
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.model,
        safetySettings,
        generationConfig: {
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });

      const systemPrompt = buildRecipeSystemPrompt(
        profile,
        restrictions,
        normalizedLang,
      );

      const userPrompt = `${t("currentRecipe")}:
${JSON.stringify(currentRecipe, null, 2)}

${"=".repeat(50)}

${t("modifyRequest")}: ${modification}

${tp("languageInstruction", normalizedLang)}

${t("returnModified")}`;

      const fullPrompt = `${systemPrompt}\n\n${"=".repeat(50)}\n\n${userPrompt}`;

      if (__DEV__) {
        console.log("=== MODIFICATION PROMPT ===");
        console.log(fullPrompt);
        console.log("=".repeat(50));
      }

      const result = await model.generateContent(fullPrompt);
      const rawResponse = result.response.text();

      if (!rawResponse) {
        return {
          recipe: null,
          success: false,
          error: "No response from Gemini",
        };
      }

      try {
        const parsed = parseJsonResponse(rawResponse);

        if (parsed.meal_types && Array.isArray(parsed.meal_types)) {
          parsed.meal_types = normalizeMealTypes(parsed.meal_types);
        }

        const validated = AIRecipeResponseSchema.parse(parsed);
        return { recipe: validated, success: true, rawResponse };
      } catch (parseError) {
        console.error("Zod validation error in modifyRecipe:", parseError);
        console.error("Raw response that failed:", rawResponse);
        return { recipe: null, success: false, error: zodError, rawResponse };
      }
    } catch (error) {
      console.error("Recipe Modification Error:", error);
      return {
        recipe: null,
        success: false,
        error: error instanceof Error ? error.message : unknownError,
      };
    }
  },
};
