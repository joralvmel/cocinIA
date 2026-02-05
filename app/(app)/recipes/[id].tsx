import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Card,
  Badge,
  Divider,
  Loader,
  Section,
  MultiActionButton,
  BottomSheet,
  Input,
  Button,
  AlertModal,
  NumberInput,
  type ActionOption,
} from '@/components/ui';
import { recipeService } from '@/services';
import { type Recipe } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedServings, setEditedServings] = useState(4);
  const [originalServings, setOriginalServings] = useState(4);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'info' | 'warning' | 'danger';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  // Photo picker modal state
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Load recipe
  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
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
  };

  const toggleStepTip = (stepNumber: number) => {
    setExpandedTips(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return String(t('recipeGeneration.difficultyEasy'));
      case 'medium': return String(t('recipeGeneration.difficultyMedium'));
      case 'hard': return String(t('recipeGeneration.difficultyHard'));
      default: return difficulty;
    }
  };

  // Handle delete recipe
  const handleDelete = () => {
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.deleteTitle' as any)),
      message: String(t('recipes.detail.deleteConfirm' as any)),
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await recipeService.deleteRecipe(id!);
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
  };

  // Handle save edits
  const handleSaveEdits = async () => {
    if (!recipe) return;
    try {
      setIsSaving(true);

      // Calculate adjustment ratio
      const ratio = editedServings / originalServings;

      // Adjust ingredients if servings changed
      let adjustedIngredients = recipe.ingredients;
      if (ratio !== 1 && recipe.ingredients) {
        adjustedIngredients = recipe.ingredients.map((ing: any) => ({
          ...ing,
          quantity: Math.round(ing.quantity * ratio * 100) / 100, // Round to 2 decimals
        }));
      }

      // Adjust cost if servings changed
      let adjustedCost = recipe.estimated_cost;
      if (ratio !== 1 && recipe.estimated_cost) {
        adjustedCost = Math.round(recipe.estimated_cost * ratio * 100) / 100;
      }

      const updates: Partial<Recipe> = {
        title: editedTitle,
        description: editedDescription,
        servings: editedServings,
        ingredients: adjustedIngredients,
        estimated_cost: adjustedCost,
      };
      await recipeService.updateRecipe(id!, updates);
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
  };

  // Handle image picker
  const handlePickImage = () => {
    setShowPhotoOptions(true);
  };

  const handleCameraPress = async () => {
    setShowPhotoOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.cameraPermissionDenied' as any)),
        variant: 'warning',
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const handleGalleryPress = async () => {
    setShowPhotoOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.permissionDenied' as any)),
        variant: 'warning',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploadingImage(true);
      await recipeService.uploadRecipeImage(id!, uri);
      await loadRecipe();
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.uploadError' as any)),
        variant: 'danger',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = () => {
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.deletePhotoTitle' as any)),
      message: String(t('recipes.detail.deletePhotoConfirm' as any)),
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsUploadingImage(true);
          await recipeService.deleteRecipeImage(id!);
          await loadRecipe();
        } catch (error) {
          console.error('Error deleting image:', error);
          setAlertModal({
            visible: true,
            title: String(t('common.error')),
            message: String(t('recipes.detail.deletePhotoError' as any)),
            variant: 'danger',
          });
        } finally {
          setIsUploadingImage(false);
        }
      },
    });
  };

  // FAB action options
  const fabOptions: ActionOption[] = [
    {
      id: 'edit',
      label: String(t('common.edit')),
      icon: 'pencil',
      color: 'amber',
      onPress: () => setIsEditing(true),
    },
    {
      id: 'delete',
      label: String(t('common.delete')),
      icon: 'trash',
      color: 'red',
      onPress: handleDelete,
    },
  ] as ActionOption[];

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Loader size="lg" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-6">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          {t('recipes.detail.notFound' as any)}
        </Text>
      </View>
    );
  }

  return (
    <>

      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Loading overlay for image operations */}
        {isUploadingImage && (
          <View className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-900/80 items-center justify-center">
            <Loader size="lg" />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center font-medium">
              {t('recipes.detail.uploadingImage' as any)}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Recipe Image */}
          {recipe.image_url && (
            <Image
              source={{ uri: recipe.image_url }}
              className="w-full h-56"
              resizeMode="cover"
            />
          )}

          <View className="px-4 pt-4 pb-24">
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              {recipe.title}
            </Text>

            {/* Description */}
            <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {recipe.description}
            </Text>

            {/* Quick Info Badges */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {recipe.difficulty && (
                <Badge
                  variant={getDifficultyColor(recipe.difficulty) as any}
                  label={getDifficultyLabel(recipe.difficulty)}
                />
              )}
              <Badge variant="info" label={`⏱️ ${recipe.total_time_minutes} min`} />
              <Badge variant="default" label={`👥 ${recipe.servings} ${t('recipeGeneration.servingsLabel')}`} />
              {recipe.cuisine && <Badge variant="default" label={recipe.cuisine} />}
            </View>

            {/* Nutrition Card */}
            {recipe.nutrition && (
              <Card variant="default" className="mb-4">
                <View className="flex-row justify-around py-2">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {recipe.nutrition.calories}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">kcal</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {recipe.nutrition.protein_g}g
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.protein')}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {recipe.nutrition.carbs_g}g
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.carbs')}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {recipe.nutrition.fat_g}g
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.fat')}</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Cost Card */}
            {recipe.estimated_cost && (
              <Card variant="outlined" className="mb-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">{t('recipeGeneration.estimatedCost')}</Text>
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {recipe.cost_currency} {recipe.estimated_cost.toFixed(2)}
                    </Text>
                  </View>
                  {recipe.cost_per_serving && (
                    <View className="items-end">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">{t('recipeGeneration.perServing')}</Text>
                      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {recipe.cost_currency} {recipe.cost_per_serving.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}

            {/* Time Breakdown Card */}
            <Card variant="outlined" className="mb-4">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <FontAwesome name="clock-o" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.prep_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.prepTime')}</Text>
                </View>
                <View className="items-center">
                  <FontAwesome name="fire" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.cook_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.cookTime')}</Text>
                </View>
                <View className="items-center">
                  <FontAwesome name="hourglass-end" size={20} color={colors.primary} />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
                    {recipe.total_time_minutes} min
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{t('recipeGeneration.totalTime')}</Text>
                </View>
              </View>
            </Card>

            <Divider className="my-4" />

            {/* Ingredients */}
            <Section title={`🥗 ${t('recipeGeneration.ingredients')}`}>
              <Card variant="outlined" padding="none">
                {recipe.ingredients?.map((ingredient: any, index: number) => (
                  <View
                    key={index}
                    className={`flex-row py-3 px-4 ${
                      index < (recipe.ingredients?.length || 0) - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    <View className="w-24 mr-3">
                      <Text className="text-primary-600 dark:text-primary-400 font-medium text-right">
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 dark:text-gray-50">
                        {ingredient.name}
                        {ingredient.is_optional && (
                          <Text className="text-gray-400 text-sm"> ({t('recipeGeneration.optional')})</Text>
                        )}
                      </Text>
                      {ingredient.notes && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {ingredient.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            </Section>

            <Divider className="my-4" />

            {/* Steps */}
            <Section title={`👨‍🍳 ${t('recipeGeneration.preparation')}`}>
              <Card variant="outlined" padding="none">
                {recipe.steps?.map((step: any, index: number) => (
                  <View
                    key={step.step_number}
                    className={`${
                      index < (recipe.steps?.length || 0) - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    <View className="flex-row p-4">
                      <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center mr-3 flex-shrink-0">
                        <Text className="text-white font-bold text-sm">{step.step_number}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-gray-50 leading-relaxed">
                          {step.instruction}
                        </Text>

                        {(step.duration_minutes || step.tip) && (
                          <View className="flex-row items-center mt-2 gap-3">
                            {step.duration_minutes && (
                              <View className="flex-row items-center">
                                <FontAwesome name="clock-o" size={12} color={colors.textMuted} />
                                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  {step.duration_minutes} min
                                </Text>
                              </View>
                            )}
                            {step.tip && (
                              <Pressable
                                onPress={() => toggleStepTip(step.step_number)}
                                className="flex-row items-center"
                              >
                                <FontAwesome
                                  name={expandedTips[step.step_number] ? 'chevron-down' : 'chevron-right'}
                                  size={10}
                                  color="#EAB308"
                                />
                                <FontAwesome name="lightbulb-o" size={12} color="#EAB308" />
                                <Text className="text-xs text-yellow-600 dark:text-yellow-400 ml-1 font-medium">
                                  {t('recipeGeneration.tipLabel')}
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {step.tip && expandedTips[step.step_number] && (
                      <View className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 {step.tip}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </Card>
            </Section>

            {/* Chef Tips */}
            {recipe.chef_tips && recipe.chef_tips.length > 0 && (
              <>
                <Divider className="my-4" />
                <Section title={`💡 ${t('recipeGeneration.chefTips')}`}>
                  <Card variant="default" className="bg-amber-50 dark:bg-amber-900/20">
                    {recipe.chef_tips.map((tip: string, index: number) => (
                      <View key={index} className="flex-row py-2">
                        <Text className="text-amber-600 dark:text-amber-400 mr-2">•</Text>
                        <Text className="flex-1 text-amber-800 dark:text-amber-200">{tip}</Text>
                      </View>
                    ))}
                  </Card>
                </Section>
              </>
            )}

            {/* Storage Instructions */}
            {recipe.storage_instructions && (
              <>
                <Divider className="my-4" />
                <Section title={`📦 ${t('recipeGeneration.storage')}`}>
                  <Card variant="outlined">
                    <Text className="text-gray-700 dark:text-gray-300">{recipe.storage_instructions}</Text>
                  </Card>
                </Section>
              </>
            )}

            {/* Variations */}
            {recipe.variations && recipe.variations.length > 0 && (
              <>
                <Divider className="my-4" />
                <Section title={`🔄 ${t('recipeGeneration.variations')}`}>
                  <Card variant="outlined">
                    {recipe.variations.map((variation: string, index: number) => (
                      <View key={index} className="flex-row py-2">
                        <Text className="text-primary-600 dark:text-primary-400 mr-2">•</Text>
                        <Text className="flex-1 text-gray-700 dark:text-gray-300">{variation}</Text>
                      </View>
                    ))}
                  </Card>
                </Section>
              </>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-4">
                {recipe.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="default" label={`#${tag}`} size="sm" />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-4">
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="primary-600"
            loading={isSaving || isDeleting}
            disabled={isSaving || isDeleting}
            options={fabOptions}
          />
        </View>
      </View>

      {/* Edit BottomSheet */}
      <BottomSheet
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        title={String(t('recipes.detail.editTitle' as any))}
      >
        <View className="gap-4 pb-4">
          <Input
            label={String(t('recipes.detail.titleLabel' as any))}
            value={editedTitle}
            onChangeText={setEditedTitle}
            placeholder={String(t('recipes.detail.titlePlaceholder' as any))}
          />
          <Input
            label={String(t('recipes.detail.descriptionLabel' as any))}
            value={editedDescription}
            onChangeText={setEditedDescription}
            placeholder={String(t('recipes.detail.descriptionPlaceholder' as any))}
            multiline
            numberOfLines={3}
          />
          <NumberInput
            label={String(t('recipes.detail.servingsLabel' as any))}
            value={editedServings}
            onChange={setEditedServings}
            min={1}
            max={50}
          />

          {/* Photo Section */}
          <View className="mt-2">
            <Text className="font-medium mb-2 text-gray-900 dark:text-gray-50">
              {t('recipes.detail.photoLabel' as any)}
            </Text>
            {recipe?.image_url ? (
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: recipe.image_url }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={handlePickImage}
                  >
                    {t('recipes.detail.changePhoto' as any)}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={handleDeleteImage}
                  >
                    {t('recipes.detail.deletePhoto' as any)}
                  </Button>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                className="flex-row items-center p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
              >
                <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
                  <FontAwesome name="camera" size={18} color={colors.primary} />
                </View>
                <Text className="flex-1 text-gray-500 dark:text-gray-400">
                  {t('recipes.detail.addPhoto' as any)}
                </Text>
                <FontAwesome name="plus" size={14} color={colors.primary} />
              </Pressable>
            )}
          </View>

          <View className="flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onPress={() => setIsEditing(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onPress={handleSaveEdits}
              loading={isSaving}
              disabled={!editedTitle.trim()}
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* Photo Options BottomSheet */}
      <BottomSheet
        visible={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        title={String(t('recipes.detail.addPhotoTitle' as any))}
      >
        <View className="gap-3 pb-4">
          <Pressable
            onPress={handleCameraPress}
            className="flex-row items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
              <FontAwesome name="camera" size={18} color={colors.primary} />
            </View>
            <Text className="flex-1 font-medium text-gray-900 dark:text-gray-50">
              {t('recipes.detail.fromCamera' as any)}
            </Text>
            <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={handleGalleryPress}
            className="flex-row items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mr-3">
              <FontAwesome name="image" size={18} color={colors.primary} />
            </View>
            <Text className="flex-1 font-medium text-gray-900 dark:text-gray-50">
              {t('recipes.detail.fromGallery' as any)}
            </Text>
            <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      </BottomSheet>

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onConfirm={alertModal.onConfirm}
        confirmLabel={alertModal.onConfirm ? String(t('common.delete')) : String(t('common.ok'))}
        cancelLabel={String(t('common.cancel'))}
      />
    </>
  );
}
