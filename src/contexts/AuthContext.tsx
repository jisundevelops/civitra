'use client';

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import type { User, PageName } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  currentPage: PageName;
  setCurrentPage: (page: PageName) => void;
  selectedViolationId: string | null;
  setSelectedViolationId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuthState(): { user: User | null; token: string | null; currentPage: PageName } {
  if (typeof window === 'undefined') return { user: null, token: null, currentPage: 'login' };
  const savedToken = localStorage.getItem('civitra_token');
  const savedUser = localStorage.getItem('civitra_user');
  if (savedToken && savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      return { user: parsed, token: savedToken, currentPage: 'dashboard' };
    } catch {
      localStorage.removeItem('civitra_token');
      localStorage.removeItem('civitra_user');
    }
  }
  return { user: null, token: null, currentPage: 'landing' };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => getInitialAuthState(), []);
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageName>(initial.currentPage);
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null);

  const login = useCallback((newToken: string, userData: User) => {
    localStorage.setItem('civitra_token', newToken);
    localStorage.setItem('civitra_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setCurrentPage('dashboard');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('civitra_token');
    localStorage.removeItem('civitra_user');
    setToken(null);
    setUser(null);
    setCurrentPage('landing');
    setSelectedViolationId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, currentPage, setCurrentPage, selectedViolationId, setSelectedViolationId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
