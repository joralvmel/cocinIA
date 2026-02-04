import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Input,
  NumberInput,
  DatePicker,
  SelectTrigger,
  SelectBottomSheet,
  SegmentControl,
  Loader,
  AlertModal,
  ScreenHeader,
  Section,
} from '@/components/ui';
import { profileService } from '@/services';
import { cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from '@/utils';
import { countries, currencies, getCountryByCode } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';

type GenderType = 'male' | 'female' | 'other' | null;
type ActivityLevelType = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
type MeasurementSystem = 'metric' | 'imperial';

export default function EditPersonalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Measurement system
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');

  // Basic info state
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');

  // Form state (stored in metric internally)
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<GenderType>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevelType>(null);

  // Imperial display values
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(7);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  // Bottom sheet visibility
  const [genderSheetVisible, setGenderSheetVisible] = useState(false);
  const [activitySheetVisible, setActivitySheetVisible] = useState(false);
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  // Auto-select currency when country changes
  useEffect(() => {
    if (country) {
      const selectedCountry = getCountryByCode(country);
      if (selectedCountry && !currency) {
        setCurrency(selectedCountry.defaultCurrency);
      }
    }
  }, [country]);

  // Sync imperial values when metric values change
  useEffect(() => {
    const { feet, inches } = cmToFeetInches(heightCm);
    setHeightFeet(feet);
    setHeightInches(inches);
  }, [heightCm]);

  useEffect(() => {
    setWeightLbs(kgToLbs(weightKg));
  }, [weightKg]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getProfile();
      if (profile) {
        // Basic info
        setDisplayName(profile.display_name || '');
        setCountry(profile.country || '');
        setCurrency(profile.currency || '');
        // Personal info
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
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await profileService.updateProfile({
        // Basic info
        display_name: displayName || undefined,
        country: country || undefined,
        currency: currency || undefined,
        // Personal info
        height_cm: heightCm,
        weight_kg: weightKg,
        birth_date: birthDate || undefined,
        gender: gender || undefined,
        activity_level: activityLevel || undefined,
        measurement_system: measurementSystem,
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertVisible(true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Auto-save when navigating back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleSave().then(() => {
          router.back();
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [displayName, country, currency, heightCm, weightKg, birthDate, gender, activityLevel, measurementSystem])
  );

  // Handle back from ScreenHeader
  const handleBack = async () => {
    await handleSave();
    router.back();
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  // Handle imperial height changes
  const handleHeightFeetChange = (feet: number) => {
    setHeightFeet(feet);
    setHeightCm(feetInchesToCm(feet, heightInches));
  };

  const handleHeightInchesChange = (inches: number) => {
    setHeightInches(inches);
    setHeightCm(feetInchesToCm(heightFeet, inches));
  };

  // Handle imperial weight change
  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs);
    setWeightKg(lbsToKg(lbs));
  };

  // Gender options
  const genderOptions = [
    { value: 'male', label: t('profile.genderMale'), icon: '👨' },
    { value: 'female', label: t('profile.genderFemale'), icon: '👩' },
    { value: 'other', label: t('profile.genderOther'), icon: '🧑' },
  ];

  // Activity level options
  const activityOptions = [
    {
      value: 'sedentary',
      label: t('profile.activitySedentary'),
      subtitle: t('profile.activitySedentaryDesc'),
      icon: '🪑'
    },
    {
      value: 'light',
      label: t('profile.activityLight'),
      subtitle: t('profile.activityLightDesc'),
      icon: '🚶'
    },
    {
      value: 'moderate',
      label: t('profile.activityModerate'),
      subtitle: t('profile.activityModerateDesc'),
      icon: '🏃'
    },
    {
      value: 'active',
      label: t('profile.activityActive'),
      subtitle: t('profile.activityActiveDesc'),
      icon: '🏋️'
    },
    {
      value: 'very_active',
      label: t('profile.activityVeryActive'),
      subtitle: t('profile.activityVeryActiveDesc'),
      icon: '🏆'
    },
  ];

  // Get display values
  const selectedGender = genderOptions.find((g) => g.value === gender);
  const selectedActivity = activityOptions.find((a) => a.value === activityLevel);

  // Country options
  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
      })),
    []
  );

  // Currency options
  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`,
        subtitle: c.symbol,
      })),
    []
  );

  // Get selected country/currency display values
  const selectedCountry = countries.find((c) => c.code === country);
  const selectedCurrency = currencies.find((c) => c.code === currency);

  // Measurement system toggle options
  const measurementOptions = [
    { value: 'metric', label: t('profile.metric') },
    { value: 'imperial', label: t('profile.imperial') },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.profileInfo')} onBack={handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info Section */}
        <Section title={`👤 ${t('profile.basicInfo')}`} className="mb-6">
          <View className="gap-4">
            <Input
              label={t('profile.displayName')}
              placeholder={t('profile.displayNamePlaceholder')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              showClearButton
            />

            <SelectTrigger
              label={t('profile.country')}
              value={country}
              displayValue={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : ''}
              placeholder={t('profile.countryPlaceholder')}
              onPress={() => setCountrySheetVisible(true)}
            />

            <SelectTrigger
              label={t('profile.currency')}
              value={currency}
              displayValue={selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.name} (${selectedCurrency.code})` : ''}
              placeholder={t('profile.currencyPlaceholder')}
              onPress={() => setCurrencySheetVisible(true)}
            />
          </View>
        </Section>

        {/* Physical Info Section */}
        <Section title={`📏 ${t('profile.personalInfo')}`} className="mb-6">
          {/* Measurement System Toggle */}
          <View className="mb-4">
            <Text className="font-medium mb-2 text-sm text-gray-900 dark:text-gray-50">
              {t('profile.measurementSystem')}
            </Text>
            <SegmentControl
              options={measurementOptions}
              value={measurementSystem}
              onChange={(v) => setMeasurementSystem(v as MeasurementSystem)}
            />
          </View>

          {/* Height & Weight */}
          <View className="gap-5">
          {measurementSystem === 'metric' ? (
            <View className="flex-row gap-4">
              <View className="flex-1">
                <NumberInput
                  label={t('profile.height')}
                  value={heightCm}
                  onChange={setHeightCm}
                  min={100}
                  max={250}
                  unit={t('profile.heightUnit')}
                />
              </View>
              <View className="flex-1">
                <NumberInput
                  label={t('profile.weight')}
                  value={weightKg}
                  onChange={setWeightKg}
                  min={30}
                  max={300}
                  unit={t('profile.weightUnit')}
                />
              </View>
            </View>
          ) : (
            <>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <NumberInput
                    label={`${t('profile.height')} (ft)`}
                    value={heightFeet}
                    onChange={handleHeightFeetChange}
                    min={3}
                    max={8}
                    unit="ft"
                  />
                </View>
                <View className="flex-1">
                  <NumberInput
                    label="(in)"
                    value={heightInches}
                    onChange={handleHeightInchesChange}
                    min={0}
                    max={11}
                    unit="in"
                  />
                </View>
              </View>
              <NumberInput
                label={t('profile.weight')}
                value={weightLbs}
                onChange={handleWeightLbsChange}
                min={66}
                max={660}
                unit={t('profile.weightUnitImperial')}
              />
            </>
          )}

          <DatePicker
            label={t('profile.birthDate')}
            value={birthDate}
            onChange={setBirthDate}
            placeholder={t('profile.birthDatePlaceholder')}
            minYear={1920}
            maxYear={new Date().getFullYear() - 10}
          />

          <SelectTrigger
            label={t('profile.gender')}
            value={gender || ''}
            displayValue={selectedGender ? `${selectedGender.icon} ${selectedGender.label}` : ''}
            placeholder={t('profile.genderPlaceholder')}
            onPress={() => setGenderSheetVisible(true)}
          />

          <SelectTrigger
            label={t('profile.activityLevel')}
            value={activityLevel || ''}
            displayValue={selectedActivity ? `${selectedActivity.icon} ${selectedActivity.label}` : ''}
            placeholder={t('profile.activityPlaceholder')}
            onPress={() => setActivitySheetVisible(true)}
          />
        </View>
        </Section>

        {/* Spacer for safe area */}
        <View className="h-6" />
        </ScrollView>
      </View>

      {/* Country Selector */}
      <SelectBottomSheet
        visible={countrySheetVisible}
        onClose={() => setCountrySheetVisible(false)}
        title={t('profile.country')}
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
        title={t('profile.currency')}
        options={currencyOptions}
        value={currency}
        onChange={(v) => setCurrency(v)}
        searchable
        searchPlaceholder={t('profile.searchCurrency')}
      />

      {/* Gender Selector */}
      <SelectBottomSheet
        visible={genderSheetVisible}
        onClose={() => setGenderSheetVisible(false)}
        title={t('profile.gender')}
        options={genderOptions}
        value={gender || ''}
        onChange={(v) => setGender(v as GenderType)}
      />

      {/* Activity Level Selector */}
      <SelectBottomSheet
        visible={activitySheetVisible}
        onClose={() => setActivitySheetVisible(false)}
        title={t('profile.activityLevel')}
        options={activityOptions}
        value={activityLevel || ''}
        onChange={(v) => setActivityLevel(v as ActivityLevelType)}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={handleAlertClose}
        title={t('common.error')}
        message={t('profile.updateError')}
        variant="danger"
        confirmLabel={t('common.ok')}
      />
      </SafeAreaView>
    </View>
  );
}
