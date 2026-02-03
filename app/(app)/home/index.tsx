import { useState, useRef } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Input, IconButton, Loader } from '@/components/ui';
import { chatService, type ChatMessage } from '@/services';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Convert messages to chat history format
    const conversationHistory: ChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await chatService.sendMessage(
      userMessage.content,
      conversationHistory,
      'You are CocinIA, an AI assistant that helps users with cooking recipes, meal planning, and culinary tips in Spanish.'
    );

    setIsLoading(false);

    if (response.success) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      setError(response.error || 'Error sending message');
    }

    // Scroll to bottom after message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 px-4 pt-4 pb-4">
        {/* Messages Area */}
        <Card variant="outlined" className="flex-1 mb-4">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {t('home.placeholder')}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('home.subtitle')}
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-3 max-w-[85%] ${
                    message.role === 'user' ? 'self-end' : 'self-start'
                  }`}
                >
                  <View
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-600 rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'text-gray-900 dark:text-gray-50'
                      }`}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {isLoading && (
              <View className="self-start mb-3">
                <View className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-bl-md">
                  <Loader size="sm" />
                </View>
              </View>
            )}

            {error && (
              <View className="self-center mb-3 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            )}
          </ScrollView>
        </Card>

        {/* Input Area */}
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <Input
              placeholder={t('home.chatPlaceholder')}
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={1}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
          </View>
          <IconButton
            icon="paper-plane"
            variant="primary"
            size="lg"
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
