import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import i18n from '@/i18n';
import { AIRecipeResponseSchema, type AIRecipeResponse, type RecipeSearchForm, type MealType } from '@/types';
import {
  type WeeklyPlanForm,
  type DayOfWeek,
  type PlanMealType,
  type AIPlanMeal,
  AIPlanMealSchema,
  type AIWeeklyPlanResponse,
  type BasePreparation,
  BasePreparationSchema,
} from '@/types';
import { type Profile, type ProfileRestriction } from './profile';
import { AI_CONFIG, WEEKLY_PLAN_AI_CONFIG, FALLBACK_MODELS } from '@/config';
import { MEAL_TYPE_ORDER } from '@/utils';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

// Safety settings - allow food-related content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export interface RecipeGenerationResponse {
  recipe: AIRecipeResponse | null;
  success: boolean;
  error?: string;
  rawResponse?: string;
}

type Language = 'es' | 'en';

const SUPPORTED_LANGUAGES: Language[] = ['es', 'en'];

function getLanguage(lang: string): Language {
  const normalizedLang = lang.startsWith('es') ? 'es' : lang.startsWith('en') ? 'en' : 'en';
  return SUPPORTED_LANGUAGES.includes(normalizedLang as Language) ? normalizedLang as Language : 'en';
}

function getPromptTranslation(key: string, lang: Language): string {
  return i18n.t(`recipeGeneration.prompt.${key}` as any, { lng: lang }) as string;
}

function getNestedPromptTranslation(key: string, subKey: string, lang: Language): string {
  return i18n.t(`recipeGeneration.prompt.${key}.${subKey}` as any, { lng: lang }) as string;
}

/**
 * Transform invalid meal_types to valid ones with intelligent mapping
 */
function normalizeMealTypes(mealTypes: string[]): MealType[] {
  const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  // Mapping of common invalid values to valid ones
  const mapping: Record<string, MealType> = {
    'side dish': 'lunch',
    'side': 'lunch',
    'condiment': 'lunch',
    'sauce': 'lunch',
    'appetizer': 'snack',
    'starter': 'snack',
    'main course': 'dinner',
    'main': 'dinner',
    'brunch': 'breakfast',
    'accompaniment': 'lunch',
  };

  const normalized = mealTypes
      .map(type => {
        const lowerType = type.toLowerCase().trim();

        // If it's already valid, return it
        if (validMealTypes.includes(lowerType as MealType)) {
          return lowerType as MealType;
        }

        // Try to map invalid value
        if (mapping[lowerType]) {
          console.warn(`Normalizing meal_type "${type}" to "${mapping[lowerType]}"`);
          return mapping[lowerType];
        }

        // Default fallback
        console.warn(`Unknown meal_type "${type}", defaulting to "lunch"`);
        return 'lunch' as MealType;
      })
      .filter((type, index, self) => self.indexOf(type) === index); // Remove duplicates

  // Ensure at least one meal type
  return normalized.length > 0 ? normalized : ['lunch'];
}

function getJsonStructureExample(lang: Language): string {
  const descriptionHint = lang === 'es'
      ? 'Descripción breve de máximo 15 palabras'
      : 'Brief description of max 15 words';

  const mealTypesNote = lang === 'es'
      ? '// CRÍTICO: meal_types SOLO puede ser: "breakfast", "lunch", "dinner", "snack", "dessert"'
      : '// CRITICAL: meal_types can ONLY be: "breakfast", "lunch", "dinner", "snack", "dessert"';

  return `{
  "title": "Recipe name",
  "description": "${descriptionHint}",
  "ingredients": [
    { "name": "ingredient", "quantity": 2, "unit": "units", "notes": "optional", "is_optional": false }
  ],
  "steps": [
    { "step_number": 1, "instruction": "Detailed step", "duration_minutes": 5, "tip": "optional tip" }
  ],
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "total_time_minutes": 45,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "nutrition": {
    "calories": 350,
    "protein_g": 25,
    "carbs_g": 30,
    "fat_g": 15,
    "fiber_g": 5,
    "sugar_g": 8,
    "sodium_mg": 400
  },
  "estimated_cost": 12.50,
  "cost_currency": "USD",
  "cost_per_serving": 3.12,
  "meal_types": ["lunch", "dinner"],
  ${mealTypesNote}
  "cuisine": "mexican",
  "tags": ["quick", "healthy"],
  "chef_tips": ["Tip 1", "Tip 2"],
  "storage_instructions": "Store in refrigerator for up to 3 days",
  "variations": ["Variation 1", "Variation 2"]
}`;
}

/**
 * Build the system prompt with improved structure and clearer instructions
 */
function buildRecipeSystemPrompt(
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);

  const mealTypesRule = lang === 'es'
      ? `REGLA CRÍTICA DE meal_types:
El campo "meal_types" SOLO puede contener estos valores EXACTOS (sin excepciones):
• "breakfast" - para desayunos
• "lunch" - para comidas/almuerzos (también para salsas, acompañamientos, guarniciones)
• "dinner" - para cenas (también para platos principales)
• "snack" - para meriendas, aperitivos, entrantes
• "dessert" - para postres

NO INVENTES otros valores como "side dish", "condiment", "appetizer", "main course", etc.
Si es una salsa o acompañamiento, usa "lunch" o "dinner" según cuándo se sirva.`
      : `CRITICAL meal_types RULE:
The "meal_types" field can ONLY contain these EXACT values (no exceptions):
• "breakfast" - for breakfast dishes
• "lunch" - for lunch meals (also for sauces, sides, accompaniments)
• "dinner" - for dinner meals (also for main courses)
• "snack" - for snacks, appetizers, starters
• "dessert" - for desserts

DO NOT INVENT other values like "side dish", "condiment", "appetizer", "main course", etc.
If it's a sauce or side, use "lunch" or "dinner" depending on when it's served.`;

  const parts: string[] = [
    t('systemIntro'),
    t('systemTask'),
    '',
    lang === 'es'
      ? 'IDIOMA: Genera TODO el contenido de la receta en ESPAÑOL (título, descripción, ingredientes, pasos, consejos, etc.)'
      : 'LANGUAGE: Generate ALL recipe content in ENGLISH (title, description, ingredients, steps, tips, etc.)',
    '',
    '='.repeat(50),
    t('restrictionsImportant'),
    t('restrictionsRule'),
    t('restrictionsConditional'),
    t('restrictionsNoAssumptions'),
    '='.repeat(50),
    '',
    t('descriptionRule'),
    '',
    mealTypesRule,
    '',
    t('jsonInstruction'),
    '',
    t('jsonStructure'),
    '',
    getJsonStructureExample(lang),
    '',
    '='.repeat(50),
  ];

  // Add user context
  if (profile) {
    parts.push(t('userContext'));

    if (profile.country) {
      parts.push(`${t('country')}: ${profile.country}`);
    }
    if (profile.currency) {
      parts.push(`${t('currency')}: ${profile.currency}`);
    }
    if (profile.measurement_system) {
      parts.push(`${t('measurementSystem')}: ${profile.measurement_system === 'metric' ? t('metric') : t('imperial')}`);
    }

    parts.push('');
  }

  // Handle restrictions with conditional logic
  const allergies = restrictions.filter(r => r.is_allergy).map(r => r.custom_value || r.restriction_type);
  const preferences = restrictions.filter(r => !r.is_allergy).map(r => r.custom_value || r.restriction_type);

  if (allergies.length > 0 || preferences.length > 0) {
    if (allergies.length > 0) {
      parts.push(`${t('allergiesWarning')}: ${allergies.join(', ')}`);
    }
    if (preferences.length > 0) {
      parts.push(`${t('dietaryPreferences')}: ${preferences.join(', ')}`);
    }
  } else {
    parts.push(t('noRestrictionsActive'));
  }

  parts.push('='.repeat(50));

  return parts.join('\n');
}

/**
 * Resolve a chip ID to a human-readable name.
 * Standard IDs (e.g. "mexican") are returned as-is.
 * Custom IDs with "custom:" prefix have the name extracted.
 */
function resolveChipName(id: string): string {
  if (id.startsWith('custom:')) {
    return id.substring('custom:'.length);
  }
  return id;
}

/**
 * Build user prompt with clear formatting
 */
function buildUserPrompt(
    form: RecipeSearchForm,
    favoriteIngredients: string[] = [],
    lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);

  const parts: string[] = [t('requirements')];
  const requirements: string[] = [];

  // User's free-text prompt
  if (form.prompt) {
    requirements.push(`- ${t('userRequest')}: ${form.prompt}`);
  }


  // Ingredients to use
  if (form.ingredientsToUse.length > 0) {
    requirements.push(`- ${t('useIngredients')}: ${form.ingredientsToUse.join(', ')}`);
  }

  // Favorite ingredients preference
  if (form.useFavoriteIngredients && favoriteIngredients.length > 0) {
    const favNote = lang === 'es'
        ? `- Preferir usar estos ingredientes favoritos: ${favoriteIngredients.join(', ')}`
        : `- Prefer using these favorite ingredients: ${favoriteIngredients.join(', ')}`;
    requirements.push(favNote);
  }

  // Ingredients to exclude
  if (form.ingredientsToExclude.length > 0) {
    requirements.push(`- ${t('excludeIngredients')}: ${form.ingredientsToExclude.join(', ')}`);
  }

  // Meal types
  if (form.mealTypes.length > 0) {
    const mealNames = form.mealTypes.map(m => i18n.t(`recipeGeneration.mealTypes.${m}`, { lng: lang }));
    requirements.push(`- ${t('mealType')}: ${mealNames.join(', ')}`);
  }

  // Servings
  if (form.servings) {
    requirements.push(`- ${t('servings')}: ${form.servings}`);
  }

  // Maximum time
  if (form.maxTime) {
    requirements.push(`- ${t('maxTime')}: ${form.maxTime} ${t('minutes')}`);
  }

  // Maximum calories
  if (form.maxCalories) {
    requirements.push(`- ${t('maximum')} ${form.maxCalories} ${t('caloriesPerServing').toLowerCase()}`);
  }

  // Cuisine types
  if (form.cuisines.length > 0) {
    const cuisineNames = form.cuisines.map(resolveChipName);
    requirements.push(`- ${t('cuisineType')}: ${cuisineNames.join(', ')}`);
  }

  // Difficulty
  if (form.difficulty) {
    requirements.push(`- ${t('difficultyLabel')}: ${getNestedPromptTranslation('difficultyLevels', form.difficulty, lang)}`);
  }

  // Available equipment
  if (form.equipment && form.equipment.length > 0) {
    const equipmentNames = form.equipment.map(resolveChipName);
    requirements.push(`- ${t('availableEquipment')}: ${equipmentNames.join(', ')}`);
  }

  parts.push(requirements.join('\n'));
  return parts.join('\n');
}

/**
 * Simple delay helper for retry backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to repair truncated JSON from the AI.
 * When the model runs out of tokens mid-response, the JSON is cut off.
 * This tries to close open brackets/braces to recover partial data.
 */
function tryRepairTruncatedJson(text: string): string | null {
  let json = text.trim();

  // Count unclosed brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (const ch of json) {
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // If already balanced, no repair needed
  if (openBraces === 0 && openBrackets === 0) return null;

  // Try to find the last complete object in an array
  // Look for the last "}," or "}" that would end a complete meal object
  const lastCompleteObj = json.lastIndexOf('},');
  if (lastCompleteObj > 0 && openBrackets > 0) {
    // Cut after the last complete object and close the array
    json = json.substring(0, lastCompleteObj + 1);
    // Close any remaining open brackets
    for (let i = 0; i < openBrackets; i++) json += ']';
    // Recount to verify
    try {
      JSON.parse(json);
      return json;
    } catch { /* fall through to brute force */ }
  }

  // Brute-force: close all open braces/brackets
  // First remove any trailing partial key/value (after last comma or colon)
  json = json.replace(/,\s*"[^"]*"?\s*:?\s*[^,}\]]*$/, '');
  json = json.replace(/,\s*$/, '');

  // Re-count after trimming
  openBraces = 0;
  openBrackets = 0;
  inString = false;
  escapeNext = false;
  for (const ch of json) {
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  for (let i = 0; i < openBraces; i++) json += '}';
  for (let i = 0; i < openBrackets; i++) json += ']';

  try {
    JSON.parse(json);
    return json;
  } catch {
    return null;
  }
}

/**
 * Sanitize common JSON issues from AI responses (trailing commas, etc.)
 */
function sanitizeJson(text: string): string {
  // Remove any BOM or zero-width characters
  let cleaned = text.replace(/[\uFEFF\u200B]/g, '');
  // Remove trailing commas before } or ] (with potential whitespace/newlines)
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  // Remove double commas
  cleaned = cleaned.replace(/,\s*,/g, ',');
  return cleaned;
}

/**
 * Extract JSON from a response that might contain markdown code blocks
 */
function extractJsonFromResponse(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return sanitizeJson(jsonMatch[1].trim());
  }

  // Try to find a JSON array first (weekly plan returns arrays)
  const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    return sanitizeJson(jsonArrayMatch[0]);
  }

  // If no array, try to find JSON object directly
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return sanitizeJson(jsonObjectMatch[0]);
  }

  return sanitizeJson(text);
}

/**
 * Gemini Recipe Generation Service
 */
export const geminiRecipeGenerationService = {
  async generateRecipe(
      form: RecipeSearchForm,
      profile: Profile | null,
      restrictions: ProfileRestriction[],
      favoriteIngredients: string[] = [],
      lang: Language = 'es'
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);
    const zodError = i18n.t('recipeGeneration.zodError', { lng: normalizedLang }) as string;
    const unknownError = i18n.t('recipeGeneration.unknownError', { lng: normalizedLang }) as string;

    try {
      // Create a fresh model instance for each request
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.model,
        safetySettings,
        generationConfig: {
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
          responseMimeType: 'application/json',
        },
      });

      const systemPrompt = buildRecipeSystemPrompt(profile, restrictions, normalizedLang);
      const userPrompt = buildUserPrompt(form, favoriteIngredients, normalizedLang);

      // Combine prompts with clear separation
      const fullPrompt = `${systemPrompt}\n\n${'='.repeat(50)}\n\n${userPrompt}`;

      // Debug log (remove in production)
      if (__DEV__) {
        console.log('=== FULL PROMPT SENT TO GEMINI ===');
        console.log(fullPrompt);
        console.log('='.repeat(50));
      }

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const rawResponse = response.text();

      if (!rawResponse) {
        return {
          recipe: null,
          success: false,
          error: 'No response from Gemini',
        };
      }

      try {
        // Since responseMimeType is 'application/json', try direct parse first
        let parsed: any;
        try {
          parsed = JSON.parse(sanitizeJson(rawResponse));
        } catch {
          // Fallback: extract and sanitize
          const jsonText = extractJsonFromResponse(rawResponse);
          try {
            parsed = JSON.parse(jsonText);
          } catch {
            // Last resort: try repair
            const repaired = tryRepairTruncatedJson(jsonText);
            if (repaired) {
              parsed = JSON.parse(repaired);
            } else {
              throw new Error('JSON parse failed after all attempts');
            }
          }
        }

        // Normalize meal_types before validation to handle AI mistakes
        if (parsed.meal_types && Array.isArray(parsed.meal_types)) {
          parsed.meal_types = normalizeMealTypes(parsed.meal_types);
        }

        const validated = AIRecipeResponseSchema.parse(parsed);

        return {
          recipe: validated,
          success: true,
          rawResponse,
        };
      } catch (parseError) {
        console.error('Zod validation error:', parseError);
        console.error('Raw response that failed:', rawResponse);
        return {
          recipe: null,
          success: false,
          error: zodError,
          rawResponse,
        };
      }
    } catch (error) {
      console.error('Recipe Generation Error:', error);

      return {
        recipe: null,
        success: false,
        error: error instanceof Error ? error.message : unknownError,
      };
    }
  },

  async modifyRecipe(
      currentRecipe: AIRecipeResponse,
      modification: string,
      profile: Profile | null,
      restrictions: ProfileRestriction[],
      lang: Language = 'es'
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);
    const t = (key: string) => getPromptTranslation(key, normalizedLang);
    const zodError = i18n.t('recipeGeneration.zodError', { lng: normalizedLang }) as string;
    const unknownError = i18n.t('recipeGeneration.unknownError', { lng: normalizedLang }) as string;

    try {
      // Create a fresh model instance
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.model,
        safetySettings,
        generationConfig: {
          temperature: AI_CONFIG.temperature,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
          responseMimeType: 'application/json',
        },
      });

      const systemPrompt = buildRecipeSystemPrompt(profile, restrictions, normalizedLang);

      const langInstruction = normalizedLang === 'es'
          ? 'IDIOMA: Genera TODO el contenido de la receta en ESPAÑOL.'
          : 'LANGUAGE: Generate ALL recipe content in ENGLISH.';

      const userPrompt = `${t('currentRecipe')}:
${JSON.stringify(currentRecipe, null, 2)}

${'='.repeat(50)}

${t('modifyRequest')}: ${modification}

${langInstruction}

${t('returnModified')}`;

      const fullPrompt = `${systemPrompt}\n\n${'='.repeat(50)}\n\n${userPrompt}`;

      // Debug log (remove in production)
      if (__DEV__) {
        console.log('=== MODIFICATION PROMPT ===');
        console.log(fullPrompt);
        console.log('='.repeat(50));
      }

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const rawResponse = response.text();

      if (!rawResponse) {
        return {
          recipe: null,
          success: false,
          error: 'No response from Gemini',
        };
      }

      try {
        // Since responseMimeType is 'application/json', try direct parse first
        let parsed: any;
        try {
          parsed = JSON.parse(sanitizeJson(rawResponse));
        } catch {
          const jsonText = extractJsonFromResponse(rawResponse);
          try {
            parsed = JSON.parse(jsonText);
          } catch {
            const repaired = tryRepairTruncatedJson(jsonText);
            if (repaired) {
              parsed = JSON.parse(repaired);
            } else {
              throw new Error('JSON parse failed after all attempts');
            }
          }
        }

        // Normalize meal_types before validation
        if (parsed.meal_types && Array.isArray(parsed.meal_types)) {
          parsed.meal_types = normalizeMealTypes(parsed.meal_types);
        }

        const validated = AIRecipeResponseSchema.parse(parsed);

        return {
          recipe: validated,
          success: true,
          rawResponse,
        };
      } catch (parseError) {
        console.error('Zod validation error in modifyRecipe:', parseError);
        console.error('Raw response that failed:', rawResponse);
        return {
          recipe: null,
          success: false,
          error: zodError,
          rawResponse,
        };
      }
    } catch (error) {
      console.error('Recipe Modification Error:', error);
      return {
        recipe: null,
        success: false,
        error: error instanceof Error ? error.message : unknownError,
      };
    }
  },
};

/* ================================================================== */
/*  Weekly Plan Generation Service                                     */
/* ================================================================== */

/**
 * Build prompt to generate base preparations for batch cooking
 */
function buildBasePreparationsPrompt(
  form: WeeklyPlanForm,
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);
  const config = form.batchConfig!;
  const numDays = form.selectedDays.length;
  const numPreps = config.base_preparations_count || 3;

  const parts: string[] = [
    t('systemIntro'),
    '',
    lang === 'es'
      ? `IDIOMA: Genera TODO el contenido en ESPAÑOL.`
      : `LANGUAGE: Generate ALL content in ENGLISH.`,
    '',
    lang === 'es'
      ? `Tu tarea es generar ${numPreps} PREPARACIONES BASE para batch cooking.
Estas preparaciones se cocinarán en una sesión de preparación y se almacenarán en la nevera para armar las comidas (almuerzos) de ${numDays} días de la semana.

REGLAS:
- Genera EXACTAMENTE ${numPreps} preparaciones base de diferentes tipos (proteína, grano/carbohidrato, salsa, vegetal, guarnición).
- Cada preparación debe poder almacenarse en la nevera al menos 4-5 días.
- Las preparaciones deben ser VERSÁTILES: poder combinarse de diferentes formas para crear platos variados.
- El tiempo TOTAL de preparación de todas las bases no debe exceder ${config.max_prep_time_minutes || 180} minutos.
- Estrategia de reutilización: ${config.reuse_strategy === 'maximize_reuse' ? 'Maximizar reutilización — pocas bases muy versátiles' : config.reuse_strategy === 'variety' ? 'Variedad — más bases diferentes' : 'Equilibrado — balance entre reutilización y variedad'}`
      : `Your task is to generate ${numPreps} BASE PREPARATIONS for batch cooking.
These will be cooked in a prep session and stored in the fridge to assemble lunches for ${numDays} days of the week.

RULES:
- Generate EXACTLY ${numPreps} base preparations of different types (protein, grain/carb, sauce, vegetable, side).
- Each preparation must keep in the fridge for at least 4-5 days.
- Preparations must be VERSATILE: combinable in different ways to create varied dishes.
- TOTAL prep time for all bases must not exceed ${config.max_prep_time_minutes || 180} minutes.
- Reuse strategy: ${config.reuse_strategy === 'maximize_reuse' ? 'Maximize reuse — few very versatile bases' : config.reuse_strategy === 'variety' ? 'Variety — more different bases' : 'Balanced — balance between reuse and variety'}`,
    '',
  ];

  // Restrictions
  const allergies = restrictions.filter(r => r.is_allergy).map(r => r.custom_value || r.restriction_type);
  const preferences = restrictions.filter(r => !r.is_allergy).map(r => r.custom_value || r.restriction_type);
  if (allergies.length > 0) parts.push(`${t('allergiesWarning')}: ${allergies.join(', ')}`);
  if (preferences.length > 0) parts.push(`${t('dietaryPreferences')}: ${preferences.join(', ')}`);

  // Profile context
  if (profile?.country) parts.push(`${t('country')}: ${profile.country}`);
  if (profile?.currency) parts.push(`${t('currency')}: ${profile.currency}`);

  // Cuisines
  if (form.cuisines.length > 0) {
    const cuisineNames = form.cuisines.map(resolveChipName);
    parts.push(`${t('cuisineType')}: ${cuisineNames.join(', ')}`);
  }

  // Equipment
  if (form.equipment.length > 0) {
    const equipNames = form.equipment.map(resolveChipName);
    parts.push(`${t('availableEquipment')}: ${equipNames.join(', ')}`);
  }

  // Ingredients to include — distribute across base preps
  if (form.ingredientsToInclude.length > 0) {
    const label = lang === 'es'
      ? `INGREDIENTES PRINCIPALES A USAR (distribúyelos entre las preparaciones, usa TODOS): ${form.ingredientsToInclude.join(', ')}`
      : `KEY INGREDIENTS TO USE (distribute across preparations, use ALL): ${form.ingredientsToInclude.join(', ')}`;
    parts.push(label);
  }

  // Ingredients to exclude
  if (form.ingredientsToExclude.length > 0) {
    parts.push(`${t('excludeIngredients')}: ${form.ingredientsToExclude.join(', ')}`);
  }

  // Batch notes
  if (config.notes) {
    const label = lang === 'es' ? 'NOTAS DEL USUARIO PARA BATCH COOKING' : 'USER BATCH COOKING NOTES';
    parts.push(`${label}: ${config.notes}`);
  }

  // Special notes
  if (form.specialNotes) {
    const label = lang === 'es' ? 'NOTAS ESPECIALES' : 'SPECIAL NOTES';
    parts.push(`${label}: ${form.specialNotes}`);
  }

  // JSON format
  parts.push('', lang === 'es'
    ? 'FORMATO: Devuelve SOLO un JSON array. Cada objeto:'
    : 'FORMAT: Return ONLY a JSON array. Each object:', '', `[
  {
    "name": "Pollo deshebrado al chipotle",
    "type": "protein",
    "description": "Pechuga de pollo cocida y deshebrada con adobo de chipotle",
    "recipe": ${getJsonStructureExample(lang)},
    "storage_instructions": "Refrigerar en recipiente hermético hasta 5 días",
    "estimated_time_minutes": 45
  }
]`);

  parts.push('', lang === 'es'
    ? 'Tipos válidos: protein, grain, sauce, vegetable, side, other. Devuelve SOLO el JSON.'
    : 'Valid types: protein, grain, sauce, vegetable, side, other. Return ONLY the JSON.');

  return parts.join('\n');
}

/**
 * Generate base preparations for batch cooking
 */
async function generateBasePreparations(
  form: WeeklyPlanForm,
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language = 'es',
): Promise<BasePreparation[]> {
  const prompt = buildBasePreparationsPrompt(form, profile, restrictions, lang);

  if (__DEV__) {
    console.log('=== BATCH: BASE PREPARATIONS PROMPT ===');
    console.log(prompt.substring(0, 500) + '...');
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await delay(2000 * attempt);

      const modelName = FALLBACK_MODELS[0];
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      let parsed: any;
      try {
        parsed = JSON.parse(sanitizeJson(raw));
      } catch {
        const jsonText = extractJsonFromResponse(raw);
        const repaired = tryRepairTruncatedJson(jsonText);
        parsed = JSON.parse(repaired || jsonText);
      }

      const prepsArray = Array.isArray(parsed) ? parsed : (parsed.preparations || [parsed]);
      const validPreps = prepsArray.filter((p: any) => p?.name && p?.type);

      if (validPreps.length === 0) continue;

      // Validate each prep's recipe
      return validPreps.map((p: any) => {
        let validatedRecipe = undefined;
        if (p.recipe?.title && p.recipe?.ingredients) {
          try {
            if (p.recipe?.meal_types) p.recipe.meal_types = normalizeMealTypes(p.recipe.meal_types);
            validatedRecipe = AIRecipeResponseSchema.parse(p.recipe);
          } catch {
            // If recipe validation fails, skip the recipe but keep the prep
          }
        }
        return {
          name: p.name,
          type: p.type || 'other',
          description: p.description || '',
          recipe: validatedRecipe,
          used_in_days: [],
          used_in_meals: [],
          estimated_time_minutes: p.estimated_time_minutes,
          storage_instructions: p.storage_instructions,
        } as BasePreparation;
      });
    } catch (err: any) {
      console.error(`Base preparations attempt ${attempt} failed:`, err?.message?.substring(0, 150));
      if (attempt === 3) {
        console.warn('Failed to generate base preparations after 3 attempts');
        return [];
      }
    }
  }
  return [];
}

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

/**
 * Build the system prompt for generating one day of a weekly plan
 */
function buildDayPlanSystemPrompt(
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  form: WeeklyPlanForm,
  lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);

  const parts: string[] = [
    t('systemIntro'),
    lang === 'es'
      ? 'Tu tarea es generar las recetas para UN DÍA de un plan semanal de comidas.'
      : 'Your task is to generate recipes for ONE DAY of a weekly meal plan.',
    '',
    lang === 'es'
      ? 'IDIOMA: Genera TODO el contenido en ESPAÑOL.'
      : 'LANGUAGE: Generate ALL content in ENGLISH.',
    '',
  ];

  // Restrictions
  const allergies = restrictions.filter(r => r.is_allergy).map(r => r.custom_value || r.restriction_type);
  const preferences = restrictions.filter(r => !r.is_allergy).map(r => r.custom_value || r.restriction_type);

  if (allergies.length > 0) {
    parts.push(`${t('allergiesWarning')}: ${allergies.join(', ')}`);
  }
  if (preferences.length > 0) {
    parts.push(`${t('dietaryPreferences')}: ${preferences.join(', ')}`);
  }
  if (allergies.length === 0 && preferences.length === 0) {
    parts.push(t('noRestrictionsActive'));
  }

  // Profile context
  if (profile) {
    if (profile.country) parts.push(`${t('country')}: ${profile.country}`);
    if (profile.currency) parts.push(`${t('currency')}: ${profile.currency}`);
    if (profile.measurement_system) {
      parts.push(`${t('measurementSystem')}: ${profile.measurement_system === 'metric' ? t('metric') : t('imperial')}`);
    }
  }

  // Calorie target
  if (form.dailyCalorieTarget) {
    const calNote = lang === 'es'
      ? `OBJETIVO CALÓRICO DIARIO: ${form.dailyCalorieTarget} calorías. Distribuye entre las comidas del día.`
      : `DAILY CALORIE TARGET: ${form.dailyCalorieTarget} calories. Distribute across the day's meals.`;
    parts.push(calNote);
  }

  // Servings
  if (form.servings && form.servings > 1) {
    const servingsNote = lang === 'es'
      ? `PORCIONES: Cada receta debe ser para ${form.servings} porciones individuales.`
      : `SERVINGS: Each recipe should be for ${form.servings} individual servings.`;
    parts.push(servingsNote);
  } else {
    const servingsNote = lang === 'es'
      ? `PORCIONES: Cada receta debe ser para 1 porción individual.`
      : `SERVINGS: Each recipe should be for 1 individual serving.`;
    parts.push(servingsNote);
  }

  // Cuisines
  if (form.cuisines.length > 0) {
    const cuisineNames = form.cuisines.map(resolveChipName);
    parts.push(`${t('cuisineType')}: ${cuisineNames.join(', ')}`);
  }

  // Equipment
  if (form.equipment.length > 0) {
    const equipNames = form.equipment.map(resolveChipName);
    parts.push(`${t('availableEquipment')}: ${equipNames.join(', ')}`);
  }

  // Exclude ingredients
  if (form.ingredientsToExclude.length > 0) {
    parts.push(`${t('excludeIngredients')}: ${form.ingredientsToExclude.join(', ')}`);
  }

  // Batch cooking context
  if (form.batchCookingEnabled && form.batchConfig) {
    const batchNote = lang === 'es'
      ? `MODO BATCH COOKING: El usuario prepara comidas de antemano. Genera recetas que se puedan preparar en lote, reutilicen ingredientes base y se almacenen bien. Estrategia de reutilización: ${form.batchConfig.reuse_strategy}.`
      : `BATCH COOKING MODE: The user preps meals in advance. Generate recipes that can be batch-prepared, reuse base ingredients, and store well. Reuse strategy: ${form.batchConfig.reuse_strategy}.`;
    parts.push(batchNote);

    // Include batch cooking notes if provided
    if (form.batchConfig.notes) {
      const batchNotesLabel = lang === 'es' ? 'NOTAS DE BATCH COOKING DEL USUARIO' : 'USER BATCH COOKING NOTES';
      parts.push(`${batchNotesLabel}: ${form.batchConfig.notes}`);
    }
  }

  // Special notes
  if (form.specialNotes) {
    const notesLabel = lang === 'es' ? 'NOTAS ESPECIALES DEL USUARIO' : 'USER SPECIAL NOTES';
    parts.push(`${notesLabel}: ${form.specialNotes}`);
  }

  // Response format
  const formatInstructions = lang === 'es'
    ? `FORMATO DE RESPUESTA: Devuelve un JSON array con objetos de recetas. Cada objeto debe seguir EXACTAMENTE esta estructura:`
    : `RESPONSE FORMAT: Return a JSON array of recipe objects. Each object must follow EXACTLY this structure:`;
  parts.push('', formatInstructions, '', `[
  {
    "meal_type": "breakfast|lunch|dinner|snack",
    "recipe": ${getJsonStructureExample(lang)},
    "estimated_calories": 350
  }
]`);

  return parts.join('\n');
}

/**
 * Build the user prompt for generating one day of a weekly plan
 */
function buildDayUserPrompt(
  day: DayOfWeek,
  mealTypes: PlanMealType[],
  cookingTimeMinutes: number,
  favoriteIngredients: string[],
  form: WeeklyPlanForm,
  previousDaysSummary: string,
  lang: Language = 'es',
  basePreparations: BasePreparation[] = [],
): string {
  const dayName = i18n.t(`weeklyPlan.days.${day}`, { lng: lang }) as string;

  const parts: string[] = [];

  if (lang === 'es') {
    parts.push(`Genera las recetas para el ${dayName.toUpperCase()}.`);
    parts.push(`Comidas a generar: ${mealTypes.join(', ')}`);
    // Per-meal-type cooking times
    if (form.cookingTimeByMealType && Object.keys(form.cookingTimeByMealType).length > 0) {
      const timeDetails = mealTypes
        .map((mt) => `${mt}: ${form.cookingTimeByMealType[mt] ?? cookingTimeMinutes} min`)
        .join(', ');
      parts.push(`Tiempo máximo de cocina: ${timeDetails}`);
    } else {
      parts.push(`Tiempo máximo de cocina por receta: ${cookingTimeMinutes} minutos.`);
    }
  } else {
    parts.push(`Generate recipes for ${dayName.toUpperCase()}.`);
    parts.push(`Meals to generate: ${mealTypes.join(', ')}`);
    if (form.cookingTimeByMealType && Object.keys(form.cookingTimeByMealType).length > 0) {
      const timeDetails = mealTypes
        .map((mt) => `${mt}: ${form.cookingTimeByMealType[mt] ?? cookingTimeMinutes} min`)
        .join(', ');
      parts.push(`Maximum cooking time: ${timeDetails}`);
    } else {
      parts.push(`Maximum cooking time per recipe: ${cookingTimeMinutes} minutes.`);
    }
  }

  // Include ingredients
  if (form.ingredientsToInclude.length > 0) {
    const label = lang === 'es' ? 'Intentar usar estos ingredientes' : 'Try to use these ingredients';
    parts.push(`${label}: ${form.ingredientsToInclude.join(', ')}`);
  }

  // Favorite ingredients
  if (form.useFavoriteIngredients && favoriteIngredients.length > 0) {
    const label = lang === 'es'
      ? 'Preferir estos ingredientes favoritos'
      : 'Prefer these favorite ingredients';
    parts.push(`${label}: ${favoriteIngredients.join(', ')}`);
  }

  // ---- Routine meals: rotate among user-defined options ----
  if (form.routineMeals) {
    const mealTypeToRoutine: Record<string, string | undefined> = {
      breakfast: form.routineMeals.breakfast,
      lunch: form.routineMeals.lunch,
      dinner: form.routineMeals.dinner,
      snack: form.routineMeals.snack,
    };

    for (const mt of mealTypes) {
      const routine = mealTypeToRoutine[mt]?.trim();
      if (routine) {
        if (lang === 'es') {
          parts.push(`Para ${mt === 'breakfast' ? 'el desayuno' : mt === 'lunch' ? 'la comida' : mt === 'dinner' ? 'la cena' : 'el snack'}, rota entre estas opciones habituales del usuario (no inventes otras a menos que se pida variedad): ${routine}`);
        } else {
          parts.push(`For ${mt}, rotate among these user's usual options (don't invent new ones unless variety is requested): ${routine}`);
        }
      }
    }
  }

  // ---- Quick meal guidance for breakfasts/dinners ----
  const hasBreakfastOrDinner = mealTypes.some((mt) => mt === 'breakfast' || mt === 'dinner');
  if (hasBreakfastOrDinner) {
    const quickMealNote = lang === 'es'
      ? 'Para desayunos y cenas, prioriza recetas de ensamblaje rápido (≤15 min, pocos ingredientes) a menos que el usuario haya indicado lo contrario. Las comidas/almuerzos pueden ser más elaboradas.'
      : 'For breakfasts and dinners, prioritize quick assembly meals (≤15 min, few ingredients) unless the user indicated otherwise. Lunches can be more elaborate.';
    parts.push(quickMealNote);
  }

  // ---- Reinforce key preferences in the per-day prompt ----
  // Cuisines reminder
  if (form.cuisines.length > 0) {
    const cuisineNames = form.cuisines.map(resolveChipName);
    const cuisineReminder = lang === 'es'
      ? `RECUERDA: Solo genera recetas de estos estilos de cocina: ${cuisineNames.join(', ')}`
      : `REMEMBER: Only generate recipes from these cuisine styles: ${cuisineNames.join(', ')}`;
    parts.push(cuisineReminder);
  }

  // Special notes reminder in per-day prompt
  if (form.specialNotes) {
    const notesReminder = lang === 'es'
      ? `NOTAS DEL USUARIO (respétalas): ${form.specialNotes}`
      : `USER NOTES (respect these): ${form.specialNotes}`;
    parts.push(notesReminder);
  }

  // Excluded ingredients reinforcement per-day
  if (form.ingredientsToExclude.length > 0) {
    const excludeReminder = lang === 'es'
      ? `⚠️ PROHIBIDO usar estos ingredientes en NINGUNA receta: ${form.ingredientsToExclude.join(', ')}`
      : `⚠️ FORBIDDEN ingredients - DO NOT use in ANY recipe: ${form.ingredientsToExclude.join(', ')}`;
    parts.push(excludeReminder);
  }

  // ---- Batch cooking: lunch assembly from base preparations ----
  if (form.batchCookingEnabled && basePreparations.length > 0 && mealTypes.includes('lunch')) {
    const prepList = basePreparations
      .map((p, i) => `${i + 1}. ${p.name} (${p.type}): ${p.description}`)
      .join('\n');

    // Figure out which day index this is (for rotation hints)
    const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const selectedSorted = form.selectedDays
      .slice()
      .sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    const dayIndex = selectedSorted.indexOf(day);
    const totalDays = selectedSorted.length;

    // Suggest which preps to highlight for this day to ensure rotation
    const proteinPreps = basePreparations.filter((p) => p.type === 'protein');
    const suggestedProteinIndex = proteinPreps.length > 1
      ? (dayIndex % proteinPreps.length)
      : 0;
    const suggestedProtein = proteinPreps[suggestedProteinIndex]?.name;

    if (lang === 'es') {
      parts.push('');
      parts.push(`🍱 BATCH COOKING - COMIDA DE ENSAMBLAJE:
Para la COMIDA (lunch) de hoy, crea un plato que se ARME usando las preparaciones base que ya están listas en la nevera.
NO cocines desde cero — usa estas preparaciones como ingredientes principales y describe SOLO instrucciones de ensamblaje/calentamiento (máx 10-15 min).
La receta debe incluir las preparaciones base en sus ingredientes (ya preparados) y opcionalmente ingredientes frescos adicionales mínimos.

PREPARACIONES BASE DISPONIBLES:
${prepList}

REGLAS DE ROTACIÓN (día ${dayIndex + 1} de ${totalDays}):
- NO mezcles TODAS las proteínas en un solo plato. Cada día debe tener UNA proteína principal diferente.${suggestedProtein ? `\n- HOY usa como proteína principal: "${suggestedProtein}".` : ''}
- Combina la proteína con 1-2 bases complementarias (grano, salsa, vegetales o guarnición).
- Crea un plato con identidad propia y diferente a los otros días.
- Un día puede ser: proteína A + grano + salsa. Otro: proteína B + vegetales + guarnición. Varía las combinaciones.`);
    } else {
      parts.push('');
      parts.push(`🍱 BATCH COOKING - ASSEMBLY LUNCH:
For today's LUNCH, create a dish that ASSEMBLES from these base preparations already in the fridge.
DO NOT cook from scratch — use these as main ingredients and describe ONLY assembly/reheating instructions (max 10-15 min).
The recipe should list base preparations as ingredients (pre-prepared) plus minimal fresh additions.

AVAILABLE BASE PREPARATIONS:
${prepList}

ROTATION RULES (day ${dayIndex + 1} of ${totalDays}):
- Do NOT mix ALL proteins in one dish. Each day should feature ONE main protein.${suggestedProtein ? `\n- TODAY use as main protein: "${suggestedProtein}".` : ''}
- Pair the protein with 1-2 complementary bases (grain, sauce, vegetables, or side).
- Create a dish with its own identity, different from other days.
- One day could be: protein A + grain + sauce. Another: protein B + vegetables + side. Vary combinations.`);
    }
  }

  // Previous days summary to avoid repetition
  if (previousDaysSummary) {
    const avoidLabel = lang === 'es'
      ? 'EVITA repetir estos platos que ya se generaron para otros días'
      : 'AVOID repeating these dishes already generated for other days';
    parts.push(`${avoidLabel}: ${previousDaysSummary}`);
  }

  parts.push('');
  const returnLabel = lang === 'es'
    ? 'Devuelve SOLO el JSON array. No añadas explicaciones.'
    : 'Return ONLY the JSON array. Do not add explanations.';
  parts.push(returnLabel);

  return parts.join('\n');
}

/**
 * Weekly Plan Generation Service
 * Generates a full weekly plan day-by-day for reliability
 */
export const weeklyPlanGenerationService = {
  /**
   * Generate a full weekly plan by iterating day-by-day
   */
  async generateWeeklyPlan(
    form: WeeklyPlanForm,
    profile: Profile | null,
    restrictions: ProfileRestriction[],
    favoriteIngredients: string[] = [],
    lang: Language = 'es',
    onDayProgress?: (day: DayOfWeek) => void,
  ): Promise<WeeklyPlanGenerationResponse> {
    const normalizedLang = getLanguage(lang);

    try {
      const allMeals: AIPlanMeal[] = [];
      const generatedTitles: string[] = [];
      let basePreparations: BasePreparation[] = [];

      // Sort selected days in order
      const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sortedDays = form.selectedDays.sort(
        (a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b)
      );

      // ---- Phase 1: Generate base preparations if batch cooking ----
      if (form.batchCookingEnabled && form.batchConfig) {
        if (__DEV__) console.log('=== BATCH COOKING: Generating base preparations ===');
        basePreparations = await generateBasePreparations(form, profile, restrictions, normalizedLang);
        if (__DEV__) console.log(`Generated ${basePreparations.length} base preparations:`, basePreparations.map(p => p.name));
        // Small delay before starting day generation
        if (basePreparations.length > 0) await delay(1500);
      }

      // Build system prompt once
      const systemPrompt = buildDayPlanSystemPrompt(profile, restrictions, form, normalizedLang);

      for (const day of sortedDays) {
        onDayProgress?.(day);

        const dayConfig = form.dayConfigs[day];
        if (!dayConfig) continue;

        // Get meals to generate, sorted in canonical order
        const mealsToGenerate = [...dayConfig.meals]
          .sort((a, b) => (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99));

        if (mealsToGenerate.length === 0) continue;

        // Build user prompt for this day
        const previousSummary = generatedTitles.join(', ');
        const userPrompt = buildDayUserPrompt(
          day,
          mealsToGenerate,
          dayConfig.cookingTimeMinutes,
          favoriteIngredients,
          form,
          previousSummary,
          normalizedLang,
          basePreparations,
        );

        const fullPrompt = `${systemPrompt}\n\n${'='.repeat(50)}\n\n${userPrompt}`;

        if (__DEV__) {
          console.log(`=== WEEKLY PLAN: ${day.toUpperCase()} PROMPT ===`);
          console.log(fullPrompt.substring(0, 500) + '...');
        }

        // Generate with retries, exponential backoff, and model fallback
        const maxRetries = 5;
        let dayMeals: AIPlanMeal[] | null = null;
        let currentModelIndex = 0; // Index into FALLBACK_MODELS

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // Exponential backoff: 0s, 2s, 4s, 8s, 16s
            if (attempt > 1) {
              const backoffMs = Math.min(2000 * Math.pow(2, attempt - 2), 16000);
              console.log(`Day ${day} retry ${attempt}, waiting ${backoffMs}ms...`);
              await delay(backoffMs);
            }

            const modelName = FALLBACK_MODELS[currentModelIndex] || FALLBACK_MODELS[0];
            const model = genAI.getGenerativeModel({
              model: modelName,
              safetySettings,
              generationConfig: {
                temperature: WEEKLY_PLAN_AI_CONFIG.temperature,
                maxOutputTokens: WEEKLY_PLAN_AI_CONFIG.perDayTokens,
                responseMimeType: 'application/json',
              },
            });

            const result = await model.generateContent(fullPrompt);
            const rawResponse = result.response.text();

            if (!rawResponse) {
              console.warn(`Day ${day} attempt ${attempt}: empty response`);
              continue;
            }

            if (__DEV__) {
              console.log(`Day ${day} attempt ${attempt} (${modelName}) raw length: ${rawResponse.length}, first 200:`, rawResponse.substring(0, 200));
            }

            // Since responseMimeType is 'application/json', try direct parse first
            let parsed: any;
            try {
              parsed = JSON.parse(sanitizeJson(rawResponse));
            } catch {
              // Fallback: extract and sanitize
              const jsonText = extractJsonFromResponse(rawResponse);
              try {
                parsed = JSON.parse(jsonText);
              } catch (jsonErr) {
                // JSON is likely truncated — try to repair
                console.warn(`Day ${day} attempt ${attempt}: JSON parse failed, trying repair...`);
                const repaired = tryRepairTruncatedJson(jsonText);
                if (repaired) {
                  console.log(`Day ${day} attempt ${attempt}: JSON repair succeeded`);
                  parsed = JSON.parse(repaired);
                } else {
                  throw jsonErr; // Re-throw, will be caught by outer catch
                }
              }
            }

            // Parse as array of meals
            const mealsArray = Array.isArray(parsed) ? parsed : (parsed.meals || [parsed]);

            // Filter out incomplete meal entries (from truncated JSON repair)
            const validMeals = mealsArray.filter((m: any) => m?.recipe?.title && m?.recipe?.ingredients);

            if (validMeals.length === 0) {
              console.warn(`Day ${day} attempt ${attempt}: parsed OK but no valid meals found`);
              continue;
            }

            dayMeals = validMeals.map((m: any, index: number) => {
              // Normalize meal_types in the recipe sub-object
              if (m.recipe?.meal_types && Array.isArray(m.recipe.meal_types)) {
                m.recipe.meal_types = normalizeMealTypes(m.recipe.meal_types);
              }

              const validatedRecipe = AIRecipeResponseSchema.parse(m.recipe);

              return {
                day_of_week: day,
                meal_type: m.meal_type || mealsToGenerate[index] || 'lunch',
                recipe: validatedRecipe,
                is_prep_day: false,
                is_external: false,
                estimated_calories: m.estimated_calories || validatedRecipe.nutrition.calories,
              } as AIPlanMeal;
            });

            // If we got fewer meals than requested due to truncation, log it but don't fail
            if (dayMeals && dayMeals.length < mealsToGenerate.length) {
              console.warn(`Day ${day}: got ${dayMeals.length}/${mealsToGenerate.length} meals (some may have been truncated)`);
            }

            break; // Success
          } catch (parseError: any) {
            const errorMsg = parseError?.message || String(parseError);
            const is503 = errorMsg.includes('503') || errorMsg.includes('high demand');
            const is404 = errorMsg.includes('404') || errorMsg.includes('no longer available');
            const isRateLimit = errorMsg.includes('429') || errorMsg.includes('rate');
            const isServerError = is503 || is404 || isRateLimit;

            const errorType = is503 ? '503/overloaded' : is404 ? '404/unavailable' : isRateLimit ? '429/rate-limited' : 'parse/other';
            console.error(`Day ${day} attempt ${attempt} failed (${errorType}):`, errorMsg.substring(0, 150));

            // On server errors, try the next fallback model
            if (isServerError && currentModelIndex < FALLBACK_MODELS.length - 1) {
              currentModelIndex++;
              console.log(`Day ${day}: switching to fallback model: ${FALLBACK_MODELS[currentModelIndex]}`);
            }

            if (attempt === maxRetries) {
              // If we have partial meals from a previous truncated parse, use them
              if (dayMeals && dayMeals.length > 0) {
                console.warn(`Day ${day}: using ${dayMeals.length} partial meals after all retries`);
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


        // Delay between days to avoid rate limiting (1.5s)
        if (sortedDays.indexOf(day) < sortedDays.length - 1) {
          await delay(1500);
        }
      }

      // Build final response
      const plan: AIWeeklyPlanResponse = {
        plan_name: form.planName || `Plan ${new Date(form.startDate || Date.now()).toLocaleDateString()}`,
        meals: allMeals.filter((m) => m.recipe?.title), // Only meals with actual recipes
        base_preparations: basePreparations,
        total_estimated_calories: allMeals.reduce(
          (sum, m) => sum + (m.estimated_calories || 0),
          0
        ),
        shopping_summary: [],
        tips: [],
      };

      return { plan, success: true };
    } catch (error) {
      console.error('Weekly plan generation error:', error);
      return {
        plan: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating plan',
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
    lang: Language = 'es',
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);

    // Existing titles to avoid
    const existingTitles = currentPlanMeals
      .filter((m) => m.recipe?.title)
      .map((m) => m.recipe.title);

    const systemPrompt = buildRecipeSystemPrompt(profile, restrictions, normalizedLang);

    const dayName = i18n.t(`weeklyPlan.days.${day}`, { lng: normalizedLang }) as string;
    const mealName = i18n.t(`weeklyPlan.mealTypes.${mealType}`, { lng: normalizedLang }) as string;

    const userPrompt = (() => {
      const mealLabel = normalizedLang === 'es' ? mealName : mealName;
      const dayLabel = normalizedLang === 'es' ? dayName : dayName;
      const parts: string[] = [];

      if (normalizedLang === 'es') {
        parts.push(`Genera una receta para el ${mealLabel} del ${dayLabel}. Tiempo máximo: ${cookingTimeMinutes} min.`);
      } else {
        parts.push(`Generate a recipe for ${dayLabel}'s ${mealLabel}. Max time: ${cookingTimeMinutes} min.`);
      }

      // Avoid repetition
      if (existingTitles.length > 0) {
        const avoidLabel = normalizedLang === 'es' ? 'NO repitas' : 'DO NOT repeat';
        parts.push(`${avoidLabel}: ${existingTitles.join(', ')}`);
      }

      // Cuisines
      if (form.cuisines.length > 0) {
        const cuisineNames = form.cuisines.map(resolveChipName);
        const label = normalizedLang === 'es' ? 'Estilo de cocina' : 'Cuisine style';
        parts.push(`${label}: ${cuisineNames.join(', ')}`);
      }

      // Routine meals
      if (form.routineMeals) {
        const routineText = (form.routineMeals as any)[mealType]?.trim();
        if (routineText) {
          if (normalizedLang === 'es') {
            parts.push(`El usuario suele comer esto para ${mealLabel}, rota entre estas opciones: ${routineText}`);
          } else {
            parts.push(`User usually eats this for ${mealLabel}, rotate among: ${routineText}`);
          }
        }
      }

      // Quick meal hint for breakfast/dinner
      if (mealType === 'breakfast' || mealType === 'dinner') {
        const quickHint = normalizedLang === 'es'
          ? 'Prioriza receta de ensamblaje rápido (pocos ingredientes, ≤15 min) a menos que se indique lo contrario.'
          : 'Prioritize quick assembly recipe (few ingredients, ≤15 min) unless indicated otherwise.';
        parts.push(quickHint);
      }

      // Special notes
      if (form.specialNotes) {
        const label = normalizedLang === 'es' ? 'Notas' : 'Notes';
        parts.push(`${label}: ${form.specialNotes}`);
      }

      // Servings
      if (form.servings && form.servings >= 1) {
        const label = normalizedLang === 'es' ? 'Porciones' : 'Servings';
        parts.push(`${label}: ${form.servings}`);
      }

      // Excluded ingredients
      if (form.ingredientsToExclude.length > 0) {
        const label = normalizedLang === 'es'
          ? '⚠️ PROHIBIDO usar estos ingredientes'
          : '⚠️ FORBIDDEN ingredients';
        parts.push(`${label}: ${form.ingredientsToExclude.join(', ')}`);
      }

      return parts.join('. ');
    })();

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Retry with fallback models — 2 attempts per model
    for (let i = 0; i < FALLBACK_MODELS.length; i++) {
      const modelName = FALLBACK_MODELS[i];

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (i > 0 || attempt > 1) {
            await delay(2000 * attempt);
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings,
            generationConfig: {
              temperature: WEEKLY_PLAN_AI_CONFIG.temperature + 0.1,
              maxOutputTokens: 4096, // Single recipe needs more room than AI_CONFIG.maxOutputTokens (2500)
              responseMimeType: 'application/json',
            },
          });

          const result = await model.generateContent(fullPrompt);
          const rawResponse = result.response.text();

          if (!rawResponse) continue;

          if (__DEV__) {
            console.log(`Regenerate meal (${modelName}) attempt ${attempt} raw length:`, rawResponse.length);
            console.log(`Regenerate meal raw first 500:`, rawResponse.substring(0, 500));
            console.log(`Regenerate meal raw last 200:`, rawResponse.substring(rawResponse.length - 200));
          }

          // When responseMimeType is 'application/json', the response IS json directly.
          // Try direct parse first, then fallback to extraction and repair.
          let parsed: any;
          try {
            parsed = JSON.parse(sanitizeJson(rawResponse));
          } catch {
            // Try extracting and sanitizing
            const jsonText = extractJsonFromResponse(rawResponse);
            try {
              parsed = JSON.parse(jsonText);
            } catch {
              const repaired = tryRepairTruncatedJson(jsonText);
              if (repaired) {
                parsed = JSON.parse(repaired);
              } else {
                throw new Error('JSON parse failed and repair unsuccessful');
              }
            }
          }

          // Handle case where AI wraps in an array
          const recipeObj = Array.isArray(parsed)
            ? (parsed[0]?.recipe || parsed[0])
            : (parsed.recipe || parsed);

          if (recipeObj.meal_types && Array.isArray(recipeObj.meal_types)) {
            recipeObj.meal_types = normalizeMealTypes(recipeObj.meal_types);
          }

          const validated = AIRecipeResponseSchema.parse(recipeObj);
          return { recipe: validated, success: true, rawResponse };
        } catch (error: any) {
          const msg = error?.message || '';
          const isServerError = msg.includes('503') || msg.includes('404') || msg.includes('429');
          console.error(`Regenerate meal (${modelName}) attempt ${attempt}:`, msg.substring(0, 120));

          // If server error, skip remaining attempts for this model and try next
          if (isServerError) break;

          // If parse error on last attempt of last model, give up
          if (i === FALLBACK_MODELS.length - 1 && attempt === 2) {
            return {
              recipe: null,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }
      }
    }

    return {
      recipe: null,
      success: false,
      error: 'All models failed',
    };
  },
};

