import React, { useState } from 'react';
import { Course, Task } from '../types';
import {
  X,
  BookOpen,
  User,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  tasks: Task[];
  onSelectCourseFilter: (courseId: string) => void;
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courses,
  tasks,
  onSelectCourseFilter,
  onSaveCourse,
  onDeleteCourse,
}) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for adding/editing
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [sks, setSks] = useState<number>(3);
  const [lecturer, setLecturer] = useState('');
  const [color, setColor] = useState('#2563eb');

  const totalSks = courses.reduce((sum, c) => sum + (c.sks || 0), 0);

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setIsAddingNew(false);
    setCode(course.code);
    setName(course.name);
    setSks(course.sks);
    setLecturer(course.lecturer);
    setColor(course.color);
  };

  const startAddNew = () => {
    setEditingCourse(null);
    setIsAddingNew(true);
    setCode('');
    setName('');
    setSks(3);
    setLecturer('');
    setColor('#2563eb');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const courseData: Course = {
      id: editingCourse ? editingCourse.id : `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      sks: Number(sks) || 1,
      lecturer: lecturer.trim() || 'Dosen Pengampu',
      color: color,
      bgLight: '#f8fafc',
      borderLight: '#e2e8f0',
    };

    onSaveCourse(courseData);
    setEditingCourse(null);
    setIsAddingNew(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Daftar Mata Kuliah & Dosen Pengampu
              </h2>
              <p className="text-xs text-stone-500">
                Total {courses.length} Mata Kuliah • {totalSks} SKS Terdaftar
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Add / Edit Form Card */}
          {(isAddingNew || editingCourse) && (
            <form
              onSubmit={handleSave}
              className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3 mb-4"
            >
              <h3 className="text-sm font-bold text-amber-900">
                {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Kode MK
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: TI645846"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Mata Kuliah..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Jumlah SKS
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    placeholder="Nama dan gelar dosen..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingCourse(null);
                  }}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/60 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  Simpan Mata Kuliah
                </button>
              </div>
            </form>
          )}

          {/* List of Courses Grid */}
          <div className="space-y-2.5">
            {courses.map((course, index) => {
              const courseTasks = tasks.filter((t) => t.courseId === course.id);
              const pendingCount = courseTasks.filter((t) => t.status !== 'completed').length;

              return (
                <div
                  key={course.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                          {course.code}
                        </span>
                        <h4 className="text-sm font-semibold text-stone-900">
                          {course.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                          {course.sks} SKS
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-stone-600">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{course.lecturer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & stats */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <span
                      className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                        pendingCount > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {pendingCount} tugas aktif
                    </span>

                    <button
                      onClick={() => {
                        onSelectCourseFilter(course.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg transition-colors"
                      title="Filter tugas untuk mata kuliah ini"
                    >
                      Lihat Tugas
                    </button>

                    <button
                      onClick={() => startEdit(course)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <button
            onClick={startAddNew}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </button>

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
