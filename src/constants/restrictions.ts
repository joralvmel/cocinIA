/**
 * Dietary restrictions - allergies and preferences
 */
export interface DietaryRestriction {
  id: string;
  labelKey: string; // i18n key for translation
  defaultLabel: string; // fallback label
  isAllergy: boolean; // true = allergy, false = preference
  icon?: string;
}

// Common food allergies (Big 9 + others)
export const allergies: DietaryRestriction[] = [
  { id: 'milk', labelKey: 'restrictions.milk', defaultLabel: 'Milk/Dairy', isAllergy: true, icon: '🥛' },
  { id: 'eggs', labelKey: 'restrictions.eggs', defaultLabel: 'Eggs', isAllergy: true, icon: '🥚' },
  { id: 'peanuts', labelKey: 'restrictions.peanuts', defaultLabel: 'Peanuts', isAllergy: true, icon: '🥜' },
  { id: 'tree_nuts', labelKey: 'restrictions.treeNuts', defaultLabel: 'Tree Nuts', isAllergy: true, icon: '🌰' },
  { id: 'wheat', labelKey: 'restrictions.wheat', defaultLabel: 'Wheat', isAllergy: true, icon: '🌾' },
  { id: 'soy', labelKey: 'restrictions.soy', defaultLabel: 'Soy', isAllergy: true, icon: '🫘' },
  { id: 'fish', labelKey: 'restrictions.fish', defaultLabel: 'Fish', isAllergy: true, icon: '🐟' },
  { id: 'shellfish', labelKey: 'restrictions.shellfish', defaultLabel: 'Shellfish', isAllergy: true, icon: '🦐' },
  { id: 'sesame', labelKey: 'restrictions.sesame', defaultLabel: 'Sesame', isAllergy: true, icon: '🫘' },
  { id: 'celery', labelKey: 'restrictions.celery', defaultLabel: 'Celery', isAllergy: true, icon: '🥬' },
  { id: 'mustard', labelKey: 'restrictions.mustard', defaultLabel: 'Mustard', isAllergy: true, icon: '🟡' },
  { id: 'lupin', labelKey: 'restrictions.lupin', defaultLabel: 'Lupin', isAllergy: true, icon: '🌱' },
  { id: 'mollusks', labelKey: 'restrictions.mollusks', defaultLabel: 'Mollusks', isAllergy: true, icon: '🐚' },
  { id: 'sulfites', labelKey: 'restrictions.sulfites', defaultLabel: 'Sulfites', isAllergy: true, icon: '⚗️' },
];

// Dietary preferences (lifestyle/religious/ethical)
export const preferences: DietaryRestriction[] = [
  { id: 'vegetarian', labelKey: 'restrictions.vegetarian', defaultLabel: 'Vegetarian', isAllergy: false, icon: '🥗' },
  { id: 'vegan', labelKey: 'restrictions.vegan', defaultLabel: 'Vegan', isAllergy: false, icon: '🌱' },
  { id: 'pescatarian', labelKey: 'restrictions.pescatarian', defaultLabel: 'Pescatarian', isAllergy: false, icon: '🐟' },
  { id: 'gluten_free', labelKey: 'restrictions.glutenFree', defaultLabel: 'Gluten-Free', isAllergy: false, icon: '🌾' },
  { id: 'lactose_free', labelKey: 'restrictions.lactoseFree', defaultLabel: 'Lactose-Free', isAllergy: false, icon: '🥛' },
  { id: 'keto', labelKey: 'restrictions.keto', defaultLabel: 'Keto', isAllergy: false, icon: '🥑' },
  { id: 'paleo', labelKey: 'restrictions.paleo', defaultLabel: 'Paleo', isAllergy: false, icon: '🍖' },
  { id: 'low_carb', labelKey: 'restrictions.lowCarb', defaultLabel: 'Low Carb', isAllergy: false, icon: '📉' },
  { id: 'low_sodium', labelKey: 'restrictions.lowSodium', defaultLabel: 'Low Sodium', isAllergy: false, icon: '🧂' },
  { id: 'low_fat', labelKey: 'restrictions.lowFat', defaultLabel: 'Low Fat', isAllergy: false, icon: '💧' },
  { id: 'halal', labelKey: 'restrictions.halal', defaultLabel: 'Halal', isAllergy: false, icon: '☪️' },
  { id: 'kosher', labelKey: 'restrictions.kosher', defaultLabel: 'Kosher', isAllergy: false, icon: '✡️' },
  { id: 'no_alcohol', labelKey: 'restrictions.noAlcohol', defaultLabel: 'No Alcohol', isAllergy: false, icon: '🚫' },
  { id: 'no_pork', labelKey: 'restrictions.noPork', defaultLabel: 'No Pork', isAllergy: false, icon: '🐷' },
  { id: 'no_beef', labelKey: 'restrictions.noBeef', defaultLabel: 'No Beef', isAllergy: false, icon: '🐄' },
];

// All restrictions combined
export const allRestrictions: DietaryRestriction[] = [...allergies, ...preferences];

export const getRestrictionById = (id: string): DietaryRestriction | undefined => {
  return allRestrictions.find((r) => r.id === id);
};
