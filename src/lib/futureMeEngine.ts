/**
 * AYXA Future Me Time Capsule Engine (إلى نفسي في المستقبل 💌)
 *
 * Core models, calendar calculations (leap year & month-end safe),
 * timezone-aware eligibility, sealed content masking, and prompts.
 * Pure TypeScript, self-contained, unit-testable in Node.js.
 */

export type CapsuleStatus = "draft" | "sealed" | "opened";

export interface VisionBoardCapsuleSnapshot {
  boardId: string;
  boardTitle: string;
  theme?: string;
  coverImageUrl?: string;
  items: Array<{
    id: string;
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
  }>;
  capturedAt: string;
}

export interface CapsuleAttachment {
  id: string;
  type: "photo";
  url: string; // Durable base64 data URL
  name?: string;
  sizeBytes?: number;
}

export interface FutureMeCapsule {
  id: string;
  status: CapsuleStatus;
  title?: string;
  body: string;
  openingDate: string; // YYYY-MM-DD local opening date
  sealingTimezone: string; // IANA timezone e.g. "Asia/Riyadh" or "UTC"
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  sealedAt?: string; // ISO timestamp
  openedAt?: string; // ISO timestamp
  unsealedEarly?: boolean;
  attachments?: CapsuleAttachment[];
  visionBoardSnapshot?: VisionBoardCapsuleSnapshot;
  reminderEnabled?: boolean;
  reminderScheduledFor?: string;
  replyJournalId?: string; // Links to a JournalEntry written as reply
  paperTheme?: "blush" | "cream" | "lavender" | "mint";
  stampStyle?: "flower" | "heart" | "moon" | "bird";
}

export interface WritingPrompt {
  id: string;
  textEn: string;
  textAr: string;
}

export const FUTURE_ME_PROMPTS: WritingPrompt[] = [
  {
    id: "p1",
    textEn: "What does my life feel like today?",
    textAr: "كيف تبدو حياتي اليوم؟",
  },
  {
    id: "p2",
    textEn: "What am I hoping for?",
    textAr: "ما الذي أتمنّاه؟",
  },
  {
    id: "p3",
    textEn: "What am I learning?",
    textAr: "ما الذي أتعلّمه؟",
  },
  {
    id: "p4",
    textEn: "What would I like to remember?",
    textAr: "ما الذي أريد أن أتذكّره؟",
  },
  {
    id: "p5",
    textEn: "What kindness do I want to offer my future self?",
    textAr: "ما الكلمات اللطيفة التي أهديها لنفسي في المستقبل؟",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Calendar & Date Calculation Utilities (Leap Year & Month-End Clamped)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get exact number of days in a given month (1-based: 1 = Jan, 12 = Dec).
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 30;
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * Add calendar months to a YYYY-MM-DD date string with proper month-end clamping.
 * E.g., 2026-01-31 + 1 month = 2026-02-28.
 * E.g., 2024-01-31 + 1 month = 2024-02-29 (leap year).
 */
export function addCalendarMonths(baseDate: string, monthsToAdd: number): string {
  const parts = baseDate.split("-").map(Number);
  const baseYear = parts[0] || new Date().getFullYear();
  const baseMonth = parts[1] || 1;
  const baseDay = parts[2] || 1;

  const totalMonths = (baseYear * 12) + (baseMonth - 1) + monthsToAdd;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;

  const maxDays = getDaysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(baseDay, maxDays);

  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/**
 * Add calendar years to a YYYY-MM-DD date string with proper leap-year clamping.
 * E.g., 2024-02-29 + 1 year = 2025-02-28.
 */
export function addCalendarYears(baseDate: string, yearsToAdd: number): string {
  const parts = baseDate.split("-").map(Number);
  const baseYear = parts[0] || new Date().getFullYear();
  const baseMonth = parts[1] || 1;
  const baseDay = parts[2] || 1;

  const targetYear = baseYear + yearsToAdd;
  const maxDays = getDaysInMonth(targetYear, baseMonth);
  const targetDay = Math.min(baseDay, maxDays);

  return `${targetYear}-${String(baseMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/**
 * Format local date YYYY-MM-DD in a specific IANA timezone.
 */
export function getLocalDateInTimezone(
  date: Date = new Date(),
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // YYYY-MM-DD
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

/**
 * Calculate gentle days remaining until opening date.
 */
export function getDaysUntilOpening(openingDate: string, now: Date = new Date()): number {
  if (!openingDate) return 0;
  try {
    const [y, m, d] = openingDate.split("-").map(Number);
    const targetUtc = Date.UTC(y, m - 1, d);
    const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = targetUtc - nowUtc;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export const daysUntilDate = getDaysUntilOpening;

/**
 * Check if a sealed capsule is ready to open in its stored sealing timezone.
 */
export function isCapsuleReadyToOpen(
  capsule: { status: CapsuleStatus; openingDate: string; sealingTimezone?: string },
  now: Date = new Date()
): boolean {
  if (capsule.status !== "sealed") return false;
  if (!capsule.openingDate) return false;
  const tz = capsule.sealingTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const currentDateInTz = getLocalDateInTimezone(now, tz);
  return currentDateInTz >= capsule.openingDate;
}

/**
 * Derive high-level visual/lifecycle state for UI filters.
 */
export function deriveCapsuleUiState(
  capsule: FutureMeCapsule,
  now: Date = new Date()
): "draft" | "sealed" | "ready" | "opened" {
  if (capsule.status === "draft") return "draft";
  if (capsule.status === "opened") return "opened";
  if (isCapsuleReadyToOpen(capsule, now)) return "ready";
  return "sealed";
}

/**
 * Format date for friendly letter and envelope display.
 */
export function formatCapsuleDate(dateStr?: string, isAr: boolean = false): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return dateStr;

    return dateObj.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalization & Masking for Privacy
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeCapsule(raw: Partial<FutureMeCapsule>): FutureMeCapsule {
  const id = raw.id || `fmc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    id,
    status: raw.status || "draft",
    title: raw.title?.trim() || "",
    body: raw.body || "",
    openingDate: raw.openingDate || addCalendarMonths(getLocalDateInTimezone(new Date(), currentTz), 1),
    sealingTimezone: raw.sealingTimezone || currentTz,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    sealedAt: raw.sealedAt,
    openedAt: raw.openedAt,
    unsealedEarly: Boolean(raw.unsealedEarly),
    attachments: raw.attachments || [],
    visionBoardSnapshot: raw.visionBoardSnapshot,
    reminderEnabled: Boolean(raw.reminderEnabled),
    reminderScheduledFor: raw.reminderScheduledFor,
    replyJournalId: raw.replyJournalId,
    paperTheme: raw.paperTheme || "blush",
    stampStyle: raw.stampStyle || "flower",
  };
}

/**
 * Mask sealed capsule content so it cannot leak through data previews,
 * list cards, search filters, or general exports prior to opening.
 */
export function maskSealedCapsuleForPublicView(
  capsule: FutureMeCapsule,
  isAr: boolean = false
): FutureMeCapsule {
  if (capsule.status !== "sealed") {
    return capsule;
  }

  return {
    ...capsule,
    title: isAr ? "رسالة مختومة 💌" : "Sealed Letter 💌",
    body: isAr
      ? "هذه الرسالة مختومة وستفتح في تاريخ استحقاقها."
      : "This letter is sealed until its opening date.",
    attachments: [],
    visionBoardSnapshot: undefined,
  };
}
