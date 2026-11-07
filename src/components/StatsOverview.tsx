import React from 'react';
import { Task, Priority } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers, CalendarCheck } from 'lucide-react';

interface StatsOverviewProps {
  tasks: Task[];
  onSelectFilter: (type: 'all' | 'urgent' | 'dueSoon' | 'completed') => void;
  activeFilterType: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  onSelectFilter,
  activeFilterType,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;

  // Urgent count (either priority = urgent or high)
  const urgentCount = tasks.filter(
    (t) => t.status !== 'completed' && t.priority === 'urgent'
  ).length;

  // Due within 24 hours
  const now = new Date().getTime();
  const dueWithin24Hours = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const dueTime = new Date(t.dueDate).getTime();
    if (isNaN(dueTime)) return false;
    const diffHours = (dueTime - now) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  }).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Total Card */}
      <div
        onClick={() => onSelectFilter('all')}
        className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
          activeFilterType === 'all'
            ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
            : 'border-stone-200/80 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Tugas
          </span>
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
            {total}
          </span>
          <span className="text-xs text-stone-400">Semua MK</span>
        </div>
      </div>

      {/* Urgent Card */}
      <div
        onClick={() => onSelectFilter('urgent')}
        className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
          activeFilterType === 'urgent'
            ? 'border-rose-400 ring-2 ring-rose-400/20 shadow-sm'
            : 'border-stone-200/80 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Prioritas Mendesak
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold font-display text-rose-600">
            {urgentCount}
          </span>
          <span className="text-xs font-medium text-rose-500">Perlu Segera</span>
        </div>
      </div>

      {/* Due in 24h Card */}
      <div
        onClick={() => onSelectFilter('dueSoon')}
        className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
          activeFilterType === 'dueSoon'
            ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
            : 'border-stone-200/80 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Deadline &lt; 24 Jam
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold font-display text-amber-700">
            {dueWithin24Hours}
          </span>
          <span className="text-xs font-medium text-amber-600">Hari ini / Besok</span>
        </div>
      </div>

      {/* Progress & Completed Card */}
      <div
        onClick={() => onSelectFilter('completed')}
        className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
          activeFilterType === 'completed'
            ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm'
            : 'border-stone-200/80 hover:border-stone-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Tuntas Selesai
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-display text-emerald-700">
              {completed}
            </span>
            <span className="text-xs text-stone-400">/ {total}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
