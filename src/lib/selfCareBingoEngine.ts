/**
 * Pure Self-Care Bingo Engine for AYXA Planner Pro
 * Supports 3x3 and 4x4 weekly boards, pastel themes,
 * canonical activity mapping, real activity types (simple, duration, quantity, hydration),
 * deterministic completion matching, line calculation, and zero XP gamification.
 */

import { type CareCategory, type SelfCareActivity, type SelfCarePlanItem } from "./selfCareEngine.ts";
import { type WeekInfo, getWeekDaysInfo, formatLocalDateStr } from "./weeklyHabitEngine.ts";

export type BingoBoardSize = 3 | 4;
export type BingoTheme = "blush" | "lavender" | "mint" | "yellow" | "blue";
export type BingoActivityType = "simple" | "duration" | "quantity" | "hydration";

export interface SelfCareBingoTile {
  id: string;
  activityId: string;
  occurrenceIndex: number;
  // Historical snapshot fields for resiliency if parent activity is renamed or archived
  title: string;
  titleAr?: string;
  icon: string;
  category: CareCategory;
  activityType: BingoActivityType;
  targetValue: number; // e.g. 1 for simple, 15 for 15min, 8 for 8 cups
  currentValue: number;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  completedDate?: string; // YYYY-MM-DD local date
  planItemId?: string; // Canonical plan item link
  isDecorativeCenter?: boolean; // Center tile on 3x3 if configured as decorative only
}

export interface SelfCareBingoBoard {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  size: BingoBoardSize; // 3 or 4
  theme: BingoTheme;
  tiles: SelfCareBingoTile[];
  celebrationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BingoLine {
  type: "row" | "column" | "diagonal";
  index: number;
  tileIndices: number[];
  isCompleted: boolean;
}

// ── 1. Color Palettes & Themes ───────────────────────────────────────────────

export interface BingoThemeDefinition {
  id: BingoTheme;
  nameEn: string;
  nameAr: string;
  bgHex: string;
  boardBgHex: string;
  tileBgHex: string;
  tileBorderHex: string;
  tileHoverHex: string;
  completedBgHex: string;
  completedBorderHex: string;
  accentPink: string;
  darkPlumText: string;
}

export const BINGO_THEMES: Record<BingoTheme, BingoThemeDefinition> = {
  blush: {
    id: "blush",
    nameEn: "Soft Blush",
    nameAr: "وردي هادئ",
    bgHex: "#fff5f7",
    boardBgHex: "#fff0f3",
    tileBgHex: "#ffffff",
    tileBorderHex: "#fbcfe8",
    tileHoverHex: "#fdf2f8",
    completedBgHex: "#fce7f3",
    completedBorderHex: "#f472b6",
    accentPink: "#ec4899",
    darkPlumText: "#4a154b",
  },
  lavender: {
    id: "lavender",
    nameEn: "Lavender Mist",
    nameAr: "خزامى رقيقة",
    bgHex: "#faf5ff",
    boardBgHex: "#f3e8ff",
    tileBgHex: "#ffffff",
    tileBorderHex: "#e9d5ff",
    tileHoverHex: "#f5f3ff",
    completedBgHex: "#ede9fe",
    completedBorderHex: "#c084fc",
    accentPink: "#d946ef",
    darkPlumText: "#3b0764",
  },
  mint: {
    id: "mint",
    nameEn: "Quiet Sage",
    nameAr: "مريمية هادئة",
    bgHex: "#f0fdf4",
    boardBgHex: "#dcfce7",
    tileBgHex: "#ffffff",
    tileBorderHex: "#bbf7d0",
    tileHoverHex: "#f0fdf4",
    completedBgHex: "#dcfce7",
    completedBorderHex: "#4ade80",
    accentPink: "#10b981",
    darkPlumText: "#14532d",
  },
  yellow: {
    id: "yellow",
    nameEn: "Butter Yellow",
    nameAr: "أصفر زبدي",
    bgHex: "#fefce8",
    boardBgHex: "#fef9c3",
    tileBgHex: "#ffffff",
    tileBorderHex: "#fde047",
    tileHoverHex: "#fef08a",
    completedBgHex: "#fef08a",
    completedBorderHex: "#eab308",
    accentPink: "#f59e0b",
    darkPlumText: "#713f12",
  },
  blue: {
    id: "blue",
    nameEn: "Powder Blue",
    nameAr: "أزرق سماوي هادئ",
    bgHex: "#f0f9ff",
    boardBgHex: "#e0f2fe",
    tileBgHex: "#ffffff",
    tileBorderHex: "#bae6fd",
    tileHoverHex: "#f0f9ff",
    completedBgHex: "#e0f2fe",
    completedBorderHex: "#38bdf8",
    accentPink: "#0284c7",
    darkPlumText: "#0c4a6e",
  },
};

// ── 2. Curated Starter Ideas ────────────────────────────────────────────────

export interface StarterBingoIdea {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: CareCategory;
  activityType: BingoActivityType;
  defaultTargetValue: number;
}

export const STARTER_BINGO_IDEAS: StarterBingoIdea[] = [
  {
    id: "bingo_idea_read",
    titleEn: "Read for a little while",
    titleAr: "قراءة لبعض الوقت",
    descriptionEn: "A few peaceful pages in a book you enjoy.",
    descriptionAr: "صفحات قليلة في كتاب تحبينه بدون عجلة.",
    icon: "📖",
    category: "joy",
    activityType: "duration",
    defaultTargetValue: 15,
  },
  {
    id: "bingo_idea_hobby",
    titleEn: "Enjoy a hobby",
    titleAr: "الاستمتاع بهواية أحبها",
    descriptionEn: "Crochet, painting, writing, or crafting purely for joy.",
    descriptionAr: "حياكة، رسم، كتابة أو أي عمل يدوي يبهج قلبكِ.",
    icon: "🎨",
    category: "joy",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_screen_free",
    titleEn: "Take a screen-free break",
    titleAr: "استراحة بعيداً عن الشاشات",
    descriptionEn: "Rest your eyes and mind from notifications.",
    descriptionAr: "إراحة عينيكِ وذهنكِ من الشاشات والإشعارات.",
    icon: "🌿",
    category: "calm",
    activityType: "duration",
    defaultTargetValue: 20,
  },
  {
    id: "bingo_idea_tidy_space",
    titleEn: "Tidy a small space",
    titleAr: "ترتيب مساحة صغيرة",
    descriptionEn: "Clear your desk, nightstand, or a cozy corner.",
    descriptionAr: "ترتيب مكتبكِ أو زاويتكِ المفضلة بلطف.",
    icon: "🪴",
    category: "environment",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_outdoors",
    titleEn: "Spend time outdoors",
    titleAr: "قضاء وقت في الهواء الطلق",
    descriptionEn: "Feel the fresh breeze, morning sunlight, or night sky.",
    descriptionAr: "استنشاق هواء نقي والشعور بنسمات الصباح أو المساء.",
    icon: "☀️",
    category: "movement",
    activityType: "duration",
    defaultTargetValue: 15,
  },
  {
    id: "bingo_idea_warm_drink",
    titleEn: "Make a comforting drink",
    titleAr: "إعداد مشروب دافئ مريح",
    descriptionEn: "Herbal tea, warm matcha, or spiced milk savored slowly.",
    descriptionAr: "شاي أعشاب دافئ أو ماتشا ترتشفينه بروية وهدوء.",
    icon: "☕",
    category: "body",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_stretch",
    titleEn: "Stretch gently",
    titleAr: "إطالة خفيفة ولطيفة",
    descriptionEn: "Unwind tension in shoulders, neck, and back.",
    descriptionAr: "إرخاء عضلات الرقبة والكتفين بحركات خفيفة ومريحة.",
    icon: "🧘‍♀️",
    category: "movement",
    activityType: "duration",
    defaultTargetValue: 10,
  },
  {
    id: "bingo_idea_rest",
    titleEn: "Rest without guilt",
    titleAr: "أخذ قسط من الراحة دون لوم",
    descriptionEn: "Lie down, close your eyes, and allow yourself to just be.",
    descriptionAr: "استلقاء هادئ وإغماض العينين دون التفكير في المهام.",
    icon: "🌙",
    category: "rest",
    activityType: "duration",
    defaultTargetValue: 20,
  },
  {
    id: "bingo_idea_connect",
    titleEn: "Connect with someone dear",
    titleAr: "التواصل مع شخص لطيف",
    descriptionEn: "Send a kind voice note or share a warm conversation.",
    descriptionAr: "إرسال رسالة صوتية لطيفة أو مكالمة دافئة مع من تحبين.",
    icon: "💬",
    category: "connection",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_gratitude_pause",
    titleEn: "A pause of gratitude",
    titleAr: "وقفة امتنان صادقة",
    descriptionEn: "Notice three gentle blessings in your present day.",
    descriptionAr: "تأمّل ثلاث نعم لطيفة في يومكِ الحاضر وشكر الله عليها.",
    icon: "🤲",
    category: "spiritual",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_hydration",
    titleEn: "Hydrate mindfully",
    titleAr: "ترطيب وانتعاش",
    descriptionEn: "Drink clean water with lemon or mint throughout the day.",
    descriptionAr: "شرب الماء بنقاء وانتعاش على مدار اليوم.",
    icon: "💧",
    category: "body",
    activityType: "hydration",
    defaultTargetValue: 6,
  },
  {
    id: "bingo_idea_skincare",
    titleEn: "Gentle skincare ritual",
    titleAr: "عناية ناعمة بالبشرة",
    descriptionEn: "A warm face wash, rose water, and gentle moisturization.",
    descriptionAr: "غسل الوجه بلطف وترطيبه بماء الورد وكريم ناعم.",
    icon: "🧴",
    category: "body",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_breathe",
    titleEn: "Deep, slow breathing",
    titleAr: "تنفّس عميق وهادئ",
    descriptionEn: "Inhale calm, exhale any weight you are carrying.",
    descriptionAr: "شهيق عميق يملأ الرئتين هدوءاً وزفير يحرر التوتر.",
    icon: "🕊️",
    category: "calm",
    activityType: "duration",
    defaultTargetValue: 5,
  },
  {
    id: "bingo_idea_favorite_scent",
    titleEn: "Light a calming scent",
    titleAr: "إشعال عطر أو بخور مهدئ",
    descriptionEn: "Bakhour, vanilla, or lavender candle filling your room.",
    descriptionAr: "بخور لطيف أو شمعة لافندر تملأ غرفتكِ بالسكينة.",
    icon: "🕯️",
    category: "environment",
    activityType: "simple",
    defaultTargetValue: 1,
  },
  {
    id: "bingo_idea_walk",
    titleEn: "A slow, peaceful stroll",
    titleAr: "نزهة مشي هادئة",
    descriptionEn: "Walk at an easy pace without counting steps or distance.",
    descriptionAr: "المشي على مهل دون حساب للخطوات أو السرعة.",
    icon: "🚶‍♀️",
    category: "movement",
    activityType: "duration",
    defaultTargetValue: 20,
  },
  {
    id: "bingo_idea_kindness_self",
    titleEn: "Whisper kindness to yourself",
    titleAr: "كلمة طيبة لنفسكِ",
    descriptionEn: "Forgive yourself for unfinished items and speak with warmth.",
    descriptionAr: "مسامحة النفس على ما فات والتحدث إليها بلطف ومحبة.",
    icon: "🌸",
    category: "calm",
    activityType: "simple",
    defaultTargetValue: 1,
  },
];

// ── 3. Factory & Board Construction ─────────────────────────────────────────

export function createDefaultBingoBoard(
  weekStartDate: string,
  weekEndDate: string,
  size: BingoBoardSize = 3,
  theme: BingoTheme = "blush"
): SelfCareBingoBoard {
  const totalTiles = size * size;
  const tiles: SelfCareBingoTile[] = [];

  for (let i = 0; i < totalTiles; i++) {
    tiles.push({
      id: `tile_${i + 1}`,
      activityId: "",
      occurrenceIndex: 0,
      title: "",
      icon: "🌸",
      category: "joy",
      activityType: "simple",
      targetValue: 1,
      currentValue: 0,
      completed: false,
    });
  }

  return {
    id: `bingo_${weekStartDate}_${size}x${size}`,
    weekStartDate,
    weekEndDate,
    size,
    theme,
    tiles,
    celebrationsEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function populateBoardWithActivities(
  board: SelfCareBingoBoard,
  activities: SelfCareActivity[],
  preferredIdeas?: StarterBingoIdea[]
): SelfCareBingoBoard {
  const total = board.size * board.size;
  const newTiles = [...board.tiles];

  // Pick unique activities first
  const activeActivities = activities.filter((a) => a.status === "active");
  let actIdx = 0;
  let ideaIdx = 0;
  const ideas = preferredIdeas || STARTER_BINGO_IDEAS;

  for (let i = 0; i < total; i++) {
    const tile = newTiles[i] || {
      id: `tile_${i + 1}`,
      activityId: "",
      occurrenceIndex: 0,
      title: "",
      icon: "🌸",
      category: "joy" as CareCategory,
      activityType: "simple" as BingoActivityType,
      targetValue: 1,
      currentValue: 0,
      completed: false,
    };

    if (actIdx < activeActivities.length) {
      const act = activeActivities[actIdx++];
      newTiles[i] = {
        ...tile,
        activityId: act.id,
        title: act.title,
        titleAr: act.titleAr,
        icon: act.icon || "🌸",
        category: act.category,
        activityType:
          act.sourceType === "wellness"
            ? "hydration"
            : act.estimatedDurationMinutes && act.estimatedDurationMinutes > 0
            ? "duration"
            : "simple",
        targetValue: act.estimatedDurationMinutes || 1,
        currentValue: 0,
        completed: false,
      };
    } else if (ideaIdx < ideas.length) {
      const idea = ideas[ideaIdx++];
      newTiles[i] = {
        ...tile,
        activityId: `idea_${idea.id}`,
        title: idea.titleEn,
        titleAr: idea.titleAr,
        icon: idea.icon,
        category: idea.category,
        activityType: idea.activityType,
        targetValue: idea.defaultTargetValue,
        currentValue: 0,
        completed: false,
      };
    }
  }

  return {
    ...board,
    tiles: newTiles.slice(0, total),
    updatedAt: new Date().toISOString(),
  };
}

// ── 4. Line Calculation & Celebrations ──────────────────────────────────────

export function calculateCompletedLines(
  tiles: SelfCareBingoTile[],
  size: BingoBoardSize
): {
  lines: BingoLine[];
  completedLinesCount: number;
  completedTilesCount: number;
  totalTilesCount: number;
  isFullBoardCompleted: boolean;
} {
  const lines: BingoLine[] = [];

  // Rows
  for (let r = 0; r < size; r++) {
    const indices: number[] = [];
    for (let c = 0; c < size; c++) {
      indices.push(r * size + c);
    }
    const isCompleted = indices.every((idx) => {
      const t = tiles[idx];
      return t && (t.isDecorativeCenter || (Boolean(t.title) && t.completed));
    });
    lines.push({ type: "row", index: r, tileIndices: indices, isCompleted });
  }

  // Columns
  for (let c = 0; c < size; c++) {
    const indices: number[] = [];
    for (let r = 0; r < size; r++) {
      indices.push(r * size + c);
    }
    const isCompleted = indices.every((idx) => {
      const t = tiles[idx];
      return t && (t.isDecorativeCenter || (Boolean(t.title) && t.completed));
    });
    lines.push({ type: "column", index: c, tileIndices: indices, isCompleted });
  }

  // Diagonals (Main and Anti)
  const mainDiagIndices: number[] = [];
  const antiDiagIndices: number[] = [];
  for (let i = 0; i < size; i++) {
    mainDiagIndices.push(i * size + i);
    antiDiagIndices.push(i * size + (size - 1 - i));
  }

  lines.push({
    type: "diagonal",
    index: 0,
    tileIndices: mainDiagIndices,
    isCompleted: mainDiagIndices.every((idx) => {
      const t = tiles[idx];
      return t && (t.isDecorativeCenter || (Boolean(t.title) && t.completed));
    }),
  });

  lines.push({
    type: "diagonal",
    index: 1,
    tileIndices: antiDiagIndices,
    isCompleted: antiDiagIndices.every((idx) => {
      const t = tiles[idx];
      return t && (t.isDecorativeCenter || (Boolean(t.title) && t.completed));
    }),
  });

  const completedLinesCount = lines.filter((l) => l.isCompleted).length;
  // Completed tiles count: exclude decorative center tiles
  const actualTiles = tiles.filter((t) => !t.isDecorativeCenter);
  const completedTilesCount = actualTiles.filter((t) => Boolean(t.title) && t.completed).length;
  const totalTilesCount = actualTiles.length;
  const isFullBoardCompleted = totalTilesCount > 0 && completedTilesCount === totalTilesCount;

  return {
    lines,
    completedLinesCount,
    completedTilesCount,
    totalTilesCount,
    isFullBoardCompleted,
  };
}

// ── 5. Deterministic Completion Matching Policy ──────────────────────────────
/**
 * Policy:
 * 1. A completion record satisfies a tile IF AND ONLY IF its localDate falls within [weekStartDate, weekEndDate].
 * 2. Complate items before or after the week window never satisfy the tile.
 * 3. Matching matches by explicit `activityId` (or linked habit/routine source).
 * 4. If an activity appears on multiple tiles (with separate occurrence indices), completions are matched
 *    chronologically: the earliest completed item satisfies occurrence 0, the next satisfies occurrence 1.
 * 5. One completion record cannot satisfy multiple unrelated tiles.
 * 6. For quantitative / duration items: partial progress is preserved; a checkmark is rendered only when
 *    currentValue >= targetValue.
 */
export function matchCompletionsForWeek(
  board: SelfCareBingoBoard,
  planItems: SelfCarePlanItem[] = [],
  externalLogs?: {
    habits?: any[];
    wellnessWaterCups?: Record<string, number>;
  }
): SelfCareBingoBoard {
  const { weekStartDate, weekEndDate } = board;

  // Filter plan items inside the selected week window
  const weekPlanItems = planItems.filter((p) => {
    return p.localDate >= weekStartDate && p.localDate <= weekEndDate;
  });

  // Group completed plan items by activityId
  const completedByActivity = new Map<string, SelfCarePlanItem[]>();
  weekPlanItems.forEach((p) => {
    if (p.status === "completed") {
      const list = completedByActivity.get(p.activityId) || [];
      list.push(p);
      completedByActivity.set(p.activityId, list);
    }
  });

  // Sort each list chronologically by completedAt or localDate
  completedByActivity.forEach((list) => {
    list.sort((a, b) => {
      const aTime = a.completedAt || a.localDate;
      const bTime = b.completedAt || b.localDate;
      return aTime.localeCompare(bTime);
    });
  });

  // Track matched plan item IDs so no item is reused
  const matchedPlanItemIds = new Set<string>();

  const updatedTiles = board.tiles.map((tile) => {
    if (tile.isDecorativeCenter || !tile.activityId) return tile;

    // Handle Hydration activity
    if (tile.activityType === "hydration" && externalLogs?.wellnessWaterCups) {
      let maxWaterInWeek = 0;
      Object.entries(externalLogs.wellnessWaterCups).forEach(([date, cups]) => {
        if (date >= weekStartDate && date <= weekEndDate) {
          if (cups > maxWaterInWeek) maxWaterInWeek = cups;
        }
      });
      const isDone = maxWaterInWeek >= tile.targetValue;
      return {
        ...tile,
        currentValue: maxWaterInWeek,
        completed: isDone,
        completedDate: isDone ? weekStartDate : undefined,
      };
    }

    // Standard matching from SelfCarePlanItems
    const available = completedByActivity.get(tile.activityId) || [];
    const unused = available.filter((item) => !matchedPlanItemIds.has(item.id));

    if (unused.length > 0) {
      // Pick the next unused chronological completion
      const matched = unused[0];
      matchedPlanItemIds.add(matched.id);

      return {
        ...tile,
        completed: true,
        completedAt: matched.completedAt || new Date().toISOString(),
        completedDate: matched.localDate,
        planItemId: matched.id,
        currentValue: tile.targetValue,
      };
    }

    // If no external completed record exists, preserve manual tile completion if already recorded for this week
    if (tile.completed && tile.completedDate && tile.completedDate >= weekStartDate && tile.completedDate <= weekEndDate) {
      return tile;
    }

    return {
      ...tile,
      completed: false,
      completedAt: undefined,
      completedDate: undefined,
      planItemId: undefined,
      currentValue: 0,
    };
  });

  return {
    ...board,
    tiles: updatedTiles,
    updatedAt: new Date().toISOString(),
  };
}

// ── 6. Normalization & Fallbacks ─────────────────────────────────────────────

export function normalizeBingoBoard(raw: any, defaultStartDate?: string, defaultEndDate?: string): SelfCareBingoBoard {
  if (!raw || typeof raw !== "object") {
    const sDate = defaultStartDate || formatLocalDateStr(new Date());
    const eDate = defaultEndDate || formatLocalDateStr(new Date());
    return createDefaultBingoBoard(sDate, eDate, 3, "blush");
  }

  const size: BingoBoardSize = raw.size === 4 ? 4 : 3;
  const theme: BingoTheme = BINGO_THEMES[raw.theme as BingoTheme] ? raw.theme : "blush";
  const expectedTotal = size * size;

  let tiles: SelfCareBingoTile[] = [];
  if (Array.isArray(raw.tiles)) {
    tiles = raw.tiles.map((t: any, idx: number) => ({
      id: t.id || `tile_${idx + 1}`,
      activityId: typeof t.activityId === "string" ? t.activityId : "",
      occurrenceIndex: typeof t.occurrenceIndex === "number" ? t.occurrenceIndex : 0,
      title: typeof t.title === "string" ? t.title : "",
      titleAr: typeof t.titleAr === "string" ? t.titleAr : undefined,
      icon: typeof t.icon === "string" ? t.icon : "🌸",
      category: typeof t.category === "string" ? t.category : "joy",
      activityType: ["simple", "duration", "quantity", "hydration"].includes(t.activityType)
        ? t.activityType
        : "simple",
      targetValue: typeof t.targetValue === "number" && t.targetValue > 0 ? t.targetValue : 1,
      currentValue: typeof t.currentValue === "number" ? t.currentValue : 0,
      completed: Boolean(t.completed),
      completedAt: typeof t.completedAt === "string" ? t.completedAt : undefined,
      completedDate: typeof t.completedDate === "string" ? t.completedDate : undefined,
      planItemId: typeof t.planItemId === "string" ? t.planItemId : undefined,
      isDecorativeCenter: Boolean(t.isDecorativeCenter),
    }));
  }

  // Ensure exact tile count matches size
  while (tiles.length < expectedTotal) {
    const idx = tiles.length;
    tiles.push({
      id: `tile_${idx + 1}`,
      activityId: "",
      occurrenceIndex: 0,
      title: "",
      icon: "🌸",
      category: "joy",
      activityType: "simple",
      targetValue: 1,
      currentValue: 0,
      completed: false,
    });
  }

  if (tiles.length > expectedTotal) {
    tiles = tiles.slice(0, expectedTotal);
  }

  return {
    id: typeof raw.id === "string" ? raw.id : `bingo_${raw.weekStartDate || "week"}_${size}x${size}`,
    weekStartDate: typeof raw.weekStartDate === "string" ? raw.weekStartDate : defaultStartDate || formatLocalDateStr(new Date()),
    weekEndDate: typeof raw.weekEndDate === "string" ? raw.weekEndDate : defaultEndDate || formatLocalDateStr(new Date()),
    size,
    theme,
    tiles,
    celebrationsEnabled: raw.celebrationsEnabled !== false,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

// ── 7. Formatting Helpers (Bilingual & Pressure-Free) ───────────────────────

export function formatCareCount(completedCount: number, isAr: boolean = false): string {
  if (isAr) {
    if (completedCount === 0) return "بينغو العناية بنفسي 🌸";
    if (completedCount === 1) return "لحظة عناية واحدة 🌸";
    if (completedCount === 2) return "لحظتان للعناية بنفسكِ 🌸";
    if (completedCount >= 3 && completedCount <= 10) return `${completedCount} لحظات للعناية بنفسكِ 🌸`;
    return `${completedCount} لحظة للعناية بنفسكِ 🌸`;
  }

  if (completedCount === 0) return "Self-care Bingo 🌸";
  if (completedCount === 1) return "1 moment of care 🌸";
  return `${completedCount} moments of care 🌸`;
}
