'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ProgressPoint } from '@/types';

interface ProgressChartProps {
  data: ProgressPoint[];
  exerciseName: string;
  onClose: () => void;
}

export default function ProgressChart({ data, exerciseName, onClose }: ProgressChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">
            {exerciseName} - Progreso
          </h3>
          <button
            onClick={onClose}
            className="btn-touch text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-500 text-sm text-center py-6">
          Necesitas al menos 2 sesiones con datos para ver el progreso.
        </p>
      </div>
    );
  }

  // Format dates to short form for display
  const chartData = data.map(d => ({
    ...d,
    dateLabel: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">
          {exerciseName} - Progreso
        </h3>
        <button
          onClick={onClose}
          className="btn-touch text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#2a2a2a' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#2a2a2a' }}
              tickLine={false}
              label={{ value: 'kg', position: 'insideLeft', style: { fontSize: 10, fill: '#6b7280' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#2a2a2a' }}
              tickLine={false}
              label={{ value: 'reps', position: 'insideRight', style: { fontSize: 10, fill: '#6b7280' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#f5f5f5' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="maxWeight"
              name="Peso máx (kg)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f59e0b', stroke: '#1a1a1a', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="maxReps"
              name="Reps máx"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4, fill: '#22c55e', stroke: '#1a1a1a', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
