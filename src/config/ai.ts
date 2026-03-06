/**
 * AI Configuration
 * Centralized configuration for Gemini AI
 */

export const AI_CONFIG = {
  /**
   * Google Gemini Configuration
   * Using Gemini 2.5 Flash Lite for fast and accurate recipe generation
   */
  model: 'gemini-2.5-flash-lite' as const,
  temperature: 0.7,
  maxOutputTokens: 2500,
} as const;

/**
 * Weekly Plan AI Configuration
 * Needs higher token limits since each day generates 2-4 full recipes in one response.
 * A single recipe is ~800-1200 tokens, so 3 meals ≈ 3600 tokens minimum.
 */
export const WEEKLY_PLAN_AI_CONFIG = {
  model: 'gemini-2.5-flash-lite' as const,
  temperature: 0.7,
  maxOutputTokens: 8192,
  /** Per-day token limit — must be high enough for 3-4 full recipes (~8K tokens) */
  perDayTokens: 8192,
} as const;

/**
 * Fallback models to try when the primary model returns 503/429
 * Ordered by preference. Use only current models.
 */
export const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;

export type GeminiModel = (typeof FALLBACK_MODELS)[number];

