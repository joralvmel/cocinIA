import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Input, Button, ChipGroup, Checkbox, Section, RangeSlider } from '@/components/ui';
import { useRecipeGenerationStore } from '@/stores';
import { cuisines } from '@/constants/cuisines';
import { equipment as equipmentConstants } from '@/constants/equipment';
import { type MealType, type DifficultyLevel } from '@/types';
import { type ProfileEquipment } from '@/services';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ProfileFavoriteIngredient {
  ingredient_name: string;
  is_always_available: boolean;
}

interface RecipeFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  profileEquipment?: ProfileEquipment[];
  profileCuisines?: string[];
  profileFavoriteIngredients?: ProfileFavoriteIngredient[];
}

export function RecipeFiltersModal({
  visible,
  onClose,
  profileEquipment = [],
  profileCuisines = [],
  profileFavoriteIngredients = [],
}: RecipeFiltersModalProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { form, setFormField } = useRecipeGenerationStore();

  // Local state for text inputs (to allow proper comma-separated input)
  const [ingredientsToUseText, setIngredientsToUseText] = useState('');
  const [ingredientsToExcludeText, setIngredientsToExcludeText] = useState('');
  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);

  // Default values from profile (used for reset)
  const defaultCuisines = profileCuisines;
  const defaultEquipment = profileEquipment.map(e => e.equipment_type);

  // Sync local state with form when modal opens
  useEffect(() => {
    if (visible) {
      setIngredientsToUseText(form.ingredientsToUse.join(', '));
      setIngredientsToExcludeText(form.ingredientsToExclude.join(', '));

      // Initialize with profile defaults on first open (only if no selections made)
      if (!hasInitializedDefaults) {
        // Pre-select profile cuisines if no cuisines selected
        if (form.cuisines.length === 0 && profileCuisines.length > 0) {
          setFormField('cuisines', profileCuisines);
        }
        // Pre-select profile equipment if no equipment selected
        if ((!form.equipment || form.equipment.length === 0) && profileEquipment.length > 0) {
          setFormField('equipment', profileEquipment.map(e => e.equipment_type));
        }
        setHasInitializedDefaults(true);
      }
    }
  }, [visible]);

  // Translated meal type options
  const mealTypeOptions = [
    { id: 'breakfast', label: String(t('recipeGeneration.mealTypes.breakfast')) },
    { id: 'lunch', label: String(t('recipeGeneration.mealTypes.lunch')) },
    { id: 'dinner', label: String(t('recipeGeneration.mealTypes.dinner')) },
    { id: 'snack', label: String(t('recipeGeneration.mealTypes.snack')) },
    { id: 'dessert', label: String(t('recipeGeneration.mealTypes.dessert')) },
  ];

  // Translated difficulty options
  const difficultyOptions = [
    { id: 'easy', label: String(t('recipeGeneration.difficultyEasy')) },
    { id: 'medium', label: String(t('recipeGeneration.difficultyMedium')) },
    { id: 'hard', label: String(t('recipeGeneration.difficultyHard')) },
  ];

  // Time options with translations
  const timeOptions = [
    { id: '15', label: '15 min' },
    { id: '30', label: '30 min' },
    { id: '45', label: '45 min' },
    { id: '60', label: `1 ${t('recipeGeneration.hour')}` },
    { id: '90', label: `1.5 ${t('recipeGeneration.hours')}` },
    { id: '120', label: `2+ ${t('recipeGeneration.hours')}` },
  ];

  const servingsOptions = [
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '4', label: '4' },
    { id: '6', label: '6' },
    { id: '8', label: '8' },
    { id: '10', label: '10+' },
  ];

  // All cuisine options (same as edit-preferences) - using labelKey for translation
  const allCuisineOptions = cuisines.map((c) => ({
    id: c.id,
    label: `${c.icon} ${String(t(c.labelKey as any, { defaultValue: c.defaultLabel }))}`,
  }));

  // All equipment options - combine standard with profile custom equipment
  const standardEquipmentOptions = equipmentConstants.map((e) => ({
    id: e.id,
    label: `${e.icon} ${String(t(e.labelKey as any, { defaultValue: e.defaultLabel }))}`,
  }));

  // Add custom equipment from profile that aren't in the standard list
  const customEquipmentFromProfile = profileEquipment
    .filter(e => e.custom_name && !equipmentConstants.find(std => std.id === e.equipment_type))
    .map(e => ({
      id: e.equipment_type,
      label: `🔧 ${e.custom_name}`,
    }));

  const allEquipmentOptions = [...standardEquipmentOptions, ...customEquipmentFromProfile];

  // Parse ingredients text into array when applying
  const parseIngredients = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map((i) => i.trim())
      .filter(Boolean);
  };

  // Reset all filters to profile defaults
  const handleReset = () => {
    setIngredientsToUseText('');
    setIngredientsToExcludeText('');
    setFormField('ingredientsToUse', []);
    setFormField('ingredientsToExclude', []);
    setFormField('useFavoriteIngredients', false);
    setFormField('mealTypes', []);
    setFormField('servings', undefined);
    setFormField('maxTime', undefined);
    setFormField('maxCalories', undefined);
    // Reset to profile defaults
    setFormField('cuisines', defaultCuisines);
    setFormField('equipment', defaultEquipment);
    setFormField('difficulty', undefined);
  };

  // Apply filters and close
  const handleApply = () => {
    // Parse and set ingredients
    setFormField('ingredientsToUse', parseIngredients(ingredientsToUseText));
    setFormField('ingredientsToExclude', parseIngredients(ingredientsToExcludeText));
    onClose();
  };

  // Handle max calorie change from slider
  const handleMaxCaloriesChange = (value: number) => {
    // If value is at max (1500), treat as no limit
    setFormField('maxCalories', value >= 1500 ? undefined : value);
  };

  return (
    <BottomSheet visible={visible} onClose={handleApply} title={String(t('recipeGeneration.advancedOptions'))}>
      <View className="pb-10 gap-5">
        {/* Reset Button */}
        <Pressable
          onPress={handleReset}
          className="flex-row items-center self-end"
        >
          <FontAwesome name="refresh" size={14} color={colors.error} style={{ marginRight: 6 }} />
          <Text className="text-red-500 dark:text-red-400 text-sm font-medium">
            {String(t('recipeGeneration.resetFilters' as any))}
          </Text>
        </Pressable>

        {/* Ingredients to Use */}
        <Section title={String(t('recipeGeneration.ingredientsToUse'))}>
          <Input
            placeholder={String(t('recipeGeneration.ingredientsPlaceholder'))}
            value={ingredientsToUseText}
            onChangeText={setIngredientsToUseText}
            multiline
            numberOfLines={2}
          />
        </Section>

        {/* Ingredients to Exclude */}
        <Section title={String(t('recipeGeneration.ingredientsToExclude'))}>
          <Input
            placeholder={String(t('recipeGeneration.excludePlaceholder'))}
            value={ingredientsToExcludeText}
            onChangeText={setIngredientsToExcludeText}
            multiline
            numberOfLines={2}
          />
        </Section>

        {/* Use Favorite Ingredients from Profile */}
        {profileFavoriteIngredients.length > 0 && (
          <View>
            <Checkbox
              checked={form.useFavoriteIngredients || false}
              onChange={(checked) => setFormField('useFavoriteIngredients', checked)}
              label={String(t('recipeGeneration.useFavoriteIngredients' as any))}
              strikethrough={false}
            />
            {form.useFavoriteIngredients && (
              <View className="mt-2 flex-row flex-wrap gap-1">
                {profileFavoriteIngredients.map((ing) => (
                  <Text key={ing.ingredient_name} className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                    {ing.ingredient_name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Meal Type */}
        <Section title={String(t('recipeGeneration.mealType'))}>
          <ChipGroup
            chips={mealTypeOptions}
            selectedIds={form.mealTypes}
            onSelectionChange={(ids) => setFormField('mealTypes', ids as MealType[])}
            multiple
          />
        </Section>

        {/* Servings */}
        <Section title={String(t('recipeGeneration.servings'))}>
          <ChipGroup
            chips={servingsOptions}
            selectedIds={form.servings ? [String(form.servings)] : []}
            onSelectionChange={(ids) => setFormField('servings', ids[0] ? parseInt(ids[0], 10) : undefined)}
            multiple={false}
          />
        </Section>

        {/* Max Time */}
        <Section title={String(t('recipeGeneration.maxTime'))}>
          <ChipGroup
            chips={timeOptions}
            selectedIds={form.maxTime ? [String(form.maxTime)] : []}
            onSelectionChange={(ids) => setFormField('maxTime', ids[0] ? parseInt(ids[0], 10) : undefined)}
            multiple={false}
          />
        </Section>

        {/* Max Calories with Slider */}
        <Section title={String(t('recipeGeneration.maxCalories' as any))}>
          <RangeSlider
            min={100}
            max={1500}
            step={50}
            value={form.maxCalories ?? 1500}
            onValueChange={handleMaxCaloriesChange}
            formatLabel={(v) => v >= 1500 ? String(t('recipeGeneration.noLimit' as any)) : `${v} kcal`}
          />
        </Section>

        {/* Cuisine */}
        <Section title={String(t('recipeGeneration.cuisine'))}>
          <ChipGroup
            chips={allCuisineOptions}
            selectedIds={form.cuisines}
            onSelectionChange={(ids) => setFormField('cuisines', ids)}
            multiple
          />
        </Section>

        {/* Equipment */}
        <Section title={String(t('profile.equipment'))}>
          <ChipGroup
            chips={allEquipmentOptions}
            selectedIds={form.equipment || []}
            onSelectionChange={(ids) => setFormField('equipment', ids)}
            multiple
          />
        </Section>

        {/* Difficulty */}
        <Section title={String(t('recipeGeneration.difficulty'))}>
          <ChipGroup
            chips={difficultyOptions}
            selectedIds={form.difficulty ? [form.difficulty] : []}
            onSelectionChange={(ids) => setFormField('difficulty', ids[0] as DifficultyLevel | undefined)}
            multiple={false}
          />
        </Section>

        {/* Apply Button */}
        <Button onPress={handleApply} className="mt-4">
          {t('common.apply')}
        </Button>
      </View>
    </BottomSheet>
  );
}
