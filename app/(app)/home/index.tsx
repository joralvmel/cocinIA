import { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input, Button, Chip, AlertModal } from '@/components/ui';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [profileData, restrictionsData, equipmentData, favoriteIngredientsData] = await Promise.all([
          profileService.getProfile(),
          profileService.getRestrictions(),
          profileService.getEquipment(),
          profileService.getFavoriteIngredients(),
        ]);
        setProfile(profileData);
        setRestrictions(restrictionsData);
        setEquipment(equipmentData);
        setFavoriteIngredients(favoriteIngredientsData.map(i => ({
          ingredient_name: i.ingredient_name,
          is_always_available: i.always_available,
        })));
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfileData();
  }, []);

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

  // Generate recipe
  const handleGenerate = async () => {
    if (!form.prompt.trim()) {
      setError(t('recipeGeneration.emptyPromptError'));
      return;
    }

    setLoading(true);
    setError(null);
    setShowRecipeResult(true);
    setOriginalPrompt(form.prompt);

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
    } else {
      setError(result.error || t('recipeGeneration.generateError'));
      setShowRecipeResult(false);
    }
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
    resetForm();
  };

  // Close result modal
  const handleCloseResult = () => {
    setShowRecipeResult(false);
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
      chips.push(<Chip key={cuisine} size="sm" label={t(`cuisines.${cuisine}`, { defaultValue: cuisine })} />);
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
          />
        </View>

        {/* Quick Filters */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('recipeGeneration.quickFiltersLabel')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                label={`${filter.icon} ${t(`recipeGeneration.filters.${filter.id}`)}`}
                selected={form.quickFilters.includes(filter.id)}
                onPress={() => toggleQuickFilter(filter.id)}
              />
            ))}
          </View>
        </View>

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

        {/* Generate Button */}
        <Button
          size="lg"
          onPress={handleGenerate}
          loading={isLoading}
          disabled={isLoading}
        >
          <View className="flex-row items-center justify-center">
            <FontAwesome name="magic" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-lg">
              {t('recipeGeneration.generateButton')}
            </Text>
          </View>
        </Button>

        {/* Spacer for better centering */}
        <View className="h-8" />
      </ScrollView>

      {/* Filters Modal */}
      <RecipeFiltersModal
        visible={showAdvancedOptions}
        onClose={() => setShowAdvancedOptions(false)}
        profileEquipment={equipment}
        profileCuisines={profile?.preferred_cuisines || []}
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
    </KeyboardAvoidingView>
  );
}
