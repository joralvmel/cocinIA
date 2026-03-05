import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services';
import { cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from '@/utils';
import { getCountryByCode, countries, currencies } from '@/constants';
import { useAutoSaveOnBack } from './useAutoSaveOnBack';

type GenderType = 'male' | 'female' | 'other' | null;
type ActivityLevelType = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
type MeasurementSystem = 'metric' | 'imperial';

export function useEditPersonalForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Measurement
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');

  // Basic info
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');

  // Metric (source of truth)
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<GenderType>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevelType>(null);

  // Imperial display
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(7);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  // Auto-select currency when country changes
  useEffect(() => {
    if (country) {
      const selectedCountry = getCountryByCode(country);
      if (selectedCountry && !currency) {
        setCurrency(selectedCountry.defaultCurrency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Sync imperial ← metric
  useEffect(() => {
    const { feet, inches } = cmToFeetInches(heightCm);
    setHeightFeet(feet);
    setHeightInches(inches);
  }, [heightCm]);

  useEffect(() => {
    setWeightLbs(kgToLbs(weightKg));
  }, [weightKg]);

  // ---- Load ----
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const profile = await profileService.getProfile();
        if (profile) {
          setDisplayName(profile.display_name || '');
          setCountry(profile.country || '');
          setCurrency(profile.currency || '');
          setHeightCm(profile.height_cm || 170);
          setWeightKg(profile.weight_kg || 70);
          setBirthDate(profile.birth_date || '');
          setGender(profile.gender);
          setActivityLevel(profile.activity_level);
          setMeasurementSystem(profile.measurement_system || 'metric');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- Save ----
  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await profileService.updateProfile({
        display_name: displayName || undefined,
        country: country || undefined,
        currency: currency || undefined,
        height_cm: heightCm,
        weight_kg: weightKg,
        birth_date: birthDate || undefined,
        gender: gender || undefined,
        activity_level: activityLevel || undefined,
        measurement_system: measurementSystem,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [displayName, country, currency, heightCm, weightKg, birthDate, gender, activityLevel, measurementSystem, saving]);

  // ---- Auto-save on back ----
  const { handleBack } = useAutoSaveOnBack(
    handleSave,
    [displayName, country, currency, heightCm, weightKg, birthDate, gender, activityLevel, measurementSystem, saving],
  );

  // ---- Imperial handlers ----
  const handleHeightFeetChange = (feet: number) => {
    setHeightFeet(feet);
    setHeightCm(feetInchesToCm(feet, heightInches));
  };

  const handleHeightInchesChange = (inches: number) => {
    setHeightInches(inches);
    setHeightCm(feetInchesToCm(heightFeet, inches));
  };

  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    setWeightKg(lbsToKg(lbs));
  };

  // ---- Derived values ----
  const selectedCountry = countries.find((c) => c.code === country);
  const selectedCurrency = currencies.find((c) => c.code === currency);

  return {
    // State
    loading,
    saving,
    alertVisible,
    setAlertVisible,
    measurementSystem,
    setMeasurementSystem,

    // Basic info
    displayName, setDisplayName,
    country, setCountry,
    currency, setCurrency,

    // Metric
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    birthDate, setBirthDate,
    gender, setGender,
    activityLevel, setActivityLevel,

    // Imperial
    heightFeet, heightInches, weightLbs,
    handleHeightFeetChange,
    handleHeightInchesChange,
    handleWeightLbsChange,

    // Derived
    selectedCountry,
    selectedCurrency,

    // Navigation
    handleBack,
  };
}

