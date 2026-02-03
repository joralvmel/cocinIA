import OpenAI from 'openai';
import { Platform } from 'react-native';

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

/**
 * Simple chat service for communicating with OpenAI
 */
export const chatService = {
    /**
     * Send a message to OpenAI and get a response
     */
    async sendMessage(
        userMessage: string,
        conversationHistory: ChatMessage[] = [],
        systemPrompt?: string
    ): Promise<ChatResponse> {
        try {
            const messages: ChatMessage[] = [];

            // Add system prompt if provided
            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt,
                });
            }

            // Add conversation history
            messages.push(...conversationHistory);

            // Add the new user message
            messages.push({
                role: 'user',
                content: userMessage,
            });

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // Cost-effective model for testing
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
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
