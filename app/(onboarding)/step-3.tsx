import { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  SearchInput,
  Chip,
  StepperProgress,
} from '@/components/ui';
import { useOnboardingStore } from '@/stores';
import { profileService } from '@/services';
import { cuisines } from '@/constants';

export default function OnboardingStep3() {
  const router = useRouter();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    preferredCuisines,
    toggleCuisine,
    setCurrentStep,
    previousStep,
  } = useOnboardingStore();

  useEffect(() => {
    setCurrentStep(2);
  }, []);

  // Filter cuisines by search
  const filteredCuisines = useMemo(() => {
    if (!searchQuery.trim()) return cuisines;
    const query = searchQuery.toLowerCase();
    return cuisines.filter((c) => {
      const translatedLabel = t(c.labelKey, { defaultValue: c.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || c.defaultLabel.toLowerCase().includes(query);
    });
  }, [searchQuery, t]);

  const isSelected = (id: string) => preferredCuisines.includes(id);

  const handleNext = async () => {
    setSaving(true);
    try {
      await profileService.saveCuisinePreferences(preferredCuisines);
      router.push('/(onboarding)/complete' as any);
    } catch (error) {
      console.error('Error saving cuisines:', error);
    } finally {
      setSaving(false);
    }
  };


  const handleBack = () => {
    previousStep();
    router.back();
  };

  const stepLabels = [
    t('onboarding.steps.basics'),
    t('onboarding.steps.diet'),
    t('onboarding.steps.preferences'),
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="px-6 py-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <StepperProgress
          steps={stepLabels}
          currentStep={2}
          className="mb-8"
        />

        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {t('onboarding.cuisinesTitle')}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-2">
            {t('onboarding.cuisinesSubtitle')}
          </Text>
        </View>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.search')}
          className="mb-6"
        />

        {/* Cuisines Grid */}
        <View className="flex-row flex-wrap gap-2 mb-8">
          {filteredCuisines.map((cuisine) => (
            <Chip
              key={cuisine.id}
              label={`${cuisine.icon} ${t(cuisine.labelKey, { defaultValue: cuisine.defaultLabel })}`}
              selected={isSelected(cuisine.id)}
              onPress={() => toggleCuisine(cuisine.id)}
              size="md"
            />
          ))}
        </View>

        {/* Selected count */}
        {preferredCuisines.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('profile.selectedCount', { count: preferredCuisines.length })}
            </Text>
          </View>
        )}

        {/* Navigation */}
        <View className="gap-3 mt-4 mb-8">
          <View className="flex-row gap-3">
            <Button
              onPress={handleBack}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              {t('common.back')}
            </Button>
            <Button
              onPress={handleNext}
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={saving}
            >
              {saving ? t('common.loading') : t('common.next')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
