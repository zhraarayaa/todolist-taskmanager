export function formatIndonesianDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export interface DeadlineStatus {
  text: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean; // within 48 hours
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function getDeadlineStatus(dueDateIso: string, isCompleted: boolean): DeadlineStatus {
  if (isCompleted) {
    return {
      text: 'Selesai',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      badgeBg: 'bg-emerald-50 text-emerald-700',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
    };
  }

  const now = new Date().getTime();
  const due = new Date(dueDateIso).getTime();

  if (isNaN(due)) {
    return {
      text: 'Tidak ada tenggat',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
      badgeBg: 'bg-stone-100 text-stone-600',
      badgeText: 'text-stone-600',
      badgeBorder: 'border-stone-200',
    };
  }

  const diffMs = due - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    const text =
      absHours < 24
        ? `Terlambat ${absHours} jam`
        : `Terlambat ${absDays} hari`;
    return {
      text,
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
      badgeBg: 'bg-rose-50 text-rose-700',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
    };
  }

  if (diffHours < 3) {
    return {
      text: diffHours <= 0 ? 'Kurang dari 1 jam lagi!' : `${diffHours} jam lagi!`,
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      badgeBg: 'bg-rose-100 text-rose-800 animate-pulse',
      badgeText: 'text-rose-800',
      badgeBorder: 'border-rose-300',
    };
  }

  if (diffHours < 24) {
    return {
      text: `Hari ini (${diffHours} jam lagi)`,
      isOverdue: false,
      isDueToday: true,
      isDueSoon: true,
      badgeBg: 'bg-amber-100 text-amber-900',
      badgeText: 'text-amber-900',
      badgeBorder: 'border-amber-300',
    };
  }

  if (diffDays === 1 || diffHours < 48) {
    return {
      text: 'Besok',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
      badgeBg: 'bg-orange-50 text-orange-800',
      badgeText: 'text-orange-800',
      badgeBorder: 'border-orange-200',
    };
  }

  return {
    text: `${diffDays} hari lagi`,
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
    badgeBg: 'bg-stone-100 text-stone-700',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
  };
}
