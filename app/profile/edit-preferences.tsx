import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Input,
  Chip,
  Section,
  SearchInput,
  Loader,
  AlertModal,
  ScreenHeader,
  MultiActionButton,
  BottomSheet,
  type ActionOption,
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

interface RestrictionState {
  id: string;
  type: string;
  customValue?: string;
  isAllergy: boolean;
  isSelected: boolean;
}

interface CuisineState {
  id: string;
  type: string;
  customName?: string;
  isSelected: boolean;
}

interface EquipmentState {
  id: string;
  type: string;
  customName?: string;
  isSelected: boolean;
}

interface QuickFilterState {
  id: string;
  filter: string;
  isCustom: boolean;
  isSelected: boolean;
}

export default function EditPreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Form state
  const [selectedRestrictions, setSelectedRestrictions] = useState<RestrictionState[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineState[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentState[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<QuickFilterState[]>([]);

  // Custom input
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState<'allergy' | 'preference' | 'cuisine' | 'equipment' | 'filter'>('allergy');

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profile, restrictions, equipment, cuisineData, quickFiltersData] = await Promise.all([
        profileService.getProfile(),
        profileService.getRestrictions(),
        profileService.getEquipment(),
        profileService.getCuisines(),
        profileService.getQuickFilters(),
      ]);

      if (profile) {
        // Legacy: preferred_cuisines from profile (predefined ones only)
        const predefinedCuisineIds = cuisines.map(c => c.id);
        const legacyCuisines = (profile.preferred_cuisines || [])
          .filter(c => predefinedCuisineIds.includes(c))
          .map(c => ({ id: c, type: c, isSelected: true }));

        // Combine with cuisines from profile_cuisines table
        const dbCuisines = (cuisineData || []).map(c => ({
          id: c.id,
          type: c.cuisine_type,
          customName: c.custom_name || undefined,
          isSelected: true,  // Already in DB = already selected
        }));

        setSelectedCuisines([...legacyCuisines, ...dbCuisines]);

        // Load quick filters from new table
        if (quickFiltersData && quickFiltersData.length > 0) {
          const filters = quickFiltersData.map(f => ({
            id: f.id,
            filter: f.custom_name || f.filter_type,
            isCustom: f.filter_type === 'custom',
            isSelected: true, // Already in DB = already selected
          }));
          setSelectedQuickFilters(filters);
        }
      }

      if (restrictions) {
        setSelectedRestrictions(
          restrictions.map((r) => ({
            id: r.id,
            type: r.restriction_type,
            customValue: r.custom_value || undefined,
            isAllergy: r.is_allergy,
            isSelected: true,  // Already in DB = already selected
          }))
        );
      }

      if (equipment) {
        setSelectedEquipment(
          equipment.map((e) => ({
            id: e.id,
            type: e.equipment_type,
            customName: e.custom_name || undefined,
            isSelected: true,  // Already in DB = already selected
          }))
        );
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
      // Save only selected restrictions
      await profileService.saveRestrictions(
        selectedRestrictions
          .filter(r => r.isSelected)
          .map((r) => ({
            restriction_type: r.type,
            custom_value: r.customValue,
            is_allergy: r.isAllergy,
          }))
      );

      // Save only selected equipment
      await profileService.saveEquipment(
        selectedEquipment
          .filter(e => e.isSelected)
          .map((e) => ({
            equipment_type: e.type,
            custom_name: e.customName,
          }))
      );

      // Save only selected cuisines to profile_cuisines table
      const customCuisines = selectedCuisines.filter(c => c.customName && c.isSelected);
      await profileService.saveCuisines(
        customCuisines.map((c) => ({
          cuisine_type: c.type,
          custom_name: c.customName,
        }))
      );

      // Save only selected predefined cuisines to profile
      const predefinedCuisineIds = cuisines.map(c => c.id);
      const predefinedCuisines = selectedCuisines
        .filter(c => predefinedCuisineIds.includes(c.type) && !c.customName && c.isSelected)
        .map(c => c.type);

      await profileService.updateProfile({
        preferred_cuisines: predefinedCuisines,
      });

      // Save quick filters to new table
      const filtersToSave = selectedQuickFilters
        .filter(f => f.isSelected) // Only save selected ones
        .map(f => {
          if (f.isCustom) {
            return { filter_type: 'custom', custom_name: f.filter };
          } else {
            return { filter_type: f.filter };
          }
        });

      await profileService.saveQuickFilters(filtersToSave);

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
    }, [selectedRestrictions, selectedCuisines, selectedQuickFilters, selectedEquipment])
  );

  const handleBack = async () => {
    await handleSave();
    router.back();
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  // Filter lists
  const filteredAllergies = useMemo(() => {
    if (!globalSearch.trim()) return allergies;
    const query = globalSearch.toLowerCase();
    return allergies.filter((a) => {
      const translatedLabel = t(a.labelKey, { defaultValue: a.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || a.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredPreferences = useMemo(() => {
    if (!globalSearch.trim()) return preferences;
    const query = globalSearch.toLowerCase();
    return preferences.filter((p) => {
      const translatedLabel = t(p.labelKey, { defaultValue: p.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || p.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredCuisines = useMemo(() => {
    if (!globalSearch.trim()) return cuisines;
    const query = globalSearch.toLowerCase();
    return cuisines.filter((c) => {
      const translatedLabel = t(c.labelKey, { defaultValue: c.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || c.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredEquipment = useMemo(() => {
    if (!globalSearch.trim()) return equipmentList;
    const query = globalSearch.toLowerCase();
    return equipmentList.filter((e) => {
      const translatedLabel = t(e.labelKey, { defaultValue: e.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || e.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  // Get custom items
  const customAllergies = selectedRestrictions.filter(r => r.customValue && r.isAllergy);
  const customPreferences = selectedRestrictions.filter(r => r.customValue && !r.isAllergy);
  const customCuisines = selectedCuisines.filter(c => c.customName);
  const customEquipment = selectedEquipment.filter(e => e.customName);

  // Check functions
  const isRestrictionSelected = (id: string) => selectedRestrictions.some((r) => r.type === id && r.isSelected);

  const toggleRestriction = (restriction: DietaryRestriction) => {
    const existing = selectedRestrictions.find(r => r.type === restriction.id);
    if (existing) {
      // Toggle the isSelected state
      setSelectedRestrictions((prev) =>
        prev.map((r) =>
          r.id === existing.id ? { ...r, isSelected: !r.isSelected } : r
        )
      );
    } else {
      // Add new restriction in selected state
      setSelectedRestrictions((prev) => [
        ...prev,
        {
          id: `new_${Date.now()}`,
          type: restriction.id,
          isAllergy: restriction.isAllergy,
          isSelected: true,
        },
      ]);
    }
  };

  const isCuisineSelected = (id: string) => selectedCuisines.some((c) => c.type === id && c.isSelected);

  const toggleCuisine = (id: string) => {
    const existing = selectedCuisines.find(c => c.type === id);
    if (existing) {
      // Toggle the isSelected state
      setSelectedCuisines((prev) =>
        prev.map((c) =>
          c.id === existing.id ? { ...c, isSelected: !c.isSelected } : c
        )
      );
    } else {
      // Add new cuisine in selected state
      setSelectedCuisines((prev) => [...prev, { id: `new_${Date.now()}`, type: id, isSelected: true }]);
    }
  };

  const isEquipmentSelected = (id: string) => selectedEquipment.some((e) => e.type === id && e.isSelected);

  const toggleEquipment = (id: string) => {
    const existing = selectedEquipment.find(e => e.type === id);
    if (existing) {
      // Toggle the isSelected state
      setSelectedEquipment((prev) =>
        prev.map((e) =>
          e.id === existing.id ? { ...e, isSelected: !e.isSelected } : e
        )
      );
    } else {
      // Add new equipment in selected state
      setSelectedEquipment((prev) => [...prev, { id: `new_${Date.now()}`, type: id, isSelected: true }]);
    }
  };

  const isQuickFilterSelected = (id: string) => {
    const filter = selectedQuickFilters.find(f => f.filter === id && !f.isCustom);
    return filter?.isSelected ?? false;
  };

  const toggleQuickFilter = (id: string) => {
    const existing = selectedQuickFilters.find(f => f.filter === id && !f.isCustom);
    if (existing) {
      // Toggle the isSelected state
      setSelectedQuickFilters((prev) =>
        prev.map((f) =>
          f.id === existing.id ? { ...f, isSelected: !f.isSelected } : f
        )
      );
    } else {
      // Add new filter in selected state
      setSelectedQuickFilters((prev) => [
        ...prev,
        { id: `new_${Date.now()}`, filter: id, isCustom: false, isSelected: true }
      ]);
    }
  };

  // Remove custom items
  const removeCustomRestriction = (id: string) => {
    setSelectedRestrictions((prev) => prev.filter((r) => r.id !== id));
  };

  const removeCustomCuisine = (id: string) => {
    setSelectedCuisines((prev) => prev.filter((c) => c.id !== id));
  };

  const removeCustomEquipment = (id: string) => {
    setSelectedEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const removeCustomFilter = (filter: string) => {
    setSelectedQuickFilters((prev) => prev.filter((f) => f.filter !== filter));
  };

  // Add custom item
  const handleAddCustom = () => {
    if (!customValue.trim()) return;

    const id = `custom_${Date.now()}`;
    const value = customValue.trim();

    if (customType === 'allergy') {
      setSelectedRestrictions((prev) => [
        ...prev,
        { id, type: 'custom', customValue: value, isAllergy: true, isSelected: true },
      ]);
    } else if (customType === 'preference') {
      setSelectedRestrictions((prev) => [
        ...prev,
        { id, type: 'custom', customValue: value, isAllergy: false, isSelected: true },
      ]);
    } else if (customType === 'cuisine') {
      setSelectedCuisines((prev) => [
        ...prev,
        { id, type: 'custom', customName: value, isSelected: true },
      ]);
    } else if (customType === 'equipment') {
      setSelectedEquipment((prev) => [
        ...prev,
        { id, type: 'custom', customName: value, isSelected: true },
      ]);
    } else if (customType === 'filter') {
      setSelectedQuickFilters((prev) => [
        ...prev,
        { id, filter: value, isCustom: true, isSelected: true }
      ]);
    }

    setCustomValue('');
    setShowCustomInput(false);
  };

  const openCustomInput = (type: typeof customType) => {
    setCustomType(type);
    setShowCustomInput(true);
  };

  const customActionOptions: ActionOption[] = [
    { id: 'allergy', label: t('profile.addAllergy' as any), icon: 'exclamation-triangle', color: 'red', onPress: () => openCustomInput('allergy') },
    { id: 'preference', label: t('profile.addPreference' as any), icon: 'leaf', color: 'green', onPress: () => openCustomInput('preference') },
    { id: 'cuisine', label: t('profile.addCuisine' as any), icon: 'cutlery', color: 'amber', onPress: () => openCustomInput('cuisine') },
    { id: 'equipment', label: t('profile.addEquipment' as any), icon: 'wrench', color: 'blue', onPress: () => openCustomInput('equipment') },
    { id: 'filter', label: t('profile.addFilter' as any), icon: 'bolt', color: 'purple', onPress: () => openCustomInput('filter') },
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
        <ScreenHeader title={t('profile.cookingPreferences')} onBack={handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6 pb-24"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Global Search */}
            <SearchInput
              value={globalSearch}
              onChangeText={setGlobalSearch}
              placeholder={t('common.searchAll' as any)}
              className="mb-4"
            />

            {/* Dietary Restrictions - Allergies */}
            <Section title={`⚠️ ${t('profile.allergies')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {/* Predefined allergies */}
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
              {/* Custom allergies mixed with predefined */}
              {selectedRestrictions.filter(r => r.isAllergy && r.customValue).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {selectedRestrictions
                    .filter(r => r.isAllergy && r.customValue)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`⚠️ ${item.customValue}`}
                        selected={item.isSelected}
                        onPress={() => {
                          setSelectedRestrictions((prev) =>
                            prev.map((r) =>
                              r.id === item.id ? { ...r, isSelected: !r.isSelected } : r
                            )
                          );
                        }}
                        onRemove={() => removeCustomRestriction(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {/* Counter */}
              {(selectedRestrictions.filter(r => r.isAllergy && r.isSelected).length > 0) && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: selectedRestrictions.filter(r => r.isAllergy && r.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Dietary Restrictions - Preferences */}
            <Section title={`🥗 ${t('profile.preferences')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {/* Predefined preferences */}
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
              {/* Custom preferences mixed with predefined */}
              {selectedRestrictions.filter(r => !r.isAllergy && r.customValue).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {selectedRestrictions
                    .filter(r => !r.isAllergy && r.customValue)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🥗 ${item.customValue}`}
                        selected={item.isSelected}
                        onPress={() => {
                          setSelectedRestrictions((prev) =>
                            prev.map((r) =>
                              r.id === item.id ? { ...r, isSelected: !r.isSelected } : r
                            )
                          );
                        }}
                        onRemove={() => removeCustomRestriction(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {/* Counter */}
              {(selectedRestrictions.filter(r => !r.isAllergy && r.isSelected).length > 0) && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: selectedRestrictions.filter(r => !r.isAllergy && r.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Favorite Cuisines */}
            <Section title={`🍳 ${t('profile.favoriteCuisines')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {/* Predefined cuisines */}
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
              {/* Custom cuisines - can be toggled AND removed */}
              {selectedCuisines.filter(c => c.customName).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {selectedCuisines
                    .filter(c => c.customName)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🍽️ ${item.customName}`}
                        selected={item.isSelected}
                        onPress={() => {
                          setSelectedCuisines((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, isSelected: !c.isSelected } : c
                            )
                          );
                        }}
                        onRemove={() => removeCustomCuisine(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {/* Counter */}
              {selectedCuisines.filter(c => c.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: selectedCuisines.filter(c => c.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Kitchen Equipment */}
            <Section title={`🔧 ${t('profile.equipment')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {/* Predefined equipment */}
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
              {/* Custom equipment - can be toggled AND removed */}
              {selectedEquipment.filter(e => e.customName).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {selectedEquipment
                    .filter(e => e.customName)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🔧 ${item.customName}`}
                        selected={item.isSelected}
                        onPress={() => {
                          setSelectedEquipment((prev) =>
                            prev.map((e) =>
                              e.id === item.id ? { ...e, isSelected: !e.isSelected } : e
                            )
                          );
                        }}
                        onRemove={() => removeCustomEquipment(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {/* Counter */}
              {selectedEquipment.filter(e => e.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: selectedEquipment.filter(e => e.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Quick Filters */}
            <Section title={`⚡ ${t('profile.quickFilters' as any)}`} className="mb-6">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3 mt-2">
                {t('profile.selectFilters' as any)}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {/* Predefined filters */}
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
              {/* Custom filters - can be toggled AND removed */}
              {selectedQuickFilters.filter(f => f.isCustom).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {selectedQuickFilters
                    .filter(f => f.isCustom)
                    .map((filterObj) => (
                      <Chip
                        key={filterObj.id}
                        label={`⚡ ${filterObj.filter}`}
                        selected={filterObj.isSelected}
                        onPress={() => {
                          setSelectedQuickFilters((prev) =>
                            prev.map((f) =>
                              f.id === filterObj.id ? { ...f, isSelected: !f.isSelected } : f
                            )
                          );
                        }}
                        onRemove={() => removeCustomFilter(filterObj.filter)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {t('profile.selectedCount', { count: selectedQuickFilters.filter(f => f.isSelected).length })}
              </Text>
            </Section>

            {/* Spacer for floating button */}
            <View className="h-24" />
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="plus"
            options={customActionOptions}
            variant="floating"
            floatingColor="primary-500"
            loading={saving}
          />
        </View>

        {/* Custom Input BottomSheet */}
        <BottomSheet
          visible={showCustomInput}
          onClose={() => setShowCustomInput(false)}
          title={t('profile.addCustom')}
          showOkButton
          okLabel={t('common.add')}
          onOk={handleAddCustom}
        >
          <View className="gap-4 pb-4">
            <Text className="text-gray-600 dark:text-gray-400">
              {customType === 'allergy' && t('profile.addAllergyDesc' as any)}
              {customType === 'preference' && t('profile.addPreferenceDesc' as any)}
              {customType === 'cuisine' && t('profile.addCuisineDesc' as any)}
              {customType === 'equipment' && t('profile.addEquipmentDesc' as any)}
              {customType === 'filter' && t('profile.addFilterDesc' as any)}
            </Text>
            <Input
              placeholder={t('profile.customValuePlaceholder' as any)}
              value={customValue}
              onChangeText={setCustomValue}
              showClearButton
            />
          </View>
        </BottomSheet>

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
