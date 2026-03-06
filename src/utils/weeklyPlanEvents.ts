/**
 * Simple event system for weekly plan changes.
 * Used to notify the plan views when data needs to be refreshed.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export const weeklyPlanEvents = {
  /** Subscribe to plan change events */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Emit a plan change event (created, updated, deleted) */
  emit() {
    listeners.forEach((listener) => listener());
  },
};

