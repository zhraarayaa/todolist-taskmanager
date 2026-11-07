import { Task } from '../types';

export interface CalendarEventResult {
  id: string;
  htmlLink: string;
}

/**
 * Format ISO datetime string to Google Calendar API RFC3339 format
 */
function getEventDates(dueDateIso: string) {
  const endDate = new Date(dueDateIso);
  // If invalid date, fallback to now + 1 day
  if (isNaN(endDate.getTime())) {
    const fallbackEnd = new Date();
    fallbackEnd.setDate(fallbackEnd.getDate() + 1);
    const fallbackStart = new Date(fallbackEnd.getTime() - 60 * 60 * 1000);
    return {
      start: { dateTime: fallbackStart.toISOString() },
      end: { dateTime: fallbackEnd.toISOString() },
    };
  }

  // Event starts 1 hour before due time or 30 mins before
  const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

  return {
    start: { dateTime: startDate.toISOString() },
    end: { dateTime: endDate.toISOString() },
  };
}

/**
 * Format task description and metadata for Google Calendar event body
 */
function buildEventPayload(task: Task) {
  const { start, end } = getEventDates(task.dueDate);

  const subtasksText =
    task.subtasks && task.subtasks.length > 0
      ? '\n\n📋 Subtugas / Checklist:\n' +
        task.subtasks.map((st) => `[${st.completed ? 'x' : ' '}] ${st.title}`).join('\n')
      : '';

  const priorityLabels: Record<string, string> = {
    urgent: '🔴 MENDESAK (Urgent)',
    high: '🟠 TINGGI (High)',
    medium: '🟡 SEDANG (Medium)',
    low: '🟢 RENDAH (Low)',
  };

  const description = [
    `🎓 TUGAS KULIAH: ${task.title}`,
    `----------------------------------------`,
    `📖 Mata Kuliah : ${task.courseName} (${task.courseCode})`,
    `👨‍🏫 Dosen Pengampu : ${task.lecturer}`,
    `⚡ Prioritas : ${priorityLabels[task.priority] || task.priority}`,
    `⏰ Tenggat Waktu : ${new Date(task.dueDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}`,
    `\n📝 Catatan Tugas:\n${task.description || 'Tidak ada deskripsi tambahan.'}`,
    subtasksText,
    `\n✨ Dibuat otomatis oleh TugasKu App`,
  ].join('\n');

  const reminderMinutes = task.reminderMinutesBefore || 120;

  return {
    summary: `[Tugas] ${task.title} - ${task.courseCode}`,
    description,
    start,
    end,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes }, // e.g., 2 hours before or custom
        { method: 'popup', minutes: 1440 }, // 1 day before
      ],
    },
    colorId: task.priority === 'urgent' ? '11' : task.priority === 'high' ? '6' : '7', // Red, Orange, or Peacock
  };
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  task: Task,
  accessToken: string
): Promise<CalendarEventResult> {
  const payload = buildEventPayload(task);

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Gagal membuat event kalender (Status: ${response.status})`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
  };
}

/**
 * Update an existing event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  task: Task,
  accessToken: string
): Promise<CalendarEventResult> {
  const payload = buildEventPayload(task);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Gagal memperbarui event kalender (Status: ${response.status})`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
  };
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  eventId: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Gagal menghapus event kalender (Status: ${response.status})`
    );
  }

  return true;
}

/**
 * Fallback: Generate one-click direct Google Calendar URL web intent
 * Opens calendar.google.com with prefilled details directly in browser
 */
export function generateGoogleCalendarWebUrl(task: Task): string {
  const endDate = new Date(task.dueDate);
  const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

  const formatCalTime = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const dates = `${formatCalTime(startDate)}/${formatCalTime(endDate)}`;
  const title = encodeURIComponent(`[Tugas] ${task.title} - ${task.courseCode}`);
  const details = encodeURIComponent(
    `Mata Kuliah: ${task.courseName} (${task.courseCode})\nDosen: ${task.lecturer}\nPrioritas: ${task.priority.toUpperCase()}\n\nDeskripsi:\n${task.description || ''}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

/**
 * Export all tasks or specific tasks as an .ics calendar file
 */
export function exportToIcsFile(tasks: Task[]): void {
  const formatIcsDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? new Date().toISOString().replace(/-|:|\.\d+/g, '') + 'Z'
      : d.toISOString().replace(/-|:|\.\d+/g, '') + 'Z';
  };

  const events = tasks.map((task) => {
    const end = new Date(task.dueDate);
    const start = new Date(end.getTime() - 60 * 60 * 1000);

    return [
      'BEGIN:VEVENT',
      `UID:${task.id}-${Date.now()}@tugasku.local`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(start.toISOString())}`,
      `DTEND:${formatIcsDate(end.toISOString())}`,
      `SUMMARY:[Tugas] ${task.title} - ${task.courseName}`,
      `DESCRIPTION:Dosen: ${task.lecturer}\\nPrioritas: ${task.priority}\\n${task.description.replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Pengingat Tugas: ${task.title}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TugasKu//Kalender Tugas Kuliah//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `jadwal-tugas-kuliah-${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
