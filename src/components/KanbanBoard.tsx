import React from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Clock, CheckCircle2, PlayCircle, Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (taskId: string, currentStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onSyncToCalendar: (task: Task) => void;
  onAddNewWithStatus: (status: TaskStatus) => void;
  isCalendarAuthenticated: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask,
  onSyncToCalendar,
  onAddNewWithStatus,
  isCalendarAuthenticated,
}) => {
  const columns: {
    status: TaskStatus;
    title: string;
    icon: React.ReactNode;
    color: string;
    badgeBg: string;
  }[] = [
    {
      status: 'todo',
      title: 'Belum Selesai (To-Do)',
      icon: <Clock className="w-4 h-4 text-stone-600" />,
      color: 'border-t-stone-400',
      badgeBg: 'bg-stone-100 text-stone-700',
    },
    {
      status: 'in_progress',
      title: 'Sedang Dikerjakan',
      icon: <PlayCircle className="w-4 h-4 text-amber-600" />,
      color: 'border-t-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    {
      status: 'completed',
      title: 'Tuntas Selesai',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      color: 'border-t-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={`bg-stone-100/70 rounded-2xl p-4 border border-stone-200/80 border-t-4 ${col.color} min-h-[500px] flex flex-col`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center space-x-2">
                {col.icon}
                <h3 className="text-sm font-bold text-stone-800 font-display">
                  {col.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddNewWithStatus(col.status)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
                title={`Tambah tugas ke ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards in this Column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-xs text-stone-400 text-center px-4">
                  Belum ada tugas di kolom ini
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onToggleSubtask={onToggleSubtask}
                    onSyncToCalendar={onSyncToCalendar}
                    isCalendarAuthenticated={isCalendarAuthenticated}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
