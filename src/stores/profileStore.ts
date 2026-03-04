import { create } from 'zustand';
import type { Profile, ProfileRestriction, ProfileEquipment } from '@/services/profile';

interface ProfileState {
  profile: Profile | null;
  restrictions: ProfileRestriction[];
  equipment: ProfileEquipment[];
  favoriteIngredients: { ingredient_name: string; is_always_available: boolean }[];
  customCuisines: { id: string; cuisine_type: string; custom_name: string | null }[];
  isLoaded: boolean;

  setProfile: (profile: Profile | null) => void;
  setRestrictions: (restrictions: ProfileRestriction[]) => void;
  setEquipment: (equipment: ProfileEquipment[]) => void;
  setFavoriteIngredients: (ingredients: { ingredient_name: string; is_always_available: boolean }[]) => void;
  setCustomCuisines: (cuisines: { id: string; cuisine_type: string; custom_name: string | null }[]) => void;
  setLoaded: (loaded: boolean) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  restrictions: [],
  equipment: [],
  favoriteIngredients: [],
  customCuisines: [],
  isLoaded: false,

  setProfile: (profile) => set({ profile }),
  setRestrictions: (restrictions) => set({ restrictions }),
  setEquipment: (equipment) => set({ equipment }),
  setFavoriteIngredients: (favoriteIngredients) => set({ favoriteIngredients }),
  setCustomCuisines: (customCuisines) => set({ customCuisines }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  clear: () => set({
    profile: null,
    restrictions: [],
    equipment: [],
    favoriteIngredients: [],
    customCuisines: [],
    isLoaded: false,
  }),
}));

