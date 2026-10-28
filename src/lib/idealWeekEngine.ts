import { calculatePrayerTimes, formatPrayerTime, type PrayerTimeResult } from "./prayerTimes.ts";
import { formatLocalDateStr } from "./weeklyHabitEngine.ts";
import type { DeenPrayerSettings, Task, RoutineStep } from "./store";

// ============================================================================
// Types & Definitions
// ============================================================================

export type PlanningMode = "time_of_day" | "clock" | "between_prayers";

export type DayTypeKey =
  | "work"
  | "night_shift"
  | "study"
  | "rest"
  | "weekend"
  | "low_energy"
  | string;

export interface DayTypeConfig {
  id: DayTypeKey;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon: string;
  color: string; // Tailwind color class / badge token
  isCustom?: boolean;
}

export type IdealWeekItemType =
  | "routine"         // An existing or scheduled routine
  | "task_proposal"   // A task intended for this day
  | "linked_task"     // Linked to an existing canonical Task ID
  | "note";           // Planning-only intention/note (never mutates tasks/habits)

export interface IdealWeekItem {
  id: string;
  weekday: number; // 0=Sun, 1=Mon, ..., 6=Sat
  title: string;
  titleAr?: string;
  type: IdealWeekItemType;
  
  // Categorization / visual
  category?: string;
  emoji?: string;
  notes?: string;

  // Time semantics
  timeOfDay?: "morning" | "day" | "evening" | "night";
  clockTime?: string; // "HH:MM" e.g. "09:00"
  durationMinutes?: number;
  crossesMidnight?: boolean; // For overnight shifts / late routines

  // Prayer anchoring (for Between the Prayers mode)
  prayerPeriodId?: BetweenPrayersPeriodId;
  prayerAnchor?: {
    prayer: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
    relation: "at" | "before" | "after";
    offsetMinutes: number;
  };

  // Canonical references (optional)
  linkedTaskId?: string;
  routineKey?: string;

  // Order
  order: number;
}

export interface IdealWeekTemplate {
  id: string;
  name: string;
  nameAr?: string;
  planningMode: PlanningMode;
  dayTypeAssignments: Record<number, DayTypeKey>; // weekday 0-6 => DayTypeKey
  items: IdealWeekItem[];
  // Prayer periods settings
  enableAfterFajrSegment?: boolean; // When true, splits Fajr -> Dhuhr into "After Fajr" and "Fajr -> Dhuhr"
  afterFajrDurationMinutes?: number; // default: 60 mins after Fajr
  updatedAt: string;
}

export type BetweenPrayersPeriodId =
  | "after_fajr"       // Optional user-enabled segment right after Fajr
  | "fajr_dhuhr"       // Fajr -> Dhuhr (or remaining if after_fajr is active)
  | "dhuhr_asr"        // Dhuhr -> Asr
  | "asr_maghrib"      // Asr -> Maghrib
  | "maghrib_isha"     // Maghrib -> Isha
  | "after_isha";      // After Isha until sleep/next day

export interface BetweenPrayersPeriod {
  id: BetweenPrayersPeriodId;
  labelEn: string;
  labelAr: string;
  subEn: string;
  subAr: string;
  icon: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  startDateObj?: Date;
  endDateObj?: Date;
}

export interface ResolvedDaySchedule {
  dateStr: string; // YYYY-MM-DD
  weekday: number; // 0-6
  dayType: DayTypeConfig;
  prayerTimes: PrayerTimeResult | null;
  prayerPeriods: BetweenPrayersPeriod[];
  items: IdealWeekItem[];
  isNightShift: boolean;
}

export interface ApplyWeekActionPlan {
  weekStartDate: string;
  weekEndDate: string;
  tasksToCreate: {
    tempItemId: string;
    title: string;
    dueDate: string;
    optionalTime?: string;
    tag: string;
    notes?: string;
  }[];
  tasksToLink: {
    tempItemId: string;
    taskId: string;
    targetDate: string;
  }[];
  routinesToSchedule: {
    tempItemId: string;
    routineKey: string;
    targetDate: string;
    activeDays: number[];
  }[];
  planningNotesOnly: {
    tempItemId: string;
    title: string;
    targetDate: string;
    notes?: string;
  }[];
  alreadyAppliedWarning?: boolean;
}

export interface AppliedWeekRecord {
  weekStartDate: string;
  appliedAt: string;
  createdTaskIds: string[];
  scheduledRoutineKeys: string[];
}

// ============================================================================
// Starter Day Types
// ============================================================================

export const STARTER_DAY_TYPES: DayTypeConfig[] = [
  {
    id: "work",
    nameEn: "Work Day",
    nameAr: "يوم عمل",
    descriptionEn: "Deep focus blocks and professional commitments",
    descriptionAr: "فترات تركيز عميق والتزامات مهنية",
    icon: "💼",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  },
  {
    id: "night_shift",
    nameEn: "Night Shift",
    nameAr: "مناوبة ليلية",
    descriptionEn: "Overnight schedule crossing midnight to next day",
    descriptionAr: "جدول ليلي يمتد عبر منتصف الليل إلى اليوم التالي",
    icon: "🌙",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "study",
    nameEn: "Study Day",
    nameAr: "يوم دراسة",
    descriptionEn: "Structured learning, classes, and research sessions",
    descriptionAr: "جلسات تعلم منظم ومحاضرات وبحث",
    icon: "📚",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  {
    id: "rest",
    nameEn: "Rest Day",
    nameAr: "يوم راحة",
    descriptionEn: "Gentle pace, rejuvenation, self-care, and breathing room",
    descriptionAr: "إيقاع لطيف، تجديد طاقة، عناية بالذات ومساحة تنفس",
    icon: "🌿",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "weekend",
    nameEn: "Weekend",
    nameAr: "عطلة نهاية الأسبوع",
    descriptionEn: "Family connection, leisurely rhythms, and personal space",
    descriptionAr: "روابط عائلية، إيقاع هادئ ومساحة شخصية مبهجة",
    icon: "🌸",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  {
    id: "low_energy",
    nameEn: "Low-Energy Day",
    nameAr: "يوم منخفض الطاقة",
    descriptionEn: "Chosen gently by you for minimal demands and deep grace",
    descriptionAr: "يوم تختاره بنفسكِ بوعي مع الحد الأدنى من المطالب ولطف تام",
    icon: "🕯️",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
];

export function getDayTypeConfig(
  dayTypeKey: string,
  customTypes: DayTypeConfig[] = []
): DayTypeConfig {
  const all = [...STARTER_DAY_TYPES, ...customTypes];
  const found = all.find((d) => d.id === dayTypeKey);
  if (found) return found;
  return {
    id: dayTypeKey,
    nameEn: dayTypeKey,
    nameAr: dayTypeKey,
    icon: "✨",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200",
    isCustom: true,
  };
}

// ============================================================================
// Default Ideal Week Template
// ============================================================================

export function createDefaultIdealWeekTemplate(): IdealWeekTemplate {
  return {
    id: "default-ideal-week",
    name: "My Natural Rhythm",
    nameAr: "إيقاعي الطبيعي المتوازن",
    planningMode: "time_of_day",
    dayTypeAssignments: {
      0: "work",      // Sunday
      1: "work",      // Monday
      2: "work",      // Tuesday
      3: "study",     // Wednesday
      4: "work",      // Thursday
      5: "weekend",   // Friday
      6: "rest",      // Saturday
    },
    items: [
      {
        id: "item-1",
        weekday: 0,
        title: "Morning Routine & Fajr",
        titleAr: "الروتين الصباحي وصلاة الفجر",
        type: "routine",
        routineKey: "morning",
        timeOfDay: "morning",
        clockTime: "06:00",
        durationMinutes: 45,
        prayerPeriodId: "fajr_dhuhr",
        order: 0,
      },
      {
        id: "item-2",
        weekday: 0,
        title: "Deep Work Sprint: High Priority Task",
        titleAr: "جلسة إنجاز مركزة: المهمة الأهم",
        type: "task_proposal",
        category: "Work",
        timeOfDay: "day",
        clockTime: "09:30",
        durationMinutes: 90,
        prayerPeriodId: "fajr_dhuhr",
        order: 1,
      },
      {
        id: "item-3",
        weekday: 0,
        title: "Dhuhr Prayer & Mindful Lunch",
        titleAr: "صلاة الظهر وغداء هادئ",
        type: "routine",
        timeOfDay: "day",
        clockTime: "12:30",
        durationMinutes: 45,
        prayerPeriodId: "dhuhr_asr",
        order: 2,
      },
      {
        id: "item-4",
        weekday: 0,
        title: "Asr Walk & Gentle Stretch",
        titleAr: "مشي خفيف بعد العصر واستراحة",
        type: "note",
        category: "Health",
        timeOfDay: "day",
        clockTime: "16:00",
        durationMinutes: 30,
        prayerPeriodId: "asr_maghrib",
        order: 3,
      },
      {
        id: "item-5",
        weekday: 0,
        title: "Evening Wind-down & Quran",
        titleAr: "الروتين المسائي وورد القرآن",
        type: "routine",
        routineKey: "evening",
        timeOfDay: "evening",
        clockTime: "20:30",
        durationMinutes: 45,
        prayerPeriodId: "after_isha",
        order: 4,
      },
    ],
    enableAfterFajrSegment: true,
    afterFajrDurationMinutes: 60,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Between the Prayers: Non-Overlapping Period Calculation
// ============================================================================

/**
 * Calculates non-overlapping prayer-relative periods for a given local date using
 * canonical My Deen prayer settings.
 *
 * Rules:
 * 1. By default: Fajr → Dhuhr is one single uninterrupted period.
 * 2. If `enableAfterFajrSegment` is true:
 *    - "After Fajr" starts at Fajr and ends at Fajr + `afterFajrDurationMinutes` (capped at Dhuhr).
 *    - "Fajr → Dhuhr" begins exactly at that boundary and ends at Dhuhr.
 *    No overlapping occurs.
 * 3. Dhuhr → Asr begins at Dhuhr and ends at Asr.
 * 4. Asr → Maghrib begins at Asr and ends at Maghrib.
 * 5. Maghrib → Isha begins at Maghrib and ends at Isha.
 * 6. After Isha begins at Isha and continues into night wind-down (or next-day Fajr).
 *
 * Fallback: If geolocation is unavailable or calculations produce invalid dates,
 * graceful default solar standard times are used.
 */
export function resolveBetweenPrayersPeriods(
  date: Date,
  deenSettings?: DeenPrayerSettings,
  options: {
    enableAfterFajr?: boolean;
    afterFajrMinutes?: number;
  } = {}
): BetweenPrayersPeriod[] {
  const lat = deenSettings?.latitude ?? 33.5731;
  const lng = deenSettings?.longitude ?? -7.5898;
  const method = deenSettings?.calculationMethod ?? "MuslimWorldLeague";
  const asrMadhab = deenSettings?.asrMadhab ?? "shafi";

  let pTimes: PrayerTimeResult;
  try {
    pTimes = calculatePrayerTimes(lat, lng, date, method, asrMadhab);
  } catch {
    // Fallback if adhan error occurs
    const dStr = formatLocalDateStr(date);
    pTimes = {
      fajr: new Date(`${dStr}T05:15:00`),
      sunrise: new Date(`${dStr}T06:35:00`),
      dhuhr: new Date(`${dStr}T12:30:00`),
      asr: new Date(`${dStr}T15:45:00`),
      maghrib: new Date(`${dStr}T18:20:00`),
      isha: new Date(`${dStr}T19:50:00`),
      currentPrayer: "none",
      nextPrayer: "fajr",
      timeForNextPrayer: null,
      qiblaBearing: 90,
    };
  }

  const fajrDate = pTimes.fajr;
  const dhuhrDate = pTimes.dhuhr;
  const asrDate = pTimes.asr;
  const maghribDate = pTimes.maghrib;
  const ishaDate = pTimes.isha;

  const periods: BetweenPrayersPeriod[] = [];

  const enableAfterFajr = options.enableAfterFajr ?? true;
  const afterFajrMinutes = options.afterFajrMinutes ?? 60;

  if (enableAfterFajr) {
    // After Fajr Segment
    const afterFajrEnd = new Date(fajrDate.getTime() + afterFajrMinutes * 60 * 1000);
    // Boundary cannot exceed Dhuhr
    const boundedAfterFajrEnd = afterFajrEnd < dhuhrDate ? afterFajrEnd : dhuhrDate;

    periods.push({
      id: "after_fajr",
      labelEn: "After Fajr",
      labelAr: "بعد الفجر",
      subEn: "Quiet barakah, Athkar & intention setting",
      subAr: "بركة الصباح الباكر، الأذكار وتحديد النوايا",
      icon: "🌅",
      startTime: formatPrayerTime(fajrDate, true),
      endTime: formatPrayerTime(boundedAfterFajrEnd, true),
      startDateObj: fajrDate,
      endDateObj: boundedAfterFajrEnd,
    });

    // Remaining morning period until Dhuhr begins strictly where After Fajr ended
    periods.push({
      id: "fajr_dhuhr",
      labelEn: "Morning Focus → Dhuhr",
      labelAr: "من الفجر إلى الظهر",
      subEn: "Peak creative and professional focus",
      subAr: "قمة التركيز الصباحي والإنتاجية الذهنية",
      icon: "☀️",
      startTime: formatPrayerTime(boundedAfterFajrEnd, true),
      endTime: formatPrayerTime(dhuhrDate, true),
      startDateObj: boundedAfterFajrEnd,
      endDateObj: dhuhrDate,
    });
  } else {
    // Default single uninterrupted period
    periods.push({
      id: "fajr_dhuhr",
      labelEn: "Fajr → Dhuhr",
      labelAr: "من الفجر إلى الظهر",
      subEn: "Morning rhythm and deep productive focus",
      subAr: "إيقاع الصباح والتركيز العميق في الإنجاز",
      icon: "☀️",
      startTime: formatPrayerTime(fajrDate, true),
      endTime: formatPrayerTime(dhuhrDate, true),
      startDateObj: fajrDate,
      endDateObj: dhuhrDate,
    });
  }

  // Dhuhr -> Asr
  periods.push({
    id: "dhuhr_asr",
    labelEn: "Dhuhr → Asr",
    labelAr: "من الظهر إلى العصر",
    subEn: "Midday reset, nourishing meal & secondary tasks",
    subAr: "استراحة الظهيرة، وجبة مغذية وإنجاز مهام ثانوية",
    icon: "🕌",
    startTime: formatPrayerTime(dhuhrDate, true),
    endTime: formatPrayerTime(asrDate, true),
    startDateObj: dhuhrDate,
    endDateObj: asrDate,
  });

  // Asr -> Maghrib
  periods.push({
    id: "asr_maghrib",
    labelEn: "Asr → Maghrib",
    labelAr: "من العصر إلى المغرب",
    subEn: "Movement, evening walk, study or peaceful wrap-up",
    subAr: "حركة خفيفة، مشي العصر، دراسة أو إنهاء هادئ لليوم",
    icon: "🌿",
    startTime: formatPrayerTime(asrDate, true),
    endTime: formatPrayerTime(maghribDate, true),
    startDateObj: asrDate,
    endDateObj: maghribDate,
  });

  // Maghrib -> Isha
  periods.push({
    id: "maghrib_isha",
    labelEn: "Maghrib → Isha",
    labelAr: "من المغرب إلى العشاء",
    subEn: "Family connection, dinner & gentle self-care",
    subAr: "أجواء عائلية، عشاء خفيف وعناية لطيفة بالنفس",
    icon: "🕯️",
    startTime: formatPrayerTime(maghribDate, true),
    endTime: formatPrayerTime(ishaDate, true),
    startDateObj: maghribDate,
    endDateObj: ishaDate,
  });

  // After Isha
  // Until 23:59 or night sleep
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 0, 0);

  periods.push({
    id: "after_isha",
    labelEn: "After Isha",
    labelAr: "بعد العشاء",
    subEn: "Night routine, reflection, Surah Al-Mulk & sleep",
    subAr: "الروتين الليلي، التدوين الهادئ، سورة الملك ونوم هانئ",
    icon: "🌙",
    startTime: formatPrayerTime(ishaDate, true),
    endTime: "23:59",
    startDateObj: ishaDate,
    endDateObj: endOfDay,
  });

  return periods;
}

// ============================================================================
// Night Shift & Midnight Crossing Resolver
// ============================================================================

/**
 * Checks if an item or day type crosses midnight (e.g. 22:00 to 06:00).
 * Calculates actual execution date for tasks so occurrences belong to the correct local day.
 */
export function resolveItemLocalExecutionDate(
  baseDateStr: string,
  startTime?: string,
  durationMinutes?: number
): {
  startDateStr: string;
  endDateStr: string;
  crossesMidnight: boolean;
} {
  if (!startTime) {
    return { startDateStr: baseDateStr, endDateStr: baseDateStr, crossesMidnight: false };
  }

  const [hours, mins] = startTime.split(":").map(Number);
  const start = new Date(`${baseDateStr}T00:00:00`);
  start.setHours(hours || 0, mins || 0, 0, 0);

  const duration = durationMinutes || 0;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const startDayStr = formatLocalDateStr(start);
  const endDayStr = formatLocalDateStr(end);
  const crosses = startDayStr !== endDayStr;

  return {
    startDateStr: startDayStr,
    endDateStr: endDayStr,
    crossesMidnight: crosses,
  };
}

// ============================================================================
// Resolve Dated Week Schedule (Preview compiler)
// ============================================================================

export function resolveDatedWeekSchedule(
  weekDays: { dateStr: string; dayOfWeekIndex: number }[],
  template: IdealWeekTemplate,
  deenSettings?: DeenPrayerSettings,
  customDayTypes: DayTypeConfig[] = []
): ResolvedDaySchedule[] {
  return weekDays.map((day) => {
    const dayTypeKey = template.dayTypeAssignments[day.dayOfWeekIndex] || "work";
    const dayType = getDayTypeConfig(dayTypeKey, customDayTypes);
    const dayDate = new Date(`${day.dateStr}T12:00:00`);

    let pTimes: PrayerTimeResult | null = null;
    try {
      pTimes = calculatePrayerTimes(
        deenSettings?.latitude ?? 33.5731,
        deenSettings?.longitude ?? -7.5898,
        dayDate,
        deenSettings?.calculationMethod ?? "MuslimWorldLeague",
        deenSettings?.asrMadhab ?? "shafi"
      );
    } catch {
      pTimes = null;
    }

    const prayerPeriods = resolveBetweenPrayersPeriods(dayDate, deenSettings, {
      enableAfterFajr: template.enableAfterFajrSegment,
      afterFajrMinutes: template.afterFajrDurationMinutes,
    });

    const itemsForDay = (template.items || [])
      .filter((it) => it.weekday === day.dayOfWeekIndex)
      .sort((a, b) => a.order - b.order);

    const isNightShift = dayType.id === "night_shift";

    return {
      dateStr: day.dateStr,
      weekday: day.dayOfWeekIndex,
      dayType,
      prayerTimes: pTimes,
      prayerPeriods,
      items: itemsForDay,
      isNightShift,
    };
  });
}

// ============================================================================
// Conflict & Overlap Detector
// ============================================================================

export interface ScheduleConflict {
  itemAId: string;
  itemBId: string;
  itemATitle: string;
  itemBTitle: string;
  startTimeA: string;
  startTimeB: string;
  description: string;
}

export function detectScheduleConflicts(items: IdealWeekItem[]): ScheduleConflict[] {
  const timedItems = items.filter(
    (it) => it.clockTime && typeof it.durationMinutes === "number" && it.durationMinutes > 0
  );

  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < timedItems.length; i++) {
    for (let j = i + 1; j < timedItems.length; j++) {
      const a = timedItems[i];
      const b = timedItems[j];

      const [aH, aM] = (a.clockTime || "00:00").split(":").map(Number);
      const [bH, bM] = (b.clockTime || "00:00").split(":").map(Number);

      const aStart = aH * 60 + aM;
      const aEnd = aStart + (a.durationMinutes || 0);

      const bStart = bH * 60 + bM;
      const bEnd = bStart + (b.durationMinutes || 0);

      // Overlap condition
      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        conflicts.push({
          itemAId: a.id,
          itemBId: b.id,
          itemATitle: a.title,
          itemBTitle: b.title,
          startTimeA: a.clockTime || "",
          startTimeB: b.clockTime || "",
          description: `Items "${a.title}" (${a.clockTime}) and "${b.title}" (${b.clockTime}) overlap in scheduled duration.`,
        });
      }
    }
  }

  return conflicts;
}

// ============================================================================
// Action Plan Compiler (Safe Preview Before Application)
// ============================================================================

export function compileApplyWeekActionPlan(
  resolvedDays: ResolvedDaySchedule[],
  existingTasks: Task[] = [],
  appliedRecord?: AppliedWeekRecord
): ApplyWeekActionPlan {
  const weekStartDate = resolvedDays[0]?.dateStr || "";
  const weekEndDate = resolvedDays[resolvedDays.length - 1]?.dateStr || "";

  const tasksToCreate: ApplyWeekActionPlan["tasksToCreate"] = [];
  const tasksToLink: ApplyWeekActionPlan["tasksToLink"] = [];
  const routinesToSchedule: ApplyWeekActionPlan["routinesToSchedule"] = [];
  const planningNotesOnly: ApplyWeekActionPlan["planningNotesOnly"] = [];

  const alreadyCreatedSet = new Set(appliedRecord?.createdTaskIds || []);

  resolvedDays.forEach((day) => {
    day.items.forEach((item) => {
      if (item.type === "task_proposal") {
        // Prevent duplicate creation if matching task exists for same title and date
        const exists = existingTasks.some(
          (t) =>
            t.dueDate === day.dateStr &&
            t.title.trim().toLowerCase() === item.title.trim().toLowerCase()
        );

        if (!exists) {
          tasksToCreate.push({
            tempItemId: item.id,
            title: item.title,
            dueDate: day.dateStr,
            optionalTime: item.clockTime,
            tag: item.category || "Personal",
            notes: item.notes,
          });
        }
      } else if (item.type === "linked_task" && item.linkedTaskId) {
        tasksToLink.push({
          tempItemId: item.id,
          taskId: item.linkedTaskId,
          targetDate: day.dateStr,
        });
      } else if (item.type === "routine" && item.routineKey) {
        routinesToSchedule.push({
          tempItemId: item.id,
          routineKey: item.routineKey,
          targetDate: day.dateStr,
          activeDays: [day.weekday],
        });
      } else if (item.type === "note") {
        planningNotesOnly.push({
          tempItemId: item.id,
          title: item.title,
          targetDate: day.dateStr,
          notes: item.notes,
        });
      }
    });
  });

  return {
    weekStartDate,
    weekEndDate,
    tasksToCreate,
    tasksToLink,
    routinesToSchedule,
    planningNotesOnly,
    alreadyAppliedWarning: Boolean(appliedRecord),
  };
}
