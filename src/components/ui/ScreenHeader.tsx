import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export type { ScreenHeaderProps };

export function ScreenHeader({
  title,
  onBack,
  showBackButton = true,
  rightElement
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800"
      style={{ backgroundColor: colors.card }}
    >
      {showBackButton && (
        <Pressable onPress={handleBack} className="p-2 -ml-2">
          <FontAwesome name="arrow-left" size={20} color={colors.primary} />
        </Pressable>
      )}
      <Text
        className={`flex-1 text-lg font-semibold ${showBackButton ? 'ml-2' : ''}`}
        style={{ color: colors.primary }}
      >
        {title}
      </Text>
      {rightElement}
    </View>
  );
}
