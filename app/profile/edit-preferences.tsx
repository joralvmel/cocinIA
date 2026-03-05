import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEditPreferencesForm } from '@/hooks';

export default function EditPreferencesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const form = useEditPreferencesForm();

  // UI-only state
  const [showCustomInput, setShowCustomInput] = useState(false);

  // FAB options
  const customActionOptions: ActionOption[] = [
    { id: 'allergy', label: t('profile.addAllergy' as any), icon: 'exclamation-triangle', color: 'red', onPress: () => { form.openCustomInput('allergy'); setShowCustomInput(true); } },
    { id: 'preference', label: t('profile.addPreference' as any), icon: 'leaf', color: 'green', onPress: () => { form.openCustomInput('preference'); setShowCustomInput(true); } },
    { id: 'cuisine', label: t('profile.addCuisine' as any), icon: 'cutlery', color: 'amber', onPress: () => { form.openCustomInput('cuisine'); setShowCustomInput(true); } },
    { id: 'equipment', label: t('profile.addEquipment' as any), icon: 'wrench', color: 'blue', onPress: () => { form.openCustomInput('equipment'); setShowCustomInput(true); } },
  ];

  const handleAddCustomAndClose = () => {
    form.handleAddCustom();
    setShowCustomInput(false);
  };

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
        <ScreenHeader title={t('profile.cookingPreferences')} onBack={form.handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6 pb-24"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Global Search */}
            <SearchInput value={form.globalSearch} onChangeText={form.setGlobalSearch} placeholder={t('common.searchAll' as any)} className="mb-4" />

            {/* Allergies */}
            <Section title={`⚠️ ${t('profile.allergies')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {form.filteredAllergies.map((item) => (
                  <Chip key={item.id} label={`${item.icon || ''} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`} selected={form.isRestrictionSelected(item.id)} onPress={() => form.toggleRestriction(item)} size="sm" />
                ))}
              </View>
              {form.selectedRestrictions.filter((r) => r.isAllergy && r.customValue).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {form.selectedRestrictions
                    .filter((r) => r.isAllergy && r.customValue)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`⚠️ ${item.customValue}`}
                        selected={item.isSelected}
                        onPress={() => form.setSelectedRestrictions((prev) => prev.map((r) => (r.id === item.id ? { ...r, isSelected: !r.isSelected } : r)))}
                        onRemove={() => form.removeCustomRestriction(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {form.selectedRestrictions.filter((r) => r.isAllergy && r.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: form.selectedRestrictions.filter((r) => r.isAllergy && r.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Preferences */}
            <Section title={`🥗 ${t('profile.preferences')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {form.filteredPreferences.map((item) => (
                  <Chip key={item.id} label={`${item.icon || ''} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`} selected={form.isRestrictionSelected(item.id)} onPress={() => form.toggleRestriction(item)} size="sm" />
                ))}
              </View>
              {form.selectedRestrictions.filter((r) => !r.isAllergy && r.customValue).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {form.selectedRestrictions
                    .filter((r) => !r.isAllergy && r.customValue)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🥗 ${item.customValue}`}
                        selected={item.isSelected}
                        onPress={() => form.setSelectedRestrictions((prev) => prev.map((r) => (r.id === item.id ? { ...r, isSelected: !r.isSelected } : r)))}
                        onRemove={() => form.removeCustomRestriction(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {form.selectedRestrictions.filter((r) => !r.isAllergy && r.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: form.selectedRestrictions.filter((r) => !r.isAllergy && r.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Cuisines */}
            <Section title={`🍳 ${t('profile.favoriteCuisines')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {form.filteredCuisines.map((cuisine) => (
                  <Chip key={cuisine.id} label={`${cuisine.icon} ${t(cuisine.labelKey, { defaultValue: cuisine.defaultLabel })}`} selected={form.isCuisineSelected(cuisine.id)} onPress={() => form.toggleCuisine(cuisine.id)} size="sm" />
                ))}
              </View>
              {form.selectedCuisines.filter((c) => c.customName).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {form.selectedCuisines
                    .filter((c) => c.customName)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🍽️ ${item.customName}`}
                        selected={item.isSelected}
                        onPress={() => form.setSelectedCuisines((prev) => prev.map((c) => (c.id === item.id ? { ...c, isSelected: !c.isSelected } : c)))}
                        onRemove={() => form.removeCustomCuisine(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {form.selectedCuisines.filter((c) => c.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: form.selectedCuisines.filter((c) => c.isSelected).length })}
                </Text>
              )}
            </Section>

            {/* Equipment */}
            <Section title={`🔧 ${t('profile.equipment')}`} className="mb-4">
              <View className="flex-row flex-wrap gap-2 mt-2">
                {form.filteredEquipment.map((eq) => (
                  <Chip key={eq.id} label={`${eq.icon} ${t(eq.labelKey, { defaultValue: eq.defaultLabel })}`} selected={form.isEquipmentSelected(eq.id)} onPress={() => form.toggleEquipment(eq.id)} size="sm" />
                ))}
              </View>
              {form.selectedEquipment.filter((e) => e.customName).length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {form.selectedEquipment
                    .filter((e) => e.customName)
                    .map((item) => (
                      <Chip
                        key={item.id}
                        label={`🔧 ${item.customName}`}
                        selected={item.isSelected}
                        onPress={() => form.setSelectedEquipment((prev) => prev.map((e) => (e.id === item.id ? { ...e, isSelected: !e.isSelected } : e)))}
                        onRemove={() => form.removeCustomEquipment(item.id)}
                        size="sm"
                      />
                    ))}
                </View>
              )}
              {form.selectedEquipment.filter((e) => e.isSelected).length > 0 && (
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('profile.selectedCount', { count: form.selectedEquipment.filter((e) => e.isSelected).length })}
                </Text>
              )}
            </Section>
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton icon="plus" options={customActionOptions} variant="floating" floatingColor="primary-500" loading={form.saving} />
        </View>

        {/* Custom Input BottomSheet */}
        <BottomSheet visible={showCustomInput} onClose={() => setShowCustomInput(false)} title={t('profile.addCustom')} showOkButton okLabel={t('common.add')} onOk={handleAddCustomAndClose}>
          <View className="gap-4 pb-4">
            <Text className="text-gray-600 dark:text-gray-400">
              {form.customType === 'allergy' && t('profile.addAllergyDesc' as any)}
              {form.customType === 'preference' && t('profile.addPreferenceDesc' as any)}
              {form.customType === 'cuisine' && t('profile.addCuisineDesc' as any)}
              {form.customType === 'equipment' && t('profile.addEquipmentDesc' as any)}
            </Text>
            <Input placeholder={t('profile.customValuePlaceholder' as any)} value={form.customValue} onChangeText={form.setCustomValue} showClearButton />
          </View>
        </BottomSheet>

        {/* Alert */}
        <AlertModal visible={form.alertVisible} onClose={() => form.setAlertVisible(false)} title={t('common.error')} message={t('profile.updateError')} variant="danger" confirmLabel={t('common.ok')} />
      </SafeAreaView>
    </View>
  );
}
