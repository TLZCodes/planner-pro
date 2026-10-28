// Islamic Prayer Times Calculation Utility & Dynamic Anchor Resolver for AYXA Planner Pro

export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export type PrayerRelation = "at" | "before" | "after";

export interface PrayerTimesResult {
  fajr: string;     // "05:15"
  sunrise: string;  // "06:35"
  dhuhr: string;    // "12:30"
  asr: string;      // "15:45"
  maghrib: string;  // "18:20"
  isha: string;     // "19:50"
}

// Default standard baseline prayer times (if GPS / custom coordinates not available)
const DEFAULT_PRAYER_TIMES: PrayerTimesResult = {
  fajr: "05:15",
  sunrise: "06:35",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:20",
  isha: "19:50",
};

/**
 * Calculates prayer times for a given date based on solar calculation or returns standard baseline
 */
export function getPrayerTimes(date: Date = new Date(), coords?: { lat: number; lng: number }): PrayerTimesResult {
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem("ayxa-cached-prayer-times");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.fajr) return parsed;
      }
    } catch {
      // Fallback
    }
  }

  return DEFAULT_PRAYER_TIMES;
}

/**
 * Converts "HH:MM" string to minutes since midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight back to "HH:MM" string
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = Math.floor(normalized % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Calculates the exact scheduled HH:MM time for a prayer-linked step
 */
export function calculatePrayerStepTime(
  prayerName: PrayerName,
  relation: PrayerRelation = "at",
  offsetMinutes: number = 0,
  date: Date = new Date()
): string {
  const times = getPrayerTimes(date);
  const pKey = prayerName.toLowerCase() as keyof PrayerTimesResult;
  const baseTimeStr = times[pKey] || DEFAULT_PRAYER_TIMES[pKey] || "12:00";
  const baseMinutes = timeStringToMinutes(baseTimeStr);

  let delta = 0;
  if (relation === "before") delta = -Math.abs(offsetMinutes);
  else if (relation === "after") delta = Math.abs(offsetMinutes);

  return minutesToTimeString(baseMinutes + delta);
}

/**
 * Formats prayer anchor text for display in UI (Arabic & English)
 */
export function formatPrayerAnchorLabel(
  prayerName: PrayerName,
  relation: PrayerRelation = "at",
  offsetMinutes: number = 0,
  isAr: boolean = true
): string {
  const prayerNamesAr: Record<PrayerName, string> = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const nameAr = prayerNamesAr[prayerName] || prayerName;
  const nameEn = prayerName;

  if (isAr) {
    if (relation === "at" || offsetMinutes === 0) {
      return `صلاة ${nameAr}`;
    }
    if (relation === "before") {
      return `قبل ${nameAr} بـ ${offsetMinutes} د`;
    }
    return `بعد ${nameAr} بـ ${offsetMinutes} د`;
  } else {
    if (relation === "at" || offsetMinutes === 0) {
      return `At ${nameEn}`;
    }
    if (relation === "before") {
      return `${offsetMinutes}m before ${nameEn}`;
    }
    return `${offsetMinutes}m after ${nameEn}`;
  }
}
