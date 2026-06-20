'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Exercise, ExerciseTemplate, WorkoutSession, WorkoutRecord, ProgressPoint } from '@/types';
import { DEFAULT_DAYS, DEFAULT_TEMPLATE } from '@/types';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createSessionFromTemplate(template: ExerciseTemplate[]): Exercise[] {
  return template.map(ex => ({
    ...ex,
    sets: Array.from({ length: ex.defaultSets }, () => ({
      weight: ex.targetWeight || '',
      reps: '',
      done: false,
    })),
    notes: '',
  }));
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

// Local storage fallback keys (when Drive not connected)
const LOCAL_KEYS = {
  days: 'gymlog_days',
  tpl: (day: string) => `gymlog_tpl_${day}`,
  draft: (day: string) => `gymlog_draft_${day}`,
  workouts: 'gymlog_workouts',
};

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useWorkout(hasDrive: boolean) {
  const [days, setDays] = useState<string[]>(() => loadLocal(LOCAL_KEYS.days, DEFAULT_DAYS));
  const [activeDay, setActiveDay] = useState<string>(() => days[0] || 'Pierna');
  const [templates, setTemplates] = useState<Record<string, ExerciseTemplate[]>>(() => {
    const saved: Record<string, ExerciseTemplate[]> = {};
    for (const day of loadLocal<string[]>(LOCAL_KEYS.days, DEFAULT_DAYS)) {
      saved[day] = loadLocal(LOCAL_KEYS.tpl(day), day === 'Pierna' ? DEFAULT_TEMPLATE : []);
    }
    return saved;
  });
  const [session, setSession] = useState<Exercise[]>(() => {
    const draft = loadLocal<Exercise[] | null>(LOCAL_KEYS.draft(activeDay), null);
    if (draft) return draft;
    const tpl = loadLocal<ExerciseTemplate[]>(LOCAL_KEYS.tpl(activeDay), activeDay === 'Pierna' ? DEFAULT_TEMPLATE : []);
    return createSessionFromTemplate(tpl);
  });
  const [workouts, setWorkouts] = useState<Record<string, WorkoutSession>>(() =>
    loadLocal(LOCAL_KEYS.workouts, {})
  );
  const [showRestTimer, setShowRestTimer] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save draft debounced to localStorage
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveLocal(LOCAL_KEYS.draft(activeDay), session);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [session, activeDay]);

  // Persist days
  useEffect(() => {
    saveLocal(LOCAL_KEYS.days, days);
  }, [days]);

  // Persist templates
  useEffect(() => {
    for (const [day, tpl] of Object.entries(templates)) {
      saveLocal(LOCAL_KEYS.tpl(day), tpl);
    }
  }, [templates]);

  // Persist workouts
  useEffect(() => {
    saveLocal(LOCAL_KEYS.workouts, workouts);
  }, [workouts]);

  const handleDaySelect = useCallback(
    (day: string) => {
      saveLocal(LOCAL_KEYS.draft(activeDay), session);
      const draft = loadLocal<Exercise[] | null>(LOCAL_KEYS.draft(day), null);
      const tpl = templates[day] || [];
      setActiveDay(day);
      setSession(draft || createSessionFromTemplate(tpl));
    },
    [activeDay, session, templates]
  );

  const handleAddDay = useCallback(
    (name: string) => {
      if (days.includes(name)) return;
      setDays(prev => [...prev, name]);
      setTemplates(prev => ({ ...prev, [name]: [] }));
      saveLocal(LOCAL_KEYS.draft(activeDay), session);
      setActiveDay(name);
      setSession([]);
    },
    [days, activeDay, session]
  );

  const handleExerciseUpdate = useCallback((exIndex: number, field: string, value: any) => {
    setSession(prev => {
      const updated = [...prev];
      updated[exIndex] = { ...updated[exIndex], [field]: value };
      if (field === 'sets') {
        const ex = updated[exIndex];
        const allHaveReps = ex.sets.every((s: any) => s.reps && s.reps !== '');
        if (allHaveReps && ex.sets.length > 0) {
          // Trigger rest timer after a short delay (wait for state update)
          setTimeout(() => setShowRestTimer(ex.name), 100);
        }
      }
      return updated;
    });
  }, []);

  const handleAddExercise = useCallback(
    (exercise: ExerciseTemplate) => {
      setSession(prev => [
        ...prev,
        {
          ...exercise,
          sets: Array.from({ length: exercise.defaultSets }, () => ({
            weight: exercise.targetWeight || '',
            reps: '',
            done: false,
          })),
          notes: '',
        },
      ]);
      setTemplates(prev => ({
        ...prev,
        [activeDay]: [...(prev[activeDay] || []), exercise],
      }));
    },
    [activeDay]
  );

  const handleDeleteExercise = useCallback(
    (exIndex: number) => {
      const ex = session[exIndex];
      setSession(prev => prev.filter((_, i) => i !== exIndex));
      setTemplates(prev => ({
        ...prev,
        [activeDay]: (prev[activeDay] || []).filter(e => e.id !== ex.id),
      }));
    },
    [session, activeDay]
  );

  const handleUpdateTemplate = useCallback(
    (exIndex: number, field: string, value: any) => {
      const ex = session[exIndex];
      setTemplates(prev => {
        const dayTpl = [...(prev[activeDay] || [])];
        const tplIdx = dayTpl.findIndex(e => e.id === ex.id);
        if (tplIdx >= 0) {
          dayTpl[tplIdx] = { ...dayTpl[tplIdx], [field]: value };
        }
        return { ...prev, [activeDay]: dayTpl };
      });
      if (field === 'targetWeight') {
        setSession(prev => {
          const updated = [...prev];
          updated[exIndex] = {
            ...updated[exIndex],
            targetWeight: value,
            sets: updated[exIndex].sets.map(s => ({ ...s, weight: value })),
          };
          return updated;
        });
      }
    },
    [session, activeDay]
  );

  const handleSave = useCallback((): WorkoutSession => {
    const date = todayStr();
    const workoutSession: WorkoutSession = { day: activeDay, exercises: session };
    setWorkouts(prev => ({
      ...prev,
      [date]: workoutSession,
    }));
    localStorage.removeItem(LOCAL_KEYS.draft(activeDay));
    return workoutSession;
  }, [session, activeDay]);

  const handleReset = useCallback(() => {
    const tpl = templates[activeDay] || [];
    setSession(createSessionFromTemplate(tpl));
    localStorage.removeItem(LOCAL_KEYS.draft(activeDay));
  }, [activeDay, templates]);

  const handleResetCompleted = useCallback(() => {
    setSession(prev =>
      prev.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, done: false })),
      }))
    );
  }, []);

  const handleLoadSession = useCallback(
    (workout: WorkoutRecord) => {
      saveLocal(LOCAL_KEYS.draft(activeDay), session);
      setSession(workout.exercises);
    },
    [activeDay, session]
  );

  // Compute progress data for a given exercise ID
  const getProgressData = useCallback(
    (exerciseId: string): ProgressPoint[] => {
      const entries = Object.entries(workouts).sort((a, b) => a[0].localeCompare(b[0]));
      const last10 = entries.slice(-10);
      return last10.map(([date, w]) => {
        const ex = w.exercises.find(e => e.id === exerciseId);
        if (!ex) return { date, maxWeight: 0, maxReps: 0 };
        const weights = ex.sets.map(s => parseFloat(s.weight) || 0);
        const reps = ex.sets.map(s => parseInt(s.reps) || 0);
        return {
          date,
          maxWeight: Math.max(0, ...weights),
          maxReps: Math.max(0, ...reps),
        };
      });
    },
    [workouts]
  );

  const completedCount = session.reduce((sum, ex) => sum + ex.sets.filter(s => s.reps).length, 0);
  const totalCount = session.reduce((sum, ex) => sum + ex.sets.length, 0);

  return {
    days,
    activeDay,
    templates,
    session,
    workouts,
    showRestTimer,
    completedCount,
    totalCount,
    todayStr,
    formatDate,
    setShowRestTimer,
    handleDaySelect,
    handleAddDay,
    handleExerciseUpdate,
    handleAddExercise,
    handleDeleteExercise,
    handleUpdateTemplate,
    handleSave,
    handleReset,
    handleResetCompleted,
    handleLoadSession,
    getProgressData,
    setSession,
  };
}
