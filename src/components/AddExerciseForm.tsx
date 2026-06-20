'use client';

import { useState, useRef, useEffect } from 'react';
import type { ExerciseTemplate } from '@/types';

interface AddExerciseFormProps {
  onAdd: (exercise: ExerciseTemplate) => void;
  onCancel: () => void;
}

export default function AddExerciseForm({ onAdd, onCancel }: AddExerciseFormProps) {
  const [name, setName] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weightNote, setWeightNote] = useState('kg');
  const [repRange, setRepRange] = useState('8-12');
  const [defaultSets, setDefaultSets] = useState(2);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      id: trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: trimmed,
      targetWeight: targetWeight || '0',
      weightNote: weightNote || 'kg',
      repRange: repRange || '8-12',
      defaultSets: Math.min(3, Math.max(1, defaultSets)),
    });
  };

  return (
    <div className="card p-4 animate-fade-in space-y-3">
      <h3 className="text-sm font-semibold text-white">Nuevo ejercicio</h3>
      <input
        ref={inputRef}
        type="text"
        placeholder="Nombre del ejercicio"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        className="w-full bg-input border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500"
      />
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          placeholder="Peso (kg)"
          value={targetWeight}
          onChange={e => setTargetWeight(e.target.value)}
          className="flex-1 bg-input border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Nota (kg + barra)"
          value={weightNote}
          onChange={e => setWeightNote(e.target.value)}
          className="flex-1 bg-input border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Rango reps (8-12)"
          value={repRange}
          onChange={e => setRepRange(e.target.value)}
          className="flex-1 bg-input border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500"
        />
        <select
          value={defaultSets}
          onChange={e => setDefaultSets(Number(e.target.value))}
          className="w-20 bg-input border border-gray-600 rounded-lg px-2 py-2.5 text-sm text-white"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          className="flex-1 btn-touch bg-amber-500 text-black font-semibold rounded-xl py-2.5 text-sm"
        >
          Añadir
        </button>
        <button
          onClick={onCancel}
          className="flex-1 btn-touch bg-gray-700 text-gray-300 rounded-xl py-2.5 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
