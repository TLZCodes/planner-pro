/**
 * Pure Self-Care Engine for AYXA Planner Pro
 * Handles care activity data models, progress calculations,
 * check-in needs filtering, and curated ideas library.
 */

export type CareCategory =
  | "body"
  | "rest"
  | "calm"
  | "movement"
  | "joy"
  | "environment"
  | "connection"
  | "spiritual"
  | "custom";

export type CareRecurrenceRule = "none" | "daily" | "weekdays" | "weekly" | "custom";

export type CareSourceType = "custom" | "habit" | "routine" | "task" | "wellness" | "deen";

export interface SelfCareActivity {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon: string;
  category: CareCategory;
  recurrenceRule: CareRecurrenceRule;
  scheduledDays?: number[]; // [0..6] (0 = Sun, 1 = Mon ... 6 = Sat)
  preferredTime?: string;
  estimatedDurationMinutes?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  sourceType: CareSourceType;
  sourceId?: string;
  status?: "active" | "paused" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type PlanItemStatus = "pending" | "completed" | "skipped";

export interface SelfCarePlanItem {
  id: string;
  userId: string;
  activityId: string;
  localDate: string; // YYYY-MM-DD
  plannedDuration?: number;
  status: PlanItemStatus;
  completedAt?: string;
  sourceType: CareSourceType;
  sourceId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SelfCareCheckIn {
  userId: string;
  localDate: string; // YYYY-MM-DD
  selectedNeeds: string[]; // e.g. ["rest", "calm", "hydration"]
  availableTimeRange?: "5m" | "15m" | "30m" | "any";
  createdAt: string;
  updatedAt: string;
}

export interface SelfCareIdea {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: CareCategory;
  durationMinutes: number;
  relatedNeeds: string[]; // "rest", "calm", "movement", "hydration", "fresh_air", "joy", "connection", "spiritual"
  icon: string;
  isOutdoor: boolean;
  isFree: boolean;
  suggestedActionType: "do_now" | "link_wellness" | "link_deen" | "link_journal" | "custom";
}

// ── Categories Meta ─────────────────────────────────────────────────────────

export const CARE_CATEGORIES: {
  key: CareCategory;
  labelEn: string;
  labelAr: string;
  icon: string;
}[] = [
  { key: "body", labelEn: "Body & Skin", labelAr: "الجسد والبشرة 🧴", icon: "🧴" },
  { key: "rest", labelEn: "Rest & Sleep", labelAr: "الراحة والنوم 🌙", icon: "🌙" },
  { key: "calm", labelEn: "Calm & Peace", labelAr: "الهدوء والسكينة 🕊️", icon: "🕊️" },
  { key: "movement", labelEn: "Gentle Movement", labelAr: "الحركة الخفيفة 🤸‍♀️", icon: "🤸‍♀️" },
  { key: "joy", labelEn: "Joy & Play", labelAr: "الفرح والبهجة 🌸", icon: "🌸" },
  { key: "environment", labelEn: "Home & Space", labelAr: "المنزل والبيئة 🌿", icon: "🌿" },
  { key: "connection", labelEn: "Warm Connection", labelAr: "التواصل اللطيف 💬", icon: "💬" },
  { key: "spiritual", labelEn: "Spiritual Care", labelAr: "العناية الروحية 🤲", icon: "🤲" },
  { key: "custom", labelEn: "Custom Care", labelAr: "نشاط مخصص ✨", icon: "✨" },
];

// ── Curated Pressure-Free Ideas Library ─────────────────────────────────────

export const CURATED_CARE_IDEAS: SelfCareIdea[] = [
  {
    id: "idea_water_glass",
    titleEn: "Drink a fresh glass of water",
    titleAr: "شرب كوب ماء نقي",
    descriptionEn: "Pour a cool glass and sip it slowly without rushing.",
    descriptionAr: "اسكبي كوب ماء بارد واشربيه بروية وهدوء.",
    category: "body",
    durationMinutes: 2,
    relatedNeeds: ["hydration", "calm"],
    icon: "💧",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "link_wellness",
  },
  {
    id: "idea_herbal_tea",
    titleEn: "Prepare a warm herbal tea",
    titleAr: "تحضير كوب شاي أعشاب دافئ",
    descriptionEn: "Chamomile, mint, or lavender—enjoy the aroma as it steeps.",
    descriptionAr: "بابونج، نعناع، أو لافندر—استمتعي برائحته العطرة.",
    category: "rest",
    durationMinutes: 10,
    relatedNeeds: ["calm", "rest"],
    icon: "🍵",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_gentle_stretch",
    titleEn: "2-minute gentle neck & shoulder stretch",
    titleAr: "إطالة خفيفة للرقبة والكتفين لمدة دقيقتين",
    descriptionEn: "Release tightness from sitting. Soft, slow neck rolls and shoulder drops.",
    descriptionAr: "تخفيف التوتر من الجلوس بحركات دائرية هادئة.",
    category: "movement",
    durationMinutes: 3,
    relatedNeeds: ["movement", "rest"],
    icon: "🧘‍♀️",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_open_window",
    titleEn: "Sit near an open window",
    titleAr: "الجلوس قرب نافذة مفتوحة",
    descriptionEn: "Feel the gentle breeze on your face and breathe deeply for 3 minutes.",
    descriptionAr: "استشعري نسيم الهواء المنعش وخذي 3 أنفاس عميقة.",
    category: "calm",
    durationMinutes: 5,
    relatedNeeds: ["fresh_air", "calm"],
    icon: "🪟",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_screen_pause",
    titleEn: "Take a 10-minute screen-free pause",
    titleAr: "استراحة لمدة 10 دقائق بعيداً عن الشاشات",
    descriptionEn: "Rest your eyes, look far into the distance, let your mind wander gently.",
    descriptionAr: "أريحي عينيكِ، انظري للأفق البعيد، ودعي أفكاركِ تهدأ.",
    category: "rest",
    durationMinutes: 10,
    relatedNeeds: ["rest", "calm"],
    icon: "📵",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_outside_walk",
    titleEn: "Step outside for a short stroll",
    titleAr: "الخروج للمشي في الهواء الطلق",
    descriptionEn: "Notice the trees, sky, and quiet sounds around you.",
    descriptionAr: "تأملي السماء والأشجار وتفاصيل الطبيعة بهدوء.",
    category: "movement",
    durationMinutes: 15,
    relatedNeeds: ["fresh_air", "movement"],
    icon: "🚶‍♀️",
    isOutdoor: true,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_warm_shower",
    titleEn: "Warm shower & soothing moisturizer",
    titleAr: "استحمام دافئ وترطيب لطيف",
    descriptionEn: "Let the warm water wash away the day's tension.",
    descriptionAr: "دعي الماء الدافئ يزيل إرهاق اليوم برقة.",
    category: "body",
    durationMinutes: 20,
    relatedNeeds: ["rest", "calm"],
    icon: "🛁",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_skincare_pause",
    titleEn: "Gentle skincare touch & facial mist",
    titleAr: "عناية خفيفة بالبشرة وبخاخ مرطب",
    descriptionEn: "A loving moment of hydration and soft touch for your skin.",
    descriptionAr: "لحظة لطيفة للعناية بالبشرة وترطيبها بنعومة.",
    category: "body",
    durationMinutes: 5,
    relatedNeeds: ["calm", "hydration"],
    icon: "🧴",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_tidy_surface",
    titleEn: "Tidy one small corner or surface",
    titleAr: "ترتيب زاوية صغيرة أو سطح واحد",
    descriptionEn: "Just one nightstand or your desk. Enjoy the calming visual clarity.",
    descriptionAr: "طاولة السرير أو المكتب فقط. استمتعي بوضوح المساحة.",
    category: "environment",
    durationMinutes: 5,
    relatedNeeds: ["calm", "joy"],
    icon: "✨",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_read_pages",
    titleEn: "Read 5 pages of a comforting book",
    titleAr: "قراءة 5 صفحات من كتاب مريح",
    descriptionEn: "Get cozy with a blanket and a peaceful story.",
    descriptionAr: "استرخي بهدوء مع صفحات ملهمة أو قصة دافئة.",
    category: "joy",
    durationMinutes: 15,
    relatedNeeds: ["rest", "joy"],
    icon: "📖",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_free_journal",
    titleEn: "Write freely in your Journal",
    titleAr: "الكتابة الحرة في المفكرة",
    descriptionEn: "Pour your thoughts onto the page without judging them.",
    descriptionAr: "اكتبي خواطركِ كما هي دون أحكام أو تصحيح.",
    category: "calm",
    durationMinutes: 10,
    relatedNeeds: ["calm", "rest"],
    icon: "📝",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "link_journal",
  },
  {
    id: "idea_spiritual_pause",
    titleEn: "A quiet moment of Dhikr & Du'a",
    titleAr: "لحظة ذكر ودعاء وسكينة",
    descriptionEn: "Soft remembrance of Allah to bring peace to your heart.",
    descriptionAr: "ذكر ودعاء يملأ القلب طمأنينة وسكينة.",
    category: "spiritual",
    durationMinutes: 5,
    relatedNeeds: ["spiritual", "calm"],
    icon: "🤲",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "link_deen",
  },
  {
    id: "idea_contact_friend",
    titleEn: "Send a loving check-in to someone you cherish",
    titleAr: "إرسال رسالة محبة لشخص عزيز",
    descriptionEn: "A brief, warm message to remind someone you are thinking of them.",
    descriptionAr: "رسالة لطيفة وبسيطة لصلة الرحم أو تفقد صديقة مقربة.",
    category: "connection",
    durationMinutes: 5,
    relatedNeeds: ["connection", "joy"],
    icon: "💌",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
  {
    id: "idea_nap_or_lie_down",
    titleEn: "Lie down comfortably with zero expectations",
    titleAr: "الاستلقاء براحة تامة دون توقعات",
    descriptionEn: "Rest your body completely. Even resting without sleeping restores vitality.",
    descriptionAr: "أريحي جسدكِ بالكامل. الراحة بحد ذاتها تعيد النشاط.",
    category: "rest",
    durationMinutes: 20,
    relatedNeeds: ["rest", "calm"],
    icon: "🛋️",
    isOutdoor: false,
    isFree: true,
    suggestedActionType: "do_now",
  },
];

// ── Progress & Summary Calculations ─────────────────────────────────────────

export interface CareProgressSummary {
  plannedCount: number;
  completedCount: number;
  skippedCount: number;
  progressPercentage: number;
  estimatedMinutesTotal: number;
  completedMinutesTotal: number;
  hasActivities: boolean;
}

export function calculateCareProgress(
  planItems: SelfCarePlanItem[],
  activities: SelfCareActivity[]
): CareProgressSummary {
  const activeItems = planItems.filter((p) => p.status !== "skipped");
  const completedItems = planItems.filter((p) => p.status === "completed");
  const skippedItems = planItems.filter((p) => p.status === "skipped");

  const plannedCount = planItems.length;
  const completedCount = completedItems.length;
  const skippedCount = skippedItems.length;

  const progressPercentage =
    plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

  // Calculate duration using plan item or activity estimated duration
  const actMap = new Map<string, SelfCareActivity>(activities.map((a) => [a.id, a]));

  let estimatedMinutesTotal = 0;
  let completedMinutesTotal = 0;

  planItems.forEach((p) => {
    const act = actMap.get(p.activityId);
    const duration = p.plannedDuration || act?.estimatedDurationMinutes || 10;
    if (p.status !== "skipped") {
      estimatedMinutesTotal += duration;
    }
    if (p.status === "completed") {
      completedMinutesTotal += duration;
    }
  });

  return {
    plannedCount,
    completedCount,
    skippedCount,
    progressPercentage,
    estimatedMinutesTotal,
    completedMinutesTotal,
    hasActivities: plannedCount > 0,
  };
}

// ── Ideas Filtering ─────────────────────────────────────────────────────────

export function filterCareIdeas(
  ideas: SelfCareIdea[],
  selectedNeeds: string[] = [],
  availableTimeRange?: "5m" | "15m" | "30m" | "any",
  categoryFilter?: CareCategory | "all"
): SelfCareIdea[] {
  return ideas.filter((idea) => {
    // Category filter
    if (categoryFilter && categoryFilter !== "all" && idea.category !== categoryFilter) {
      return false;
    }

    // Time filter
    if (availableTimeRange && availableTimeRange !== "any") {
      if (availableTimeRange === "5m" && idea.durationMinutes > 5) return false;
      if (availableTimeRange === "15m" && idea.durationMinutes > 15) return false;
      if (availableTimeRange === "30m" && idea.durationMinutes < 15) return false;
    }

    // Needs filter: if user selected needs, prioritize ideas matching at least one need
    if (selectedNeeds.length > 0) {
      const matchesNeed = idea.relatedNeeds.some((n) => selectedNeeds.includes(n));
      if (!matchesNeed) return false;
    }

    return true;
  });
}

// ── Legacy Migration ─────────────────────────────────────────────────────────

export function migrateLegacySelfCare(
  legacyList: { id: string; emoji: string; label: string; done: boolean; doneDate?: string }[],
  todayDate: string,
  userId: string = "default"
): { activities: SelfCareActivity[]; planItems: SelfCarePlanItem[] } {
  const activities: SelfCareActivity[] = [];
  const planItems: SelfCarePlanItem[] = [];
  const nowIso = new Date().toISOString();

  legacyList.forEach((item, idx) => {
    const activityId = `act_${item.id}`;

    // Determine category based on keywords
    let category: CareCategory = "custom";
    const lower = item.label.toLowerCase();
    if (
      lower.includes("water") ||
      lower.includes("hydrat") ||
      lower.includes("ماء") ||
      lower.includes("ترطيب") ||
      lower.includes("skin") ||
      lower.includes("بشرة")
    ) {
      category = "body";
    } else if (lower.includes("tea") || lower.includes("شاي") || lower.includes("sleep") || lower.includes("نوم")) {
      category = "rest";
    } else if (lower.includes("stretch") || lower.includes("إطالة") || lower.includes("walk") || lower.includes("مشي")) {
      category = "movement";
    } else if (lower.includes("read") || lower.includes("قراءة") || lower.includes("book") || lower.includes("كتاب")) {
      category = "joy";
    }

    activities.push({
      id: activityId,
      userId,
      title: item.label,
      icon: item.emoji || "🌸",
      category,
      recurrenceRule: "daily",
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      sourceType: "custom",
    });

    const isCompletedToday = item.done && (item.doneDate === todayDate || !item.doneDate);

    planItems.push({
      id: `plan_${item.id}_${todayDate}`,
      userId,
      activityId,
      localDate: todayDate,
      status: isCompletedToday ? "completed" : "pending",
      completedAt: isCompletedToday ? nowIso : undefined,
      sourceType: "custom",
      order: idx,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });

  return { activities, planItems };
}
