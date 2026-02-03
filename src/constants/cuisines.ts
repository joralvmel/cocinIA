/**
 * World cuisines for preference selection
 */
export interface Cuisine {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: string;
}

export const cuisines: Cuisine[] = [
  // Americas
  { id: 'mexican', labelKey: 'cuisines.mexican', defaultLabel: 'Mexican', icon: '🌮' },
  { id: 'american', labelKey: 'cuisines.american', defaultLabel: 'American', icon: '🍔' },
  { id: 'brazilian', labelKey: 'cuisines.brazilian', defaultLabel: 'Brazilian', icon: '🇧🇷' },
  { id: 'peruvian', labelKey: 'cuisines.peruvian', defaultLabel: 'Peruvian', icon: '🇵🇪' },
  { id: 'argentinian', labelKey: 'cuisines.argentinian', defaultLabel: 'Argentinian', icon: '🥩' },
  { id: 'colombian', labelKey: 'cuisines.colombian', defaultLabel: 'Colombian', icon: '🇨🇴' },
  { id: 'caribbean', labelKey: 'cuisines.caribbean', defaultLabel: 'Caribbean', icon: '🏝️' },

  // European
  { id: 'italian', labelKey: 'cuisines.italian', defaultLabel: 'Italian', icon: '🍝' },
  { id: 'french', labelKey: 'cuisines.french', defaultLabel: 'French', icon: '🥐' },
  { id: 'spanish', labelKey: 'cuisines.spanish', defaultLabel: 'Spanish', icon: '🥘' },
  { id: 'greek', labelKey: 'cuisines.greek', defaultLabel: 'Greek', icon: '🇬🇷' },
  { id: 'german', labelKey: 'cuisines.german', defaultLabel: 'German', icon: '🥨' },
  { id: 'british', labelKey: 'cuisines.british', defaultLabel: 'British', icon: '🇬🇧' },
  { id: 'portuguese', labelKey: 'cuisines.portuguese', defaultLabel: 'Portuguese', icon: '🇵🇹' },
  { id: 'mediterranean', labelKey: 'cuisines.mediterranean', defaultLabel: 'Mediterranean', icon: '🫒' },

  // Asian
  { id: 'chinese', labelKey: 'cuisines.chinese', defaultLabel: 'Chinese', icon: '🥡' },
  { id: 'japanese', labelKey: 'cuisines.japanese', defaultLabel: 'Japanese', icon: '🍱' },
  { id: 'korean', labelKey: 'cuisines.korean', defaultLabel: 'Korean', icon: '🍜' },
  { id: 'thai', labelKey: 'cuisines.thai', defaultLabel: 'Thai', icon: '🍛' },
  { id: 'vietnamese', labelKey: 'cuisines.vietnamese', defaultLabel: 'Vietnamese', icon: '🍲' },
  { id: 'indian', labelKey: 'cuisines.indian', defaultLabel: 'Indian', icon: '🍛' },
  { id: 'indonesian', labelKey: 'cuisines.indonesian', defaultLabel: 'Indonesian', icon: '🇮🇩' },
  { id: 'malaysian', labelKey: 'cuisines.malaysian', defaultLabel: 'Malaysian', icon: '🇲🇾' },
  { id: 'filipino', labelKey: 'cuisines.filipino', defaultLabel: 'Filipino', icon: '🇵🇭' },

  // Middle East & Africa
  { id: 'middle_eastern', labelKey: 'cuisines.middleEastern', defaultLabel: 'Middle Eastern', icon: '🧆' },
  { id: 'turkish', labelKey: 'cuisines.turkish', defaultLabel: 'Turkish', icon: '🇹🇷' },
  { id: 'lebanese', labelKey: 'cuisines.lebanese', defaultLabel: 'Lebanese', icon: '🇱🇧' },
  { id: 'moroccan', labelKey: 'cuisines.moroccan', defaultLabel: 'Moroccan', icon: '🇲🇦' },
  { id: 'ethiopian', labelKey: 'cuisines.ethiopian', defaultLabel: 'Ethiopian', icon: '🇪🇹' },
  { id: 'african', labelKey: 'cuisines.african', defaultLabel: 'African', icon: '🌍' },
];

export const getCuisineById = (id: string): Cuisine | undefined => {
  return cuisines.find((c) => c.id === id);
};
