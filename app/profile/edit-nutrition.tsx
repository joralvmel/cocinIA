import { useEffect, useState } from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  NumberInput,
  SelectTrigger,
  SelectBottomSheet,
  Loader,
  Section,
  AlertModal,
  ScreenHeader,
} from '@/components/ui';
import { profileService } from '@/services';
import { calculateNutritionGoals, type FitnessGoal } from '@/utils';
import { useAppTheme } from '@/hooks/useAppTheme';
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function EditNutritionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'calculated'>('success');

  // Form state
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('maintain');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<number>(2000);
  const [proteinGoal, setProteinGoal] = useState<number>(50);
  const [carbsGoal, setCarbsGoal] = useState<number>(250);
  const [fatGoal, setFatGoal] = useState<number>(65);
  const [defaultServings, setDefaultServings] = useState<number>(4);

  // Profile data for calculations
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null>(null);

  // Bottom sheet visibility
  const [goalSheetVisible, setGoalSheetVisible] = useState(false);

  // Can calculate goals
  const canCalculate = birthDate && gender && activityLevel;

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getProfile();
      if (profile) {
        setFitnessGoal((profile.fitness_goal as FitnessGoal) || 'maintain');
        setDailyCalorieGoal(profile.daily_calorie_goal || 2000);
        setProteinGoal(profile.protein_goal_g || 50);
        setCarbsGoal(profile.carbs_goal_g || 250);
        setFatGoal(profile.fat_goal_g || 65);
        setDefaultServings(profile.default_servings || 4);

        // Store profile data for calculations
        setWeightKg(profile.weight_kg || 70);
        setHeightCm(profile.height_cm || 170);
        setBirthDate(profile.birth_date);
        setGender(profile.gender);
        setActivityLevel(profile.activity_level);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateGoals = () => {
    const goals = calculateNutritionGoals(
      weightKg,
      heightCm,
      birthDate,
      gender,
      activityLevel,
      fitnessGoal
    );

    if (goals) {
      setDailyCalorieGoal(goals.calories);
      setProteinGoal(goals.protein);
      setCarbsGoal(goals.carbs);
      setFatGoal(goals.fat);
      setAlertType('calculated');
      setAlertVisible(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({
        fitness_goal: fitnessGoal,
        daily_calorie_goal: dailyCalorieGoal,
        protein_goal_g: proteinGoal,
        carbs_goal_g: carbsGoal,
        fat_goal_g: fatGoal,
        default_servings: defaultServings,
      });
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      console.error('Error saving profile:', error);
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

  // Goal options
  const goalOptions = [
    { value: 'lose_weight', label: t('profile.goalLoseWeight'), icon: '📉' },
    { value: 'maintain', label: t('profile.goalMaintain'), icon: '⚖️' },
    { value: 'gain_muscle', label: t('profile.goalGainMuscle'), icon: '💪' },
    { value: 'eat_healthy', label: t('profile.goalEatHealthy'), icon: '🥗' },
  ];

  const selectedGoal = goalOptions.find((g) => g.value === fitnessGoal);

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
        <ScreenHeader title={t('profile.nutritionGoals')} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Selection */}
        <Section title={`🎯 ${t('profile.fitnessGoal')}`} className="mb-6">
          <SelectTrigger
            value={fitnessGoal}
            displayValue={selectedGoal ? `${selectedGoal.icon} ${selectedGoal.label}` : ''}
            placeholder={t('profile.goalPlaceholder')}
            onPress={() => setGoalSheetVisible(true)}
            className="mt-2"
          />

          {/* Calculate Button */}
          {canCalculate && (
            <Pressable
              onPress={handleCalculateGoals}
              className="flex-row items-center justify-center mt-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30"
            >
              <FontAwesome name="calculator" size={16} color={colors.primary} />
              <Text className="ml-2 text-primary-600 dark:text-primary-400 font-medium">
                {t('profile.calculateGoals')}
              </Text>
            </Pressable>
          )}

          {!canCalculate && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              {t('profile.completePersonalInfoToCalculate')}
            </Text>
          )}
        </Section>

        {/* Macros */}
        <Section title={`📊 ${t('profile.nutritionGoals')}`} className="mb-6">
          <View className="gap-4 mt-3">
            <NumberInput
              label={t('profile.dailyCalorieGoal')}
              value={dailyCalorieGoal}
              onChange={setDailyCalorieGoal}
              min={1000}
              max={5000}
              step={50}
              unit="kcal"
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <NumberInput
                  label={t('profile.proteinGoal')}
                  value={proteinGoal}
                  onChange={setProteinGoal}
                  min={0}
                  max={500}
                  step={5}
                  unit="g"
                />
              </View>
              <View className="flex-1">
                <NumberInput
                  label={t('profile.carbsGoal')}
                  value={carbsGoal}
                  onChange={setCarbsGoal}
                  min={0}
                  max={500}
                  step={5}
                  unit="g"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <NumberInput
                  label={t('profile.fatGoal')}
                  value={fatGoal}
                  onChange={setFatGoal}
                  min={0}
                  max={300}
                  step={5}
                  unit="g"
                />
              </View>
              <View className="flex-1">
                <NumberInput
                  label={t('profile.defaultServings')}
                  value={defaultServings}
                  onChange={setDefaultServings}
                  min={1}
                  max={12}
                />
              </View>
            </View>
          </View>
        </Section>

        <Button
          onPress={handleSave}
          variant="primary"
          size="lg"
          disabled={saving}
          className="mt-4"
        >
          {saving ? t('profile.saving') : t('profile.saveChanges')}
        </Button>
        </ScrollView>
      </View>

      {/* Goal Selector */}
      <SelectBottomSheet
        visible={goalSheetVisible}
        onClose={() => setGoalSheetVisible(false)}
        title={t('profile.fitnessGoal')}
        options={goalOptions}
        value={fitnessGoal}
        onChange={(v) => setFitnessGoal(v as FitnessGoal)}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={handleAlertClose}
        title={alertType === 'error' ? t('common.error') : t('common.done')}
        message={
          alertType === 'success'
            ? t('profile.profileUpdated')
            : alertType === 'calculated'
            ? t('profile.calculatedGoals')
            : t('profile.updateError')
        }
        variant={alertType === 'error' ? 'danger' : 'info'}
        confirmLabel={t('common.done')}
      />
      </SafeAreaView>
    </View>
  );
}
