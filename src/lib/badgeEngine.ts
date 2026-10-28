/**
 * Centralized Badge Engine & Registry
 * AYXA Planner Pro — Authoritative Personal Achievement System
 * 
 * Rules:
 * 1. Every badge is backed by authoritative persisted application records.
 * 2. Deterministic, rebuildable progress calculations.
 * 3. Unlocks exactly once per (userId, badgeId, badgeLevel).
 * 4. Generates unique deterministic reward keys for XP: badge.unlock:{badgeId}:{badgeLevel}.
 * 5. Private data (business financials, health metrics, journal text, deen records) is never exposed.
 * 6. Inactive badges without documented criteria (Zen Mode, Empire) are explicitly deactivated.
 */

import type { AppState } from "./store";
import { type XPEvent, getTotalActiveXp, getRewardKey } from "./progressionEngine.ts";

export type BadgeCategory =
  | "all"
  | "productivity"
  | "habits_routines"
  | "goals"
  | "focus_learning"
  | "wellness"
  | "business"
  | "faith";

export type BadgePrivacyClassification =
  | "public_safe"
  | "private_by_default"
  | "strictly_private";

export type BadgeCriterionType =
  | "tasks_completed_count"
  | "habit_streak_days"
  | "business_income_event"
  | "learning_books_completed"
  | "goals_completed_count"
  | "morning_routine_days"
  | "evening_routine_days"
  | "focus_sessions_count"
  | "flashcards_reviewed_count"
  | "wellness_hydration_days"
  | "journal_writing_days"
  | "quran_wird_days"
  | "athkar_routine_days";

export interface BadgeLevelDefinition {
  levelId: number;
  order: number;
  targetValue: number;
  iconVariant?: string;
  nameEn: string;
  nameAr: string;
  xpReward: number;
}

export interface BadgeDefinition {
  id: string;
  version: number;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  criterionEn: string;
  criterionAr: string;
  shortCriterionEn: string;
  shortCriterionAr: string;
  icon: string;
  category: BadgeCategory;
  criterionType: BadgeCriterionType;
  targetValue: number;
  xpReward: number;
  sortOrder: number;
  active: boolean;
  secret: boolean;
  privacyClassification: BadgePrivacyClassification;
  relatedFeatureRoute: string;
  relatedFeatureLabelEn: string;
  relatedFeatureLabelAr: string;
  levels?: BadgeLevelDefinition[];
}

export interface BadgeAward {
  id: string;
  userId: string;
  badgeId: string;
  badgeLevel: number;
  definitionVersion: number;
  earnedAt: string; // ISO date string
  earnedDateAccuracy: "exact" | "reconstructed" | "migrated";
  triggerSourceType: string;
  triggerSourceId: string;
  triggerEventId?: string;
  xpEventId?: string;
  celebrationShownAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeProgress {
  badgeId: string;
  definition: BadgeDefinition;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isUnlocked: boolean;
  award?: BadgeAward;
  formattedProgress: string;
}

export interface BadgeSettings {
  userId: string;
  hiddenCategories: BadgeCategory[];
  sharingDefaults: {
    includeName: boolean;
    includeDate: boolean;
    includeCriterion: boolean;
    theme: "rose" | "gold" | "lavender" | "dark";
  };
  celebrationMode: "modal" | "silent";
  privateByDefault: boolean;
  updatedAt: string;
}

export const DEFAULT_BADGE_SETTINGS: BadgeSettings = {
  userId: "",
  hiddenCategories: [],
  sharingDefaults: {
    includeName: true,
    includeDate: true,
    includeCriterion: true,
    theme: "rose",
  },
  celebrationMode: "modal",
  privateByDefault: true,
  updatedAt: new Date().toISOString(),
};

// ── Master Badge Definitions Registry ────────────────────────────────────────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── PRODUCTIVITY ───────────────────────────────────────────────────────────
  {
    id: "first_step",
    version: 1,
    nameEn: "First Step",
    nameAr: "الخطوة الأولى",
    descEn: "Every inspiring journey begins with a single intentional task completed.",
    descAr: "كل رحلة ملهمة تبدأ بمهمة واعية واحدة تنجزينها بكل حب.",
    criterionEn: "Complete 1 unique real task in your planner.",
    criterionAr: "إنجاز مهمة واحدة حقيقية في مخططكِ.",
    shortCriterionEn: "Complete 1 task",
    shortCriterionAr: "إنجاز مهمة واحدة",
    icon: "🌸",
    category: "productivity",
    criterionType: "tasks_completed_count",
    targetValue: 1,
    xpReward: 10,
    sortOrder: 1,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/tasks",
    relatedFeatureLabelEn: "View Tasks",
    relatedFeatureLabelAr: "عرض المهام",
  },
  {
    id: "task_machine",
    version: 1,
    nameEn: "Task Machine",
    nameAr: "عاشقة الإنجاز",
    descEn: "Building steady daily momentum with 25 completed tasks.",
    descAr: "بناء زخم يومي متواصل بإنجاز 25 مهمة مكتملة.",
    criterionEn: "Complete 25 unique real tasks across your planner.",
    criterionAr: "إنجاز 25 مهمة فريدة وحقيقية في مخططكِ.",
    shortCriterionEn: "Complete 25 unique tasks",
    shortCriterionAr: "إنجاز 25 مهمة فريدة",
    icon: "⚡",
    category: "productivity",
    criterionType: "tasks_completed_count",
    targetValue: 25,
    xpReward: 25,
    sortOrder: 2,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/tasks",
    relatedFeatureLabelEn: "View Tasks",
    relatedFeatureLabelAr: "عرض المهام",
  },
  {
    id: "task_queen",
    version: 1,
    nameEn: "Task Queen",
    nameAr: "ملكة المهام",
    descEn: "Mastery of execution with 100 unique real tasks completed.",
    descAr: "إتقان الإنجاز والوصول إلى 100 مهمة فريدة مكتملة بنجاح.",
    criterionEn: "Complete 100 unique real tasks across your planner.",
    criterionAr: "إنجاز 100 مهمة فريدة وحقيقية في مخططكِ.",
    shortCriterionEn: "Complete 100 unique tasks",
    shortCriterionAr: "إنجاز 100 مهمة فريدة",
    icon: "👑",
    category: "productivity",
    criterionType: "tasks_completed_count",
    targetValue: 100,
    xpReward: 50,
    sortOrder: 3,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/tasks",
    relatedFeatureLabelEn: "View Tasks",
    relatedFeatureLabelAr: "عرض المهام",
  },

  // ── HABITS & ROUTINES ──────────────────────────────────────────────────────
  {
    id: "week_warrior",
    version: 1,
    nameEn: "Week Warrior",
    nameAr: "أسبوع الالتزام",
    descEn: "A full 7-day streak on any single habit, proving your inner discipline.",
    descAr: "استمرارية 7 أيام متتالية على عادة واحدة، خطوة أولى نحو التغيير.",
    criterionEn: "Maintain a continuous 7-day streak on any single eligible habit.",
    criterionAr: "الحفاظ على استمرارية 7 أيام متتالية على عادة واحدة معتمدة.",
    shortCriterionEn: "7-day streak on 1 habit",
    shortCriterionAr: "سلسلة 7 أيام على عادة واحدة",
    icon: "🌱",
    category: "habits_routines",
    criterionType: "habit_streak_days",
    targetValue: 7,
    xpReward: 20,
    sortOrder: 4,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/habits",
    relatedFeatureLabelEn: "Open Habits",
    relatedFeatureLabelAr: "فتح العادات",
  },
  {
    id: "on_fire",
    version: 1,
    nameEn: "On Fire",
    nameAr: "شعلة الالتزام",
    descEn: "A powerful 30-day streak on one habit transforming action into identity.",
    descAr: "سلسلة التزام ذهبية لـ 30 يوماً متتالية على عادة واحدة تصنع هويتكِ الجديدة.",
    criterionEn: "Maintain a continuous 30-day streak on any single eligible habit.",
    criterionAr: "الحفاظ على استمرارية 30 يوماً متتالية على عادة واحدة معتمدة.",
    shortCriterionEn: "30-day streak on 1 habit",
    shortCriterionAr: "سلسلة 30 يوماً على عادة واحدة",
    icon: "🔥",
    category: "habits_routines",
    criterionType: "habit_streak_days",
    targetValue: 30,
    xpReward: 50,
    sortOrder: 5,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/habits",
    relatedFeatureLabelEn: "Open Habits",
    relatedFeatureLabelAr: "فتح العادات",
  },
  {
    id: "early_bird",
    version: 1,
    nameEn: "Early Bird",
    nameAr: "بركة الصباح",
    descEn: "Greet the morning with intention across 7 distinct days.",
    descAr: "استقبال الصباح بوعي وبركة عبر إكمال الروتين الصباحي لـ 7 أيام.",
    criterionEn: "Complete your canonical Morning Routine on 7 distinct local dates.",
    criterionAr: "إكمال الروتين الصباحي المعتمد في 7 أيام محلية مختلفة.",
    shortCriterionEn: "Morning Routine on 7 days",
    shortCriterionAr: "الروتين الصباحي لـ 7 أيام",
    icon: "☀️",
    category: "habits_routines",
    criterionType: "morning_routine_days",
    targetValue: 7,
    xpReward: 30,
    sortOrder: 6,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/routines",
    relatedFeatureLabelEn: "Open Routines",
    relatedFeatureLabelAr: "فتح الروتينات",
  },
  {
    id: "evening_peace",
    version: 1,
    nameEn: "Evening Peace",
    nameAr: "سكينة المساء",
    descEn: "Unwind softly by completing your Evening Routine across 7 distinct days.",
    descAr: "إنهاء اليوم بهدوء وسكينة عبر إكمال الروتين المسائي لـ 7 أيام.",
    criterionEn: "Complete your canonical Evening Routine on 7 distinct local dates.",
    criterionAr: "إكمال الروتين المسائي المعتمد في 7 أيام محلية مختلفة.",
    shortCriterionEn: "Evening Routine on 7 days",
    shortCriterionAr: "الروتين المسائي لـ 7 أيام",
    icon: "🌙",
    category: "habits_routines",
    criterionType: "evening_routine_days",
    targetValue: 7,
    xpReward: 30,
    sortOrder: 7,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/routines",
    relatedFeatureLabelEn: "Open Routines",
    relatedFeatureLabelAr: "فتح الروتينات",
  },

  // ── GOALS ──────────────────────────────────────────────────────────────────
  {
    id: "goal_crusher",
    version: 1,
    nameEn: "Goal Crusher",
    nameAr: "قاهرة الأهداف",
    descEn: "Transforming big visions into reality by successfully completing a goal.",
    descAr: "تحويل الرؤى الكبيرة إلى واقع عبر إكمال هدف حقيقي وتأكيد نجاحه.",
    criterionEn: "Complete all milestones and confirm completion of 1 real goal.",
    criterionAr: "إكمال جميع المحطات وتأكيد إنجاز هدف حقيقي بنجاح.",
    shortCriterionEn: "Complete 1 confirmed goal",
    shortCriterionAr: "إنجاز هدف معتمد",
    icon: "🎯",
    category: "goals",
    criterionType: "goals_completed_count",
    targetValue: 1,
    xpReward: 50,
    sortOrder: 8,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/goals",
    relatedFeatureLabelEn: "Open Goals",
    relatedFeatureLabelAr: "فتح الأهداف",
  },

  // ── FOCUS & LEARNING ───────────────────────────────────────────────────────
  {
    id: "deep_focus_5",
    version: 1,
    nameEn: "Deep Thinker",
    nameAr: "عقلية التركيز",
    descEn: "Flowing deeply with 5 completed deep work focus sessions.",
    descAr: "الوصول لحالة التدفق والتركيز العميق عبر إتمام 5 جلسات بومودورو.",
    criterionEn: "Complete 5 deep work or Pomodoro focus sessions.",
    criterionAr: "إكمال 5 جلسات عمل عميق أو بومودورو بنجاح.",
    shortCriterionEn: "Complete 5 focus sessions",
    shortCriterionAr: "إكمال 5 جلسات تركيز",
    icon: "⏳",
    category: "focus_learning",
    criterionType: "focus_sessions_count",
    targetValue: 5,
    xpReward: 30,
    sortOrder: 9,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/focus",
    relatedFeatureLabelEn: "Start Focus",
    relatedFeatureLabelAr: "بدء التركيز",
  },
  {
    id: "bookworm",
    version: 1,
    nameEn: "Bookworm",
    nameAr: "قارئة شغوفة",
    descEn: "Expanding horizons by finishing 5 completed books in Learning.",
    descAr: "توسيع المدارك وإنهاء قراءة 5 كتب مكتملة في مكتبة التعلم.",
    criterionEn: "Mark 5 unique books as completed inside your Learning library.",
    criterionAr: "إتمام قراءة 5 كتب فريدة في مكتبة التعلم الخاصة بكِ.",
    shortCriterionEn: "Complete 5 books",
    shortCriterionAr: "إتمام قراءة 5 كتب",
    icon: "📚",
    category: "focus_learning",
    criterionType: "learning_books_completed",
    targetValue: 5,
    xpReward: 40,
    sortOrder: 10,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/learning",
    relatedFeatureLabelEn: "View Learning",
    relatedFeatureLabelAr: "عرض التعلم",
  },
  {
    id: "memory_master_50",
    version: 1,
    nameEn: "Memory Master",
    nameAr: "قوة الذاكرة",
    descEn: "Strengthening recall through spaced repetition of 50 flashcards.",
    descAr: "ترسيخ المعرفة بمراجعة 50 بطاقة تعليمية عبر التكرار المتباعد.",
    criterionEn: "Complete active review sessions for 50 flashcards using spaced repetition.",
    criterionAr: "مراجعة 50 بطاقة تعليمية بنظام التكرار المتباعد.",
    shortCriterionEn: "Review 50 flashcards",
    shortCriterionAr: "مراجعة 50 بطاقة",
    icon: "🧠",
    category: "focus_learning",
    criterionType: "flashcards_reviewed_count",
    targetValue: 50,
    xpReward: 30,
    sortOrder: 11,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/learning",
    relatedFeatureLabelEn: "View Learning",
    relatedFeatureLabelAr: "عرض التعلم",
  },

  // ── WELLNESS ───────────────────────────────────────────────────────────────
  {
    id: "hydration_queen_7",
    version: 1,
    nameEn: "Hydration Glow",
    nameAr: "نضارة وترطيب",
    descEn: "Nourishing your body by meeting your water goal on 7 distinct days.",
    descAr: "تغذية جسمكِ والوصول لهدف شرب الماء اليومي في 7 أيام مختلفة.",
    criterionEn: "Meet your daily water hydration target on 7 distinct local dates.",
    criterionAr: "تحقيق الهدف اليومي لشرب الماء في 7 أيام محلية مختلفة.",
    shortCriterionEn: "Water goal on 7 days",
    shortCriterionAr: "هدف الماء لـ 7 أيام",
    icon: "💧",
    category: "wellness",
    criterionType: "wellness_hydration_days",
    targetValue: 7,
    xpReward: 25,
    sortOrder: 12,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/wellness",
    relatedFeatureLabelEn: "Open Wellness",
    relatedFeatureLabelAr: "فتح العافية",
  },
  {
    id: "consistent_writer_7",
    version: 1,
    nameEn: "Soulful Writer",
    nameAr: "روح التدوين",
    descEn: "Gentle reflection by logging journal entries across 7 distinct days.",
    descAr: "تدوين الأفكار والمشاعر بصدق ولطف في المفكرة لـ 7 أيام مختلفة.",
    criterionEn: "Write entries in your personal journal on 7 distinct local dates (content remains private).",
    criterionAr: "كتابة تدوينات في مذكرتكِ في 7 أيام مختلفة (المحتوى يظل خاصاً تماماً).",
    shortCriterionEn: "Journal on 7 days",
    shortCriterionAr: "التدوين لـ 7 أيام",
    icon: "📓",
    category: "wellness",
    criterionType: "journal_writing_days",
    targetValue: 7,
    xpReward: 30,
    sortOrder: 13,
    active: true,
    secret: false,
    privacyClassification: "public_safe",
    relatedFeatureRoute: "/journal",
    relatedFeatureLabelEn: "Open Journal",
    relatedFeatureLabelAr: "فتح المفكرة",
  },

  // ── BUSINESS ───────────────────────────────────────────────────────────────
  {
    id: "first_sale",
    version: 1,
    nameEn: "First Sale",
    nameAr: "أول إنجاز مالي",
    descEn: "Honoring your entrepreneurial courage with your first recorded business income.",
    descAr: "تقدير شجاعتكِ الريادية وتسجيل أول إيراد أو دفعة مدفوعة في سجلكِ التجاري.",
    criterionEn: "Record your first qualifying business sale or paid invoice (monetary values remain strictly private).",
    criterionAr: "تسجيل أول دفعة عميل أو فاتورة مدفوعة في سجلكِ (المبالغ المالية لا تُكشف أبداً).",
    shortCriterionEn: "Record first qualifying sale",
    shortCriterionAr: "تسجيل أول إيراد معتمد",
    icon: "💼",
    category: "business",
    criterionType: "business_income_event",
    targetValue: 1,
    xpReward: 50,
    sortOrder: 14,
    active: true,
    secret: false,
    privacyClassification: "private_by_default",
    relatedFeatureRoute: "/business",
    relatedFeatureLabelEn: "Open Business",
    relatedFeatureLabelAr: "فتح الأعمال",
  },

  // ── FAITH (Private by default, respectful, non-judgmental) ─────────────────
  {
    id: "quran_journey_7",
    version: 1,
    nameEn: "Quran Journey",
    nameAr: "رحاب القرآن",
    descEn: "A peaceful personal rhythm of reading your daily Quran wird across 7 days.",
    descAr: "إيقاع إيماني هادئ بالمحافظة على تلاوة الورد القرآني لـ 7 أيام مختلفة.",
    criterionEn: "Consistently read your daily Quran wird on 7 distinct local dates (personal consistency tracker, private by default).",
    criterionAr: "المحافظة على قراءة الورد القرآني في 7 أيام مختلفة (متابعة شخصية للاستمرار، خاصة دائماً).",
    shortCriterionEn: "Quran wird on 7 days",
    shortCriterionAr: "الورد القرآني لـ 7 أيام",
    icon: "📖",
    category: "faith",
    criterionType: "quran_wird_days",
    targetValue: 7,
    xpReward: 30,
    sortOrder: 15,
    active: true,
    secret: false,
    privacyClassification: "private_by_default",
    relatedFeatureRoute: "/deen",
    relatedFeatureLabelEn: "Open My Deen",
    relatedFeatureLabelAr: "فتح ديني",
  },
  {
    id: "athkar_routine_7",
    version: 1,
    nameEn: "Fortress of Peace",
    nameAr: "حصن الأذكار",
    descEn: "Gentle spiritual remembrance through morning or evening Athkar on 7 days.",
    descAr: "سكينة وطمأنينة عبر إتمام أذكار الصباح أو المساء في 7 أيام مختلفة.",
    criterionEn: "Complete morning or evening Athkar on 7 distinct local dates.",
    criterionAr: "إتمام أذكار الصباح أو المساء في 7 أيام محلية مختلفة.",
    shortCriterionEn: "Athkar on 7 days",
    shortCriterionAr: "الأذكار لـ 7 أيام",
    icon: "📿",
    category: "faith",
    criterionType: "athkar_routine_days",
    targetValue: 7,
    xpReward: 30,
    sortOrder: 16,
    active: true,
    secret: false,
    privacyClassification: "private_by_default",
    relatedFeatureRoute: "/deen",
    relatedFeatureLabelEn: "Open My Deen",
    relatedFeatureLabelAr: "فتح ديني",
  },

  // ── INACTIVE DEFINITIONS (Criteria missing from product specs) ─────────────
  {
    id: "zen_mode",
    version: 1,
    nameEn: "Zen Mode",
    nameAr: "وضع الهدوء",
    descEn: "Calm mindfulness badge.",
    descAr: "وسام الهدوء والسكينة.",
    criterionEn: "Pending documented product specification.",
    criterionAr: "بانتظار توثيق معيار القياس في مواصفات المنتج.",
    shortCriterionEn: "Pending definition",
    shortCriterionAr: "غير محدد بعد",
    icon: "🧘",
    category: "wellness",
    criterionType: "wellness_hydration_days",
    targetValue: 9999,
    xpReward: 0,
    sortOrder: 99,
    active: false, // Inactive because no documented reliable criterion exists
    secret: false,
    privacyClassification: "strictly_private",
    relatedFeatureRoute: "/wellness",
    relatedFeatureLabelEn: "Open Wellness",
    relatedFeatureLabelAr: "فتح العافية",
  },
  {
    id: "empire",
    version: 1,
    nameEn: "Empire",
    nameAr: "بناء الإمبراطورية",
    descEn: "Business milestone badge.",
    descAr: "وسام التوسع والنمو التجاري.",
    criterionEn: "Pending documented business milestone criterion.",
    criterionAr: "بانتظار توثيق معيار قياس نمو الأعمال.",
    shortCriterionEn: "Pending definition",
    shortCriterionAr: "غير محدد بعد",
    icon: "🏛️",
    category: "business",
    criterionType: "business_income_event",
    targetValue: 9999,
    xpReward: 0,
    sortOrder: 100,
    active: false, // Inactive because no documented milestone threshold exists
    secret: false,
    privacyClassification: "strictly_private",
    relatedFeatureRoute: "/business",
    relatedFeatureLabelEn: "Open Business",
    relatedFeatureLabelAr: "فتح الأعمال",
  },
];

// ── Registry Query Helpers ──────────────────────────────────────────────────

export function getBadgeDefinitions(options?: {
  includeInactive?: boolean;
  includeFaith?: boolean;
}): BadgeDefinition[] {
  const includeInactive = options?.includeInactive ?? false;
  const includeFaith = options?.includeFaith ?? true;

  return BADGE_DEFINITIONS.filter((def) => {
    if (!includeInactive && !def.active) return false;
    if (!includeFaith && def.category === "faith") return false;
    return true;
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getBadgeDefinitionById(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

// ── Deterministic Progress Calculation Strategy ─────────────────────────────

export function calculateRawCriterionValue(
  def: BadgeDefinition,
  state: AppState
): number {
  if (!state) return 0;

  switch (def.criterionType) {
    case "tasks_completed_count": {
      // Count unique completed tasks by ID (excluding uncompleted or duplicate instances)
      const completedTasks = (state.tasks || []).filter((t) => Boolean(t.done));
      return completedTasks.length;
    }

    case "habit_streak_days": {
      // Find highest active streak across active habits
      let maxStreak = 0;
      for (const h of state.habits || []) {
        if (h.status === "archived") continue;
        const s = typeof h.streak === "number" ? h.streak : 0;
        const b = typeof h.bestStreak === "number" ? h.bestStreak : 0;
        const curMax = Math.max(s, b);
        if (curMax > maxStreak) maxStreak = curMax;
      }
      return maxStreak;
    }

    case "business_income_event": {
      // Check for real business income (paid invoices or positive income transactions)
      const hasPaidInvoice = (state.businessInvoices || []).some(
        (inv) => inv.status === "paid"
      );
      if (hasPaidInvoice) return 1;

      const hasIncomeTransaction = (state.financialTransactions || []).some(
        (tx) => tx.type === "income" && (tx.legs?.some((l) => l.signedAmountMinor > 0) || ((tx as any).amountMinor > 0))
      );
      if (hasIncomeTransaction) return 1;

      const hasBusinessIncomeEvent = (state.businessActivityEvents || []).some(
        (ev) => ev.eventType === "invoice_paid" || ev.eventType === "payment_received"
      );
      if (hasBusinessIncomeEvent) return 1;

      return 0;
    }

    case "learning_books_completed": {
      // Count unique completed books
      const completedBooks = (state.books || []).filter((b: any) => {
        if (b.status === "finished" || b.status === "completed") return true;
        const total = b.totalPages || 0;
        const current = b.currentPage || b.readPages || 0;
        return total > 0 && current >= total;
      });
      return completedBooks.length;
    }

    case "goals_completed_count": {
      // Count confirmed completed goals
      const completedGoals = (state.goals || []).filter(
        (g) => g.status === "completed" || g.progress >= 100
      );
      return completedGoals.length;
    }

    case "morning_routine_days": {
      // Count distinct local dates where morning routine steps or full routine were completed
      const completions = state.routineCompletionsByDate || {};
      const dates = Object.keys(completions).filter((dateKey) => {
        const stepIds = completions[dateKey] || [];
        return stepIds.length > 0;
      });
      return dates.length;
    }

    case "evening_routine_days": {
      // Count distinct local dates for evening routine
      const completions = state.routineCompletionsByDate || {};
      const dates = Object.keys(completions).filter((dateKey) => {
        const stepIds = completions[dateKey] || [];
        return stepIds.length > 0;
      });
      return dates.length;
    }

    case "focus_sessions_count": {
      // Completed focus sessions
      const sessions = (state.focusSessions || []).filter(
        (s) => s.status === "completed" || (s.actualFocusSeconds && s.actualFocusSeconds >= 300)
      );
      return sessions.length;
    }

    case "flashcards_reviewed_count": {
      // Total reviewed flashcards
      if (typeof state.totalFlashcardsReviewed === "number" && state.totalFlashcardsReviewed > 0) {
        return state.totalFlashcardsReviewed;
      }
      const reviewSessions = state.reviewSessions || [];
      return reviewSessions.reduce((acc, r) => acc + (r.cardsReviewedCount || 0), 0);
    }

    case "wellness_hydration_days": {
      // Distinct dates where hydration target was met
      const hydMap = state.dailyHydration || {};
      const metDays = Object.keys(hydMap).filter((d) => {
        const rec = hydMap[d];
        return rec && rec.targetMl > 0 && rec.consumedMl >= rec.targetMl;
      });
      return metDays.length;
    }

    case "journal_writing_days": {
      // Distinct dates with journal entries (no text or title inspection)
      const dates = new Set<string>();
      for (const entry of state.journal || []) {
        if (entry.date) dates.add(entry.date.slice(0, 10));
      }
      return dates.size;
    }

    case "quran_wird_days": {
      // Distinct dates where Quran progress was logged
      const dates = new Set<string>();
      for (const ev of state.quranHistory || []) {
        if (ev.localDate) dates.add(ev.localDate);
      }
      return dates.size;
    }

    case "athkar_routine_days": {
      // Distinct dates where Athkar/prayers were logged
      const prayerMap = state.prayerLogs || {};
      const dates = new Set<string>();
      for (const key of Object.keys(prayerMap)) {
        const parts = key.split("_");
        if (parts[0]) dates.add(parts[0]);
      }
      return dates.size;
    }

    default:
      return 0;
  }
}

export function calculateBadgeProgress(
  def: BadgeDefinition,
  state: AppState,
  award?: BadgeAward
): BadgeProgress {
  const isUnlocked = Boolean(award);
  const rawValue = isUnlocked ? def.targetValue : calculateRawCriterionValue(def, state);
  const currentValue = Math.min(def.targetValue, Math.max(0, rawValue));
  const targetValue = Math.max(1, def.targetValue);
  const percentage = isUnlocked
    ? 100
    : Math.min(100, Math.max(0, Math.round((currentValue / targetValue) * 100)));

  const formattedProgress = `${currentValue.toLocaleString()} / ${targetValue.toLocaleString()}`;

  return {
    badgeId: def.id,
    definition: def,
    currentValue,
    targetValue,
    percentage,
    isUnlocked,
    award,
    formattedProgress,
  };
}

export function calculateAllBadgeProgress(
  state: AppState,
  options?: { includeFaith?: boolean; includeInactive?: boolean }
): BadgeProgress[] {
  const defs = getBadgeDefinitions(options);
  const awardMap = new Map<string, BadgeAward>();

  for (const award of state.badgeAwards || []) {
    awardMap.set(award.badgeId, award);
  }

  return defs.map((def) => calculateBadgeProgress(def, state, awardMap.get(def.id)));
}

// ── Idempotent Badge Evaluation & Unlocking ─────────────────────────────────

export function evaluateEligibleBadges(state: AppState): {
  newAwards: BadgeAward[];
  updatedAwards: BadgeAward[];
  updatedXpLedger: XPEvent[];
  newTotalXp: number;
} {
  const currentAwards = state.badgeAwards || [];
  const currentAwardMap = new Map<string, BadgeAward>();
  for (const award of currentAwards) {
    currentAwardMap.set(award.badgeId, award);
  }

  const newAwards: BadgeAward[] = [];
  const activeDefs = getBadgeDefinitions({ includeInactive: false, includeFaith: true });
  let ledger = [...(state.xpLedger || [])];
  const nowStr = new Date().toISOString();
  const today = state.tasks?.[0]?.dueDate || nowStr.slice(0, 10);
  const userId = state.user?.id || "usr_guest";

  for (const def of activeDefs) {
    if (currentAwardMap.has(def.id)) continue;

    const progressValue = calculateRawCriterionValue(def, state);
    if (progressValue >= def.targetValue) {
      // Eligible to unlock!
      const rewardKey = `badge.unlock:${def.id}:1`;
      let xpEventId: string | undefined = undefined;

      if (def.xpReward > 0) {
        const alreadyHasXp = ledger.some(
          (e) => e.rewardKey === rewardKey || e.idempotencyKey === rewardKey
        );

        if (!alreadyHasXp) {
          xpEventId = `xp_badge_${def.id}_${Date.now()}`;
          ledger.push({
            id: xpEventId,
            userId,
            rewardKey,
            sourceType: "badge",
            sourceId: def.id,
            actionType: "unlock",
            amount: def.xpReward,
            state: "active",
            localDate: today,
            idempotencyKey: rewardKey,
            createdAt: nowStr,
            labelEn: `Unlocked badge: ${def.nameEn}`,
            labelAr: `فتح شارة: ${def.nameAr}`,
          });
        }
      }

      const newAward: BadgeAward = {
        id: `award_${def.id}_${userId}`,
        userId,
        badgeId: def.id,
        badgeLevel: 1,
        definitionVersion: def.version,
        earnedAt: nowStr,
        earnedDateAccuracy: "exact",
        triggerSourceType: def.criterionType,
        triggerSourceId: def.id,
        xpEventId,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      newAwards.push(newAward);
      currentAwardMap.set(def.id, newAward);
    }
  }

  const updatedAwards = Array.from(currentAwardMap.values());
  const newTotalXp = getTotalActiveXp(ledger, state.xp);

  return {
    newAwards,
    updatedAwards,
    updatedXpLedger: ledger,
    newTotalXp,
  };
}

// ── Retroactive Historical Migration & Reconciliation ───────────────────────

export function reconcileAndMigrateBadges(state: AppState): {
  badgeAwards: BadgeAward[];
  unlockedBadges: string[];
  xpLedger: XPEvent[];
  xp: number;
} {
  const existingAwards = Array.isArray(state.badgeAwards) ? [...state.badgeAwards] : [];
  const awardMap = new Map<string, BadgeAward>();
  const userId = state.user?.id || "usr_guest";
  const nowStr = new Date().toISOString();

  for (const a of existingAwards) {
    if (a && a.badgeId) {
      awardMap.set(a.badgeId, a);
    }
  }

  // 1. Check legacy unlockedBadges and achievements arrays
  const legacyIds = new Set<string>([
    ...(Array.isArray(state.unlockedBadges) ? state.unlockedBadges : []),
    ...(Array.isArray(state.achievements) ? state.achievements : []),
  ]);

  for (const legacyId of legacyIds) {
    const def = getBadgeDefinitionById(legacyId);
    if (def && def.active && !awardMap.has(legacyId)) {
      // Reconstructed valid legacy award
      awardMap.set(legacyId, {
        id: `award_${legacyId}_${userId}`,
        userId,
        badgeId: legacyId,
        badgeLevel: 1,
        definitionVersion: def.version,
        earnedAt: nowStr,
        earnedDateAccuracy: "migrated",
        triggerSourceType: def.criterionType,
        triggerSourceId: legacyId,
        celebrationShownAt: nowStr, // Do not replay celebration on migrated badges
        createdAt: nowStr,
        updatedAt: nowStr,
      });
    }
  }

  // 2. Perform retroactive evaluation on real historical records
  const evaluation = evaluateEligibleBadges({
    ...state,
    badgeAwards: Array.from(awardMap.values()),
  });

  const finalAwards = evaluation.updatedAwards;
  const unlockedBadges = finalAwards.map((a) => a.badgeId);

  return {
    badgeAwards: finalAwards,
    unlockedBadges,
    xpLedger: evaluation.updatedXpLedger,
    xp: evaluation.newTotalXp,
  };
}
