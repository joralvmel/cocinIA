import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NumberInput,
  SelectTrigger,
  SelectBottomSheet,
  Loader,
  Section,
  AlertModal,
  ScreenHeader,
  MultiActionButton,
  type ActionOption,
} from '@/components/ui';
import { profileService } from '@/services';
import { calculateNutritionGoals, type FitnessGoal } from '@/utils';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function EditNutritionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'error' | 'calculated'>('error');

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
    if (saving) return;
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
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertType('error');
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
        handleSave().then(() => {
          router.back();
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [fitnessGoal, dailyCalorieGoal, proteinGoal, carbsGoal, fatGoal, defaultServings])
  );

  // Handle back from ScreenHeader
  const handleBack = async () => {
    await handleSave();
    router.back();
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  // FAB options for calculating goals
  const fabOptions: ActionOption[] = canCalculate ? [
    {
      id: 'calculate',
      label: t('profile.calculateGoals'),
      icon: 'calculator',
      color: 'primary',
      onPress: handleCalculateGoals,
    },
  ] : [];

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
        <ScreenHeader title={t('profile.nutritionGoals')} onBack={handleBack} />

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

        {/* Spacer for floating button */}
        <View className="h-24" />
        </ScrollView>
      </View>

      {/* Floating Calculate Button */}
      {canCalculate && (
        <View className="absolute bottom-6 right-6">
          <MultiActionButton
            icon="calculator"
            options={fabOptions}
            variant="floating"
            floatingColor="primary-500"
            loading={saving}
          />
        </View>
      )}

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
          alertType === 'calculated'
            ? t('profile.calculatedGoals')
            : t('profile.updateError')
        }
        variant={alertType === 'error' ? 'danger' : 'info'}
        confirmLabel={t('common.ok')}
      />
      </SafeAreaView>
    </View>
  );
}
