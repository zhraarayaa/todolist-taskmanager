import React, { useState } from 'react';
import { Task } from '../types';
import { AlertTriangle, Trash2, X, Calendar } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteFromGoogleCalendar: boolean) => Promise<void>;
  task: Task | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
}) => {
  const [deleteFromCalendar, setDeleteFromCalendar] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const isSynced = Boolean(task.calendarEventId || task.isCalendarSynced);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(isSynced && deleteFromCalendar);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-stone-900 font-display">
            Hapus Tugas Ini?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Apakah Anda yakin ingin menghapus tugas{' '}
            <strong className="text-stone-900">"{task.title}"</strong> untuk mata
            kuliah <strong className="text-stone-900">{task.courseName}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>

          {isSynced && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Hapus juga jadwal dari Google Kalender</span>
              </div>
              <input
                type="checkbox"
                checked={deleteFromCalendar}
                onChange={(e) => setDeleteFromCalendar(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Tugas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
