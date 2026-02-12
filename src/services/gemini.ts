import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import i18n from '@/i18n';
import { AIRecipeResponseSchema, type AIRecipeResponse, type RecipeSearchForm, type MealType } from '@/types';
import { type Profile, type ProfileRestriction, type ProfileQuickFilter } from './profile';
import { AI_CONFIG } from '@/config';

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
 * Get filter description with support for custom names
 */
function getFilterDescription(
    filterType: string,
    customName: string | null | undefined,
    lang: Language
): string {
  // If there's a custom name, use it directly
  if (customName) {
    return customName;
  }

  // Try to get the default translation for known filter types
  const translationKey = `recipeGeneration.prompt.defaultFilterDescriptions.${filterType}` as const;

  try {
    const translation = i18n.t(translationKey as any, { lng: lang });

    // If translation is found and it's not the key itself, return it
    if (translation && typeof translation === 'string' && translation !== translationKey) {
      return translation;
    }
  } catch (error) {
    // Translation not found, continue to fallback
  }

  // Fallback: return the filter_type as-is
  return filterType;
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
 * Build user prompt with clear formatting and support for custom quick filters
 */
function buildUserPrompt(
    form: RecipeSearchForm,
    favoriteIngredients: string[] = [],
    quickFiltersData: ProfileQuickFilter[] = [],
    lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);

  const parts: string[] = [t('requirements')];
  const requirements: string[] = [];

  // User's free-text prompt
  if (form.prompt) {
    requirements.push(`- ${t('userRequest')}: ${form.prompt}`);
  }

  // Quick filters - match with ProfileQuickFilter data to get custom names
  if (form.quickFilters.length > 0) {
    const filterDescriptions: string[] = [];

    for (const filterType of form.quickFilters) {
      // Find matching ProfileQuickFilter to get custom_name if available
      const quickFilterData = quickFiltersData.find(qf => qf.filter_type === filterType);
      const description = getFilterDescription(filterType, quickFilterData?.custom_name, lang);
      filterDescriptions.push(description);
    }

    if (filterDescriptions.length > 0) {
      requirements.push(`- ${filterDescriptions.join(', ')}`);
    }
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
    requirements.push(`- ${t('cuisineType')}: ${form.cuisines.join(', ')}`);
  }

  // Difficulty
  if (form.difficulty) {
    requirements.push(`- ${t('difficultyLabel')}: ${getNestedPromptTranslation('difficultyLevels', form.difficulty, lang)}`);
  }

  // Available equipment
  if (form.equipment && form.equipment.length > 0) {
    requirements.push(`- ${t('availableEquipment')}: ${form.equipment.join(', ')}`);
  }

  parts.push(requirements.join('\n'));
  return parts.join('\n');
}

/**
 * Extract JSON from a response that might contain markdown code blocks
 */
function extractJsonFromResponse(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // If no code blocks, try to find JSON object directly
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0];
  }

  return text;
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
      quickFiltersData: ProfileQuickFilter[] = [],
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
      const userPrompt = buildUserPrompt(form, favoriteIngredients, quickFiltersData, normalizedLang);

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
        const jsonText = extractJsonFromResponse(rawResponse);
        const parsed = JSON.parse(jsonText);

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

      const userPrompt = `${t('currentRecipe')}:
${JSON.stringify(currentRecipe, null, 2)}

${'='.repeat(50)}

${t('modifyRequest')}: ${modification}

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
        const jsonText = extractJsonFromResponse(rawResponse);
        const parsed = JSON.parse(jsonText);

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
