import { AI_CONFIG } from "@/config";
import {
  backgroundGenerationService,
  generationNotificationsService,
  recipeGenerationService,
  recipeService,
} from "@/services";
import { useProfileStore, useRecipeGenerationStore } from "@/stores";
import { recipeEvents } from "@/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

interface UseGenerateRecipeOptions {
  /** Called after a form reset to re-sync profile defaults */
  applyProfileDefaults: () => void;
}

/**
 * Encapsulates recipe generation, regeneration, modification,
 * save, discard, and reopen logic.
 */
export function useGenerateRecipe({
  applyProfileDefaults,
}: UseGenerateRecipeOptions) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.startsWith("es") ? "es" : "en") as
    | "es"
    | "en";

  const {
    form,
    generatedRecipe,
    setGeneratedRecipe,
    setLoading,
    setError,
    setShowRecipeResult,
    setOriginalPrompt,
    resetForm,
  } = useRecipeGenerationStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [hasUnsavedRecipe, setHasUnsavedRecipe] = useState(false);
  const [showRetryErrorModal, setShowRetryErrorModal] = useState(false);

  // Read profile slices directly from the store (avoids prop-drilling)
  const getProfileData = () => {
    const { profile, restrictions, favoriteIngredients } =
      useProfileStore.getState();
    return { profile, restrictions, favoriteIngredients };
  };

  // ---- Generate (with retry) ----
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowRecipeResult(true);

    const actualPrompt =
      form.prompt.trim() || t("recipeGeneration.surprisePrompt");
    setOriginalPrompt(actualPrompt);

    const formToUse = form.prompt.trim()
      ? form
      : { ...form, prompt: actualPrompt };
    const { profile, restrictions, favoriteIngredients } = getProfileData();
    const favIngredientNames = favoriteIngredients.map(
      (i) => i.ingredient_name,
    );

    try {
      await generationNotificationsService.showRecipeProgress(
        currentLang === "es"
          ? "Iniciando generacion..."
          : "Starting generation...",
        currentLang,
      );

      const result =
        await backgroundGenerationService.generateRecipeWithRetryInBackground({
          form: formToUse,
          profile,
          restrictions,
          favoriteIngredients: favIngredientNames,
          lang: currentLang,
          maxRetries: 3,
          onAttemptFailed: async (attempt, maxRetries) => {
            if (attempt < maxRetries) {
              await generationNotificationsService.showRecipeProgress(
                currentLang === "es"
                  ? `Reintentando (${attempt + 1}/${maxRetries})...`
                  : `Retrying (${attempt + 1}/${maxRetries})...`,
                currentLang,
              );
            }
          },
        });

      if (result.success && result.recipe) {
        setGeneratedRecipe(result.recipe);
        setHasUnsavedRecipe(true);
        await generationNotificationsService.showRecipeCompletion(
          result.recipe.title,
          currentLang,
        );
        return;
      }

      setShowRecipeResult(false);
      setShowRetryErrorModal(true);
      await generationNotificationsService.showRecipeError(
        result.error || t("recipeGeneration.generateError"),
        currentLang,
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : t("recipeGeneration.generateError");
      setShowRecipeResult(false);
      setShowRetryErrorModal(true);
      await generationNotificationsService.showRecipeError(
        String(errorMsg),
        currentLang,
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- Regenerate ----
  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);

    const { profile, restrictions, favoriteIngredients } = getProfileData();
    const favIngredientNames = favoriteIngredients.map(
      (i) => i.ingredient_name,
    );

    const result = await recipeGenerationService.generateRecipe(
      form,
      profile,
      restrictions,
      favIngredientNames,
      currentLang,
    );

    setLoading(false);

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      setHasUnsavedRecipe(true);
    } else {
      setError(result.error || t("recipeGeneration.generateError"));
    }
  };

  // ---- Modify ----
  const handleModify = async (modification: string) => {
    if (!generatedRecipe) return;

    setIsModifying(true);
    setError(null);

    const { profile, restrictions } = getProfileData();

    const result = await recipeGenerationService.modifyRecipe(
      generatedRecipe,
      modification,
      profile,
      restrictions,
      currentLang,
    );

    setIsModifying(false);

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
    } else {
      Alert.alert(
        t("common.error"),
        result.error || t("recipeGeneration.modifyError"),
      );
    }
  };

  // ---- Save ----
  const handleSave = async () => {
    if (!generatedRecipe) return;

    setIsSaving(true);

    try {
      await recipeService.saveRecipe({
        recipe: generatedRecipe,
        originalPrompt: form.prompt,
        generationParams: form as unknown as Record<string, unknown>,
        aiModel: AI_CONFIG.model,
      });

      recipeEvents.emit();
      setShowSaveSuccessModal(true);
    } catch {
      Alert.alert(
        String(t("common.error")),
        String(t("recipeGeneration.saveError")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Post-save confirmation ----
  const handleSaveSuccessConfirm = () => {
    setShowSaveSuccessModal(false);
    setShowRecipeResult(false);
    setHasUnsavedRecipe(false);
    setGeneratedRecipe(null);
    resetForm();
    setTimeout(() => applyProfileDefaults(), 0);
  };

  // ---- Close result modal (keep unsaved) ----
  const handleCloseResult = () => {
    setShowRecipeResult(false);
  };

  // ---- Discard ----
  const handleDiscard = () => {
    setShowRecipeResult(false);
    setHasUnsavedRecipe(false);
    setGeneratedRecipe(null);
    resetForm();
    setTimeout(() => applyProfileDefaults(), 0);
  };

  // ---- Reopen unsaved recipe ----
  const handleReopenRecipe = () => {
    if (generatedRecipe) {
      setShowRecipeResult(true);
    }
  };

  // ---- Dismiss retry-error modal ----
  const handleDismissRetryError = () => {
    setShowRetryErrorModal(false);
  };

  return {
    // State
    isSaving,
    isModifying,
    showSaveSuccessModal,
    hasUnsavedRecipe,
    showRetryErrorModal,

    // Handlers
    handleGenerate,
    handleRegenerate,
    handleModify,
    handleSave,
    handleSaveSuccessConfirm,
    handleCloseResult,
    handleDiscard,
    handleReopenRecipe,
    handleDismissRetryError,
  };
}
