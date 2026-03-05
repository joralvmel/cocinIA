import { useState, useEffect, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { Input, Chip, AlertModal, MultiActionButton, Loader } from '@/components/ui';
import { RecipeFiltersModal, RecipeResultModal } from '@/features';
import { useRecipeGenerationStore, useProfileStore } from '@/stores';
import { profileService, recipeGenerationService, recipeService} from '@/services';
import { type Profile, type ProfileEquipment } from '@/services';
import { AI_CONFIG } from '@/config';
import { getRestrictionById } from '@/constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipeEvents } from '@/utils';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const currentLang = (i18n.language?.startsWith('es') ? 'es' : 'en') as 'es' | 'en';

  // Store
  const {
    form,
    generatedRecipe,
    isLoading,
    error,
    showAdvancedOptions,
    showRecipeResult,
    setFormField,
    setGeneratedRecipe,
    setLoading,
    setError,
    setShowAdvancedOptions,
    setShowRecipeResult,
    setOriginalPrompt,
    resetForm,
  } = useRecipeGenerationStore();

  // Profile store — shared cache persisted to AsyncStorage
  const {
    profile,
    restrictions,
    equipment,
    favoriteIngredients,
    customCuisines,
    isLoaded: storeIsLoaded,
    setProfile,
    setRestrictions,
    setEquipment,
    setFavoriteIngredients: setStoreFavoriteIngredients,
    setCustomCuisines,
    setLoaded,
  } = useProfileStore();

  const [hasHydrated, setHasHydrated] = useState(
    () => useProfileStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (useProfileStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    return useProfileStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, []);

  const [profileLoaded, setProfileLoaded] = useState(
    () => useProfileStore.persist.hasHydrated() && useProfileStore.getState().isLoaded
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [hasUnsavedRecipe, setHasUnsavedRecipe] = useState(false);
  const [showRetryErrorModal, setShowRetryErrorModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track keyboard visibility for FAB positioning
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Helper to build form defaults from profile data
  const buildFormDefaults = useCallback((
    profileData: Profile | null,
    equipmentData: ProfileEquipment[],
    cuisinesData: { id: string; cuisine_type: string; custom_name: string | null }[]
  ) => {
    const predefinedCuisines = profileData?.preferred_cuisines || [];
    const customCuisineIds = (cuisinesData || [])
      .filter(c => c.custom_name)
      .map(c => `custom:${c.custom_name}`);
    const allCuisines = [...predefinedCuisines, ...customCuisineIds];
    const allEquipment = (equipmentData || []).map(e =>
      e.custom_name ? `custom:${e.custom_name}` : e.equipment_type
    );
    return { cuisines: allCuisines, equipment: allEquipment };
  }, []);

  // When hydration finishes and the store has cached data, unlock the UI immediately
  useEffect(() => {
    if (!hasHydrated) return;
    if (storeIsLoaded) {
      setProfileLoaded(true);
      const { profile: p, equipment: eq, customCuisines: cc } = useProfileStore.getState();
      const defaults = buildFormDefaults(p, eq, cc);
      if (defaults.cuisines.length > 0 && form.cuisines.length === 0) {
        setFormField('cuisines', defaults.cuisines);
      }
      if (defaults.equipment.length > 0 && (!form.equipment || form.equipment.length === 0)) {
        setFormField('equipment', defaults.equipment);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // Function to load (or refresh) profile data from the API and sync to store
  const loadProfileData = useCallback(async () => {
    try {
      const [profileData, restrictionsData, equipmentData, favoriteIngredientsData, cuisinesData] = await Promise.all([
        profileService.getProfile(),
        profileService.getRestrictions(),
        profileService.getEquipment(),
        profileService.getFavoriteIngredients(),
        profileService.getCuisines(),
      ]);

      const mappedCuisines = cuisinesData.map(c => ({
        id: c.id,
        cuisine_type: c.cuisine_type,
        custom_name: c.custom_name,
      }));

      const mappedFavorites = favoriteIngredientsData.map(i => ({
        ingredient_name: i.ingredient_name,
        is_always_available: i.always_available,
      }));

      setProfile(profileData);
      setRestrictions(restrictionsData);
      setEquipment(equipmentData);
      setStoreFavoriteIngredients(mappedFavorites);
      setCustomCuisines(mappedCuisines);
      setLoaded(true);

      // Sync form defaults with fresh data
      const defaults = buildFormDefaults(profileData, equipmentData, mappedCuisines);
      if (defaults.cuisines.length > 0) {
        setFormField('cuisines', defaults.cuisines);
      }
      if (defaults.equipment.length > 0) {
        setFormField('equipment', defaults.equipment);
      }
      setProfileLoaded(true);
    } catch (err) {
      console.error('Error loading profile:', err);
      setProfileLoaded(true); // Still show UI even on error
    }
  }, [buildFormDefaults, setFormField, setProfile, setRestrictions, setEquipment, setStoreFavoriteIngredients, setCustomCuisines, setLoaded]);

  // Load/refresh profile on every focus (initial + returning from preferences)
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // Helper to re-apply profile defaults to the form (after resetForm)
  const applyProfileDefaults = useCallback(() => {
    const defaults = buildFormDefaults(profile, equipment, customCuisines);
    if (defaults.cuisines.length > 0) {
      setFormField('cuisines', defaults.cuisines);
    }
    if (defaults.equipment.length > 0) {
      setFormField('equipment', defaults.equipment);
    }
  }, [profile, equipment, customCuisines, setFormField, buildFormDefaults]);

  // Get user's first name for greeting
  const userName = profile?.display_name?.split(' ')[0] || '';

  // Check if there are active filters
  const hasActiveFilters =
    form.ingredientsToUse.length > 0 ||
    form.ingredientsToExclude.length > 0 ||
    form.mealTypes.length > 0 ||
    form.cuisines.length > 0 ||
    (form.equipment && form.equipment.length > 0) ||
    form.maxTime ||
    form.difficulty ||
    form.servings ||
    form.maxCalories ||
    form.useFavoriteIngredients;

  // Generate recipe with retry logic
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowRecipeResult(true);

    // If no prompt, use a random/surprise prompt
    const actualPrompt = form.prompt.trim() || t('recipeGeneration.surprisePrompt');
    setOriginalPrompt(actualPrompt);

    // Temporarily set the prompt for generation if empty
    const formToUse = form.prompt.trim() ? form : { ...form, prompt: actualPrompt };

    // Get favorite ingredient names to pass to the service
    const favIngredientNames = favoriteIngredients.map(i => i.ingredient_name);

    // Retry up to 3 times
    const maxRetries = 3;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await recipeGenerationService.generateRecipe(
          formToUse,
          profile,
          restrictions,
          favIngredientNames,
          currentLang
      );

      if (result.success && result.recipe) {
        setLoading(false);
        setGeneratedRecipe(result.recipe);
        setHasUnsavedRecipe(true);
        return;
      }

      lastError = result.error || t('recipeGeneration.generateError');

      // If it's the last attempt, don't retry
      if (attempt < maxRetries) {
        console.log(`Recipe generation attempt ${attempt} failed, retrying...`);
      }
    }

    // All retries failed
    setLoading(false);
    setShowRecipeResult(false);
    setShowRetryErrorModal(true);
  };

  // Regenerate recipe
  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);

    // Get favorite ingredient names to pass to the service
    const favIngredientNames = favoriteIngredients.map(i => i.ingredient_name);

    const result = await recipeGenerationService.generateRecipe(
        form,
        profile,
        restrictions,
        favIngredientNames,
        currentLang
    );

    setLoading(false);

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      setHasUnsavedRecipe(true);
    } else {
      setError(result.error || t('recipeGeneration.generateError'));
    }
  };

  // Modify recipe
  const handleModify = async (modification: string) => {
    if (!generatedRecipe) return;

    setIsModifying(true);
    setError(null);

    const result = await recipeGenerationService.modifyRecipe(
      generatedRecipe,
      modification,
      profile,
      restrictions,
      currentLang
    );

    setIsModifying(false);

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
    } else {
      Alert.alert(t('common.error'), result.error || t('recipeGeneration.modifyError'));
    }
  };

  // Save recipe
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
    } catch (err) {
      Alert.alert(String(t('common.error')), String(t('recipeGeneration.saveError')));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save success confirmation
  const handleSaveSuccessConfirm = () => {
    setShowSaveSuccessModal(false);
    setShowRecipeResult(false);
    setHasUnsavedRecipe(false);
    setGeneratedRecipe(null);
    resetForm();
    // Re-apply profile defaults so filters aren't lost
    setTimeout(() => applyProfileDefaults(), 0);
  };

  // Close result modal
  const handleCloseResult = () => {
    setShowRecipeResult(false);
    // Don't clear hasUnsavedRecipe - keep it so user can reopen
  };

  // Discard recipe and reset
  const handleDiscard = () => {
    setShowRecipeResult(false);
    setHasUnsavedRecipe(false);
    setGeneratedRecipe(null);
    resetForm();
    // Re-apply profile defaults so filters aren't lost
    setTimeout(() => applyProfileDefaults(), 0);
  };

  // Reopen unsaved recipe
  const handleReopenRecipe = () => {
    if (generatedRecipe) {
      setShowRecipeResult(true);
    }
  };

  // Build greeting with user name first, then question
  const greeting = userName ? `${String(t('recipeGeneration.greeting' as any))}, ${userName}` : '';
  const question = t('recipeGeneration.title');

  // Build active filters summary
  const renderActiveFilters = () => {
    const chips: React.ReactNode[] = [];

    if (form.useFavoriteIngredients) {
      chips.push(<Chip key="favorites" size="sm" label={`❤️ ${String(t('recipeGeneration.favorites' as any))}`} />);
    }
    if (form.ingredientsToUse.length > 0) {
      chips.push(<Chip key="ingredients" size="sm" label={`+${form.ingredientsToUse.length} ${t('recipeGeneration.ingredients')}`} />);
    }
    if (form.ingredientsToExclude.length > 0) {
      chips.push(<Chip key="excluded" size="sm" label={`-${form.ingredientsToExclude.length} ${t('recipeGeneration.excluded')}`} />);
    }
    form.mealTypes.forEach((type) => {
      chips.push(<Chip key={type} size="sm" label={t(`recipeGeneration.mealTypes.${type}`)} />);
    });
    if (form.servings) {
      chips.push(<Chip key="servings" size="sm" label={`👥 ${form.servings}`} />);
    }
    form.cuisines.slice(0, 2).forEach((cuisine) => {
      // Custom cuisines have "custom:" prefix with the actual name
      const displayName = cuisine.startsWith('custom:')
        ? cuisine.substring('custom:'.length)
        : t(`cuisines.${cuisine}`, { defaultValue: cuisine });
      chips.push(<Chip key={cuisine} size="sm" label={displayName} />);
    });
    if (form.cuisines.length > 2) {
      chips.push(<Chip key="more-cuisines" size="sm" label={`+${form.cuisines.length - 2}`} />);
    }
    if (form.equipment && form.equipment.length > 0) {
      chips.push(<Chip key="equipment" size="sm" label={`🔧 ${form.equipment.length}`} />);
    }
    if (form.maxTime) {
      chips.push(<Chip key="time" size="sm" label={`⏱️ ${form.maxTime}min`} />);
    }
    if (form.maxCalories) {
      chips.push(<Chip key="calories" size="sm" label={`🔥 <${form.maxCalories}`} />);
    }
    if (form.difficulty) {
      chips.push(<Chip key="difficulty" size="sm" label={
        form.difficulty === 'easy' ? String(t('recipeGeneration.difficultyEasy')) :
        form.difficulty === 'medium' ? String(t('recipeGeneration.difficultyMedium')) :
        String(t('recipeGeneration.difficultyHard'))
      } />);
    }

    return chips;
  };

  // Show loading until profile data is ready
  if (!profileLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pt-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header - Left aligned */}
        <View className="mb-6">
          {greeting && (
            <Text className="text-base text-gray-500 dark:text-gray-400 mb-1">
              {greeting}
            </Text>
          )}
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            {question}
          </Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            {t('recipeGeneration.subtitle')}
          </Text>
        </View>

        {/* Main Input */}
        <View className="mb-5">
          <Input
            placeholder={t('recipeGeneration.promptPlaceholder')}
            value={form.prompt}
            onChangeText={(text) => setFormField('prompt', text)}
            multiline
            numberOfLines={3}
            leftIcon="lightbulb-o"
            showClearButton
          />
        </View>

        {/* Profile Restrictions/Allergies Banner */}
        {restrictions.length > 0 && (
          <View className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <View className="flex-row items-center mb-2">
              <FontAwesome name="shield" size={14} color={(colors as any).warning || '#f59e0b'} style={{ marginRight: 6 }} />
              <Text className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {t('recipeGeneration.activeRestrictions' as any)}
              </Text>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 6 }}>
              {restrictions.map((r) => {
                // For custom restrictions, show the custom_value directly
                // For predefined restrictions, look up the constant to get the proper i18n key
                let displayText: string;
                if (r.custom_value) {
                  displayText = r.custom_value;
                } else {
                  const restrictionDef = getRestrictionById(r.restriction_type);
                  displayText = restrictionDef
                    ? String(t(restrictionDef.labelKey as any, { defaultValue: restrictionDef.defaultLabel }))
                    : r.restriction_type;
                }
                return (
                  <View
                    key={r.id}
                    className={`px-2.5 py-1 rounded-full ${
                      r.is_allergy 
                        ? 'bg-red-100 dark:bg-red-900/40' 
                        : 'bg-amber-100 dark:bg-amber-900/40'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${
                      r.is_allergy 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {r.is_allergy ? '⚠️ ' : '🥗 '}{displayText}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Active Filters - Tappable to open modal */}
        <Pressable
          onPress={() => setShowAdvancedOptions(true)}
          className="mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <FontAwesome name="sliders" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recipeGeneration.advancedOptions')}
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.textMuted} />
          </View>

          {hasActiveFilters ? (
            <View className="flex-row flex-wrap gap-1">
              {renderActiveFilters()}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              {String(t('recipeGeneration.noFiltersActive' as any))}
            </Text>
          )}
        </Pressable>

        {/* Error Message */}
        {error && (
          <View className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <Text className="text-red-600 dark:text-red-400 text-sm">{error}</Text>
          </View>
        )}

        {/* Spacer for FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Filters Modal */}
      <RecipeFiltersModal
        visible={showAdvancedOptions}
        onClose={() => setShowAdvancedOptions(false)}
        profileEquipment={equipment}
        profileCuisines={profile?.preferred_cuisines || []}
        profileCustomCuisines={customCuisines as any}
        profileFavoriteIngredients={favoriteIngredients}
      />

      {/* Recipe Result Modal */}
      <RecipeResultModal
        visible={showRecipeResult}
        onClose={handleCloseResult}
        recipe={generatedRecipe}
        isLoading={isLoading}
        onRegenerate={handleRegenerate}
        onModify={handleModify}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
        isModifying={isModifying}
      />

      {/* Save Success Modal - Only one button */}
      <AlertModal
        visible={showSaveSuccessModal}
        title={String(t('recipeGeneration.savedTitle'))}
        message={String(t('recipeGeneration.savedMessage'))}
        variant="info"
        confirmLabel={String(t('common.ok'))}
        onClose={handleSaveSuccessConfirm}
      />

      {/* Retry Error Modal */}
      <AlertModal
        visible={showRetryErrorModal}
        title={String(t('common.error'))}
        message={String(t('recipeGeneration.retryError'))}
        variant="danger"
        confirmLabel={String(t('common.ok'))}
        onClose={() => setShowRetryErrorModal(false)}
      />

      {/* Floating Action Button */}
      <View
        className="absolute right-6"
        style={{ bottom: keyboardHeight > 0 ? keyboardHeight - (50 + insets.bottom) + 12 : 24 }}
      >
        {hasUnsavedRecipe && generatedRecipe ? (
          // Has unsaved recipe - show multi-action menu
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="amber-500"
            loading={isLoading}
            disabled={isLoading}
            options={[
              {
                id: 'view',
                label: t('recipeGeneration.viewRecipe' as any),
                icon: 'file-text-o',
                color: 'blue',
                onPress: handleReopenRecipe,
              },
              {
                id: 'generate',
                label: t('recipeGeneration.generateNew' as any),
                icon: 'magic',
                color: 'green',
                onPress: handleGenerate,
                disabled: isLoading,
              },
              {
                id: 'discard',
                label: t('recipeGeneration.discard'),
                icon: 'trash',
                color: 'red',
                onPress: handleDiscard,
              },
            ]}
          />
        ) : (
          // No unsaved recipe - show single generate button with label
          <MultiActionButton
            icon="magic"
            label={String(t('recipeGeneration.generateButton'))}
            variant="floating"
            floatingColor="primary-500"
            loading={isLoading}
            disabled={isLoading}
            options={[
              {
                id: 'generate',
                label: t('recipeGeneration.generate' as any),
                icon: 'magic',
                color: 'primary',
                onPress: handleGenerate,
              },
            ]}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
