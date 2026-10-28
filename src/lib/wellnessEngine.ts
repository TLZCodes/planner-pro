/**
 * Pure Wellness Engine for AYXA Planner Pro
 * Handles hydration conversions, sleep duration crossing midnight,
 * insights aggregation, timezone-aware local date calculations,
 * and canonical wellness data structures.
 */

export type WaterUnit = "ml" | "oz";

export interface WellnessSettings {
  userId: string;
  waterUnit: WaterUnit;
  dailyWaterTarget: number; // in waterUnit (e.g. 2000 ml or 68 oz)
  defaultDrinkAmount: number; // in waterUnit (e.g. 250 ml or 8 oz)
  optionalStepGoal?: number; // e.g. 8000
  visibleCards: ("water" | "sleep" | "steps" | "mood" | "energy" | "care")[];
  sourcePreference?: "manual" | "imported";
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_WELLNESS_SETTINGS: WellnessSettings = {
  userId: "default",
  waterUnit: "ml",
  dailyWaterTarget: 2000,
  defaultDrinkAmount: 250,
  optionalStepGoal: 8000,
  visibleCards: ["water", "sleep", "steps", "mood", "energy", "care"],
  sourcePreference: "manual",
  timezone: "UTC",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export type HydrationSourceType = "manual" | "habit" | "routine" | "selfcare";

export interface HydrationEvent {
  id: string;
  userId: string;
  localDate: string; // YYYY-MM-DD in local time
  amount: number; // in user unit or logged unit
  unit: WaterUnit;
  normalizedMillilitres: number; // canonical ml representation for consistent math
  occurredAt: string; // ISO timestamp
  timezone: string;
  sourceType: HydrationSourceType;
  sourceId?: string; // e.g. habitId or routineStepId
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SleepRecord {
  id: string;
  userId: string;
  startAt?: string; // ISO timestamp (e.g. 2026-10-15T23:30:00Z)
  endAt?: string; // ISO timestamp (e.g. 2026-10-16T07:15:00Z)
  durationMinutes: number; // e.g. 465 min (7h 45m)
  sleepLocalDate: string; // YYYY-MM-DD (documented wake-up date)
  quality?: 1 | 2 | 3 | 4 | 5; // 1: Poor, 3: Fair, 4: Good, 5: Restful
  note?: string;
  sourceType: "manual" | "apple_health" | "health_connect";
  externalSourceId?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStepRecord {
  userId: string;
  localDate: string; // YYYY-MM-DD
  stepCount: number;
  sourceType: "manual" | "apple_health" | "health_connect";
  externalSourceId?: string;
  lastSyncedAt?: string;
  timezone: string;
}

export type WorkoutActivityType =
  | "walking"
  | "running"
  | "strength_training"
  | "pilates"
  | "stretching"
  | "cycling"
  | "swimming"
  | "yoga"
  | "other";

export interface WorkoutLog {
  id: string;
  userId: string;
  localDate: string; // YYYY-MM-DD
  activityType: WorkoutActivityType;
  startAt?: string;
  durationMinutes: number;
  intensity?: "gentle" | "moderate" | "intense";
  distance?: number; // km or miles
  steps?: number;
  calories?: number; // strictly optional, never fabricated
  note?: string;
  sourceType: "manual" | "habit" | "routine" | "task" | "focus" | "apple_health" | "health_connect";
  sourceId?: string;
  externalSourceId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CareActivityLink {
  id: string;
  userId: string;
  sourceType: "selfcare" | "habit" | "routine" | "task";
  sourceId: string;
  title: string;
  emoji: string;
  wellnessDisplayEnabled: boolean;
  createdAt: string;
}

export interface HealthConnection {
  userId: string;
  provider: "apple_health" | "health_connect";
  status: "not_supported" | "not_connected" | "connected" | "permission_denied";
  enabledMetrics: ("steps" | "sleep" | "workouts")[];
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Unit Conversions ─────────────────────────────────────────────────────────

export const ML_PER_FL_OZ = 29.5735;

export function convertMlToOz(ml: number): number {
  return Math.round((ml / ML_PER_FL_OZ) * 10) / 10;
}

export function convertOzToMl(oz: number): number {
  return Math.round(oz * ML_PER_FL_OZ);
}

// ── Timezone-Aware Local Date Calculation ────────────────────────────────────

/**
 * Returns a consistent local calendar date string (YYYY-MM-DD).
 * Avoids UTC boundary drift from simple toISOString().slice(0, 10).
 */
export function getLocalDateStr(date: Date = new Date(), timezone?: string): string {
  if (timezone && timezone !== "UTC") {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(date);
    } catch {
      // Fallback to local time if timezone is invalid
    }
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── Hydration Calculations ───────────────────────────────────────────────────

export interface DailyHydrationSummary {
  consumedMl: number;
  consumedInUserUnit: number;
  targetInUserUnit: number;
  targetMl: number;
  unit: WaterUnit;
  percentage: number;
  cupEquivalents: number;
  targetCups: number;
  remainingInUserUnit: number;
  isTargetReached: boolean;
  activeEvents: HydrationEvent[];
}

export function calculateDailyHydration(
  events: HydrationEvent[],
  target: number, // in user unit
  defaultCupAmount: number, // in user unit
  unit: WaterUnit,
  targetDate: string
): DailyHydrationSummary {
  const activeEvents = events.filter(
    (e) => e.localDate === targetDate && !e.deletedAt
  );

  const consumedMl = activeEvents.reduce((acc, e) => acc + (e.normalizedMillilitres || 0), 0);
  const consumedInUserUnit =
    unit === "oz" ? convertMlToOz(consumedMl) : consumedMl;

  const targetMl = unit === "oz" ? convertOzToMl(target) : target;
  const targetInUserUnit = target;

  const percentage =
    targetInUserUnit > 0 ? Math.min(100, Math.round((consumedInUserUnit / targetInUserUnit) * 100)) : 0;

  const cupSize = defaultCupAmount > 0 ? defaultCupAmount : (unit === "oz" ? 8 : 250);
  const cupEquivalents = Math.floor(consumedInUserUnit / cupSize);
  const targetCups = Math.max(1, Math.round(targetInUserUnit / cupSize));

  const remainingInUserUnit = Math.max(0, targetInUserUnit - consumedInUserUnit);
  const isTargetReached = consumedInUserUnit >= targetInUserUnit && targetInUserUnit > 0;

  return {
    consumedMl,
    consumedInUserUnit,
    targetInUserUnit,
    targetMl,
    unit,
    percentage,
    cupEquivalents,
    targetCups,
    remainingInUserUnit,
    isTargetReached,
    activeEvents,
  };
}

// ── Sleep Calculations ───────────────────────────────────────────────────────

/**
 * Calculates sleep duration in minutes, correctly handling sleep crossing midnight.
 */
export function calculateSleepDuration(startAt?: string, endAt?: string): number {
  if (!startAt || !endAt) return 0;
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;

  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Formats duration in minutes to human readable string (e.g. "7h 45m" or "7 س 45 د").
 */
export function formatSleepDuration(minutes: number, isAr: boolean = false): string {
  if (minutes <= 0) return isAr ? "غير مسجل" : "Not logged";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return isAr ? `${m} دقيقة` : `${m}m`;
  if (m === 0) return isAr ? `${h} ساعات` : `${h}h`;
  return isAr ? `${h} س ${m} د` : `${h}h ${m}m`;
}

// ── Workout Types & Helpers ─────────────────────────────────────────────────

export const WORKOUT_TYPES: {
  key: WorkoutActivityType;
  labelEn: string;
  labelAr: string;
  emoji: string;
}[] = [
  { key: "walking", labelEn: "Walking", labelAr: "المشي 🚶‍♀️", emoji: "🚶‍♀️" },
  { key: "running", labelEn: "Running", labelAr: "الجري 🏃‍♀️", emoji: "🏃‍♀️" },
  { key: "pilates", labelEn: "Pilates", labelAr: "بيلاتس 🧘‍♀️", emoji: "🧘‍♀️" },
  { key: "stretching", labelEn: "Stretching & Mobility", labelAr: "إطالة ومرونة 🤸‍♀️", emoji: "🤸‍♀️" },
  { key: "strength_training", labelEn: "Strength Training", labelAr: "تمارين مقاومة 💪", emoji: "💪" },
  { key: "yoga", labelEn: "Yoga", labelAr: "يوغا 🌸", emoji: "🌸" },
  { key: "cycling", labelEn: "Cycling", labelAr: "ركوب الدراجة 🚴‍♀️", emoji: "🚴‍♀️" },
  { key: "swimming", labelEn: "Swimming", labelAr: "السباحة 🏊‍♀️", emoji: "🏊‍♀️" },
  { key: "other", labelEn: "Other Movement", labelAr: "نشاط حركي آخر ✨", emoji: "✨" },
];

// ── Gentle Wellness Insights ────────────────────────────────────────────────

export interface WellnessInsights {
  rangeDays: number;
  waterLoggedDays: number;
  waterTargetDays: number;
  averageWaterPerLoggedDay: number;
  waterUnit: WaterUnit;
  sleepLoggedDays: number;
  averageSleepMinutes: number;
  movementDays: number;
  totalWorkoutMinutes: number;
  moodCount: number;
  topMood?: string;
  hasEnoughData: boolean;
}

export function calculateWellnessInsights(
  events: HydrationEvent[],
  sleepRecords: SleepRecord[],
  workouts: WorkoutLog[],
  moods: Record<string, { mood: string; energy?: string }>,
  waterTargetMl: number,
  waterUnit: WaterUnit,
  rangeDays: number = 7,
  referenceDate: Date = new Date(),
  timezone?: string
): WellnessInsights {
  const dates: string[] = [];
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    dates.push(getLocalDateStr(d, timezone));
  }

  // Hydration aggregations
  let waterLoggedDays = 0;
  let waterTargetDays = 0;
  let totalWaterConsumed = 0;

  dates.forEach((dateStr) => {
    const dayEvents = events.filter((e) => e.localDate === dateStr && !e.deletedAt);
    if (dayEvents.length > 0) {
      waterLoggedDays++;
      const sumMl = dayEvents.reduce((acc, e) => acc + (e.normalizedMillilitres || 0), 0);
      const consumedInUnit = waterUnit === "oz" ? convertMlToOz(sumMl) : sumMl;
      totalWaterConsumed += consumedInUnit;

      const targetInUnit = waterUnit === "oz" ? convertMlToOz(waterTargetMl) : waterTargetMl;
      if (consumedInUnit >= targetInUnit && targetInUnit > 0) {
        waterTargetDays++;
      }
    }
  });

  const averageWaterPerLoggedDay =
    waterLoggedDays > 0 ? Math.round(totalWaterConsumed / waterLoggedDays) : 0;

  // Sleep aggregations
  let sleepLoggedDays = 0;
  let totalSleepMinutes = 0;

  dates.forEach((dateStr) => {
    const daySleep = sleepRecords.find((s) => s.sleepLocalDate === dateStr);
    if (daySleep && daySleep.durationMinutes > 0) {
      sleepLoggedDays++;
      totalSleepMinutes += daySleep.durationMinutes;
    }
  });

  const averageSleepMinutes =
    sleepLoggedDays > 0 ? Math.round(totalSleepMinutes / sleepLoggedDays) : 0;

  // Workouts aggregations
  let movementDays = 0;
  let totalWorkoutMinutes = 0;

  dates.forEach((dateStr) => {
    const dayWorkouts = workouts.filter((w) => w.localDate === dateStr && !w.deletedAt);
    if (dayWorkouts.length > 0) {
      movementDays++;
      totalWorkoutMinutes += dayWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
    }
  });

  // Mood aggregations
  const moodCounts: Record<string, number> = {};
  let moodCount = 0;

  dates.forEach((dateStr) => {
    const m = moods[dateStr];
    if (m && m.mood) {
      moodCount++;
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    }
  });

  let topMood: string | undefined = undefined;
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topMood = mood;
    }
  });

  const hasEnoughData = waterLoggedDays > 0 || sleepLoggedDays > 0 || movementDays > 0 || moodCount > 0;

  return {
    rangeDays,
    waterLoggedDays,
    waterTargetDays,
    averageWaterPerLoggedDay,
    waterUnit,
    sleepLoggedDays,
    averageSleepMinutes,
    movementDays,
    totalWorkoutMinutes,
    moodCount,
    topMood,
    hasEnoughData,
  };
}
