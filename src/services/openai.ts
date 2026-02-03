import OpenAI from 'openai';
import { Platform } from 'react-native';
import i18n from '@/i18n';
import { AIRecipeResponseSchema, type AIRecipeResponse, type RecipeSearchForm } from '@/types';
import { type Profile, type ProfileRestriction } from './profile';
import { AI_CONFIG } from '@/config';

export const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    // Temporarily allow browser usage on web platform
    dangerouslyAllowBrowser: Platform.OS === 'web',
});

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    message: string;
    success: boolean;
    error?: string;
}

export interface RecipeGenerationResponse {
    recipe: AIRecipeResponse | null;
    success: boolean;
    error?: string;
    rawResponse?: string;
}

type Language = 'es' | 'en';

/**
 * Supported languages for prompt generation
 */
const SUPPORTED_LANGUAGES: Language[] = ['es', 'en'];

/**
 * Get the current language, defaulting to 'en' if not supported
 */
function getLanguage(lang: string): Language {
    const normalizedLang = lang.startsWith('es') ? 'es' : lang.startsWith('en') ? 'en' : 'en';
    return SUPPORTED_LANGUAGES.includes(normalizedLang as Language) ? normalizedLang as Language : 'en';
}

/**
 * Get translation for prompt keys
 */
function getPromptTranslation(key: string, lang: Language): string {
    return i18n.t(`recipeGeneration.prompt.${key}` as any, { lng: lang }) as string;
}

/**
 * Get nested prompt translation
 */
function getNestedPromptTranslation(key: string, subKey: string, lang: Language): string {
    return i18n.t(`recipeGeneration.prompt.${key}.${subKey}` as any, { lng: lang }) as string;
}

/**
 * Get the JSON structure example based on language
 */
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

/**
 * Build a consistent system prompt for recipe generation
 * Only includes allergies/restrictions from profile (safety critical)
 * Other preferences come from the form (user can override)
 */
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

    // Add basic user context (country, currency, measurement system - these affect the recipe format)
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

    // ALWAYS add restrictions/allergies from profile (safety critical)
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

/**
 * Build the user prompt from search form
 * This is where user preferences from the form are applied
 */
function buildUserPrompt(
    form: RecipeSearchForm,
    favoriteIngredients: string[] = [],
    lang: Language = 'es'
): string {
    const t = (key: string) => getPromptTranslation(key, lang);
    const tNested = (key: string, subKey: string) => getNestedPromptTranslation(key, subKey, lang);
    const parts: string[] = [];

    // Main request (prompt is now the main input, recipeName is removed)
    if (form.prompt) {
        parts.push(form.prompt);
    }

    // Quick filters
    if (form.quickFilters.length > 0) {
        const filters = form.quickFilters
            .map(f => tNested('filterDescriptions', f))
            .filter(Boolean);
        if (filters.length > 0) {
            parts.push(`${t('requirements')}: ${filters.join(', ')}`);
        }
    }

    // Ingredients to use
    if (form.ingredientsToUse.length > 0) {
        parts.push(`${t('useIngredients')}: ${form.ingredientsToUse.join(', ')}`);
    }

    // Add favorite ingredients if checkbox is enabled
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

    // Only include servings if explicitly set in the form (not from profile)
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

    // Equipment from form (if provided)
    if (form.equipment && form.equipment.length > 0) {
        parts.push(`${t('availableEquipment')}: ${form.equipment.join(', ')}`);
    }

    return parts.join('\n');
}

/**
 * Simple chat service for communicating with OpenAI
 */
export const chatService = {
    async sendMessage(
        userMessage: string,
        conversationHistory: ChatMessage[] = [],
        systemPrompt?: string
    ): Promise<ChatResponse> {
        try {
            const messages: ChatMessage[] = [];

            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt,
                });
            }

            messages.push(...conversationHistory);

            messages.push({
                role: 'user',
                content: userMessage,
            });

            const response = await openai.chat.completions.create({
                model: AI_CONFIG.model,
                messages: messages,
                max_tokens: AI_CONFIG.chatMaxTokens,
                temperature: AI_CONFIG.temperature,
            });

            const assistantMessage = response.choices[0]?.message?.content;

            if (!assistantMessage) {
                return {
                    message: '',
                    success: false,
                    error: 'No response from OpenAI',
                };
            }

            return {
                message: assistantMessage,
                success: true,
            };
        } catch (error) {
            console.error('OpenAI Chat Error:', error);
            return {
                message: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    },
};

/**
 * Recipe generation service
 */
export const recipeGenerationService = {
    /**
     * Generate a recipe using OpenAI based on user preferences
     */
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
            const systemPrompt = buildRecipeSystemPrompt(profile, restrictions, normalizedLang);
            const userPrompt = buildUserPrompt(form, favoriteIngredients, normalizedLang);

            const response = await openai.chat.completions.create({
                model: AI_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: AI_CONFIG.maxTokens,
                temperature: AI_CONFIG.temperature,
                response_format: { type: 'json_object' },
            });

            const rawResponse = response.choices[0]?.message?.content;

            if (!rawResponse) {
                return {
                    recipe: null,
                    success: false,
                    error: 'No response from OpenAI',
                };
            }

            // Parse and validate with Zod
            try {
                const parsed = JSON.parse(rawResponse);
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

    /**
     * Regenerate a recipe with modifications
     */
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
            const systemPrompt = buildRecipeSystemPrompt(profile, restrictions, normalizedLang);

            const userPrompt = `
${t('currentRecipe')}:
${JSON.stringify(currentRecipe, null, 2)}

${t('modifyRequest')}: ${modification}

${t('returnModified')}
`;

            const response = await openai.chat.completions.create({
                model: AI_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: AI_CONFIG.maxTokens,
                temperature: AI_CONFIG.temperature,
                response_format: { type: 'json_object' },
            });

            const rawResponse = response.choices[0]?.message?.content;

            if (!rawResponse) {
                return {
                    recipe: null,
                    success: false,
                    error: 'No response from OpenAI',
                };
            }

            try {
                const parsed = JSON.parse(rawResponse);
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
