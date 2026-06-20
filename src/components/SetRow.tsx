'use client';

import type { SetData } from '@/types';

interface SetRowProps {
  index: number;
  setData: SetData;
  onUpdate: (index: number, field: string, value: string | boolean) => void;
  totalSets: number;
  onAddSet: () => void;
  onRemoveSet: () => void;
}

export default function SetRow({ index, setData, onUpdate, totalSets, onAddSet, onRemoveSet }: SetRowProps) {
  const isLast = index === totalSets - 1;
  const canAdd = totalSets < 3;
  const canRemove = totalSets > 1;

  return (
    <div className={`flex items-center gap-2 py-2 px-2 rounded-lg ${setData.done ? 'done-row' : ''}`}>
      <span className="w-10 text-xs text-gray-500 font-medium">S{index + 1}</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.5"
        min="0"
        placeholder="kg"
        value={setData.weight}
        onChange={e => onUpdate(index, 'weight', e.target.value)}
        className="w-16 bg-input border border-gray-600 rounded-lg px-2 py-2 text-sm text-white text-center"
      />
      <input
        type="number"
        inputMode="numeric"
        step="1"
        min="0"
        placeholder="Reps"
        value={setData.reps}
        onChange={e => onUpdate(index, 'reps', e.target.value)}
        className="w-16 bg-input border border-gray-600 rounded-lg px-2 py-2 text-sm text-white text-center"
      />
      <button
        onClick={() => onUpdate(index, 'done', !setData.done)}
        className={`btn-touch rounded-lg text-lg transition-colors ${
          setData.done ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
        }`}
        title={setData.done ? 'Completada' : 'Marcar completada'}
      >
        {setData.done ? '✓' : '○'}
      </button>
      {canAdd && isLast ? (
        <button
          onClick={onAddSet}
          className="btn-touch rounded-lg bg-gray-700 text-gray-400 hover:text-white text-xs ml-1"
          title="Añadir serie"
        >
          +
        </button>
      ) : canRemove && isLast ? (
        <button
          onClick={onRemoveSet}
          className="btn-touch rounded-lg bg-gray-700 text-gray-400 hover:text-red-400 text-xs ml-1"
          title="Quitar serie"
        >
          −
        </button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}
