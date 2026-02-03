import { useEffect, useState, useMemo } from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Chip,
  Section,
  SearchInput,
  Loader,
  AlertModal,
  ScreenHeader,
} from '@/components/ui';
import { profileService } from '@/services';
import { equipment as equipmentList, type Equipment } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface EquipmentState {
  id: string;
  equipmentType: string;
  customName?: string;
}

export default function EditEquipmentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Form state
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentState[]>([]);

  // Custom equipment input
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Load profile data
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const equipment = await profileService.getEquipment();
      if (equipment) {
        setSelectedEquipment(
          equipment.map((e, index) => ({
            id: e.custom_name ? `custom_${index}_${Date.now()}` : e.equipment_type,
            equipmentType: e.equipment_type,
            customName: e.custom_name || undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.saveEquipment(
        selectedEquipment.map((e) => ({
          equipment_type: e.equipmentType,
          custom_name: e.customName,
        }))
      );
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      console.error('Error saving equipment:', error);
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

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) return equipmentList;
    const query = searchQuery.toLowerCase();
    return equipmentList.filter((e) => {
      const translatedLabel = t(e.labelKey, { defaultValue: e.defaultLabel });
      return translatedLabel.toLowerCase().includes(query) || e.defaultLabel.toLowerCase().includes(query);
    });
  }, [searchQuery, t]);

  // Get custom equipment
  const customEquipment = selectedEquipment.filter(
    (e) => e.customName && !equipmentList.find((eq) => eq.id === e.id)
  );

  const isEquipmentSelected = (id: string) => selectedEquipment.some((e) => e.id === id);

  const toggleEquipment = (item: Equipment) => {
    if (isEquipmentSelected(item.id)) {
      setSelectedEquipment((prev) => prev.filter((e) => e.id !== item.id));
    } else {
      setSelectedEquipment((prev) => [
        ...prev,
        {
          id: item.id,
          equipmentType: item.id,
        },
      ]);
    }
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;

    const id = `custom_${Date.now()}`;
    setSelectedEquipment((prev) => [
      ...prev,
      {
        id,
        equipmentType: 'custom',
        customName: customName.trim(),
      },
    ]);

    setCustomName('');
    setShowCustomInput(false);
  };

  const removeCustomEquipment = (id: string) => {
    setSelectedEquipment((prev) => prev.filter((e) => e.id !== id));
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
        <ScreenHeader title={t('profile.equipment')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6 pb-24"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Equipment Selection */}
        <Section title={`🍳 ${t('profile.kitchenEquipment')}`} className="mb-4">
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.search')}
            className="mt-2 mb-3"
          />
          <View className="flex-row flex-wrap gap-2">
            {filteredEquipment.map((item) => (
              <Chip
                key={item.id}
                label={`${item.icon} ${t(item.labelKey, { defaultValue: item.defaultLabel })}`}
                selected={isEquipmentSelected(item.id)}
                onPress={() => toggleEquipment(item)}
                size="sm"
              />
            ))}
          </View>
        </Section>

        {/* Custom Equipment */}
        <Section title={`📝 ${t('profile.addCustomEquipment')}`} className="mb-6">
          {customEquipment.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2 mb-3">
              {customEquipment.map((e) => (
                <Chip
                  key={e.id}
                  label={`🔧 ${e.customName}`}
                  selected
                  onRemove={() => removeCustomEquipment(e.id)}
                  size="sm"
                />
              ))}
            </View>
          )}

          {showCustomInput ? (
            <View className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Input
                placeholder={t('profile.customEquipmentLabel')}
                value={customName}
                onChangeText={setCustomName}
                className="mb-3"
              />
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
                {t('profile.addCustomEquipment')}
              </Text>
            </Pressable>
          )}
        </Section>

        {/* Selected count */}
        {selectedEquipment.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('profile.selectedCount', { count: selectedEquipment.length })}
            </Text>
          </View>
        )}

        <Button
          onPress={handleSave}
          variant="primary"
          size="lg"
          disabled={saving}
          className="mt-4"
        >
          {saving ? t('profile.saving') : t('profile.saveChanges')}
        </Button>
        </ScrollView>
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
