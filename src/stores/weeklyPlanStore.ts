import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type DayOfWeek,
  type PlanMealType,
  type WeeklyPlanForm,
  type BatchConfig,
  type AIWeeklyPlanResponse,
  type WeeklyPlanWithMeals,
  DAYS_OF_WEEK,
} from '@/types';
import { getDefaultDayConfigs } from '@/utils/weeklyPlanHelpers';

// ---- Types ----

interface DayMealConfig {
  meals: PlanMealType[];
  cookingTimeMinutes: number;
}

interface WizardState {
  // Step tracking
  wizardStep: number;
  totalSteps: number;

  // Step 1: Days & Meals
  selectedDays: DayOfWeek[];
  dayConfigs: Record<DayOfWeek, DayMealConfig>;

  // Step 2: Cooking preferences
  batchCookingEnabled: boolean;
  batchConfig: BatchConfig;
  cookingTimeByMealType: Record<string, number>; // meal type → minutes

  // Step 3: Food preferences
  cuisines: string[];
  equipment: string[];
  ingredientsToInclude: string[];
  ingredientsToExclude: string[];
  useFavoriteIngredients: boolean;

  // Step 4: Nutrition & Notes
  dailyCalorieTarget: number | undefined;
  specialNotes: string;
  planName: string;
  startDate: string;
  servings: number;

  // Routine meals — what the user typically eats
  routineMeals: { breakfast: string; lunch: string; dinner: string; snack: string };
  useProfileRoutineMeals: boolean;
}

interface GenerationState {
  generatedPlan: AIWeeklyPlanResponse | null;
  isGenerating: boolean;
  generationError: string | null;
  generationProgress: string;
}

interface ActivePlanState {
  activePlan: WeeklyPlanWithMeals | null;
  activePlanLoaded: boolean;
}

interface UIState {
  showWizard: boolean;
  showResult: boolean;
}

interface WeeklyPlanStoreState extends WizardState, GenerationState, ActivePlanState, UIState {
  // Wizard actions
  setWizardStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;

  // Step 1 actions
  toggleDay: (day: DayOfWeek) => void;
  setSelectedDays: (days: DayOfWeek[]) => void;
  setDayMeals: (day: DayOfWeek, meals: PlanMealType[]) => void;
  setDayCookingTime: (day: DayOfWeek, minutes: number) => void;

  // Step 2 actions
  setBatchCookingEnabled: (enabled: boolean) => void;
  setBatchConfig: (config: Partial<BatchConfig>) => void;
  setCookingTimeByMealType: (mealType: string, minutes: number) => void;

  // Step 3 actions
  setCuisines: (cuisines: string[]) => void;
  setEquipment: (equipment: string[]) => void;
  setIngredientsToInclude: (ingredients: string[]) => void;
  setIngredientsToExclude: (ingredients: string[]) => void;
  setUseFavoriteIngredients: (value: boolean) => void;

  // Step 4 actions
  setDailyCalorieTarget: (target: number | undefined) => void;
  setSpecialNotes: (notes: string) => void;
  setPlanName: (name: string) => void;
  setStartDate: (date: string) => void;
  setServings: (servings: number) => void;
  setRoutineMeals: (mealType: string, value: string) => void;
  setUseProfileRoutineMeals: (value: boolean) => void;

  // Generation actions
  setGeneratedPlan: (plan: AIWeeklyPlanResponse | null) => void;
  setIsGenerating: (loading: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setGenerationProgress: (progress: string) => void;

  // Active plan actions
  setActivePlan: (plan: WeeklyPlanWithMeals | null) => void;
  setActivePlanLoaded: (loaded: boolean) => void;
  clearActivePlan: () => void;

  // UI actions
  setShowWizard: (show: boolean) => void;
  setShowResult: (show: boolean) => void;

  // Full reset
  clearAll: () => void;

  // Get wizard form data for AI generation
  getWizardForm: () => WeeklyPlanForm;
}

// ---- Defaults ----

const getNextMonday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday.toISOString().split('T')[0];
};

const defaultBatchConfig: BatchConfig = {
  prep_days: ['sunday'],
  max_prep_time_minutes: 180,
  base_preparations_count: 3,
  reuse_strategy: 'balanced',
  base_preparations: [],
  notes: '',
};

const initialWizardState: WizardState = {
  wizardStep: 0,
  totalSteps: 5,
  selectedDays: [...DAYS_OF_WEEK],
  dayConfigs: getDefaultDayConfigs(),
  batchCookingEnabled: false,
  batchConfig: defaultBatchConfig,
  cookingTimeByMealType: {
    breakfast: 15,
    lunch: 45,
    dinner: 20,
    snack: 10,
  },
  cuisines: [],
  equipment: [],
  ingredientsToInclude: [],
  ingredientsToExclude: [],
  useFavoriteIngredients: false,
  dailyCalorieTarget: undefined,
  specialNotes: '',
  planName: '',
  startDate: getNextMonday(),
  servings: 1,
  routineMeals: { breakfast: '', lunch: '', dinner: '', snack: '' },
  useProfileRoutineMeals: false,
};

const initialGenerationState: GenerationState = {
  generatedPlan: null,
  isGenerating: false,
  generationError: null,
  generationProgress: '',
};

const initialUIState: UIState = {
  showWizard: false,
  showResult: false,
};

// ---- Store ----

export const useWeeklyPlanStore = create<WeeklyPlanStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialWizardState,
      ...initialGenerationState,
      activePlan: null,
      activePlanLoaded: false,
      ...initialUIState,

      // Wizard navigation
      setWizardStep: (step) => set({ wizardStep: step }),

      nextStep: () => {
        const { wizardStep, totalSteps } = get();
        if (wizardStep < totalSteps - 1) {
          set({ wizardStep: wizardStep + 1 });
        }
      },

      prevStep: () => {
        const { wizardStep } = get();
        if (wizardStep > 0) {
          set({ wizardStep: wizardStep - 1 });
        }
      },

      resetWizard: () => set({
        ...initialWizardState,
        startDate: getNextMonday(),
      }),

      // Step 1: Days & meals
      toggleDay: (day) => {
        const { selectedDays, batchCookingEnabled, dayConfigs } = get();
        if (selectedDays.includes(day)) {
          set({ selectedDays: selectedDays.filter((d) => d !== day) });
        } else {
          // When adding a day with batch enabled, ensure lunch is included
          if (batchCookingEnabled && !dayConfigs[day].meals.includes('lunch')) {
            set({
              selectedDays: [...selectedDays, day],
              dayConfigs: {
                ...dayConfigs,
                [day]: {
                  ...dayConfigs[day],
                  meals: [...dayConfigs[day].meals, 'lunch'],
                },
              },
            });
          } else {
            set({ selectedDays: [...selectedDays, day] });
          }
        }
      },

      setSelectedDays: (days) => set({ selectedDays: days }),

      setDayMeals: (day, meals) => {
        const { dayConfigs, batchCookingEnabled } = get();
        // When batch cooking is enabled, lunch cannot be removed
        let finalMeals = meals;
        if (batchCookingEnabled && !meals.includes('lunch')) {
          finalMeals = [...meals, 'lunch'];
        }
        set({
          dayConfigs: {
            ...dayConfigs,
            [day]: { ...dayConfigs[day], meals: finalMeals },
          },
        });
      },


      setDayCookingTime: (day, minutes) => {
        const { dayConfigs } = get();
        set({
          dayConfigs: {
            ...dayConfigs,
            [day]: { ...dayConfigs[day], cookingTimeMinutes: minutes },
          },
        });
      },

      // Step 2: Batch cooking
      setBatchCookingEnabled: (enabled) => {
        set({ batchCookingEnabled: enabled });
        // When batch cooking is enabled, ensure lunch is in all selected days
        if (enabled) {
          const { selectedDays, dayConfigs } = get();
          const updatedConfigs = { ...dayConfigs };
          for (const day of selectedDays) {
            if (!updatedConfigs[day].meals.includes('lunch')) {
              updatedConfigs[day] = {
                ...updatedConfigs[day],
                meals: [...updatedConfigs[day].meals, 'lunch'],
              };
            }
          }
          set({ dayConfigs: updatedConfigs });
        }
      },
      setCookingTimeByMealType: (mealType, minutes) => set((state) => ({
        cookingTimeByMealType: { ...state.cookingTimeByMealType, [mealType]: minutes },
      })),

      setBatchConfig: (config) => {
        const { batchConfig } = get();
        set({ batchConfig: { ...batchConfig, ...config } });
      },

      // Step 3: Food preferences
      setCuisines: (cuisines) => set({ cuisines }),
      setEquipment: (equipment) => set({ equipment }),
      setIngredientsToInclude: (ingredientsToInclude) => set({ ingredientsToInclude }),
      setIngredientsToExclude: (ingredientsToExclude) => set({ ingredientsToExclude }),
      setUseFavoriteIngredients: (useFavoriteIngredients) => set({ useFavoriteIngredients }),

      // Step 4: Nutrition & notes
      setDailyCalorieTarget: (dailyCalorieTarget) => set({ dailyCalorieTarget }),
      setSpecialNotes: (specialNotes) => set({ specialNotes }),
      setPlanName: (planName) => set({ planName }),
      setStartDate: (startDate) => set({ startDate }),
      setServings: (servings) => set({ servings }),
      setRoutineMeals: (mealType, value) => set((state) => ({
        routineMeals: { ...state.routineMeals, [mealType]: value },
      })),
      setUseProfileRoutineMeals: (useProfileRoutineMeals) => set({ useProfileRoutineMeals }),

      // Generation
      setGeneratedPlan: (plan) => set({ generatedPlan: plan, showResult: plan !== null }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGenerationError: (generationError) => set({ generationError }),
      setGenerationProgress: (generationProgress) => set({ generationProgress }),

      // Active plan
      setActivePlan: (activePlan) => set({ activePlan }),
      setActivePlanLoaded: (activePlanLoaded) => set({ activePlanLoaded }),
      clearActivePlan: () => set({ activePlan: null, activePlanLoaded: false }),

      // UI
      setShowWizard: (showWizard) => set({ showWizard }),
      setShowResult: (showResult) => set({ showResult }),

      // Full reset
      clearAll: () => set({
        ...initialWizardState,
        ...initialGenerationState,
        ...initialUIState,
        startDate: getNextMonday(),
      }),

      // Get wizard form data for generation
      getWizardForm: (): WeeklyPlanForm => {
        const state = get();

        // Resolve routine meals: if using profile, merge profile data with any local overrides
        let resolvedRoutineMeals = state.routineMeals;
        if (state.useProfileRoutineMeals) {
          // Lazy-import profile store to avoid circular deps
          const { useProfileStore } = require('@/stores/profileStore');
          const profileRoutine: { meal_type: string; description: string }[] =
            useProfileStore.getState().routineMeals || [];
          const merged = { ...state.routineMeals };
          for (const rm of profileRoutine) {
            if (rm.description.trim()) {
              merged[rm.meal_type as keyof typeof merged] = rm.description;
            }
          }
          resolvedRoutineMeals = merged;
        }

        return {
          selectedDays: state.selectedDays,
          dayConfigs: state.dayConfigs,
          batchCookingEnabled: state.batchCookingEnabled,
          batchConfig: state.batchCookingEnabled ? state.batchConfig : undefined,
          cookingTimeByMealType: state.cookingTimeByMealType,
          cuisines: state.cuisines,
          equipment: state.equipment,
          ingredientsToInclude: state.ingredientsToInclude,
          ingredientsToExclude: state.ingredientsToExclude,
          useFavoriteIngredients: state.useFavoriteIngredients,
          dailyCalorieTarget: state.dailyCalorieTarget,
          servings: state.servings,
          routineMeals: resolvedRoutineMeals,
          specialNotes: state.specialNotes,
          planName: state.planName,
          startDate: state.startDate,
        };
      },
    }),
    {
      name: 'cocinia-weekly-plan-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activePlan: state.activePlan,
        activePlanLoaded: state.activePlanLoaded,
      }),
    }
  )
);

