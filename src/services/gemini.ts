import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import i18n from '@/i18n';
import { AIRecipeResponseSchema, type AIRecipeResponse, type RecipeSearchForm } from '@/types';
import { type Profile, type ProfileRestriction } from './profile';
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

function getJsonStructureExample(lang: Language): string {
  const descriptionHint = lang === 'es'
    ? 'Descripción breve y atractiva de 1 oración'
    : 'Brief and appealing 1-sentence description';

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
  "cuisine": "mexican",
  "tags": ["quick", "healthy"],
  "chef_tips": ["Tip 1", "Tip 2"],
  "storage_instructions": "Store in refrigerator for up to 3 days",
  "variations": ["Variation 1", "Variation 2"]
}`;
}

function buildRecipeSystemPrompt(
  profile: Profile | null,
  restrictions: ProfileRestriction[],
  lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);

  const descriptionInstruction = lang === 'es'
    ? 'IMPORTANTE: La descripción debe ser breve (1 oración), atractiva y directa. No uses frases de relleno.'
    : 'IMPORTANT: Description must be brief (1 sentence), appealing and direct. No filler phrases.';

  const parts: string[] = [
    t('systemIntro'),
    t('systemTask'),
    '',
    descriptionInstruction,
    '',
    t('jsonInstruction'),
    t('jsonStructure'),
    '',
    getJsonStructureExample(lang),
  ];

  if (profile) {
    parts.push('', t('userContext'));

    if (profile.country) {
      parts.push(`${t('country')}: ${profile.country}`);
    }
    if (profile.currency) {
      parts.push(`${t('currency')}: ${profile.currency}`);
    }
    if (profile.measurement_system) {
      parts.push(`${t('measurementSystem')}: ${profile.measurement_system === 'metric' ? t('metric') : t('imperial')}`);
    }
  }

  if (restrictions.length > 0) {
    const allergies = restrictions.filter(r => r.is_allergy).map(r => r.restriction_type);
    const preferences = restrictions.filter(r => !r.is_allergy).map(r => r.restriction_type);

    if (allergies.length > 0) {
      parts.push(`${t('allergiesWarning')}: ${allergies.join(', ')}`);
    }
    if (preferences.length > 0) {
      parts.push(`${t('dietaryPreferences')}: ${preferences.join(', ')}`);
    }
  }

  return parts.join('\n');
}

function buildUserPrompt(
  form: RecipeSearchForm,
  favoriteIngredients: string[] = [],
  lang: Language = 'es'
): string {
  const t = (key: string) => getPromptTranslation(key, lang);
  const tNested = (key: string, subKey: string) => getNestedPromptTranslation(key, subKey, lang);
  const parts: string[] = [];

  if (form.prompt) {
    parts.push(form.prompt);
  }

  if (form.quickFilters.length > 0) {
    const filters = form.quickFilters
      .map(f => tNested('filterDescriptions', f))
      .filter(Boolean);
    if (filters.length > 0) {
      parts.push(`${t('requirements')}: ${filters.join(', ')}`);
    }
  }

  if (form.ingredientsToUse.length > 0) {
    parts.push(`${t('useIngredients')}: ${form.ingredientsToUse.join(', ')}`);
  }

  if (form.useFavoriteIngredients && favoriteIngredients.length > 0) {
    const favNote = lang === 'es'
      ? `Ingredientes favoritos del usuario (dar preferencia a estos): ${favoriteIngredients.join(', ')}`
      : `User's favorite ingredients (prefer these): ${favoriteIngredients.join(', ')}`;
    parts.push(favNote);
  }

  if (form.ingredientsToExclude.length > 0) {
    parts.push(`${t('excludeIngredients')}: ${form.ingredientsToExclude.join(', ')}`);
  }

  if (form.mealTypes.length > 0) {
    const mealNames = form.mealTypes.map(m => i18n.t(`recipeGeneration.mealTypes.${m}`, { lng: lang }));
    parts.push(`${t('mealType')}: ${mealNames.join(', ')}`);
  }

  if (form.servings) {
    parts.push(`${t('servings')}: ${form.servings}`);
  }

  if (form.maxTime) {
    parts.push(`${t('maxTime')}: ${form.maxTime} ${t('minutes')}`);
  }

  if (form.maxCalories) {
    parts.push(`${t('maximum')} ${form.maxCalories} ${t('caloriesPerServing').toLowerCase()}`);
  }

  if (form.cuisines.length > 0) {
    parts.push(`${t('cuisineType')}: ${form.cuisines.join(', ')}`);
  }

  if (form.difficulty) {
    parts.push(`${t('difficultyLabel')}: ${tNested('difficultyLevels', form.difficulty)}`);
  }

  if (form.equipment && form.equipment.length > 0) {
    parts.push(`${t('availableEquipment')}: ${form.equipment.join(', ')}`);
  }

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
  const jsonObjectMatch = text.match(/\{[\s\S]*}/);
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
    lang: Language = 'es'
  ): Promise<RecipeGenerationResponse> {
    const normalizedLang = getLanguage(lang);
    const zodError = i18n.t('recipeGeneration.zodError', { lng: normalizedLang }) as string;
    const unknownError = i18n.t('recipeGeneration.unknownError', { lng: normalizedLang }) as string;

    try {
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

      // Gemini uses a combined prompt approach
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

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

      const userPrompt = `
${t('currentRecipe')}:
${JSON.stringify(currentRecipe, null, 2)}

${t('modifyRequest')}: ${modification}

${t('returnModified')}
`;

      const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

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
