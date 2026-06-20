'use client';

import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthProvider';
import { useDrive } from '@/hooks/useDrive';
import { useWorkout } from '@/hooks/useWorkout';
import Toast from '@/components/Toast';
import DaySelector from '@/components/DaySelector';
import ExerciseCard from '@/components/ExerciseCard';
import AddExerciseForm from '@/components/AddExerciseForm';
import HistoryModal from '@/components/HistoryModal';
import ProgressChart from '@/components/ProgressChart';
import RestTimer from '@/components/RestTimer';

export default function HomePage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const { connect, save, list, load } = useDrive();
  const {
    days,
    activeDay,
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
  } = useWorkout(!!user?.hasGoogleDrive);

  const [toast, setToast] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [showHistory, setShowHistory] = useState(false);
  const [showProgress, setShowProgress] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [driveConnected, setDriveConnected] = useState(user?.hasGoogleDrive || false);
  const [saving, setSaving] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  // Check for drive callback success
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('drive') === 'connected') {
        setDriveConnected(true);
        setToast({ message: 'Google Drive conectado ✓', type: 'success' });
        // Clean URL
        window.history.replaceState({}, '', '/');
      } else if (params.get('drive') === 'error') {
        setToast({ message: 'Error al conectar Google Drive', type: 'error' });
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // Connect Google Drive
  const handleConnectDrive = useCallback(async () => {
    try {
      await connect();
    } catch {
      notify('Error al conectar Google Drive', 'error');
    }
  }, [connect, notify]);

  // Save session (local + Drive)
  const handleSaveSession = useCallback(async () => {
    setSaving(true);
    try {
      const workoutSession = handleSave();
      if (driveConnected) {
        await save(todayStr(), workoutSession);
        notify('Sesión guardada en Drive ✓', 'success');
      } else {
        notify('Sesión guardada localmente ✓', 'success');
      }
    } catch {
      notify('Error al guardar en Drive. Guardado local.', 'error');
    } finally {
      setSaving(false);
    }
  }, [handleSave, driveConnected, save, todayStr, notify]);

  // Reload from Drive
  const handleLoadFromDrive = useCallback(async () => {
    try {
      const files = await list();
      if (files.length > 0) {
        const session = await load(files[0].id);
        handleLoadSession({ date: files[0].name.replace('gymlog_', '').replace('.json', ''), ...session });
        notify('Sesión cargada desde Drive ✓', 'success');
      }
    } catch {
      notify('Error al cargar desde Drive', 'error');
    }
  }, [list, load, handleLoadSession, notify]);

  // Progress data
  const progressData = useMemo(() => {
    if (!showProgress) return null;
    return getProgressData(showProgress);
  }, [showProgress, getProgressData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pb-32 pt-4">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">🏋️ Bitácora</h1>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(todayStr())}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Drive connection status */}
            <button
              onClick={driveConnected ? handleLoadFromDrive : handleConnectDrive}
              className={`btn-touch rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                driveConnected
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              }`}
              title={driveConnected ? 'Cargar desde Drive' : 'Conectar Google Drive'}
            >
              {driveConnected ? '📁 Drive' : '🔗 Conectar Drive'}
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="btn-touch bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              📋 Historial
            </button>
          </div>
        </div>
        <DaySelector
          days={days}
          activeDay={activeDay}
          onSelect={handleDaySelect}
          onAddDay={handleAddDay}
        />
      </header>

      {/* Progress info + actions */}
      <div className="flex items-center justify-between mb-3 mt-4">
        <p className="text-xs text-gray-500">
          {completedCount}/{totalCount} series con datos
          {completedCount === totalCount && totalCount > 0 ? ' ✅' : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetCompleted}
            className="text-xs text-gray-600 hover:text-amber-400 transition-colors"
            title="Reiniciar estatus de completado"
          >
            ↺ Reset
          </button>
          <button
            onClick={() => {
              if (confirm('¿Empezar un nuevo entrenamiento? Se perderán los cambios no guardados.')) {
                handleReset();
                notify('Nuevo entrenamiento');
              }
            }}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            Nuevo
          </button>
        </div>
      </div>

      {/* Progress chart */}
      {showProgress && (
        <div className="mb-4">
          <ProgressChart
            data={progressData || []}
            exerciseName={session.find(e => e.id === showProgress)?.name || showProgress}
            onClose={() => setShowProgress(null)}
          />
        </div>
      )}

      {/* Exercise cards */}
      <div className="space-y-3">
        {session.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={i}
            onUpdate={(idx, field, value) => {
              if (field === 'targetWeight' || field === 'weightNote') {
                handleUpdateTemplate(idx, field, value);
              } else {
                handleExerciseUpdate(idx, field, value);
              }
            }}
            onShowProgress={setShowProgress}
            onDelete={handleDeleteExercise}
          />
        ))}
      </div>

      {/* Add exercise */}
      {showAddExercise ? (
        <div className="mt-3">
          <AddExerciseForm
            onAdd={(exercise) => {
              handleAddExercise(exercise);
              notify(`"${exercise.name}" añadido`);
            }}
            onCancel={() => setShowAddExercise(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAddExercise(true)}
          className="mt-3 w-full btn-touch border-2 border-dashed border-gray-700 rounded-xl py-3 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
        >
          + Añadir ejercicio
        </button>
      )}

      {/* Floating save button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleSaveSession}
          disabled={saving}
          className="btn-touch bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl px-6 py-4 shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-sm disabled:opacity-50"
        >
          {saving ? 'Guardando...' : '💾 Guardar sesión'}
        </button>
      </div>

      {/* History modal */}
      {showHistory && (
        <HistoryModal
          workouts={workouts}
          onClose={() => setShowHistory(false)}
          onLoadSession={handleLoadSession}
        />
      )}

      {/* Rest timer */}
      {showRestTimer && (
        <RestTimer
          exerciseName={showRestTimer}
          onClose={() => setShowRestTimer(null)}
        />
      )}
    </div>
  );
}
