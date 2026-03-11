import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecipeGenerationStore } from '@/stores';
import { cuisines } from '@/constants/cuisines';
import { equipment as equipmentConstants } from '@/constants/equipment';
import { type MealType, type DifficultyLevel } from '@/types';
import { type ProfileEquipment, type ProfileCuisine } from '@/services';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProfileFavoriteIngredient {
  ingredient_name: string;
  is_always_available: boolean;
}

export interface UseRecipeFiltersOptions {
  visible: boolean;
  onClose: () => void;
  profileEquipment?: ProfileEquipment[];
  profileCuisines?: string[];
  profileCustomCuisines?: ProfileCuisine[];
  profileFavoriteIngredients?: ProfileFavoriteIngredient[];
}

export interface ChipOption {
  id: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useRecipeFilters({
  visible,
  onClose,
  profileEquipment = [],
  profileCuisines = [],
  profileCustomCuisines = [],
  profileFavoriteIngredients = [],
}: UseRecipeFiltersOptions) {
  const { t } = useTranslation();
  const { form, setFormField } = useRecipeGenerationStore();

  // Local state
  const [ingredientsToUseText, setIngredientsToUseText] = useState('');
  const [ingredientsToExcludeText, setIngredientsToExcludeText] = useState('');
  const [ingredientsToUseItems, setIngredientsToUseItems] = useState<string[]>([]);
  const [ingredientsToExcludeItems, setIngredientsToExcludeItems] = useState<string[]>([]);
  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);
  const [resetPressed, setResetPressed] = useState(false);
  const [clearPressed, setClearPressed] = useState(false);

  // ---- Profile defaults ----
  const defaultCuisines = useMemo(
    () => [
      ...profileCuisines,
      ...profileCustomCuisines.filter((c) => c.custom_name).map((c) => `custom:${c.custom_name}`),
    ],
    [profileCuisines, profileCustomCuisines],
  );

  const defaultEquipment = useMemo(
    () =>
      profileEquipment.map((e) => (e.custom_name ? `custom:${e.custom_name}` : e.equipment_type)),
    [profileEquipment],
  );

  // ---- Sync with store when modal opens ----
  useEffect(() => {
    if (visible) {
      setIngredientsToUseItems([...form.ingredientsToUse]);
      setIngredientsToExcludeItems([...form.ingredientsToExclude]);
      setIngredientsToUseText('');
      setIngredientsToExcludeText('');

      if (!hasInitializedDefaults) {
        if (form.cuisines.length === 0 && (profileCuisines.length > 0 || profileCustomCuisines.length > 0)) {
          const customCuisineIds = profileCustomCuisines
            .filter((c) => c.custom_name)
            .map((c) => `custom:${c.custom_name}`);
          setFormField('cuisines', [...profileCuisines, ...customCuisineIds]);
        }
        if ((!form.equipment || form.equipment.length === 0) && profileEquipment.length > 0) {
          setFormField('equipment', defaultEquipment);
        }
        setHasInitializedDefaults(true);
      }
    }
  }, [visible]);

  // ---- Option arrays ----
  const mealTypeOptions: ChipOption[] = useMemo(
    () => [
      { id: 'breakfast', label: String(t('recipeGeneration.mealTypes.breakfast')) },
      { id: 'lunch', label: String(t('recipeGeneration.mealTypes.lunch')) },
      { id: 'dinner', label: String(t('recipeGeneration.mealTypes.dinner')) },
      { id: 'snack', label: String(t('recipeGeneration.mealTypes.snack')) },
      { id: 'dessert', label: String(t('recipeGeneration.mealTypes.dessert')) },
    ],
    [t],
  );

  const difficultyOptions: ChipOption[] = useMemo(
    () => [
      { id: 'easy', label: String(t('recipeGeneration.difficultyEasy')) },
      { id: 'medium', label: String(t('recipeGeneration.difficultyMedium')) },
      { id: 'hard', label: String(t('recipeGeneration.difficultyHard')) },
    ],
    [t],
  );

  const timeOptions: ChipOption[] = useMemo(
    () => [
      { id: '15', label: '15 min' },
      { id: '30', label: '30 min' },
      { id: '45', label: '45 min' },
      { id: '60', label: `1 ${t('recipeGeneration.hour')}` },
      { id: '90', label: `1.5 ${t('recipeGeneration.hours')}` },
      { id: '120', label: `2+ ${t('recipeGeneration.hours')}` },
    ],
    [t],
  );

  const servingsOptions: ChipOption[] = useMemo(
    () => [
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '4', label: '4' },
      { id: '6', label: '6' },
      { id: '8', label: '8' },
      { id: '10', label: '10+' },
    ],
    [],
  );

  const allCuisineOptions: ChipOption[] = useMemo(() => {
    const standard = cuisines.map((c) => ({
      id: c.id,
      label: `${c.icon} ${String(t(c.labelKey as any, { defaultValue: c.defaultLabel }))}`,
    }));
    const custom = profileCustomCuisines
      .filter((c) => c.custom_name)
      .map((c) => ({ id: `custom:${c.custom_name}`, label: `🍽️ ${c.custom_name}` }));
    return [...standard, ...custom];
  }, [t, profileCustomCuisines]);

  const allEquipmentOptions: ChipOption[] = useMemo(() => {
    const standard = equipmentConstants.map((e) => ({
      id: e.id,
      label: `${e.icon} ${String(t(e.labelKey as any, { defaultValue: e.defaultLabel }))}`,
    }));
    const custom = profileEquipment
      .filter((e) => e.custom_name && !equipmentConstants.find((std) => std.id === e.equipment_type))
      .map((e) => ({ id: `custom:${e.custom_name}`, label: `🔧 ${e.custom_name}` }));
    return [...standard, ...custom];
  }, [t, profileEquipment]);

  // ---- Visual feedback ----
  const flashReset = useCallback(() => {
    setResetPressed(true);
    setTimeout(() => setResetPressed(false), 600);
  }, []);

  const flashClear = useCallback(() => {
    setClearPressed(true);
    setTimeout(() => setClearPressed(false), 600);
  }, []);

  // ---- Actions ----
  const handleReset = useCallback(() => {
    setIngredientsToUseText('');
    setIngredientsToExcludeText('');
    setIngredientsToUseItems([]);
    setIngredientsToExcludeItems([]);
    setFormField('ingredientsToUse', []);
    setFormField('ingredientsToExclude', []);
    setFormField('useFavoriteIngredients', false);
    setFormField('mealTypes', []);
    setFormField('servings', undefined);
    setFormField('maxTime', undefined);
    setFormField('maxCalories', undefined);
    setFormField('cuisines', defaultCuisines);
    setFormField('equipment', defaultEquipment);
    setFormField('difficulty', undefined);
    flashReset();
  }, [setFormField, defaultCuisines, defaultEquipment, flashReset]);

  const handleClearAll = useCallback(() => {
    setIngredientsToUseText('');
    setIngredientsToExcludeText('');
    setIngredientsToUseItems([]);
    setIngredientsToExcludeItems([]);
    setFormField('ingredientsToUse', []);
    setFormField('ingredientsToExclude', []);
    setFormField('useFavoriteIngredients', false);
    setFormField('mealTypes', []);
    setFormField('servings', undefined);
    setFormField('maxTime', undefined);
    setFormField('maxCalories', undefined);
    setFormField('cuisines', []);
    setFormField('equipment', []);
    setFormField('difficulty', undefined);
    flashClear();
  }, [setFormField, flashClear]);

  const handleApply = useCallback(() => {
    setFormField('ingredientsToUse', ingredientsToUseItems);
    setFormField('ingredientsToExclude', ingredientsToExcludeItems);
    onClose();
  }, [setFormField, ingredientsToUseItems, ingredientsToExcludeItems, onClose]);

  const handleMaxCaloriesChange = useCallback(
    (value: number) => {
      setFormField('maxCalories', value >= 1500 ? undefined : value);
    },
    [setFormField],
  );

  // ---- Form field setters ----
  const setMealTypes = useCallback(
    (ids: string[]) => setFormField('mealTypes', ids as MealType[]),
    [setFormField],
  );

  const setServings = useCallback(
    (ids: string[]) => setFormField('servings', ids[0] ? parseInt(ids[0], 10) : undefined),
    [setFormField],
  );

  const setMaxTime = useCallback(
    (ids: string[]) => setFormField('maxTime', ids[0] ? parseInt(ids[0], 10) : undefined),
    [setFormField],
  );

  const setCuisines = useCallback(
    (ids: string[]) => setFormField('cuisines', ids),
    [setFormField],
  );

  const setEquipment = useCallback(
    (ids: string[]) => setFormField('equipment', ids),
    [setFormField],
  );

  const setDifficulty = useCallback(
    (ids: string[]) => setFormField('difficulty', ids[0] as DifficultyLevel | undefined),
    [setFormField],
  );

  const setUseFavoriteIngredients = useCallback(
    (checked: boolean) => setFormField('useFavoriteIngredients', checked),
    [setFormField],
  );

  // ---- Tag input handlers ----
  const addIngredientToUse = useCallback(() => {
    const trimmed = ingredientsToUseText.trim();
    if (trimmed && !ingredientsToUseItems.includes(trimmed)) {
      setIngredientsToUseItems((prev) => [...prev, trimmed]);
      setIngredientsToUseText('');
    }
  }, [ingredientsToUseText, ingredientsToUseItems]);

  const removeIngredientToUse = useCallback((item: string) => {
    setIngredientsToUseItems((prev) => prev.filter((i) => i !== item));
  }, []);

  const addIngredientToExclude = useCallback(() => {
    const trimmed = ingredientsToExcludeText.trim();
    if (trimmed && !ingredientsToExcludeItems.includes(trimmed)) {
      setIngredientsToExcludeItems((prev) => [...prev, trimmed]);
      setIngredientsToExcludeText('');
    }
  }, [ingredientsToExcludeText, ingredientsToExcludeItems]);

  const removeIngredientToExclude = useCallback((item: string) => {
    setIngredientsToExcludeItems((prev) => prev.filter((i) => i !== item));
  }, []);

  return {
    // Form state (from store)
    form,

    // Local text inputs
    ingredientsToUseText,
    setIngredientsToUseText,
    ingredientsToExcludeText,
    setIngredientsToExcludeText,

    // Tag items
    ingredientsToUseItems,
    ingredientsToExcludeItems,
    addIngredientToUse,
    removeIngredientToUse,
    addIngredientToExclude,
    removeIngredientToExclude,

    // Profile data
    profileFavoriteIngredients,

    // Visual feedback
    resetPressed,
    clearPressed,

    // Option arrays
    mealTypeOptions,
    difficultyOptions,
    timeOptions,
    servingsOptions,
    allCuisineOptions,
    allEquipmentOptions,

    // Actions
    handleReset,
    handleClearAll,
    handleApply,
    handleMaxCaloriesChange,

    // Form field setters
    setMealTypes,
    setServings,
    setMaxTime,
    setCuisines,
    setEquipment,
    setDifficulty,
    setUseFavoriteIngredients,
  };
}

