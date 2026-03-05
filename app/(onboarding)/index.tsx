import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  SelectTrigger,
  SelectBottomSheet,
  StepperProgress,
  Logo,
} from '@/components/ui';
import { useOnboardingStep1 } from '@/hooks/useOnboardingStep1';

export default function OnboardingStep1() {
  const { t } = useTranslation();
  const {
    displayName,
    country,
    currency,
    errors,
    saving,
    isFormValid,
    setDisplayName,
    setCountry,
    setCurrency,
    countrySheetVisible,
    setCountrySheetVisible,
    currencySheetVisible,
    setCurrencySheetVisible,
    countryOptions,
    currencyOptions,
    selectedCountry,
    selectedCurrency,
    stepLabels,
    handleNext,
  } = useOnboardingStep1();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-4"
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <StepperProgress
            steps={stepLabels}
            currentStep={0}
            className="mb-8"
          />

          {/* Header */}
          <View className="items-center mb-8">
            <View className="mb-4">
              <Logo size="lg" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 text-center">
              {t('onboarding.welcomeTitle')}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 text-center mt-2">
              {t('onboarding.welcomeSubtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            <Input
              label={t('onboarding.nameLabel')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('onboarding.namePlaceholder')}
              error={errors.displayName}
              autoCapitalize="words"
            />

            <SelectTrigger
              label={t('onboarding.countryLabel')}
              value={country}
              displayValue={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : ''}
              placeholder={t('onboarding.countryPlaceholder')}
              onPress={() => setCountrySheetVisible(true)}
              error={errors.country}
            />

            <SelectTrigger
              label={t('onboarding.currencyLabel')}
              value={currency}
              displayValue={selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.name} (${selectedCurrency.code})` : ''}
              placeholder={t('onboarding.currencyPlaceholder')}
              onPress={() => setCurrencySheetVisible(true)}
              error={errors.currency}
            />
          </View>

          {/* Spacer */}
          <View className="flex-1 min-h-[40px]" />

          {/* Navigation */}
          <View className="mt-6">
            <Button
              onPress={handleNext}
              variant="primary"
              size="lg"
              fullWidth
              disabled={saving || !isFormValid}
            >
              {saving ? t('common.loading') : t('common.next')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selector */}
      <SelectBottomSheet
        visible={countrySheetVisible}
        onClose={() => setCountrySheetVisible(false)}
        title={t('onboarding.countryLabel')}
        options={countryOptions}
        value={country}
        onChange={(v) => setCountry(v)}
        searchable
        searchPlaceholder={t('profile.searchCountry')}
      />

      {/* Currency Selector */}
      <SelectBottomSheet
        visible={currencySheetVisible}
        onClose={() => setCurrencySheetVisible(false)}
        title={t('onboarding.currencyLabel')}
        options={currencyOptions}
        value={currency}
        onChange={(v) => setCurrency(v)}
        searchable
        searchPlaceholder={t('profile.searchCurrency')}
      />
    </SafeAreaView>
  );
}
