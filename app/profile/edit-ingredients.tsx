import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Section,
  Loader,
  AlertModal,
  ScreenHeader,
  Switch,
  IconButton,
} from '@/components/ui';
import { profileService } from '@/services';
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
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Form state
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);

  // New ingredient input
  const [showAddInput, setShowAddInput] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newAlwaysAvailable, setNewAlwaysAvailable] = useState(false);

  // Load ingredients on mount
  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await profileService.getFavoriteIngredients();
      if (data) {
        setIngredients(
          data.map((i) => ({
            id: i.id,
            ingredientName: i.ingredient_name,
            alwaysAvailable: i.always_available,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.saveFavoriteIngredients(
        ingredients.map((i) => ({
          ingredient_name: i.ingredientName,
          always_available: i.alwaysAvailable,
        }))
      );
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      console.error('Error saving ingredients:', error);
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    if (alertType === 'success') {
      router.back();
    }
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.favoriteIngredients')} />

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

            {/* Add ingredient section */}
            <Section title={`➕ ${t('profile.addIngredient')}`} className="mb-6">
              {showAddInput ? (
                <View className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Input
                    placeholder={t('profile.ingredientPlaceholder')}
                    value={newIngredientName}
                    onChangeText={setNewIngredientName}
                    className="mb-3"
                  />
                  <View className="flex-row items-center justify-between mb-4 px-1">
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
                  <View className="flex-row gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setShowAddInput(false);
                        setNewIngredientName('');
                        setNewAlwaysAvailable(false);
                      }}
                      className="flex-1"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={handleAddIngredient}
                      disabled={!newIngredientName.trim()}
                      className="flex-1"
                    >
                      {t('common.save')}
                    </Button>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowAddInput(true)}
                  className="flex-row items-center justify-center mt-2 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
                >
                  <FontAwesome name="plus" size={14} color={colors.textSecondary} />
                  <Text className="ml-2 text-gray-500 dark:text-gray-400">
                    {t('profile.addIngredient')}
                  </Text>
                </Pressable>
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

            {/* Spacer for floating button */}
            <View className="h-24" />
          </ScrollView>
        </View>

        {/* Floating Save Button */}
        <View
          className="absolute bottom-6 right-6"
          style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, borderRadius: 28 }}
        >
          {saving ? (
            <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center">
              <ActivityIndicator color="#ffffff" size="small" />
            </View>
          ) : (
            <IconButton
              icon="check"
              size="xl"
              variant="primary"
              onPress={handleSave}
            />
          )}
        </View>

        {/* Alert Modal */}
        <AlertModal
          visible={alertVisible}
          onClose={handleAlertClose}
          title={alertType === 'success' ? t('common.done') : t('common.error')}
          message={alertType === 'success' ? t('profile.profileUpdated') : t('profile.updateError')}
          variant={alertType === 'success' ? 'info' : 'danger'}
          confirmLabel={t('common.done')}
        />
      </SafeAreaView>
    </View>
  );
}
