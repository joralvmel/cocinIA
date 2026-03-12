import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FullScreenModal, StepperProgress, Button } from '@/components/ui';
import { useWeeklyPlanStore } from '@/stores';

import { Step1DaysAndMeals } from './Step1DaysAndMeals';
import { Step2CookingPreferences } from './Step2CookingPreferences';
import { Step3FoodPreferences } from './Step3FoodPreferences';
import { Step4NutritionAndNotes } from './Step4NutritionAndNotes';
import { Step5Summary } from './Step5Summary';

interface WizardModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

const STEP_COMPONENTS = [
  Step1DaysAndMeals,
  Step2CookingPreferences,
  Step3FoodPreferences,
  Step4NutritionAndNotes,
  Step5Summary,
];

export function WizardModal({
  visible,
  onClose,
  onGenerate,
  isGenerating = false,
}: WizardModalProps) {
  const { t } = useTranslation();
  const {
    wizardStep,
    totalSteps,
    selectedDays,
    nextStep,
    prevStep,
  } = useWeeklyPlanStore();

  const stepLabels = [
    t('weeklyPlan.wizard.steps.days'),
    t('weeklyPlan.wizard.steps.cooking'),
    t('weeklyPlan.wizard.steps.food'),
    t('weeklyPlan.wizard.steps.nutrition'),
    t('weeklyPlan.wizard.steps.summary'),
  ];

  const stepTitles = [
    t('weeklyPlan.wizard.step1Title'),
    t('weeklyPlan.wizard.step2Title'),
    t('weeklyPlan.wizard.step3Title'),
    t('weeklyPlan.wizard.step4Title'),
    t('weeklyPlan.wizard.step5Title'),
  ];

  const stepSubtitles = [
    t('weeklyPlan.wizard.step1Subtitle'),
    t('weeklyPlan.wizard.step2Subtitle'),
    t('weeklyPlan.wizard.step3Subtitle'),
    t('weeklyPlan.wizard.step4Subtitle'),
    t('weeklyPlan.wizard.step5Subtitle'),
  ];

  // Validation per step
  const isStepValid = (): boolean => {
    switch (wizardStep) {
      case 0:
        return selectedDays.length > 0;
      default:
        return true;
    }
  };

  const isLastStep = wizardStep === totalSteps - 1;
  const StepComponent = STEP_COMPONENTS[wizardStep];

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={t('weeklyPlan.wizard.title')}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Stepper Progress */}
        <View className="px-4 pt-2 pb-3">
          <StepperProgress
            steps={stepLabels}
            currentStep={wizardStep}
          />
        </View>

        {/* Step header */}
        <View className="px-4 pb-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {stepTitles[wizardStep]}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stepSubtitles[wizardStep]}
          </Text>
        </View>

        {/* Step content */}
        <View className="flex-1">
          <StepComponent />
        </View>

        {/* Navigation buttons */}
        <View className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row gap-3">
            {wizardStep > 0 && (
              <Button
                variant="outline"
                onPress={prevStep}
                className="flex-1"
              >
                {t('common.back')}
              </Button>
            )}

            {!isLastStep ? (
              <Button
                variant="primary"
                onPress={nextStep}
                disabled={!isStepValid()}
                className="flex-1"
              >
                {t('common.next')}
              </Button>
            ) : (
              <Button
                variant="primary"
                onPress={onGenerate}
                loading={isGenerating}
                disabled={isGenerating || !isStepValid()}
                className="flex-1"
                icon="magic"
              >
                {isGenerating
                  ? t('weeklyPlan.wizard.generatingPlan')
                  : t('weeklyPlan.wizard.generatePlan')}
              </Button>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </FullScreenModal>
  );
}



