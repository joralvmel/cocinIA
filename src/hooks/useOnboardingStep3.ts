import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/stores';
import { profileService } from '@/services';
import { cuisines } from '@/constants';

export function useOnboardingStep3() {
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

  // Filtered cuisines
  const filteredCuisines = useMemo(() => {
    if (!searchQuery.trim()) return cuisines;
    const query = searchQuery.toLowerCase();
    return cuisines.filter((c) => {
      const translatedLabel = t(c.labelKey, { defaultValue: c.defaultLabel });
      return (
        translatedLabel.toLowerCase().includes(query) ||
        c.defaultLabel.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, t]);

  // Selection helper
  const isSelected = useCallback(
    (id: string) => preferredCuisines.includes(id),
    [preferredCuisines],
  );

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
    setSaving(true);
    try {
      await profileService.saveCuisinePreferences(preferredCuisines);
      router.push('/(onboarding)/complete' as any);
    } catch (error) {
      console.error('Error saving cuisines:', error);
    } finally {
      setSaving(false);
    }
  }, [preferredCuisines, router]);

  const handleBack = useCallback(() => {
    previousStep();
    router.back();
  }, [previousStep, router]);

  return {
    // State
    saving,
    searchQuery,
    setSearchQuery,
    preferredCuisines,

    // Data
    filteredCuisines,

    // Selection
    isSelected,
    toggleCuisine,

    // Navigation
    stepLabels,
    handleNext,
    handleBack,
  };
}

