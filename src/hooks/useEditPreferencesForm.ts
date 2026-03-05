import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profileService } from '@/services';
import { useProfileStore } from '@/stores/profileStore';
import {
  allergies,
  preferences,
  cuisines,
  equipment as equipmentList,
  type DietaryRestriction,
} from '@/constants';
import { useAutoSaveOnBack } from './useAutoSaveOnBack';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RestrictionState {
  id: string;
  type: string;
  customValue?: string;
  isAllergy: boolean;
  isSelected: boolean;
}

export interface CuisineState {
  id: string;
  type: string;
  customName?: string;
  isSelected: boolean;
}

export interface EquipmentState {
  id: string;
  type: string;
  customName?: string;
  isSelected: boolean;
}

/* ------------------------------------------------------------------ */
/*  State builder (pure helper)                                        */
/* ------------------------------------------------------------------ */

function buildStateFromData(
  profile: any,
  restrictions: any[],
  equipment: any[],
  customCuisinesData: any[],
) {
  const predefinedCuisineIds = cuisines.map((c) => c.id);
  const legacyCuisines = ((profile?.preferred_cuisines) || [])
    .filter((c: string) => predefinedCuisineIds.includes(c))
    .map((c: string) => ({ id: c, type: c, isSelected: true }));
  const dbCuisines = (customCuisinesData || []).map((c: any) => ({
    id: c.id,
    type: c.cuisine_type,
    customName: c.custom_name || undefined,
    isSelected: true,
  }));
  const newRestrictions = (restrictions || []).map((r: any) => ({
    id: r.id,
    type: r.restriction_type,
    customValue: r.custom_value || undefined,
    isAllergy: r.is_allergy,
    isSelected: true,
  }));
  const newEquipment = (equipment || []).map((e: any) => ({
    id: e.id,
    type: e.equipment_type,
    customName: e.custom_name || undefined,
    isSelected: true,
  }));
  return { restrictions: newRestrictions, cuisines: [...legacyCuisines, ...dbCuisines], equipment: newEquipment };
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useEditPreferencesForm() {
  const { t } = useTranslation();

  // Seed from store
  const {
    profile: cachedProfile,
    restrictions: cachedRestrictions,
    equipment: cachedEquipment,
    customCuisines: cachedCustomCuisines,
    isLoaded: storeLoaded,
  } = useProfileStore();

  const initialState = storeLoaded
    ? buildStateFromData(cachedProfile, cachedRestrictions, cachedEquipment, cachedCustomCuisines)
    : { restrictions: [], cuisines: [], equipment: [] };

  const [loading, setLoading] = useState(!storeLoaded);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Form state
  const [selectedRestrictions, setSelectedRestrictions] = useState<RestrictionState[]>(initialState.restrictions);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineState[]>(initialState.cuisines);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentState[]>(initialState.equipment);

  // Custom input
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState<'allergy' | 'preference' | 'cuisine' | 'equipment'>('allergy');

  // Search
  const [globalSearch, setGlobalSearch] = useState('');

  // ---- Load ----
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [profile, restrictionsData, equipmentData, cuisineData] = await Promise.all([
          profileService.getProfile(),
          profileService.getRestrictions(),
          profileService.getEquipment(),
          profileService.getCuisines(),
        ]);
        const mappedCuisines = (cuisineData || []).map((c) => ({
          id: c.id,
          cuisine_type: c.cuisine_type,
          custom_name: c.custom_name,
        }));
        const state = buildStateFromData(profile, restrictionsData as any, equipmentData as any, mappedCuisines);
        setSelectedRestrictions(state.restrictions);
        setSelectedCuisines(state.cuisines);
        setSelectedEquipment(state.equipment);
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
      await profileService.saveRestrictions(
        selectedRestrictions
          .filter((r) => r.isSelected)
          .map((r) => ({ restriction_type: r.type, custom_value: r.customValue, is_allergy: r.isAllergy })),
      );

      await profileService.saveEquipment(
        selectedEquipment
          .filter((e) => e.isSelected)
          .map((e) => ({ equipment_type: e.type, custom_name: e.customName })),
      );

      const customCuisinesSave = selectedCuisines.filter((c) => c.customName && c.isSelected);
      await profileService.saveCuisines(
        customCuisinesSave.map((c) => ({ cuisine_type: c.type, custom_name: c.customName })),
      );

      const predefinedCuisineIds = cuisines.map((c) => c.id);
      const predefinedCuisines = selectedCuisines
        .filter((c) => predefinedCuisineIds.includes(c.type) && !c.customName && c.isSelected)
        .map((c) => c.type);
      await profileService.updateProfile({ preferred_cuisines: predefinedCuisines });
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [selectedRestrictions, selectedCuisines, selectedEquipment, saving]);

  // ---- Auto-save on back ----
  const { handleBack } = useAutoSaveOnBack(
    handleSave,
    [selectedRestrictions, selectedCuisines, selectedEquipment, saving],
  );

  // ---- Filtered lists ----
  const filteredAllergies = useMemo(() => {
    if (!globalSearch.trim()) return allergies;
    const query = globalSearch.toLowerCase();
    return allergies.filter((a) => {
      const label = t(a.labelKey as any, { defaultValue: a.defaultLabel });
      return label.toLowerCase().includes(query) || a.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredPreferences = useMemo(() => {
    if (!globalSearch.trim()) return preferences;
    const query = globalSearch.toLowerCase();
    return preferences.filter((p) => {
      const label = t(p.labelKey as any, { defaultValue: p.defaultLabel });
      return label.toLowerCase().includes(query) || p.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredCuisines = useMemo(() => {
    if (!globalSearch.trim()) return cuisines;
    const query = globalSearch.toLowerCase();
    return cuisines.filter((c) => {
      const label = t(c.labelKey as any, { defaultValue: c.defaultLabel });
      return label.toLowerCase().includes(query) || c.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  const filteredEquipment = useMemo(() => {
    if (!globalSearch.trim()) return equipmentList;
    const query = globalSearch.toLowerCase();
    return equipmentList.filter((e) => {
      const label = t(e.labelKey as any, { defaultValue: e.defaultLabel });
      return label.toLowerCase().includes(query) || e.defaultLabel.toLowerCase().includes(query);
    });
  }, [globalSearch, t]);

  // ---- Toggle helpers ----
  const isRestrictionSelected = useCallback(
    (id: string) => selectedRestrictions.some((r) => r.type === id && r.isSelected),
    [selectedRestrictions],
  );

  const toggleRestriction = useCallback((restriction: DietaryRestriction) => {
    setSelectedRestrictions((prev) => {
      const existing = prev.find((r) => r.type === restriction.id);
      if (existing) {
        return prev.map((r) => (r.id === existing.id ? { ...r, isSelected: !r.isSelected } : r));
      }
      return [...prev, { id: `new_${Date.now()}`, type: restriction.id, isAllergy: restriction.isAllergy, isSelected: true }];
    });
  }, []);

  const isCuisineSelected = useCallback(
    (id: string) => selectedCuisines.some((c) => c.type === id && c.isSelected),
    [selectedCuisines],
  );

  const toggleCuisine = useCallback((id: string) => {
    setSelectedCuisines((prev) => {
      const existing = prev.find((c) => c.type === id);
      if (existing) {
        return prev.map((c) => (c.id === existing.id ? { ...c, isSelected: !c.isSelected } : c));
      }
      return [...prev, { id: `new_${Date.now()}`, type: id, isSelected: true }];
    });
  }, []);

  const isEquipmentSelected = useCallback(
    (id: string) => selectedEquipment.some((e) => e.type === id && e.isSelected),
    [selectedEquipment],
  );

  const toggleEquipment = useCallback((id: string) => {
    setSelectedEquipment((prev) => {
      const existing = prev.find((e) => e.type === id);
      if (existing) {
        return prev.map((e) => (e.id === existing.id ? { ...e, isSelected: !e.isSelected } : e));
      }
      return [...prev, { id: `new_${Date.now()}`, type: id, isSelected: true }];
    });
  }, []);

  // ---- Remove custom ----
  const removeCustomRestriction = useCallback((id: string) => {
    setSelectedRestrictions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const removeCustomCuisine = useCallback((id: string) => {
    setSelectedCuisines((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const removeCustomEquipment = useCallback((id: string) => {
    setSelectedEquipment((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---- Add custom ----
  const handleAddCustom = useCallback(() => {
    if (!customValue.trim()) return;
    const id = `custom_${Date.now()}`;
    const value = customValue.trim();

    if (customType === 'allergy') {
      setSelectedRestrictions((prev) => [...prev, { id, type: 'custom', customValue: value, isAllergy: true, isSelected: true }]);
    } else if (customType === 'preference') {
      setSelectedRestrictions((prev) => [...prev, { id, type: 'custom', customValue: value, isAllergy: false, isSelected: true }]);
    } else if (customType === 'cuisine') {
      setSelectedCuisines((prev) => [...prev, { id, type: 'custom', customName: value, isSelected: true }]);
    } else if (customType === 'equipment') {
      setSelectedEquipment((prev) => [...prev, { id, type: 'custom', customName: value, isSelected: true }]);
    }

    setCustomValue('');
  }, [customValue, customType]);

  const openCustomInput = useCallback((type: typeof customType) => {
    setCustomType(type);
  }, []);

  return {
    loading, saving,
    alertVisible, setAlertVisible,

    // Search
    globalSearch, setGlobalSearch,

    // State
    selectedRestrictions, setSelectedRestrictions,
    selectedCuisines, setSelectedCuisines,
    selectedEquipment, setSelectedEquipment,

    // Custom input
    customValue, setCustomValue,
    customType,

    // Filtered lists
    filteredAllergies,
    filteredPreferences,
    filteredCuisines,
    filteredEquipment,

    // Toggle / check helpers
    isRestrictionSelected,
    toggleRestriction,
    isCuisineSelected,
    toggleCuisine,
    isEquipmentSelected,
    toggleEquipment,

    // Remove custom
    removeCustomRestriction,
    removeCustomCuisine,
    removeCustomEquipment,

    // Add custom
    handleAddCustom,
    openCustomInput,

    // Navigation
    handleBack,
  };
}

