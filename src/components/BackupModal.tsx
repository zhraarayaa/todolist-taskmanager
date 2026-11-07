import React, { useRef, useState } from 'react';
import { StorageService } from '../services/storage';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    StorageService.exportBackupJson();
    setStatusMessage({
      text: 'File cadangan JSON berhasil diunduh ke perangkat Anda!',
      isError: false,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await StorageService.importBackupJson(file);
    setStatusMessage({
      text: result.message,
      isError: !result.success,
    });

    if (result.success) {
      onDataReload();
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang data ke daftar 10 mata kuliah awal? Semua tugas baru yang belum dicadangkan akan direset.'
      )
    ) {
      StorageService.resetToDefault();
      onDataReload();
      setStatusMessage({
        text: 'Data telah direset kembali ke 10 mata kuliah dan tugas bawaan.',
        isError: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-stone-900">
                Penyimpanan & Cadangan
              </h2>
              <p className="text-xs text-stone-500">
                Simpan & pulihkan data to-do list tugas kuliah
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
        <div className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-2xl flex items-center space-x-3 text-left transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900">
                  Ekspor Cadangan (JSON)
                </p>
                <p className="text-[11px] text-stone-500">
                  Unduh seluruh daftar tugas dan mata kuliah ke file JSON
                </p>
              </div>
            </button>

            {/* Import Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-2xl flex items-center space-x-3 text-left transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900">
                  Impor Cadangan (JSON)
                </p>
                <p className="text-[11px] text-stone-500">
                  Pulihkan data tugas dari file cadangan komputer
                </p>
              </div>
            </button>

            {/* Reset to Default */}
            <button
              onClick={handleReset}
              className="w-full p-3.5 bg-stone-50 hover:bg-rose-50/50 border border-stone-200 hover:border-rose-200 rounded-2xl flex items-center space-x-3 text-left transition-all text-stone-700 hover:text-rose-700"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Reset Data Awal
                </p>
                <p className="text-[11px] text-stone-500">
                  Kembalikan 10 mata kuliah dan tugas perkuliahan default
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
