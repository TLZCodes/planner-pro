/**
 * AYXA My Week in Bloom (أسبوعي يزهر 🌷) Engine
 *
 * Core models, layout configurations, themes, snapshot management,
 * and canonical metric & source extractors from Weekly Reset, Tasks, Habits, and Focus.
 *
 * Pure TypeScript, zero external dependencies, 100% unit-testable in Node.js.
 */

import {
  type WeekInfo,
  getWeekDaysInfo,
  formatLocalDateStr,
} from "./weeklyHabitEngine.ts";

export type BloomLayout = "scrapbook" | "minimal" | "photo_diary";
export type BloomTheme = "blush" | "cream" | "lavender" | "mint";

export type BloomBlockType =
  | "accomplishments"
  | "lovely_moment"
  | "photo"
  | "supported_habit"
  | "focus_study"
  | "lesson"
  | "gratitude"
  | "next_intention";

export interface BloomPhotoContent {
  url: string; // base64 data URL
  caption?: string;
  description?: string;
  focalPoint?: "center" | "top" | "bottom";
}

export interface BloomHabitContent {
  title: string;
  note?: string;
  countOrStreak?: string;
}

export interface BloomFocusContent {
  minutes: number;
  label: string;
  isStudy?: boolean;
  isSoFar?: boolean;
}

export interface WeekInBloomBlock {
  id: string;
  type: BloomBlockType;
  visible: boolean;
  titleCustom?: string;
  content: any;
  isPersonalNote?: boolean;
  sourceRef?: {
    type: "reset" | "task" | "habit" | "focus" | "journal" | "manual" | string;
    id?: string;
    label?: string;
  };
}

export interface WeekInBloomKeepsake {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  title: string;
  layout: BloomLayout;
  theme: BloomTheme;
  blocks: WeekInBloomBlock[];
  isDraft: boolean;
  showAyxaSignature: boolean;
  showDateRange: boolean;
  createdAt: string;
  updatedAt: string;
  savedToJournalEntryId?: string;
  snapshotCapturedAt?: string;
}

// ── Themes Palette ──────────────────────────────────────────────────────────

export interface BloomThemeConfig {
  id: BloomTheme;
  nameEn: string;
  nameAr: string;
  bgHex: string;
  cardBgHex: string;
  borderHex: string;
  accentHex: string;
  textHex: string;
  tagBgHex: string;
  washiHex: string;
}

export const BLOOM_THEMES: Record<BloomTheme, BloomThemeConfig> = {
  blush: {
    id: "blush",
    nameEn: "Blush Petal",
    nameAr: "تويجات الورد",
    bgHex: "#FFF7F6",
    cardBgHex: "#FFFFFF",
    borderHex: "#FECDD3",
    accentHex: "#E11D48",
    textHex: "#2E1220",
    tagBgHex: "#FFE4E6",
    washiHex: "rgba(244, 63, 94, 0.22)",
  },
  cream: {
    id: "cream",
    nameEn: "Buttercream Warmth",
    nameAr: "دفء الفانيليا",
    bgHex: "#FFFDF7",
    cardBgHex: "#FFFFFF",
    borderHex: "#FDE68A",
    accentHex: "#D97706",
    textHex: "#2E1C12",
    tagBgHex: "#FEF3C7",
    washiHex: "rgba(217, 119, 6, 0.20)",
  },
  lavender: {
    id: "lavender",
    nameEn: "Lavender Mist",
    nameAr: "ضباب اللافندر",
    bgHex: "#FAF7FF",
    cardBgHex: "#FFFFFF",
    borderHex: "#DDD6FE",
    accentHex: "#7C3AED",
    textHex: "#2A163E",
    tagBgHex: "#EDE9FE",
    washiHex: "rgba(124, 58, 237, 0.20)",
  },
  mint: {
    id: "mint",
    nameEn: "Quiet Sage",
    nameAr: "ميرمية هادئة",
    bgHex: "#F5FAF7",
    cardBgHex: "#FFFFFF",
    borderHex: "#A7F3D0",
    accentHex: "#059669",
    textHex: "#0F2F24",
    tagBgHex: "#D1FAE5",
    washiHex: "rgba(5, 150, 105, 0.20)",
  },
};

// ── Default Blocks Template ─────────────────────────────────────────────────

export function createDefaultBloomBlocks(): WeekInBloomBlock[] {
  return [
    {
      id: "photo",
      type: "photo",
      visible: true,
      content: null, // BloomPhotoContent
    },
    {
      id: "accomplishments",
      type: "accomplishments",
      visible: true,
      content: [] as string[],
    },
    {
      id: "lovely_moment",
      type: "lovely_moment",
      visible: true,
      content: "",
    },
    {
      id: "supported_habit",
      type: "supported_habit",
      visible: true,
      content: null, // BloomHabitContent
    },
    {
      id: "focus_study",
      type: "focus_study",
      visible: true,
      content: null, // BloomFocusContent
    },
    {
      id: "lesson",
      type: "lesson",
      visible: true,
      content: "",
    },
    {
      id: "gratitude",
      type: "gratitude",
      visible: true,
      content: "",
    },
    {
      id: "next_intention",
      type: "next_intention",
      visible: true,
      content: "",
    },
  ];
}

export function createNewBloomKeepsake(params: {
  weekStartDate: string;
  weekEndDate: string;
  title?: string;
  layout?: BloomLayout;
  theme?: BloomTheme;
}): WeekInBloomKeepsake {
  const now = new Date().toISOString();
  return {
    id: `bloom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    weekStartDate: params.weekStartDate,
    weekEndDate: params.weekEndDate,
    title: params.title || "",
    layout: params.layout || "scrapbook",
    theme: params.theme || "blush",
    blocks: createDefaultBloomBlocks(),
    isDraft: true,
    showAyxaSignature: true,
    showDateRange: true,
    createdAt: now,
    updatedAt: now,
    snapshotCapturedAt: now,
  };
}

// ── Canonical Source Extractors ─────────────────────────────────────────────

export interface ResetSourceItems {
  accomplishments: string[];
  lesson?: string;
  gratitude?: string;
  nextWeekIntention?: string;
  supportedMe?: string;
}

export function extractResetSourceItems(resetNote?: {
  accomplishments?: Array<{ text: string; done?: boolean }>;
  reflectionAnswers?: Record<string, string>;
  nextWeekIntention?: string;
  energyRestored?: string;
}): ResetSourceItems {
  const result: ResetSourceItems = {
    accomplishments: [],
  };

  if (!resetNote) return result;

  if (Array.isArray(resetNote.accomplishments)) {
    result.accomplishments = resetNote.accomplishments
      .map((a) => (typeof a === "string" ? a : a.text))
      .filter((t) => typeof t === "string" && t.trim().length > 0);
  }

  if (resetNote.reflectionAnswers) {
    if (resetNote.reflectionAnswers.gratitude) {
      result.gratitude = resetNote.reflectionAnswers.gratitude.trim();
    }
    if (resetNote.reflectionAnswers.adjust) {
      result.lesson = resetNote.reflectionAnswers.adjust.trim();
    } else if (resetNote.reflectionAnswers.carry_forward) {
      result.lesson = resetNote.reflectionAnswers.carry_forward.trim();
    }
    if (resetNote.reflectionAnswers.supported_me) {
      result.supportedMe = resetNote.reflectionAnswers.supported_me.trim();
    }
  }

  if (resetNote.nextWeekIntention) {
    result.nextWeekIntention = resetNote.nextWeekIntention.trim();
  }

  return result;
}

export function extractTaskAccomplishments(
  tasks: Array<{
    id: string;
    title: string;
    done?: boolean;
    doneDate?: string;
    completedAt?: string;
  }>,
  weekStartDate: string,
  weekEndDate: string
): Array<{ id: string; title: string }> {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .filter((t) => {
      if (!t.done) return false;
      const cDate = t.doneDate || (t.completedAt ? t.completedAt.slice(0, 10) : undefined);
      if (!cDate) return false;
      return cDate >= weekStartDate && cDate <= weekEndDate;
    })
    .map((t) => ({ id: t.id, title: t.title }));
}

export function extractFocusStudyMetrics(
  focusSessions: Array<{
    localDate?: string;
    startedAt?: string;
    status?: string;
    sourceType?: string;
    actualFocusSeconds?: number;
    plannedFocusSeconds?: number;
    durationSeconds?: number;
  }> = [],
  studySessions: Array<{
    date: string;
    minutes: number;
  }> = [],
  weekStartDate: string,
  weekEndDate: string,
  isCurrentWeek: boolean
): BloomFocusContent | null {
  // Filter sessions strictly within week window
  const weekFocus = focusSessions.filter((s) => {
    const sDate = s.localDate || (s.startedAt ? s.startedAt.slice(0, 10) : undefined);
    if (!sDate) return false;
    return (
      sDate >= weekStartDate &&
      sDate <= weekEndDate &&
      (s.status === "completed" || s.status === "active")
    );
  });

  const weekStudy = studySessions.filter((s) => {
    return s.date >= weekStartDate && s.date <= weekEndDate;
  });

  const focusSeconds = weekFocus.reduce(
    (acc, s) => acc + (s.actualFocusSeconds || s.plannedFocusSeconds || s.durationSeconds || 0),
    0
  );
  const studyMinutes = weekStudy.reduce((acc, s) => acc + (s.minutes || 0), 0);

  // If both exist, determine non-overlapping focus seconds
  // Focus sessions with sourceType === "subject" are study-linked; don't count twice
  const pureFocusSeconds = weekFocus
    .filter((s) => s.sourceType !== "subject")
    .reduce(
      (acc, s) => acc + (s.actualFocusSeconds || s.plannedFocusSeconds || s.durationSeconds || 0),
      0
    );

  const focusMinutes = Math.round(pureFocusSeconds / 60);
  const totalMinutes = focusMinutes + studyMinutes;

  if (totalMinutes <= 0) return null;

  let label = "Focus time";
  if (focusMinutes > 0 && studyMinutes > 0) {
    label = "Focus & Study";
  } else if (studyMinutes > 0) {
    label = "Study time";
  }

  return {
    minutes: totalMinutes,
    label,
    isStudy: studyMinutes > 0 && focusMinutes === 0,
    isSoFar: isCurrentWeek,
  };
}

// ── Normalization & Validation ──────────────────────────────────────────────

export function normalizeWeekInBloomKeepsake(raw: any): WeekInBloomKeepsake {
  const fallback = createNewBloomKeepsake({
    weekStartDate: formatLocalDateStr(new Date()),
    weekEndDate: formatLocalDateStr(new Date()),
  });

  if (!raw || typeof raw !== "object") return fallback;

  const validLayouts: BloomLayout[] = ["scrapbook", "minimal", "photo_diary"];
  const validThemes: BloomTheme[] = ["blush", "cream", "lavender", "mint"];

  const layout: BloomLayout = validLayouts.includes(raw.layout) ? raw.layout : "scrapbook";
  const theme: BloomTheme = validThemes.includes(raw.theme) ? raw.theme : "blush";

  const rawBlocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const defaultBlocks = createDefaultBloomBlocks();

  // Merge with default blocks to ensure no missing block types
  const blocks: WeekInBloomBlock[] = defaultBlocks.map((def) => {
    const existing = rawBlocks.find((b: any) => b && b.type === def.type);
    if (!existing) return def;
    return {
      id: existing.id || def.id,
      type: def.type,
      visible: typeof existing.visible === "boolean" ? existing.visible : def.visible,
      titleCustom: existing.titleCustom,
      content: existing.content !== undefined ? existing.content : def.content,
      isPersonalNote: Boolean(existing.isPersonalNote),
      sourceRef: existing.sourceRef,
    };
  });

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : fallback.id,
    weekStartDate: typeof raw.weekStartDate === "string" ? raw.weekStartDate : fallback.weekStartDate,
    weekEndDate: typeof raw.weekEndDate === "string" ? raw.weekEndDate : fallback.weekEndDate,
    title: typeof raw.title === "string" ? raw.title : "",
    layout,
    theme,
    blocks,
    isDraft: typeof raw.isDraft === "boolean" ? raw.isDraft : true,
    showAyxaSignature: typeof raw.showAyxaSignature === "boolean" ? raw.showAyxaSignature : true,
    showDateRange: typeof raw.showDateRange === "boolean" ? raw.showDateRange : true,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : fallback.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt,
    savedToJournalEntryId: raw.savedToJournalEntryId,
    snapshotCapturedAt: raw.snapshotCapturedAt || raw.createdAt,
  };
}

export function formatDurationLabel(minutes: number, isAr: boolean): string {
  if (minutes < 60) {
    return isAr ? `${minutes} دقيقة` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    if (isAr) {
      if (hours === 1) return "ساعة واحدة";
      if (hours === 2) return "ساعتان";
      if (hours >= 3 && hours <= 10) return `${hours} ساعات`;
      return `${hours} ساعة`;
    }
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  return isAr
    ? `${hours} س و ${remainingMins} د`
    : `${hours}h ${remainingMins}m`;
}
