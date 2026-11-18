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

export type AiProposalType =
  | "task"
  | "complete_task"
  | "habit"
  | "complete_habit"
  | "routine"
  | "goal"
  | "goal_step"
  | "wish"
  | "study_session"
  | "book"
  | "hydration"
  | "mood"
  | "selfcare"
  | "quran"
  | "prayer"
  | "journal"
  | "barakah_note"
  | "expense"
  | "income"
  | "brain_dump"
  | "trip"
  | "project";

export type AiProposalDestination =
  | "tasks"
  | "habits"
  | "routines"
  | "goals"
  | "learning"
  | "wellness"
  | "deen"
  | "journal"
  | "finance"
  | "inbox"
  | "travel"
  | "business";

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
  emoji?: string;
  amount?: number; // Water ml, Quran pages, money amount, etc.
  targetId?: string; // Existing task/habit/goal ID to toggle or update
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
  requestId?: string;
  feedbackRating?: "good" | "bad";
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
  const validTypes: AiProposalType[] = [
    "task",
    "complete_task",
    "habit",
    "complete_habit",
    "routine",
    "goal",
    "goal_step",
    "wish",
    "study_session",
    "book",
    "hydration",
    "mood",
    "selfcare",
    "quran",
    "prayer",
    "journal",
    "barakah_note",
    "expense",
    "income",
    "brain_dump",
    "trip",
    "project",
  ];
  const type = validTypes.includes(p.type as AiProposalType) ? (p.type as AiProposalType) : "task";

  // Destination
  const validDests: AiProposalDestination[] = [
    "tasks",
    "habits",
    "routines",
    "goals",
    "learning",
    "wellness",
    "deen",
    "journal",
    "finance",
    "inbox",
    "travel",
    "business",
  ];
  const inferredDest: AiProposalDestination =
    type === "habit" || type === "complete_habit"
      ? "habits"
      : type === "routine"
        ? "routines"
        : type === "goal" || type === "goal_step" || type === "wish"
          ? "goals"
          : type === "study_session" || type === "book"
            ? "learning"
            : type === "hydration" || type === "mood" || type === "selfcare"
              ? "wellness"
              : type === "quran" || type === "prayer"
                ? "deen"
                : type === "journal" || type === "barakah_note"
                  ? "journal"
                  : type === "expense" || type === "income"
                    ? "finance"
                    : type === "brain_dump"
                      ? "inbox"
                      : type === "trip"
                        ? "travel"
                        : type === "project"
                          ? "business"
                          : "tasks";

  const destination = validDests.includes(p.destination as AiProposalDestination)
    ? (p.destination as AiProposalDestination)
    : inferredDest;

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
    emoji: typeof p.emoji === "string" ? p.emoji.trim() : undefined,
    amount: typeof p.amount === "number" && !isNaN(p.amount) ? p.amount : undefined,
    targetId: typeof p.targetId === "string" ? p.targetId.trim() : undefined,
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

/**
 * Builds a comprehensive Omni-App live snapshot across ALL modules of AYXA Planner Pro
 * so AYXA Muse Pro has full intelligence and visibility to assist and manage the entire app.
 */
export function buildFullAppOmniContext(
  state: PlannerAppState,
  currentDateStr?: string
): string {
  const today = currentDateStr || formatLocalDateStr(new Date());
  const lines: string[] = [];

  lines.push(`=== AYXA PLANNER PRO — FULL LIVE APPLICATION STATE (TODAY: ${today}) ===`);

  // 1. User Profile & Level
  const userName = state.user?.name || "Queen";
  const xp = state.xp || 0;
  const level = Math.floor(xp / 200) + 1;
  lines.push(`User: ${userName} | Level: ${level} (${xp} XP) | Timezone: ${state.prefs?.timezone || "Local"}`);

  // 2. Tasks (Open & Completed Today)
  const allTasks = Array.isArray(state.tasks) ? state.tasks : [];
  const openTasks = allTasks.filter((t: any) => !t.done);
  const doneToday = allTasks.filter((t: any) => t.done && (!t.dueDate || t.dueDate === today));
  lines.push(`\n[TASKS] Open: ${openTasks.length} | Completed Today: ${doneToday.length}`);
  openTasks.slice(0, 20).forEach((t: any) => {
    const due = t.dueDate ? ` (Due: ${t.dueDate})` : "";
    const time = t.optionalTime ? ` @ ${t.optionalTime}` : "";
    const prio = t.priority ? ` [${t.priority}]` : "";
    const top3 = t.isTopThree ? " ⭐Top3" : "";
    lines.push(`- Task [id:${t.id}]: "${t.title}"${due}${time}${prio} (Tag: ${t.tag || "General"})${top3}`);
  });

  // 3. Habits & Streaks
  const allHabits = Array.isArray(state.habits)
    ? state.habits.filter((h: any) => !h.archived && h.status !== "archived")
    : [];
  lines.push(`\n[HABITS] Active Habits: ${allHabits.length}`);
  allHabits.slice(0, 15).forEach((h: any) => {
    const doneTodayFlag = Boolean(h.history?.[today] || (Array.isArray(h.completedDates) && h.completedDates.includes(today)));
    lines.push(
      `- Habit [id:${h.id}]: ${h.emoji || "🌸"} "${h.name}" | Streak: ${h.streak || 0}d | Today: ${doneTodayFlag ? "✅ Done" : "⏳ Pending"}`
    );
  });

  // 4. Routines
  const routineKeys = ["morning", "evening", "night", "work"];
  const routineLines: string[] = [];
  routineKeys.forEach((key) => {
    const steps = (state.routines as any)?.[key] || [];
    if (steps.length > 0) {
      const doneSteps = steps.filter((s: any) => s.done).length;
      routineLines.push(
        `- ${key.toUpperCase()} (${doneSteps}/${steps.length} done): ${steps
          .slice(0, 6)
          .map((s: any) => `${s.title}${s.time ? ` (${s.time})` : ""}`)
          .join(", ")}`
      );
    }
  });
  if (Array.isArray(state.userRoutines) && state.userRoutines.length > 0) {
    state.userRoutines.slice(0, 5).forEach((ur: any) => {
      routineLines.push(`- Custom Routine "${ur.nameEn || ur.nameAr}": ${(ur.steps || []).length} steps`);
    });
  }
  if (routineLines.length > 0) {
    lines.push(`\n[ROUTINES]`);
    lines.push(...routineLines);
  }

  // 5. Goals & Someday Garden Wishes
  const activeGoals = (state.goals || []).filter((g: any) => !g.completed && !g.archived);
  lines.push(`\n[GOALS & MILESTONES] Active Goals: ${activeGoals.length}`);
  activeGoals.slice(0, 10).forEach((g: any) => {
    const pendingMs = (g.milestones || [])
      .filter((m: any) => !m.completed && !m.done)
      .map((m: any) => m.title)
      .slice(0, 4)
      .join(", ");
    lines.push(
      `- Goal [id:${g.id}]: "${g.title}" (${g.category || "Personal"}, Progress: ${g.progress || 0}%)${pendingMs ? ` | Next Milestones: ${pendingMs}` : ""}`
    );
  });

  const wishes = (state.somedayWishes || []).filter((w: any) => !w.archived);
  if (wishes.length > 0) {
    lines.push(
      `[SOMEDAY GARDEN WISHES]: ${wishes
        .slice(0, 6)
        .map((w: any) => w.title)
        .join(" | ")}`
    );
  }

  // 6. Deen, Prayer Times & Quran
  const lat = state.deenSettings?.latitude || 33.5731;
  const lng = state.deenSettings?.longitude || -7.5898;
  try {
    const pt = calculatePrayerTimes(lat, lng, new Date());
    if (pt) {
      const todayPrayers = (state.prayerLog || {})[today] || {};
      const loggedList = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
        .filter((k) => todayPrayers[k]?.completed)
        .join(", ");
      lines.push(
        `\n[DEEN & PRAYER TIMES] Fajr: ${pt.fajr} | Dhuhr: ${pt.dhuhr} | Asr: ${pt.asr} | Maghrib: ${pt.maghrib} | Isha: ${pt.isha}`
      );
      lines.push(`Prayers Logged Today: ${loggedList || "None yet"}`);
    }
  } catch {
    // Ignore prayer calculation fallback
  }
  if (state.quranGoal) {
    lines.push(
      `Quran Progress: ${state.quranGoal.completedAmount || 0} / ${state.quranGoal.targetAmount || 604} ${state.quranGoal.unit || "pages"}`
    );
  }

  // 7. Wellness, Hydration, Mood & Self-Care
  const todayWaterMl = state.dailyHydration?.[today] ?? state.hydration ?? 0;
  const waterTargetMl = state.wellnessSettings?.dailyWaterGoalMl || state.hydrationTarget?.targetMl || 2000;
  const todayMoodObj = state.dailyMoods?.[today];
  lines.push(
    `\n[WELLNESS & SELF-CARE] Water Today: ${todayWaterMl}ml / ${waterTargetMl}ml | Mood Today: ${todayMoodObj?.mood || "Not logged"} | Energy: ${todayMoodObj?.energy || "Not logged"}`
  );

  // 8. Learning, Bookshelf & Study
  const activeBooks = (state.books || []).filter((b: any) => !b.archived && b.status !== "finished" && b.status !== "completed");
  const activeLearning = (state.learningItems || []).filter((l: any) => !l.archived && l.status !== "completed");
  if (activeBooks.length > 0 || activeLearning.length > 0) {
    lines.push(`\n[LEARNING & BOOKSHELF]`);
    activeBooks.slice(0, 5).forEach((b: any) => {
      lines.push(`- Book: "${b.title}" (${b.currentPage || b.readPages || 0}/${b.totalPages || 200} pages)`);
    });
    activeLearning.slice(0, 5).forEach((l: any) => {
      lines.push(`- [${l.type}] "${l.title}" (Progress: ${l.progress || 0}%)`);
    });
  }

  // 9. Finance & Savings
  const moneyEntries = Array.isArray(state.money) ? state.money : [];
  const savingsGoals = Array.isArray(state.savingsGoals) ? state.savingsGoals : [];
  if (moneyEntries.length > 0 || savingsGoals.length > 0) {
    const totalIncome = moneyEntries
      .filter((m: any) => m.type === "income")
      .reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0);
    const totalExpense = moneyEntries
      .filter((m: any) => m.type === "expense")
      .reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0);
    lines.push(
      `\n[FINANCE] Logged Income: ${totalIncome} | Logged Expenses: ${totalExpense} | Active Savings Goals: ${savingsGoals.length}`
    );
  }

  // 10. Brain Dump Inbox, Business & Travel
  const inboxItems = (state.brainDumpItems || []).filter((i: any) => !i.archived && !i.organizedTo);
  const projects = (state.businessProjects || []).filter((p: any) => !p.archived);
  const trips = (state.travelTrips || []).filter((t: any) => !t.archived);
  if (inboxItems.length > 0 || projects.length > 0 || trips.length > 0) {
    lines.push(
      `\n[INBOX, BUSINESS & TRAVEL] Unprocessed Brain Dump Thoughts: ${inboxItems.length} | Active Business Projects: ${projects.length} | Travel Trips: ${trips.length}`
    );
    inboxItems.slice(0, 4).forEach((item: any) => {
      lines.push(`- Inbox Thought: "${item.content.slice(0, 80)}"`);
    });
  }

  return lines.join("\n");
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
    toggleTask?: (id: string) => void;
    addHabit?: (h: any) => void;
    toggleHabit?: (id: string, date?: string) => void;
    addRoutineStep?: (key: string, step: any) => void;
    createUserRoutine?: (routine: any) => string;
    addGoalMilestone?: (goalId: string, milestone: any) => void;
    addGoal?: (g: any) => string;
    addSomedayWish?: (w: any) => string;
    addLearningPlanItem?: (plan: any) => string;
    addStudyMinutes?: (subject: string, mins: number) => void;
    addBook?: (b: any) => string;
    addHydration?: (ml: number, date?: string) => void;
    setDailyMood?: (date: string, mood: any, energy?: any) => void;
    addCareActivity?: (act: any) => string;
    logQuranProgress?: (date: string, amount: number, unit?: string) => void;
    togglePrayerLog?: (date: string, prayerKey: string, note?: string) => void;
    addJournal?: (j: any) => string;
    addMoney?: (m: any) => void;
    addBrainDumpItem?: (b: any) => string;
    addBucketListItem?: (t: any) => string;
    addBusinessProject?: (p: any) => string;
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

  const today = proposal.targetDate || formatLocalDateStr(new Date());

  try {
    switch (proposal.destination) {
      case "tasks": {
        if (proposal.type === "complete_task" && proposal.targetId && actions.toggleTask) {
          actions.toggleTask(proposal.targetId);
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "tasks",
            recordId: proposal.targetId,
          };
        }
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

      case "habits": {
        if (proposal.type === "complete_habit" && proposal.targetId && actions.toggleHabit) {
          actions.toggleHabit(proposal.targetId, today);
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "habits",
            recordId: proposal.targetId,
          };
        }
        if (actions.addHabit) {
          const habitId = `hab_ai_${proposal.id}`;
          actions.addHabit({
            id: habitId,
            name: proposal.title,
            emoji: proposal.emoji || "🌸",
            category: proposal.category || "Wellness",
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "habits",
            recordId: habitId,
          };
        }
        break;
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
            emoji: proposal.emoji || "🌸",
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
            icon: proposal.emoji || "🌸",
            color: "rose",
            descriptionEn: "Created from AYXA Muse Pro",
            descriptionAr: "تم إنشاؤه بواسطة مساعدة AYXA Muse Pro",
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
        if (proposal.type === "wish" && actions.addSomedayWish) {
          const wishId = actions.addSomedayWish({
            title: proposal.title,
            category: proposal.category || "Lifestyle",
            whyItMatters: proposal.notes || "",
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "goals",
            recordId: wishId,
          };
        }
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
        if (proposal.type === "book" && actions.addBook) {
          const bookId = actions.addBook({
            title: proposal.title,
            author: proposal.category || "Author",
            totalPages: proposal.amount || 250,
            status: "reading",
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "learning",
            recordId: bookId,
          };
        }
        if (proposal.learningItemId && actions.addLearningPlanItem) {
          const planItemId = actions.addLearningPlanItem({
            title: proposal.title,
            learningItemId: proposal.learningItemId,
            localDate: today,
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
            proposal.category || proposal.title || "General Study",
            proposal.durationMinutes || proposal.amount || 30,
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

      case "wellness": {
        if (proposal.type === "hydration" && actions.addHydration) {
          actions.addHydration(proposal.amount || 250, today);
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "wellness",
            recordId: `water_${proposal.id}`,
          };
        }
        if (proposal.type === "mood" && actions.setDailyMood) {
          const moodVal = (proposal.tag || proposal.category || "calm").toLowerCase();
          actions.setDailyMood(today, moodVal, "balanced");
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "wellness",
            recordId: `mood_${proposal.id}`,
          };
        }
        if (actions.addCareActivity) {
          const careId = actions.addCareActivity({
            title: proposal.title,
            icon: proposal.emoji || "🌷",
            category: "rest",
            durationMinutes: proposal.durationMinutes || 15,
            isFavorite: true,
            isArchived: false,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "wellness",
            recordId: careId,
          };
        }
        break;
      }

      case "deen": {
        if (proposal.type === "quran" && actions.logQuranProgress) {
          actions.logQuranProgress(today, proposal.amount || 4, "pages");
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "deen",
            recordId: `quran_${proposal.id}`,
          };
        }
        if (proposal.type === "prayer" && actions.togglePrayerLog) {
          const prayerKey = (proposal.tag || proposal.category || "fajr").toLowerCase();
          actions.togglePrayerLog(today, prayerKey, proposal.notes);
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "deen",
            recordId: `prayer_${proposal.id}`,
          };
        }
        break;
      }

      case "journal": {
        if (actions.addJournal) {
          const isBarakah = proposal.type === "barakah_note";
          const jId = actions.addJournal({
            title: proposal.title,
            body: proposal.notes || proposal.title,
            date: today,
            isBarakahJar: isBarakah,
            tags: isBarakah ? ["barakah_jar"] : [proposal.category || "Reflection"],
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "journal",
            recordId: jId,
          };
        }
        break;
      }

      case "finance": {
        if (actions.addMoney) {
          actions.addMoney({
            title: proposal.title,
            amount: proposal.amount || 0,
            type: proposal.type === "income" ? "income" : "expense",
            category: proposal.category || "General",
            date: today,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "finance",
            recordId: `fin_${proposal.id}`,
          };
        }
        break;
      }

      case "inbox": {
        if (actions.addBrainDumpItem) {
          const bId = actions.addBrainDumpItem({
            content: proposal.title + (proposal.notes ? ` — ${proposal.notes}` : ""),
            tags: proposal.tag ? [proposal.tag] : ["AI Capture"],
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "inbox",
            recordId: bId,
          };
        }
        break;
      }

      case "travel": {
        if (actions.addBucketListItem) {
          const tId = actions.addBucketListItem({
            destinationName: proposal.title,
            countryOrRegion: proposal.category || "Dream Destination",
            dreamNotes: proposal.notes || "",
            targetYear: new Date().getFullYear(),
            estimatedBudgetMinor: (proposal.amount || 1000) * 100,
            convertedToTripId: null,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "travel",
            recordId: tId,
          };
        }
        break;
      }

      case "business": {
        if (actions.addBusinessProject) {
          const pId = actions.addBusinessProject({
            title: proposal.title,
            clientId: null,
            status: "active",
            category: proposal.category || "Creative",
            startDate: today,
            dueDate: proposal.targetDate || null,
            agreedAmountMinor: (proposal.amount || 0) * 100,
            currency: "MAD",
            progressPercentage: 0,
            notes: proposal.notes || "",
            archived: false,
          });
          appliedRecordIds.add(proposal.id);
          return {
            proposalId: proposal.id,
            success: true,
            destination: "business",
            recordId: pId,
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
        requestId: typeof m.requestId === "string" ? m.requestId : undefined,
        feedbackRating: m.feedbackRating === "good" || m.feedbackRating === "bad" ? m.feedbackRating : undefined,
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
