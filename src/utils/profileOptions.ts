import { countries, currencies } from '@/constants';

/**
 * Static select-option builders for profile edit screens.
 * Each accepts the i18n `t` function where labels need localisation.
 */

export function getGenderOptions(t: (key: string) => string) {
  return [
    { value: 'male', label: t('profile.genderMale'), icon: '👨' },
    { value: 'female', label: t('profile.genderFemale'), icon: '👩' },
    { value: 'other', label: t('profile.genderOther'), icon: '🧑' },
  ];
}

export function getActivityOptions(t: (key: string) => string) {
  return [
    { value: 'sedentary', label: t('profile.activitySedentary'), subtitle: t('profile.activitySedentaryDesc'), icon: '🪑' },
    { value: 'light', label: t('profile.activityLight'), subtitle: t('profile.activityLightDesc'), icon: '🚶' },
    { value: 'moderate', label: t('profile.activityModerate'), subtitle: t('profile.activityModerateDesc'), icon: '🏃' },
    { value: 'active', label: t('profile.activityActive'), subtitle: t('profile.activityActiveDesc'), icon: '🏋️' },
    { value: 'very_active', label: t('profile.activityVeryActive'), subtitle: t('profile.activityVeryActiveDesc'), icon: '🏆' },
  ];
}

export function getGoalOptions(t: (key: string) => string) {
  return [
    { value: 'lose_weight', label: t('profile.goalLoseWeight'), icon: '📉' },
    { value: 'maintain', label: t('profile.goalMaintain'), icon: '⚖️' },
    { value: 'gain_muscle', label: t('profile.goalGainMuscle'), icon: '💪' },
    { value: 'eat_healthy', label: t('profile.goalEatHealthy'), icon: '🥗' },
  ];
}

export function getMeasurementOptions(t: (key: string) => string) {
  return [
    { value: 'metric', label: t('profile.metric') },
    { value: 'imperial', label: t('profile.imperial') },
  ];
}

export function getCountryOptions() {
  return countries.map((c) => ({
    value: c.code,
    label: c.name,
    icon: c.flag,
  }));
}

export function getCurrencyOptions() {
  return currencies.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
    subtitle: c.symbol,
  }));
}

