import {
  AlertModal,
  BottomSheet,
  Input,
  Loader,
  MultiActionButton,
  ScreenHeader,
  SearchInput,
  Section,
  type ActionOption,
} from "@/components/ui";
import { useEditIngredientsForm } from "@/hooks";
import { useAppTheme } from "@/hooks/useAppTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditIngredientsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const form = useEditIngredientsForm();

  // UI-only state
  const [showRecipeIngredients, setShowRecipeIngredients] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");

  // FAB actions
  const addActionOptions: ActionOption[] = [
    {
      id: "from-recipes",
      label: t("profile.fromRecipes" as any),
      icon: "book",
      color: "amber",
      onPress: () => setShowRecipeIngredients(true),
    },
  ];

  if (form.loading || form.saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView
        className="flex-1"
        edges={["top"]}
        style={{ backgroundColor: colors.card }}
      >
        <ScreenHeader
          title={t("profile.favoriteIngredients")}
          onBack={form.handleBack}
        />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <KeyboardAvoidingView className="flex-1" behavior="padding">
            <ScrollView
              contentContainerClassName="px-4 py-6 pb-24"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Help text */}
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t("profile.ingredientsHelp")}
              </Text>

              {/* Ingredients list */}
              <Section
                title={`🥗 ${t("profile.favoriteIngredients")}`}
                className="mb-4"
              >
                {form.ingredients.length > 0 ? (
                  <View className="gap-2 mt-2">
                    {form.ingredients.map((ingredient) => (
                      <View
                        key={ingredient.id}
                        className="flex-row items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                      >
                        <View className="flex-1 mr-3">
                          <Text className="text-base text-gray-900 dark:text-gray-50">
                            {ingredient.ingredientName}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <Pressable
                            onPress={() => form.removeIngredient(ingredient.id)}
                            className="p-2"
                          >
                            <FontAwesome
                              name="trash-o"
                              size={18}
                              color={colors.error}
                            />
                          </Pressable>
                        </View>
                      </View>
                    ))}

                    {/* Quick add row (always the last item) */}
                    <View className="mt-1 flex-row items-center gap-2">
                      <View className="flex-1">
                        <Input
                          placeholder={t("profile.ingredientPlaceholder")}
                          value={form.newIngredientName}
                          onChangeText={form.setNewIngredientName}
                          onSubmitEditing={form.handleAddIngredient}
                          returnKeyType="done"
                          showClearButton
                        />
                      </View>
                      <Pressable
                        onPress={form.handleAddIngredient}
                        className="h-12 w-12 rounded-xl items-center justify-center bg-primary-500"
                      >
                        <FontAwesome name="plus" size={18} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="py-3 mt-2 gap-3">
                    <Text className="text-center text-gray-400 dark:text-gray-500">
                      {t("profile.noIngredients")}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1">
                        <Input
                          placeholder={t("profile.ingredientPlaceholder")}
                          value={form.newIngredientName}
                          onChangeText={form.setNewIngredientName}
                          onSubmitEditing={form.handleAddIngredient}
                          returnKeyType="done"
                          showClearButton
                        />
                      </View>
                      <Pressable
                        onPress={form.handleAddIngredient}
                        className="h-12 w-12 rounded-xl items-center justify-center bg-primary-500"
                      >
                        <FontAwesome name="plus" size={18} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </Section>

              {/* Selected count */}
              {form.ingredients.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {t("profile.selectedCount", {
                      count: form.ingredients.length,
                    })}
                  </Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>

        {/* Floating Add Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="plus"
            options={addActionOptions}
            variant="floating"
            floatingColor="primary-500"
            loading={form.saving}
          />
        </View>

        {/* Recipe Ingredients BottomSheet */}
        <BottomSheet
          visible={showRecipeIngredients}
          onClose={() => {
            setShowRecipeIngredients(false);
            setRecipeSearch("");
          }}
          title={t("profile.fromRecipes" as any)}
        >
          <View className="pb-4">
            {form.recipeIngredients.length > 0 ? (
              <>
                <SearchInput
                  value={recipeSearch}
                  onChangeText={setRecipeSearch}
                  placeholder={t("common.searchAll" as any)}
                  className="mb-3"
                />
                <ScrollView
                  className="max-h-72"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {form.recipeIngredients
                    .filter(
                      (name) =>
                        !recipeSearch.trim() ||
                        name.toLowerCase().includes(recipeSearch.toLowerCase()),
                    )
                    .map((name) => {
                      const isAdded = form.isIngredientInFavorites(name);
                      return (
                        <Pressable
                          key={name}
                          onPress={() => form.addIngredientFromRecipe(name)}
                          className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${isAdded ? "bg-primary-50 dark:bg-primary-900/30" : ""}`}
                        >
                          <Text
                            className={`flex-1 text-base ${isAdded ? "text-primary-600 dark:text-primary-400 font-medium" : "text-gray-900 dark:text-gray-50"}`}
                          >
                            {name}
                          </Text>
                          {isAdded && (
                            <FontAwesome
                              name="check"
                              size={16}
                              color={colors.primary}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                </ScrollView>
              </>
            ) : (
              <Text className="text-gray-400 dark:text-gray-500 text-center py-6">
                {t("profile.noRecipeIngredients" as any)}
              </Text>
            )}
          </View>
        </BottomSheet>

        {/* Alert */}
        <AlertModal
          visible={form.alertVisible}
          onClose={() => form.setAlertVisible(false)}
          title={t("common.error")}
          message={t("profile.updateError")}
          variant="danger"
          confirmLabel={t("common.ok")}
        />
      </SafeAreaView>
    </View>
  );
}
