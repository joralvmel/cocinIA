/**
 * Simple event system for recipe changes.
 * Used to notify the recipes list when data needs to be refreshed.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export const recipeEvents = {
  /** Subscribe to recipe change events */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Emit a recipe change event (saved, edited, deleted) */
  emit() {
    listeners.forEach((listener) => listener());
  },
};

