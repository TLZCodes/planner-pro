/**
 * Gamification Engine — Canonical XP, Levels, Tiers, Badges & Daily Challenges
 * AYXA Planner — Canonical Product Identity
 */

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

import {
  type ProgressionTier,
  PROGRESSION_TIERS,
  getNumericLevel as engineGetNumericLevel,
  getLevelProgress as engineGetLevelProgress,
  getCurrentTier as engineGetCurrentTier,
  getTierProgress as engineGetTierProgress,
  getProgressionOverview as engineGetProgressionOverview,
} from "./progressionEngine";

// ─── Broad Tiers (Consolidated with Progression Engine) ─────────────────────
export const TIERS = PROGRESSION_TIERS;
export type TierInfo = ProgressionTier;

export const getTier = engineGetCurrentTier;
export const getTierProgress = engineGetTierProgress;
export const getNumericLevel = engineGetNumericLevel;
export const getLevelProgress = engineGetLevelProgress;
export const getProgressionOverview = engineGetProgressionOverview;

// ─── Legacy compatibility helpers ──────────────────────────────────────────
export const LEVELS = TIERS;
export type LevelInfo = TierInfo;
export const getLevel = getTier;
export function getXpToNextLevel(xp: number) {
  const p = getLevelProgress(xp);
  return { current: p.xpIntoLevel, needed: 250, pct: p.pct };
}

// ─── XP Event Values ───────────────────────────────────────────────────────
export const XP_EVENTS = {
  taskDone:          10,
  habitStreak:       20,
  goalCompleted:     50,
  studySession:       5,
  journalEntry:      15,
  flashcardReviewed: 30,
  selfcareChecked:    5,
  pixelSet:           5,
  loginBonus:        10,
  challengeDone:     40,
} as const;

export type XpEvent = keyof typeof XP_EVENTS;

// ─── Canonical Achievement Definitions ─────────────────────────────────────
export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: "productivity" | "wellness" | "learning" | "streaks" | "lifestyle";
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_task",      emoji: "✅", title: "First Step",        titleAr: "الخطوة الأولى",       description: "Complete your first task",             descriptionAr: "أنجزي مهمتك الأولى",              category: "productivity", color: "#A8E0D8" },
  { id: "five_tasks",      emoji: "🗂️", title: "Task Machine",      titleAr: "عاشقة الإنجاز",       description: "Complete 5 tasks in one day",          descriptionAr: "أنجزي 5 مهام في يوم واحد",        category: "productivity", color: "#C8B6E2" },
  { id: "habit_streak_7",  emoji: "🔥", title: "Week Warrior",      titleAr: "أسبوع الالتزام",      description: "Keep a habit for 7 days",              descriptionAr: "استمري على عادة لـ 7 أيام",       category: "streaks",      color: "#F7B7D2" },
  { id: "habit_streak_21", emoji: "🏆", title: "21-Day Champion",   titleAr: "بطلة الـ 21 يوماً",   description: "Keep a habit for 21 days",             descriptionAr: "استمري على عادة لـ 21 يوماً",     category: "streaks",      color: "#FDE49C" },
  { id: "goal_complete",   emoji: "🎯", title: "Goal Crusher",      titleAr: "محققة الأهداف",       description: "Complete your first goal",             descriptionAr: "حققي هدفك الأول بنجاح",           category: "productivity", color: "#C5DFC0" },
  { id: "study_60",        emoji: "📖", title: "Study Hour",        titleAr: "ساعة تركيز",          description: "Study for 60 minutes",                 descriptionAr: "ادرسي لمدة 60 دقيقة",             category: "learning",     color: "#C8B6E2" },
  { id: "study_300",       emoji: "🎓", title: "Scholar",           titleAr: "طالبة العلم",         description: "Accumulate 300 study minutes",         descriptionAr: "اجمعي 300 دقيقة دراسة",           category: "learning",     color: "#FDE49C" },
  { id: "flashcard_first", emoji: "🃏", title: "First Flashcard",   titleAr: "البطاقة الأولى",      description: "Create your first flashcard deck",     descriptionAr: "أنشئي أول مجموعة بطاقات تعليمية", category: "learning",     color: "#F7B7D2" },
  { id: "flashcard_100",   emoji: "🧠", title: "Memory Master",     titleAr: "قوة الذاكرة",         description: "Review 100 flashcards",                descriptionAr: "راجعي 100 بطاقة استذكار",         category: "learning",     color: "#A8E0D8" },
  { id: "journal_7",       emoji: "📓", title: "Dear Diary",        titleAr: "يومياتي الدافئة",     description: "Write 7 journal entries",              descriptionAr: "اكتبي 7 تدوينات في مذكرتكِ",      category: "wellness",     color: "#C8B6E2" },
  { id: "xp_500",          emoji: "📚", title: "Student Badge",     titleAr: "وسام الطالبة",        description: "Reach 500 XP",                        descriptionAr: "اصلي إلى 500 نقطة XP",            category: "streaks",      color: "#C8B6E2" },
  { id: "xp_2000",         emoji: "⭐", title: "Scholar Badge",     titleAr: "وسام الباحثة",        description: "Reach 2,000 XP",                      descriptionAr: "اصلي إلى 2,000 نقطة XP",          category: "streaks",      color: "#FDE49C" },
  { id: "xp_5000",         emoji: "🏅", title: "Master Badge",      titleAr: "وسام المتقنة",        description: "Reach 5,000 XP",                      descriptionAr: "اصلي إلى 5,000 نقطة XP",          category: "streaks",      color: "#F7B7D2" },
  { id: "xp_10000",        emoji: "👑", title: "Legend Badge",      titleAr: "وسام الأسطورة",       description: "Reach 10,000 XP",                     descriptionAr: "اصلي إلى 10,000 نقطة XP",         category: "streaks",      color: "#FFD700" },
  { id: "selfcare_7",      emoji: "💆", title: "Self-Care Queen",   titleAr: "أميرة العناية",       description: "Complete selfcare 7 days in a row",   descriptionAr: "أكملي روتين العناية لـ 7 أيام",   category: "wellness",     color: "#C5DFC0" },
  { id: "travel_plan",     emoji: "✈️", title: "Wanderlust",        titleAr: "شغف السفر",           description: "Add your first trip",                 descriptionAr: "أضيفي أول رحلة في مخطط السفر",    category: "lifestyle",    color: "#A8E0D8" },
  { id: "consistent",      emoji: "💎", title: "Consistent",        titleAr: "الاستمرارية الذهبية", description: "Use the app 7 days in a row",         descriptionAr: "افتحي التطبيق 7 أيام متتالية",     category: "streaks",      color: "#FFD700" },
];

// ─── Daily Challenge Definitions ───────────────────────────────────────────
export interface Challenge {
  id: string;
  emoji: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  xpReward: number;
  type: "daily" | "weekly";
}

export const CHALLENGES: Challenge[] = [
  { id: "ch_3tasks",      emoji: "📋", title: "Triple Threat",     titleAr: "إنجاز ثلاثي",      description: "Complete 3 tasks today",              descriptionAr: "أنجزي 3 مهام اليوم",              xpReward: 40, type: "daily"  },
  { id: "ch_study_2h",    emoji: "📚", title: "Study Marathon",    titleAr: "ماراثون الدراسة",   description: "Study for 2 hours today",             descriptionAr: "ادرسي لمدة ساعتين اليوم",          xpReward: 60, type: "daily"  },
  { id: "ch_habit_all",   emoji: "🔁", title: "Full House",        titleAr: "يوم العادات المثالي", description: "Complete all habits today",           descriptionAr: "أكملي جميع عادات اليوم",           xpReward: 50, type: "daily"  },
  { id: "ch_journal",     emoji: "📓", title: "Open Up",           titleAr: "تدوين الأفكار",    description: "Write a journal entry today",         descriptionAr: "اكتبي تدوينة اليوم",              xpReward: 30, type: "daily"  },
  { id: "ch_water",       emoji: "💧", title: "Hydration Hero",    titleAr: "بطلة الترطيب",     description: "Drink your daily hydration target",   descriptionAr: "اشربي كمية الماء اليومية كاملة",   xpReward: 20, type: "daily"  },
  { id: "ch_flashcard",   emoji: "🃏", title: "Brain Boost",       titleAr: "تنشيط الذاكرة",    description: "Review at least 5 flashcards",        descriptionAr: "راجعي 5 بطاقات استذكار",          xpReward: 35, type: "daily"  },
  { id: "ch_5tasks",      emoji: "✅", title: "Task Master",       titleAr: "أسبوع المهام",     description: "Complete 5 tasks this week",          descriptionAr: "أنجزي 5 مهام هذا الأسبوع",        xpReward: 80, type: "weekly" },
  { id: "ch_study_5h",    emoji: "🎓", title: "Study Week",        titleAr: "أسبوع الاجتهاد",    description: "Accumulate 5 hours of study",         descriptionAr: "اجمعي 5 ساعات دراسة هذا الأسبوع",  xpReward: 100, type: "weekly" },
  { id: "ch_goal_update", emoji: "🎯", title: "Goal Setter",       titleAr: "خطوة نحو الهدف",   description: "Update a goal progress this week",    descriptionAr: "حدثي تقدم أحد أهدافكِ",           xpReward: 40, type: "weekly" },
  { id: "ch_ai_convo",    emoji: "✨", title: "AI Companion",      titleAr: "جلسة تخطيط ذكية",  description: "Chat with the AYXA AI assistant once", descriptionAr: "استشيري مساعد AYXA AI للتخطيط",   xpReward: 25, type: "daily"  },
];

export function getDailyChallenges(date: string): Challenge[] {
  const seed = date.replace(/-/g, "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const daily = CHALLENGES.filter((c) => c.type === "daily");
  const weekly = CHALLENGES.filter((c) => c.type === "weekly");

  const picked: Challenge[] = [];
  const usedD = new Set<number>();
  let i = seed;
  let attempts = 0;
  while (picked.filter((c) => c.type === "daily").length < Math.min(3, daily.length) && attempts < 50) {
    const idx = (i + attempts) % (daily.length || 1);
    if (!usedD.has(idx) && daily[idx]) { picked.push(daily[idx]); usedD.add(idx); }
    attempts++;
  }
  const usedW = new Set<number>();
  attempts = 0;
  while (picked.filter((c) => c.type === "weekly").length < Math.min(2, weekly.length) && attempts < 50) {
    const idx = (i + 7 + attempts) % (weekly.length || 1);
    if (!usedW.has(idx) && weekly[idx]) { picked.push(weekly[idx]); usedW.add(idx); }
    attempts++;
  }
  return picked;
}
