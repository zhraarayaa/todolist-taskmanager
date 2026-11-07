import React, { useState } from 'react';
import { Task } from '../types';
import { User } from 'firebase/auth';
import { exportToIcsFile } from '../services/calendar';
import {
  X,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Bell,
  Sparkles,
  Smartphone,
  LogOut,
} from 'lucide-react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  tasks: Task[];
  onLogin: () => void;
  onLogout: () => void;
  onSyncAllTasks: () => Promise<void>;
  isSyncingAll: boolean;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  tasks,
  onLogin,
  onLogout,
  onSyncAllTasks,
  isSyncingAll,
}) => {
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const syncedCount = tasks.filter((t) => t.isCalendarSynced || t.calendarEventId).length;
  const unsyncedCount = tasks.length - syncedCount;

  const handleSyncAll = async () => {
    setSyncStatusMsg('');
    try {
      await onSyncAllTasks();
      setSyncStatusMsg('Semua tugas berhasil disinkronkan ke Google Calendar!');
    } catch (err: any) {
      setSyncStatusMsg(err.message || 'Gagal menyinkronkan tugas');
    }
  };

  const handleExportIcs = () => {
    exportToIcsFile(tasks);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Integrasi Google Calendar
              </h2>
              <p className="text-xs text-stone-500">
                Sinkronisasi otomatis tenggat waktu tugas kuliah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Account Status Card */}
          <div className="p-4 rounded-2xl border bg-stone-50/80 border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-stone-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-stone-900">
                        {user.displayName || 'Pengguna Google'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Terhubung
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </>
              ) : (
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Google Calendar Belum Terhubung
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hubungkan akun Google untuk mengirim alarm pengingat tugas
                  </p>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Akun</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-sm transition-all"
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
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-center">
              <span className="text-2xl font-bold font-display text-blue-900">
                {syncedCount}
              </span>
              <p className="text-xs text-blue-700 font-medium mt-0.5">
                Tersinkron di Kalender
              </p>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-center">
              <span className="text-2xl font-bold font-display text-stone-800">
                {unsyncedCount}
              </span>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Belum Tersinkron
              </p>
            </div>
          </div>

          {syncStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {user ? (
              <button
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`}
                />
                <span>
                  {isSyncingAll
                    ? 'Sedang Menyinkronkan...'
                    : 'Sinkronkan Semua Tugas ke Google Calendar'}
                </span>
              </button>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Buka Google Kalender Web</span>
              </a>

              <button
                onClick={handleExportIcs}
                className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Unduh File Kalender (.ics)</span>
              </button>
            </div>
          </div>

          {/* Informational feature box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Bagaimana Pengingat Bekerja?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1 leading-relaxed">
              <li>
                Setiap tugas akan masuk ke kalender utama Google Anda dengan rincian
                lengkap mata kuliah dan dosen.
              </li>
              <li>
                Google Calendar otomatis menyalakan alarm notifikasi di HP Android/iPhone
                dan laptop 2 jam & 24 jam sebelum tenggat waktu.
              </li>
              <li>
                Jika belum login, Anda tetap dapat menggunakan tombol <strong>+ Kalender</strong>{' '}
                atau unduh file <strong>.ics</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
