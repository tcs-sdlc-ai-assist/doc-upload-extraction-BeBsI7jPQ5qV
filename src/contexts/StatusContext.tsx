import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { StatusMessage, StatusMessageType } from '../types';

interface StatusContextValue {
  statusMessage: StatusMessage | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  clearStatus: () => void;
}

const AUTO_DISMISS_MS = 5000;

export const StatusContext = createContext<StatusContextValue | undefined>(undefined);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function StatusContextProvider({ children }: { children: React.ReactNode }) {
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStatus = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatusMessage(null);
  }, []);

  const showMessage = useCallback(
    (type: StatusMessageType, message: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const newMessage: StatusMessage = {
        id: generateId(),
        type,
        message,
        timestamp: Date.now(),
      };

      setStatusMessage(newMessage);

      timerRef.current = setTimeout(() => {
        setStatusMessage((current) => {
          if (current && current.id === newMessage.id) {
            return null;
          }
          return current;
        });
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => {
      showMessage('success', message);
    },
    [showMessage]
  );

  const showError = useCallback(
    (message: string) => {
      showMessage('error', message);
    },
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string) => {
      showMessage('info', message);
    },
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string) => {
      showMessage('warning', message);
    },
    [showMessage]
  );

  const value: StatusContextValue = {
    statusMessage,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearStatus,
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatusContext(): StatusContextValue {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatusContext must be used within a StatusContextProvider');
  }
  return context;
}