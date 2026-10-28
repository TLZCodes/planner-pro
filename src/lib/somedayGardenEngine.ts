/**
 * AYXA Someday Garden Engine (حديقة أمنياتي 🌱)
 * 
 * Provides domain models, growth stage derivations, sorting/filtering,
 * goal match detection, and conversion adapters for Someday Garden.
 * 
 * Design rules:
 * - A wish is not an active Goal, overdue item, or incomplete task.
 * - Someday Garden awards strictly 0 new XP.
 * - Growth stages (seed -> sprout -> plant -> flower) communicate explicit states,
 *   never a hidden success score or pressure.
 * - Unconverted wishes never imply failure.
 * - Pure functions compatible with Node test runners and React UI.
 */

export type SomedayWishStatus = "dreaming" | "exploring" | "linked_goal";

export type SomedayWishGrowthStage = "seed" | "sprout" | "plant" | "flower";

export interface SomedayWishDestinationRef {
  type: string; // e.g. "vision_board" | "inbox" | "travel_trip" | "learning_item"
  id: string;
  title: string;
  createdAt: string;
}

export interface SomedayWish {
  id: string;
  userId?: string;
  title: string;
  titleAr?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  personalReason?: string;
  nextSmallStepNote?: string;
  visualStyle?: string;
  status: SomedayWishStatus;
  linkedGoalId?: string;
  destinationRefs?: SomedayWishDestinationRef[];
  order: number;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishCategoryMeta {
  key: string;
  labelEn: string;
  labelAr: string;
  emoji: string;
}

export const SOMEDAY_WISH_CATEGORIES: WishCategoryMeta[] = [
  { key: "Places to visit", labelEn: "Places to visit", labelAr: "أماكن أودّ زيارتها", emoji: "✈️" },
  { key: "Things to learn", labelEn: "Things to learn", labelAr: "أشياء أودّ تعلّمها", emoji: "📚" },
  { key: "Projects to explore", labelEn: "Projects to explore", labelAr: "مشاريع أستكشفها", emoji: "🎨" },
  { key: "Experiences", labelEn: "Experiences", labelAr: "تجارب ولحظات", emoji: "✨" },
  { key: "Home", labelEn: "Home", labelAr: "البيت والمساحة", emoji: "🏡" },
  { key: "Personal", labelEn: "Personal", labelAr: "عناية وتطوير شخصي", emoji: "🌸" },
  { key: "Something to save for", labelEn: "Something to save for", labelAr: "شيء أدّخر لأجله", emoji: "💎" },
];

export interface GrowthStageInfo {
  stage: SomedayWishGrowthStage;
  icon: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  progressPercent?: number;
  isGoalCompleted: boolean;
  isGoalMissing: boolean;
}

/**
 * Generate a collision-resistant unique ID
 */
export function generateWishId(prefix = "wish"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Derive explicit growth stage visual from wish status and canonical linked Goal
 */
export function deriveGrowthStage(
  wish: SomedayWish,
  linkedGoal?: { id: string; status?: string; progress?: number; title?: string } | null
): GrowthStageInfo {
  // If the wish has a linkedGoalId
  if (wish.linkedGoalId) {
    if (!linkedGoal) {
      // Goal was deleted or unavailable
      return {
        stage: "plant",
        icon: "🪴",
        labelEn: "Goal Unavailable",
        labelAr: "الهدف المرتبط غير متاح",
        descEn: "The linked goal was deleted or is unavailable",
        descAr: "تم حذف الهدف المرتبط أو لم يعد متاحًا",
        isGoalCompleted: false,
        isGoalMissing: true,
      };
    }

    const isCompleted = linkedGoal.status === "completed" || (typeof linkedGoal.progress === "number" && linkedGoal.progress >= 100);
    const progress = typeof linkedGoal.progress === "number" ? Math.max(0, Math.min(100, Math.round(linkedGoal.progress))) : 0;

    if (isCompleted) {
      return {
        stage: "flower",
        icon: "🌸",
        labelEn: "Bloomed (Goal Achieved)",
        labelAr: "أزهرت (تحقق الهدف)",
        descEn: "Goal completed and blooming beautifully",
        descAr: "اكتمل الهدف بنجاح وأزهر في حديقتكِ",
        progressPercent: 100,
        isGoalCompleted: true,
        isGoalMissing: false,
      };
    }

    return {
      stage: "plant",
      icon: "🪴",
      labelEn: "Growing Goal",
      labelAr: "نبتة تنمو مع الهدف",
      descEn: `Actively growing with Goal (${progress}%)`,
      descAr: `تنمو بنشاط مع الهدف (${progress}%)`,
      progressPercent: progress,
      isGoalCompleted: false,
      isGoalMissing: false,
    };
  }

  // Not linked to a goal: depends on user-selected status
  if (wish.status === "exploring") {
    return {
      stage: "sprout",
      icon: "🌿",
      labelEn: "Exploring",
      labelAr: "أستكشفها",
      descEn: "A gentle sprout taking shape",
      descAr: "برعم رقيق يتشكل على مهل",
      isGoalCompleted: false,
      isGoalMissing: false,
    };
  }

  // Default: Dreaming
  return {
    stage: "seed",
    icon: "🌱",
    labelEn: "Dreaming",
    labelAr: "أحلم بها",
    descEn: "A patient seed resting warmly in the soil",
    descAr: "بذرة دافئة تستريح في التربة دون موعد",
    isGoalCompleted: false,
    isGoalMissing: false,
  };
}

/**
 * Normalize a wish object to ensure structural validity
 */
export function normalizeSomedayWish(raw: any, fallbackOrder = 0): SomedayWish {
  if (!raw || typeof raw !== "object") {
    return createDefaultWish("Untitled Wish", { order: fallbackOrder });
  }

  const validStatuses: SomedayWishStatus[] = ["dreaming", "exploring", "linked_goal"];
  const status: SomedayWishStatus = validStatuses.includes(raw.status)
    ? raw.status
    : raw.linkedGoalId
    ? "linked_goal"
    : "dreaming";

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : generateWishId(),
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    title: typeof raw.title === "string" ? raw.title.trim() : "Untitled Wish",
    titleAr: typeof raw.titleAr === "string" ? raw.titleAr.trim() : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : typeof raw.image === "string" ? raw.image : undefined,
    category: typeof raw.category === "string" && raw.category ? raw.category : undefined,
    personalReason: typeof raw.personalReason === "string" ? raw.personalReason : undefined,
    nextSmallStepNote: typeof raw.nextSmallStepNote === "string" ? raw.nextSmallStepNote : undefined,
    visualStyle: typeof raw.visualStyle === "string" ? raw.visualStyle : undefined,
    status,
    linkedGoalId: typeof raw.linkedGoalId === "string" && raw.linkedGoalId ? raw.linkedGoalId : undefined,
    destinationRefs: Array.isArray(raw.destinationRefs)
      ? raw.destinationRefs.filter((r: any) => r && typeof r.id === "string")
      : [],
    order: typeof raw.order === "number" ? raw.order : fallbackOrder,
    archivedAt: typeof raw.archivedAt === "string" ? raw.archivedAt : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

/**
 * Create a new Someday Wish with default fields
 */
export function createDefaultWish(title: string, options?: Partial<SomedayWish>): SomedayWish {
  const now = new Date().toISOString();
  return {
    id: generateWishId(),
    title: title.trim(),
    status: "dreaming",
    order: options?.order ?? 0,
    createdAt: now,
    updatedAt: now,
    ...options,
  };
}

/**
 * Find potential matches among existing goals to suggest linking instead of duplicating
 */
export function findPotentialGoalMatches<T extends { id: string; title: string; area?: string }>(
  wishTitle: string,
  existingGoals: T[]
): T[] {
  if (!wishTitle || !wishTitle.trim() || !Array.isArray(existingGoals)) return [];

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim();

  const targetTokens = new Set(clean(wishTitle).split(/\s+/).filter((t) => t.length > 2));
  if (targetTokens.size === 0) return [];

  return existingGoals.filter((g) => {
    if (!g.title) return false;
    const goalTokens = clean(g.title).split(/\s+/).filter((t) => t.length > 2);
    // Check if exact substring match or shares multiple meaningful tokens
    const cleanGoal = clean(g.title);
    const cleanTarget = clean(wishTitle);
    if (cleanGoal.includes(cleanTarget) || cleanTarget.includes(cleanGoal)) {
      return true;
    }
    const shared = goalTokens.filter((token) => targetTokens.has(token));
    return shared.length >= 2 || (shared.length === 1 && (goalTokens.length <= 2 || targetTokens.size <= 2));
  });
}

/**
 * Filter and sort wishes safely
 */
export function filterAndSortWishes(
  wishes: SomedayWish[],
  params: {
    query?: string;
    category?: string;
    statusFilter?: string; // "all" | "dreaming" | "exploring" | "linked_goal"
    sortBy?: "newest" | "oldest" | "order" | "title";
    showArchived?: boolean;
  }
): SomedayWish[] {
  const {
    query = "",
    category = "all",
    statusFilter = "all",
    sortBy = "order",
    showArchived = false,
  } = params;

  const q = query.trim().toLowerCase();

  return wishes
    .filter((w) => {
      // Archive condition
      const isArchived = Boolean(w.archivedAt);
      if (showArchived) {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      // Status filter
      if (statusFilter !== "all" && w.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (category !== "all") {
        if (category === "none" && w.category) return false;
        if (category !== "none" && w.category !== category) return false;
      }

      // Search query
      if (q) {
        const matchTitle = w.title.toLowerCase().includes(q);
        const matchTitleAr = w.titleAr?.toLowerCase().includes(q);
        const matchDesc = w.description?.toLowerCase().includes(q);
        const matchReason = w.personalReason?.toLowerCase().includes(q);
        const matchStep = w.nextSmallStepNote?.toLowerCase().includes(q);
        const matchCategory = w.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchTitleAr && !matchDesc && !matchReason && !matchStep && !matchCategory) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "order":
        default:
          return (a.order ?? 0) - (b.order ?? 0);
      }
    });
}
