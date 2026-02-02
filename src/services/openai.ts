import OpenAI from 'openai';
import { Platform } from 'react-native';

export const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    // Temporarily allow browser usage on web platform
    dangerouslyAllowBrowser: Platform.OS === 'web',
});