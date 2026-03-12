import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Loader, AlertModal, MultiActionButton } from '@/components/ui';
import { WizardModal, PlanResultModal, ActivePlanView } from '@/components/weeklyPlan';
import { useActivePlan, useGenerateWeeklyPlan, useAppTheme } from '@/hooks';
import { useWeeklyPlanStore } from '@/stores';

export default function WeeklyPlanScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  const navigateTo = useCallback((path: string) => {
    router.push(path as any);
  }, [router]);

  // Active plan state
  const {
    activePlan,
    activePlanLoaded,
    isLoading,
    isRefreshing,
    selectedDay,
    showWizard,
    showResult,
    progress,
    setSelectedDay,
    handleCreatePlan,
    handleCompletePlan,
    handleDeletePlan,
    handleRefresh,
    // Confirmation modals
    showCompleteConfirm,
    showDeleteConfirm,
    showReplaceConfirm,
    setShowCompleteConfirm,
    setShowDeleteConfirm,
    setShowReplaceConfirm,
    confirmCompletePlan,
    confirmDeletePlan,
    confirmCreatePlan,
  } = useActivePlan();

  // Generation state
  const {
    generatedPlan,
    isGenerating,
    isSaving,
    showSaveSuccess,
    showRetryError,
    handleGenerate,
    handleRegeneratePlan,
    handleRegenerateMeal,
    handleSavePlan,
    handleSaveSuccessConfirm,
    handleDiscard,
    handleDismissRetryError,
    handleSwapMeal,
    regeneratingMeal,
    modifyingMeal,
    handleModifyMeal,
    regeneratingPrepIndex,
    modifyingPrepIndex,
    handleRegeneratePrep,
    handleModifyPrep,
    handleSwapPrep,
  } = useGenerateWeeklyPlan();

  const { generationProgress, setShowWizard, setShowResult, wizardStep, resetWizard } = useWeeklyPlanStore();

  // Whether we have a minimized (not yet saved) plan that can be reopened
  const hasMinimizedPlan = !!generatedPlan && !showResult && !isSaving && !isGenerating;

  // Whether generation is in progress but modal was closed
  const isGeneratingMinimized = isGenerating && !showResult;

  // Whether the wizard is in progress (user started but minimized it)
  const hasWizardInProgress = wizardStep > 0 && !showWizard && !isGenerating && !generatedPlan;

  // Loading state
  if (!activePlanLoaded || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Active plan view */}
      {activePlan && !isGenerating ? (
        <ActivePlanView
          plan={activePlan}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onCompletePlan={handleCompletePlan}
          onDeletePlan={handleDeletePlan}
          onViewHistory={() => navigateTo('/(app)/weekly-plan/history')}
          progress={progress}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        /* Empty state */
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/20 items-center justify-center mb-5">
            <FontAwesome name="calendar" size={32} color={colors.primary} />
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-50 text-center mb-2">
            {t('weeklyPlan.emptyTitle')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center leading-5 max-w-[280px]">
            {t('weeklyPlan.emptyDescription')}
          </Text>
        </View>
      )}

      {/* Floating Action Button — context-aware options */}
      <View className="absolute bottom-6 right-6">
        {isGeneratingMinimized ? (
          /* Generation in progress but modal closed — single tap to reopen */
          <MultiActionButton
            icon="hourglass-half"
            variant="floating"
            floatingColor="amber-500"
            options={[
              {
                id: 'reopen',
                label: t('weeklyPlan.fab.reopenPlan'),
                icon: 'file-text-o',
                color: '#3B82F6',
                onPress: () => setShowResult(true),
              },
            ]}
          />
        ) : hasMinimizedPlan ? (
          /* Minimized plan — show FAB to reopen the result */
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="amber-500"
            options={[
              {
                id: 'reopen',
                label: t('weeklyPlan.fab.reopenPlan'),
                icon: 'file-text-o',
                color: '#3B82F6',
                onPress: () => setShowResult(true),
              },
              {
                id: 'create',
                label: t('weeklyPlan.fab.createNew'),
                icon: 'plus',
                color: '#22C55E',
                onPress: handleCreatePlan,
              },
              {
                id: 'discard',
                label: t('weeklyPlan.result.discardPlan'),
                icon: 'trash',
                color: '#EF4444',
                onPress: handleDiscard,
              },
            ]}
          />
        ) : hasWizardInProgress ? (
          /* Wizard in progress but minimized */
          <MultiActionButton
            icon="pencil-square-o"
            variant="floating"
            floatingColor="amber-500"
            options={[
              {
                id: 'continue',
                label: t('weeklyPlan.fab.continueWizard'),
                icon: 'pencil-square-o',
                color: '#F59E0B',
                onPress: () => setShowWizard(true),
              },
              {
                id: 'create',
                label: t('weeklyPlan.fab.createNew'),
                icon: 'plus',
                color: '#22C55E',
                onPress: handleCreatePlan,
              },
              {
                id: 'history',
                label: t('weeklyPlan.active.viewHistory'),
                icon: 'history',
                color: '#8B5CF6',
                onPress: () => navigateTo('/(app)/weekly-plan/history'),
              },
              {
                id: 'discard',
                label: t('weeklyPlan.fab.discardWizard'),
                icon: 'trash',
                color: '#EF4444',
                onPress: () => {
                  resetWizard();
                },
              },
            ]}
          />
        ) : activePlan ? (
          /* Active plan — show plan management options */
          <MultiActionButton
            icon="ellipsis-v"
            variant="floating"
            floatingColor="primary-600"
            options={[
              {
                id: 'create',
                label: t('weeklyPlan.fab.createNew'),
                icon: 'calendar-plus-o',
                color: '#3B82F6',
                onPress: handleCreatePlan,
              },
              {
                id: 'history',
                label: t('weeklyPlan.active.viewHistory'),
                icon: 'history',
                color: '#8B5CF6',
                onPress: () => navigateTo('/(app)/weekly-plan/history'),
              },
              {
                id: 'complete',
                label: t('weeklyPlan.active.completePlan'),
                icon: 'check-circle',
                color: '#22C55E',
                onPress: handleCompletePlan,
              },
              {
                id: 'delete',
                label: t('weeklyPlan.active.deletePlan'),
                icon: 'trash',
                color: '#EF4444',
                onPress: handleDeletePlan,
              },
            ]}
          />
        ) : (
          /* No plan — single create option */
          <MultiActionButton
            icon="calendar-plus-o"
            label={t('weeklyPlan.createNew')}
            variant="floating"
            floatingColor="primary-600"
            loading={isGenerating}
            disabled={isGenerating}
            options={[
              {
                id: 'create',
                label: t('weeklyPlan.createNew'),
                icon: 'calendar-plus-o',
                color: '#3B82F6',
                onPress: handleCreatePlan,
              },
              {
                id: 'history',
                label: t('weeklyPlan.active.viewHistory'),
                icon: 'history',
                color: '#8B5CF6',
                onPress: () => navigateTo('/(app)/weekly-plan/history'),
              },
            ]}
          />
        )}
      </View>

      {/* Wizard Modal */}
      <WizardModal
        visible={showWizard}
        onClose={() => setShowWizard(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Plan Result Modal */}
      <PlanResultModal
        visible={showResult}
        onClose={() => setShowResult(false)}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        onRegeneratePlan={handleRegeneratePlan}
        onRegenerateMeal={handleRegenerateMeal}
        onSavePlan={handleSavePlan}
        onDiscard={handleDiscard}
        onSwapMeal={handleSwapMeal}
        isSaving={isSaving}
        regeneratingMeal={regeneratingMeal}
        modifyingMeal={modifyingMeal}
        onModifyMeal={handleModifyMeal}
        regeneratingPrepIndex={regeneratingPrepIndex}
        modifyingPrepIndex={modifyingPrepIndex}
        onRegeneratePrep={handleRegeneratePrep}
        onModifyPrep={handleModifyPrep}
        onSwapPrep={handleSwapPrep}
      />

      {/* Save success modal */}
      <AlertModal
        visible={showSaveSuccess}
        title={t('weeklyPlan.result.savedTitle')}
        message={t('weeklyPlan.result.savedMessage')}
        variant="info"
        icon="check-circle"
        confirmLabel={t('common.ok')}
        onClose={handleSaveSuccessConfirm}
      />

      {/* Retry error modal */}
      <AlertModal
        visible={showRetryError}
        title={t('common.error')}
        message={t('weeklyPlan.result.generateError')}
        variant="danger"
        confirmLabel={t('common.retry')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          handleDismissRetryError();
          handleGenerate();
        }}
        onClose={handleDismissRetryError}
      />

      {/* Complete plan confirmation */}
      <AlertModal
        visible={showCompleteConfirm}
        title={t('weeklyPlan.active.completePlan')}
        message={t('weeklyPlan.active.completePlanConfirm')}
        variant="info"
        icon="check-circle"
        confirmLabel={t('common.ok')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmCompletePlan}
        onClose={() => setShowCompleteConfirm(false)}
      />

      {/* Delete plan confirmation */}
      <AlertModal
        visible={showDeleteConfirm}
        title={t('weeklyPlan.active.deletePlan')}
        message={t('weeklyPlan.active.deletePlanConfirm')}
        variant="danger"
        icon="trash"
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDeletePlan}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Replace active plan confirmation */}
      <AlertModal
        visible={showReplaceConfirm}
        title={t('weeklyPlan.wizard.title')}
        message={t('weeklyPlan.active.replaceActive')}
        variant="warning"
        icon="exclamation-triangle"
        confirmLabel={t('common.ok')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmCreatePlan}
        onClose={() => setShowReplaceConfirm(false)}
      />
    </View>
  );
}
