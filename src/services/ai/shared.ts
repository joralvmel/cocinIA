/**
 * Shared AI utilities — Gemini client, JSON helpers, prompt translation
 */
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import i18n from '@/i18n';
import { type LanguageCode } from '@/i18n';
import { type MealType } from '@/types';

// Re-export for backward compat (modules use Language everywhere)
export type Language = LanguageCode;

/* ------------------------------------------------------------------ */
/*  Gemini client & safety                                             */
/* ------------------------------------------------------------------ */

export const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/* ------------------------------------------------------------------ */
/*  Language helpers                                                    */
/* ------------------------------------------------------------------ */

export function getLanguage(lang: string): Language {
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('en')) return 'en';
  return 'en';
}

/** Shortcut to get a prompt translation key */
export function tp(key: string, lang: Language, vars?: Record<string, unknown>): string {
  return i18n.t(`aiPrompts.${key}` as any, { lng: lang, ...vars }) as string;
}

/** Translate a nested prompt key (e.g. difficultyLevels.easy) */
export function tpNested(key: string, sub: string, lang: Language): string {
  return i18n.t(`aiPrompts.${key}.${sub}` as any, { lng: lang }) as string;
}

/* ------------------------------------------------------------------ */
/*  Meal type normalization                                            */
/* ------------------------------------------------------------------ */

const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

const MEAL_TYPE_MAP: Record<string, MealType> = {
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

export function normalizeMealTypes(mealTypes: string[]): MealType[] {
  const normalized = mealTypes
    .map((type) => {
      const lower = type.toLowerCase().trim();
      if (VALID_MEAL_TYPES.includes(lower as MealType)) return lower as MealType;
      if (MEAL_TYPE_MAP[lower]) {
        console.warn(`Normalizing meal_type "${type}" to "${MEAL_TYPE_MAP[lower]}"`);
        return MEAL_TYPE_MAP[lower];
      }
      console.warn(`Unknown meal_type "${type}", defaulting to "lunch"`);
      return 'lunch' as MealType;
    })
    .filter((t, i, arr) => arr.indexOf(t) === i);

  return normalized.length > 0 ? normalized : ['lunch'];
}

/* ------------------------------------------------------------------ */
/*  Chip name resolver                                                 */
/* ------------------------------------------------------------------ */

export function resolveChipName(id: string): string {
  return id.startsWith('custom:') ? id.substring('custom:'.length) : id;
}

/* ------------------------------------------------------------------ */
/*  JSON structure example for prompts                                 */
/* ------------------------------------------------------------------ */

export function getJsonStructureExample(lang: Language): string {
  const descHint = tp('jsonDescriptionHint', lang);
  const mealTypesNote = tp('jsonMealTypesNote', lang);

  return `{
  "title": "Recipe name",
  "description": "${descHint}",
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

/* ------------------------------------------------------------------ */
/*  Simple delay for retry backoff                                     */
/* ------------------------------------------------------------------ */

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  JSON sanitization & repair                                         */
/* ------------------------------------------------------------------ */

export function sanitizeJson(text: string): string {
  let cleaned = text.replace(/[\uFEFF\u200B]/g, '');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  cleaned = cleaned.replace(/,\s*,/g, ',');
  return cleaned;
}

export function extractJsonFromResponse(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return sanitizeJson(codeBlock[1].trim());

  const jsonArray = text.match(/\[[\s\S]*\]/);
  if (jsonArray) return sanitizeJson(jsonArray[0]);

  const jsonObj = text.match(/\{[\s\S]*\}/);
  if (jsonObj) return sanitizeJson(jsonObj[0]);

  return sanitizeJson(text);
}

export function tryRepairTruncatedJson(text: string): string | null {
  let json = text.trim();

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

  if (openBraces === 0 && openBrackets === 0) return null;

  // Try cutting after the last complete object in an array
  const lastObj = json.lastIndexOf('},');
  if (lastObj > 0 && openBrackets > 0) {
    let candidate = json.substring(0, lastObj + 1);
    for (let i = 0; i < openBrackets; i++) candidate += ']';
    try { JSON.parse(candidate); return candidate; } catch { /* fall through */ }
  }

  // Brute-force: trim partial trailing data and close
  json = json.replace(/,\s*"[^"]*"?\s*:?\s*[^,}\]]*$/, '');
  json = json.replace(/,\s*$/, '');

  // Recount
  openBraces = 0; openBrackets = 0; inString = false; escapeNext = false;
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

  try { JSON.parse(json); return json; } catch { return null; }
}

/**
 * Unified parse-and-validate pipeline for Gemini JSON responses.
 * Tries direct parse → extract → repair. Returns the raw parsed object.
 */
export function parseJsonResponse(rawResponse: string): any {
  try {
    return JSON.parse(sanitizeJson(rawResponse));
  } catch { /* continue */ }

  const extracted = extractJsonFromResponse(rawResponse);
  try {
    return JSON.parse(extracted);
  } catch { /* continue */ }

  const repaired = tryRepairTruncatedJson(extracted);
  if (repaired) {
    return JSON.parse(repaired);
  }

  throw new Error('JSON parse failed after all attempts');
}

