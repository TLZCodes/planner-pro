/**
 * AYXA Wheel of Becoming (دائرة التوازن 🌸) Engine
 *
 * Subjective monthly reflection to consider different areas of life,
 * record personal satisfaction (1-10, never 0 or inferred),
 * choose one gentle focus, and reflect with kindness.
 *
 * Pure TypeScript, zero external dependencies, 100% unit-testable in Node.js.
 */

export interface WheelAreaConfig {
  id: string; // Stable ID: "faith", "health", "mental_wellbeing", etc.
  nameEn: string;
  nameAr: string;
  icon: string; // Lucide icon reference name
  color: string; // Pastel accent hex code
  order: number;
  hidden?: boolean;
  isCustom?: boolean;
}

export interface WheelReflectionNotes {
  supportive?: string; // "What feels supportive? / ما الذي يدعمني؟"
  space?: string; // "What needs more space? / ما الذي يحتاج مساحة أكبر؟"
  different?: string; // "What would I like to approach differently? / ما الذي أرغب في التعامل معه بطريقة مختلفة؟"
  remain?: string; // "What can remain as it is? / ما الذي أودّ الإبقاء عليه كما هو؟"
}

export interface WheelOfBecomingRecord {
  id: string;
  yearMonth: string; // Format: "YYYY-MM"
  areas: WheelAreaConfig[]; // Snapshot of area definitions active at time of check-in
  ratings: Record<string, number>; // areaId -> rating (1..10). Unrated areas are omitted (never 0)
  notes: Record<string, string>; // areaId -> personal reflection note
  focusAreaId?: string; // Selected 1 gentle focus area
  focusIntention?: string; // Short intention text
  gentleAction?: string; // Optional gentle action
  linkedGoalId?: string; // Explicit canonical Goal ID link
  reflectionNotes?: WheelReflectionNotes;
  isBackfilled?: boolean;
  enteredAt?: string; // ISO timestamp of actual data entry
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WheelCustomizationSettings {
  customAreas?: WheelAreaConfig[];
  monthlyReminderEnabled?: boolean;
  reminderDayOfMonth?: number; // 1..28
  reminderTime?: string; // "HH:MM"
}

// ── 1. Default 10 Starting Areas ────────────────────────────────────────────

export const DEFAULT_WHEEL_AREAS: WheelAreaConfig[] = [
  {
    id: "faith",
    nameEn: "Faith",
    nameAr: "الإيمان",
    icon: "Moon",
    color: "#F472B6", // Rose pastel
    order: 0,
  },
  {
    id: "health",
    nameEn: "Health",
    nameAr: "الصحة",
    icon: "Apple",
    color: "#34D399", // Emerald / Mint
    order: 1,
  },
  {
    id: "mental_wellbeing",
    nameEn: "Mental wellbeing",
    nameAr: "الراحة النفسية",
    icon: "Smile",
    color: "#A78BFA", // Lavender
    order: 2,
  },
  {
    id: "personal_growth",
    nameEn: "Personal growth",
    nameAr: "النمو الشخصي",
    icon: "Sprout",
    color: "#38BDF8", // Sky blue
    order: 3,
  },
  {
    id: "learning",
    nameEn: "Learning",
    nameAr: "التعلّم",
    icon: "BookOpen",
    color: "#818CF8", // Indigo pastel
    order: 4,
  },
  {
    id: "money",
    nameEn: "Money",
    nameAr: "المال",
    icon: "Coins",
    color: "#FBBF24", // Butter yellow / Amber
    order: 5,
  },
  {
    id: "work_business",
    nameEn: "Work & Business",
    nameAr: "العمل والمشاريع",
    icon: "Briefcase",
    color: "#60A5FA", // Powder blue
    order: 6,
  },
  {
    id: "relationships",
    nameEn: "Relationships",
    nameAr: "العلاقات",
    icon: "Users",
    color: "#FB7185", // Blush pink
    order: 7,
  },
  {
    id: "rest_joy",
    nameEn: "Rest & Joy",
    nameAr: "الراحة والبهجة",
    icon: "Coffee",
    color: "#FB923C", // Warm peach
    order: 8,
  },
  {
    id: "home",
    nameEn: "Home",
    nameAr: "المنزل",
    icon: "Home",
    color: "#2DD4BF", // Teal pastel
    order: 9,
  },
];

// ── 2. Guided Reflection Prompts ────────────────────────────────────────────

export const WHEEL_REFLECTION_PROMPTS = [
  {
    key: "supportive" as const,
    promptEn: "What feels supportive?",
    promptAr: "ما الذي يدعمني؟",
  },
  {
    key: "space" as const,
    promptEn: "What needs more space?",
    promptAr: "ما الذي يحتاج مساحة أكبر؟",
  },
  {
    key: "different" as const,
    promptEn: "What would I like to approach differently?",
    promptAr: "ما الذي أرغب في التعامل معه بطريقة مختلفة؟",
  },
  {
    key: "remain" as const,
    promptEn: "What can remain as it is?",
    promptAr: "ما الذي أودّ الإبقاء عليه كما هو؟",
  },
];

// ── 3. Date & Year-Month Utilities ──────────────────────────────────────────

/**
 * Formats a Date or date string to canonical "YYYY-MM"
 */
export function getYearMonth(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Returns previous or next month formatted as "YYYY-MM"
 */
export function getAdjacentYearMonth(yearMonth: string, offsetMonths: number): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed

  if (isNaN(year) || isNaN(month)) {
    return getYearMonth(new Date());
  }

  const d = new Date(year, month + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Checks whether yearMonth is strictly in the future compared to current local month
 */
export function isMonthInFuture(yearMonth: string, currentYearMonth: string = getYearMonth()): boolean {
  return yearMonth > currentYearMonth;
}

/**
 * Checks whether yearMonth is strictly in the past compared to current local month
 */
export function isMonthPast(yearMonth: string, currentYearMonth: string = getYearMonth()): boolean {
  return yearMonth < currentYearMonth;
}

/**
 * Localized month name and year (e.g., "October 2026" / "أكتوبر 2026")
 */
export function formatMonthLabel(yearMonth: string, isAr: boolean = false): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  if (isNaN(year) || isNaN(month)) return yearMonth;

  const d = new Date(year, month, 1);
  return d.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

// ── 4. Normalization & Factory ──────────────────────────────────────────────

/**
 * Deep clones and normalizes an areas array with safe order and defaults
 */
export function normalizeWheelAreas(rawAreas?: WheelAreaConfig[]): WheelAreaConfig[] {
  if (!Array.isArray(rawAreas) || rawAreas.length === 0) {
    return DEFAULT_WHEEL_AREAS.map((a, i) => ({ ...a, order: i }));
  }

  return rawAreas.map((area, index) => ({
    id: typeof area.id === "string" && area.id.trim() ? area.id.trim() : `custom_${index}`,
    nameEn: typeof area.nameEn === "string" && area.nameEn.trim() ? area.nameEn.trim() : `Area ${index + 1}`,
    nameAr: typeof area.nameAr === "string" && area.nameAr.trim() ? area.nameAr.trim() : (area.nameEn || `جانب ${index + 1}`),
    icon: typeof area.icon === "string" && area.icon.trim() ? area.icon.trim() : "Sparkles",
    color: typeof area.color === "string" && area.color.startsWith("#") ? area.color : "#E87A90",
    order: typeof area.order === "number" ? area.order : index,
    hidden: Boolean(area.hidden),
    isCustom: Boolean(area.isCustom),
  })).sort((a, b) => a.order - b.order);
}

/**
 * Creates or normalizes a canonical WheelOfBecomingRecord for a specific month.
 * Enforces truthful ratings (1-10 only, unrated omitted, never 0 or prefilled midpoint).
 */
export function normalizeWheelRecord(
  raw: Partial<WheelOfBecomingRecord> | null | undefined,
  targetYearMonth: string,
  userCustomAreas?: WheelAreaConfig[]
): WheelOfBecomingRecord {
  const yearMonth = targetYearMonth || (raw?.yearMonth ? raw.yearMonth : getYearMonth());
  const nowIso = new Date().toISOString();
  const currentMonth = getYearMonth();

  // Snapshot active areas: if record already has areas, preserve historical definitions!
  const areas = raw?.areas && Array.isArray(raw.areas) && raw.areas.length > 0
    ? normalizeWheelAreas(raw.areas)
    : normalizeWheelAreas(userCustomAreas || DEFAULT_WHEEL_AREAS);

  // Sanitize ratings: strictly 1 to 10; missing or invalid ratings are excluded
  const cleanRatings: Record<string, number> = {};
  if (raw?.ratings && typeof raw.ratings === "object") {
    for (const [key, val] of Object.entries(raw.ratings)) {
      if (typeof val === "number" && !isNaN(val) && val >= 1 && val <= 10) {
        cleanRatings[key] = Math.round(val);
      }
    }
  }

  // Sanitize notes: strings trimmed
  const cleanNotes: Record<string, string> = {};
  if (raw?.notes && typeof raw.notes === "object") {
    for (const [key, text] of Object.entries(raw.notes)) {
      if (typeof text === "string" && text.trim()) {
        cleanNotes[key] = text.trim();
      }
    }
  }

  // Check if backfilled
  const isBackfilled = raw?.isBackfilled ?? (isMonthPast(yearMonth, currentMonth) && Object.keys(cleanRatings).length > 0);

  return {
    id: raw?.id || `wheel_${yearMonth}_${Math.random().toString(36).slice(2, 9)}`,
    yearMonth,
    areas,
    ratings: cleanRatings,
    notes: cleanNotes,
    focusAreaId: typeof raw?.focusAreaId === "string" && raw.focusAreaId.trim() ? raw.focusAreaId.trim() : undefined,
    focusIntention: typeof raw?.focusIntention === "string" && raw.focusIntention.trim() ? raw.focusIntention.trim() : undefined,
    gentleAction: typeof raw?.gentleAction === "string" && raw.gentleAction.trim() ? raw.gentleAction.trim() : undefined,
    linkedGoalId: typeof raw?.linkedGoalId === "string" && raw.linkedGoalId.trim() ? raw.linkedGoalId.trim() : undefined,
    reflectionNotes: {
      supportive: raw?.reflectionNotes?.supportive?.trim() || undefined,
      space: raw?.reflectionNotes?.space?.trim() || undefined,
      different: raw?.reflectionNotes?.different?.trim() || undefined,
      remain: raw?.reflectionNotes?.remain?.trim() || undefined,
    },
    isBackfilled,
    enteredAt: raw?.enteredAt || (isBackfilled ? nowIso : undefined),
    isDraft: Boolean(raw?.isDraft),
    createdAt: raw?.createdAt || nowIso,
    updatedAt: nowIso,
  };
}

// ── 5. Truthful Metrics (No Score, No Grade, No Percentage) ─────────────────

export interface WheelMetrics {
  totalAreasCount: number;
  activeAreasCount: number;
  ratedCount: number;
  unratedCount: number;
  isFullyRated: boolean;
  hasSufficientDataForPolygon: boolean; // >= 3 ratings
  hasAnyReflection: boolean;
}

export function calculateWheelMetrics(record?: WheelOfBecomingRecord | null): WheelMetrics {
  if (!record) {
    const defaultActive = DEFAULT_WHEEL_AREAS.filter((a) => !a.hidden).length;
    return {
      totalAreasCount: DEFAULT_WHEEL_AREAS.length,
      activeAreasCount: defaultActive,
      ratedCount: 0,
      unratedCount: defaultActive,
      isFullyRated: false,
      hasSufficientDataForPolygon: false,
      hasAnyReflection: false,
    };
  }

  const activeAreas = record.areas.filter((a) => !a.hidden);
  const ratedCount = activeAreas.filter((a) => typeof record.ratings[a.id] === "number").length;
  const hasNotes = Object.keys(record.notes || {}).length > 0;
  const hasFocus = Boolean(record.focusAreaId || record.focusIntention);
  const hasReflections = Object.values(record.reflectionNotes || {}).some((v) => Boolean(v));

  return {
    totalAreasCount: record.areas.length,
    activeAreasCount: activeAreas.length,
    ratedCount,
    unratedCount: Math.max(0, activeAreas.length - ratedCount),
    isFullyRated: activeAreas.length > 0 && ratedCount === activeAreas.length,
    hasSufficientDataForPolygon: ratedCount >= 3,
    hasAnyReflection: ratedCount > 0 || hasNotes || hasFocus || hasReflections,
  };
}

// ── 6. Neutral Month Comparison ─────────────────────────────────────────────

export interface AreaComparisonResult {
  areaId: string;
  nameEn: string;
  nameAr: string;
  color: string;
  currentRating?: number;
  previousRating?: number;
  isComparable: boolean;
  neutralTextEn: string;
  neutralTextAr: string;
  diff?: number;
}

export interface MonthComparisonSummary {
  previousYearMonth: string;
  currentYearMonth: string;
  hasPreviousRecord: boolean;
  comparableCount: number;
  areaComparisons: AreaComparisonResult[];
  definitionChangedWarning?: {
    en: string;
    ar: string;
  };
}

/**
 * Compares two monthly records neutrally.
 * Never calculates an overall life grade or averages areas into a single score.
 */
export function compareMonthRecords(
  currentRecord: WheelOfBecomingRecord,
  previousRecord?: WheelOfBecomingRecord | null
): MonthComparisonSummary {
  const prevMonth = getAdjacentYearMonth(currentRecord.yearMonth, -1);

  if (!previousRecord) {
    return {
      previousYearMonth: prevMonth,
      currentYearMonth: currentRecord.yearMonth,
      hasPreviousRecord: false,
      comparableCount: 0,
      areaComparisons: [],
    };
  }

  const currentActive = currentRecord.areas.filter((a) => !a.hidden);
  const prevActive = previousRecord.areas.filter((a) => !a.hidden);
  const prevAreaMap = new Map(previousRecord.areas.map((a) => [a.id, a]));

  // Check if definitions significantly changed (different IDs or renaming)
  let definitionChanged = false;
  for (const curr of currentActive) {
    const prev = prevAreaMap.get(curr.id);
    if (prev && (prev.nameEn !== curr.nameEn || prev.nameAr !== curr.nameAr)) {
      definitionChanged = true;
      break;
    }
  }

  const areaComparisons: AreaComparisonResult[] = currentActive.map((curr) => {
    const currRating = currentRecord.ratings[curr.id];
    const prevRating = previousRecord.ratings[curr.id];
    const isComparable = typeof currRating === "number" && typeof prevRating === "number";

    let neutralTextEn = "Not rated";
    let neutralTextAr = "لم يُقيّم";
    let diff: number | undefined = undefined;

    if (isComparable) {
      diff = currRating - prevRating;
      if (currRating === prevRating) {
        neutralTextEn = `Previously ${prevRating}, now ${currRating} (Unchanged)`;
        neutralTextAr = `سابقاً ${prevRating}، والآن ${currRating} (مستقر)`;
      } else {
        neutralTextEn = `Previously ${prevRating}, now ${currRating}`;
        neutralTextAr = `سابقاً ${prevRating}، والآن ${currRating}`;
      }
    } else if (typeof currRating === "number" && typeof prevRating !== "number") {
      neutralTextEn = `Now ${currRating} (Previously unrated)`;
      neutralTextAr = `الآن ${currRating} (لم يُقيّم سابقاً)`;
    } else if (typeof currRating !== "number" && typeof prevRating === "number") {
      neutralTextEn = `Previously ${prevRating} (Not rated this month)`;
      neutralTextAr = `سابقاً ${prevRating} (لم يُقيّم هذا الشهر)`;
    }

    return {
      areaId: curr.id,
      nameEn: curr.nameEn,
      nameAr: curr.nameAr,
      color: curr.color,
      currentRating: currRating,
      previousRating: prevRating,
      isComparable,
      neutralTextEn,
      neutralTextAr,
      diff,
    };
  });

  const comparableCount = areaComparisons.filter((c) => c.isComparable).length;

  return {
    previousYearMonth: previousRecord.yearMonth,
    currentYearMonth: currentRecord.yearMonth,
    hasPreviousRecord: true,
    comparableCount,
    areaComparisons,
    definitionChangedWarning: definitionChanged
      ? {
          en: "Note: Some area names were customized between these two months.",
          ar: "ملاحظة: تم تعديل مسميات بعض الجوانب بين هذين الشهرين.",
        }
      : undefined,
  };
}

// ── 7. SVG Math & Wheel Coordinate Computation ──────────────────────────────

export interface SvgAreaWedge {
  area: WheelAreaConfig;
  startAngle: number; // in radians
  endAngle: number;
  midAngle: number;
  radius: number; // in pixels
  pathD: string; // SVG path command
  labelX: number;
  labelY: number;
  isRated: boolean;
  rating?: number;
}

/**
 * Computes SVG geometry for wheel rendering.
 * Radius scale: 1..10 maps to 10%..100% of maxRadius.
 */
export function generateWheelSvgGeometry(
  record: WheelOfBecomingRecord,
  maxRadius: number = 130,
  center: number = 160
): {
  wedges: SvgAreaWedge[];
  polygonPoints: string;
  activeAreas: WheelAreaConfig[];
  hasSufficientData: boolean;
} {
  const activeAreas = record.areas.filter((a) => !a.hidden);
  const n = activeAreas.length;

  if (n === 0) {
    return {
      wedges: [],
      polygonPoints: "",
      activeAreas: [],
      hasSufficientData: false,
    };
  }

  const deltaAngle = (2 * Math.PI) / n;
  const wedges: SvgAreaWedge[] = [];
  const polygonCoords: { x: number; y: number }[] = [];
  let ratedCount = 0;

  activeAreas.forEach((area, i) => {
    // Start from top (-PI / 2)
    const startAngle = i * deltaAngle - Math.PI / 2;
    const endAngle = (i + 1) * deltaAngle - Math.PI / 2;
    const midAngle = startAngle + deltaAngle / 2;

    const rating = record.ratings[area.id];
    const isRated = typeof rating === "number" && rating >= 1 && rating <= 10;
    if (isRated) ratedCount++;

    // Radius: min visible wedge is 10%, max is 100%
    const scaleFactor = isRated ? rating / 10 : 0;
    const wedgeRadius = Math.max(10, maxRadius * scaleFactor);

    // Compute Wedge Pie Arc Path
    const x1 = center + (isRated ? wedgeRadius : maxRadius) * Math.cos(startAngle);
    const y1 = center + (isRated ? wedgeRadius : maxRadius) * Math.sin(startAngle);
    const x2 = center + (isRated ? wedgeRadius : maxRadius) * Math.cos(endAngle);
    const y2 = center + (isRated ? wedgeRadius : maxRadius) * Math.sin(endAngle);

    const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;

    let pathD = "";
    if (isRated) {
      // Filled wedge from center to arc
      pathD = `M ${center} ${center} L ${x1} ${y1} A ${wedgeRadius} ${wedgeRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    } else {
      // Hollow placeholder arc at maxRadius to show boundary
      pathD = `M ${center} ${center} L ${x1} ${y1} A ${maxRadius} ${maxRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    // Label coordinates positioned just outside maxRadius
    const labelDistance = maxRadius + 22;
    const labelX = center + labelDistance * Math.cos(midAngle);
    const labelY = center + labelDistance * Math.sin(midAngle);

    wedges.push({
      area,
      startAngle,
      endAngle,
      midAngle,
      radius: isRated ? wedgeRadius : 0,
      pathD,
      labelX,
      labelY,
      isRated,
      rating,
    });

    if (isRated) {
      const px = center + wedgeRadius * Math.cos(midAngle);
      const py = center + wedgeRadius * Math.sin(midAngle);
      polygonCoords.push({ x: px, y: py });
    }
  });

  const polygonPoints = polygonCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  return {
    wedges,
    polygonPoints,
    activeAreas,
    hasSufficientData: ratedCount >= 3,
  };
}

// ── 8. Duplicate Goal Prevention & Match Search ─────────────────────────────

/**
 * Searches user goals for similar title to prevent duplicate creation
 */
export function findExistingGoalMatch(
  goals: Array<{ id: string; title: string; category?: string }>,
  intention: string
): { id: string; title: string } | null {
  if (!intention || !intention.trim()) return null;
  const q = intention.trim().toLowerCase();

  const found = goals.find((g) => {
    const t = (g.title || "").toLowerCase();
    return t.includes(q) || q.includes(t);
  });

  return found ? { id: found.id, title: found.title } : null;
}
