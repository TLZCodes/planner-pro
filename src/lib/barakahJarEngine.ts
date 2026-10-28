/**
 * AYXA Barakah Jar Engine (جرّة النِّعم 🤍)
 *
 * Core logic, data models, color palettes, month bucketing,
 * jar fill visual token calculation, and reading utilities.
 * Self-contained, zero circular dependencies, unit-testable in Node.js.
 */

export type PaperColor = "blush" | "lavender" | "mint" | "butter" | "sky";
export type FlowerStyle = "sakura" | "rose" | "chamomile" | "lavender" | "jasmine";

export interface PaperColorConfig {
  id: PaperColor;
  labelEn: string;
  labelAr: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  fillHex: string;
}

export interface FlowerStyleConfig {
  id: FlowerStyle;
  labelEn: string;
  labelAr: string;
  emoji: string;
  symbol: string;
}

export const PAPER_COLORS: Record<PaperColor, PaperColorConfig> = {
  blush: {
    id: "blush",
    labelEn: "Rose Blush",
    labelAr: "وردي ناعم",
    hex: "#ffe4e8",
    bgClass: "bg-pink-100/90 dark:bg-pink-950/40",
    borderClass: "border-pink-200 dark:border-pink-800",
    textClass: "text-rose-950 dark:text-rose-100",
    fillHex: "#fca5a5",
  },
  lavender: {
    id: "lavender",
    labelEn: "Soft Lavender",
    labelAr: "لافندر هادئ",
    hex: "#f3e8ff",
    bgClass: "bg-purple-100/90 dark:bg-purple-950/40",
    borderClass: "border-purple-200 dark:border-purple-800",
    textClass: "text-purple-950 dark:text-purple-100",
    fillHex: "#d8b4fe",
  },
  mint: {
    id: "mint",
    labelEn: "Gentle Mint",
    labelAr: "نعناع ندي",
    hex: "#dcfce7",
    bgClass: "bg-emerald-100/90 dark:bg-emerald-950/40",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    textClass: "text-emerald-950 dark:text-emerald-100",
    fillHex: "#86efac",
  },
  butter: {
    id: "butter",
    labelEn: "Warm Butter",
    labelAr: "أصفر دافئ",
    hex: "#fef3c7",
    bgClass: "bg-amber-100/90 dark:bg-amber-950/40",
    borderClass: "border-amber-200 dark:border-amber-800",
    textClass: "text-amber-950 dark:text-amber-100",
    fillHex: "#fde047",
  },
  sky: {
    id: "sky",
    labelEn: "Powder Sky",
    labelAr: "سماوي صافٍ",
    hex: "#e0f2fe",
    bgClass: "bg-sky-100/90 dark:bg-sky-950/40",
    borderClass: "border-sky-200 dark:border-sky-800",
    textClass: "text-sky-950 dark:text-sky-100",
    fillHex: "#93c5fd",
  },
};

export const FLOWER_STYLES: Record<FlowerStyle, FlowerStyleConfig> = {
  sakura: {
    id: "sakura",
    labelEn: "Cherry Blossom",
    labelAr: "زهر الكرز 🌸",
    emoji: "🌸",
    symbol: "sakura",
  },
  rose: {
    id: "rose",
    labelEn: "Wild Rose",
    labelAr: "ورد جوري 🌹",
    emoji: "🌹",
    symbol: "rose",
  },
  chamomile: {
    id: "chamomile",
    labelEn: "Chamomile",
    labelAr: "بابونج رقيق 🌼",
    emoji: "🌼",
    symbol: "chamomile",
  },
  lavender: {
    id: "lavender",
    labelEn: "Lavender Sprig",
    labelAr: "غصن لافندر 🪻",
    emoji: "🪻",
    symbol: "lavender",
  },
  jasmine: {
    id: "jasmine",
    labelEn: "Sweet Jasmine",
    labelAr: "ياسمين أبيض 🌺",
    emoji: "🌺",
    symbol: "jasmine",
  },
};

export interface JarTokenVisual {
  id: string;
  x: number;
  y: number;
  rotation: number;
  colorHex: string;
  emoji: string;
  isFlower: boolean;
}

/**
 * Filter journal entries belonging to Barakah Jar.
 */
export function isBarakahJarEntry(entry: {
  isBarakahJar?: boolean;
  templateId?: string;
  tags?: string[];
}): boolean {
  if (entry.isBarakahJar === true) return true;
  // Also include entries explicitly tagged with barakah_jar or barakah
  if (entry.tags && (entry.tags.includes("barakah_jar") || entry.tags.includes("barakah"))) {
    return true;
  }
  return false;
}

/**
 * Extract YYYY-MM from a YYYY-MM-DD key.
 */
export function getYearMonthKey(dateStr?: string): string {
  if (!dateStr || dateStr.length < 7) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  return dateStr.substring(0, 7);
}

/**
 * Format month key into human readable title (English or Arabic).
 */
export function formatMonthName(yearMonth: string, isAr: boolean): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const d = new Date(year, month, 1);

  if (isAr) {
    const arMonths = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    ];
    return `${arMonths[month] || ""} ${year}`;
  }

  const enMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${enMonths[month] || ""} ${year}`;
}

/**
 * Compute previous and next month keys.
 */
export function getAdjacentMonthKey(yearMonth: string, offset: -1 | 1): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) + offset;
  if (m < 1) {
    m = 12;
    y -= 1;
  } else if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/**
 * Filter and sort notes for a given month.
 */
export function getBarakahNotesForMonth<T extends { date: string; isBarakahJar?: boolean; tags?: string[] }>(
  allEntries: T[],
  monthKey: string | "all"
): T[] {
  const jarEntries = allEntries.filter(isBarakahJarEntry);
  if (monthKey === "all") {
    return [...jarEntries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
  return jarEntries
    .filter((e) => getYearMonthKey(e.date) === monthKey)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

/**
 * Get distinct available months with count of notes in descending chronological order.
 */
export function getAvailableBarakahMonths<T extends { date: string; isBarakahJar?: boolean; tags?: string[] }>(
  allEntries: T[]
): Array<{ key: string; count: number }> {
  const map = new Map<string, number>();
  for (const entry of allEntries) {
    if (isBarakahJarEntry(entry)) {
      const ym = getYearMonthKey(entry.date);
      map.set(ym, (map.get(ym) || 0) + 1);
    }
  }
  const result: Array<{ key: string; count: number }> = [];
  map.forEach((count, key) => {
    result.push({ key, count });
  });
  result.sort((a, b) => b.key.localeCompare(a.key));
  return result;
}

/**
 * Pick a random blessing note. Guarantees selecting from real entries,
 * never invents an AI blessing, and tries to pick a different one if excludeId is given.
 */
export function pickRandomBlessing<T extends { id: string }>(
  notes: T[],
  excludeId?: string
): T | null {
  if (!notes || notes.length === 0) return null;
  if (notes.length === 1) return notes[0];

  const pool = excludeId ? notes.filter((n) => n.id !== excludeId) : notes;
  const targetPool = pool.length > 0 ? pool : notes;
  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex];
}

/**
 * Pseudo-random deterministic hash based on a string ID.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate visual tokens for the transparent jar illustration.
 * Honest rendering:
 * - Up to MAX_VISIBLE_TOKENS (24) are positioned naturally at the bottom of the jar.
 * - If note count > MAX_VISIBLE_TOKENS, an aggregate fill level is used alongside exact count badge.
 */
export const MAX_VISIBLE_TOKENS = 24;

export function deriveJarVisualTokens<
  T extends { id: string; paperColor?: PaperColor; flowerStyle?: FlowerStyle }
>(notes: T[]): {
  tokens: JarTokenVisual[];
  isAggregated: boolean;
  exactCount: number;
  fillPercentage: number;
} {
  const exactCount = notes.length;
  if (exactCount === 0) {
    return { tokens: [], isAggregated: false, exactCount: 0, fillPercentage: 0 };
  }

  const isAggregated = exactCount > MAX_VISIBLE_TOKENS;
  const visibleSubset = notes.slice(0, MAX_VISIBLE_TOKENS);

  // Jar coordinate space:
  // Jar body is width 160, height 200, bottom base sits around y = 185..215, x = 30..130.
  const tokens: JarTokenVisual[] = visibleSubset.map((item, index) => {
    const h = hashString(item.id || `token-${index}`);
    const colorKey = item.paperColor || (["blush", "lavender", "mint", "butter", "sky"][h % 5] as PaperColor);
    const flowerKey = item.flowerStyle || (["sakura", "rose", "chamomile", "lavender", "jasmine"][h % 5] as FlowerStyle);
    const colorConfig = PAPER_COLORS[colorKey] || PAPER_COLORS.blush;
    const flowerConfig = FLOWER_STYLES[flowerKey] || FLOWER_STYLES.sakura;

    // Layer from bottom upwards as index increases
    const row = Math.floor(index / 5);
    const col = index % 5;
    const jitterX = ((h % 17) - 8);
    const jitterY = (((h >> 3) % 11) - 5);
    const rotation = ((h % 60) - 30);

    const x = 46 + col * 16 + jitterX;
    const y = 205 - row * 18 + jitterY;

    return {
      id: item.id || `tok-${index}`,
      x: Math.max(36, Math.min(124, x)),
      y: Math.max(100, Math.min(215, y)),
      rotation,
      colorHex: colorConfig.fillHex,
      emoji: flowerConfig.emoji,
      isFlower: (h % 3) === 0, // 1 in 3 items show flower petal
    };
  });

  const fillPercentage = Math.min(100, Math.round((exactCount / 30) * 100));

  return {
    tokens,
    isAggregated,
    exactCount,
    fillPercentage,
  };
}

/**
 * Format date for Barakah note card display.
 */
export function formatBlessingDate(dateStr: string, isAr: boolean): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
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
