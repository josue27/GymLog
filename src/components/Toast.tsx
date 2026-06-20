'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const colors: Record<string, string> = {
    success: 'bg-green-600 border-green-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-blue-600 border-blue-400',
  };

  return (
    <div
      className={`animate-toast-in fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border text-white text-sm font-medium shadow-lg ${colors[type] || colors.info}`}
    >
      {message}
    </div>
  );
}
