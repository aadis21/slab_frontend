'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { setToken, removeToken, AuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token, user: loggedUser } = res.data.data;
    setToken(token);
    setUser(loggedUser);
    if (loggedUser.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      removeToken();
      setUser(null);
      router.push('/login');
    }
  };

  return { user, loading, login, logout, refetch: fetchUser };
}
