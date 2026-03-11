import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useProfileStore } from '@/stores';
import { useRecipeGenerationStore } from '@/stores';
import { profileService } from '@/services';
import { type Profile, type ProfileEquipment } from '@/services';

/**
 * Builds form-default values (cuisines & equipment) from raw profile data.
 */
export function buildFormDefaults(
  profileData: Profile | null,
  equipmentData: ProfileEquipment[],
  cuisinesData: { id: string; cuisine_type: string; custom_name: string | null }[],
) {
  const predefinedCuisines = profileData?.preferred_cuisines || [];
  const customCuisineIds = (cuisinesData || [])
    .filter((c) => c.custom_name)
    .map((c) => `custom:${c.custom_name}`);
  const allCuisines = [...predefinedCuisines, ...customCuisineIds];
  const allEquipment = (equipmentData || []).map((e) =>
    e.custom_name ? `custom:${e.custom_name}` : e.equipment_type,
  );
  return { cuisines: allCuisines, equipment: allEquipment };
}

/**
 * Encapsulates profile hydration, API refresh, and form-default syncing.
 *
 * Returns the profile data slices needed by the home screen plus a helper
 * to re-apply defaults after a form reset.
 */
export function useUserProfile() {
  const {
    profile,
    restrictions,
    equipment,
    favoriteIngredients,
    customCuisines,
    routineMeals,
    isLoaded: storeIsLoaded,
    setProfile,
    setRestrictions,
    setEquipment,
    setFavoriteIngredients: setStoreFavoriteIngredients,
    setCustomCuisines,
    setRoutineMeals: setStoreRoutineMeals,
    setLoaded,
  } = useProfileStore();

  const { form, setFormField } = useRecipeGenerationStore();

  // ---- Hydration gate ----
  const [hasHydrated, setHasHydrated] = useState(
    () => useProfileStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useProfileStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    return useProfileStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, []);

  const [profileLoaded, setProfileLoaded] = useState(
    () =>
      useProfileStore.persist.hasHydrated() &&
      useProfileStore.getState().isLoaded,
  );

  // When hydration finishes and the store already has cached data, unlock UI
  useEffect(() => {
    if (!hasHydrated) return;
    if (storeIsLoaded) {
      setProfileLoaded(true);
      const {
        profile: p,
        equipment: eq,
        customCuisines: cc,
      } = useProfileStore.getState();
      const defaults = buildFormDefaults(p, eq, cc);
      if (defaults.cuisines.length > 0 && form.cuisines.length === 0) {
        setFormField('cuisines', defaults.cuisines);
      }
      if (defaults.equipment.length > 0 && (!form.equipment || form.equipment.length === 0)) {
        setFormField('equipment', defaults.equipment);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // ---- API refresh ----
  const loadProfileData = useCallback(async () => {
    try {
      const [
        profileData,
        restrictionsData,
        equipmentData,
        favoriteIngredientsData,
        cuisinesData,
        routineMealsData,
      ] = await Promise.all([
        profileService.getProfile(),
        profileService.getRestrictions(),
        profileService.getEquipment(),
        profileService.getFavoriteIngredients(),
        profileService.getCuisines(),
        profileService.getRoutineMeals(),
      ]);

      const mappedCuisines = cuisinesData.map((c) => ({
        id: c.id,
        cuisine_type: c.cuisine_type,
        custom_name: c.custom_name,
      }));

      const mappedFavorites = favoriteIngredientsData.map((i) => ({
        ingredient_name: i.ingredient_name,
        is_always_available: i.always_available,
      }));

      setProfile(profileData);
      setRestrictions(restrictionsData);
      setEquipment(equipmentData);
      setStoreFavoriteIngredients(mappedFavorites);
      setCustomCuisines(mappedCuisines);
      setStoreRoutineMeals(
        routineMealsData.map((rm) => ({
          meal_type: rm.meal_type,
          description: rm.description,
        }))
      );
      setLoaded(true);

      // Sync form defaults with fresh data
      const defaults = buildFormDefaults(profileData, equipmentData, mappedCuisines);
      if (defaults.cuisines.length > 0) {
        setFormField('cuisines', defaults.cuisines);
      }
      if (defaults.equipment.length > 0) {
        setFormField('equipment', defaults.equipment);
      }
      setProfileLoaded(true);
    } catch (err) {
      console.error('Error loading profile:', err);
      setProfileLoaded(true); // Still show UI even on error
    }
  }, [
    setFormField,
    setProfile,
    setRestrictions,
    setEquipment,
    setStoreFavoriteIngredients,
    setCustomCuisines,
    setStoreRoutineMeals,
    setLoaded,
  ]);

  // Refresh on every focus (initial + returning from preferences)
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  // ---- Helpers ----
  const applyProfileDefaults = useCallback(() => {
    const defaults = buildFormDefaults(profile, equipment, customCuisines);
    if (defaults.cuisines.length > 0) {
      setFormField('cuisines', defaults.cuisines);
    }
    if (defaults.equipment.length > 0) {
      setFormField('equipment', defaults.equipment);
    }
  }, [profile, equipment, customCuisines, setFormField]);

  const userName = profile?.display_name?.split(' ')[0] || '';

  return {
    profile,
    restrictions,
    equipment,
    favoriteIngredients,
    customCuisines,
    routineMeals,
    profileLoaded,
    userName,
    applyProfileDefaults,
  };
}

