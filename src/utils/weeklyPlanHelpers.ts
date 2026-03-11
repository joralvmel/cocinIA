import { type TFunction } from 'i18next';
import {
  type DayOfWeek,
  type PlanMealType,
  type WeeklyPlanMealWithRecipe,
  DAYS_OF_WEEK,
} from '@/types';

/**
 * Canonical meal type ordering: breakfast → lunch → dinner → snack
 */
export const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  snack: 3,
};

/**
 * Sort meal types in canonical order
 */
export function sortMealTypes<T extends string>(types: T[]): T[] {
  return [...types].sort((a, b) => (MEAL_TYPE_ORDER[a] ?? 99) - (MEAL_TYPE_ORDER[b] ?? 99));
}

/**
 * Get translated day name
 */
export function getDayLabel(day: DayOfWeek, t: TFunction): string {
  return t(`weeklyPlan.days.${day}` as any) as string;
}

/**
 * Get short translated day name (1–3 chars)
 */
export function getDayShortLabel(day: DayOfWeek, t: TFunction): string {
  return t(`weeklyPlan.daysShort.${day}` as any) as string;
}

/**
 * Get translated meal type name
 */
export function getMealTypeLabel(type: PlanMealType, t: TFunction): string {
  return t(`weeklyPlan.mealTypes.${type}` as any) as string;
}

/**
 * Get meal type icon
 */
export function getMealTypeIcon(type: PlanMealType): string {
  const icons: Record<PlanMealType, string> = {
    breakfast: 'coffee',
    lunch: 'sun-o',
    dinner: 'moon-o',
    snack: 'apple',
  };
  return icons[type] || 'cutlery';
}

/**
 * Get day of week index (0 = Monday, 6 = Sunday)
 */
export function getDayIndex(day: DayOfWeek): number {
  return DAYS_OF_WEEK.indexOf(day);
}

/**
 * Group meals by day of week, sorted by sort_order within each day
 */
export function groupMealsByDay(
  meals: WeeklyPlanMealWithRecipe[]
): Record<DayOfWeek, WeeklyPlanMealWithRecipe[]> {
  const grouped: Record<string, WeeklyPlanMealWithRecipe[]> = {};

  for (const day of DAYS_OF_WEEK) {
    grouped[day] = [];
  }

  for (const meal of meals) {
    if (grouped[meal.day_of_week]) {
      grouped[meal.day_of_week].push(meal);
    }
  }

  // Sort each day's meals by sort_order
  for (const day of DAYS_OF_WEEK) {
    grouped[day].sort((a, b) => a.sort_order - b.sort_order);
  }

  return grouped as Record<DayOfWeek, WeeklyPlanMealWithRecipe[]>;
}

/**
 * Calculate total calories for a set of meals
 */
export function calculatePlanCalories(meals: WeeklyPlanMealWithRecipe[]): number {
  return meals.reduce((sum, meal) => {
    if (meal.is_external) return sum;
    const calories = meal.estimated_calories
      || meal.recipe?.nutrition?.calories
      || 0;
    return sum + calories;
  }, 0);
}

/**
 * Calculate daily calories for a specific day
 */
export function calculateDayCalories(
  meals: WeeklyPlanMealWithRecipe[],
  day: DayOfWeek
): number {
  return calculatePlanCalories(meals.filter((m) => m.day_of_week === day));
}

/**
 * Get week date range from a start date (Monday to Sunday)
 */
export function getWeekDateRange(startDate: string): { start: Date; end: Date } {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} - ${end.toLocaleDateString(undefined, opts)}`;
}

/**
 * Get the next Monday from today
 */
export function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Get the current day of week as DayOfWeek
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sun 1=Mon ... 6=Sat
  const mapping: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return mapping[jsDay];
}

/**
 * Get sort order for meal types
 */
export function getMealTypeSortOrder(type: PlanMealType): number {
  return MEAL_TYPE_ORDER[type] ?? 99;
}

/**
 * Count total meals in a plan (excluding eating out)
 */
export function countPlanMeals(meals: WeeklyPlanMealWithRecipe[]): {
  total: number;
  homeMeals: number;
  externalMeals: number;
} {
  const total = meals.length;
  const externalMeals = meals.filter((m) => m.is_external).length;
  return { total, homeMeals: total - externalMeals, externalMeals };
}

/**
 * Check if a date falls within the plan's date range
 */
export function isDateInPlan(date: Date, startDate: string, endDate: string): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

/**
 * Get default day configs: all days enabled with lunch and dinner
 */
export function getDefaultDayConfigs(): Record<DayOfWeek, { meals: PlanMealType[]; cookingTimeMinutes: number }> {
  const configs: Record<string, { meals: PlanMealType[]; cookingTimeMinutes: number }> = {};
  for (const day of DAYS_OF_WEEK) {
    configs[day] = {
      meals: ['breakfast', 'lunch', 'dinner'],
      cookingTimeMinutes: 60,
    };
  }
  return configs as Record<DayOfWeek, { meals: PlanMealType[]; cookingTimeMinutes: number }>;
}

