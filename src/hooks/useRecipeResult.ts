import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type ActionOption } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UseRecipeResultOptions {
  onRegenerate: () => void;
  onModify: (modification: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  isModifying?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useRecipeResult({
  onRegenerate,
  onModify,
  onSave,
  onDiscard,
  isSaving = false,
  isModifying = false,
}: UseRecipeResultOptions) {
  const { t } = useTranslation();

  // Tips toggle state
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});

  // Modify sheet state
  const [showModifySheet, setShowModifySheet] = useState(false);
  const [modifyText, setModifyText] = useState('');

  const toggleStepTip = useCallback((stepNumber: number) => {
    setExpandedTips((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  }, []);

  const handleModifyPress = useCallback(() => {
    setShowModifySheet(true);
  }, []);

  const handleModifySubmit = useCallback(() => {
    if (modifyText.trim()) {
      onModify(modifyText.trim());
      setModifyText('');
      setShowModifySheet(false);
    }
  }, [modifyText, onModify]);

  const handleCloseModifySheet = useCallback(() => {
    setShowModifySheet(false);
  }, []);

  // FAB action options
  const fabOptions: ActionOption[] = useMemo(
    () => [
      {
        id: 'save',
        label: t('recipeGeneration.saveRecipe'),
        icon: 'bookmark',
        color: 'green',
        onPress: onSave,
        disabled: isSaving,
        loading: isSaving,
      },
      {
        id: 'modify',
        label: t('recipeGeneration.modify'),
        icon: 'pencil',
        color: 'amber',
        onPress: handleModifyPress,
        disabled: isModifying,
      },
      {
        id: 'regenerate',
        label: t('recipeGeneration.regenerate'),
        icon: 'refresh',
        color: 'blue',
        onPress: onRegenerate,
        disabled: isModifying || isSaving,
      },
      {
        id: 'discard',
        label: t('recipeGeneration.discard'),
        icon: 'trash',
        color: 'red',
        onPress: onDiscard,
        disabled: isModifying || isSaving,
      },
    ],
    [t, onSave, onRegenerate, onDiscard, handleModifyPress, isSaving, isModifying],
  );

  return {
    // Tips
    expandedTips,
    toggleStepTip,

    // Modify sheet
    showModifySheet,
    modifyText,
    setModifyText,
    handleModifySubmit,
    handleCloseModifySheet,

    // FAB
    fabOptions,

    // Pass-through flags
    isSaving,
    isModifying,
  };
}

