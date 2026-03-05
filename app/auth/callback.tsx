import { View, ActivityIndicator } from 'react-native';
import { useAuthCallback } from '@/hooks/useAuthCallback';

export default function AuthCallback() {
  useAuthCallback();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}
