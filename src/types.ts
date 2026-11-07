export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  lecturer: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

export interface Task {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DDTHH:mm
  subtasks: SubTask[];
  estimatedHours?: number;
  calendarEventId?: string;
  calendarHtmlLink?: string;
  isCalendarSynced?: boolean;
  reminderMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface FilterOptions {
  search: string;
  priority: Priority | 'all';
  status: TaskStatus | 'all';
  courseId: string | 'all';
  sortBy: 'dueDate_asc' | 'dueDate_desc' | 'priority_desc' | 'createdAt_desc';
}
