import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Task, Course, Priority, TaskStatus, FilterOptions } from './types';
import { StorageService } from './services/storage';
import {
  initAuth,
  googleSignIn,
  logout as authLogout,
  getAccessToken,
} from './services/auth';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from './services/calendar';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { CourseModal } from './components/CourseModal';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { KanbanBoard } from './components/KanbanBoard';
import { BackupModal } from './components/BackupModal';
import {
  Sparkles,
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  HardDrive,
  Info,
  CalendarDays,
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Filter & Search states
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    priority: 'all',
    status: 'all',
    courseId: 'all',
    sortBy: 'dueDate_asc',
  });
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load initial data from localStorage
  const loadData = () => {
    const loadedTasks = StorageService.getTasks();
    const loadedCourses = StorageService.getCourses();
    setTasks(loadedTasks);
    setCourses(loadedCourses);
  };

  useEffect(() => {
    loadData();

    // Listen for Firebase auth state changes
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Save tasks on changes
  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  // Save courses on changes
  const updateCoursesState = (newCourses: Course[]) => {
    setCourses(newCourses);
    StorageService.saveCourses(newCourses);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        showToast(`Berhasil login sebagai ${result.user.displayName || result.user.email}!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal login dengan Google', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Logout
  const handleGoogleLogout = async () => {
    try {
      await authLogout();
      setUser(null);
      showToast('Berhasil keluar dari akun Google', 'info');
    } catch (err: any) {
      showToast(err.message || 'Gagal logout', 'error');
    }
  };

  // Task creation or edit save handler
  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    syncToCalendar: boolean
  ) => {
    let calendarEventId = taskData.calendarEventId;
    let calendarHtmlLink = taskData.calendarHtmlLink;
    let isCalendarSynced = taskData.isCalendarSynced;

    // Try Google Calendar sync if requested
    if (syncToCalendar) {
      const token = await getAccessToken();
      if (token) {
        try {
          const tempTask: Task = {
            ...taskData,
            id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
            createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          if (calendarEventId) {
            const calResult = await updateGoogleCalendarEvent(calendarEventId, tempTask, token);
            calendarEventId = calResult.id;
            calendarHtmlLink = calResult.htmlLink;
            isCalendarSynced = true;
          } else {
            const calResult = await createGoogleCalendarEvent(tempTask, token);
            calendarEventId = calResult.id;
            calendarHtmlLink = calResult.htmlLink;
            isCalendarSynced = true;
          }
          showToast('Tugas tersimpan & disinkronkan ke Google Calendar!');
        } catch (calErr: any) {
          console.warn('Calendar sync error:', calErr);
          showToast(
            'Tugas disimpan lokal (Gagal sync ke Google Calendar: ' + calErr.message + ')',
            'info'
          );
        }
      } else if (syncToCalendar) {
        showToast(
          'Tugas disimpan lokal. Hubungkan akun Google untuk sinkronisasi otomatis kalender.',
          'info'
        );
      }
    }

    if (taskToEdit) {
      // Update existing task
      const updatedTasks = tasks.map((t) => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            ...taskData,
            calendarEventId,
            calendarHtmlLink,
            isCalendarSynced,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      updateTasksState(updatedTasks);
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        calendarEventId,
        calendarHtmlLink,
        isCalendarSynced,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateTasksState([newTask, ...tasks]);
      showToast('Tugas kuliah baru berhasil ditambahkan!');
    }
  };

  // Toggle task status
  const handleToggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    updateTasksState(updatedTasks);
  };

  // Toggle individual subtask checklist
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return {
          ...t,
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    updateTasksState(updatedTasks);
  };

  // Sync a single task to Google Calendar
  const handleSyncSingleTask = async (task: Task) => {
    let token = await getAccessToken();
    if (!token) {
      // Prompt user to sign in
      try {
        const result = await googleSignIn();
        if (result) {
          setUser(result.user);
          token = result.accessToken;
        } else {
          return;
        }
      } catch (err: any) {
        showToast(err.message || 'Gagal menghubungkan Google Calendar', 'error');
        return;
      }
    }

    try {
      let calResult;
      if (task.calendarEventId) {
        calResult = await updateGoogleCalendarEvent(task.calendarEventId, task, token!);
      } else {
        calResult = await createGoogleCalendarEvent(task, token!);
      }

      const updated = tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              calendarEventId: calResult.id,
              calendarHtmlLink: calResult.htmlLink,
              isCalendarSynced: true,
            }
          : t
      );
      updateTasksState(updated);
      showToast(`Tugas "${task.title}" tersinkron ke Google Calendar!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyinkronkan tugas', 'error');
    }
  };

  // Batch sync all tasks to Google Calendar
  const handleSyncAllTasks = async () => {
    let token = await getAccessToken();
    if (!token) {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        token = result.accessToken;
      } else {
        throw new Error('Silakan masuk dengan akun Google terlebih dahulu');
      }
    }

    setIsSyncingAll(true);
    let successCount = 0;

    try {
      const activeTasks = tasks.filter((t) => t.status !== 'completed');
      const updatedTasks = [...tasks];

      for (let i = 0; i < updatedTasks.length; i++) {
        const t = updatedTasks[i];
        if (t.status === 'completed') continue;

        try {
          if (t.calendarEventId) {
            const res = await updateGoogleCalendarEvent(t.calendarEventId, t, token!);
            updatedTasks[i] = { ...t, isCalendarSynced: true, calendarHtmlLink: res.htmlLink };
          } else {
            const res = await createGoogleCalendarEvent(t, token!);
            updatedTasks[i] = {
              ...t,
              calendarEventId: res.id,
              calendarHtmlLink: res.htmlLink,
              isCalendarSynced: true,
            };
          }
          successCount++;
        } catch (taskErr) {
          console.error('Failed syncing single task:', t.title, taskErr);
        }
      }

      updateTasksState(updatedTasks);
      showToast(`Berhasil menyinkronkan ${successCount} tugas ke Google Calendar!`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Delete task confirmation and execution
  const handleConfirmDelete = async (deleteFromGoogleCalendar: boolean) => {
    if (!taskToDelete) return;

    if (deleteFromGoogleCalendar && taskToDelete.calendarEventId) {
      const token = await getAccessToken();
      if (token) {
        try {
          await deleteGoogleCalendarEvent(taskToDelete.calendarEventId, token);
        } catch (calErr) {
          console.warn('Failed to delete Google Calendar event:', calErr);
        }
      }
    }

    const remainingTasks = tasks.filter((t) => t.id !== taskToDelete.id);
    updateTasksState(remainingTasks);
    showToast(`Tugas "${taskToDelete.title}" telah dihapus.`);
    setTaskToDelete(null);
  };

  // Course save handler
  const handleSaveCourse = (savedCourse: Course) => {
    const existingIndex = courses.findIndex((c) => c.id === savedCourse.id);
    let updatedCourses: Course[];
    if (existingIndex >= 0) {
      updatedCourses = courses.map((c) => (c.id === savedCourse.id ? savedCourse : c));
    } else {
      updatedCourses = [...courses, savedCourse];
    }
    updateCoursesState(updatedCourses);
    showToast(`Mata kuliah "${savedCourse.name}" tersimpan.`);
  };

  const handleDeleteCourse = (courseId: string) => {
    const courseToDelete = courses.find((c) => c.id === courseId);
    if (!courseToDelete) return;
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus mata kuliah ${courseToDelete.name}? Tugas terkait akan tetap tersimpan.`
      )
    ) {
      const remaining = courses.filter((c) => c.id !== courseId);
      updateCoursesState(remaining);
      showToast(`Mata kuliah "${courseToDelete.name}" telah dihapus.`);
    }
  };

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchCourse = task.courseName.toLowerCase().includes(q);
          const matchCode = task.courseCode.toLowerCase().includes(q);
          const matchLecturer = task.lecturer.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCourse && !matchCode && !matchLecturer) {
            return false;
          }
        }

        // Priority filter
        if (filters.priority !== 'all') {
          if (task.priority !== filters.priority) return false;
        }

        // Status filter
        if (filters.status !== 'all') {
          if (task.status !== filters.status) return false;
        }

        // Course filter
        if (filters.courseId !== 'all') {
          if (task.courseId !== filters.courseId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'dueDate_asc') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (filters.sortBy === 'dueDate_desc') {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (filters.sortBy === 'priority_desc') {
          const pOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return pOrder[b.priority] - pOrder[a.priority];
        }
        if (filters.sortBy === 'createdAt_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [tasks, filters]);

  // Priority count badges
  const taskCountsByPriority = useMemo(() => {
    const counts: Record<Priority, number> = { urgent: 0, high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => {
      if (t.status !== 'completed' && counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });
    return counts;
  }, [tasks]);

  const totalSks = courses.reduce((sum, c) => sum + (c.sks || 0), 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center space-x-2.5 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toast.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onOpenTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenCoursesModal={() => setIsCoursesModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onExportBackup={() => setIsBackupModalOpen(true)}
        coursesCount={courses.length}
        totalSks={totalSks}
        totalTasks={tasks.length}
        completedTasks={completedTasksCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Welcome Banner & Quick Action Buttons */}
        <div className="bg-gradient-to-r from-amber-900/90 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-6">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30 mb-3">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Daftar 10 Mata Kuliah & 23 SKS Aktif</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Manajemen Tugas Kuliah & Pengingat Deadline
            </h2>
            <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed">
              Pantau jadwal tugas kuliah, urutkan berdasarkan tingkat prioritas, dan
              sinkronkan alarm pengingat otomatis langsung ke kalender Google agar tidak ada
              deadline yang terlewat.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Buat Tugas Baru</span>
              </button>

              <button
                onClick={() => setIsCoursesModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>10 Mata Kuliah & Dosen</span>
              </button>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-300" />
                <span>Sinkronisasi Kalender</span>
              </button>
            </div>
          </div>

          {/* Decorative background shape */}
          <div className="absolute right-[-20px] top-[-30px] w-80 h-80 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
        </div>

        {/* Stats Overview Counters */}
        <StatsOverview
          tasks={tasks}
          onSelectFilter={(type) => {
            if (type === 'all') {
              setFilters((prev) => ({ ...prev, priority: 'all', status: 'all' }));
            } else if (type === 'urgent') {
              setFilters((prev) => ({ ...prev, priority: 'urgent', status: 'all' }));
            } else if (type === 'completed') {
              setFilters((prev) => ({ ...prev, priority: 'all', status: 'completed' }));
            } else if (type === 'dueSoon') {
              setFilters((prev) => ({ ...prev, sortBy: 'dueDate_asc', status: 'all' }));
            }
          }}
          activeFilterType={filters.priority === 'urgent' ? 'urgent' : filters.status === 'completed' ? 'completed' : 'all'}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          filters={filters}
          onChangeFilters={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          courses={courses}
          taskCountsByPriority={taskCountsByPriority}
          totalTasks={tasks.length}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
        />

        {/* Task List or Kanban Board */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 font-display">
              Tidak Ada Tugas yang Sesuai
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Tidak ditemukan tugas dengan filter atau kata kunci yang dipilih. Coba ubah
              filter atau tambahkan tugas kuliah baru.
            </p>
            <div className="mt-5 flex justify-center space-x-3">
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    priority: 'all',
                    status: 'all',
                    courseId: 'all',
                    sortBy: 'dueDate_asc',
                  })
                }
                className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              >
                Reset Filter
              </button>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors"
              >
                + Tambah Tugas
              </button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={(t) => setTaskToDelete(t)}
                onToggleStatus={handleToggleTaskStatus}
                onToggleSubtask={handleToggleSubtask}
                onSyncToCalendar={handleSyncSingleTask}
                isCalendarAuthenticated={Boolean(user)}
              />
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onEdit={(t) => {
              setTaskToEdit(t);
              setIsTaskModalOpen(true);
            }}
            onDelete={(t) => setTaskToDelete(t)}
            onToggleStatus={handleToggleTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onSyncToCalendar={handleSyncSingleTask}
            onAddNewWithStatus={(st) => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            isCalendarAuthenticated={Boolean(user)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/70 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-700 font-display">TugasKu</span>
            <span>•</span>
            <span>Organizer Tugas Kuliah & Sinkronisasi Google Calendar</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-stone-800 transition-colors flex items-center space-x-1"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Cadangan / Restore</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCoursesModalOpen(true)}
              className="hover:text-stone-800 transition-colors"
            >
              10 Mata Kuliah ({totalSks} SKS)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        courses={courses}
        isCalendarAuthenticated={Boolean(user)}
      />

      <CourseModal
        isOpen={isCoursesModalOpen}
        onClose={() => setIsCoursesModalOpen(false)}
        courses={courses}
        tasks={tasks}
        onSelectCourseFilter={(courseId) =>
          setFilters((prev) => ({ ...prev, courseId }))
        }
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
      />

      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
        tasks={tasks}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onSyncAllTasks={handleSyncAllTasks}
        isSyncingAll={isSyncingAll}
      />

      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReload={loadData}
      />
    </div>
  );
}
