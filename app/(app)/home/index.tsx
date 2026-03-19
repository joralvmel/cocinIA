import {
    ActiveFiltersBar,
    GenerateFAB,
    HomeHeader,
    RestrictionsBanner,
} from "@/components/home";
import { RecipeFiltersModal, RecipeResultModal } from "@/components/recipes";
import { AlertModal, Input, Loader } from "@/components/ui";
import { useGenerateRecipe, useKeyboardHeight, useUserProfile } from "@/hooks";
import { useRecipeGenerationStore } from "@/stores";
import { buildActiveFilterChips, hasActiveFilters } from "@/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { openResult } = useLocalSearchParams<{ openResult?: string }>();

  // ---- Hooks ----
  const keyboardHeight = useKeyboardHeight();

  const {
    profile,
    restrictions,
    equipment,
    favoriteIngredients,
    customCuisines,
    profileLoaded,
    userName,
    applyProfileDefaults,
  } = useUserProfile();

  const {
    isSaving,
    isModifying,
    showSaveSuccessModal,
    hasUnsavedRecipe,
    showRetryErrorModal,
    handleGenerate,
    handleRegenerate,
    handleModify,
    handleSave,
    handleSaveSuccessConfirm,
    handleCloseResult,
    handleDiscard,
    handleReopenRecipe,
    handleDismissRetryError,
  } = useGenerateRecipe({ applyProfileDefaults });

  // ---- Store (form & UI slices only) ----
  const {
    form,
    generatedRecipe,
    isLoading,
    error,
    showAdvancedOptions,
    showRecipeResult,
    setFormField,
    setShowAdvancedOptions,
    setShowRecipeResult,
  } = useRecipeGenerationStore();

  useEffect(() => {
    if (openResult === "1") {
      setShowRecipeResult(true);
      router.replace("/(app)/home");
    }
  }, [openResult, router, setShowRecipeResult]);

  // ---- Derived data ----
  const greeting = userName
    ? `${String(t("recipeGeneration.greeting" as any))}, ${userName}`
    : "";
  const filtersActive = hasActiveFilters(form);
  const filterChips = buildActiveFilterChips(form, t as any);

  // ---- Loading gate ----
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4 pt-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <HomeHeader
          greeting={greeting}
          question={t("recipeGeneration.title")}
          subtitle={t("recipeGeneration.subtitle")}
        />

        {/* Main Input */}
        <View className="mb-5">
          <Input
            placeholder={t("recipeGeneration.promptPlaceholder")}
            value={form.prompt}
            onChangeText={(text) => setFormField("prompt", text)}
            multiline
            numberOfLines={3}
            leftIcon="lightbulb-o"
            showClearButton
          />
        </View>

        <RestrictionsBanner restrictions={restrictions} />

        <ActiveFiltersBar
          chips={filterChips}
          hasFilters={filtersActive}
          onPress={() => setShowAdvancedOptions(true)}
        />

        {/* Error Message */}
        {error && (
          <View className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <Text className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </Text>
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

      {/* Save Success Modal */}
      <AlertModal
        visible={showSaveSuccessModal}
        title={String(t("recipeGeneration.savedTitle"))}
        message={String(t("recipeGeneration.savedMessage"))}
        variant="info"
        confirmLabel={String(t("common.ok"))}
        onClose={handleSaveSuccessConfirm}
      />

      {/* Retry Error Modal */}
      <AlertModal
        visible={showRetryErrorModal}
        title={String(t("common.error"))}
        message={String(t("recipeGeneration.retryError"))}
        variant="danger"
        confirmLabel={String(t("common.ok"))}
        onClose={handleDismissRetryError}
      />

      {/* Floating Action Button */}
      <GenerateFAB
        hasUnsavedRecipe={hasUnsavedRecipe}
        generatedRecipe={generatedRecipe}
        isLoading={isLoading}
        keyboardHeight={keyboardHeight}
        onGenerate={handleGenerate}
        onReopenRecipe={handleReopenRecipe}
        onDiscard={handleDiscard}
      />
    </KeyboardAvoidingView>
  );
}
