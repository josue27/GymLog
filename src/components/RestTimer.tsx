'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RestTimerProps {
  exerciseName: string;
  onClose: () => void;
  defaultSeconds?: number;
}

export default function RestTimer({ exerciseName, onClose, defaultSeconds = 90 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);
  const [vibrated, setVibrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setRunning(false);
          // Vibrate
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
          setVibrated(true);
          // Notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('GymLog - Descanso terminado', {
              body: `Tiempo de descanso completado. ¡A entrenar!`,
              icon: '/icons/icon-192.png',
            });
          }
          // Play sound using Web Audio API (beep)
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            oscillator.start();
            setTimeout(() => {
              oscillator.stop();
              ctx.close();
            }, 300);
          } catch { /* audio not available */ }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = 1 - seconds / defaultSeconds;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-overlay absolute inset-0" />
      <div className="relative bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 animate-slide-up text-center">
        <p className="text-xs text-gray-500 mb-1">Descanso</p>
        <h3 className="text-sm font-semibold text-white mb-4">{exerciseName} completado</h3>

        {/* Timer circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={seconds === 0 ? '#22c55e' : '#f59e0b'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${seconds === 0 ? 'text-green-400' : 'text-white'}`}>
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {seconds === 0 && (
          <p className="text-green-400 text-sm font-medium animate-fade-in mb-4">¡A entrenar! 💪</p>
        )}

        <div className="flex gap-2 justify-center">
          {seconds > 0 && (
            <button
              onClick={() => setRunning(!running)}
              className="btn-touch bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
            >
              {running ? '⏸ Pausar' : '▶ Reanudar'}
            </button>
          )}
          <button
            onClick={onClose}
            className="btn-touch bg-amber-500 hover:bg-amber-600 text-black rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
