import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  SearchInput,
  Chip,
  StepperProgress,
} from '@/components/ui';
import { useOnboardingStep3 } from '@/hooks/useOnboardingStep3';

export default function OnboardingStep3() {
  const { t } = useTranslation();
  const {
    saving,
    searchQuery,
    setSearchQuery,
    preferredCuisines,
    filteredCuisines,
    isSelected,
    toggleCuisine,
    stepLabels,
    handleNext,
    handleBack,
  } = useOnboardingStep3();

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
