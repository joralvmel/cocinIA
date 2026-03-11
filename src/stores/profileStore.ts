import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, ProfileRestriction, ProfileEquipment } from '@/services/profile';

interface ProfileState {
  profile: Profile | null;
  restrictions: ProfileRestriction[];
  equipment: ProfileEquipment[];
  favoriteIngredients: { ingredient_name: string; is_always_available: boolean }[];
  customCuisines: { id: string; cuisine_type: string; custom_name: string | null }[];
  routineMeals: { meal_type: string; description: string }[];
  isLoaded: boolean;

  setProfile: (profile: Profile | null) => void;
  setRestrictions: (restrictions: ProfileRestriction[]) => void;
  setEquipment: (equipment: ProfileEquipment[]) => void;
  setFavoriteIngredients: (ingredients: { ingredient_name: string; is_always_available: boolean }[]) => void;
  setCustomCuisines: (cuisines: { id: string; cuisine_type: string; custom_name: string | null }[]) => void;
  setRoutineMeals: (meals: { meal_type: string; description: string }[]) => void;
  setLoaded: (loaded: boolean) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      restrictions: [],
      equipment: [],
      favoriteIngredients: [],
      customCuisines: [],
      routineMeals: [],
      isLoaded: false,

      setProfile: (profile) => set({ profile }),
      setRestrictions: (restrictions) => set({ restrictions }),
      setEquipment: (equipment) => set({ equipment }),
      setFavoriteIngredients: (favoriteIngredients) => set({ favoriteIngredients }),
      setCustomCuisines: (customCuisines) => set({ customCuisines }),
      setRoutineMeals: (routineMeals) => set({ routineMeals }),
      setLoaded: (isLoaded) => set({ isLoaded }),
      clear: () => set({
        profile: null,
        restrictions: [],
        equipment: [],
        favoriteIngredients: [],
        customCuisines: [],
        routineMeals: [],
        isLoaded: false,
      }),
    }),
    {
      name: 'cocinia-profile-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data fields, not the setter functions
      partialize: (state) => ({
        profile: state.profile,
        restrictions: state.restrictions,
        equipment: state.equipment,
        favoriteIngredients: state.favoriteIngredients,
        customCuisines: state.customCuisines,
        routineMeals: state.routineMeals,
        isLoaded: state.isLoaded,
      }),
    }
  )
);
