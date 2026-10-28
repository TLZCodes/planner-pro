// Self-contained unique ID generator (no store dependency for clean node test runner compatibility)
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export type VisionBoardTheme = "blossom" | "lavender" | "butter" | "mint" | "minimal";
export type VisionBoardLayout = "collage" | "grid" | "scrapbook";
export type VisionBoardItemType = "photo" | "text" | "wish" | "linked_goal";

export interface VisionBoardItem {
  id: string;
  boardId: string;
  type: VisionBoardItemType;
  title?: string;
  content?: string; // Text, affirmation, wish description
  imageUrl?: string; // Durable base64 data URL or URL
  photoUrl?: string; // Legacy alias for image URL
  imageAspectRatio?: "square" | "portrait" | "landscape";
  caption?: string;
  accentColor?: string;
  linkedGoalId?: string; // References canonical Goal.id
  order: number;
  rotation?: number; // Subtle tilt for scrapbook mode (-3 to +3 deg)
  sticker?: "flower" | "star" | "bow" | "sparkle" | "heart" | "none";
  washiColor?: "pink" | "lavender" | "butter" | "mint" | "stripes";
  createdAt: string;
  updatedAt: string;
}

export interface VisionBoard {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  timeHorizon?: string; // e.g. "2027", "Next 6 Months", "Summer 2027"
  theme: VisionBoardTheme;
  layout: VisionBoardLayout;
  coverImageUrl?: string;
  showDecorations: boolean;
  showCaptions: boolean;
  showGoalProgress: boolean;
  isPinnedToHome?: boolean;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ThemeConfig {
  id: VisionBoardTheme;
  nameEn: string;
  nameAr: string;
  canvasBg: string; // Tailwind class
  cardBg: string;
  borderClass: string;
  accentHex: string;
  washiDefault: "pink" | "lavender" | "butter" | "mint" | "stripes";
  patternClass: string;
}

export const VISION_BOARD_THEMES: Record<VisionBoardTheme, ThemeConfig> = {
  blossom: {
    id: "blossom",
    nameEn: "Blossom Pink 🌸",
    nameAr: "زهور الربيع 🌸",
    canvasBg: "bg-[#FFF5F7] dark:bg-[#1C1217]",
    cardBg: "bg-white/95 dark:bg-[#281820]/95",
    borderClass: "border-pink-200/80 dark:border-pink-900/60",
    accentHex: "#FF2E93",
    washiDefault: "pink",
    patternClass: "bg-[radial-gradient(#fed7e2_1px,transparent_1px)] [background-size:16px_16px]",
  },
  lavender: {
    id: "lavender",
    nameEn: "Lavender Dream 💜",
    nameAr: "حلم اللافندر 💜",
    canvasBg: "bg-[#F8F5FF] dark:bg-[#161222]",
    cardBg: "bg-white/95 dark:bg-[#221B32]/95",
    borderClass: "border-purple-200/80 dark:border-purple-900/60",
    accentHex: "#9333EA",
    washiDefault: "lavender",
    patternClass: "bg-[radial-gradient(#e9d5ff_1px,transparent_1px)] [background-size:16px_16px]",
  },
  butter: {
    id: "butter",
    nameEn: "Butter Warmth 🍯",
    nameAr: "دفء العسل 🍯",
    canvasBg: "bg-[#FFFDF2] dark:bg-[#1A1810]",
    cardBg: "bg-white/95 dark:bg-[#282315]/95",
    borderClass: "border-amber-200/80 dark:border-amber-900/60",
    accentHex: "#F59E0B",
    washiDefault: "butter",
    patternClass: "bg-[radial-gradient(#fde68a_1px,transparent_1px)] [background-size:16px_16px]",
  },
  mint: {
    id: "mint",
    nameEn: "Pastel Mint 🌿",
    nameAr: "نعناع ندي 🌿",
    canvasBg: "bg-[#F3FAF7] dark:bg-[#101A15]",
    cardBg: "bg-white/95 dark:bg-[#182820]/95",
    borderClass: "border-emerald-200/80 dark:border-emerald-900/60",
    accentHex: "#10B981",
    washiDefault: "mint",
    patternClass: "bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:16px_16px]",
  },
  minimal: {
    id: "minimal",
    nameEn: "Clean Cream ☁️",
    nameAr: "أناقة بسيطة ☁️",
    canvasBg: "bg-[#FAFAF9] dark:bg-[#141414]",
    cardBg: "bg-white dark:bg-[#202020]",
    borderClass: "border-stone-200/80 dark:border-stone-800",
    accentHex: "#78716C",
    washiDefault: "stripes",
    patternClass: "bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:16px_16px]",
  },
};

export const WASHI_TAPE_CLASSES: Record<string, string> = {
  pink: "bg-pink-300/85 text-pink-900 border-b border-pink-400/50 shadow-xs",
  lavender: "bg-purple-300/85 text-purple-900 border-b border-purple-400/50 shadow-xs",
  butter: "bg-amber-200/90 text-amber-900 border-b border-amber-300/60 shadow-xs",
  mint: "bg-emerald-200/85 text-emerald-900 border-b border-emerald-300/50 shadow-xs",
  stripes: "bg-rose-200/90 text-rose-900 border-b border-rose-300/60 shadow-xs",
};

/**
 * Normalizes a raw vision board object safely.
 */
export function normalizeVisionBoard(raw: Partial<VisionBoard>): VisionBoard {
  const now = new Date().toISOString();
  return {
    id: raw.id || generateId("vb"),
    title: (raw.title || "").trim() || "My Vision Board",
    titleAr: raw.titleAr?.trim(),
    description: raw.description?.trim(),
    descriptionAr: raw.descriptionAr?.trim(),
    timeHorizon: raw.timeHorizon?.trim(),
    theme: raw.theme && raw.theme in VISION_BOARD_THEMES ? raw.theme : "blossom",
    layout: raw.layout === "grid" || raw.layout === "scrapbook" ? raw.layout : "collage",
    coverImageUrl: raw.coverImageUrl,
    showDecorations: raw.showDecorations !== false,
    showCaptions: raw.showCaptions !== false,
    showGoalProgress: raw.showGoalProgress !== false,
    isPinnedToHome: Boolean(raw.isPinnedToHome),
    status: raw.status === "archived" ? "archived" : "active",
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };
}

/**
 * Normalizes a raw vision board item safely.
 */
export function normalizeVisionBoardItem(raw: Partial<VisionBoardItem>): VisionBoardItem {
  const now = new Date().toISOString();
  const validTypes: VisionBoardItemType[] = ["photo", "text", "wish", "linked_goal"];
  const type: VisionBoardItemType = raw.type && validTypes.includes(raw.type) ? raw.type : "photo";

  return {
    id: raw.id || generateId("vb"),
    boardId: raw.boardId || "",
    type,
    title: raw.title?.trim(),
    content: raw.content?.trim(),
    imageUrl: raw.imageUrl,
    imageAspectRatio: raw.imageAspectRatio === "landscape" || raw.imageAspectRatio === "portrait" ? raw.imageAspectRatio : "square",
    caption: raw.caption?.trim(),
    accentColor: raw.accentColor,
    linkedGoalId: raw.linkedGoalId,
    order: typeof raw.order === "number" ? raw.order : 0,
    rotation: typeof raw.rotation === "number" ? Math.max(-4, Math.min(4, raw.rotation)) : 0,
    sticker: raw.sticker || "flower",
    washiColor: raw.washiColor || "pink",
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };
}

/**
 * Creates an independent duplicate of a board and deep copies all its items with fresh IDs.
 * Editing one board or its items NEVER affects the other.
 */
export function duplicateBoardWithItems(
  board: VisionBoard,
  items: VisionBoardItem[],
  isAr = false
): { duplicatedBoard: VisionBoard; duplicatedItems: VisionBoardItem[] } {
  const now = new Date().toISOString();
  const newBoardId = generateId("vb");
  const titleCopy = isAr ? `${board.titleAr || board.title} (نسخة)` : `${board.title} (Copy)`;

  const duplicatedBoard: VisionBoard = {
    ...board,
    id: newBoardId,
    title: titleCopy,
    titleAr: isAr ? titleCopy : board.titleAr ? `${board.titleAr} (نسخة)` : undefined,
    isPinnedToHome: false, // Do not duplicate home pin automatically
    createdAt: now,
    updatedAt: now,
  };

  const boardItems = items.filter((it) => it.boardId === board.id);
  const duplicatedItems: VisionBoardItem[] = boardItems.map((it) => ({
    ...it,
    id: generateId("vbi"),
    boardId: newBoardId,
    createdAt: now,
    updatedAt: now,
  }));

  return { duplicatedBoard, duplicatedItems };
}

/**
 * Mobile-friendly reorder: Move item up, down, to top, or to bottom within board.
 */
export function reorderBoardItems(
  items: VisionBoardItem[],
  boardId: string,
  itemId: string,
  direction: "up" | "down" | "top" | "bottom"
): VisionBoardItem[] {
  const boardItems = items
    .filter((it) => it.boardId === boardId)
    .sort((a, b) => a.order - b.order);

  const targetIndex = boardItems.findIndex((it) => it.id === itemId);
  if (targetIndex === -1) return items;

  const reordered = [...boardItems];
  const [removed] = reordered.splice(targetIndex, 1);

  if (direction === "up") {
    const newIdx = Math.max(0, targetIndex - 1);
    reordered.splice(newIdx, 0, removed);
  } else if (direction === "down") {
    const newIdx = Math.min(reordered.length, targetIndex + 1);
    reordered.splice(newIdx, 0, removed);
  } else if (direction === "top") {
    reordered.unshift(removed);
  } else if (direction === "bottom") {
    reordered.push(removed);
  }

  // Assign updated sequence order
  const now = new Date().toISOString();
  const reorderedWithNewOrder = reordered.map((it, idx) => ({
    ...it,
    order: idx,
    updatedAt: now,
  }));

  // Reconstruct full list preserving external board items in place
  let reorderedIdx = 0;
  return items.map((it) => {
    if (it.boardId === boardId) {
      return reorderedWithNewOrder[reorderedIdx++];
    }
    return it;
  });
}
