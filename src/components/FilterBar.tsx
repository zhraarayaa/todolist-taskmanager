import React from 'react';
import { Priority, TaskStatus, Course, FilterOptions } from '../types';
import {
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  BookOpen,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: Partial<FilterOptions>) => void;
  courses: Course[];
  taskCountsByPriority: Record<Priority, number>;
  totalTasks: number;
  viewMode: 'list' | 'kanban';
  onChangeViewMode: (mode: 'list' | 'kanban') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  courses,
  taskCountsByPriority,
  totalTasks,
  viewMode,
  onChangeViewMode,
}) => {
  const priorityButtons: { id: Priority | 'all'; label: string; color: string; count: number }[] = [
    {
      id: 'all',
      label: 'Semua Prioritas',
      color: 'hover:bg-stone-100 text-stone-700',
      count: totalTasks,
    },
    {
      id: 'urgent',
      label: '🔴 Mendesak',
      color: 'hover:bg-rose-50 text-rose-700',
      count: taskCountsByPriority.urgent || 0,
    },
    {
      id: 'high',
      label: '🟠 Tinggi',
      color: 'hover:bg-amber-50 text-amber-700',
      count: taskCountsByPriority.high || 0,
    },
    {
      id: 'medium',
      label: '🟡 Sedang',
      color: 'hover:bg-yellow-50 text-yellow-700',
      count: taskCountsByPriority.medium || 0,
    },
    {
      id: 'low',
      label: '🟢 Rendah',
      color: 'hover:bg-emerald-50 text-emerald-700',
      count: taskCountsByPriority.low || 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-4 mb-6">
      {/* Search & Main Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            placeholder="Cari tugas, dosen, mata kuliah, atau kata kunci..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800 placeholder-stone-400"
          />
          {filters.search && (
            <button
              onClick={() => onChangeFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary filters: Course dropdown, Status dropdown, Sort */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Course Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.courseId}
              onChange={(e) => onChangeFilters({ courseId: e.target.value })}
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Semua Mata Kuliah ({courses.length})</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            <BookOpen className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.sortBy}
              onChange={(e) => onChangeFilters({ sortBy: e.target.value as any })}
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            >
              <option value="dueDate_asc">⏱️ Deadline Terdekat</option>
              <option value="dueDate_desc">📅 Deadline Terjauh</option>
              <option value="priority_desc">⚡ Prioritas Tertinggi</option>
              <option value="createdAt_desc">✨ Terbaru Ditambahkan</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* View mode toggle: List vs Kanban */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => onChangeViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title="Tampilan Daftar"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              title="Tampilan Papan Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Priority Filter Tabs (Prominently featured per user requirement) */}
      <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mr-1.5 flex items-center">
            <Flame className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Prioritas:
          </span>
          {priorityButtons.map((btn) => {
            const isActive = filters.priority === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onChangeFilters({ priority: btn.id })}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <span>{btn.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? 'bg-stone-700 text-stone-200'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Toggle Pills */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => onChangeFilters({ status: 'all' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filters.status === 'all'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Semua Status
          </button>
          <button
            onClick={() => onChangeFilters({ status: 'todo' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filters.status === 'todo'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Belum Selesai
          </button>
          <button
            onClick={() => onChangeFilters({ status: 'in_progress' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filters.status === 'in_progress'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sedang Jalan
          </button>
          <button
            onClick={() => onChangeFilters({ status: 'completed' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filters.status === 'completed'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
