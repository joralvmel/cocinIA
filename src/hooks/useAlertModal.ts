import { useState, useCallback } from 'react';

export type AlertVariant = 'info' | 'warning' | 'danger';

export interface AlertModalState {
  visible: boolean;
  title: string;
  message: string;
  variant: AlertVariant;
}

const initialState: AlertModalState = {
  visible: false,
  title: '',
  message: '',
  variant: 'info',
};

/**
 * Reusable alert modal state management
 */
export function useAlertModal() {
  const [alert, setAlert] = useState<AlertModalState>(initialState);

  const showAlert = useCallback(
    (title: string, message: string, variant: AlertVariant = 'info') => {
      setAlert({ visible: true, title, message, variant });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    alert,
    showAlert,
    hideAlert,
  };
}

