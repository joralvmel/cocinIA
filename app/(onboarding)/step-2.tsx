import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  SearchInput,
  Chip,
  StepperProgress,
  Section,
  Input,
  BottomSheet,
} from '@/components/ui';
import { useOnboardingStep2 } from '@/hooks/useOnboardingStep2';
import type { DietaryRestriction } from '@/constants';

export default function OnboardingStep2() {
  const { t } = useTranslation();
  const {
    saving,
    searchQuery,
    setSearchQuery,
    filteredAllergies,
    filteredPreferences,
    customRestrictions,
    isSelected,
    toggleRestriction,
    removeRestriction,
    showCustomSheet,
    setShowCustomSheet,
    customValue,
    setCustomValue,
    customIsAllergy,
    setCustomIsAllergy,
    handleAddCustom,
    stepLabels,
    handleNext,
    handleBack,
  } = useOnboardingStep2();

  const renderChip = (item: DietaryRestriction) => (
    <Chip
      key={item.id}
      label={`${item.icon || ''} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`}
      selected={isSelected(item.id)}
      onPress={() => toggleRestriction(item)}
      size="md"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="px-6 py-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <StepperProgress
          steps={stepLabels}
          currentStep={1}
          className="mb-8"
        />

        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {t('onboarding.restrictionsTitle')}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-2">
            {t('onboarding.restrictionsSubtitle')}
          </Text>
        </View>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.search')}
          className="mb-6"
        />

        {/* Allergies Section */}
        <Section
          title={`⚠️ ${t('onboarding.allergiesSection')}`}
          subtitle={t('onboarding.allergiesDescription')}
          className="mb-6"
        >
          <View className="flex-row flex-wrap gap-2 mt-3">
            {filteredAllergies.map(renderChip)}
          </View>
        </Section>

        {/* Preferences Section */}
        <Section
          title={`🥗 ${t('onboarding.preferencesSection')}`}
          subtitle={t('onboarding.preferencesDescription')}
          className="mb-6"
        >
          <View className="flex-row flex-wrap gap-2 mt-3">
            {filteredPreferences.map(renderChip)}
          </View>
        </Section>

        {/* Custom Restrictions */}
        {customRestrictions.length > 0 && (
          <Section title="📝 Custom" className="mb-6">
            <View className="flex-row flex-wrap gap-2 mt-3">
              {customRestrictions.map((r) => (
                <Chip
                  key={r.id}
                  label={`${r.isAllergy ? '⚠️' : '🥗'} ${r.customValue}`}
                  selected
                  onRemove={() => removeRestriction(r.id)}
                  size="md"
                />
              ))}
            </View>
          </Section>
        )}

        {/* Add Custom Button */}
        <Pressable
          onPress={() => setShowCustomSheet(true)}
          className="flex-row items-center justify-center py-3 mb-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
        >
          <Text className="text-primary-600 dark:text-primary-400 font-medium">
            + {t('onboarding.addCustomRestriction')}
          </Text>
        </Pressable>

        {/* Navigation */}
        <View className="flex-row gap-3 mt-4 mb-8">
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
      </ScrollView>

      {/* Custom Restriction Bottom Sheet */}
      <BottomSheet
        visible={showCustomSheet}
        onClose={() => setShowCustomSheet(false)}
        title={t('onboarding.addCustomRestriction')}
      >
        <View className="gap-4">
          <Input
            label={t('onboarding.customRestrictionPlaceholder')}
            value={customValue}
            onChangeText={setCustomValue}
            placeholder={t('onboarding.customRestrictionPlaceholder')}
            autoFocus
          />

          <View className="flex-row gap-2">
            <Chip
              label={`⚠️ ${t('onboarding.allergiesSection')}`}
              selected={customIsAllergy}
              onPress={() => setCustomIsAllergy(true)}
            />
            <Chip
              label={`🥗 ${t('onboarding.preferencesSection')}`}
              selected={!customIsAllergy}
              onPress={() => setCustomIsAllergy(false)}
            />
          </View>

          <Button
            onPress={handleAddCustom}
            variant="primary"
            fullWidth
            disabled={!customValue.trim()}
          >
            {t('common.save')}
          </Button>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
