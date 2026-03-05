import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { recipeService } from '@/services';
import { type Recipe } from '@/types';
import { recipeEvents } from '@/utils';
import { adjustIngredientsForServings, adjustCostForServings } from '@/utils/recipeHelpers';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AlertModalState {
  visible: boolean;
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'danger';
  onConfirm?: () => void;
  confirmLabel?: string;
}

export interface RecipeEditState {
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
  editedServings: number;
}

export interface RecipeEditActions {
  setIsEditing: (v: boolean) => void;
  setEditedTitle: (v: string) => void;
  setEditedDescription: (v: string) => void;
  setEditedServings: (v: number) => void;
  handleSaveEdits: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useRecipeDetail(id: string | undefined) {
  const { t } = useTranslation();
  const router = useRouter();

  // ---- Core state ----
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Edit state ----
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedServings, setEditedServings] = useState(4);
  const [originalServings, setOriginalServings] = useState(4);

  // ---- Step tips toggle ----
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});

  const toggleStepTip = useCallback((stepNumber: number) => {
    setExpandedTips((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  }, []);

  // ---- Alert modal ----
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  // ---- Load recipe ----
  const loadRecipe = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await recipeService.getRecipeById(id);
      setRecipe(data);
      if (data) {
        setEditedTitle(data.title);
        setEditedDescription(data.description || '');
        setEditedServings(data.servings || 4);
        setOriginalServings(data.servings || 4);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.loadError' as any)),
        variant: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  // ---- Delete ----
  const handleDelete = useCallback(() => {
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.deleteTitle' as any)),
      message: String(t('recipes.detail.deleteConfirm' as any)),
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await recipeService.deleteRecipe(id!);
          recipeEvents.emit();
          router.back();
        } catch (error) {
          console.error('Error deleting recipe:', error);
          setAlertModal({
            visible: true,
            title: String(t('common.error')),
            message: String(t('recipes.detail.deleteError' as any)),
            variant: 'danger',
          });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }, [id, t, router]);

  // ---- Save edits ----
  const handleSaveEdits = useCallback(async () => {
    if (!recipe) return;
    try {
      setIsSaving(true);

      const ratio = editedServings / originalServings;
      const adjustedIngredients = recipe.ingredients
        ? adjustIngredientsForServings(recipe.ingredients, ratio)
        : recipe.ingredients;
      const adjustedCost = recipe.estimated_cost
        ? adjustCostForServings(recipe.estimated_cost, ratio)
        : recipe.estimated_cost;

      const updates: Partial<Recipe> = {
        title: editedTitle,
        description: editedDescription,
        servings: editedServings,
        ingredients: adjustedIngredients,
        estimated_cost: adjustedCost,
      };

      await recipeService.updateRecipe(id!, updates);
      recipeEvents.emit();
      await loadRecipe();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.saveError' as any)),
        variant: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  }, [recipe, editedTitle, editedDescription, editedServings, originalServings, id, t, loadRecipe]);

  return {
    recipe,
    isLoading,
    isSaving,
    isDeleting,
    loadRecipe,

    // Edit
    editState: {
      isEditing,
      editedTitle,
      editedDescription,
      editedServings,
    } as RecipeEditState,
    editActions: {
      setIsEditing,
      setEditedTitle,
      setEditedDescription,
      setEditedServings,
      handleSaveEdits,
    } as RecipeEditActions,

    // Delete
    handleDelete,

    // Step tips
    expandedTips,
    toggleStepTip,

    // Alert
    alertModal,
    setAlertModal,
  };
}

