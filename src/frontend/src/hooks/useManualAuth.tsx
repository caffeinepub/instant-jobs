import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ManualAuthSession, LoginCredentials, UserRole } from '../auth/manualAuthTypes';

interface ManualAuthContextType {
  session: ManualAuthSession | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole;
  isLoading: boolean;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'instant_jobs_session';

// Hardcoded credentials for demo (in production, this would be backend-validated)
const VALID_CREDENTIALS = {
  admin: { email: 'admin@ppsjobs.com', password: '9277492395' },
};

export function ManualAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ManualAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load session from storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as ManualAuthSession;
        setSession(parsed);
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Validate admin credentials
    if (credentials.role === 'admin') {
      if (
        credentials.email === VALID_CREDENTIALS.admin.email &&
        credentials.password === VALID_CREDENTIALS.admin.password
      ) {
        const newSession: ManualAuthSession = {
          role: 'admin',
          email: credentials.email,
          timestamp: Date.now(),
        };
        setSession(newSession);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        return;
      } else {
        throw new Error('Invalid admin credentials');
      }
    }

    // For jobseeker and employer, we'll create a session (in production, backend would validate)
    const newSession: ManualAuthSession = {
      role: credentials.role,
      email: credentials.email,
      timestamp: Date.now(),
    };
    setSession(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const logout = async () => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    queryClient.clear();
  };

  const value: ManualAuthContextType = {
    session,
    login,
    logout,
    isAuthenticated: !!session,
    role: session?.role || 'guest',
    isLoading,
  };

  return <ManualAuthContext.Provider value={value}>{children}</ManualAuthContext.Provider>;
}

export function useManualAuth() {
  const context = useContext(ManualAuthContext);
  if (context === undefined) {
    throw new Error('useManualAuth must be used within ManualAuthProvider');
  }
  return context;
}
