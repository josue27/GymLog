'use client';

import { useState, useRef, useEffect } from 'react';

interface DaySelectorProps {
  days: string[];
  activeDay: string;
  onSelect: (day: string) => void;
  onAddDay: (name: string) => void;
  onDeleteDay?: (name: string) => void;
}

export default function DaySelector({ days, activeDay, onSelect, onAddDay, onDeleteDay }: DaySelectorProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name || days.includes(name)) return;
    onAddDay(name);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {days.map(day => (
        <button
          key={day}
          onClick={() => onSelect(day)}
          className={`btn-touch px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            day === activeDay
              ? 'bg-amber-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {day}
        </button>
      ))}
      {adding ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Nombre del día"
            className="w-28 bg-input border border-gray-600 rounded-full px-3 py-2 text-sm text-white"
          />
          <button onClick={handleAdd} className="btn-touch bg-amber-500 text-black rounded-full w-8 h-8 text-sm">✓</button>
          <button onClick={() => setAdding(false)} className="btn-touch text-gray-500 hover:text-white w-8 h-8">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="btn-touch w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white text-lg flex-shrink-0"
          title="Añadir día"
        >
          +
        </button>
      )}
    </div>
  );
}
