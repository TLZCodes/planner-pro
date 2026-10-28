/**
 * AYXA Brain Dump Inbox Engine
 * 
 * Provides domain models, normalization, drafting recovery,
 * splitting logic, duplicate detection, and destination organization adapters.
 * 
 * Design rules:
 * - Capturing thoughts does not create destination records or award XP.
 * - Audio is stored durably as base64 Data URIs so it survives page reloads and works offline.
 * - Recoverable drafts via localStorage.
 * - Full bilingual (English / Arabic) support.
 */

export interface BrainDumpStateLookup {
  tasks?: Array<{ id: string; title?: string; tag?: string }>;
  goals?: Array<{ id: string; title?: string; category?: string }>;
  businessProjects?: Array<{ id: string; title?: string }>;
  travelTrips?: Array<{ id: string; destination?: string }>;
}

export type BrainDumpLabel =
  | "task"
  | "idea"
  | "goal"
  | "shopping"
  | "project"
  | "journal"
  | "travel"
  | "learning"
  | "other";

export type BrainDumpStatus = "unsorted" | "organized" | "archived";

export type DestinationType =
  | "task"
  | "goal"
  | "journal"
  | "business_project"
  | "travel_trip"
  | "travel_checklist"
  | "learning_note"
  | "learning_item"
  | "shopping_task"
  | "someday_wish";

export interface BrainDumpDestinationRef {
  type: DestinationType;
  id: string;
  title: string;
  createdAt: string;
  isProtected?: boolean;
}

export interface BrainDumpAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
  sizeBytes?: number;
}

export interface BrainDumpItem {
  id: string;
  userId?: string;
  title?: string;
  content: string;
  label?: BrainDumpLabel;
  status: BrainDumpStatus;
  createdAt: string;
  updatedAt: string;
  // Durable Voice Note (base64 Data URI)
  audioDataUrl?: string;
  audioDurationSeconds?: number;
  transcript?: string;
  transcriptSource?: "web_speech" | "manual";
  // Attachments
  attachments?: BrainDumpAttachment[];
  // Organization link
  destination?: BrainDumpDestinationRef;
  // Recovery / mutation tag
  mutationId?: string;
}

export interface BrainDumpDraft {
  title: string;
  content: string;
  label?: BrainDumpLabel;
  audioDataUrl?: string;
  audioDurationSeconds?: number;
  transcript?: string;
  updatedAt: string;
}

export interface LabelMeta {
  key: BrainDumpLabel;
  emoji: string;
  labelEn: string;
  labelAr: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  darkBg: string;
  darkBorder: string;
}

export const BRAIN_DUMP_LABELS: LabelMeta[] = [
  {
    key: "task",
    emoji: "📋",
    labelEn: "Task",
    labelAr: "مهمة",
    bgLight: "bg-teal-50",
    borderLight: "border-teal-200",
    textColor: "text-teal-700 dark:text-teal-300",
    darkBg: "dark:bg-teal-950/40",
    darkBorder: "dark:border-teal-800/60",
  },
  {
    key: "idea",
    emoji: "💡",
    labelEn: "Idea",
    labelAr: "فكرة",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    textColor: "text-amber-700 dark:text-amber-300",
    darkBg: "dark:bg-amber-950/40",
    darkBorder: "dark:border-amber-800/60",
  },
  {
    key: "goal",
    emoji: "🎯",
    labelEn: "Goal",
    labelAr: "هدف",
    bgLight: "bg-rose-50",
    borderLight: "border-rose-200",
    textColor: "text-rose-700 dark:text-rose-300",
    darkBg: "dark:bg-rose-950/40",
    darkBorder: "dark:border-rose-800/60",
  },
  {
    key: "shopping",
    emoji: "🛍️",
    labelEn: "Shopping",
    labelAr: "مشتريات",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-200",
    textColor: "text-purple-700 dark:text-purple-300",
    darkBg: "dark:bg-purple-950/40",
    darkBorder: "dark:border-purple-800/60",
  },
  {
    key: "project",
    emoji: "💼",
    labelEn: "Project",
    labelAr: "مشروع",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-200",
    textColor: "text-blue-700 dark:text-blue-300",
    darkBg: "dark:bg-blue-950/40",
    darkBorder: "dark:border-blue-800/60",
  },
  {
    key: "journal",
    emoji: "📖",
    labelEn: "Journal",
    labelAr: "يوميات",
    bgLight: "bg-pink-50",
    borderLight: "border-pink-200",
    textColor: "text-pink-700 dark:text-pink-300",
    darkBg: "dark:bg-pink-950/40",
    darkBorder: "dark:border-pink-800/60",
  },
  {
    key: "travel",
    emoji: "✈️",
    labelEn: "Travel",
    labelAr: "سفر",
    bgLight: "bg-sky-50",
    borderLight: "border-sky-200",
    textColor: "text-sky-700 dark:text-sky-300",
    darkBg: "dark:bg-sky-950/40",
    darkBorder: "dark:border-sky-800/60",
  },
  {
    key: "learning",
    emoji: "📚",
    labelEn: "Learning",
    labelAr: "تعلم",
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-200",
    textColor: "text-indigo-700 dark:text-indigo-300",
    darkBg: "dark:bg-indigo-950/40",
    darkBorder: "dark:border-indigo-800/60",
  },
  {
    key: "other",
    emoji: "🌸",
    labelEn: "Other",
    labelAr: "أخرى",
    bgLight: "bg-stone-50",
    borderLight: "border-stone-200",
    textColor: "text-stone-700 dark:text-stone-300",
    darkBg: "dark:bg-stone-900/40",
    darkBorder: "dark:border-stone-800/60",
  },
];

export const DRAFT_STORAGE_KEY = "ayxa_braindump_draft";

/**
 * Normalizes an item from storage or memory to guarantee complete shape.
 */
export function normalizeBrainDumpItem(raw: Partial<BrainDumpItem>): BrainDumpItem {
  const now = new Date().toISOString();
  return {
    id: raw.id || `bd-${Math.random().toString(36).slice(2, 10)}`,
    userId: raw.userId,
    title: typeof raw.title === "string" ? raw.title.trim() : undefined,
    content: typeof raw.content === "string" ? raw.content : "",
    label: raw.label || undefined,
    status: raw.status === "organized" || raw.status === "archived" ? raw.status : "unsorted",
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    audioDataUrl: raw.audioDataUrl,
    audioDurationSeconds: typeof raw.audioDurationSeconds === "number" ? raw.audioDurationSeconds : undefined,
    transcript: raw.transcript,
    transcriptSource: raw.transcriptSource,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : undefined,
    destination: raw.destination,
    mutationId: raw.mutationId,
  };
}

/**
 * Retrieve saved draft if available.
 */
export function getBrainDumpDraft(): BrainDumpDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (!parsed.content && !parsed.title && !parsed.audioDataUrl)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist current in-progress capture draft.
 */
export function saveBrainDumpDraft(draft: BrainDumpDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota or disabled storage
  }
}

/**
 * Discard / clear in-progress capture draft.
 */
export function clearBrainDumpDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Split a thought into distinct thoughts by linebreaks or custom delimiter.
 */
export function splitThoughtContent(content: string): string[] {
  if (!content) return [];
  // Split on double newlines or single newlines
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // If there's bullet points (e.g. - task or 1. item), clean them up
  return lines.map((line) => line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""));
}

/**
 * Detect possible duplicates across destination systems (Tasks, Goals, Projects, Trips).
 */
export function findPotentialDuplicates(
  queryTitle: string,
  state: BrainDumpStateLookup
): { type: DestinationType; id: string; title: string; category?: string }[] {
  if (!queryTitle || queryTitle.trim().length < 3) return [];
  const q = queryTitle.trim().toLowerCase();
  const results: { type: DestinationType; id: string; title: string; category?: string }[] = [];

  // Check tasks
  if (Array.isArray(state.tasks)) {
    for (const t of state.tasks) {
      if (t.title && t.title.toLowerCase().includes(q)) {
        results.push({ type: "task", id: t.id, title: t.title, category: t.tag });
        if (results.length >= 5) return results;
      }
    }
  }

  // Check goals
  if (Array.isArray(state.goals)) {
    for (const g of state.goals) {
      if (g.title && g.title.toLowerCase().includes(q)) {
        results.push({ type: "goal", id: g.id, title: g.title, category: g.category });
        if (results.length >= 5) return results;
      }
    }
  }

  // Check business projects
  if (Array.isArray(state.businessProjects)) {
    for (const p of state.businessProjects) {
      if (p.title && p.title.toLowerCase().includes(q)) {
        results.push({ type: "business_project", id: p.id, title: p.title });
        if (results.length >= 5) return results;
      }
    }
  }

  // Check travel trips
  if (Array.isArray(state.travelTrips)) {
    for (const tr of state.travelTrips) {
      if (tr.destination && tr.destination.toLowerCase().includes(q)) {
        results.push({ type: "travel_trip", id: tr.id, title: tr.destination });
        if (results.length >= 5) return results;
      }
    }
  }

  return results;
}

/**
 * Format elapsed recording seconds into mm:ss
 */
export function formatAudioSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
