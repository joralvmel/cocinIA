import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Input,
  Section,
  Loader,
  AlertModal,
  ScreenHeader,
  Switch,
  MultiActionButton,
  BottomSheet,
  SearchInput,
  type ActionOption,
} from '@/components/ui';
import { profileService, recipeService } from '@/services';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface IngredientState {
  id: string;
  ingredientName: string;
  alwaysAvailable: boolean;
}

export default function EditIngredientsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const isNavigating = useRef(false);

  // Form state
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);

  // New ingredient input
  const [showAddInput, setShowAddInput] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newAlwaysAvailable, setNewAlwaysAvailable] = useState(false);

  // Ingredients from saved recipes
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
  const [showRecipeIngredients, setShowRecipeIngredients] = useState(false);

  // Recipe ingredients search
  const [recipeSearch, setRecipeSearch] = useState('');

  // Load ingredients on mount
  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const [data, recipeIngs] = await Promise.all([
        profileService.getFavoriteIngredients(),
        recipeService.getIngredientsFromRecipes(),
      ]);
      if (data) {
        setIngredients(
          data.map((i) => ({
            id: i.id,
            ingredientName: i.ingredient_name,
            alwaysAvailable: i.always_available,
          }))
        );
      }
      setRecipeIngredients(recipeIngs);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await profileService.saveFavoriteIngredients(
        ingredients.map((i) => ({
          ingredient_name: i.ingredientName,
          always_available: i.alwaysAvailable,
        }))
      );
      return true;
    } catch (error) {
      console.error('Error saving ingredients:', error);
      setAlertVisible(true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Auto-save when navigating back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (saving || isNavigating.current) return true;
        isNavigating.current = true;
        handleSave().then(() => {
          router.back();
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [ingredients, saving])
  );

  // Handle back from ScreenHeader
  const handleBack = async () => {
    if (saving || isNavigating.current) return;
    isNavigating.current = true;
    await handleSave();
    router.back();
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) return;

    const id = `new_${Date.now()}`;
    setIngredients((prev) => [
      ...prev,
      {
        id,
        ingredientName: newIngredientName.trim(),
        alwaysAvailable: newAlwaysAvailable,
      },
    ]);

    setNewIngredientName('');
    setNewAlwaysAvailable(false);
    setShowAddInput(false);
  };

  const addIngredientFromRecipe = (name: string) => {
    // Check if already in favorites
    if (ingredients.some(i => i.ingredientName.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const id = `recipe_${Date.now()}`;
    setIngredients((prev) => [
      ...prev,
      {
        id,
        ingredientName: name,
        alwaysAvailable: false,
      },
    ]);
  };

  const isIngredientInFavorites = (name: string) => {
    return ingredients.some(i => i.ingredientName.toLowerCase() === name.toLowerCase());
  };

  // Action options for MultiActionButton
  const addActionOptions: ActionOption[] = [
    {
      id: 'manual',
      label: t('profile.addManual' as any),
      icon: 'pencil',
      color: 'primary',
      onPress: () => setShowAddInput(true)
    },
    {
      id: 'from-recipes',
      label: t('profile.fromRecipes' as any),
      icon: 'book',
      color: 'amber',
      onPress: () => setShowRecipeIngredients(true)
    },
  ];

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleAlwaysAvailable = (id: string) => {
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, alwaysAvailable: !i.alwaysAvailable } : i
      )
    );
  };

  if (loading || saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.favoriteIngredients')} onBack={handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6 pb-24"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Help text */}
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('profile.ingredientsHelp')}
            </Text>

            {/* Ingredients list */}
            <Section title={`🥗 ${t('profile.favoriteIngredients')}`} className="mb-4">
              {ingredients.length > 0 ? (
                <View className="gap-2 mt-2">
                  {ingredients.map((ingredient) => (
                    <View
                      key={ingredient.id}
                      className="flex-row items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-base text-gray-900 dark:text-gray-50">
                          {ingredient.ingredientName}
                        </Text>
                        {ingredient.alwaysAvailable && (
                          <Text className="text-xs text-primary-600 dark:text-primary-400">
                            ✓ {t('profile.alwaysAvailable')}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          onPress={() => toggleAlwaysAvailable(ingredient.id)}
                          className="p-2"
                        >
                          <FontAwesome
                            name={ingredient.alwaysAvailable ? 'check-circle' : 'circle-o'}
                            size={20}
                            color={ingredient.alwaysAvailable ? colors.primary : colors.textSecondary}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => removeIngredient(ingredient.id)}
                          className="p-2"
                        >
                          <FontAwesome name="trash-o" size={18} color={colors.error} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-6 items-center">
                  <Text className="text-gray-400 dark:text-gray-500">
                    {t('profile.noIngredients')}
                  </Text>
                </View>
              )}
            </Section>

            {/* Selected count */}
            {ingredients.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('profile.selectedCount', { count: ingredients.length })}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="plus"
            options={addActionOptions}
            variant="floating"
            floatingColor="primary-500"
            loading={saving}
          />
        </View>

        {/* Manual Add BottomSheet */}
        <BottomSheet
          visible={showAddInput}
          onClose={() => {
            setShowAddInput(false);
            setNewIngredientName('');
            setNewAlwaysAvailable(false);
          }}
          title={t('profile.addIngredient')}
          showOkButton
          okLabel={t('common.add')}
          onOk={handleAddIngredient}
        >
          <View className="gap-4 pb-4">
            <Input
              placeholder={t('profile.ingredientPlaceholder')}
              value={newIngredientName}
              onChangeText={setNewIngredientName}
              showClearButton
            />
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-1 mr-3">
                <Text className="text-sm text-gray-900 dark:text-gray-50">
                  {t('profile.alwaysAvailable')}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('profile.alwaysAvailableDesc')}
                </Text>
              </View>
              <Switch
                value={newAlwaysAvailable}
                onValueChange={setNewAlwaysAvailable}
              />
            </View>
          </View>
        </BottomSheet>

        {/* Recipe Ingredients BottomSheet */}
        <BottomSheet
          visible={showRecipeIngredients}
          onClose={() => {
            setShowRecipeIngredients(false);
            setRecipeSearch('');
          }}
          title={t('profile.fromRecipes' as any)}
        >
          <View className="pb-4">
            {recipeIngredients.length > 0 ? (
              <>
                <SearchInput
                  value={recipeSearch}
                  onChangeText={setRecipeSearch}
                  placeholder={t('common.searchAll' as any)}
                  className="mb-3"
                />
                <ScrollView className="max-h-72" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {recipeIngredients
                    .filter(name => !recipeSearch.trim() || name.toLowerCase().includes(recipeSearch.toLowerCase()))
                    .map((name) => {
                      const isAdded = isIngredientInFavorites(name);
                      return (
                        <Pressable
                          key={name}
                          onPress={() => addIngredientFromRecipe(name)}
                          className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${
                            isAdded ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                          }`}
                        >
                          <Text className={`flex-1 text-base ${
                            isAdded
                              ? 'text-primary-600 dark:text-primary-400 font-medium'
                              : 'text-gray-900 dark:text-gray-50'
                          }`}>
                            {name}
                          </Text>
                          {isAdded && (
                            <FontAwesome name="check" size={16} color={colors.primary} />
                          )}
                        </Pressable>
                      );
                    })}
                </ScrollView>
              </>
            ) : (
              <Text className="text-gray-400 dark:text-gray-500 text-center py-6">
                {t('profile.noRecipeIngredients' as any)}
              </Text>
            )}
          </View>
        </BottomSheet>

        {/* Alert Modal */}
        <AlertModal
          visible={alertVisible}
          onClose={handleAlertClose}
          title={t('common.error')}
          message={t('profile.updateError')}
          variant="danger"
          confirmLabel={t('common.ok')}
        />
      </SafeAreaView>
    </View>
  );
}
