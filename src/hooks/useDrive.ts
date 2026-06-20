'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { WorkoutSession, DriveFile } from '@/types';

export function useDrive() {
  const { token, updateUser } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const res = await fetch(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    },
    [token]
  );

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const data = await apiFetch('/api/drive/auth');
      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Drive connect error:', err);
      setConnecting(false);
      throw err;
    }
  }, [apiFetch]);

  const save = useCallback(
    async (date: string, session: WorkoutSession) => {
      return apiFetch('/api/drive/save', {
        method: 'POST',
        body: JSON.stringify({ date, session }),
      });
    },
    [apiFetch]
  );

  const list = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/drive/list');
      setFiles(data.files || []);
      return data.files;
    } catch (err) {
      console.error('Drive list error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const load = useCallback(
    async (fileId: string) => {
      const data = await apiFetch('/api/drive/load', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
      });
      return data.session as WorkoutSession;
    },
    [apiFetch]
  );

  return { connect, save, list, load, files, loading, connecting };
}
