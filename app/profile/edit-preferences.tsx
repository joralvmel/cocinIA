import { useEffect, useState, useMemo } from 'react';
import {View, Text, ScrollView, Pressable, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Input,
  Button,
  Chip,
  Section,
  SearchInput,
  Switch,
  Loader,
  AlertModal,
  ScreenHeader,
  IconButton,
} from '@/components/ui';
import { profileService } from '@/services';
import {
  allergies,
  preferences,
  cuisines,
  equipment as equipmentList,
  type DietaryRestriction,
} from '@/constants';
import { QUICK_FILTERS } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface RestrictionState {
  id: string;
  type: string;
  customValue?: string;
  isAllergy: boolean;
}

export default function EditPreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Form state
  const [selectedRestrictions, setSelectedRestrictions] = useState<RestrictionState[]>([]);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Custom restriction input
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customIsAllergy, setCustomIsAllergy] = useState(false);

  // Search
  const [restrictionSearch, setRestrictionSearch] = useState('');
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profile, restrictions, equipment] = await Promise.all([
        profileService.getProfile(),
        profileService.getRestrictions(),
        profileService.getEquipment(),
      ]);

      if (profile) {
        setPreferredCuisines(profile.preferred_cuisines || []);
        setSelectedQuickFilters(profile.quick_filters || ['quick', 'healthy', 'vegetarian', 'cheap']);
      }

      if (restrictions) {
        setSelectedRestrictions(
          restrictions.map((r, index) => ({
            id: r.custom_value ? `custom_${index}_${Date.now()}` : r.restriction_type,
            type: r.restriction_type,
            customValue: r.custom_value || undefined,
            isAllergy: r.is_allergy,
          }))
        );
      }

      if (equipment) {
        setSelectedEquipment(equipment.map(e => e.equipment_type));
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
      // Save restrictions
      await profileService.saveRestrictions(
        selectedRestrictions.map((r) => ({
          restriction_type: r.type,
          custom_value: r.customValue,
          is_allergy: r.isAllergy,
        }))
      );

      // Save equipment
      await profileService.saveEquipment(
        selectedEquipment.map((e) => ({
          equipment_type: e,
        }))
      );

      // Save cuisines and quick filters
      await profileService.updateProfile({
        preferred_cuisines: preferredCuisines,
        quick_filters: selectedQuickFilters,
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

  // Filter restrictions
  const filteredAllergies = useMemo(() => {
    if (!restrictionSearch.trim()) return allergies;
    const query = restrictionSearch.toLowerCase();
    return allergies.filter((a) => {
      const translatedLabel = t(a.labelKey, { defaultValue: a.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || a.defaultLabel.toLowerCase().includes(query);
    });
  }, [restrictionSearch, t]);

  const filteredPreferences = useMemo(() => {
    if (!restrictionSearch.trim()) return preferences;
    const query = restrictionSearch.toLowerCase();
    return preferences.filter((p) => {
      const translatedLabel = t(p.labelKey, { defaultValue: p.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || p.defaultLabel.toLowerCase().includes(query);
    });
  }, [restrictionSearch, t]);

  // Filter cuisines
  const filteredCuisines = useMemo(() => {
    if (!cuisineSearch.trim()) return cuisines;
    const query = cuisineSearch.toLowerCase();
    return cuisines.filter((c) => {
      const translatedLabel = t(c.labelKey, { defaultValue: c.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || c.defaultLabel.toLowerCase().includes(query);
    });
  }, [cuisineSearch, t]);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    if (!equipmentSearch.trim()) return equipmentList;
    const query = equipmentSearch.toLowerCase();
    return equipmentList.filter((e) => {
      const translatedLabel = t(e.labelKey, { defaultValue: e.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || e.defaultLabel.toLowerCase().includes(query);
    });
  }, [equipmentSearch, t]);

  // Get custom restrictions
  const customRestrictions = selectedRestrictions.filter(
    (r) => r.customValue && !allergies.find((a) => a.id === r.id) && !preferences.find((p) => p.id === r.id)
  );

  const isRestrictionSelected = (id: string) => selectedRestrictions.some((r) => r.id === id);

  const toggleRestriction = (restriction: DietaryRestriction) => {
    if (isRestrictionSelected(restriction.id)) {
      setSelectedRestrictions((prev) => prev.filter((r) => r.id !== restriction.id));
    } else {
      setSelectedRestrictions((prev) => [
        ...prev,
        {
          id: restriction.id,
          type: restriction.id,
          isAllergy: restriction.isAllergy,
        },
      ]);
    }
  };

  const isCuisineSelected = (id: string) => preferredCuisines.includes(id);

  const toggleCuisine = (id: string) => {
    if (isCuisineSelected(id)) {
      setPreferredCuisines((prev) => prev.filter((c) => c !== id));
    } else {
      setPreferredCuisines((prev) => [...prev, id]);
    }
  };

  const isEquipmentSelected = (id: string) => selectedEquipment.includes(id);

  const toggleEquipment = (id: string) => {
    if (isEquipmentSelected(id)) {
      setSelectedEquipment((prev) => prev.filter((e) => e !== id));
    } else {
      setSelectedEquipment((prev) => [...prev, id]);
    }
  };

  const isQuickFilterSelected = (id: string) => selectedQuickFilters.includes(id);

  const toggleQuickFilter = (id: string) => {
    if (isQuickFilterSelected(id)) {
      setSelectedQuickFilters((prev) => prev.filter((f) => f !== id));
    } else if (selectedQuickFilters.length < 4) {
      // Max 4 filters
      setSelectedQuickFilters((prev) => [...prev, id]);
    }
  };

  const handleAddCustom = () => {
    if (!customValue.trim()) return;

    const id = `custom_${Date.now()}`;
    setSelectedRestrictions((prev) => [
      ...prev,
      {
        id,
        type: 'custom',
        customValue: customValue.trim(),
        isAllergy: customIsAllergy,
      },
    ]);

    setCustomValue('');
    setCustomIsAllergy(false);
    setShowCustomInput(false);
  };

  const removeCustomRestriction = (id: string) => {
    setSelectedRestrictions((prev) => prev.filter((r) => r.id !== id));
  };

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
        <ScreenHeader title={t('profile.cookingPreferences')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6 pb-24"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dietary Restrictions */}
        <Section title={`⚠️ ${t('profile.allergies')}`} className="mb-4">
          <SearchInput
            value={restrictionSearch}
            onChangeText={setRestrictionSearch}
            placeholder={t('common.search')}
            className="mt-2 mb-3"
          />
          <View className="flex-row flex-wrap gap-2">
            {filteredAllergies.map((item) => (
              <Chip
                key={item.id}
                label={`${item.icon || ''} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`}
                selected={isRestrictionSelected(item.id)}
                onPress={() => toggleRestriction(item)}
                size="sm"
              />
            ))}
          </View>
        </Section>

        <Section title={`🥗 ${t('profile.preferences')}`} className="mb-4">
          <View className="flex-row flex-wrap gap-2 mt-2">
            {filteredPreferences.map((item) => (
              <Chip
                key={item.id}
                label={`${item.icon || ''} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`}
                selected={isRestrictionSelected(item.id)}
                onPress={() => toggleRestriction(item)}
                size="sm"
              />
            ))}
          </View>
        </Section>

        {/* Custom Restrictions */}
        <Section title={`📝 ${t('profile.addCustom')}`} className="mb-6">
          {customRestrictions.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2 mb-3">
              {customRestrictions.map((r) => (
                <Chip
                  key={r.id}
                  label={`${r.isAllergy ? '⚠️' : '🥗'} ${r.customValue}`}
                  selected
                  onRemove={() => removeCustomRestriction(r.id)}
                  size="sm"
                />
              ))}
            </View>
          )}

          {showCustomInput ? (
            <View className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Input
                placeholder={t('profile.customRestrictionLabel')}
                value={customValue}
                onChangeText={setCustomValue}
                className="mb-3"
              />
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 dark:text-gray-300">
                  {t('profile.isAllergy')}
                </Text>
                <Switch value={customIsAllergy} onValueChange={setCustomIsAllergy} />
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setShowCustomInput(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={handleAddCustom}
                  className="flex-1"
                >
                  {t('common.save')}
                </Button>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowCustomInput(true)}
              className="flex-row items-center justify-center mt-2 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
            >
              <FontAwesome name="plus" size={14} color={colors.textSecondary} />
              <Text className="ml-2 text-gray-500 dark:text-gray-400">
                {t('profile.addCustom')}
              </Text>
            </Pressable>
          )}
        </Section>

        {/* Favorite Cuisines */}
        <Section title={`🍳 ${t('profile.favoriteCuisines')}`} className="mb-6">
          <SearchInput
            value={cuisineSearch}
            onChangeText={setCuisineSearch}
            placeholder={t('common.search')}
            className="mt-2 mb-3"
          />
          <View className="flex-row flex-wrap gap-2">
            {filteredCuisines.map((cuisine) => (
              <Chip
                key={cuisine.id}
                label={`${cuisine.icon} ${t(cuisine.labelKey, { defaultValue: cuisine.defaultLabel })}`}
                selected={isCuisineSelected(cuisine.id)}
                onPress={() => toggleCuisine(cuisine.id)}
                size="sm"
              />
            ))}
          </View>
        </Section>

        {/* Quick Filters */}
        <Section title={`⚡ ${t('profile.quickFilters' as any)}`} className="mb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t('recipeGeneration.selectUpTo4' as any)}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                label={`${filter.icon} ${t(`recipeGeneration.filters.${filter.id}`)}`}
                selected={isQuickFilterSelected(filter.id)}
                onPress={() => toggleQuickFilter(filter.id)}
                size="sm"
              />
            ))}
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('recipeGeneration.selectedCount' as any, { count: selectedQuickFilters.length, max: 4 })}
          </Text>
        </Section>

        {/* Kitchen Equipment */}
        <Section title={`🔧 ${t('profile.equipment')}`} className="mb-6">
          <SearchInput
            value={equipmentSearch}
            onChangeText={setEquipmentSearch}
            placeholder={t('common.search')}
            className="mt-2 mb-3"
          />
          <View className="flex-row flex-wrap gap-2">
            {filteredEquipment.map((eq) => (
              <Chip
                key={eq.id}
                label={`${eq.icon} ${t(eq.labelKey, { defaultValue: eq.defaultLabel })}`}
                selected={isEquipmentSelected(eq.id)}
                onPress={() => toggleEquipment(eq.id)}
                size="sm"
              />
            ))}
          </View>
          {selectedEquipment.length > 0 && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('profile.selectedCount', { count: selectedEquipment.length })}
            </Text>
          )}
        </Section>

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
