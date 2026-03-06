import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, Loader, AlertModal } from '@/components/ui';
import { PlanHistoryCard } from '@/components/weeklyPlan';
import { usePlanHistory } from '@/hooks';
import { type WeeklyPlan } from '@/types';

export default function PlanHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    plans,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleDeletePlan,
    handleRepeatPlan,
    // Confirmation modals
    showDeleteConfirm,
    showRepeatConfirm,
    setShowDeleteConfirm,
    setShowRepeatConfirm,
    confirmDeletePlan,
    confirmRepeatPlan,
  } = usePlanHistory();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loader size="lg" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <FlatList<WeeklyPlan>
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <PlanHistoryCard
            plan={item}
            onPress={() => {
              // TODO: navigate to plan detail view
            }}
            onRepeat={() => handleRepeatPlan(item.id, () => router.back())}
            onDelete={() => handleDeletePlan(item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 py-16">
            <EmptyState
              icon="history"
              title={t('weeklyPlan.history.emptyTitle')}
              description={t('weeklyPlan.history.emptyDescription')}
            />
          </View>
        }
      />

      {/* Delete plan confirmation */}
      <AlertModal
        visible={showDeleteConfirm}
        title={t('weeklyPlan.history.deletePlan')}
        message={t('weeklyPlan.active.deletePlanConfirm')}
        variant="danger"
        icon="trash"
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDeletePlan}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Repeat plan confirmation */}
      <AlertModal
        visible={showRepeatConfirm}
        title={t('weeklyPlan.history.repeatPlan')}
        message={t('weeklyPlan.history.repeatPlanConfirm')}
        variant="info"
        icon="refresh"
        confirmLabel={t('common.ok')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmRepeatPlan}
        onClose={() => setShowRepeatConfirm(false)}
      />
    </View>
  );
}
