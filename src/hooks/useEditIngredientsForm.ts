import { profileService, recipeService } from "@/services";
import { useProfileStore } from "@/stores/profileStore";
import { useCallback, useEffect, useState } from "react";
import { useAutoSaveOnBack } from "./useAutoSaveOnBack";

export interface IngredientState {
  id: string;
  ingredientName: string;
}

export function useEditIngredientsForm() {
  // Seed from store for instant display
  const { favoriteIngredients: cachedIngredients, isLoaded: storeLoaded } =
    useProfileStore();
  const seedIngredients = storeLoaded
    ? cachedIngredients.map((i, idx) => ({
        id: `cached_${idx}`,
        ingredientName: i.ingredient_name,
      }))
    : [];

  const [loading, setLoading] = useState(!storeLoaded);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Form state
  const [ingredients, setIngredients] =
    useState<IngredientState[]>(seedIngredients);

  // New ingredient input
  const [newIngredientName, setNewIngredientName] = useState("");

  // Ingredients from saved recipes
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);

  // ---- Load ----
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [data, recipeIngs] = await Promise.all([
          profileService.getAlwaysAvailableIngredients(),
          recipeService.getIngredientsFromRecipes(),
        ]);
        if (data) {
          setIngredients(
            data.map((i) => ({
              id: i.id,
              ingredientName: i.ingredient_name,
            })),
          );
        }
        setRecipeIngredients(recipeIngs);
      } catch (error) {
        console.error("Error loading ingredients:", error);
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
      await profileService.saveAlwaysAvailableIngredients(
        ingredients.map((i) => ({
          ingredient_name: i.ingredientName,
        })),
      );
    } catch (error) {
      console.error("Error saving ingredients:", error);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [ingredients, saving]);

  // ---- Auto-save on back ----
  const { handleBack } = useAutoSaveOnBack(handleSave, [ingredients, saving]);

  // ---- Mutations ----
  const isIngredientInFavorites = useCallback(
    (name: string) =>
      ingredients.some(
        (i) => i.ingredientName.toLowerCase() === name.toLowerCase(),
      ),
    [ingredients],
  );

  const handleAddIngredient = useCallback(() => {
    if (!newIngredientName.trim()) return;
    setIngredients((prev) => [
      ...prev,
      { id: `new_${Date.now()}`, ingredientName: newIngredientName.trim() },
    ]);
    setNewIngredientName("");
  }, [newIngredientName]);

  const addIngredientFromRecipe = useCallback(
    (name: string) => {
      if (isIngredientInFavorites(name)) {
        setIngredients((prev) =>
          prev.filter(
            (i) => i.ingredientName.toLowerCase() !== name.toLowerCase(),
          ),
        );
        return;
      }
      setIngredients((prev) => [
        ...prev,
        { id: `recipe_${Date.now()}`, ingredientName: name },
      ]);
    },
    [isIngredientInFavorites],
  );

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    loading,
    saving,
    alertVisible,
    setAlertVisible,

    // Ingredients
    ingredients,
    recipeIngredients,

    // New ingredient input
    newIngredientName,
    setNewIngredientName,

    // Actions
    handleAddIngredient,
    addIngredientFromRecipe,
    removeIngredient,
    isIngredientInFavorites,

    // Navigation
    handleBack,
  };
}
