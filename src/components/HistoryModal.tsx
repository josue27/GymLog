'use client';

import { useMemo, useState } from 'react';
import type { WorkoutRecord, WorkoutSession } from '@/types';

interface HistoryModalProps {
  workouts: Record<string, WorkoutSession>;
  onClose: () => void;
  onLoadSession: (workout: WorkoutRecord) => void;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(+y, +m - 1, +d);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryModal({ workouts, onClose, onLoadSession }: HistoryModalProps) {
  const [viewing, setViewing] = useState<[string, WorkoutSession] | null>(null);

  const entries = useMemo(() => {
    return Object.entries(workouts).sort((a, b) => b[0].localeCompare(a[0]));
  }, [workouts]);

  if (viewing) {
    const [date, workout] = viewing;
    return (
      <div
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
        onClick={e => { if (e.target === e.currentTarget) setViewing(null); }}
      >
        <div className="modal-overlay absolute inset-0" />
        <div className="relative bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{formatDate(date)}</h3>
              <p className="text-sm text-amber-400">{workout.day}</p>
            </div>
            <button onClick={() => setViewing(null)} className="btn-touch text-gray-400 hover:text-white text-xl">✕</button>
          </div>
          <div className="space-y-3">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">{ex.name}</h4>
                <div className="text-xs text-gray-500 mb-1">
                  Objetivo: {ex.targetWeight} {ex.weightNote} | Rango: {ex.repRange}
                </div>
                <div className="space-y-1">
                  {ex.sets.map((s, si) => (
                    <div key={si} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 w-6">S{si + 1}</span>
                      <span className="text-white font-medium w-16">
                        {s.weight ? `${s.weight} kg` : '—'}
                      </span>
                      <span className="text-gray-400">
                        {s.reps ? `${s.reps} reps` : '—'}
                      </span>
                      {s.done && <span className="text-green-400">✓</span>}
                    </div>
                  ))}
                </div>
                {ex.notes && (
                  <p className="text-xs text-gray-500 mt-2">📝 {ex.notes}</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              onLoadSession({ date, ...workout });
              onClose();
            }}
            className="mt-4 w-full btn-touch bg-amber-500 text-black font-semibold rounded-xl py-3 text-sm"
          >
            Cargar como plantilla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-overlay absolute inset-0" />
      <div className="relative bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Historial</h3>
          <button onClick={onClose} className="btn-touch text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No hay sesiones guardadas aún.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map(([date, workout]) => {
              const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
              const doneSets = workout.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter(s => s.done || s.reps).length,
                0
              );
              return (
                <button
                  key={date}
                  onClick={() => setViewing([date, workout])}
                  className="w-full text-left card p-3 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(date)}</p>
                      <p className="text-xs text-amber-400 mt-0.5">
                        {workout.day} · {workout.exercises.length} ejercicios
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-400">
                        {doneSets}/{totalSets} series
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">Ver detalles →</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
