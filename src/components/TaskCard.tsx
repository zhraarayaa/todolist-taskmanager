import React, { useState } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { getDeadlineStatus, formatIndonesianDate } from '../utils/dateUtils';
import { generateGoogleCalendarWebUrl } from '../services/calendar';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (taskId: string, currentStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onSyncToCalendar: (task: Task) => void;
  isCalendarAuthenticated: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask,
  onSyncToCalendar,
  isCalendarAuthenticated,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = task.status === 'completed';
  const deadline = getDeadlineStatus(task.dueDate, isCompleted);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const subtasksPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const priorityStyles: Record<
    Priority,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    urgent: {
      label: 'Mendesak',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
    high: {
      label: 'Tinggi',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    medium: {
      label: 'Sedang',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500',
    },
    low: {
      label: 'Rendah',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  const currentPriority = priorityStyles[task.priority] || priorityStyles.medium;

  const handleCompleteClick = () => {
    if (!isCompleted) {
      // Trigger nice confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onToggleStatus(task.id, task.status);
  };

  const directWebCalendarUrl = generateGoogleCalendarWebUrl(task);

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? 'bg-stone-50/70 border-stone-200/60 opacity-80'
          : deadline.isOverdue
          ? 'border-rose-200/90 shadow-sm shadow-rose-100/50'
          : deadline.isDueSoon
          ? 'border-amber-200/90 shadow-sm shadow-amber-100/40'
          : 'border-stone-200/90 hover:border-stone-300'
      }`}
    >
      {/* Top Meta: Course Badge, Lecturer & Priority */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Course Info */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200/80">
            {task.courseCode}
          </span>
          <span className="text-xs font-medium text-stone-600 truncate max-w-[200px] sm:max-w-[260px]">
            {task.courseName}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center space-x-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${currentPriority.bg} ${currentPriority.text} ${currentPriority.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentPriority.dot}`} />
            {currentPriority.label}
          </span>

          {/* Context Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-30 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2 text-stone-700 hover:bg-stone-50"
                  >
                    <Pencil className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Tugas</span>
                  </button>
                  <a
                    href={directWebCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2 text-stone-700 hover:bg-stone-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Buka di Kalender</span>
                  </a>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(task);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Tugas</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Checkbox, Title & Description */}
      <div className="flex items-start space-x-3">
        <button
          onClick={handleCompleteClick}
          className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors focus:outline-none flex-shrink-0"
          title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
          ) : (
            <Circle className="w-5 h-5 hover:text-emerald-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold leading-snug transition-colors ${
              isCompleted
                ? 'line-through text-stone-400 font-normal'
                : 'text-stone-900 group-hover:text-amber-800'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-xs sm:text-sm mt-1.5 line-clamp-2 ${
                isCompleted ? 'text-stone-400' : 'text-stone-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Lecturer Info */}
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-stone-500">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">Dosen: {task.lecturer}</span>
          </div>
        </div>
      </div>

      {/* Subtasks Section if present */}
      {totalSubtasks > 0 && (
        <div className="mt-3.5 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="inline-flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 font-medium"
            >
              <span>
                Subtugas ({completedSubtasks}/{totalSubtasks})
              </span>
              {showSubtasks ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="text-[11px] font-medium text-stone-400">
              {subtasksPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                subtasksPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${subtasksPercent}%` }}
            />
          </div>

          {/* Collapsible Subtasks Checklist */}
          {showSubtasks && (
            <div className="mt-2.5 space-y-1.5 pl-1 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60">
              {task.subtasks.map((st) => (
                <label
                  key={st.id}
                  className="flex items-center space-x-2 text-xs cursor-pointer select-none group/item"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="w-3.5 h-3.5 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span
                    className={`${
                      st.completed
                        ? 'line-through text-stone-400'
                        : 'text-stone-700 group-hover/item:text-stone-900'
                    }`}
                  >
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Footer: Deadline, Countdown & Google Calendar Sync Status */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Deadline & countdown badge */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-stone-500">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{formatIndonesianDate(task.dueDate)}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${deadline.badgeBg} ${deadline.badgeBorder}`}
          >
            {deadline.text}
          </span>
        </div>

        {/* Google Calendar Sync Indicator or 1-Click Sync */}
        <div className="flex items-center space-x-2">
          {task.isCalendarSynced || task.calendarEventId ? (
            <span
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
              title="Tersinkronisasi dengan Google Calendar Anda"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tersinkron Kalender</span>
            </span>
          ) : (
            <button
              onClick={() => onSyncToCalendar(task)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-600 hover:text-blue-700 bg-stone-100 hover:bg-blue-50 border border-stone-200 hover:border-blue-200 transition-all"
              title="Sinkronkan tugas ini ke Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>+ Kalender</span>
            </button>
          )}

          {/* Quick status cycle button */}
          <button
            onClick={() => {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                todo: 'in_progress',
                in_progress: 'completed',
                completed: 'todo',
              };
              onToggleStatus(task.id, nextStatus[task.status]);
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              task.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : task.status === 'in_progress'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            {task.status === 'completed'
              ? '✓ Selesai'
              : task.status === 'in_progress'
              ? '⚡ Sedang Jalan'
              : '⏳ To-Do'}
          </button>
        </div>
      </div>
    </div>
  );
};
