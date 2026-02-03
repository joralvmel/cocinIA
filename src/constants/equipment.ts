/**
 * Kitchen equipment types
 */
export interface Equipment {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: string;
}

export const equipment: Equipment[] = [
  { id: 'oven', labelKey: 'equipment.oven', defaultLabel: 'Oven', icon: '🔥' },
  { id: 'microwave', labelKey: 'equipment.microwave', defaultLabel: 'Microwave', icon: '📡' },
  { id: 'airfryer', labelKey: 'equipment.airfryer', defaultLabel: 'Air Fryer', icon: '🌪️' },
  { id: 'blender', labelKey: 'equipment.blender', defaultLabel: 'Blender', icon: '🫗' },
  { id: 'food_processor', labelKey: 'equipment.foodProcessor', defaultLabel: 'Food Processor', icon: '⚙️' },
  { id: 'mixer', labelKey: 'equipment.mixer', defaultLabel: 'Stand Mixer', icon: '🥣' },
  { id: 'slow_cooker', labelKey: 'equipment.slowCooker', defaultLabel: 'Slow Cooker', icon: '🍲' },
  { id: 'pressure_cooker', labelKey: 'equipment.pressureCooker', defaultLabel: 'Pressure Cooker', icon: '♨️' },
  { id: 'instant_pot', labelKey: 'equipment.instantPot', defaultLabel: 'Instant Pot', icon: '🍳' },
  { id: 'grill', labelKey: 'equipment.grill', defaultLabel: 'Grill', icon: '🥩' },
  { id: 'toaster', labelKey: 'equipment.toaster', defaultLabel: 'Toaster', icon: '🍞' },
  { id: 'toaster_oven', labelKey: 'equipment.toasterOven', defaultLabel: 'Toaster Oven', icon: '🔲' },
  { id: 'rice_cooker', labelKey: 'equipment.riceCooker', defaultLabel: 'Rice Cooker', icon: '🍚' },
  { id: 'coffee_maker', labelKey: 'equipment.coffeeMaker', defaultLabel: 'Coffee Maker', icon: '☕' },
  { id: 'espresso_machine', labelKey: 'equipment.espressoMachine', defaultLabel: 'Espresso Machine', icon: '☕' },
  { id: 'kettle', labelKey: 'equipment.kettle', defaultLabel: 'Electric Kettle', icon: '🫖' },
  { id: 'sous_vide', labelKey: 'equipment.sousVide', defaultLabel: 'Sous Vide', icon: '🌡️' },
  { id: 'wok', labelKey: 'equipment.wok', defaultLabel: 'Wok', icon: '🥘' },
  { id: 'cast_iron', labelKey: 'equipment.castIron', defaultLabel: 'Cast Iron Pan', icon: '🍳' },
  { id: 'dutch_oven', labelKey: 'equipment.dutchOven', defaultLabel: 'Dutch Oven', icon: '🥘' },
  { id: 'induction', labelKey: 'equipment.induction', defaultLabel: 'Induction Cooktop', icon: '🔌' },
  { id: 'gas_stove', labelKey: 'equipment.gasStove', defaultLabel: 'Gas Stove', icon: '🔥' },
  { id: 'electric_stove', labelKey: 'equipment.electricStove', defaultLabel: 'Electric Stove', icon: '🔌' },
  { id: 'freezer', labelKey: 'equipment.freezer', defaultLabel: 'Freezer', icon: '❄️' },
  { id: 'ice_cream_maker', labelKey: 'equipment.iceCreamMaker', defaultLabel: 'Ice Cream Maker', icon: '🍨' },
  { id: 'bread_maker', labelKey: 'equipment.breadMaker', defaultLabel: 'Bread Maker', icon: '🍞' },
  { id: 'dehydrator', labelKey: 'equipment.dehydrator', defaultLabel: 'Dehydrator', icon: '🌞' },
  { id: 'juicer', labelKey: 'equipment.juicer', defaultLabel: 'Juicer', icon: '🧃' },
  { id: 'waffle_maker', labelKey: 'equipment.waffleMaker', defaultLabel: 'Waffle Maker', icon: '🧇' },
  { id: 'crepe_maker', labelKey: 'equipment.crepeMaker', defaultLabel: 'Crepe Maker', icon: '🥞' },
];

export const getEquipmentById = (id: string): Equipment | undefined => {
  return equipment.find((e) => e.id === id);
};
