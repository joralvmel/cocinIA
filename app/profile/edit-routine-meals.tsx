import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Section,
  Loader,
  AlertModal,
  ScreenHeader,
  TagInput,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEditRoutineMealsForm } from '@/hooks';

const MEAL_TYPE_CONFIG: Record<string, { icon: string; emoji: string }> = {
  breakfast: { icon: 'sun-o', emoji: '🍳' },
  lunch: { icon: 'cutlery', emoji: '🍲' },
  dinner: { icon: 'moon-o', emoji: '🌙' },
  snack: { icon: 'apple', emoji: '🍎' },
};

export default function EditRoutineMealsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const form = useEditRoutineMealsForm();

  if (form.loading || form.saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScreenHeader title={t('profile.routineMeals')} onBack={form.handleBack} />

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="px-4 py-6 pb-24"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
            {/* Explanation */}
            <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <FontAwesome name="info-circle" size={16} color={colors.primary} />
                <Text className="font-semibold text-primary-700 dark:text-primary-300">
                  {t('profile.routineMealsTitle')}
                </Text>
              </View>
              <Text className="text-sm text-primary-600 dark:text-primary-400 leading-5">
                {t('profile.routineMealsDescription')}
              </Text>
            </View>

            {/* Meal type sections */}
            {form.meals.map((meal) => {
              const config = MEAL_TYPE_CONFIG[meal.meal_type] || { icon: 'cutlery', emoji: '🍽️' };
              return (
                <Section key={meal.meal_type} className="mb-5">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-lg">{config.emoji}</Text>
                    <Text className="font-semibold text-gray-900 dark:text-gray-50">
                      {t(`profile.routineMealType.${meal.meal_type}` as any)}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                      ({meal.items.length})
                    </Text>
                  </View>
                  <TagInput
                    items={meal.items}
                    inputText={form.inputTexts[meal.meal_type] || ''}
                    onChangeText={(text) => form.setInputText(meal.meal_type, text)}
                    onAdd={() => form.addItem(meal.meal_type)}
                    onRemove={(item) => form.removeItem(meal.meal_type, item)}
                    placeholder={t(`profile.routineMealPlaceholder.${meal.meal_type}` as any)}
                    chipSize="sm"
                  />
                </Section>
              );
            })}
          </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={form.alertVisible}
        onClose={() => form.setAlertVisible(false)}
        title={t('common.error')}
        message={t('profile.saveError')}
        variant="danger"
        confirmLabel={t('common.ok')}
        onConfirm={() => form.setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}


