import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEditPersonalForm } from '@/hooks';
import {
  getGenderOptions,
  getActivityOptions,
  getMeasurementOptions,
  getCountryOptions,
  getCurrencyOptions,
} from '@/utils';

export default function EditPersonalScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const form = useEditPersonalForm();

  // Bottom sheet visibility (UI-only state)
  const [genderSheetVisible, setGenderSheetVisible] = useState(false);
  const [activitySheetVisible, setActivitySheetVisible] = useState(false);
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

  // Options
  const genderOptions = getGenderOptions(t as any);
  const activityOptions = getActivityOptions(t as any);
  const measurementOptions = getMeasurementOptions(t as any);
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  // Derived display values
  const selectedGender = genderOptions.find((g) => g.value === form.gender);
  const selectedActivity = activityOptions.find((a) => a.value === form.activityLevel);

  if (form.loading || form.saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.profileInfo')} onBack={form.handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Info */}
            <Section title={`👤 ${t('profile.basicInfo')}`} className="mb-6">
              <View className="gap-4">
                <Input
                  label={t('profile.displayName')}
                  placeholder={t('profile.displayNamePlaceholder')}
                  value={form.displayName}
                  onChangeText={form.setDisplayName}
                  autoCapitalize="words"
                  showClearButton
                />
                <SelectTrigger
                  label={t('profile.country')}
                  value={form.country}
                  displayValue={form.selectedCountry ? `${form.selectedCountry.flag} ${form.selectedCountry.name}` : ''}
                  placeholder={t('profile.countryPlaceholder')}
                  onPress={() => setCountrySheetVisible(true)}
                />
                <SelectTrigger
                  label={t('profile.currency')}
                  value={form.currency}
                  displayValue={form.selectedCurrency ? `${form.selectedCurrency.symbol} ${form.selectedCurrency.name} (${form.selectedCurrency.code})` : ''}
                  placeholder={t('profile.currencyPlaceholder')}
                  onPress={() => setCurrencySheetVisible(true)}
                />
              </View>
            </Section>

            {/* Physical Info */}
            <Section title={`📏 ${t('profile.personalInfo')}`} className="mb-6">
              <View className="mb-4">
                <Text className="font-medium mb-2 text-sm text-gray-900 dark:text-gray-50">
                  {t('profile.measurementSystem')}
                </Text>
                <SegmentControl
                  options={measurementOptions}
                  value={form.measurementSystem}
                  onChange={(v) => form.setMeasurementSystem(v as 'metric' | 'imperial')}
                />
              </View>

              <View className="gap-5">
                {form.measurementSystem === 'metric' ? (
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <NumberInput label={t('profile.height')} value={form.heightCm} onChange={form.setHeightCm} min={100} max={250} unit={t('profile.heightUnit')} />
                    </View>
                    <View className="flex-1">
                      <NumberInput label={t('profile.weight')} value={form.weightKg} onChange={form.setWeightKg} min={30} max={300} unit={t('profile.weightUnit')} />
                    </View>
                  </View>
                ) : (
                  <>
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <NumberInput label={`${t('profile.height')} (ft)`} value={form.heightFeet} onChange={form.handleHeightFeetChange} min={3} max={8} unit="ft" />
                      </View>
                      <View className="flex-1">
                        <NumberInput label="(in)" value={form.heightInches} onChange={form.handleHeightInchesChange} min={0} max={11} unit="in" />
                      </View>
                    </View>
                    <NumberInput label={t('profile.weight')} value={form.weightLbs} onChange={form.handleWeightLbsChange} min={66} max={660} unit={t('profile.weightUnitImperial')} />
                  </>
                )}

                <DatePicker
                  label={t('profile.birthDate')}
                  value={form.birthDate}
                  onChange={form.setBirthDate}
                  placeholder={t('profile.birthDatePlaceholder')}
                  minYear={1920}
                  maxYear={new Date().getFullYear() - 10}
                />

                <SelectTrigger
                  label={t('profile.gender')}
                  value={form.gender || ''}
                  displayValue={selectedGender ? `${selectedGender.icon} ${selectedGender.label}` : ''}
                  placeholder={t('profile.genderPlaceholder')}
                  onPress={() => setGenderSheetVisible(true)}
                />

                <SelectTrigger
                  label={t('profile.activityLevel')}
                  value={form.activityLevel || ''}
                  displayValue={selectedActivity ? `${selectedActivity.icon} ${selectedActivity.label}` : ''}
                  placeholder={t('profile.activityPlaceholder')}
                  onPress={() => setActivitySheetVisible(true)}
                />
              </View>
            </Section>

            <View className="h-6" />
          </ScrollView>
        </View>

        {/* Bottom Sheets */}
        <SelectBottomSheet visible={countrySheetVisible} onClose={() => setCountrySheetVisible(false)} title={t('profile.country')} options={countryOptions} value={form.country} onChange={form.setCountry} searchable searchPlaceholder={t('profile.searchCountry')} />
        <SelectBottomSheet visible={currencySheetVisible} onClose={() => setCurrencySheetVisible(false)} title={t('profile.currency')} options={currencyOptions} value={form.currency} onChange={form.setCurrency} searchable searchPlaceholder={t('profile.searchCurrency')} />
        <SelectBottomSheet visible={genderSheetVisible} onClose={() => setGenderSheetVisible(false)} title={t('profile.gender')} options={genderOptions} value={form.gender || ''} onChange={(v) => form.setGender(v as any)} />
        <SelectBottomSheet visible={activitySheetVisible} onClose={() => setActivitySheetVisible(false)} title={t('profile.activityLevel')} options={activityOptions} value={form.activityLevel || ''} onChange={(v) => form.setActivityLevel(v as any)} />

        {/* Alert */}
        <AlertModal visible={form.alertVisible} onClose={() => form.setAlertVisible(false)} title={t('common.error')} message={t('profile.updateError')} variant="danger" confirmLabel={t('common.ok')} />
      </SafeAreaView>
    </View>
  );
}
