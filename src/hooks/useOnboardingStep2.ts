import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/stores';
import { profileService } from '@/services';
import { allergies, preferences, type DietaryRestriction } from '@/constants';

export function useOnboardingStep2() {
  const router = useRouter();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customIsAllergy, setCustomIsAllergy] = useState(false);

  const {
    restrictions,
    addRestriction,
    removeRestriction,
    setCurrentStep,
    previousStep,
  } = useOnboardingStore();

  useEffect(() => {
    setCurrentStep(1);
  }, []);

  // Filtered lists
  const filteredAllergies = useMemo(() => {
    if (!searchQuery.trim()) return allergies;
    const query = searchQuery.toLowerCase();
    return allergies.filter((a) => {
      const translatedLabel = t(a.labelKey, { defaultValue: a.defaultLabel });
      return (
        translatedLabel.toLowerCase().includes(query) ||
        a.defaultLabel.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, t]);

  const filteredPreferences = useMemo(() => {
    if (!searchQuery.trim()) return preferences;
    const query = searchQuery.toLowerCase();
    return preferences.filter((p) => {
      const translatedLabel = t(p.labelKey, { defaultValue: p.defaultLabel });
      return (
        translatedLabel.toLowerCase().includes(query) ||
        p.defaultLabel.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, t]);

  // Custom restrictions
  const customRestrictions = useMemo(
    () =>
      restrictions.filter(
        (r) =>
          r.customValue &&
          !allergies.find((a) => a.id === r.id) &&
          !preferences.find((p) => p.id === r.id),
      ),
    [restrictions],
  );

  // Selection helpers
  const isSelected = useCallback(
    (id: string) => restrictions.some((r) => r.id === id),
    [restrictions],
  );

  const toggleRestriction = useCallback(
    (restriction: DietaryRestriction) => {
      if (restrictions.some((r) => r.id === restriction.id)) {
        removeRestriction(restriction.id);
      } else {
        addRestriction({
          id: restriction.id,
          type: restriction.id,
          isAllergy: restriction.isAllergy,
        });
      }
    },
    [restrictions, addRestriction, removeRestriction],
  );

  // Custom restriction
  const handleAddCustom = useCallback(() => {
    if (!customValue.trim()) return;

    const id = `custom_${Date.now()}`;
    addRestriction({
      id,
      type: 'custom',
      customValue: customValue.trim(),
      isAllergy: customIsAllergy,
    });

    setCustomValue('');
    setShowCustomSheet(false);
  }, [customValue, customIsAllergy, addRestriction]);

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
      await profileService.saveRestrictions(
        restrictions.map((r) => ({
          restriction_type: r.type,
          custom_value: r.customValue,
          is_allergy: r.isAllergy,
        })),
      );
      router.push('/(onboarding)/step-3' as any);
    } catch (error) {
      console.error('Error saving restrictions:', error);
    } finally {
      setSaving(false);
    }
  }, [restrictions, router]);

  const handleBack = useCallback(() => {
    previousStep();
    router.back();
  }, [previousStep, router]);

  return {
    // State
    saving,
    searchQuery,
    setSearchQuery,

    // Filtered data
    filteredAllergies,
    filteredPreferences,
    customRestrictions,

    // Selection
    isSelected,
    toggleRestriction,
    removeRestriction,

    // Custom restriction sheet
    showCustomSheet,
    setShowCustomSheet,
    customValue,
    setCustomValue,
    customIsAllergy,
    setCustomIsAllergy,
    handleAddCustom,

    // Navigation
    stepLabels,
    handleNext,
    handleBack,
  };
}

