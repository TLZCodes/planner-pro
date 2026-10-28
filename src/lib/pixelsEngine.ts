export type CanonicalMood = "happy" | "calm" | "okay" | "sad" | "anxious" | "tired" | "grateful";

export interface DailyMoodRecord {
  userId: string;
  localDate: string; // YYYY-MM-DD
  mood: CanonicalMood;
  energy?: "low" | "medium" | "high";
  updatedAt: string;
  lastSource: string;
}

export type MoodPaletteId = "default" | "vibrant" | "contrast" | "friendly";

export interface MoodDefinition {
  id: CanonicalMood;
  emoji: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  defaultColor: string;
  sortOrder: number;
}

export const CANONICAL_MOODS: MoodDefinition[] = [
  {
    id: "happy",
    emoji: "🌸",
    labelEn: "Peaceful & Blooming",
    labelAr: "سكينة وازدهار",
    descriptionEn: "Content, joyful, light-hearted, or at peace",
    descriptionAr: "شعور بالراحة، الفرح، الخفة، وانشراح الصدر",
    defaultColor: "#F472B6", // Rose 400
    sortOrder: 1,
  },
  {
    id: "calm",
    emoji: "✨",
    labelEn: "Serene & Grounded",
    labelAr: "هدوء واستقرار",
    descriptionEn: "Quiet, steady, relaxed, and clear-minded",
    descriptionAr: "سكينة، طمأنينة، وضوح، وتوازن داخلي",
    defaultColor: "#A78BFA", // Violet 400
    sortOrder: 2,
  },
  {
    id: "okay",
    emoji: "🍃",
    labelEn: "Gentle Balance",
    labelAr: "توازن هادئ",
    descriptionEn: "Neutral, everyday baseline, fine, or balanced",
    descriptionAr: "يوم عادي، مشاعر مستقرة، وتوازن طبيعي",
    defaultColor: "#34D399", // Emerald 400
    sortOrder: 3,
  },
  {
    id: "grateful",
    emoji: "🥰",
    labelEn: "Loved & Grateful",
    labelAr: "حب وامتنان",
    descriptionEn: "Deep appreciation, warmth, blessed, or loved",
    descriptionAr: "امتنان عميق، دفء، محبة، وشعور بالنعم",
    defaultColor: "#FBBF24", // Amber 400
    sortOrder: 4,
  },
  {
    id: "tired",
    emoji: "🌙",
    labelEn: "Needing Soft Rest",
    labelAr: "حاجة للراحة",
    descriptionEn: "Low energy, weary, sleepy, or drained",
    descriptionAr: "طاقة منخفضة، إرهاق خفيف، وحاجة للاسترخاء",
    defaultColor: "#94A3B8", // Slate 400
    sortOrder: 5,
  },
  {
    id: "anxious",
    emoji: "🌧️",
    labelEn: "Heavy / Overthinking",
    labelAr: "ثقل وتفكير زائد",
    descriptionEn: "Restless, overwhelmed, tense, or overthinking",
    descriptionAr: "توتر، تفكير مشتت، وضغط يحتاج إلى تفريغ",
    defaultColor: "#FB923C", // Orange 400
    sortOrder: 6,
  },
  {
    id: "sad",
    emoji: "🕊️",
    labelEn: "Healing & Tender",
    labelAr: "تعافٍ ورقة مشاعر",
    descriptionEn: "Grieving, tender, melancholy, or needing gentleness",
    descriptionAr: "حزن رقيق، شجن، ورغبة في اللطف والاحتواء",
    defaultColor: "#60A5FA", // Blue 400
    sortOrder: 7,
  },
];

export interface MoodPalette {
  id: MoodPaletteId;
  nameEn: string;
  nameAr: string;
  moodColors: Record<CanonicalMood, string>;
  emptyColor: string;
  futureColor: string;
  todayBorderColor: string;
}

export const MOOD_PALETTES: Record<MoodPaletteId, MoodPalette> = {
  default: {
    id: "default",
    nameEn: "AYXA Soft Pastel",
    nameAr: "باستيل أيكسا الناعم",
    moodColors: {
      happy: "#F472B6",    // Soft Rose
      calm: "#A78BFA",     // Soft Violet
      okay: "#34D399",     // Soft Emerald
      grateful: "#FBBF24", // Warm Amber
      tired: "#94A3B8",    // Soft Slate
      anxious: "#FB923C",  // Soft Coral
      sad: "#60A5FA",      // Soft Sky
    },
    emptyColor: "rgba(148, 163, 184, 0.15)",
    futureColor: "rgba(148, 163, 184, 0.05)",
    todayBorderColor: "#EC4899",
  },
  vibrant: {
    id: "vibrant",
    nameEn: "Bloom Radiance",
    nameAr: "إشراقة الزهور",
    moodColors: {
      happy: "#EC4899",    // Pink 500
      calm: "#8B5CF6",     // Purple 500
      okay: "#10B981",     // Emerald 500
      grateful: "#F59E0B", // Amber 500
      tired: "#64748B",    // Slate 500
      anxious: "#F97316",  // Orange 500
      sad: "#3B82F6",      // Blue 500
    },
    emptyColor: "rgba(148, 163, 184, 0.2)",
    futureColor: "rgba(148, 163, 184, 0.08)",
    todayBorderColor: "#DB2777",
  },
  contrast: {
    id: "contrast",
    nameEn: "High Contrast (WCAG AAA)",
    nameAr: "تباين عالٍ وميسّر",
    moodColors: {
      happy: "#BE185D",    // Deep Rose
      calm: "#6D28D9",     // Deep Purple
      okay: "#047857",     // Deep Emerald
      grateful: "#B45309", // Deep Amber
      tired: "#334155",    // Deep Slate
      anxious: "#C2410C",  // Deep Orange
      sad: "#1D4ED8",      // Deep Blue
    },
    emptyColor: "rgba(100, 116, 139, 0.25)",
    futureColor: "rgba(148, 163, 184, 0.1)",
    todayBorderColor: "#831843",
  },
  friendly: {
    id: "friendly",
    nameEn: "Color-Vision Friendly",
    nameAr: "مراعٍ لعمى الألوان",
    moodColors: {
      happy: "#CC79A7",    // Reddish Purple (Okabe-Ito)
      calm: "#56B4E9",     // Sky Blue
      okay: "#009E73",     // Bluish Green
      grateful: "#F0E442", // Yellow
      tired: "#999999",    // Gray
      anxious: "#E69F00",  // Orange
      sad: "#0072B2",      // Blue
    },
    emptyColor: "rgba(148, 163, 184, 0.15)",
    futureColor: "rgba(148, 163, 184, 0.05)",
    todayBorderColor: "#D55E00",
  },
};

export interface LegacyMoodSnapshot {
  id: string;
  userId: string;
  localDate: string;
  legacyValue: string | number;
  legacyLabel: string;
  resolvedMoodId?: CanonicalMood;
  resolvedAt?: string;
  createdAt: string;
}

export interface YearInPixelsSettings {
  userId: string;
  selectedPaletteId: MoodPaletteId;
  weekStartPreference: "mon" | "sun";
  showStreak: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PIXELS_SETTINGS: YearInPixelsSettings = {
  userId: "",
  selectedPaletteId: "default",
  weekStartPreference: "mon",
  showStreak: true,
  reminderEnabled: false,
  reminderTime: "21:00",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── Calendar Math & Leap Year Utilities ─────────────────────────────────────

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  // monthIndex: 0 = January, 1 = February, ..., 11 = December
  const daysByMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysByMonth[monthIndex];
}

export function getFirstDayWeekday(
  year: number,
  monthIndex: number,
  weekStart: "mon" | "sun" = "mon"
): number {
  // getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const d = new Date(year, monthIndex, 1);
  const day = d.getDay();
  if (weekStart === "mon") {
    // Return 0 for Monday, 6 for Sunday
    return (day + 6) % 7;
  }
  // Sunday start: 0 for Sunday, 6 for Saturday
  return day;
}

export function isFutureDate(dateKey: string, todayKeyStr: string): boolean {
  return dateKey > todayKeyStr;
}

export function formatDayKey(year: number, monthIndex: number, dayNumber: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(dayNumber).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// ── Statistics & Insights Calculator ────────────────────────────────────────

export interface MoodSummaryStats {
  daysLoggedYear: number;
  daysLoggedMonth: number;
  totalDaysInYear: number;
  topMood: CanonicalMood | null;
  topMoodCount: number;
  isTie: boolean;
  moodCounts: Record<CanonicalMood, number>;
  energyCounts: { low: number; medium: number; high: number };
  loggedDatesYear: string[];
}

export function calculateMoodStats(
  dailyMoods: Record<string, DailyMoodRecord>,
  year: number,
  selectedMonthIndex: number = new Date().getMonth()
): MoodSummaryStats {
  const yearPrefix = `${year}-`;
  const monthPrefix = `${year}-${String(selectedMonthIndex + 1).padStart(2, "0")}-`;

  let daysLoggedYear = 0;
  let daysLoggedMonth = 0;
  const moodCounts: Record<CanonicalMood, number> = {
    happy: 0,
    calm: 0,
    okay: 0,
    grateful: 0,
    tired: 0,
    anxious: 0,
    sad: 0,
  };

  const energyCounts = { low: 0, medium: 0, high: 0 };
  const loggedDatesYear: string[] = [];

  Object.entries(dailyMoods || {}).forEach(([dateStr, record]) => {
    if (!record || !record.mood) return;
    if (dateStr.startsWith(yearPrefix)) {
      daysLoggedYear++;
      loggedDatesYear.push(dateStr);
      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;

      if (record.energy === "low") energyCounts.low++;
      else if (record.energy === "high") energyCounts.high++;
      else energyCounts.medium++;

      if (dateStr.startsWith(monthPrefix)) {
        daysLoggedMonth++;
      }
    }
  });

  // Calculate top mood honestly handling ties
  let topMood: CanonicalMood | null = null;
  let topMoodCount = 0;
  let tieCount = 0;

  CANONICAL_MOODS.forEach((m) => {
    const count = moodCounts[m.id];
    if (count > topMoodCount) {
      topMoodCount = count;
      topMood = m.id;
      tieCount = 1;
    } else if (count === topMoodCount && count > 0) {
      tieCount++;
    }
  });

  const totalDaysInYear = isLeapYear(year) ? 366 : 365;

  return {
    daysLoggedYear,
    daysLoggedMonth,
    totalDaysInYear,
    topMood: topMoodCount > 0 ? topMood : null,
    topMoodCount,
    isTie: tieCount > 1,
    moodCounts,
    energyCounts,
    loggedDatesYear,
  };
}

// ── Gentle Streak Calculation ───────────────────────────────────────────────

export function calculateGentleStreak(
  dailyMoods: Record<string, DailyMoodRecord>,
  todayStr: string
): number {
  if (!dailyMoods || !todayStr) return 0;

  // Streak continues if logged today, OR if not logged today but logged yesterday
  let streak = 0;
  const cursor = new Date(todayStr + "T12:00:00Z");

  const todayRecord = dailyMoods[todayStr];
  if (!todayRecord) {
    // Check yesterday
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const yesterdayStr = cursor.toISOString().slice(0, 10);
    if (!dailyMoods[yesterdayStr]) {
      return 0;
    }
  }

  // Count backwards consecutively
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dailyMoods[key]) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ── Legacy Migration ────────────────────────────────────────────────────────

export function migrateLegacyPixels(
  legacyPixels: { date: string; mood: number | string }[] = [],
  existingDailyMoods: Record<string, DailyMoodRecord> = {},
  userId: string = "usr_guest"
): {
  migratedDailyMoods: Record<string, DailyMoodRecord>;
  legacySnapshots: Record<string, LegacyMoodSnapshot>;
} {
  const resultMoods: Record<string, DailyMoodRecord> = { ...existingDailyMoods };
  const legacySnapshots: Record<string, LegacyMoodSnapshot> = {};

  const legacyMap: Record<number | string, CanonicalMood | "unresolved_sick" | "unknown"> = {
    1: "happy",
    2: "calm",
    3: "okay",
    5: "sad",
    6: "anxious",
    7: "tired",
    8: "grateful",
    amazing: "grateful",
    good: "happy",
    happy: "happy",
    calm: "calm",
    okay: "okay",
    neutral: "okay",
    fine: "okay",
    sad: "sad",
    anxious: "anxious",
    stressed: "anxious",
    tired: "tired",
    low: "tired",
    grateful: "grateful",
    sick: "unresolved_sick",
    "4": "okay", // legacy middle scale fallback
  };

  legacyPixels.forEach((item) => {
    if (!item || !item.date) return;
    const dKey = item.date;

    // Rule 1: If a canonical DailyMoodRecord already exists for this date, do NOT overwrite it
    if (resultMoods[dKey]) return;

    const rawVal = typeof item.mood === "string" ? item.mood.toLowerCase().trim() : item.mood;
    const mapping = legacyMap[rawVal];

    if (mapping === "unresolved_sick") {
      // Rule 5: Do NOT silently convert Sick to Sad or Tired! Preserve as legacy snapshot
      legacySnapshots[dKey] = {
        id: `leg_${dKey}`,
        userId,
        localDate: dKey,
        legacyValue: "Sick",
        legacyLabel: "Sick",
        createdAt: new Date().toISOString(),
      };
    } else if (mapping && mapping !== "unknown") {
      // Deterministic equivalent
      resultMoods[dKey] = {
        userId,
        localDate: dKey,
        mood: mapping,
        energy: "medium",
        updatedAt: new Date().toISOString(),
        lastSource: "legacy_pixels_migration",
      };
    } else {
      // Ambiguous unknown label
      legacySnapshots[dKey] = {
        id: `leg_${dKey}`,
        userId,
        localDate: dKey,
        legacyValue: item.mood,
        legacyLabel: String(item.mood),
        createdAt: new Date().toISOString(),
      };
    }
  });

  return { migratedDailyMoods: resultMoods, legacySnapshots };
}
