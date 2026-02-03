/**
 * AI Configuration
 * Centralized configuration for AI models and settings
 */

export const AI_CONFIG = {
  /**
   * Default OpenAI model for recipe generation
   * Change this to switch models easily (e.g., 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo')
   */
  model: 'gpt-4o-mini',

  /**
   * Temperature for recipe generation (0-2)
   * Lower = more deterministic, Higher = more creative
   */
  temperature: 0.7,

  /**
   * Maximum tokens for recipe generation response
   */
  maxTokens: 2500,

  /**
   * Maximum tokens for chat responses
   */
  chatMaxTokens: 1000,
} as const;

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

