import { useState, useEffect, useCallback } from 'react';
import { weeklyPlanService } from '@/services';
import { weeklyPlanEvents } from '@/utils';
import { type WeeklyPlan } from '@/types';

/**
 * Hook for the plan history screen
 */
export function usePlanHistory() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRepeatConfirm, setShowRepeatConfirm] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<string | null>(null);
  const [repeatCallback, setRepeatCallback] = useState<(() => void) | null>(null);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await weeklyPlanService.getPlanHistory();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plan history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = weeklyPlanEvents.subscribe(() => {
      fetchHistory(true);
    });
    return unsubscribe;
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory(true);
  }, []);

  const handleDeletePlan = useCallback((id: string) => {
    setTargetPlanId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeletePlan = useCallback(async () => {
    if (!targetPlanId) return;
    setShowDeleteConfirm(false);
    try {
      await weeklyPlanService.deletePlan(targetPlanId);
      setPlans((prev) => prev.filter((p) => p.id !== targetPlanId));
      weeklyPlanEvents.emit();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
    setTargetPlanId(null);
  }, [targetPlanId]);

  const handleRepeatPlan = useCallback(
    (id: string, onSuccess?: () => void) => {
      setTargetPlanId(id);
      setRepeatCallback(() => onSuccess || null);
      setShowRepeatConfirm(true);
    },
    []
  );

  const confirmRepeatPlan = useCallback(async () => {
    if (!targetPlanId) return;
    setShowRepeatConfirm(false);
    try {
      const nextMonday = new Date();
      const day = nextMonday.getDay();
      const daysUntilMonday = day === 0 ? 1 : 8 - day;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      const startDate = nextMonday.toISOString().split('T')[0];

      await weeklyPlanService.deactivateAllPlans();
      const cloned = await weeklyPlanService.clonePlan(targetPlanId, startDate);
      await weeklyPlanService.activatePlan(cloned.id);
      weeklyPlanEvents.emit();
      repeatCallback?.();
    } catch (error) {
      console.error('Error repeating plan:', error);
    }
    setTargetPlanId(null);
    setRepeatCallback(null);
  }, [targetPlanId, repeatCallback]);

  return {
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
  };
}
