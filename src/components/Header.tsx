import React from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  Plus,
  BookOpen,
  LogOut,
  RefreshCw,
  Sparkles,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenTaskModal: () => void;
  onOpenCoursesModal: () => void;
  onOpenSyncModal: () => void;
  onExportBackup: () => void;
  coursesCount: number;
  totalSks: number;
  totalTasks: number;
  completedTasks: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  onOpenTaskModal,
  onOpenCoursesModal,
  onOpenSyncModal,
  onExportBackup,
  coursesCount,
  totalSks,
  totalTasks,
  completedTasks,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & App Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-display">
                  Tugas<span className="text-amber-600">Ku</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  Semester Genap
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Organizer Tugas Kuliah & Pengingat Kalender
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Courses summary button */}
            <button
              onClick={onOpenCoursesModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-sm transition-all"
              title="Daftar Mata Kuliah & Dosen"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Mata Kuliah</span>
              <span className="px-1.5 py-0.5 text-xs bg-stone-100 text-stone-700 font-semibold rounded-md border border-stone-200">
                {coursesCount} MK ({totalSks} SKS)
              </span>
            </button>

            {/* Google Calendar Sync & Auth Status */}
            {user ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={onOpenSyncModal}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Google Kalender</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </button>
                <div className="hidden lg:flex items-center space-x-2 pl-1 pr-2 py-1 bg-stone-100 rounded-full border border-stone-200 text-xs">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate text-stone-700 font-medium">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={onLogout}
                    title="Keluar dari Google"
                    className="p-1 hover:text-rose-600 text-stone-400 rounded-full transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 shadow-sm hover:shadow transition-all disabled:opacity-50"
                title="Hubungkan akun Google untuk sinkronisasi otomatis kalender"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.29 21.48 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.29 2.52 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingIn ? 'Menghubungkan...' : 'Sinkron Kalender'}
                </span>
              </button>
            )}

            {/* Add Task Primary Action Button */}
            <button
              onClick={onOpenTaskModal}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/25 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
