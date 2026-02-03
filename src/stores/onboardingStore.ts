import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Restriction item for the store
export interface OnboardingRestriction {
  id: string;
  type: string;
  customValue?: string;
  isAllergy: boolean;
}

interface OnboardingState {
  // Step 1: Basic Info
  displayName: string;
  country: string;
  currency: string;

  // Step 2: Restrictions
  restrictions: OnboardingRestriction[];

  // Step 3: Preferences
  preferredCuisines: string[];

  // Navigation
  currentStep: number;

  // Validation errors
  errors: Record<string, string>;

  // Actions
  setDisplayName: (name: string) => void;
  setCountry: (country: string) => void;
  setCurrency: (currency: string) => void;
  setRestrictions: (restrictions: OnboardingRestriction[]) => void;
  addRestriction: (restriction: OnboardingRestriction) => void;
  removeRestriction: (id: string) => void;
  setPreferredCuisines: (cuisines: string[]) => void;
  toggleCuisine: (cuisineId: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: string) => void;
  reset: () => void;

  // Validation
  validateStep1: () => boolean;
  validateStep2: () => boolean;
}

const initialState = {
  displayName: '',
  country: '',
  currency: '',
  restrictions: [] as OnboardingRestriction[],
  preferredCuisines: [] as string[],
  currentStep: 0,
  errors: {} as Record<string, string>,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDisplayName: (name: string) => {
        set({ displayName: name });
        get().clearError('displayName');
      },

      setCountry: (country: string) => {
        set({ country });
        get().clearError('country');
      },

      setCurrency: (currency: string) => {
        set({ currency });
        get().clearError('currency');
      },

      setRestrictions: (restrictions: OnboardingRestriction[]) => {
        set({ restrictions });
      },

      addRestriction: (restriction: OnboardingRestriction) => {
        const current = get().restrictions;
        // Avoid duplicates
        if (!current.some((r) => r.id === restriction.id)) {
          set({ restrictions: [...current, restriction] });
        }
      },

      removeRestriction: (id: string) => {
        set({ restrictions: get().restrictions.filter((r) => r.id !== id) });
      },

      setPreferredCuisines: (cuisines: string[]) => {
        set({ preferredCuisines: cuisines });
      },

      toggleCuisine: (cuisineId: string) => {
        const current = get().preferredCuisines;
        if (current.includes(cuisineId)) {
          set({ preferredCuisines: current.filter((c) => c !== cuisineId) });
        } else {
          set({ preferredCuisines: [...current, cuisineId] });
        }
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        set({ currentStep: get().currentStep + 1 });
      },

      previousStep: () => {
        const current = get().currentStep;
        if (current > 0) {
          set({ currentStep: current - 1 });
        }
      },

      setErrors: (errors: Record<string, string>) => {
        set({ errors });
      },

      clearError: (field: string) => {
        const current = get().errors;
        const { [field]: _, ...rest } = current;
        set({ errors: rest });
      },

      reset: () => {
        set(initialState);
      },

      validateStep1: () => {
        const { displayName, country, currency } = get();
        const errors: Record<string, string> = {};

        if (!displayName.trim()) {
          errors.displayName = 'Name is required';
        } else if (displayName.trim().length < 2) {
          errors.displayName = 'Name must be at least 2 characters';
        }

        if (!country) {
          errors.country = 'Please select a country';
        }

        if (!currency) {
          errors.currency = 'Please select a currency';
        }

        set({ errors });
        return Object.keys(errors).length === 0;
      },

      validateStep2: () => {
        // Step 2 doesn't require any selections
        return true;
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        displayName: state.displayName,
        country: state.country,
        currency: state.currency,
        restrictions: state.restrictions,
        preferredCuisines: state.preferredCuisines,
        currentStep: state.currentStep,
      }),
    }
  )
);
