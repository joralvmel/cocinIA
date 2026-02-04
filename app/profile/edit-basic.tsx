import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Input,
  SelectTrigger,
  SelectBottomSheet,
  Loader,
  AlertModal,
  ScreenHeader,
  IconButton,
} from '@/components/ui';
import { profileService } from '@/services';
import { countries, currencies, getCountryByCode } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function EditBasicScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');

  // Bottom sheet visibility
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
      if (selectedCountry) {
        setCurrency(selectedCountry.defaultCurrency);
      }
    }
  }, [country]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getProfile();
      if (profile) {
        setDisplayName(profile.display_name || '');
        setCountry(profile.country || '');
        setCurrency(profile.currency || '');
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
        display_name: displayName || undefined,
        country: country || undefined,
        currency: currency || undefined,
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

  // Get display values
  const selectedCountry = countries.find((c) => c.code === country);
  const selectedCurrency = currencies.find((c) => c.code === currency);

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
        <ScreenHeader title={t('profile.basicInfo')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
        contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          <Input
            label={t('profile.displayName')}
            placeholder={t('profile.displayNamePlaceholder')}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
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
        {/* Spacer for floating button */}
        <View className="h-24" />
        </ScrollView>
      </View>

      {/* Floating Save Button */}
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
