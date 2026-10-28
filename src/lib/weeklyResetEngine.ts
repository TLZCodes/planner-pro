/**
 * Weekly Reset Studio Engine — AYXA Planner Pro
 * Pure helpers, statistics aggregators, prompt sets, and task mutation previewers.
 * Preserves zero data fabrication, full privacy protection, and canonical single-source-of-truth.
 */

import {
  type WeekInfo,
  type DayInfo,
  getWeekDaysInfo,
  computeWeeklyProgress,
  type WeeklyHabitProgress,
} from "./weeklyHabitEngine.ts";
export interface TaskRecord {
  id: string;
  title: string;
  done?: boolean;
  doneDate?: string;
  completedAt?: string;
  dueDate?: string;
  due?: string;
  category?: string;
  goalId?: string;
  [key: string]: any;
}

export interface GoalRecord {
  id: string;
  title: string;
  status?: string;
  progress?: number;
  category?: string;
  [key: string]: any;
}

export interface FocusSessionRecord {
  id: string;
  localDate?: string;
  startedAt?: string;
  status?: string;
  sourceType?: string;
  actualFocusSeconds?: number;
  plannedFocusSeconds?: number;
  [key: string]: any;
}

export interface StudySessionRecord {
  id?: string;
  date: string;
  minutes: number;
  [key: string]: any;
}

export interface RoutineStepRecord {
  id: string;
  title: string;
  [key: string]: any;
}

export interface WeeklyNoteState {
  id: string;
  userId?: string;
  weekStartDate: string;
  text?: string;
  journalEntryId?: string;
  reflectionAnswers?: Record<string, string>;
  completedReflection?: boolean;
  energyDrained?: string;
  energyRestored?: string;
  accomplishments?: ResetAccomplishment[];
  nextWeekPriorities?: NextWeekPriority[];
  nextWeekIntention?: string;
  [key: string]: any;
}

export interface JournalEntryState {
  id: string;
  title?: string;
  body?: string;
  [key: string]: any;
}

// ── 1. Prompt Sets (Canonical English & Arabic) ──────────────────────────────

export interface ReflectionPromptItem {
  id: string;
  emoji: string;
  questionEn: string;
  questionAr: string;
  placeholderEn: string;
  placeholderAr: string;
}

export const WEEKLY_RESET_PROMPTS: ReflectionPromptItem[] = [
  {
    id: "went_well",
    emoji: "🌸",
    questionEn: "What went well?",
    questionAr: "ما الذي سار جيدًا؟",
    placeholderEn: "Moments of ease, things that flowed smoothly, or small joys...",
    placeholderAr: "لحظات من التيسير، أمور سارت بسلاسة، أو مسرات لطيفة...",
  },
  {
    id: "supported_me",
    emoji: "🤍",
    questionEn: "What supported me this week?",
    questionAr: "ما الذي دعمني هذا الأسبوع؟",
    placeholderEn: "People, rituals, nourishing meals, restful pauses, or gentle boundaries...",
    placeholderAr: "أشخاص، طقوس هادئة، وجبات مغذية، استراحات، أو حدود واعية...",
  },
  {
    id: "felt_difficult",
    emoji: "🌧️",
    questionEn: "What felt difficult?",
    questionAr: "ما الذي كان صعبًا؟",
    placeholderEn: "Moments of friction, tiredness, delays, or emotional weight...",
    placeholderAr: "مواقف ثقيلة، تعب، تأخير، أو مشاعر احتاجت احتواء...",
  },
  {
    id: "adjust",
    emoji: "🌿",
    questionEn: "What would I like to adjust?",
    questionAr: "ما الذي أرغب في تعديله؟",
    placeholderEn: "Gentle shifts in pace, expectations, screen time, or daily order...",
    placeholderAr: "تعديل هادئ في الإيقاع، التوقعات، وقت الشاشات، أو ترتيب اليوم...",
  },
  {
    id: "gratitude",
    emoji: "✨",
    questionEn: "What am I grateful for?",
    questionAr: "ما الذي أشعر بالامتنان له؟",
    placeholderEn: "Blessings that carried you, peaceful mornings, answered prayers...",
    placeholderAr: "نعم غمرتكِ، صباحات هادئة، دعوات مطمئنة...",
  },
  {
    id: "carry_forward",
    emoji: "🕊️",
    questionEn: "What would I like to carry into next week?",
    questionAr: "ما الذي أرغب في حمله معي إلى الأسبوع القادم؟",
    placeholderEn: "A comforting mindset, a helpful rhythm, or a gentle truth...",
    placeholderAr: "فكرة مطمئنة، إيقاع نافع، أو يقين لطيف أرافقه في أيامي...",
  },
];

export const ENERGY_CARDS = {
  drained: {
    id: "energy_drained",
    emoji: "🪫",
    titleEn: "What drained my energy?",
    titleAr: "ما الذي استنزف طاقتي؟",
    placeholderEn: "Overthinking, too many commitments, poor sleep, rushing...",
    placeholderAr: "تفكير زائد، التزامات كثيرة، قلة نوم، استعجال...",
  },
  restored: {
    id: "energy_restored",
    emoji: "⚡",
    titleEn: "What restored my energy?",
    titleAr: "ما الذي أعاد لي طاقتي؟",
    placeholderEn: "Quiet silence, outdoor walks, prayer, warm tea, gentle journaling...",
    placeholderAr: "هدوء وصمت، مشي في الهواء الطلق، صلاة بخشوع، شاي دافئ، تدوين لطيف...",
  },
};

// ── 2. Data Aggregation from Canonical Records ──────────────────────────────

export interface WeekOverviewMetrics {
  completedTasksCount: number;
  completedTasksInWeek: TaskRecord[];
  unfinishedTasksInWeek: TaskRecord[];
  habitProgress: WeeklyHabitProgress;
  totalFocusSeconds: number;
  totalStudyMinutes: number;
  studyFocusOverlapMinutes: number;
  activeGoalsCount: number;
  goalsWithProgressCount: number;
  routineDoneCount: number;
  daysWithMoodLogsCount: number;
  averageWaterMl: number;
  hasAnyActivity: boolean;
}

/**
 * Aggregates fact-based metrics for the specified week window.
 * Strictly adheres to truthfulness: does NOT fabricate statistics.
 */
export function aggregateWeekOverviewMetrics(params: {
  weekInfo: WeekInfo;
  tasks: TaskRecord[];
  habits: any[];
  goals: GoalRecord[];
  focusSessions?: FocusSessionRecord[];
  studySessions?: StudySessionRecord[];
  routines?: Record<string, RoutineStepRecord[]>;
  routineCompletionsByDate?: Record<string, string[]>;
  dailyMoods?: Record<string, any>;
  dailyHydration?: Record<string, any>;
}): WeekOverviewMetrics {
  const {
    weekInfo,
    tasks = [],
    habits = [],
    goals = [],
    focusSessions = [],
    studySessions = [],
    routineCompletionsByDate = {},
    dailyMoods = {},
    dailyHydration = {},
  } = params;

  const weekStart = weekInfo.weekStartDate;
  const weekEnd = weekInfo.weekEndDate;

  // 1. Task completions in selected week
  // A task counts if done AND its doneDate (or completedAt date) falls within [weekStart, weekEnd]
  const completedTasksInWeek = tasks.filter((t) => {
    if (!t.done) return false;
    const cDate = t.doneDate || (t.completedAt ? t.completedAt.slice(0, 10) : undefined);
    if (!cDate) return false;
    return cDate >= weekStart && cDate <= weekEnd;
  });

  // Unfinished tasks: due in this week, still open
  const unfinishedTasksInWeek = tasks.filter((t) => {
    if (t.done) return false;
    const dDate = t.dueDate || (t.due ? t.due.slice(0, 10) : undefined);
    if (!dDate) return false;
    return dDate >= weekStart && dDate <= weekEnd;
  });

  // 2. Habit progress using shared canonical service
  const habitProgress = computeWeeklyProgress(habits, weekInfo);

  // 3. Focus sessions in selected week
  const weekFocusSessions = focusSessions.filter((s) => {
    const sDate = s.localDate || (s.startedAt ? s.startedAt.slice(0, 10) : undefined);
    if (!sDate) return false;
    return (
      sDate >= weekStart &&
      sDate <= weekEnd &&
      (s.status === "completed" || (s as any).status === "active")
    );
  });

  const totalFocusSeconds = weekFocusSessions.reduce(
    (acc, s) =>
      acc + (s.actualFocusSeconds || s.plannedFocusSeconds || (s as any).durationSeconds || 0),
    0
  );

  // 4. Study sessions in selected week
  const weekStudySessions = studySessions.filter((ss) => {
    return ss.date >= weekStart && ss.date <= weekEnd;
  });

  const totalStudyMinutes = weekStudySessions.reduce((acc, ss) => acc + (ss.minutes || 0), 0);

  // Calculate study/focus overlap: focus sessions linked to study subjects
  const studyFocusOverlapSeconds = weekFocusSessions
    .filter((s) => s.sourceType === "subject")
    .reduce((acc, s) => acc + (s.actualFocusSeconds || s.plannedFocusSeconds || 0), 0);
  const studyFocusOverlapMinutes = Math.round(studyFocusOverlapSeconds / 60);

  // 5. Goals snapshot
  const activeGoals = goals.filter((g) => (g.status || "active") === "active");
  const goalsWithProgress = activeGoals.filter((g) => (g.progress || 0) > 0);

  // 6. Routine activity in selected week
  let routineDoneCount = 0;
  weekInfo.days.forEach((d) => {
    const list = routineCompletionsByDate[d.dateStr];
    if (Array.isArray(list)) {
      routineDoneCount += list.length;
    }
  });

  // 7. Wellness / Mood & Hydration
  let daysWithMoodLogsCount = 0;
  let totalWaterMl = 0;
  let waterDaysCount = 0;

  weekInfo.days.forEach((d) => {
    if (dailyMoods[d.dateStr]?.mood) {
      daysWithMoodLogsCount++;
    }
    const hyd = dailyHydration[d.dateStr];
    if (hyd && hyd.consumedMl > 0) {
      totalWaterMl += hyd.consumedMl;
      waterDaysCount++;
    }
  });

  const averageWaterMl = waterDaysCount > 0 ? Math.round(totalWaterMl / waterDaysCount) : 0;

  const hasAnyActivity =
    completedTasksInWeek.length > 0 ||
    habitProgress.completedOccurrences > 0 ||
    totalFocusSeconds > 0 ||
    totalStudyMinutes > 0 ||
    routineDoneCount > 0 ||
    daysWithMoodLogsCount > 0;

  return {
    completedTasksCount: completedTasksInWeek.length,
    completedTasksInWeek,
    unfinishedTasksInWeek,
    habitProgress,
    totalFocusSeconds,
    totalStudyMinutes,
    studyFocusOverlapMinutes,
    activeGoalsCount: activeGoals.length,
    goalsWithProgressCount: goalsWithProgress.length,
    routineDoneCount,
    daysWithMoodLogsCount,
    averageWaterMl,
    hasAnyActivity,
  };
}

// ── 3. Accomplishments Models ────────────────────────────────────────────────

export interface ResetAccomplishment {
  id: string;
  title: string;
  sourceType: "task" | "goal" | "manual";
  sourceId?: string;
  category?: string;
  note?: string;
  photoUrl?: string;
}

// ── 4. Next Week Priorities ──────────────────────────────────────────────────

export type PriorityType = "note" | "linked_goal" | "linked_task" | "proposed_task";

export interface NextWeekPriority {
  id: string;
  title: string;
  type: PriorityType;
  linkedGoalId?: string;
  linkedTaskId?: string;
  proposedDueDate?: string; // YYYY-MM-DD
  proposedDueTime?: string; // HH:MM
  category?: string;
  isApplied?: boolean;
}

// ── 5. Unfinished Task Action Choices ────────────────────────────────────────

export type UnfinishedTaskAction = "keep" | "reschedule" | "delete";

export interface TaskMutationPlan {
  taskId: string;
  taskTitle: string;
  action: UnfinishedTaskAction;
  originalDueDate?: string;
  newDueDate?: string;
  newDueTime?: string;
  category?: string;
  linkedGoalId?: string;
}

// ── 6. Full Weekly Reset Draft State ─────────────────────────────────────────

export interface WeeklyResetDraft {
  weekStartDate: string; // Stable week identifier YYYY-MM-DD
  weekEndDate: string;
  status: "draft" | "finished";
  currentStep: number; // 0=overview, 1=reflection, 2=energy, 3=accomplishments, 4=unfinished, 5=priorities, 6=preview, 7=finished
  reflectionAnswers: Record<string, string>;
  energyDrained: string;
  energyRestored: string;
  accomplishments: ResetAccomplishment[];
  nextWeekPriorities: NextWeekPriority[];
  taskActionPlans: Record<string, TaskMutationPlan>; // taskId -> plan
  nextWeekIntention: string;
  lastSavedAt: string;
  journalEntryId?: string;
}

/**
 * Creates or normalizes a Weekly Reset draft safely.
 */
export function initializeWeeklyResetDraft(
  weekInfo: WeekInfo,
  existingNote?: WeeklyNoteState,
  existingJournal?: JournalEntryState
): WeeklyResetDraft {
  const weekStartDate = weekInfo.weekStartDate;
  const weekEndDate = weekInfo.weekEndDate;

  // If a note already exists with reflectionAnswers, hydrate from it
  const initialAnswers: Record<string, string> = {
    ...(existingNote?.reflectionAnswers || {}),
  };

  return {
    weekStartDate,
    weekEndDate,
    status: existingNote?.completedReflection ? "finished" : "draft",
    currentStep: existingNote?.completedReflection ? 7 : 0,
    reflectionAnswers: initialAnswers,
    energyDrained: (existingNote as any)?.energyDrained || "",
    energyRestored: (existingNote as any)?.energyRestored || "",
    accomplishments: (existingNote as any)?.accomplishments || [],
    nextWeekPriorities: (existingNote as any)?.nextWeekPriorities || [
      { id: "p1", title: "", type: "note" },
      { id: "p2", title: "", type: "note" },
      { id: "p3", title: "", type: "note" },
    ],
    taskActionPlans: {},
    nextWeekIntention: (existingNote as any)?.nextWeekIntention || "",
    lastSavedAt: new Date().toISOString(),
    journalEntryId: existingNote?.journalEntryId || existingJournal?.id,
  };
}

/**
 * Builds formatted markdown text for the canonical JournalEntry.
 */
export function compileResetJournalBody(
  draft: WeeklyResetDraft,
  formattedRange: string,
  isAr: boolean
): string {
  const lines: string[] = [];

  lines.push(
    `# 🌸 ${isAr ? "مساحة مراجعة الأسبوع" : "Weekly Reset Studio"} (${formattedRange})`
  );
  lines.push("");

  // 1. Next week intention if set
  if (draft.nextWeekIntention.trim()) {
    lines.push(`> ✨ **${isAr ? "نية الأسبوع القادم" : "Next Week Intention"}:**`);
    lines.push(`> ${draft.nextWeekIntention.trim()}`);
    lines.push("");
  }

  // 2. Reflection Answers
  lines.push(`## 📖 ${isAr ? "تأملات الأسبوع الهادئة" : "Gentle Weekly Reflections"}`);
  WEEKLY_RESET_PROMPTS.forEach((p) => {
    const ans = draft.reflectionAnswers[p.id]?.trim();
    if (ans) {
      lines.push(`### ${p.emoji} ${isAr ? p.questionAr : p.questionEn}`);
      lines.push(ans);
      lines.push("");
    }
  });

  // 3. Energy cards
  if (draft.energyDrained.trim() || draft.energyRestored.trim()) {
    lines.push(`## ⚡ ${isAr ? "تأمل الطاقة والحيوية" : "Energy & Vitality Reflections"}`);
    if (draft.energyDrained.trim()) {
      lines.push(`**🪫 ${isAr ? "ما استنزف طاقتي" : "What drained my energy"}:**`);
      lines.push(draft.energyDrained.trim());
      lines.push("");
    }
    if (draft.energyRestored.trim()) {
      lines.push(`**⚡ ${isAr ? "ما أعاد لي طاقتي" : "What restored my energy"}:**`);
      lines.push(draft.energyRestored.trim());
      lines.push("");
    }
  }

  // 4. Chosen Accomplishments
  const validAccs = draft.accomplishments.filter((a) => a.title.trim());
  if (validAccs.length > 0) {
    lines.push(`## 🏆 ${isAr ? "إنجازات ولحظات أعتز بها" : "Cherished Accomplishments"}`);
    validAccs.forEach((acc) => {
      lines.push(`- **${acc.title.trim()}** ${acc.note ? `— ${acc.note}` : ""}`);
    });
    lines.push("");
  }

  // 5. Next Week 3 Priorities
  const validPrios = draft.nextWeekPriorities.filter((p) => p.title.trim());
  if (validPrios.length > 0) {
    lines.push(`## 🎯 ${isAr ? "أولويات الأسبوع القادم الثلاث" : "Top 3 Priorities for Next Week"}`);
    validPrios.forEach((p, idx) => {
      lines.push(`${idx + 1}. **${p.title.trim()}** (${p.type})`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
