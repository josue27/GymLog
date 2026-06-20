'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserData } from '@/types';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  updateUser: (user: UserData) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gymlog_token');
    if (savedToken) {
      setToken(savedToken);
      // Validate token by calling /me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('gymlog_token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('gymlog_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: UserData) => {
    localStorage.setItem('gymlog_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gymlog_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser: UserData) => {
    setUser(newUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
