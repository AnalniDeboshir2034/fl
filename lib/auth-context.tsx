'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        // Даем время на установку cookie
        await new Promise(resolve => setTimeout(resolve, 100));
        await refreshUser();
        return {};
      }
      return { error: data.error };
    } catch {
      return { error: 'Ошибка при входе' };
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        await new Promise(resolve => setTimeout(resolve, 100));
        await refreshUser();
        return {};
      }
      return { error: data.error };
    } catch {
      return { error: 'Ошибка при регистрации' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
