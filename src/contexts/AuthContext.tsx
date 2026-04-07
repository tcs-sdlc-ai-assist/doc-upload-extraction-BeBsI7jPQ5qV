import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '../types';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const session: Session | null = await authService.getSession();
        if (session && mounted) {
          setUser({ username: session.username, passwordHash: '' });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const result = await authService.login(username, password);

    if (!result.success) {
      throw new Error(result.error ?? 'Login failed.');
    }

    if (result.session) {
      setUser({ username: result.session.username, passwordHash: '' });
      setIsAuthenticated(true);
    }
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<void> => {
    const result = await authService.signup(username, password);

    if (!result.success) {
      throw new Error(result.error ?? 'Signup failed.');
    }

    if (result.session) {
      setUser({ username: result.session.username, passwordHash: '' });
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}