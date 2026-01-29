import { View, Text } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';

export default function TabOneScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-primary-200">
      <Text className="text-primary-800 text-2xl font-bold">Tab One</Text>
      <View className="my-8 h-px w-4/5 bg-gray-300" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}
