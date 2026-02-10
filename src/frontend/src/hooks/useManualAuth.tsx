import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ManualAuthSession, LoginCredentials, UserRole } from '../auth/manualAuthTypes';

interface ManualAuthContextType {
  session: ManualAuthSession | null;
  login: (credentials: LoginCredentials) => Promise<{ needsProfileSetup: boolean }>;
  signup: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  hasCompletedProfile: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  isLoading: boolean;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'instant_jobs_session';
const ACCOUNTS_STORAGE_KEY = 'instant_jobs_accounts';

interface StoredAccount {
  email: string;
  passwordHash: string;
  role: UserRole;
  hasCompletedProfile: boolean;
}

export function ManualAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ManualAuthSession | null>(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Simple hash function (NOT secure - for demo only)
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  // Load accounts from storage
  const getAccounts = (): StoredAccount[] => {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  // Save accounts to storage
  const saveAccounts = (accounts: StoredAccount[]) => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  };

  // Load session from storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as ManualAuthSession;
        // Validate session is still valid (simple check)
        const accounts = getAccounts();
        const account = accounts.find(a => a.email === parsed.email && a.role === parsed.role);
        if (account) {
          setSession(parsed);
          setHasCompletedProfile(account.hasCompletedProfile);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (credentials: LoginCredentials) => {
    // TODO: Replace with backend signup call when implemented
    // Backend should: hash password, store account, return session token
    
    const accounts = getAccounts();
    
    // Check if account already exists
    const existingAccount = accounts.find(
      a => a.email.toLowerCase() === credentials.email.toLowerCase()
    );
    
    if (existingAccount) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    // Create new account
    const newAccount: StoredAccount = {
      email: credentials.email,
      passwordHash: simpleHash(credentials.password),
      role: credentials.role,
      hasCompletedProfile: false,
    };

    accounts.push(newAccount);
    saveAccounts(accounts);

    // Create session
    const newSession: ManualAuthSession = {
      role: credentials.role,
      email: credentials.email,
      timestamp: Date.now(),
      token: `token_${Date.now()}_${simpleHash(credentials.email)}`,
    };
    
    setSession(newSession);
    setHasCompletedProfile(false);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const login = async (credentials: LoginCredentials): Promise<{ needsProfileSetup: boolean }> => {
    // TODO: Replace with backend login call when implemented
    // Backend should: validate credentials, create session token, return token + profile status
    
    const accounts = getAccounts();
    
    const account = accounts.find(
      a => a.email.toLowerCase() === credentials.email.toLowerCase() &&
           a.role === credentials.role
    );
    
    if (!account) {
      throw new Error('No account found. Please sign up first.');
    }

    const passwordHash = simpleHash(credentials.password);
    if (account.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const newSession: ManualAuthSession = {
      role: credentials.role,
      email: credentials.email,
      timestamp: Date.now(),
      token: `token_${Date.now()}_${simpleHash(credentials.email)}`,
    };
    
    setSession(newSession);
    setHasCompletedProfile(account.hasCompletedProfile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

    return { needsProfileSetup: !account.hasCompletedProfile };
  };

  const markProfileComplete = () => {
    if (!session) return;

    const accounts = getAccounts();
    const accountIndex = accounts.findIndex(
      a => a.email === session.email && a.role === session.role
    );

    if (accountIndex !== -1) {
      accounts[accountIndex].hasCompletedProfile = true;
      saveAccounts(accounts);
      setHasCompletedProfile(true);
    }
  };

  const logout = async () => {
    // TODO: Call backend logout API when implemented to invalidate token
    
    setSession(null);
    setHasCompletedProfile(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Clear all cached data on logout
    queryClient.clear();
  };

  const value: ManualAuthContextType = {
    session,
    login,
    signup,
    logout,
    markProfileComplete,
    hasCompletedProfile,
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
