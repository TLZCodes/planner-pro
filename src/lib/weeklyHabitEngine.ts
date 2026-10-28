import type { Habit, DailyMoodRecord, DailyHydrationRecord, HabitWeekPreferences } from "./store";
export type { HabitWeekPreferences } from "./store";

export type WeekStartDay = "saturday" | "sunday" | "monday";
export type HabitWeekGroupingMode = "none" | "timeOfDay" | "category";
export type HabitWeekDensity = "comfortable" | "compact";
export type HabitWeekPaperTheme = "blossom" | "butter" | "lavender" | "minimal";

export type DayInfo = {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string;
  dayShort: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayOfWeekIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
};

export type WeekInfo = {
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  days: DayInfo[];
  formattedRange: string;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  isFutureWeek: boolean;
};

export type HabitCellStatus =
  | "completed"
  | "due_today"
  | "past_incomplete"
  | "future_scheduled"
  | "not_scheduled"
  | "paused"
  | "skipped"
  | "partial_progress";

export type HabitCellData = {
  status: HabitCellStatus;
  isCompleted: boolean;
  isSkipped?: boolean;
  isPartial?: boolean;
  currentVal: number;
  targetVal: number;
  unit?: string;
  canToggle: boolean;
};

export type WeeklyHabitProgress = {
  completedOccurrences: number;
  dueOccurrences: number;
  scheduledOccurrences: number;
  percentage: number;
  totalWholeWeekPossible: number;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  isFutureWeek: boolean;
  daysWithCheckinsCount: number;
  activeHabitsCount: number;
  perfectDaysCount: number;
  hasEligibleDue: boolean;
};

export type ReflectionPrompt = {
  id: string;
  questionEn: string;
  questionAr: string;
  placeholderEn: string;
  placeholderAr: string;
  emoji: string;
};

export const WEEKLY_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: "joy_calm",
    emoji: "🌸",
    questionEn: "Which habit brought you the most calm, joy, or lightness this week?",
    questionAr: "ما هي العادة التي جلبت لكِ أكبر قدر من السكينة والبهجة هذا الأسبوع؟",
    placeholderEn: "e.g., Morning hydration and sitting quietly after Fajr...",
    placeholderAr: "مثال: شرب الماء الصباحي والجلوس في هدوء بعد صلاة الفجر...",
  },
  {
    id: "friction_gentleness",
    emoji: "🌿",
    questionEn: "Did any habit feel heavy or difficult? How can you approach it more gently?",
    questionAr: "هل شعرتِ بثقل أو صعوبة في إحدى العادات؟ كيف تتعاملين معها بلطف أكبر؟",
    placeholderEn: "e.g., Evening reading felt late; I'll start with just 5 minutes before bed...",
    placeholderAr: "مثال: القراءة المسائية كانت متأخرة؛ سأبدأ بـ 5 دقائق فقط قبل النوم...",
  },
  {
    id: "small_wins",
    emoji: "✨",
    questionEn: "What quiet win or moment of consistency are you proud of?",
    questionAr: "ما هو الإنجاز الهادئ أو لحظة الاستمرارية التي تفتخرين بها؟",
    placeholderEn: "e.g., Even on busy days, I kept my gratitude and movement...",
    placeholderAr: "مثال: رغم انشغال أيامي، حافظت على ورد الامتنان والحركة...",
  },
  {
    id: "rhythm_balance",
    emoji: "💧",
    questionEn: "How did your water, energy, and mood rhythms feel across the week?",
    questionAr: "كيف كان توازن شرب الماء ومزاجكِ وطاقتكِ طوال هذا الأسبوع؟",
    placeholderEn: "e.g., Hydration was steady, need earlier sleep on midweek nights...",
    placeholderAr: "مثال: شرب الماء كان ممتازاً، أحتاج للنوم أبكر في منتصف الأسبوع...",
  },
  {
    id: "next_week_intention",
    emoji: "🕊️",
    questionEn: "What is your single gentle focus or adjustment for next week?",
    questionAr: "ما هي نيّتكِ الهادئة أو تعديلكِ اللطيف للأسبوع القادم؟",
    placeholderEn: "e.g., Consistency with ease, listening to my body, and speaking kindly to myself...",
    placeholderAr: "مثال: الاستمرارية بيسر، والاستماع لجسدي، والحديث اللطيف مع نفسي...",
  },
];

export const PRESET_INTENTIONS = {
  en: [
    "Consistency over perfection 🌸",
    "Nourish body, heart & soul 🤍",
    "Gentle steps, deep presence 🕊️",
    "Prioritize rest without guilt 🌿",
    "Show up with gratitude and grace ✨",
  ],
  ar: [
    "الاستمرارية بلطف قبل المثالية 🌸",
    "تغذية الجسد والقلب والروح 🤍",
    "خطوات هادئة وحضور واعي 🕊️",
    "إعطاء الأولوية للراحة دون ذنب 🌿",
    "الحضور بامتنان وسكينة ✨",
  ],
};

// ── 1. Format local YYYY-MM-DD safely ─────────────────────────────────────────
export function formatLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── 2. Calculate Week Days & Localized Range ──────────────────────────────────
export function getWeekDaysInfo(
  baseDate: Date = new Date(),
  weekOffset: number = 0,
  firstDayOfWeek: WeekStartDay = "saturday",
  isAr: boolean = false
): WeekInfo {
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  target.setDate(target.getDate() + weekOffset * 7);

  const dayOfWeek = target.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Determine distance back to week start
  let startOffset = 0;
  if (firstDayOfWeek === "saturday") {
    startOffset = (dayOfWeek + 1) % 7;
  } else if (firstDayOfWeek === "sunday") {
    startOffset = dayOfWeek;
  } else {
    startOffset = (dayOfWeek + 6) % 7;
  }

  const weekStart = new Date(target);
  weekStart.setDate(target.getDate() - startOffset);

  const todayStr = formatLocalDateStr(new Date());

  const daysAr = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const shortAr = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];
  const shortEn = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const dateStr = formatLocalDateStr(d);
    const dayOfWeekIndex = d.getDay();
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;

    days.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: isAr ? daysAr[dayOfWeekIndex] : daysEn[dayOfWeekIndex],
      dayShort: isAr ? shortAr[dayOfWeekIndex] : shortEn[dayOfWeekIndex],
      isToday,
      isPast,
      isFuture,
      dayOfWeekIndex,
    });
  }

  const weekStartDate = days[0].dateStr;
  const weekEndDate = days[6].dateStr;

  const isCurrentWeek = weekOffset === 0;
  const isPastWeek = weekOffset < 0;
  const isFutureWeek = weekOffset > 0;

  const startObj = new Date(days[0].dateStr + "T00:00:00");
  const endObj = new Date(days[6].dateStr + "T00:00:00");

  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  let formattedRange = "";
  if (isAr) {
    if (startObj.getMonth() === endObj.getMonth()) {
      formattedRange = `${startObj.getDate()} - ${endObj.getDate()} ${monthNamesAr[startObj.getMonth()]}`;
    } else {
      formattedRange = `${startObj.getDate()} ${monthNamesAr[startObj.getMonth()]} - ${endObj.getDate()} ${monthNamesAr[endObj.getMonth()]}`;
    }
  } else {
    if (startObj.getMonth() === endObj.getMonth()) {
      formattedRange = `${monthNamesEn[startObj.getMonth()]} ${startObj.getDate()} – ${endObj.getDate()}`;
    } else {
      formattedRange = `${monthNamesEn[startObj.getMonth()]} ${startObj.getDate()} – ${monthNamesEn[endObj.getMonth()]} ${endObj.getDate()}`;
    }
  }

  return {
    weekStartDate,
    weekEndDate,
    days,
    formattedRange,
    isCurrentWeek,
    isPastWeek,
    isFutureWeek,
  };
}

// ── 3. Habit Scheduling & Cell Status ─────────────────────────────────────────
export function isHabitScheduledForDay(habit: Habit, dayOfWeekIndex: number): boolean {
  if (habit.status === "paused" || habit.status === "archived") return false;
  if (habit.scheduleType === "frequency" && (habit.weeklyFrequency || 0) > 0) {
    return false;
  }
  if (!habit.scheduledDays || habit.scheduledDays.length === 0) {
    return true;
  }
  return habit.scheduledDays.includes(dayOfWeekIndex);
}

export function isFlexibleHabit(habit: Habit): boolean {
  return (
    habit.scheduleType === "frequency" ||
    ((habit.weeklyFrequency || 0) > 0 && (!habit.scheduledDays || habit.scheduledDays.length === 0))
  );
}

export function getHabitCellData(habit: Habit, day: DayInfo): HabitCellData {
  const isScheduled = isHabitScheduledForDay(habit, day.dayOfWeekIndex);
  const isPaused = habit.status === "paused" || habit.status === "archived";

  const targetVal = habit.targetValue || 1;
  const hist = habit.history?.[day.dateStr];
  const isSkipped = Boolean(hist?.skipped);
  const currentVal = hist ? hist.value ?? (hist.completed ? targetVal : 0) : (day.isToday && habit.days?.[6] ? targetVal : 0);
  const isCompleted = !isSkipped && (day.isToday ? Boolean(habit.days?.[6]) || Boolean(hist?.completed) : Boolean(hist?.completed));

  if (isPaused) {
    return {
      status: "paused",
      isCompleted: false,
      isSkipped: false,
      currentVal: 0,
      targetVal,
      unit: habit.unit,
      canToggle: false,
    };
  }

  // If date is before habit started
  if (habit.startDate && day.dateStr < habit.startDate) {
    return {
      status: "not_scheduled",
      isCompleted: false,
      isSkipped: false,
      currentVal: 0,
      targetVal,
      unit: habit.unit,
      canToggle: false,
    };
  }

  if (isSkipped) {
    return {
      status: "skipped",
      isCompleted: false,
      isSkipped: true,
      currentVal: 0,
      targetVal,
      unit: habit.unit,
      canToggle: !day.isFuture,
    };
  }

  if (!isScheduled) {
    return {
      status: "not_scheduled",
      isCompleted,
      isSkipped: false,
      currentVal,
      targetVal,
      unit: habit.unit,
      canToggle: false,
    };
  }

  if (isCompleted) {
    return {
      status: "completed",
      isCompleted: true,
      isSkipped: false,
      currentVal: Math.max(currentVal, targetVal),
      targetVal,
      unit: habit.unit,
      canToggle: !day.isFuture,
    };
  }

  // Check partial progress for numeric / duration habits
  const isQuantitative = habit.trackingType === "count" || habit.trackingType === "duration";
  if (isQuantitative && currentVal > 0 && currentVal < targetVal) {
    return {
      status: "partial_progress",
      isCompleted: false,
      isSkipped: false,
      isPartial: true,
      currentVal,
      targetVal,
      unit: habit.unit,
      canToggle: !day.isFuture,
    };
  }

  if (day.isToday) {
    return {
      status: "due_today",
      isCompleted: false,
      isSkipped: false,
      currentVal,
      targetVal,
      unit: habit.unit,
      canToggle: true,
    };
  }

  if (day.isPast) {
    return {
      status: "past_incomplete",
      isCompleted: false,
      isSkipped: false,
      currentVal,
      targetVal,
      unit: habit.unit,
      canToggle: true,
    };
  }

  return {
    status: "future_scheduled",
    isCompleted: false,
    isSkipped: false,
    currentVal: 0,
    targetVal,
    unit: habit.unit,
    canToggle: false,
  };
}

// ── 4. Fair Progress Calculation (Excludes Future Days from Denominator) ───────
export function computeWeeklyProgress(
  habits: Habit[],
  weekInfo: WeekInfo
): WeeklyHabitProgress {
  const activeHabits = habits.filter((h) => (h.status || "active") === "active");

  let completedOccurrences = 0;
  let dueOccurrences = 0;
  let totalWholeWeekPossible = 0;

  const dayStats: Record<string, { completed: number; due: number }> = {};
  weekInfo.days.forEach((d) => {
    dayStats[d.dateStr] = { completed: 0, due: 0 };
  });

  activeHabits.forEach((habit) => {
    if (isFlexibleHabit(habit)) {
      let weekCompletions = 0;
      weekInfo.days.forEach((d) => {
        const hist = habit.history?.[d.dateStr];
        const isDone = d.isToday ? Boolean(habit.days?.[6]) || Boolean(hist?.completed) : Boolean(hist?.completed);
        if (isDone && !hist?.skipped) weekCompletions++;
      });
      const targetFreq = habit.weeklyFrequency || 3;
      totalWholeWeekPossible += targetFreq;

      if (weekInfo.isCurrentWeek) {
        const daysElapsed = weekInfo.days.filter((d) => !d.isFuture).length;
        const proratedDue = Math.min(targetFreq, Math.max(1, Math.round((daysElapsed / 7) * targetFreq)));
        dueOccurrences += proratedDue;
        completedOccurrences += Math.min(weekCompletions, proratedDue);
      } else if (weekInfo.isPastWeek) {
        dueOccurrences += targetFreq;
        completedOccurrences += Math.min(weekCompletions, targetFreq);
      }
      return;
    }

    weekInfo.days.forEach((day) => {
      // Exclude days prior to habit's startDate
      if (habit.startDate && day.dateStr < habit.startDate) return;

      const isScheduled = isHabitScheduledForDay(habit, day.dayOfWeekIndex);
      if (!isScheduled) return;

      totalWholeWeekPossible++;

      const cell = getHabitCellData(habit, day);

      // Future weeks: planned counts only, no missed or due occurrences counted
      if (weekInfo.isFutureWeek) {
        return;
      }

      // In current week, only days through today are due. In past weeks, all days are due.
      const isDue = weekInfo.isPastWeek || (!weekInfo.isFutureWeek && !day.isFuture);

      if (isDue) {
        dueOccurrences++;
        dayStats[day.dateStr].due++;
        if (cell.isCompleted) {
          completedOccurrences++;
          dayStats[day.dateStr].completed++;
        }
      }
    });
  });

  // Calculate days with at least one completion in this week
  let daysWithCheckinsCount = 0;
  weekInfo.days.forEach((day) => {
    if (dayStats[day.dateStr].completed > 0) {
      daysWithCheckinsCount++;
    }
  });

  let perfectDaysCount = 0;
  weekInfo.days.forEach((day) => {
    const ds = dayStats[day.dateStr];
    if (ds.due > 0 && ds.completed >= ds.due) {
      perfectDaysCount++;
    }
  });

  const hasEligibleDue = dueOccurrences > 0;
  const percentage = hasEligibleDue
    ? Math.round((completedOccurrences / dueOccurrences) * 100)
    : 0;

  return {
    completedOccurrences,
    dueOccurrences,
    scheduledOccurrences: weekInfo.isCurrentWeek ? dueOccurrences : totalWholeWeekPossible,
    percentage: Math.min(100, Math.max(0, percentage)),
    totalWholeWeekPossible,
    isCurrentWeek: weekInfo.isCurrentWeek,
    isPastWeek: weekInfo.isPastWeek,
    isFutureWeek: weekInfo.isFutureWeek,
    daysWithCheckinsCount,
    activeHabitsCount: activeHabits.length,
    perfectDaysCount,
    hasEligibleDue,
  };
}

// ── 5. Habit Grouping Logic ───────────────────────────────────────────────────
export type HabitGroup = {
  id: string;
  titleEn: string;
  titleAr: string;
  emoji: string;
  habits: Habit[];
};

export function groupHabits(
  habits: Habit[],
  mode: HabitWeekGroupingMode = "none",
  isAr: boolean = false
): HabitGroup[] {
  if (mode === "none") {
    return [
      {
        id: "all",
        titleEn: "All Habits",
        titleAr: "جميع العادات",
        emoji: "✨",
        habits,
      },
    ];
  }

  if (mode === "timeOfDay") {
    const morning: Habit[] = [];
    const afternoon: Habit[] = [];
    const evening: Habit[] = [];
    const anytime: Habit[] = [];

    habits.forEach((h) => {
      const time = h.preferredTime;
      if (!time) {
        anytime.push(h);
        return;
      }
      const hour = parseInt(time.split(":")[0], 10);
      if (isNaN(hour)) {
        anytime.push(h);
      } else if (hour < 12) {
        morning.push(h);
      } else if (hour < 17) {
        afternoon.push(h);
      } else {
        evening.push(h);
      }
    });

    const groups: HabitGroup[] = [];
    if (morning.length > 0) {
      groups.push({
        id: "morning",
        titleEn: "Morning Rituals",
        titleAr: "طقوس الصباح ☀️",
        emoji: "☀️",
        habits: morning,
      });
    }
    if (afternoon.length > 0) {
      groups.push({
        id: "afternoon",
        titleEn: "Afternoon Focus",
        titleAr: "تركيز الظهيرة 🌤️",
        emoji: "🌤️",
        habits: afternoon,
      });
    }
    if (evening.length > 0) {
      groups.push({
        id: "evening",
        titleEn: "Evening Wind-Down",
        titleAr: "هدوء المساء 🌙",
        emoji: "🌙",
        habits: evening,
      });
    }
    if (anytime.length > 0) {
      groups.push({
        id: "anytime",
        titleEn: "Throughout the Day",
        titleAr: "على مدار اليوم ✨",
        emoji: "✨",
        habits: anytime,
      });
    }
    return groups;
  }

  const catMap: Record<string, Habit[]> = {};
  habits.forEach((h) => {
    const cat = h.category || "General";
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(h);
  });

  const categoryMetadata: Record<string, { emoji: string; ar: string; en: string }> = {
    Deen: { emoji: "🕌", ar: "الدين والعبادات", en: "Deen & Devotion" },
    Health: { emoji: "🥗", ar: "الصحة والنشاط", en: "Health & Vitality" },
    "Self-care": { emoji: "💅", ar: "العناية بالذات", en: "Self-Care & Glow" },
    Personal: { emoji: "🌸", ar: "تطوير الذات", en: "Personal Growth" },
    Study: { emoji: "📚", ar: "الدراسة والتعلم", en: "Study & Knowledge" },
    Work: { emoji: "💼", ar: "العمل والإنتاجية", en: "Work & Productivity" },
    Money: { emoji: "💰", ar: "المال والميزانية", en: "Money & Habits" },
  };

  return Object.entries(catMap).map(([catKey, list]) => {
    const meta = categoryMetadata[catKey] || { emoji: "📌", ar: catKey, en: catKey };
    return {
      id: catKey,
      titleEn: meta.en,
      titleAr: meta.ar,
      emoji: meta.emoji,
      habits: list,
    };
  });
}

// ── 6. Cross-Module Synchronized Tracker Helpers ──────────────────────────────
export function getWaterStatusForDate(
  dateStr: string,
  dailyHydration: Record<string, DailyHydrationRecord> = {}
): { consumedMl: number; targetMl: number; percentage: number; isMet: boolean } {
  const record = dailyHydration[dateStr];
  const consumedMl = record?.consumedMl || 0;
  const targetMl = record?.targetMl || 2000;
  const percentage = Math.min(100, Math.round((consumedMl / targetMl) * 100));
  return {
    consumedMl,
    targetMl,
    percentage,
    isMet: consumedMl >= targetMl,
  };
}

export function getMoodStatusForDate(
  dateStr: string,
  dailyMoods: Record<string, DailyMoodRecord> = {}
): {
  hasRecord: boolean;
  mood?: string;
  emoji?: string;
  energy?: "low" | "medium" | "high";
  dayRating?: number;
} {
  const record = dailyMoods[dateStr];
  if (!record || !record.mood) {
    return { hasRecord: false };
  }

  const moodEmojis: Record<string, string> = {
    happy: "🌸",
    calm: "🌿",
    okay: "☁️",
    sad: "🌧️",
    anxious: "⚡",
    tired: "🌙",
    grateful: "🤍",
  };

  return {
    hasRecord: true,
    mood: record.mood,
    emoji: moodEmojis[record.mood] || "✨",
    energy: record.energy,
    dayRating: (record as any).dayRating,
  };
}

// ── 7. Flexible Habit Progress Helper ─────────────────────────────────────────
export function getFlexibleHabitWeekCount(habit: Habit, weekDays: DayInfo[]): {
  completedThisWeek: number;
  targetFrequency: number;
  isMet: boolean;
} {
  let completedThisWeek = 0;
  weekDays.forEach((d) => {
    const hist = habit.history?.[d.dateStr];
    const isDone = d.isToday ? Boolean(habit.days?.[6]) || Boolean(hist?.completed) : Boolean(hist?.completed);
    if (isDone) completedThisWeek++;
  });
  const targetFrequency = habit.weeklyFrequency || 3;
  return {
    completedThisWeek,
    targetFrequency,
    isMet: completedThisWeek >= targetFrequency,
  };
}
