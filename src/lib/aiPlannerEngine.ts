/**
 * AYXA Planner Pro — AI Planner Engine
 * Domain models, structured proposal validation, user-controlled context scoping,
 * deterministic built-in templates, prayer-relative planning anchors, and idempotent mutations.
 *
 * Strict safety rules:
 * 1. Zero XP: AI generation, retries, and proposal imports strictly award 0 XP.
 * 2. Privacy-first: Journal, Reset, Barakah Jar, Time Capsule, Bloom, Finance, Health/Mood,
 *    Brain Dump, photos, and task notes are strictly EXCLUDED from automatic AI context.
 * 3. Review-before-save: Model output is untrusted input. Nothing is created automatically.
 * 4. Idempotent: Every proposal has a unique ID preventing duplicate creations on retries/taps.
 */

import { calculatePrayerTimes, type PrayerTimeResult } from "./prayerTimes.ts";
import { formatLocalDateStr } from "./weeklyHabitEngine.ts";
import type { AppState } from "./store";

export type PlannerAppState = Record<string, any>;

// ============================================================================
// Types
// ============================================================================

export type AiProposalType = "task" | "routine" | "goal_step" | "study_session";

export type AiProposalDestination = "tasks" | "routines" | "goals" | "learning";

export interface AiProposal {
  id: string; // Unique idempotent proposal ID
  type: AiProposalType;
  title: string;
  destination: AiProposalDestination;
  targetDate?: string; // YYYY-MM-DD
  clockTime?: string; // HH:MM
  durationMinutes?: number;
  category?: string;
  tag?: string;
  recurrence?: "none" | "daily" | "weekdays" | "weekly";
  reminder?: boolean; // Defaults to false
  notes?: string;
  routineKey?: string; // Target routine key if appending step
  goalId?: string; // Target goal ID if milestone
  learningItemId?: string; // Target learning item ID
  validationIssues?: string[];
  applied?: boolean;
  appliedRecordId?: string;
  appliedAt?: string;
  applyError?: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  proposals?: AiProposal[];
  status?: "complete" | "incomplete" | "error";
  incompleteReason?: string;
  appliedProposalIds?: string[];
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

export interface ContextPermissionScope {
  granted: boolean;
  mode: "single_request" | "ongoing";
  sources: {
    openTasks: boolean;
    goalMilestones: boolean;
    routineSchedules: boolean;
    studyCommitments: boolean;
    planningWindows: boolean;
    configuredTimezone: boolean;
    prayerTimes: boolean; // Minimal anchors only, NEVER worship completion history
  };
  updatedAt: string;
}

export interface BuiltInTemplate {
  id: string;
  kind: "built_in_template";
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  promptEn: string;
  promptAr: string;
  proposals: Omit<AiProposal, "id">[];
}

export interface ContextInspectionResult {
  summaryText: string;
  inspectedFields: Record<string, string[]>;
  recordCounts: {
    tasks: number;
    goals: number;
    routines: number;
    learning: number;
    prayerAnchors: number;
  };
  excludedModules: string[];
}

// ============================================================================
// Defaults & Constants
// ============================================================================

export const DEFAULT_CONTEXT_SCOPE: ContextPermissionScope = {
  granted: false, // Default to NO personal context unless explicitly authorized
  mode: "single_request",
  sources: {
    openTasks: false,
    goalMilestones: false,
    routineSchedules: false,
    studyCommitments: false,
    planningWindows: false,
    configuredTimezone: true,
    prayerTimes: false,
  },
  updatedAt: new Date().toISOString(),
};

export const STRICT_EXCLUDED_MODULES = [
  "Journal Entries & PIN-locked text",
  "Weekly Reset reflection answers",
  "Barakah Jar gratitude notes",
  "Future Me Time Capsule letters",
  "Wheel of Becoming ratings & notes",
  "My Week in Bloom excerpts",
  "Private Financial accounts & transactions",
  "Mood, Health, & Wellbeing logs",
  "Brain Dump private text",
  "Task private notes (only titles & tags permitted)",
  "Photos, voice, & media recordings",
];

export const STARTER_PROMPTS = [
  {
    id: "plan_day",
    en: "Help me plan my day.",
    ar: "ساعديني في تنظيم يومي.",
  },
  {
    id: "night_shift",
    en: "Make a plan around my night shift.",
    ar: "رتّبي خطة تناسب مناوبتي الليلية.",
  },
  {
    id: "break_goal",
    en: "Break down a goal.",
    ar: "قسّمي هدفي إلى خطوات.",
  },
  {
    id: "gentle_routine",
    en: "Build a gentle routine.",
    ar: "اقترحي روتينًا هادئًا.",
  },
  {
    id: "organize_study",
    en: "Help me organize my study.",
    ar: "ساعديني في تنظيم دراستي.",
  },
];

// ============================================================================
// Deterministic Built-in Templates
// ============================================================================

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "barakah_routine",
    kind: "built_in_template",
    titleEn: "Barakah Daily Routine",
    titleAr: "جدول اليوم المبارك (الإنتاجية مع العبادة)",
    descEn: "A balanced daily rhythm weaving Fajr reflection, deep focus, and evening peace.",
    descAr: "إيقاع يومي متوازن يجمع بين طمأنينة الفجر، التركيز العميق، وهدوء المساء.",
    promptEn:
      "Create a complete daily routine combining Fajr prayer, morning Athkar, deep work sessions, study, and self-care.",
    promptAr:
      "أنشئي لي جدول يومي متكامل يجمع بين صلاة الفجر، قراءة الورد، التركيز في الدراسة والعمل، والعناية الذاتية مع الأوقات.",
    proposals: [
      {
        type: "routine",
        title: "Morning Athkar & Quran reading",
        destination: "routines",
        clockTime: "05:30",
        durationMinutes: 30,
        category: "Islamic",
        routineKey: "morning",
        reminder: false,
      },
      {
        type: "task",
        title: "Deep Focus Work Block (90m)",
        destination: "tasks",
        clockTime: "08:30",
        durationMinutes: 90,
        category: "Focus",
        tag: "Focus",
        reminder: false,
      },
      {
        type: "task",
        title: "Midday hydration & stretch break",
        destination: "tasks",
        clockTime: "12:30",
        durationMinutes: 15,
        category: "Self-Care",
        tag: "Self-Care",
        reminder: false,
      },
      {
        type: "task",
        title: "Evening walk & peaceful gratitude journal",
        destination: "tasks",
        clockTime: "17:30",
        durationMinutes: 30,
        category: "Wellness",
        tag: "Wellness",
        reminder: false,
      },
    ],
  },
  {
    id: "anti_procrastination",
    kind: "built_in_template",
    titleEn: "7-Day Anti-Procrastination Sprint",
    titleAr: "خطة الـ 7 أيام لتجاوز التسويف",
    descEn: "Gentle Pomodoro momentum without overwhelming your week.",
    descAr: "خطوات هادئة لكسر التسويف بأسلوب البومودورو والمكافآت الذاتية دون ضغط.",
    promptEn:
      "Give me a practical 7-day anti-procrastination plan using Pomodoro intervals and micro-rewards.",
    promptAr:
      "أعطني خطة عملية من 7 خطوات لتجاوز التسويف وإنجاز المهام المتراكمة بنظام البومودورو والمكافآت.",
    proposals: [
      {
        type: "task",
        title: "Identify 1 priority task & focus for 25 minutes",
        destination: "tasks",
        clockTime: "09:00",
        durationMinutes: 25,
        category: "Planning",
        tag: "Planning",
        reminder: false,
      },
      {
        type: "task",
        title: "Clear desk space & silence phone notifications",
        destination: "tasks",
        clockTime: "10:00",
        durationMinutes: 15,
        category: "Focus",
        tag: "Focus",
        reminder: false,
      },
      {
        type: "task",
        title: "Self-care tea break after completing 3 focus intervals ☕",
        destination: "tasks",
        clockTime: "13:00",
        durationMinutes: 20,
        category: "Self-Care",
        tag: "Self-Care",
        reminder: false,
      },
    ],
  },
  {
    id: "khatmah_plan",
    kind: "built_in_template",
    titleEn: "Monthly Quran Khatmah Schedule",
    titleAr: "جدول ختم القرآن الكريم في شهر",
    descEn:
      "4 pages after each of the 5 prayers (20 pgs/day = 600 pgs in 30 days + 4 final pages for 604-page Madinah Mushaf).",
    descAr:
      "قراءة 4 صفحات بعد كل صلاة (20 صفحة يومياً = 600 صفحة في 30 يوماً + 4 صفحات ختامية لمصحف المدينة 604 صفحات).",
    promptEn:
      "How can I easily complete the Quran in 30 days reading 4 pages after each obligatory prayer?",
    promptAr: "كيف أختم القرآن الكريم بسهولة خلال 30 يوم بمعدل 4 صفحات بعد كل صلاة؟",
    proposals: [
      {
        type: "task",
        title: "Read 4 Quran pages after Fajr ۞",
        destination: "tasks",
        clockTime: "05:45",
        durationMinutes: 15,
        category: "Deen",
        tag: "Deen",
        reminder: false,
      },
      {
        type: "task",
        title: "Read 4 Quran pages after Dhuhr ۞",
        destination: "tasks",
        clockTime: "12:45",
        durationMinutes: 15,
        category: "Deen",
        tag: "Deen",
        reminder: false,
      },
      {
        type: "task",
        title: "Read 4 Quran pages after Asr ۞",
        destination: "tasks",
        clockTime: "16:00",
        durationMinutes: 15,
        category: "Deen",
        tag: "Deen",
        reminder: false,
      },
      {
        type: "task",
        title: "Read 4 Quran pages after Maghrib ۞",
        destination: "tasks",
        clockTime: "19:15",
        durationMinutes: 15,
        category: "Deen",
        tag: "Deen",
        reminder: false,
      },
      {
        type: "task",
        title: "Read 4 Quran pages after Isha ۞",
        destination: "tasks",
        clockTime: "20:45",
        durationMinutes: 15,
        category: "Deen",
        tag: "Deen",
        reminder: false,
      },
    ],
  },
  {
    id: "night_shift_plan",
    kind: "built_in_template",
    titleEn: "Night Shift Transition Plan",
    titleAr: "خطة تنظيم المناوبة الليلية",
    descEn: "Gentle daytime rest anchor, light meal timing, and midnight focus windows.",
    descAr: "تنظيم وقت النوم النهاري الهادئ، الوجبات الخفيفة، والتركيز أثناء العمل الليلي.",
    promptEn: "Make a plan around my night shift with restful daytime sleep and sustained energy.",
    promptAr: "رتّبي خطة تناسب مناوبتي الليلية مع نوم نهاري مريح وطاقة مستدامة.",
    proposals: [
      {
        type: "routine",
        title: "Post-shift wind-down & darken room for sleep",
        destination: "routines",
        clockTime: "08:00",
        durationMinutes: 45,
        category: "Wellness",
        routineKey: "night",
        reminder: false,
      },
      {
        type: "task",
        title: "Uninterrupted daytime sleep block (10:00 - 16:30)",
        destination: "tasks",
        clockTime: "10:00",
        durationMinutes: 390,
        category: "Wellness",
        tag: "Wellness",
        reminder: false,
      },
      {
        type: "task",
        title: "Pre-shift light nourishing meal & hydration",
        destination: "tasks",
        clockTime: "18:30",
        durationMinutes: 30,
        category: "Self-Care",
        tag: "Self-Care",
        reminder: false,
      },
      {
        type: "task",
        title: "Shift deep focus & task block (22:00 - 02:00)",
        destination: "tasks",
        clockTime: "22:00",
        durationMinutes: 240,
        category: "Focus",
        tag: "Focus",
        reminder: false,
      },
    ],
  },
  {
    id: "goal_breakdown",
    kind: "built_in_template",
    titleEn: "Gentle Goal Breakdown",
    titleAr: "تقسيم الهدف بخطوات هادئة",
    descEn: "Transform a broad ambition into 3 manageable milestones without rushing.",
    descAr: "تحويل الهدف الكبير إلى 3 محطات واضحة يمكن تنفيذها دون توتر أو استعجال.",
    promptEn: "Break down a goal into manageable, stress-free milestones.",
    promptAr: "قسّمي هدفي إلى خطوات واضحة ومريحة يمكن البدء بها.",
    proposals: [
      {
        type: "goal_step",
        title: "Define core intention & 1 measurable first milestone",
        destination: "goals",
        category: "Personal",
        reminder: false,
      },
      {
        type: "goal_step",
        title: "Build the foundational draft / initial setup",
        destination: "goals",
        category: "Personal",
        reminder: false,
      },
      {
        type: "goal_step",
        title: "Gentle review & celebration of first milestone progress",
        destination: "goals",
        category: "Personal",
        reminder: false,
      },
    ],
  },
  {
    id: "study_week",
    kind: "built_in_template",
    titleEn: "Focused Study Week",
    titleAr: "خطة الأسبوع الدراسي المركّز",
    descEn: "Structured learning blocks with spaced recall and healthy breathing room.",
    descAr: "جلسات دراسية منظمة ترتكز على التكرار المتباعد وفترات راحة حقيقية.",
    promptEn: "Help me organize my study schedule for maximum focus and retention.",
    promptAr: "ساعديني في تنظيم دراستي مع أوقات تركيز واسترجاع دون إرهاق.",
    proposals: [
      {
        type: "study_session",
        title: "Core concept review & active recall notes (45m)",
        destination: "learning",
        clockTime: "10:00",
        durationMinutes: 45,
        category: "Study",
        reminder: false,
      },
      {
        type: "study_session",
        title: "Practice problems & test simulation (45m)",
        destination: "learning",
        clockTime: "14:00",
        durationMinutes: 45,
        category: "Study",
        reminder: false,
      },
      {
        type: "study_session",
        title: "Flashcard review & summary consolidation (30m)",
        destination: "learning",
        clockTime: "16:30",
        durationMinutes: 30,
        category: "Study",
        reminder: false,
      },
    ],
  },
];

// ============================================================================
// Proposal Parsing & Validation
// ============================================================================

/**
 * Validates a single proposal against safe schemas and user state.
 * Rejects unknown fields, unauthorized IDs, and invalid dates.
 */
export function validateProposal(
  proposal: unknown,
  state?: AppState,
): { isValid: boolean; proposal?: AiProposal; errors: string[] } {
  const errors: string[] = [];
  if (!proposal || typeof proposal !== "object") {
    return { isValid: false, errors: ["Proposal is not a valid object"] };
  }

  const p = proposal as Record<string, unknown>;

  // Required title
  const title = typeof p.title === "string" ? p.title.trim() : "";
  if (!title) {
    errors.push("Missing proposal title");
  }

  // Type
  const validTypes: AiProposalType[] = ["task", "routine", "goal_step", "study_session"];
  const type = validTypes.includes(p.type as AiProposalType) ? (p.type as AiProposalType) : "task";

  // Destination
  const validDests: AiProposalDestination[] = ["tasks", "routines", "goals", "learning"];
  const destination = validDests.includes(p.destination as AiProposalDestination)
    ? (p.destination as AiProposalDestination)
    : type === "routine"
      ? "routines"
      : type === "goal_step"
        ? "goals"
        : type === "study_session"
          ? "learning"
          : "tasks";

  // Date validation: YYYY-MM-DD
  let targetDate: string | undefined = undefined;
  if (typeof p.targetDate === "string" && p.targetDate.trim()) {
    const dStr = p.targetDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      targetDate = dStr;
    } else {
      errors.push(`Invalid targetDate format: "${dStr}". Must be YYYY-MM-DD.`);
    }
  }

  // Time validation: HH:MM
  let clockTime: string | undefined = undefined;
  if (typeof p.clockTime === "string" && p.clockTime.trim()) {
    const tStr = p.clockTime.trim();
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(tStr)) {
      clockTime = tStr;
    } else {
      errors.push(`Invalid clockTime format: "${tStr}". Must be HH:MM.`);
    }
  }

  // Duration minutes
  let durationMinutes: number | undefined = undefined;
  if (typeof p.durationMinutes === "number" && !isNaN(p.durationMinutes) && p.durationMinutes > 0) {
    durationMinutes = Math.min(Math.round(p.durationMinutes), 1440); // Cap at 24 hours
  }

  // Reference checks against state
  let goalId: string | undefined = undefined;
  if (typeof p.goalId === "string" && p.goalId.trim()) {
    const gid = p.goalId.trim();
    if (state && !state.goals.some((g: any) => g.id === gid)) {
      errors.push(`Goal ID "${gid}" does not exist in your planner.`);
    } else {
      goalId = gid;
    }
  }

  let routineKey: string | undefined = undefined;
  if (typeof p.routineKey === "string" && p.routineKey.trim()) {
    routineKey = p.routineKey.trim();
  }

  let learningItemId: string | undefined = undefined;
  if (typeof p.learningItemId === "string" && p.learningItemId.trim()) {
    const lid = p.learningItemId.trim();
    if (state && !state.learningItems?.some((l: any) => l.id === lid)) {
      errors.push(`Learning item ID "${lid}" does not exist.`);
    } else {
      learningItemId = lid;
    }
  }

  const sanitized: AiProposal = {
    id:
      typeof p.id === "string" && p.id.trim()
        ? p.id.trim()
        : `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    destination,
    targetDate,
    clockTime,
    durationMinutes,
    category: typeof p.category === "string" ? p.category.trim() : undefined,
    tag: typeof p.tag === "string" ? p.tag.trim() : undefined,
    recurrence: (["none", "daily", "weekdays", "weekly"].includes(p.recurrence as string)
      ? p.recurrence
      : "none") as AiProposal["recurrence"],
    reminder: Boolean(p.reminder), // Strictly default false
    notes: typeof p.notes === "string" ? p.notes.trim() : undefined,
    routineKey,
    goalId,
    learningItemId,
    validationIssues: errors.length > 0 ? errors : undefined,
  };

  return {
    isValid: errors.length === 0,
    proposal: sanitized,
    errors,
  };
}

/**
 * Extracts proposals from an assistant response containing a structured ```json:ayxa_plan ... ``` block,
 * or regular ```json ... ``` with a `proposals` array.
 */
export function extractProposalsFromText(text: string, state?: AppState): AiProposal[] {
  if (!text) return [];

  const proposals: AiProposal[] = [];

  // Match ```json:ayxa_plan ... ``` or ```json ... ``` blocks
  const jsonBlockRegex = /```(?:json:ayxa_plan|json)?\s*([\s\S]*?)\s*```/g;
  let match: RegExpExecArray | null;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    const codeContent = match[1].trim();
    if (codeContent.startsWith("{") || codeContent.startsWith("[")) {
      try {
        const parsed = JSON.parse(codeContent);
        const list = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.proposals)
            ? parsed.proposals
            : Array.isArray(parsed.items)
              ? parsed.items
              : [];

        for (const item of list) {
          const validated = validateProposal(item, state);
          if (validated.proposal) {
            proposals.push(validated.proposal);
          }
        }
      } catch {
        // Not valid JSON in this code block, continue
      }
    }
  }

  return proposals;
}

/**
 * Strips out the raw JSON proposals block from the readable markdown text so
 * the message displays cleanly in conversation bubbles.
 */
export function formatPlanTextWithoutRawJson(text: string): string {
  if (!text) return "";
  return text.replace(/```(?:json:ayxa_plan|json)\s*[\s\S]*?\s*```/g, "").trim();
}

// ============================================================================
// Context Building & Private Data Exclusions
// ============================================================================

/**
 * Builds user-controlled context summary with strict privacy exclusions.
 * If consent is not granted, returns an empty context payload.
 */
export function buildUserContextSummary(
  state: AppState,
  scope: ContextPermissionScope,
  targetDate?: string,
): ContextInspectionResult {
  const inspectedFields: Record<string, string[]> = {};
  const recordCounts = {
    tasks: 0,
    goals: 0,
    routines: 0,
    learning: 0,
    prayerAnchors: 0,
  };

  if (!scope.granted) {
    return {
      summaryText: "",
      inspectedFields,
      recordCounts,
      excludedModules: STRICT_EXCLUDED_MODULES,
    };
  }

  const sections: string[] = [];
  const refDate = targetDate || formatLocalDateStr(new Date());

  // 1. Timezone
  if (scope.sources.configuredTimezone) {
    const tz = state.prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    sections.push(`- User Local Timezone: ${tz}`);
    sections.push(`- Reference Date: ${refDate}`);
    inspectedFields["Timezone"] = ["timezone", "referenceDate"];
  }

  // 2. Open Tasks (Titles and Due Dates only - NO private task notes)
  if (scope.sources.openTasks) {
    const openTasks = (state.tasks || [])
      .filter((t: any) => !t.done && (!t.dueDate || t.dueDate >= refDate))
      .slice(0, 10); // Minimum necessary records

    recordCounts.tasks = openTasks.length;
    inspectedFields["Tasks"] = ["title", "dueDate", "optionalTime", "tag"];

    if (openTasks.length > 0) {
      sections.push(`\n### Open Tasks (${openTasks.length} items):`);
      openTasks.forEach((t: any) => {
        sections.push(
          `- [${t.tag || "Task"}] ${t.title}${t.dueDate ? ` (Due: ${t.dueDate}${t.optionalTime ? ` ${t.optionalTime}` : ""})` : ""}`,
        );
      });
    }
  }

  // 3. Goal Milestones (Titles & categories only)
  if (scope.sources.goalMilestones) {
    const activeGoals = (state.goals || []).filter((g: any) => !g.completed && !g.archived).slice(0, 5);

    recordCounts.goals = activeGoals.length;
    inspectedFields["Goals"] = ["title", "category", "targetDate", "milestones.title"];

    if (activeGoals.length > 0) {
      sections.push(`\n### Active Goals (${activeGoals.length} goals):`);
      activeGoals.forEach((g: any) => {
        const milestones = (g.milestones || [])
          .filter((m: any) => !m.completed)
          .map((m: any) => m.title)
          .join(", ");
        sections.push(`- Goal: ${g.title}${milestones ? ` (Milestones: ${milestones})` : ""}`);
      });
    }
  }

  // 4. Routine Schedules
  if (scope.sources.routineSchedules) {
    const routineKeys = ["morning", "evening", "night", "work"];
    const routineSummaries: string[] = [];

    routineKeys.forEach((key) => {
      const steps = (state.routines as any)?.[key] || [];
      if (steps.length > 0) {
        routineSummaries.push(
          `- ${key.toUpperCase()} Routine (${steps.length} steps): ${steps
            .slice(0, 4)
            .map((s: any) => s.title)
            .join(", ")}`,
        );
        recordCounts.routines += 1;
      }
    });

    inspectedFields["Routines"] = ["routineKey", "step.title", "step.time"];

    if (routineSummaries.length > 0) {
      sections.push(`\n### Scheduled Routines:`);
      sections.push(...routineSummaries);
    }
  }

  // 5. Study & Learning commitments
  if (scope.sources.studyCommitments) {
    const activeLearning = (state.learningItems || [])
      .filter((item: any) => item.status === "in_progress" || item.status === "active")
      .slice(0, 5);

    recordCounts.learning = activeLearning.length;
    inspectedFields["Learning"] = ["title", "type", "targetCompletionDate"];

    if (activeLearning.length > 0) {
      sections.push(`\n### Study Commitments (${activeLearning.length} subjects/courses):`);
      activeLearning.forEach((item: any) => {
        sections.push(`- [${item.type}] ${item.title}`);
      });
    }
  }

  // 6. Prayer Anchors (Only times/periods - NEVER worship completion history)
  if (scope.sources.prayerTimes) {
    const lat = state.deenSettings?.latitude || 33.5731;
    const lng = state.deenSettings?.longitude || -7.5898;
    try {
      const pt = calculatePrayerTimes(lat, lng, new Date());
      if (pt) {
        recordCounts.prayerAnchors = 5;
        inspectedFields["Prayer Anchors"] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        sections.push(`\n### Canonical Prayer Time Anchors:`);
        sections.push(`- Fajr: ${pt.fajr}`);
        sections.push(`- Dhuhr: ${pt.dhuhr}`);
        sections.push(`- Asr: ${pt.asr}`);
        sections.push(`- Maghrib: ${pt.maghrib}`);
        sections.push(`- Isha: ${pt.isha}`);
      }
    } catch {
      // Fallback silently if calculation fails
    }
  }

  return {
    summaryText: sections.join("\n"),
    inspectedFields,
    recordCounts,
    excludedModules: STRICT_EXCLUDED_MODULES,
  };
}

// ============================================================================
// Idempotent Canonical Mutations
// ============================================================================

export interface MutationResult {
  proposalId: string;
  success: boolean;
  destination: AiProposalDestination;
  recordId?: string;
  error?: string;
}

/**
 * Applies a confirmed proposal to the canonical store without awarding XP.
 * Guarantees idempotency via proposal ID checks.
 */
export function applyProposalToStore(
  proposal: AiProposal,
  actions: {
    addTask: (t: any) => void;
    addRoutineStep?: (key: string, step: any) => void;
    createUserRoutine?: (routine: any) => string;
    addGoalMilestone?: (goalId: string, milestone: any) => void;
    addGoal?: (g: any) => string;
    addLearningPlanItem?: (plan: any) => string;
    addStudyMinutes?: (subject: string, mins: number) => void;
  },
  appliedRecordIds: Set<string>,
): MutationResult {
  if (appliedRecordIds.has(proposal.id)) {
    return {
      proposalId: proposal.id,
      success: true,
      destination: proposal.destination,
      error: "Already applied previously (idempotent)",
    };
  }

  try {
    switch (proposal.destination) {
      case "tasks": {
        const taskId = `task_ai_${proposal.id}`;
        actions.addTask({
          id: taskId,
          title: proposal.title,
          dueDate: proposal.targetDate,
          optionalTime: proposal.clockTime,
          tag: proposal.category || proposal.tag || "AI Plan",
          notes: proposal.notes || "",
          reminder: Boolean(proposal.reminder),
          priority: "medium",
          done: false,
        });
        appliedRecordIds.add(proposal.id);
        return {
          proposalId: proposal.id,
          success: true,
          destination: "tasks",
          recordId: taskId,
        };
      }

      case "routines": {
        const routineKey = proposal.routineKey || "custom";
        if (
          actions.addRoutineStep &&
          ["morning", "evening", "night", "work"].includes(routineKey)
        ) {
          const stepId = `step_ai_${proposal.id}`;
          actions.addRoutineStep(routineKey, {
            id: stepId,
            title: proposal.title,
            time: proposal.clockTime,
            emoji: "🌸",
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "routines",
            recordId: stepId,
          };
        } else if (actions.createUserRoutine) {
          const newRoutineId = actions.createUserRoutine({
            key: `routine_${proposal.id}`,
            nameEn: proposal.title,
            nameAr: proposal.title,
            icon: "🌸",
            color: "rose",
            descriptionEn: "Created from AYXA AI proposal",
            descriptionAr: "تم إنشاؤه من مقترح مساعدة أيكسا",
            activeDays: [0, 1, 2, 3, 4, 5, 6],
            steps: [
              {
                id: `step_${proposal.id}`,
                title: proposal.title,
                time: proposal.clockTime,
                emoji: "✨",
              },
            ],
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "routines",
            recordId: newRoutineId,
          };
        }
        break;
      }

      case "goals": {
        if (proposal.goalId && actions.addGoalMilestone) {
          const milestoneId = `ms_ai_${proposal.id}`;
          actions.addGoalMilestone(proposal.goalId, {
            id: milestoneId,
            title: proposal.title,
            targetDate: proposal.targetDate,
            completed: false,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "goals",
            recordId: milestoneId,
          };
        } else if (actions.addGoal) {
          const newGoalId = actions.addGoal({
            title: proposal.title,
            category: proposal.category || "Personal",
            targetDate: proposal.targetDate,
            milestones: [
              {
                id: `ms_${proposal.id}`,
                title: "First gentle step",
                completed: false,
              },
            ],
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "goals",
            recordId: newGoalId,
          };
        }
        break;
      }

      case "learning": {
        if (proposal.learningItemId && actions.addLearningPlanItem) {
          const planItemId = actions.addLearningPlanItem({
            title: proposal.title,
            learningItemId: proposal.learningItemId,
            localDate: proposal.targetDate || formatLocalDateStr(new Date()),
            completed: false,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "learning",
            recordId: planItemId,
          };
        } else if (actions.addStudyMinutes) {
          actions.addStudyMinutes(
            proposal.category || "General Study",
            proposal.durationMinutes || 30,
          );
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "learning",
            recordId: `study_${proposal.id}`,
          };
        }
        break;
      }
    }

    return {
      proposalId: proposal.id,
      success: false,
      destination: proposal.destination,
      error: `Unsupported destination or missing store action: ${proposal.destination}`,
    };
  } catch (err: any) {
    return {
      proposalId: proposal.id,
      success: false,
      destination: proposal.destination,
      error: err.message || "Failed to apply proposal to planner",
    };
  }
}

// ============================================================================
// Normalizers
// ============================================================================

export function normalizeAiConversation(raw: any): AiConversation {
  if (!raw || typeof raw !== "object") {
    return {
      id: `conv_${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  const messages: AiMessage[] = Array.isArray(raw.messages)
    ? raw.messages.map((m: any) => ({
        id: String(m.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        role: ["user", "assistant", "system"].includes(m.role) ? m.role : "user",
        content: String(m.content || ""),
        createdAt: String(m.createdAt || new Date().toISOString()),
        proposals: Array.isArray(m.proposals)
          ? m.proposals.map((p: any) => validateProposal(p).proposal!).filter(Boolean)
          : undefined,
        status: ["complete", "incomplete", "error"].includes(m.status) ? m.status : "complete",
        incompleteReason: typeof m.incompleteReason === "string" ? m.incompleteReason : undefined,
        appliedProposalIds: Array.isArray(m.appliedProposalIds) ? m.appliedProposalIds : [],
      }))
    : [];

  return {
    id: String(raw.id || `conv_${Date.now()}`),
    title: String(raw.title || "Conversation"),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    messages,
  };
}

export function normalizeAiContextConsent(raw: any): ContextPermissionScope {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_CONTEXT_SCOPE };
  }

  return {
    granted: Boolean(raw.granted),
    mode: raw.mode === "ongoing" ? "ongoing" : "single_request",
    sources: {
      openTasks: Boolean(raw.sources?.openTasks),
      goalMilestones: Boolean(raw.sources?.goalMilestones),
      routineSchedules: Boolean(raw.sources?.routineSchedules),
      studyCommitments: Boolean(raw.sources?.studyCommitments),
      planningWindows: Boolean(raw.sources?.planningWindows),
      configuredTimezone: raw.sources?.configuredTimezone !== false,
      prayerTimes: Boolean(raw.sources?.prayerTimes),
    },
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}
