import { useState, useEffect, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { Input, Chip, AlertModal, BottomSheet, MultiActionButton, type ActionOption } from '@/components/ui';
import { RecipeFiltersModal, RecipeResultModal } from '@/features';
import { useRecipeGenerationStore } from '@/stores';
import { profileService, recipeGenerationService, recipeService } from '@/services';
import { QUICK_FILTERS } from '@/types';
import { type Profile, type ProfileRestriction, type ProfileEquipment } from '@/services';
import { AI_CONFIG } from '@/config';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
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
    toggleQuickFilter,
    setGeneratedRecipe,
    setLoading,
    setError,
    setShowAdvancedOptions,
    setShowRecipeResult,
    setOriginalPrompt,
    resetForm,
  } = useRecipeGenerationStore();

  // Profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restrictions, setRestrictions] = useState<ProfileRestriction[]>([]);
  const [equipment, setEquipment] = useState<ProfileEquipment[]>([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState<{ ingredient_name: string; is_always_available: boolean }[]>([]);
  const [customCuisines, setCustomCuisines] = useState<{ id: string; cuisine_type: string; custom_name: string | null }[]>([]);
  const [userQuickFilters, setUserQuickFilters] = useState<string[]>(['quick', 'healthy', 'vegetarian', 'cheap']);
  const [isSaving, setIsSaving] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [hasUnsavedRecipe, setHasUnsavedRecipe] = useState(false);
  const [showRetryErrorModal, setShowRetryErrorModal] = useState(false);
  const [showQuickFiltersModal, setShowQuickFiltersModal] = useState(false);
  const [editingQuickFilters, setEditingQuickFilters] = useState<{ filter: string; isSelected: boolean }[]>([]);
  const [hasAppliedDefaults, setHasAppliedDefaults] = useState(false);

  // Get user's quick filters or default
  // Build from the loaded quick filters data
  const buildQuickFiltersArray = useCallback(() => {
    if (!profile) return ['quick', 'healthy', 'vegetarian', 'cheap'];
    // This will be populated after loadProfileData runs
    // For now, return empty - it will be set via setEditingQuickFilters
    return [];
  }, [profile]);

  // Get predefined filters that are in user's selection
  const predefinedFilters = QUICK_FILTERS.filter(f => userQuickFilters.includes(f.id));

  // Get custom filters (those not in QUICK_FILTERS)
  const customFilters = userQuickFilters
    .filter(f => !QUICK_FILTERS.some(qf => qf.id === f))
    .map(f => ({ id: f, icon: '⚡', label: f }));

  // Function to load profile data (restrictions, equipment, etc.)
  const loadProfileData = useCallback(async (applyDefaults: boolean = false) => {
    try {
      const [profileData, restrictionsData, equipmentData, favoriteIngredientsData, cuisinesData, quickFiltersData] = await Promise.all([
        profileService.getProfile(),
        profileService.getRestrictions(),
        profileService.getEquipment(),
        profileService.getFavoriteIngredients(),
        profileService.getCuisines(),
        profileService.getQuickFilters(),
      ]);
      setProfile(profileData);
      setRestrictions(restrictionsData);
      setEquipment(equipmentData);
      setFavoriteIngredients(favoriteIngredientsData.map(i => ({
        ingredient_name: i.ingredient_name,
        is_always_available: i.always_available,
      })));
      setCustomCuisines(cuisinesData.map(c => ({
        id: c.id,
        cuisine_type: c.cuisine_type,
        custom_name: c.custom_name,
      })));

      // Set quick filters from the new table
      if (quickFiltersData && quickFiltersData.length > 0) {
        const filters = quickFiltersData.map(f => f.custom_name || f.filter_type);
        setUserQuickFilters(filters);
      }

      // Only apply profile defaults on initial load, not on subsequent focus
      if (applyDefaults && !hasAppliedDefaults) {
        if (profileData?.preferred_cuisines && profileData.preferred_cuisines.length > 0) {
          setFormField('cuisines', profileData.preferred_cuisines);
        }
        if (equipmentData && equipmentData.length > 0) {
          setFormField('equipment', equipmentData.map(e => e.equipment_type));
        }
        setHasAppliedDefaults(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, [hasAppliedDefaults]);

  // Load profile data on mount with defaults
  useEffect(() => {
    loadProfileData(true);
  }, []);

  // Reload restrictions when screen comes into focus (after editing profile)
  // But don't reapply defaults
  useFocusEffect(
    useCallback(() => {
      loadProfileData(false);
    }, [loadProfileData])
  );

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

    // Transform cuisines: replace custom cuisine types with their custom names
    const transformedCuisines = formToUse.cuisines.map(cuisineId => {
      const customCuisine = customCuisines.find(c => c.cuisine_type === cuisineId);
      if (customCuisine && customCuisine.custom_name) {
        return customCuisine.custom_name;
      }
      return cuisineId;
    });

    // Create form with transformed cuisines for API
    const formToSend = { ...formToUse, cuisines: transformedCuisines };

    // Retry up to 3 times
    const maxRetries = 3;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await recipeGenerationService.generateRecipe(
        formToSend,
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

    // Transform cuisines: replace custom cuisine types with their custom names
    const transformedCuisines = form.cuisines.map(cuisineId => {
      const customCuisine = customCuisines.find(c => c.cuisine_type === cuisineId);
      if (customCuisine && customCuisine.custom_name) {
        return customCuisine.custom_name;
      }
      return cuisineId;
    });

    // Create form with transformed cuisines for API
    const formToSend = { ...form, cuisines: transformedCuisines };

    const result = await recipeGenerationService.generateRecipe(
      formToSend,
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
  };

  // Open quick filters editor
  const handleOpenQuickFiltersEdit = () => {
    const filters = userQuickFilters.map(f => ({
      filter: f,
      isSelected: true,
    }));
    setEditingQuickFilters(filters);
    setShowQuickFiltersModal(true);
  };

  // Toggle a quick filter in edit mode
  const handleToggleEditFilter = (filterId: string) => {
    setEditingQuickFilters(prev => {
      const existing = prev.find(f => f.filter === filterId);
      if (existing) {
        // Toggle the isSelected state
        return prev.map(f =>
          f.filter === filterId ? { ...f, isSelected: !f.isSelected } : f
        );
      }
      // If not found, add it as selected
      return [...prev, { filter: filterId, isSelected: true }];
    });
  };

  // Save quick filters
  const handleSaveQuickFilters = async () => {
    try {
      // Only save filters with isSelected: true
      const selectedFilters = editingQuickFilters.filter(f => f.isSelected);

      // Convert filter strings to ProfileQuickFilter format
      const filtersToSave = selectedFilters.map(f => {
        const isPredefined = QUICK_FILTERS.some(qf => qf.id === f.filter);
        if (isPredefined) {
          return { filter_type: f.filter };
        } else {
          return { filter_type: 'custom', custom_name: f.filter };
        }
      });

      await profileService.saveQuickFilters(filtersToSave);
      // Reload profile to get updated data
      await loadProfileData();
      setShowQuickFiltersModal(false);
    } catch (err) {
      console.error('Error saving quick filters:', err);
    }
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
      // Check if this is a custom cuisine and get its real name
      const customCuisine = customCuisines.find(c => c.cuisine_type === cuisine);
      const displayName = customCuisine && customCuisine.custom_name
        ? customCuisine.custom_name
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

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pt-6 pb-8 justify-center"
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

        {/* Quick Filters */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('recipeGeneration.quickFiltersLabel')}
            </Text>
            <Pressable onPress={handleOpenQuickFiltersEdit} className="p-1">
              <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {/* Predefined filters */}
            {predefinedFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={`${filter.icon} ${t(`recipeGeneration.filters.${filter.id}`)}`}
                selected={form.quickFilters.includes(filter.id)}
                onPress={() => toggleQuickFilter(filter.id)}
              />
            ))}
            {/* Custom filters */}
            {customFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={`${filter.icon} ${filter.label}`}
                selected={form.quickFilters.includes(filter.id)}
                onPress={() => toggleQuickFilter(filter.id)}
              />
            ))}
          </View>
        </View>

        {/* Profile Restrictions/Allergies Banner - Below quick filters */}
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
                const displayText = r.custom_value
                  ? r.custom_value
                  : t(`restrictions.${r.restriction_type}`, { defaultValue: r.restriction_type });
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

      {/* Quick Filters Edit Modal */}
      <BottomSheet
        visible={showQuickFiltersModal}
        onClose={() => setShowQuickFiltersModal(false)}
        title={String(t('recipeGeneration.editQuickFilters' as any))}
        showOkButton
        okLabel={String(t('common.save'))}
        onOk={handleSaveQuickFilters}
        showCloseButton={false}
      >
        <View className="pb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('profile.selectFilters' as any)}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {/* Predefined filters */}
            {QUICK_FILTERS.map((filter) => {
              const editingFilter = editingQuickFilters.find(f => f.filter === filter.id);
              return (
                <Chip
                  key={filter.id}
                  label={`${filter.icon} ${t(`recipeGeneration.filters.${filter.id}`)}`}
                  selected={editingFilter?.isSelected ?? false}
                  onPress={() => handleToggleEditFilter(filter.id)}
                />
              );
            })}
          </View>
          {/* Custom filters from profile */}
          {editingQuickFilters.filter(f => !QUICK_FILTERS.some(qf => qf.id === f.filter)).length > 0 && (
            <View className="mt-4">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t('profile.customItems' as any)} • {t('profile.manageInPreferences' as any)}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {editingQuickFilters
                  .filter(f => !QUICK_FILTERS.some(qf => qf.id === f.filter))
                  .map((filterObj) => (
                    <Chip
                      key={filterObj.filter}
                      label={`⚡ ${filterObj.filter}`}
                      selected={true}
                    />
                  ))
                }
              </View>
            </View>
          )}
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {t('profile.selectedCount' as any, { count: editingQuickFilters.filter(f => f.isSelected).length })}
          </Text>
        </View>
      </BottomSheet>

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
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
          // No unsaved recipe - show single generate button
          <MultiActionButton
            icon="magic"
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
