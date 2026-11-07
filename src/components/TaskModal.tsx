import React, { useState, useEffect } from 'react';
import { Task, Course, Priority, TaskStatus, SubTask } from '../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  BookOpen,
  AlertTriangle,
  Bell,
  Sparkles,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, syncToCalendar: boolean) => Promise<void>;
  taskToEdit?: Task | null;
  courses: Course[];
  isCalendarAuthenticated: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  courses,
  isCalendarAuthenticated,
}) => {
  const [title, setTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [lecturer, setLecturer] = useState(courses[0]?.lecturer || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(120); // 2 hours
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Set default due date to 3 days from now at 23:59
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T23:59`;
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSelectedCourseId(taskToEdit.courseId);
      setLecturer(taskToEdit.lecturer);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate);
      setDescription(taskToEdit.description || '');
      setSubtasks(taskToEdit.subtasks || []);
      setSyncToCalendar(taskToEdit.isCalendarSynced ?? true);
      setReminderMinutes(taskToEdit.reminderMinutesBefore || 120);
    } else {
      setTitle('');
      const defaultCourse = courses[0];
      setSelectedCourseId(defaultCourse?.id || '');
      setLecturer(defaultCourse?.lecturer || '');
      setPriority('medium');
      setStatus('todo');
      setDueDate(getDefaultDueDate());
      setDescription('');
      setSubtasks([]);
      setSyncToCalendar(true);
      setReminderMinutes(120);
    }
    setErrorMsg('');
  }, [taskToEdit, isOpen, courses]);

  // When course selection changes, update lecturer automatically
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const found = courses.find((c) => c.id === courseId);
    if (found) {
      setLecturer(found.lecturer);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul tugas tidak boleh kosong');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Tenggat waktu harus diisi');
      return;
    }

    const currentCourse = courses.find((c) => c.id === selectedCourseId) || {
      id: 'custom',
      code: 'MK-UMUM',
      name: 'Mata Kuliah',
      lecturer: lecturer,
    };

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave(
        {
          title: title.trim(),
          courseId: currentCourse.id,
          courseCode: currentCourse.code,
          courseName: currentCourse.name,
          lecturer: lecturer.trim() || currentCourse.lecturer,
          description: description.trim(),
          priority,
          status,
          dueDate,
          subtasks,
          reminderMinutesBefore: reminderMinutes,
          isCalendarSynced: taskToEdit?.isCalendarSynced,
          calendarEventId: taskToEdit?.calendarEventId,
          calendarHtmlLink: taskToEdit?.calendarHtmlLink,
        },
        syncToCalendar
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan tugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-xl font-bold font-display text-stone-900">
              {taskToEdit ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah Baru'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Lengkapi rincian tugas dan jadwal pengingat kalender
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Makalah Studi Kasus & Presentasi Bab 3"
              className="w-full px-4 py-2.5 text-sm bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-900 transition-all font-medium"
            />
          </div>

          {/* Course & Lecturer Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Mata Kuliah</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-800 cursor-pointer font-medium"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name} ({course.sks} SKS)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Dosen Pengampu</span>
              </label>
              <input
                type="text"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Nama Dosen..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-800"
              />
            </div>
          </div>

          {/* Priority Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Tingkat Prioritas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'urgent',
                  label: '🔴 Mendesak',
                  desc: 'Segera selesaikan',
                  activeClass: 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-400/20',
                },
                {
                  id: 'high',
                  label: '🟠 Tinggi',
                  desc: 'Penting & prioritas',
                  activeClass: 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-400/20',
                },
                {
                  id: 'medium',
                  label: '🟡 Sedang',
                  desc: 'Tugas berkala',
                  activeClass: 'border-yellow-400 bg-yellow-50 text-yellow-800 ring-2 ring-yellow-400/20',
                },
                {
                  id: 'low',
                  label: '🟢 Rendah',
                  desc: 'Santai / fleksibel',
                  activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400/20',
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPriority(p.id as Priority)}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    priority === p.id
                      ? p.activeClass
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100/70 text-stone-600'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold">{p.label}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Due Date & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Tenggat Waktu (Deadline) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-800 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Status Tugas
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-800 cursor-pointer font-medium"
              >
                <option value="todo">⏳ Belum Selesai (To-Do)</option>
                <option value="in_progress">⚡ Sedang Dikerjakan (In Progress)</option>
                <option value="completed">✓ Tuntas Selesai (Completed)</option>
              </select>
            </div>
          </div>

          {/* Subtasks / Checklist builder */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Subtugas / Langkah Pengerjaan
            </label>
            <div className="space-y-2 mb-2.5">
              {subtasks.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center space-x-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                >
                  <span className="w-5 text-stone-400 font-medium">{idx + 1}.</span>
                  <span className="flex-1 text-stone-800">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambah langkah, misal: 'Cari 3 jurnal referensi'..."
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-stone-800"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Catatan / Instruksi Tugas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instruksi pengumpulan, link e-learning, format file PDF, dsb..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-800 resize-none"
            />
          </div>

          {/* Google Calendar Automatic Sync & Reminder settings */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900">
                    Sinkronkan ke Google Kalender Otomatis
                  </h4>
                  <p className="text-[11px] text-blue-700">
                    Buat pengingat jadwal langsung di Google Calendar Anda
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToCalendar}
                  onChange={(e) => setSyncToCalendar(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {syncToCalendar && (
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-blue-800">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Waktu Pengingat Alarm:</span>
                </div>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs bg-white border border-blue-300 rounded-lg text-blue-900 font-medium cursor-pointer"
                >
                  <option value={30}>30 Menit sebelumnya</option>
                  <option value={60}>1 Jam sebelumnya</option>
                  <option value={120}>2 Jam sebelumnya (Rekomendasi)</option>
                  <option value={720}>12 Jam sebelumnya</option>
                  <option value={1440}>1 Hari (24 Jam) sebelumnya</option>
                </select>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{taskToEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
