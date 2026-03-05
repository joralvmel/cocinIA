import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEditNutritionForm } from '@/hooks';
import { getGoalOptions } from '@/utils';
import type { FitnessGoal } from '@/utils';

export default function EditNutritionScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const form = useEditNutritionForm();

  const [goalSheetVisible, setGoalSheetVisible] = useState(false);

  // Options
  const goalOptions = getGoalOptions(t as any);
  const selectedGoal = goalOptions.find((g) => g.value === form.fitnessGoal);

  // FAB
  const fabOptions: ActionOption[] = form.canCalculate
    ? [{ id: 'calculate', label: t('profile.calculateGoals'), icon: 'calculator', color: 'primary', onPress: form.handleCalculateGoals }]
    : [];

  if (form.loading || form.saving) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.card }}>
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.card }}>
        <ScreenHeader title={t('profile.nutritionGoals')} onBack={form.handleBack} />

        <View className="flex-1 bg-white dark:bg-gray-900">
          <ScrollView
            contentContainerClassName="px-4 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Goal Selection */}
            <Section title={`🎯 ${t('profile.fitnessGoal')}`} className="mb-6">
              <SelectTrigger
                value={form.fitnessGoal}
                displayValue={selectedGoal ? `${selectedGoal.icon} ${selectedGoal.label}` : ''}
                placeholder={t('profile.goalPlaceholder')}
                onPress={() => setGoalSheetVisible(true)}
                className="mt-2"
              />
              {!form.canCalculate && (
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {t('profile.completePersonalInfoToCalculate')}
                </Text>
              )}
            </Section>

            {/* Macros */}
            <Section title={`📊 ${t('profile.nutritionGoals')}`} className="mb-6">
              <View className="gap-4 mt-3">
                <NumberInput label={t('profile.dailyCalorieGoal')} value={form.dailyCalorieGoal} onChange={form.setDailyCalorieGoal} min={1000} max={5000} step={50} unit="kcal" />
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <NumberInput label={t('profile.proteinGoal')} value={form.proteinGoal} onChange={form.setProteinGoal} min={0} max={500} step={5} unit="g" />
                  </View>
                  <View className="flex-1">
                    <NumberInput label={t('profile.carbsGoal')} value={form.carbsGoal} onChange={form.setCarbsGoal} min={0} max={500} step={5} unit="g" />
                  </View>
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <NumberInput label={t('profile.fatGoal')} value={form.fatGoal} onChange={form.setFatGoal} min={0} max={300} step={5} unit="g" />
                  </View>
                  <View className="flex-1">
                    <NumberInput label={t('profile.defaultServings')} value={form.defaultServings} onChange={form.setDefaultServings} min={1} max={12} />
                  </View>
                </View>
              </View>
            </Section>

            <View className="h-24" />
          </ScrollView>
        </View>

        {/* Floating Calculate Button */}
        {form.canCalculate && (
          <View className="absolute bottom-6 right-6">
            <MultiActionButton icon="calculator" options={fabOptions} variant="floating" floatingColor="primary-500" loading={form.saving} />
          </View>
        )}

        {/* Goal Selector */}
        <SelectBottomSheet
          visible={goalSheetVisible}
          onClose={() => setGoalSheetVisible(false)}
          title={t('profile.fitnessGoal')}
          options={goalOptions}
          value={form.fitnessGoal}
          onChange={(v) => form.setFitnessGoal(v as FitnessGoal)}
        />

        {/* Alert */}
        <AlertModal
          visible={form.alertVisible}
          onClose={() => form.setAlertVisible(false)}
          title={form.alertType === 'error' ? t('common.error') : t('common.done')}
          message={form.alertType === 'calculated' ? t('profile.calculatedGoals') : t('profile.updateError')}
          variant={form.alertType === 'error' ? 'danger' : 'info'}
          confirmLabel={t('common.ok')}
        />
      </SafeAreaView>
    </View>
  );
}
