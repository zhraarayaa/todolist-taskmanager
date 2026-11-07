import { Task, Course } from '../types';
import { INITIAL_COURSES } from '../data/initialCourses';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEYS = {
  TASKS: 'tugasku_tasks_v1',
  COURSES: 'tugasku_courses_v1',
  THEME: 'tugasku_theme_v1',
};

export const StorageService = {
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading tasks from localStorage:', err);
      return INITIAL_TASKS;
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error saving tasks to localStorage:', err);
    }
  },

  getCourses(): Course[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading courses from localStorage:', err);
      return INITIAL_COURSES;
    }
  },

  saveCourses(courses: Course[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (err) {
      console.error('Error saving courses to localStorage:', err);
    }
  },

  exportBackupJson(): void {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      courses: this.getCourses(),
      tasks: this.getTasks(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tugasku-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importBackupJson(file: File): Promise<{ success: boolean; message: string; count?: number }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.courses)) {
            resolve({
              success: false,
              message: 'Format file cadangan tidak valid (harus memiliki tasks dan courses)',
            });
            return;
          }

          this.saveTasks(parsed.tasks);
          this.saveCourses(parsed.courses);
          resolve({
            success: true,
            message: `Berhasil mengimpor ${parsed.tasks.length} tugas dan ${parsed.courses.length} mata kuliah!`,
            count: parsed.tasks.length,
          });
        } catch (err: any) {
          resolve({
            success: false,
            message: 'Gagal membaca file JSON: ' + (err.message || 'Error tidak diketahui'),
          });
        }
      };
      reader.readAsText(file);
    });
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  },
};
