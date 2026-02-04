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

export type GeminiModel = 'gemini-2.5-flash-lite' | 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';

