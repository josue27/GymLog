'use client';

import { useCallback } from 'react';
import type { Exercise } from '@/types';
import SetRow from './SetRow';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onShowProgress: (exerciseId: string) => void;
  onDelete: (index: number) => void;
  isReadOnly?: boolean;
}

export default function ExerciseCard({
  exercise,
  index,
  onUpdate,
  onShowProgress,
  onDelete,
  isReadOnly = false,
}: ExerciseCardProps) {
  const handleSetUpdate = useCallback(
    (setIdx: number, field: string, value: string | boolean) => {
      const newSets = exercise.sets.map((s, i) =>
        i === setIdx ? { ...s, [field]: value } : s
      );
      onUpdate(index, 'sets', newSets);
    },
    [exercise.sets, index, onUpdate]
  );

  const handleAddSet = useCallback(() => {
    if (exercise.sets.length >= 3) return;
    onUpdate(index, 'sets', [
      ...exercise.sets,
      { weight: exercise.targetWeight || '', reps: '', done: false },
    ]);
  }, [exercise, index, onUpdate]);

  const handleRemoveSet = useCallback(() => {
    if (exercise.sets.length <= 1) return;
    onUpdate(index, 'sets', exercise.sets.slice(0, -1));
  }, [exercise, index, onUpdate]);

  const allDone = exercise.sets.every(s => s.reps);
  const someDone = exercise.sets.some(s => s.reps);

  return (
    <div
      className={`card p-4 animate-fade-in ${
        allDone ? 'border-green-600/40' : someDone ? 'border-amber-600/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate">{exercise.name}</h3>
            {allDone && (
              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                Completado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-500">Objetivo:</span>
            {isReadOnly ? (
              <span className="text-sm text-white font-medium">
                {exercise.targetWeight} {exercise.weightNote}
              </span>
            ) : (
              <>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  value={exercise.targetWeight}
                  onChange={e => onUpdate(index, 'targetWeight', e.target.value)}
                  className="w-16 bg-input border border-gray-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                />
                <input
                  type="text"
                  value={exercise.weightNote}
                  onChange={e => onUpdate(index, 'weightNote', e.target.value)}
                  className="w-24 bg-input border border-gray-600 rounded-lg px-2 py-1 text-xs text-gray-400"
                />
              </>
            )}
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onShowProgress(exercise.id)}
              className="btn-touch text-gray-500 hover:text-amber-400 text-xs flex-shrink-0"
              title="Ver progreso"
            >
              📈
            </button>
            <button
              onClick={() => onDelete(index)}
              className="btn-touch text-gray-600 hover:text-red-400 text-xs"
              title="Eliminar ejercicio"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Rep range */}
      <div className="mb-3">
        <span className="text-xs text-gray-500">
          Rango reps:{' '}
          <span className="text-amber-400 font-medium">{exercise.repRange}</span>
        </span>
      </div>

      {/* Sets */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 px-2 mb-1">
          <span className="w-10 text-[10px] text-gray-600 uppercase">Serie</span>
          <span className="w-16 text-[10px] text-gray-600 uppercase text-center">Peso</span>
          <span className="w-16 text-[10px] text-gray-600 uppercase text-center">Reps</span>
          <span className="w-10 text-[10px] text-gray-600 uppercase text-center">OK</span>
        </div>
        {exercise.sets.map((setData, sIdx) => (
          <SetRow
            key={sIdx}
            index={sIdx}
            setData={setData}
            onUpdate={handleSetUpdate}
            totalSets={exercise.sets.length}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
          />
        ))}
      </div>

      {/* Notes */}
      {!isReadOnly && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <input
            type="text"
            placeholder="Notas del ejercicio..."
            value={exercise.notes || ''}
            onChange={e => onUpdate(index, 'notes', e.target.value)}
            className="w-full bg-input border border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600"
          />
        </div>
      )}

      {isReadOnly && exercise.notes && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-500">📝 {exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
