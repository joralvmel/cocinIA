import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEditIngredientsForm } from '@/hooks';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function EditIngredientsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const form = useEditIngredientsForm();

  // UI-only state
  const [showAddInput, setShowAddInput] = useState(false);
  const [showRecipeIngredients, setShowRecipeIngredients] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState('');

  // FAB actions
  const addActionOptions: ActionOption[] = [
    { id: 'manual', label: t('profile.addManual' as any), icon: 'pencil', color: 'primary', onPress: () => setShowAddInput(true) },
    { id: 'from-recipes', label: t('profile.fromRecipes' as any), icon: 'book', color: 'amber', onPress: () => setShowRecipeIngredients(true) },
  ];

  const handleAddAndClose = () => {
    form.handleAddIngredient();
    setShowAddInput(false);
  };

  if (form.loading || form.saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.favoriteIngredients')} onBack={form.handleBack} />

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
                        {ingredient.alwaysAvailable && (
                          <Text className="text-xs text-primary-600 dark:text-primary-400">
                            ✓ {t('profile.alwaysAvailable')}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center gap-3">
                        <Pressable onPress={() => form.toggleAlwaysAvailable(ingredient.id)} className="p-2">
                          <FontAwesome
                            name={ingredient.alwaysAvailable ? 'check-circle' : 'circle-o'}
                            size={20}
                            color={ingredient.alwaysAvailable ? colors.primary : colors.textSecondary}
                          />
                        </Pressable>
                        <Pressable onPress={() => form.removeIngredient(ingredient.id)} className="p-2">
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
            {form.ingredients.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('profile.selectedCount', { count: form.ingredients.length })}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Floating Add Button */}
        <View className="absolute bottom-6 right-6">
          <MultiActionButton icon="plus" options={addActionOptions} variant="floating" floatingColor="primary-500" loading={form.saving} />
        </View>

        {/* Manual Add BottomSheet */}
        <BottomSheet
          visible={showAddInput}
          onClose={() => { setShowAddInput(false); form.setNewIngredientName(''); form.setNewAlwaysAvailable(false); }}
          title={t('profile.addIngredient')}
          showOkButton
          okLabel={t('common.add')}
          onOk={handleAddAndClose}
        >
          <View className="gap-4 pb-4">
            <Input placeholder={t('profile.ingredientPlaceholder')} value={form.newIngredientName} onChangeText={form.setNewIngredientName} showClearButton />
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-1 mr-3">
                <Text className="text-sm text-gray-900 dark:text-gray-50">{t('profile.alwaysAvailable')}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">{t('profile.alwaysAvailableDesc')}</Text>
              </View>
              <Switch value={form.newAlwaysAvailable} onValueChange={form.setNewAlwaysAvailable} />
            </View>
          </View>
        </BottomSheet>

        {/* Recipe Ingredients BottomSheet */}
        <BottomSheet
          visible={showRecipeIngredients}
          onClose={() => { setShowRecipeIngredients(false); setRecipeSearch(''); }}
          title={t('profile.fromRecipes' as any)}
        >
          <View className="pb-4">
            {form.recipeIngredients.length > 0 ? (
              <>
                <SearchInput value={recipeSearch} onChangeText={setRecipeSearch} placeholder={t('common.searchAll' as any)} className="mb-3" />
                <ScrollView className="max-h-72" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {form.recipeIngredients
                    .filter((name) => !recipeSearch.trim() || name.toLowerCase().includes(recipeSearch.toLowerCase()))
                    .map((name) => {
                      const isAdded = form.isIngredientInFavorites(name);
                      return (
                        <Pressable
                          key={name}
                          onPress={() => form.addIngredientFromRecipe(name)}
                          className={`flex-row items-center py-3 px-4 rounded-xl mb-1 ${isAdded ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                        >
                          <Text className={`flex-1 text-base ${isAdded ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-900 dark:text-gray-50'}`}>
                            {name}
                          </Text>
                          {isAdded && <FontAwesome name="check" size={16} color={colors.primary} />}
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

        {/* Alert */}
        <AlertModal visible={form.alertVisible} onClose={() => form.setAlertVisible(false)} title={t('common.error')} message={t('profile.updateError')} variant="danger" confirmLabel={t('common.ok')} />
      </SafeAreaView>
    </View>
  );
}
