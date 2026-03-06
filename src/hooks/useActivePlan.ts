import { useEffect, useState, useCallback } from 'react';
import { useWeeklyPlanStore } from '@/stores';
import { weeklyPlanService } from '@/services';
import { weeklyPlanEvents } from '@/utils';
import { getCurrentDayOfWeek } from '@/utils';
import { type DayOfWeek } from '@/types';

/**
 * Hook for the active plan view on the weekly-plan tab
 */
export function useActivePlan() {
  const {
    activePlan,
    activePlanLoaded,
    setActivePlan,
    setActivePlanLoaded,
    showWizard,
    showResult,
    setShowWizard,
    clearActivePlan,
  } = useWeeklyPlanStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

  // Confirmation modal states
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  // Fetch active plan
  const fetchActivePlan = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const plan = await weeklyPlanService.getActivePlan();
      setActivePlan(plan);
      setActivePlanLoaded(true);
    } catch (error) {
      console.error('Error fetching active plan:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load on mount — always fetch for freshness
  useEffect(() => {
    fetchActivePlan(!activePlanLoaded);
  }, []);

  // Subscribe to plan events (repeat, complete, delete, save)
  useEffect(() => {
    const unsubscribe = weeklyPlanEvents.subscribe(() => {
      fetchActivePlan(true);
    });
    return unsubscribe;
  }, []);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchActivePlan(true);
  }, []);

  // Start creating a new plan
  const handleCreatePlan = useCallback(() => {
    if (activePlan) {
      setShowReplaceConfirm(true);
    } else {
      setShowWizard(true);
    }
  }, [activePlan]);

  const confirmCreatePlan = useCallback(() => {
    setShowReplaceConfirm(false);
    setShowWizard(true);
  }, []);

  // Complete plan
  const handleCompletePlan = useCallback(() => {
    if (!activePlan) return;
    setShowCompleteConfirm(true);
  }, [activePlan]);

  const confirmCompletePlan = useCallback(async () => {
    if (!activePlan) return;
    setShowCompleteConfirm(false);
    try {
      await weeklyPlanService.completePlan(activePlan.id);
      clearActivePlan();
      weeklyPlanEvents.emit();
    } catch (error) {
      console.error('Error completing plan:', error);
    }
  }, [activePlan]);

  // Delete plan
  const handleDeletePlan = useCallback(() => {
    if (!activePlan) return;
    setShowDeleteConfirm(true);
  }, [activePlan]);

  const confirmDeletePlan = useCallback(async () => {
    if (!activePlan) return;
    setShowDeleteConfirm(false);
    try {
      await weeklyPlanService.deletePlan(activePlan.id);
      clearActivePlan();
      weeklyPlanEvents.emit();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  }, [activePlan]);

  // Current day progress
  const currentDay = getCurrentDayOfWeek();
  const planDays = activePlan?.days_included || [];
  const currentDayIndex = planDays.indexOf(currentDay);
  const progress = planDays.length > 0
    ? Math.max(0, currentDayIndex + 1) / planDays.length
    : 0;

  return {
    // State
    activePlan,
    activePlanLoaded,
    isLoading,
    isRefreshing,
    selectedDay,
    showWizard,
    showResult,
    currentDay,
    progress,

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

    // Actions
    setSelectedDay,
    handleCreatePlan,
    handleCompletePlan,
    handleDeletePlan,
    handleRefresh,
    fetchActivePlan,
  };
}


