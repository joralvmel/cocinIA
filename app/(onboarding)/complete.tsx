import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Logo, Loader } from '@/components/ui';
import { useOnboardingStore } from '@/stores';
import { profileService } from '@/services';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function OnboardingComplete() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { displayName, reset } = useOnboardingStore();

  // Complete onboarding when screen loads
  useEffect(() => {
    const completeOnboarding = async () => {
      setCompleting(true);
      try {
        await profileService.completeOnboarding();
        setCompleted(true);
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setCompleting(false);
      }
    };

    completeOnboarding();
  }, []);

  const handleGetStarted = () => {
    // Clear the onboarding store
    reset();
    // Navigate to home
    router.replace('/(app)/home');
  };

  if (completing) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-6">
          <FontAwesome name="check" size={48} color={colors.primary} />
        </View>

        {/* Logo */}
        <View className="mb-6">
          <Logo size="lg" />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-2">
          {t('onboarding.completeTitle')}
        </Text>

        {/* Welcome Message */}
        <Text className="text-xl text-primary-600 dark:text-primary-400 text-center font-semibold mb-4">
          {t('onboarding.welcomeMessage', { name: displayName || 'Chef' })}
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-12">
          {t('onboarding.completeSubtitle')}
        </Text>

        {/* Features Summary */}
        <View className="w-full max-w-sm gap-4 mb-12">
          <FeatureItem
            icon="cutlery"
            title={t('onboarding.featureRecipesTitle')}
            subtitle={t('onboarding.featureRecipesSubtitle')}
            colors={colors}
          />
          <FeatureItem
            icon="calendar"
            title={t('onboarding.featurePlanTitle')}
            subtitle={t('onboarding.featurePlanSubtitle')}
            colors={colors}
          />
          <FeatureItem
            icon="shopping-cart"
            title={t('onboarding.featureShoppingTitle')}
            subtitle={t('onboarding.featureShoppingSubtitle')}
            colors={colors}
          />
        </View>
      </View>

      {/* Get Started Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={handleGetStarted}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!completed}
        >
          {t('onboarding.getStarted')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  subtitle: string;
  colors: { primary: string; textSecondary: string };
}

function FeatureItem({ icon, title, subtitle, colors }: FeatureItemProps) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center">
        <FontAwesome name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 dark:text-gray-50">
          {title}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
