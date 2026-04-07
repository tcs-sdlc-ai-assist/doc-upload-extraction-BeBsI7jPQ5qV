import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import type { Session } from '../types';

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useSession(): {
  isSessionValid: boolean;
  isLoading: boolean;
  validateSession: () => boolean;
  refreshSession: () => void;
} {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<Session | null>(null);

  const checkSessionExpiry = useCallback((session: Session): boolean => {
    const now = Date.now();
    const elapsed = now - session.timestamp;
    return elapsed < SESSION_TIMEOUT_MS;
  }, []);

  const validateSession = useCallback((): boolean => {
    if (!sessionData) {
      return false;
    }
    const valid = checkSessionExpiry(sessionData);
    if (!valid) {
      logout();
      setIsSessionValid(false);
      return false;
    }
    setIsSessionValid(true);
    return true;
  }, [sessionData, checkSessionExpiry, logout]);

  const refreshSession = useCallback((): void => {
    if (!sessionData) {
      return;
    }
    const refreshedSession: Session = {
      ...sessionData,
      timestamp: Date.now(),
    };
    setSessionData(refreshedSession);
    setIsSessionValid(true);
  }, [sessionData]);

  useEffect(() => {
    let mounted = true;

    async function loadSession(): Promise<void> {
      try {
        const session = await getStorageItem<Session>(STORAGE_KEYS.SESSION);
        if (!mounted) return;

        if (session) {
          setSessionData(session);
          const valid = checkSessionExpiry(session);
          if (valid) {
            setIsSessionValid(true);
          } else {
            setIsSessionValid(false);
            logout();
          }
        } else {
          setIsSessionValid(false);
        }
      } catch {
        if (mounted) {
          setIsSessionValid(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadSession();
    }

    return () => {
      mounted = false;
    };
  }, [authLoading, checkSessionExpiry, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSessionValid(false);
      setSessionData(null);
      return;
    }

    const intervalId = setInterval(() => {
      if (sessionData) {
        const valid = checkSessionExpiry(sessionData);
        if (!valid) {
          setIsSessionValid(false);
          logout();
        }
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, sessionData, checkSessionExpiry, logout]);

  return {
    isSessionValid: isSessionValid && isAuthenticated,
    isLoading: isLoading || authLoading,
    validateSession,
    refreshSession,
  };
}