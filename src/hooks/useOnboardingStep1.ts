import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/stores';
import { useAuth } from '@/contexts';
import { profileService } from '@/services';
import { countries, currencies, getCountryByCode } from '@/constants';

export function useOnboardingStep1() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

  const {
    displayName,
    country,
    currency,
    errors,
    setDisplayName,
    setCountry,
    setCurrency,
    validateStep1,
    setCurrentStep,
  } = useOnboardingStore();

  // Pre-fill name from Google auth
  useEffect(() => {
    if (user?.user_metadata?.full_name && !displayName) {
      setDisplayName(user.user_metadata.full_name);
    }
  }, [user]);

  // Set current step
  useEffect(() => {
    setCurrentStep(0);
  }, []);

  // Auto-select currency when country changes
  useEffect(() => {
    if (country) {
      const selectedCountry = getCountryByCode(country);
      if (selectedCountry) {
        setCurrency(selectedCountry.defaultCurrency);
      }
    }
  }, [country]);

  // Memoized options
  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
      })),
    [],
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`,
        subtitle: c.symbol,
      })),
    [],
  );

  // Derived values
  const selectedCountry = countries.find((c) => c.code === country);
  const selectedCurrency = currencies.find((c) => c.code === currency);
  const isFormValid = displayName.trim().length >= 2 && !!country && !!currency;

  // Step labels
  const stepLabels = useMemo(
    () => [
      t('onboarding.steps.basics'),
      t('onboarding.steps.diet'),
      t('onboarding.steps.preferences'),
    ],
    [t],
  );

  // Navigation
  const handleNext = useCallback(async () => {
    if (!validateStep1()) return;

    setSaving(true);
    try {
      await profileService.saveBasicInfo({
        displayName,
        country,
        currency,
      });
      router.push('/(onboarding)/step-2' as any);
    } catch (error) {
      console.error('Error saving basic info:', error);
    } finally {
      setSaving(false);
    }
  }, [displayName, country, currency, validateStep1, router]);

  return {
    // Form state
    displayName,
    country,
    currency,
    errors,
    saving,
    isFormValid,

    // Setters
    setDisplayName,
    setCountry,
    setCurrency,

    // Sheet visibility
    countrySheetVisible,
    setCountrySheetVisible,
    currencySheetVisible,
    setCurrencySheetVisible,

    // Options
    countryOptions,
    currencyOptions,

    // Derived
    selectedCountry,
    selectedCurrency,
    stepLabels,

    // Actions
    handleNext,
  };
}

