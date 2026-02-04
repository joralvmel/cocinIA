import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NumberInput,
  DatePicker,
  SelectTrigger,
  SelectBottomSheet,
  SegmentControl,
  Loader,
  AlertModal,
  ScreenHeader,
  IconButton,
} from '@/components/ui';
import { profileService } from '@/services';
import { cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from '@/utils';
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
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Measurement system
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');

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

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

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
    setSaving(true);
    try {
      await profileService.updateProfile({
        height_cm: heightCm,
        weight_kg: weightKg,
        birth_date: birthDate || undefined,
        gender: gender || undefined,
        activity_level: activityLevel || undefined,
        measurement_system: measurementSystem,
      });
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    if (alertType === 'success') {
      router.back();
    }
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
        <ScreenHeader title={t('profile.personalInfo')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Measurement System Toggle */}
        <View className="mb-6">
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

        {/* Spacer for floating button */}
        <View className="h-24" />
        </ScrollView>
      </View>

      {/* Floating Save Button */}
      <View
        className="absolute bottom-6 right-6"
        style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, borderRadius: 28 }}
      >
        {saving ? (
          <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center">
            <ActivityIndicator color="#ffffff" size="small" />
          </View>
        ) : (
          <IconButton
            icon="check"
            size="xl"
            variant="primary"
            onPress={handleSave}
          />
        )}
      </View>

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
        title={alertType === 'success' ? t('common.done') : t('common.error')}
        message={alertType === 'success' ? t('profile.profileUpdated') : t('profile.updateError')}
        variant={alertType === 'success' ? 'info' : 'danger'}
        confirmLabel={t('common.done')}
      />
      </SafeAreaView>
    </View>
  );
}
