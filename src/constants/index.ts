/**
 * App constants and configuration
 */

export const APP_NAME = 'CocinIA';

// Theme exports
export {
  lightNavigationTheme,
  darkNavigationTheme,
  lightPaperTheme,
  darkPaperTheme,
  brandColors,
  appColors,
  type PaperTheme,
  type NavigationTheme,
  type AppColors,
} from './theme';

// Countries and currencies
export { countries, getCountryByCode, type Country } from './countries';
export { currencies, getCurrencyByCode, type Currency } from './currencies';

// Dietary restrictions
export {
  allergies,
  preferences,
  allRestrictions,
  getRestrictionById,
  type DietaryRestriction,
} from './restrictions';

// Cuisines
export { cuisines, getCuisineById, type Cuisine } from './cuisines';

// Equipment
export { equipment, getEquipmentById, type Equipment } from './equipment';

