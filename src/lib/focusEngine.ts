/**
 * Canonical Focus & Pomodoro Engine — AYXA Planner Pro
 * Single source of truth for timer states, timestamp math, background recovery,
 * presets, and statistics across Focus, Learning, Tasks, Goals, and Home.
 */

export type FocusMode = "pomodoro" | "timer" | "stopwatch";
export type FocusPhaseType = "focus" | "short_break" | "long_break";
export type FocusSessionStatus =
  | "idle"
  | "running"
  | "active"
  | "paused"
  | "break_running"
  | "break_paused"
  | "awaiting_next_phase"
  | "completed"
  | "cancelled";

export type FocusSourceType = "task" | "subject" | "goal" | "business" | "learning" | "free";

export interface FocusSession {
  id: string;
  userId: string;
  mode: FocusMode;
  status: FocusSessionStatus;
  phase: FocusPhaseType;
  sourceType: FocusSourceType;
  sourceId?: string;
  sourceLabelSnapshot: string;
  presetId?: string;
  plannedFocusSeconds: number;
  plannedShortBreakSeconds: number;
  plannedLongBreakSeconds: number;
  plannedCycles: number;
  currentCycle: number;
  startedAt: string; // ISO string
  plannedEndAt?: string; // ISO string
  endedAt?: string; // ISO string
  completedAt?: string; // alias to endedAt
  durationMinutes?: number;
  pausedAt?: string; // ISO string
  totalPausedSeconds: number;
  actualFocusSeconds: number;
  actualBreakSeconds: number;
  completionType?: "completed" | "early" | "cancelled" | "manual";
  isManual?: boolean;
  localDate: string; // YYYY-MM-DD
  focusRating?: number; // 1-5
  privateNote?: string;
  ambientSoundId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusPreset {
  id: string;
  nameEn: string;
  nameAr: string;
  mode: FocusMode;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  totalCycles: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  isBuiltIn: boolean;
}

export const DEFAULT_FOCUS_PRESETS: FocusPreset[] = [
  {
    id: "gentle_start",
    nameEn: "Gentle Start",
    nameAr: "بداية هادئة",
    mode: "pomodoro",
    focusMinutes: 15,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
    totalCycles: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    isBuiltIn: true,
  },
  {
    id: "classic_pomodoro",
    nameEn: "Classic Pomodoro",
    nameAr: "بومودورو الكلاسيكي",
    mode: "pomodoro",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
    totalCycles: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    isBuiltIn: true,
  },
  {
    id: "deep_work",
    nameEn: "Deep Work",
    nameAr: "عمل عميق",
    mode: "pomodoro",
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    cyclesBeforeLongBreak: 2,
    totalCycles: 3,
    autoStartBreaks: false,
    autoStartFocus: false,
    isBuiltIn: true,
  },
  {
    id: "long_focus",
    nameEn: "Long Focus",
    nameAr: "تركيز طويل",
    mode: "pomodoro",
    focusMinutes: 90,
    shortBreakMinutes: 15,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 2,
    totalCycles: 2,
    autoStartBreaks: false,
    autoStartFocus: false,
    isBuiltIn: true,
  },
];

/**
 * Computes authoritative remaining or elapsed seconds and progress percentage
 * based on absolute wall-clock timestamps and accumulated paused duration.
 */
export function computeFocusRemainingOrElapsed(
  session: FocusSession,
  nowMs: number = Date.now()
): {
  secondsLeft: number;
  elapsedSeconds: number;
  totalPlannedSeconds: number;
  progressPct: number;
  isExpired: boolean;
} {
  const startMs = new Date(session.startedAt).getTime();
  const isPaused = session.status === "paused" || session.status === "break_paused";

  // If paused, the reference current time is when it was paused
  const referenceMs = isPaused && session.pausedAt
    ? new Date(session.pausedAt).getTime()
    : nowMs;

  const totalPausedMs = (session.totalPausedSeconds || 0) * 1000;
  // Raw elapsed seconds since phase start excluding paused gaps
  const elapsedSeconds = Math.max(0, Math.floor((referenceMs - startMs - totalPausedMs) / 1000));

  if (session.mode === "stopwatch") {
    // Stopwatch counts UP indefinitely (capped safely at 12 hours)
    const cappedElapsed = Math.min(12 * 3600, elapsedSeconds);
    return {
      secondsLeft: cappedElapsed,
      elapsedSeconds: cappedElapsed,
      totalPlannedSeconds: cappedElapsed,
      progressPct: 100,
      isExpired: false,
    };
  }

  // Determine current phase planned duration
  let plannedDuration = session.plannedFocusSeconds;
  if (session.phase === "short_break") {
    plannedDuration = session.plannedShortBreakSeconds;
  } else if (session.phase === "long_break") {
    plannedDuration = session.plannedLongBreakSeconds;
  }

  const safePlanned = Math.max(1, plannedDuration);
  const secondsLeft = Math.max(0, safePlanned - elapsedSeconds);
  const progressPct = Math.min(100, Math.max(0, Math.round(((safePlanned - secondsLeft) / safePlanned) * 100)));
  const isExpired = secondsLeft === 0;

  return {
    secondsLeft,
    elapsedSeconds: Math.min(safePlanned, elapsedSeconds),
    totalPlannedSeconds: safePlanned,
    progressPct,
    isExpired,
  };
}

/**
 * Formats integer seconds into MM:SS (or H:MM:SS if >= 1 hour).
 */
export function formatSecondsToTime(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats minutes into localized human readable string e.g. "2h 15m" or "2 س 15 د".
 */
export function formatFocusDuration(minutes: number, isAr: boolean): string {
  const safeMins = Math.max(0, Math.round(minutes));
  const h = Math.floor(safeMins / 60);
  const m = safeMins % 60;

  if (h > 0 && m > 0) {
    return isAr ? `${h} س ${m} د` : `${h}h ${m}m`;
  }
  if (h > 0) {
    return isAr ? `${h} س` : `${h}h`;
  }
  return isAr ? `${m} د` : `${m}m`;
}

/**
 * Returns Monday of current week in YYYY-MM-DD format.
 */
export function getWeekStartKey(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

/**
 * Aggregate canonical Focus statistics.
 * Excludes pauses and break times, and ignores discarded/cancelled sessions.
 */
export function aggregateFocusStatistics(
  sessions: FocusSession[] = [],
  todayKeyStr: string,
  weekStartKeyStr: string = getWeekStartKey()
) {
  // Valid sessions are completed or early finished with recorded focus time
  const validSessions = sessions.filter(
    (s) => (s.status === "completed" || s.completionType === "completed" || s.completionType === "early" || s.isManual) &&
      (s.actualFocusSeconds > 0 || (s.plannedFocusSeconds > 0 && s.status === "completed"))
  );

  let todayFocusSeconds = 0;
  let weekFocusSeconds = 0;
  let totalCompletedSessions = 0;
  const categoryCounts: Record<string, number> = {};
  const categorySeconds: Record<string, number> = {};

  for (const s of validSessions) {
    const focusSec = s.actualFocusSeconds || s.plannedFocusSeconds || 0;
    const cat = s.sourceType || "free";

    if (s.localDate === todayKeyStr) {
      todayFocusSeconds += focusSec;
    }
    if (s.localDate >= weekStartKeyStr) {
      weekFocusSeconds += focusSec;
    }
    if (s.status === "completed" || s.completionType === "completed" || s.completionType === "early") {
      totalCompletedSessions++;
    }

    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    categorySeconds[cat] = (categorySeconds[cat] || 0) + focusSec;
  }

  // Determine top category
  let topCategory: FocusSourceType = "free";
  let maxSec = -1;
  for (const [cat, sec] of Object.entries(categorySeconds)) {
    if (sec > maxSec) {
      maxSec = sec;
      topCategory = cat as FocusSourceType;
    }
  }

  return {
    todayFocusMinutes: Math.round(todayFocusSeconds / 60),
    weekFocusMinutes: Math.round(weekFocusSeconds / 60),
    totalCompletedSessions,
    topCategory,
    categorySeconds,
    validSessions,
  };
}
