import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services';
import { calculateNutritionGoals, type FitnessGoal } from '@/utils';
import { useAutoSaveOnBack } from './useAutoSaveOnBack';

export function useEditNutritionForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'error' | 'calculated'>('error');

  // Nutrition form
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('maintain');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<number>(2000);
  const [proteinGoal, setProteinGoal] = useState<number>(50);
  const [carbsGoal, setCarbsGoal] = useState<number>(250);
  const [fatGoal, setFatGoal] = useState<number>(65);
  const [defaultServings, setDefaultServings] = useState<number>(4);

  // Profile data needed for calculations
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null>(null);

  const canCalculate = !!birthDate && !!gender && !!activityLevel;

  // ---- Load ----
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // ---- Save ----
  const handleSave = useCallback(async () => {
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
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [fitnessGoal, dailyCalorieGoal, proteinGoal, carbsGoal, fatGoal, defaultServings, saving]);

  // ---- Auto-save on back ----
  const { handleBack } = useAutoSaveOnBack(
    handleSave,
    [fitnessGoal, dailyCalorieGoal, proteinGoal, carbsGoal, fatGoal, defaultServings, saving],
  );

  // ---- Calculate nutrition goals ----
  const handleCalculateGoals = useCallback(() => {
    const goals = calculateNutritionGoals(
      weightKg, heightCm, birthDate, gender, activityLevel, fitnessGoal,
    );
    if (goals) {
      setDailyCalorieGoal(goals.calories);
      setProteinGoal(goals.protein);
      setCarbsGoal(goals.carbs);
      setFatGoal(goals.fat);
      setAlertType('calculated');
      setAlertVisible(true);
    }
  }, [weightKg, heightCm, birthDate, gender, activityLevel, fitnessGoal]);

  return {
    loading, saving,
    alertVisible, setAlertVisible,
    alertType,

    // Form
    fitnessGoal, setFitnessGoal,
    dailyCalorieGoal, setDailyCalorieGoal,
    proteinGoal, setProteinGoal,
    carbsGoal, setCarbsGoal,
    fatGoal, setFatGoal,
    defaultServings, setDefaultServings,

    // Calculate
    canCalculate,
    handleCalculateGoals,

    // Navigation
    handleBack,
  };
}

