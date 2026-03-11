import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services';
import { useProfileStore } from '@/stores/profileStore';
import { useAutoSaveOnBack } from './useAutoSaveOnBack';

export interface RoutineMealState {
  meal_type: string;
  items: string[]; // individual meal options
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const SEPARATOR = ', ';

/**
 * Convert a description string to an array of items
 */
function descToItems(desc: string): string[] {
  if (!desc.trim()) return [];
  return desc
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Convert an array of items to a description string
 */
function itemsToDesc(items: string[]): string {
  return items.filter((s) => s.trim()).join(SEPARATOR);
}

export function useEditRoutineMealsForm() {
  const { routineMeals: cachedMeals, isLoaded: storeLoaded } = useProfileStore();

  const buildInitial = (source: { meal_type: string; description: string }[]): RoutineMealState[] =>
    MEAL_TYPES.map((mt) => ({
      meal_type: mt,
      items: descToItems(source.find((m) => m.meal_type === mt)?.description || ''),
    }));

  const [loading, setLoading] = useState(!storeLoaded);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [meals, setMeals] = useState<RoutineMealState[]>(buildInitial(cachedMeals));

  // Per-meal-type input text
  const [inputTexts, setInputTexts] = useState<Record<string, string>>(
    Object.fromEntries(MEAL_TYPES.map((mt) => [mt, '']))
  );

  // Load from API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await profileService.getRoutineMeals();
        if (data) {
          setMeals(buildInitial(data.map((d) => ({ meal_type: d.meal_type, description: d.description }))));
        }
      } catch (error) {
        console.error('Error loading routine meals:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save
  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = meals.map((m) => ({
        meal_type: m.meal_type,
        description: itemsToDesc(m.items),
      }));
      await profileService.saveRoutineMeals(payload);
      // Update store
      useProfileStore.getState().setRoutineMeals(
        payload.filter((m) => m.description.trim())
      );
    } catch (error) {
      console.error('Error saving routine meals:', error);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [meals, saving]);

  // Auto-save on back
  const { handleBack } = useAutoSaveOnBack(handleSave, [meals, saving]);

  // Add an item to a meal type
  const addItem = useCallback((mealType: string) => {
    const text = (inputTexts[mealType] || '').trim();
    if (!text) return;
    setMeals((prev) =>
      prev.map((m) =>
        m.meal_type === mealType && !m.items.some((i) => i.toLowerCase() === text.toLowerCase())
          ? { ...m, items: [...m.items, text] }
          : m
      )
    );
    setInputTexts((prev) => ({ ...prev, [mealType]: '' }));
  }, [inputTexts]);

  // Remove an item from a meal type
  const removeItem = useCallback((mealType: string, item: string) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.meal_type === mealType
          ? { ...m, items: m.items.filter((i) => i !== item) }
          : m
      )
    );
  }, []);

  // Update input text for a meal type
  const setInputText = useCallback((mealType: string, text: string) => {
    setInputTexts((prev) => ({ ...prev, [mealType]: text }));
  }, []);

  return {
    loading,
    saving,
    alertVisible,
    setAlertVisible,
    meals,
    inputTexts,
    setInputText,
    addItem,
    removeItem,
    handleBack,
  };
}

