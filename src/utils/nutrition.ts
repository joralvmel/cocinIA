/**
 * Nutrition calculation utilities
 * Uses Mifflin-St Jeor equation for BMR calculation
 */

export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'eat_healthy';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female' | 'other';

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Activity multipliers for TDEE calculation
const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Goal adjustments for calories
const goalAdjustments: Record<FitnessGoal, number> = {
  lose_weight: -500,   // 500 calorie deficit for ~0.5kg/week loss
  maintain: 0,
  gain_muscle: 300,    // 300 calorie surplus for lean gains
  eat_healthy: 0,      // Same as maintain, focus on macro quality
};

// Macro ratios by goal (protein, carbs, fat as percentages)
const macroRatios: Record<FitnessGoal, { protein: number; carbs: number; fat: number }> = {
  lose_weight: { protein: 0.30, carbs: 0.35, fat: 0.35 },
  maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
  gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  eat_healthy: { protein: 0.25, carbs: 0.50, fat: 0.25 },
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * BMR = Basal Metabolic Rate (calories burned at rest)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender
): number {
  // Mifflin-St Jeor equation
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);

  if (gender === 'male') {
    return Math.round(baseBMR + 5);
  } else if (gender === 'female') {
    return Math.round(baseBMR - 161);
  } else {
    // For 'other', use average of male and female
    return Math.round(baseBMR - 78);
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate complete nutrition goals based on user profile
 */
export function calculateNutritionGoals(
  weightKg: number,
  heightCm: number,
  birthDate: string | null,
  gender: Gender | null,
  activityLevel: ActivityLevel | null,
  goal: FitnessGoal = 'maintain'
): NutritionGoals | null {
  // Need minimum data to calculate
  if (!birthDate || !gender || !activityLevel) {
    return null;
  }

  const age = calculateAge(birthDate);
  if (age < 15 || age > 100) {
    return null; // Invalid age range
  }

  // Calculate BMR and TDEE
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Apply goal adjustment
  const targetCalories = Math.max(1200, tdee + goalAdjustments[goal]);

  // Calculate macros based on goal ratios
  const ratios = macroRatios[goal];
  const protein = Math.round((targetCalories * ratios.protein) / 4); // 4 cal per gram protein
  const carbs = Math.round((targetCalories * ratios.carbs) / 4);     // 4 cal per gram carbs
  const fat = Math.round((targetCalories * ratios.fat) / 9);         // 9 cal per gram fat

  return {
    calories: targetCalories,
    protein,
    carbs,
    fat,
  };
}

/**
 * Unit conversion utilities
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return Math.round(totalInches * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.205);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.205);
}
