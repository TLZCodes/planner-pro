export type XPEventState = "pending" | "active" | "reversed" | "rejected";

export interface XPEvent {
  id: string;
  userId: string;
  rewardKey?: string;
  sourceType: string;
  sourceId: string;
  actionType?: string;
  amount: number;
  state?: XPEventState;
  localDate: string; // YYYY-MM-DD
  idempotencyKey?: string; // backwards compatibility alias to rewardKey
  createdAt: string;
  updatedAt?: string;
  reversalOf?: string;
  rewardPolicyVersion?: number;
  labelEn?: string;
  labelAr?: string;
}

export type TierId = "beginner" | "student" | "scholar" | "master" | "legend";

export interface ProgressionTier {
  id: TierId;
  min: number;
  max: number;
  label: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  emoji: string;
  color: string;
  order: number;
}

export const XP_PER_LEVEL = 250;

export const PROGRESSION_TIERS: ProgressionTier[] = [
  {
    id: "beginner",
    min: 0,
    max: 499,
    label: "Beginner",
    labelAr: "مبتدئة",
    descriptionEn: "Your gentle beginning, planting the first seeds of daily care and focus.",
    descriptionAr: "بدايتكِ اللطيفة، حيث تغرسين أولى بذور العناية والتركيز اليومي.",
    emoji: "🌱",
    color: "#A8E0D8",
    order: 1,
  },
  {
    id: "student",
    min: 500,
    max: 1999,
    label: "Student",
    labelAr: "طالبة",
    descriptionEn: "Learning rhythms, building gentle consistency across your routines.",
    descriptionAr: "تتعلمين الإيقاع، وتبنين استمرارية هادئة في روتينكِ وأنشطتكِ.",
    emoji: "📚",
    color: "#C8B6E2",
    order: 2,
  },
  {
    id: "scholar",
    min: 2000,
    max: 4999,
    label: "Scholar",
    labelAr: "باحثة",
    descriptionEn: "Deepening your self-knowledge and personal growth with steady wisdom.",
    descriptionAr: "تعمّقين معرفتكِ بنفسكِ، وتنمين بحكمة واستقرار داخلي ثابت.",
    emoji: "⭐",
    color: "#FDE49C",
    order: 3,
  },
  {
    id: "master",
    min: 5000,
    max: 9999,
    label: "Master",
    labelAr: "متقنة",
    descriptionEn: "Living in harmonious balance, gracefully mastering your daily systems.",
    descriptionAr: "تعيشين توازنًا متناغمًا، وتتقنين أنظمتكِ اليومية برقي ولطف.",
    emoji: "🏅",
    color: "#F7B7D2",
    order: 4,
  },
  {
    id: "legend",
    min: 10000,
    max: Infinity,
    label: "Legend",
    labelAr: "أسطورة",
    descriptionEn: "An inspiring journey of lifelong consistency, calm resilience, and blooming grace.",
    descriptionAr: "رحلة ملهمة من الاستمرارية الدائمة، الصمود الهادئ، والازدهار المستمر.",
    emoji: "👑",
    color: "#FFD700",
    order: 5,
  },
];

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  nextLevelThreshold: number;
  pct: number;
  tier?: ProgressionTier;
}

export interface TierProgress {
  currentTier: ProgressionTier;
  nextTier: ProgressionTier | null;
  xpToNextTier: number;
  pct: number;
}

export interface ProgressionOverview {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  nextLevelThreshold: number;
  levelPct: number;
  tier: ProgressionTier;
  nextTier: ProgressionTier | null;
  xpToNextTier: number;
  tierPct: number;
}

export interface UserProgressSettings {
  userId: string;
  showXp: boolean;
  showLevel: boolean;
  showTier: boolean;
  showStreaks: boolean;
  showFaithCategory: boolean;
  reducedGamification: boolean;
  updatedAt: string;
}

export const DEFAULT_PROGRESS_SETTINGS: UserProgressSettings = {
  userId: "",
  showXp: true,
  showLevel: true,
  showTier: true,
  showStreaks: true,
  showFaithCategory: true,
  reducedGamification: false,
  updatedAt: new Date().toISOString(),
};

// ── Pure Progression Calculations ──────────────────────────────────────────

export function getNumericLevel(xp: number): number {
  const cleanXp = Math.max(0, Math.floor(xp || 0));
  return Math.floor(cleanXp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(xp: number): LevelProgress {
  const cleanXp = Math.max(0, Math.floor(xp || 0));
  const level = getNumericLevel(cleanXp);
  const nextLevelThreshold = level * XP_PER_LEVEL;
  const xpIntoLevel = cleanXp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;
  const pct = Math.min(100, Math.max(0, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)));

  return {
    level,
    xpIntoLevel,
    xpToNextLevel,
    nextLevelThreshold,
    pct,
  };
}

export function getCurrentTier(xp: number): ProgressionTier {
  const cleanXp = Math.max(0, Math.floor(xp || 0));
  return (
    PROGRESSION_TIERS.find((t) => cleanXp >= t.min && cleanXp <= t.max) ||
    PROGRESSION_TIERS[0]
  );
}

export function getTierProgress(xp: number): TierProgress {
  const cleanXp = Math.max(0, Math.floor(xp || 0));
  const currentTier = getCurrentTier(cleanXp);
  const tierIndex = PROGRESSION_TIERS.findIndex((t) => t.id === currentTier.id);
  const nextTier =
    tierIndex < PROGRESSION_TIERS.length - 1 ? PROGRESSION_TIERS[tierIndex + 1] : null;

  if (!nextTier) {
    // Highest tier (Legend) reached
    return {
      currentTier,
      nextTier: null,
      xpToNextTier: 0,
      pct: 100,
    };
  }

  const xpToNextTier = Math.max(0, nextTier.min - cleanXp);
  const tierSpan = nextTier.min - currentTier.min;
  const xpEarnedInTier = cleanXp - currentTier.min;
  const pct = Math.min(
    100,
    Math.max(0, Math.round((xpEarnedInTier / Math.max(1, tierSpan)) * 100))
  );

  return {
    currentTier,
    nextTier,
    xpToNextTier,
    pct,
  };
}

export function getProgressionOverview(xp: number): ProgressionOverview {
  const cleanXp = Math.max(0, Math.floor(xp || 0));
  const lvl = getLevelProgress(cleanXp);
  const tr = getTierProgress(cleanXp);

  return {
    totalXp: cleanXp,
    level: lvl.level,
    xpIntoLevel: lvl.xpIntoLevel,
    xpToNextLevel: lvl.xpToNextLevel,
    nextLevelThreshold: lvl.nextLevelThreshold,
    levelPct: lvl.pct,
    tier: tr.currentTier,
    nextTier: tr.nextTier,
    xpToNextTier: tr.xpToNextTier,
    tierPct: tr.pct,
  };
}

// ── Ledger Total & Legacy Reconciliation ────────────────────────────────────

export function getTotalActiveXp(ledger: XPEvent[] = [], fallbackXp: number = 0): number {
  if (!ledger || ledger.length === 0) {
    return Math.max(0, fallbackXp || 0);
  }

  let total = 0;
  for (const event of ledger) {
    // Only count active events (or events without explicit state which default to active)
    if (event.state === "active" || (!event.state && event.amount > 0)) {
      total += event.amount;
    }
  }

  return Math.max(0, total);
}

export function reconcileLegacyXpLedger(
  persistedXp: number = 0,
  existingLedger: XPEvent[] = [],
  userId: string = "usr_guest"
): { reconciledLedger: XPEvent[]; canonicalTotalXp: number } {
  const ledger: XPEvent[] = (existingLedger || []).map((e) => ({
    ...e,
    state: e.state || "active",
    rewardKey: e.rewardKey || e.idempotencyKey || `${e.sourceType}:${e.sourceId}:${e.localDate}`,
  }));

  const activeSum = getTotalActiveXp(ledger, 0);

  // If persisted balance exceeds the sum of active ledger events, create a single
  // deterministic opening balance event to preserve all legitimate historical XP!
  if (persistedXp > activeSum) {
    const missingXp = persistedXp - activeSum;
    const openingRewardKey = `legacy_opening_balance:${userId}`;

    const alreadyHasOpening = ledger.some((e) => e.rewardKey === openingRewardKey);
    if (!alreadyHasOpening) {
      ledger.unshift({
        id: `xp_open_${userId}`,
        userId,
        rewardKey: openingRewardKey,
        sourceType: "opening_balance",
        sourceId: "legacy",
        actionType: "initial_balance",
        amount: missingXp,
        state: "active",
        localDate: new Date().toISOString().slice(0, 10),
        idempotencyKey: openingRewardKey,
        createdAt: new Date().toISOString(),
        labelEn: "Legacy verified opening balance",
        labelAr: "رصيد البداية الموثق سابقًا",
      });
    }
  }

  const canonicalTotalXp = getTotalActiveXp(ledger, persistedXp);
  return { reconciledLedger: ledger, canonicalTotalXp };
}

// ── Reward Key Generator & Deduplication ────────────────────────────────────

export function getRewardKey(
  sourceType: string,
  sourceId: string,
  localDate?: string,
  actionType?: string
): string {
  const parts = [sourceType, sourceId];
  if (localDate) parts.push(localDate);
  if (actionType) parts.push(actionType);
  return parts.join(":");
}

// ── XP History Aggregator (7d, 14d, 30d, Year) ─────────────────────────────

export interface DailyXpSummary {
  date: string; // YYYY-MM-DD
  dayLabelEn: string;
  dayLabelAr: string;
  xpEarned: number;
  eventCount: number;
}

export function aggregateXpHistory(
  ledger: XPEvent[] = [],
  daysCount: number = 14,
  todayStr: string = new Date().toISOString().slice(0, 10)
): DailyXpSummary[] {
  const dateMap: Record<string, { xp: number; count: number }> = {};

  // Build range of consecutive dates ending today
  const dates: string[] = [];
  const cursor = new Date(todayStr + "T12:00:00Z");

  for (let i = 0; i < daysCount; i++) {
    const dStr = cursor.toISOString().slice(0, 10);
    dates.unshift(dStr);
    dateMap[dStr] = { xp: 0, count: 0 };
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  for (const event of ledger || []) {
    if (event.state !== "active") continue;
    const dateKey = event.localDate || (event.createdAt ? event.createdAt.slice(0, 10) : "");
    if (dateMap[dateKey]) {
      dateMap[dateKey].xp += event.amount || 0;
      dateMap[dateKey].count += 1;
    }
  }

  return dates.map((dStr) => {
    const dObj = new Date(dStr + "T12:00:00Z");
    const dayLabelEn = dObj.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const dayLabelAr = dObj.toLocaleDateString("ar-EG", { weekday: "short", timeZone: "UTC" });
    return {
      date: dStr,
      dayLabelEn,
      dayLabelAr,
      xpEarned: dateMap[dStr]?.xp || 0,
      eventCount: dateMap[dStr]?.count || 0,
    };
  });
}

// ── Generic Privacy-Safe Labels ─────────────────────────────────────────────

export function getPrivacySafeLabel(event: XPEvent, isAr: boolean = false): string {
  if (isAr && event.labelAr) return event.labelAr;
  if (!isAr && event.labelEn) return event.labelEn;

  switch (event.sourceType) {
    case "task":
      return isAr ? "إنجاز مهمة" : "Task completed";
    case "habit":
      return isAr ? "استمرارية عادة يومية" : "Habit checked in";
    case "routine":
    case "routine_step":
      return isAr ? "خطوة روتين يومي" : "Routine step completed";
    case "focus":
      return isAr ? "جلسة تركيز هادئة" : "Focus session completed";
    case "learning":
    case "study":
      return isAr ? "جلسة تعلم ومطالعة" : "Learning session completed";
    case "flashcard":
      return isAr ? "مراجعة بطاقات الذاكرة" : "Flashcards reviewed";
    case "goal":
      return isAr ? "تحقيق خطوة نحو هدف" : "Goal milestone completed";
    case "journal":
      return isAr ? "يوم تدوين وتأمل" : "Writing day completed";
    case "mood":
      return isAr ? "تسجيل شعور اليوم" : "Daily mood check-in";
    case "selfcare":
    case "care":
      return isAr ? "نشاط عناية لطيف" : "Care activity completed";
    case "wellness":
    case "workout":
      return isAr ? "نشاط صحي ورياضي" : "Wellness activity completed";
    case "challenge":
      return isAr ? "إنجاز تحدٍّ شخصي" : "Challenge milestone achieved";
    case "opening_balance":
      return isAr ? "رصيد البداية الموثق سابقًا" : "Legacy verified opening balance";
    default:
      return isAr ? "نشاط مكتمل" : "Activity completed";
  }
}
