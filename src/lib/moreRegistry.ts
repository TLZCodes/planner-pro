import {
  Moon,
  Repeat,
  Target,
  Timer,
  BookOpen,
  Briefcase,
  Wallet,
  Compass,
  Sparkles,
  Heart,
  Grid,
  Palette,
  Flame,
  Trophy,
  Zap,
  Brain,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { type AppState, todayKey } from "./store";

export type ModuleCategory =
  | "faith"
  | "plan_focus"
  | "learn_work_money"
  | "wellbeing_reflection"
  | "growth_rewards"
  | "account_support";

export interface CategoryDefinition {
  id: ModuleCategory;
  titleEn: string;
  titleAr: string;
  accentColor: string;
  badgeBg: string;
}

export interface ModuleDefinition {
  id: string;
  canonicalRoute: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  aliasesEn: string[];
  aliasesAr: string[];
  icon: LucideIcon;
  categoryId: ModuleCategory;
  visualAccent: "emerald" | "pink" | "lavender" | "mint" | "gold" | "neutral";
  gradient: string;
  isFeatured?: boolean;
  canBePinned?: boolean;
  canBeHidden?: boolean;
  defaultOrder: number;
  getDynamicStat?: (state: AppState, isAr: boolean) => string | null;
}

export const MORE_CATEGORIES: CategoryDefinition[] = [
  {
    id: "faith",
    titleEn: "Faith",
    titleAr: "الإيمان",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    id: "plan_focus",
    titleEn: "Plan & Focus",
    titleAr: "التخطيط والتركيز",
    accentColor: "text-pink-600 dark:text-pink-400",
    badgeBg: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  },
  {
    id: "learn_work_money",
    titleEn: "Learn, Work & Money",
    titleAr: "التعلم والعمل والمال",
    accentColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  {
    id: "wellbeing_reflection",
    titleEn: "Wellbeing & Reflection",
    titleAr: "العافية والتأمل",
    accentColor: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
  {
    id: "growth_rewards",
    titleEn: "Growth & Rewards",
    titleAr: "النمو والإنجازات",
    accentColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    id: "account_support",
    titleEn: "Account & Support",
    titleAr: "الحساب والدعم",
    accentColor: "text-zinc-600 dark:text-zinc-400",
    badgeBg: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  },
];

export const ALL_MORE_MODULES: ModuleDefinition[] = [
  // ── FAITH (Featured) ────────────────────────────────────────────────────────
  {
    id: "my-deen",
    canonicalRoute: "/deen",
    titleEn: "My Deen",
    titleAr: "ديني",
    descEn: "Quran recitation, Athkar, prayers, daily wird and electronic Tasbih.",
    descAr: "تلاوة القرآن، الأذكار، الصلوات، الورد اليومي والسبحة الإلكترونية.",
    aliasesEn: ["quran", "islamic", "athkar", "tasbih", "prayers", "sadaqah", "wird", "deen", "dhikr", "allah"],
    aliasesAr: ["قرآن", "اسلامي", "اذكار", "أذكار", "تسبيح", "سبحة", "صلاة", "صلوات", "صدقة", "ورد", "ديني", "دين"],
    icon: Moon,
    categoryId: "faith",
    visualAccent: "emerald",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/30",
    isFeatured: true,
    canBePinned: true,
    canBeHidden: false,
    defaultOrder: 1,
    getDynamicStat: (_state, isAr) => {
      return isAr ? "الورد اليومي والأذكار 🌙" : "Daily Wird & Dhikr 🌙";
    },
  },

  // ── PLAN & FOCUS ───────────────────────────────────────────────────────────
  {
    id: "brain-dump",
    canonicalRoute: "/inbox",
    titleEn: "Brain Dump 🧠",
    titleAr: "مساحة أفكاري 🧠",
    descEn: "Give your thoughts a little place to land.",
    descAr: "امنحي أفكاركِ مكانًا قبل ترتيبها.",
    aliasesEn: ["inbox", "brain dump", "capture", "notes", "thoughts", "voice note", "idea", "quick capture"],
    aliasesAr: ["مساحة أفكاري", "صندوق الأفكار", "أفكار", "تدوين", "خواطر", "ملاحظات", "تسجيل صوتي"],
    icon: Brain,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-pink-400 via-rose-400 to-purple-400 text-white shadow-pink-500/25",
    isFeatured: true,
    canBePinned: true,
    canBeHidden: false,
    defaultOrder: 1.5,
    getDynamicStat: (state, isAr) => {
      const items = (state as any).brainDumpItems || [];
      const unsorted = items.filter((it: any) => it.status === "unsorted");
      if (!unsorted.length) {
        return isAr ? "أفكاركِ مرتبة بالكامل ✨" : "All thoughts organized ✨";
      }
      return isAr ? `${unsorted.length} فكرة غير مرتبة` : `${unsorted.length} unsorted thoughts`;
    },
  },
  {
    id: "routines",
    canonicalRoute: "/routines",
    titleEn: "Routines & Ideal Day",
    titleAr: "روتيناتي واليوم المثالي",
    descEn: "Morning and evening intentional rhythms to structure your days with ease.",
    descAr: "إيقاعات صباحية ومسائية واعية لتنظيم يومكِ وساعاتكِ بانسجام.",
    aliasesEn: ["routine", "morning", "evening", "ideal day", "habits", "rhythm", "schedule", "time"],
    aliasesAr: ["روتين", "صباحي", "مسائي", "اليوم المثالي", "عادات", "جدول", "تنظيم"],
    icon: Repeat,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-pink-500 via-rose-500 to-purple-600 text-white shadow-pink-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 2,
    getDynamicStat: (state, isAr) => {
      const allRoutines = Object.values(state.routines || {});
      let totalSteps = 0;
      let doneSteps = 0;
      for (let i = 0; i < allRoutines.length; i++) {
        const list = allRoutines[i];
        if (Array.isArray(list)) {
          totalSteps += list.length;
          doneSteps += list.filter((st) => st.done).length;
        }
      }
      if (totalSteps === 0) return null;
      return isAr
        ? `${doneSteps} من ${totalSteps} خطوات مكتملة`
        : `${doneSteps}/${totalSteps} routine steps completed`;
    },
  },
  {
    id: "habits",
    canonicalRoute: "/habits",
    titleEn: "Habits",
    titleAr: "متتبع العادات",
    descEn: "Track streak matrix, build daily habits, and explore ready-made bundles.",
    descAr: "تابعي سلاسل التزامكِ، ابنِ عاداتكِ اليومية، واستكشفي حزم العادات الجاهزة.",
    aliasesEn: ["habit", "streaks", "track", "matrix", "daily", "routine", "bundles", "tracker"],
    aliasesAr: ["عادة", "عادات", "التزام", "سلسلة", "تتبع", "مصفوفة", "يومي"],
    icon: Flame,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-rose-400 via-pink-500 to-rose-600 text-white shadow-rose-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 3,
    getDynamicStat: (state, isAr) => {
      const active = (state.habits || []).filter((h) => (h.status || "active") === "active");
      if (!active.length) return isAr ? "ابدئي عادة جديدة ✨" : "Start a habit ✨";
      const doneCount = active.filter((h) => Boolean(h.days?.[6])).length;
      return isAr
        ? `اكتملت ${doneCount} من ${active.length} عادات`
        : `${doneCount}/${active.length} habits done today`;
    },
  },
  {
    id: "vision-board",
    canonicalRoute: "/goals?tab=vision",
    titleEn: "Vision Board",
    titleAr: "لوحة رؤيتي",
    descEn: "Feminine scrapbook, dream collage, aesthetic affirmations & linked ambitions.",
    descAr: "سجل أمنيات وقصاصات جمالية، لوحات أحلام، وتأكيدات ملهمة مرتبطة بأهدافكِ.",
    aliasesEn: ["vision", "board", "vision board", "dream", "collage", "scrapbook", "manifest", "wishes", "affirmations", "pictures"],
    aliasesAr: ["رؤية", "لوحة رؤيتي", "فيجن بورد", "احلام", "أحلام", "قصاصات", "أمنيات", "توكيدات", "صور"],
    icon: Sparkles,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-pink-400 via-rose-400 to-purple-400 text-white shadow-pink-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 4.5,
    getDynamicStat: (state, isAr) => {
      const boards = (state.visionBoards || []).filter((b) => (b.status || "active") === "active");
      const items = (state.visionBoardItems || []).length;
      if (!boards.length && !items) return isAr ? "أنشئي لوحتكِ الأولى ✨" : "Create your first board ✨";
      return isAr ? `${boards.length} ألواح • ${items} قصاصة` : `${boards.length} boards • ${items} cards`;
    },
  },
  {
    id: "goals",
    canonicalRoute: "/goals",
    titleEn: "Goals",
    titleAr: "أهدافي وطموحاتي",
    descEn: "Break big ambitions into milestones, key results, and daily actions.",
    descAr: "قسّمي طموحاتكِ الكبيرة إلى محطات إنجاز ونتائج رئيسية وخطوات يومية.",
    aliasesEn: ["goal", "target", "milestone", "ambition", "vision", "okr", "project"],
    aliasesAr: ["هدف", "أهداف", "طموح", "محطة", "رؤية", "مشروع", "إنجاز"],
    icon: Target,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-amber-400 via-pink-500 to-rose-500 text-white shadow-pink-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 4,
    getDynamicStat: (state, isAr) => {
      const active = (state.goals || []).filter((g) => g.status === "active");
      if (!active.length) return isAr ? "لا توجد أهداف نشطة" : "No active goals";
      return isAr ? `${active.length} أهداف قيد التنفيذ` : `${active.length} active goals`;
    },
  },
  {
    id: "focus",
    canonicalRoute: "/focus",
    titleEn: "Focus",
    titleAr: "مؤقت التركيز",
    descEn: "Deep work & Pomodoro sessions accompanied by soothing ambient sounds.",
    descAr: "جلسات عمل عميق وبومودورو مع أصوات طبيعية مهدئة ومحفزة للتركيز.",
    aliasesEn: ["focus", "pomodoro", "timer", "deep work", "ambient", "study", "sound"],
    aliasesAr: ["تركيز", "بومودورو", "مؤقت", "عمل عميق", "أصوات", "دراسة"],
    icon: Timer,
    categoryId: "plan_focus",
    visualAccent: "pink",
    gradient: "from-purple-500 via-indigo-500 to-pink-500 text-white shadow-purple-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 5,
    getDynamicStat: (state, isAr) => {
      const today = todayKey();
      const sessions = (state.focusSessions || []).filter(
        (s) => s.localDate === today && (s.status === "completed" || (s as any).status === "active")
      );
      const totalSec = sessions.reduce(
        (acc, s) => acc + (s.actualFocusSeconds || s.plannedFocusSeconds || (s as any).durationSeconds || 0),
        0
      );
      const totalMins = Math.round(totalSec / 60);
      if (totalMins === 0) return isAr ? "جاهزة لجلسة تركيز ✨" : "Ready for focus ✨";
      return isAr ? `${totalMins} دقيقة تركيز اليوم` : `${totalMins} mins focused today`;
    },
  },

  // ── LEARN, WORK & MONEY ────────────────────────────────────────────────────
  {
    id: "learning",
    canonicalRoute: "/learning",
    titleEn: "Learning",
    titleAr: "دراستي ودوراتي",
    descEn: "Academic subjects, book library, flashcard reviews and study heatmaps.",
    descAr: "المواد الدراسية، مكتبة الكتب، مراجعة البطاقات وخريطة ساعات المذاكرة.",
    aliasesEn: ["learn", "study", "books", "courses", "flashcards", "skills", "exam", "reading"],
    aliasesAr: ["دراسة", "تعلم", "كتب", "دورات", "كورسات", "بطاقات", "مهارات", "امتحان", "قراءة"],
    icon: BookOpen,
    categoryId: "learn_work_money",
    visualAccent: "lavender",
    gradient: "from-sky-400 via-indigo-500 to-purple-600 text-white shadow-indigo-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 6,
    getDynamicStat: (state, isAr) => {
      const subjectsCount = (state.study || []).length;
      const booksCount = (state.books || []).length;
      if (subjectsCount === 0 && booksCount === 0) return null;
      return isAr
        ? `${subjectsCount} مواد • ${booksCount} كتب`
        : `${subjectsCount} subjects • ${booksCount} books`;
    },
  },
  {
    id: "business",
    canonicalRoute: "/business",
    titleEn: "Business",
    titleAr: "أعمالي ومشاريعي",
    descEn: "Client ledger, project milestones, invoices and revenue growth.",
    descAr: "سجل العملاء، مراحل المشاريع، الفواتير ومتابعة نمو الإيرادات.",
    aliasesEn: ["business", "work", "projects", "clients", "revenue", "invoices", "career"],
    aliasesAr: ["بزنس", "عمل", "مشاريع", "عملاء", "إيرادات", "فواتير", "مشروع"],
    icon: Briefcase,
    categoryId: "learn_work_money",
    visualAccent: "lavender",
    gradient: "from-indigo-500 via-purple-600 to-slate-700 text-white shadow-indigo-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 7,
    getDynamicStat: (_state, isAr) => {
      return isAr ? "إدارة المشاريع والعملاء" : "Projects & clients ledger";
    },
  },
  {
    id: "finance",
    canonicalRoute: "/finance",
    titleEn: "Finance",
    titleAr: "مالي",
    descEn: "Expense tracking, savings goals, monthly budgets and cash flow.",
    descAr: "تتبع المصروفات، أهداف الادخار، الميزانية الشهرية وحركة الأموال.",
    aliasesEn: ["finance", "money", "budget", "expenses", "savings", "cash", "income"],
    aliasesAr: ["مال", "ميزانية", "مصروفات", "ادخار", "فلوس", "دخل", "مصاريف"],
    icon: Wallet,
    categoryId: "learn_work_money",
    visualAccent: "lavender",
    gradient: "from-teal-400 via-emerald-500 to-indigo-600 text-white shadow-teal-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 8,
    getDynamicStat: (state, isAr) => {
      if (state.financeSettings?.balancesHidden) {
        return isAr ? "الأرصدة مخفية للخصوصية" : "Balances hidden";
      }
      const count = (state.financialTransactions || state.money || []).length;
      return isAr ? `${count} معاملات مسجلة` : `${count} transactions logged`;
    },
  },
  {
    id: "travel",
    canonicalRoute: "/travel",
    titleEn: "Travel",
    titleAr: "مخطط السفر",
    descEn: "Dream trip itineraries, packing checklists, and flight savings funds.",
    descAr: "برامج الرحلات، قوائم تجهيز الحقائب، ومحافظ ادخار السفر والتذاكر.",
    aliasesEn: ["travel", "trip", "vacation", "flight", "packing", "itinerary", "holiday"],
    aliasesAr: ["سفر", "رحلة", "عطلة", "طيران", "حقائب", "برنامج", "سياحة"],
    icon: Compass,
    categoryId: "learn_work_money",
    visualAccent: "lavender",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-blue-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 9,
    getDynamicStat: (state, isAr) => {
      const tripsCount = (state.trips || []).length;
      if (!tripsCount) return isAr ? "خططي لرحلتكِ القادمة ✈️" : "Plan your next trip ✈️";
      return isAr ? `${tripsCount} رحلات مخطط لها` : `${tripsCount} trips planned`;
    },
  },

  // ── WELLBEING & REFLECTION ────────────────────────────────────────────────
  {
    id: "wellness",
    canonicalRoute: "/wellness",
    titleEn: "Wellness",
    titleAr: "صحتي وعافيتي",
    descEn: "Daily hydration, sleep logs, balanced nutrition, and activity tracking.",
    descAr: "شرب الماء والترطيب، تتبع ساعات النوم، التغذية المتوازنة والحركة اليومية.",
    aliasesEn: ["wellness", "health", "water", "hydration", "sleep", "nutrition", "steps", "body"],
    aliasesAr: ["صحة", "عافية", "ماء", "ترطيب", "نوم", "تغذية", "خطوات", "رياضة"],
    icon: Sparkles,
    categoryId: "wellbeing_reflection",
    visualAccent: "mint",
    gradient: "from-teal-400 via-emerald-500 to-cyan-500 text-white shadow-teal-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 10,
    getDynamicStat: (state, isAr) => {
      const today = todayKey();
      const hyd = state.dailyHydration?.[today];
      if (hyd && hyd.consumedMl > 0) {
        return isAr
          ? `${hyd.consumedMl.toLocaleString()} مل ماء اليوم`
          : `${hyd.consumedMl.toLocaleString()} ml water today`;
      }
      return isAr ? "متابعة الترطيب والعافية" : "Track water & vitality";
    },
  },
  {
    id: "selfcare",
    canonicalRoute: "/selfcare",
    titleEn: "Self-care",
    titleAr: "العناية بالنفس",
    descEn: "Nourishing skincare rituals, mind pauses, and gentle mood check-ins.",
    descAr: "طقوس العناية بالبشرة، استراحات هدوء واسترخاء، وتفقد المشاعر بلطف.",
    aliasesEn: ["selfcare", "care", "skincare", "beauty", "glow", "rituals", "relax", "pamper"],
    aliasesAr: ["عناية", "نفس", "بشرة", "جمال", "نضارة", "طقوس", "استرخاء", "راحة"],
    icon: Heart,
    categoryId: "wellbeing_reflection",
    visualAccent: "mint",
    gradient: "from-pink-400 via-rose-500 to-pink-600 text-white shadow-pink-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 11,
    getDynamicStat: (state, isAr) => {
      const today = todayKey();
      const doneCount = (state.selfcare || []).filter((s) => s.done && s.doneDate === today).length;
      return isAr
        ? `اكتملت ${doneCount} من طقوس العناية اليوم`
        : `${doneCount} self-care rituals completed today`;
    },
  },
  {
    id: "pixels",
    canonicalRoute: "/year-in-pixels",
    titleEn: "Year in Pixels",
    titleAr: "سنتي بالألوان",
    descEn: "Colorful 365-day visual tapestry mapping your mood across the entire year.",
    descAr: "لوحة بصرية ملونة ترسم تقلبات ومشاعركِ على مدار 365 يوماً في السنة.",
    aliasesEn: ["pixels", "year in pixels", "mood", "colors", "grid", "yearly", "emotions"],
    aliasesAr: ["سنة في مربعات", "سنتي بالالوان", "مزاج", "مشاعر", "الوان", "سنوي", "بكسل"],
    icon: Grid,
    categoryId: "wellbeing_reflection",
    visualAccent: "mint",
    gradient: "from-purple-400 via-indigo-500 to-pink-500 text-white shadow-purple-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 12,
    getDynamicStat: (state, isAr) => {
      const loggedDays = Object.keys(state.dailyMoods || {}).length || (state.pixels || []).length;
      if (!loggedDays) return isAr ? "سجّلي مشاعر اليوم ✨" : "Log today's mood ✨";
      return isAr ? `${loggedDays} يوماً مسجلاً` : `${loggedDays} days recorded`;
    },
  },
  {
    id: "weekly-reset",
    canonicalRoute: "/journal?tab=reset",
    titleEn: "Weekly Reset",
    titleAr: "مساحة مراجعة الأسبوع",
    descEn: "Gentle pause to review your week, honor small wins, and set fresh priorities.",
    descAr: "وقفة هادئة لتراجعي أسبوعكِ، تحتفي بإنجازاتكِ الصغيرة، وتحددي أولوياتكِ القادمة.",
    aliasesEn: ["reset", "weekly reset", "review", "weekly review", "reflection", "recap"],
    aliasesAr: ["ريست", "مراجعة الاسبوع", "مراجعة الأسبوع", "تأمل الأسبوع", "حصاد"],
    icon: Sparkles,
    categoryId: "wellbeing_reflection",
    visualAccent: "mint",
    gradient: "from-amber-400 via-rose-400 to-pink-500 text-white shadow-pink-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 13.5,
    getDynamicStat: (state, isAr) => {
      const notes = Object.values(state.weeklyNotes || {});
      const completed = notes.filter((n) => n.completedReflection).length;
      return isAr ? `${completed} مراجعات أسبوعية مكتملة 🌸` : `${completed} weekly resets completed 🌸`;
    },
  },
  {
    id: "bujo",
    canonicalRoute: "/bujo",
    titleEn: "Bujo",
    titleAr: "المفكرة النقطية",
    descEn: "Pastel creative bullet journal studio, custom grids, and aesthetic sticker canvas.",
    descAr: "استوديو البوليت جورنال الإبداعي، شبكات نقطية، وملصقات جمالية للتزيين.",
    aliasesEn: ["bujo", "bullet journal", "stickers", "canvas", "sketch", "notes", "creative", "draw"],
    aliasesAr: ["بوليت جورنال", "مفكرة نقطية", "ملصقات", "ستيكرز", "رسم", "ابداع", "كانفاس", "دفتر"],
    icon: Palette,
    categoryId: "wellbeing_reflection",
    visualAccent: "mint",
    gradient: "from-rose-400 via-pink-400 to-purple-500 text-white shadow-rose-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 13,
    getDynamicStat: (_state, isAr) => {
      return isAr ? "استوديو التصميم والملصقات 🎨" : "Sticker & Canvas Studio 🎨";
    },
  },

  // ── GROWTH & REWARDS ──────────────────────────────────────────────────────
  {
    id: "challenges",
    canonicalRoute: "/challenges",
    titleEn: "Challenges",
    titleAr: "التحديات",
    descEn: "Transformative 7, 30, 75-Hard, and 90-day disciplined life protocols.",
    descAr: "بروتوكولات تحول وتحديات 7، 30، 75 Hard و90 يومًا لبناء الانضباط.",
    aliasesEn: ["challenge", "75 hard", "90 day", "protocol", "discipline", "transformation"],
    aliasesAr: ["تحدي", "تحديات", "انضباط", "تحول", "بروتوكول", "عادات"],
    icon: Flame,
    categoryId: "growth_rewards",
    visualAccent: "gold",
    gradient: "from-amber-400 via-orange-500 to-amber-600 text-slate-950 shadow-amber-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 14,
    getDynamicStat: (_state, isAr) => {
      return isAr ? "تحديات 7، 30 و 90 يومًا 🔥" : "7, 30 & 90-day protocols 🔥";
    },
  },
  {
    id: "gamification",
    canonicalRoute: "/progress",
    titleEn: "My Progress ✨",
    titleAr: "تقدّمي ✨",
    descEn: "XP level evolution, daily quest rewards, and personal growth analytics.",
    descAr: "تطور مستويات نقاط الخبرة، مهام اليوم التفاعلية، وإحصائيات النمو الشخصي.",
    aliasesEn: ["progress", "levels", "xp", "gamification", "points", "quests", "rank"],
    aliasesAr: ["تقدمي", "مستويات", "نقاط", "خبرة", "تحديات", "نمو", "رتبة"],
    icon: Zap,
    categoryId: "growth_rewards",
    visualAccent: "gold",
    gradient: "from-amber-400 via-yellow-500 to-orange-500 text-white shadow-amber-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 15,
    getDynamicStat: (state, isAr) => {
      const xp = state.xp || 0;
      const lvl = Math.floor(xp / 250) + 1;
      return isAr ? `${xp.toLocaleString()} نقطة • المستوى ${lvl}` : `${xp.toLocaleString()} XP • Level ${lvl}`;
    },
  },
  {
    id: "achievements",
    canonicalRoute: "/badges",
    titleEn: "Badges",
    titleAr: "شاراتي",
    descEn: "Aesthetic achievement badges honoring consistency, discipline, and milestones.",
    descAr: "شارات وأوسمة جمالية تكرّم استمراركِ وانضباطكِ وإنجازاتكِ المحققة.",
    aliasesEn: ["badges", "achievements", "trophy", "medals", "awards", "unlocked", "rewards"],
    aliasesAr: ["شارات", "اوسمة", "أوسمة", "كؤوس", "ميداليات", "مكافآت", "انجازات"],
    icon: Trophy,
    categoryId: "growth_rewards",
    visualAccent: "gold",
    gradient: "from-amber-400 via-orange-400 to-yellow-500 text-white shadow-amber-500/25",
    canBePinned: true,
    canBeHidden: true,
    defaultOrder: 16,
    getDynamicStat: (state, isAr) => {
      const count = (state.unlockedBadges || []).length;
      return isAr ? `${count} شارات مكتسبة 🏆` : `${count} badges unlocked 🏆`;
    },
  },

  // ── ACCOUNT & SUPPORT ─────────────────────────────────────────────────────
  {
    id: "settings",
    canonicalRoute: "/settings",
    titleEn: "Settings",
    titleAr: "الإعدادات",
    descEn: "Custom color themes, sound alerts, language, currency, and data backups.",
    descAr: "ألوان وثيمات التطبيق، أصوات التنبيه، اللغة، العملة، والنسخ الاحتياطي.",
    aliasesEn: ["settings", "preferences", "theme", "language", "backup", "notifications", "profile", "account"],
    aliasesAr: ["إعدادات", "اعدادات", "تفضيلات", "ثيمات", "الوان", "لغة", "نسخ", "تنبيهات", "حساب"],
    icon: SettingsIcon,
    categoryId: "account_support",
    visualAccent: "neutral",
    gradient: "from-slate-400 via-zinc-500 to-slate-600 text-white shadow-slate-500/20",
    canBePinned: true,
    canBeHidden: false,
    defaultOrder: 17,
    getDynamicStat: (state, isAr) => {
      const themeName = state.prefs?.theme || "rose";
      return isAr ? `الثيم: ${themeName}` : `Theme: ${themeName}`;
    },
  },
];

export const DEFAULT_PINNED_MODULE_IDS = ["my-deen", "habits", "goals", "routines"];
