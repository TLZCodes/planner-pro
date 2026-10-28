import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, memo } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PageHeader } from "@/components/kit";
import { HabitEditPage } from "@/components/habits/HabitEditPage";
import { HabitCardItem } from "@/components/habits/HabitCardItem";
import { HabitBundlePreviewModal } from "@/components/habits/HabitBundlePreviewModal";
import { WeeklyHabitBoard } from "@/components/habits/weekly/WeeklyHabitBoard";
import { useApp, type Habit, type HabitTrackingType, type HabitScheduleType, type HabitStatus } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Calendar,
  Award,
  CheckCircle2,
  Circle,
  Sparkle,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Edit3,
  Pause,
  Play,
  Archive,
  BarChart2,
  Clock,
  Check,
  Search,
  Filter,
  X,
  RotateCcw,
  Bell,
  Layers,
  ArrowRight,
  TrendingUp,
  Heart,
  BookOpen,
  Eye,
  CheckSquare
} from "lucide-react";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "عاداتي ✨ — AYXA Planner Pro" },
      {
        name: "description",
        content: "Track aesthetic habits, streaks, weekly progress, and explore ready-made habit bundles.",
      },
    ],
  }),
  component: Habits,
});

// Standard Life Area Categories
const LIFE_CATEGORIES = [
  { id: "Deen", labelAr: "الدين", labelEn: "Deen", emoji: "🌙", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { id: "Study", labelAr: "الدراسة", labelEn: "Study", emoji: "📚", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { id: "Work", labelAr: "العمل", labelEn: "Work", emoji: "💼", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  { id: "Home", labelAr: "المنزل", labelEn: "Home", emoji: "🏡", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { id: "Health", labelAr: "الصحة", labelEn: "Health", emoji: "💧", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  { id: "Self-care", labelAr: "العناية بالنفس", labelEn: "Self-Care", emoji: "💅", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
  { id: "Money", labelAr: "المال", labelEn: "Money", emoji: "💰", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { id: "Personal", labelAr: "شخصي", labelEn: "Personal", emoji: "✨", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
];

// Ready-made Habit Bundles (Purely habits, non-prescriptive, editable)
export type HabitBundleTemplate = {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  gradient: string;
  estimatedMinutes: number;
  categories: string[];
  habits: {
    sourceBundleHabitId: string;
    emoji: string;
    nameAr: string;
    nameEn: string;
    category: string;
    trackingType: HabitTrackingType;
    targetValue: number;
    unitAr?: string;
    unitEn?: string;
    preferredTime?: string;
    notesAr?: string;
    notesEn?: string;
  }[];
};

const READY_MADE_BUNDLES: HabitBundleTemplate[] = [
  {
    id: "bundle-starter",
    titleAr: "🌸 باقة البداية لأفضل نسخة منكِ",
    titleEn: "🌸 Becoming Her Starter",
    descAr: "عادات أساسية لبداية يوم مشرقة، شرب الماء، الامتنان والحركة اليومية",
    descEn: "Essential grounding habits for gentle mornings, hydration, and daily focus",
    badgeAr: "الأكثر طلباً ✨",
    badgeEn: "Popular ✨",
    gradient: "from-pink-500 via-rose-500 to-amber-400",
    estimatedMinutes: 25,
    categories: ["Health", "Self-care", "Personal"],
    habits: [
      {
        sourceBundleHabitId: "water_morning",
        emoji: "💧",
        nameAr: "شرب كوب ماء بعد الاستيقاظ",
        nameEn: "Drink a glass of water after waking",
        category: "Health",
        trackingType: "count",
        targetValue: 1,
        unitAr: "كوب",
        unitEn: "glass",
        preferredTime: "07:00",
      },
      {
        sourceBundleHabitId: "morning_stretch",
        emoji: "🧘‍♀️",
        nameAr: "تمارين التمدد والتنفس 10 دقائق",
        nameEn: "10 minutes of stretching & mindful breathing",
        category: "Health",
        trackingType: "duration",
        targetValue: 10,
        unitAr: "دقيقة",
        unitEn: "min",
        preferredTime: "07:30",
      },
      {
        sourceBundleHabitId: "gratitude_3",
        emoji: "✍️",
        nameAr: "تدوين 3 نعم في مفكرة الامتنان",
        nameEn: "Write 3 gratitudes in daily journal",
        category: "Personal",
        trackingType: "count",
        targetValue: 3,
        unitAr: "نعم",
        unitEn: "items",
      },
      {
        sourceBundleHabitId: "top_3_priorities",
        emoji: "🎯",
        nameAr: "تحديد أهم 3 أولويات لليوم",
        nameEn: "Identify top 3 priorities for the day",
        category: "Personal",
        trackingType: "check",
        targetValue: 1,
      },
    ],
  },
  {
    id: "bundle-deen",
    titleAr: "🌙 ورد البركة والتقرب من الله",
    titleEn: "🌙 Deen & Barakah Daily Habits",
    descAr: "عادات تعزز السكينة والطمأنينة، صلاة الفجر، الأذكار، والورد القرآني",
    descEn: "Daily devotional habits for inner peace, prayer on time, and Quran",
    badgeAr: "سكينة وطمأنينة 🤍",
    badgeEn: "Peace & Barakah 🤍",
    gradient: "from-emerald-600 via-teal-600 to-pink-500",
    estimatedMinutes: 40,
    categories: ["Deen"],
    habits: [
      {
        sourceBundleHabitId: "fajr_prayer",
        emoji: "🕌",
        nameAr: "صلاة الفجر في وقتها بخشوع",
        nameEn: "Fajr prayer on time with devotion",
        category: "Deen",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "05:30",
      },
      {
        sourceBundleHabitId: "athkar_daily",
        emoji: "📿",
        nameAr: "أذكار الصباح والمساء كاملة",
        nameEn: "Morning & Evening Adhkar",
        category: "Deen",
        trackingType: "count",
        targetValue: 2,
        unitAr: "مرات",
        unitEn: "sessions",
      },
      {
        sourceBundleHabitId: "quran_pages",
        emoji: "📖",
        nameAr: "قراءة 5 صفحات من القرآن الكريم",
        nameEn: "Read 5 pages of the Holy Quran",
        category: "Deen",
        trackingType: "count",
        targetValue: 5,
        unitAr: "صفحات",
        unitEn: "pages",
      },
      {
        sourceBundleHabitId: "duha_prayer",
        emoji: "☀️",
        nameAr: "ركعتا صلاة الضحى",
        nameEn: "Duha prayer (2 Raka'at)",
        category: "Deen",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "09:00",
      },
      {
        sourceBundleHabitId: "witr_prayer",
        emoji: "🤲",
        nameAr: "صلاة الوتر والدعاء",
        nameEn: "Witr prayer & supplication",
        category: "Deen",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "22:30",
      },
    ],
  },
  {
    id: "bundle-student",
    titleAr: "📚 الطالبة المتفوقة والتركيز العميق",
    titleEn: "📚 Focused Student Habit Routine",
    descAr: "عادات الدراسة الذكية، جلسات التركيز، والمراجعة الفعالة للمواد",
    descEn: "Smart study habits, focused sessions, and consistent active recall",
    badgeAr: "تفوق دراسي 💡",
    badgeEn: "Study Mastery 💡",
    gradient: "from-blue-600 via-indigo-600 to-rose-500",
    estimatedMinutes: 60,
    categories: ["Study"],
    habits: [
      {
        sourceBundleHabitId: "study_block_1",
        emoji: "⏱️",
        nameAr: "جلسة دراسة عميقة 45 دقيقة",
        nameEn: "45-minute deep focus study session",
        category: "Study",
        trackingType: "duration",
        targetValue: 45,
        unitAr: "دقيقة",
        unitEn: "min",
      },
      {
        sourceBundleHabitId: "active_recall",
        emoji: "🧠",
        nameAr: "مراجعة واسترجاع نشط لدرس سابق",
        nameEn: "Active recall & review of key concepts",
        category: "Study",
        trackingType: "check",
        targetValue: 1,
      },
      {
        sourceBundleHabitId: "read_textbook",
        emoji: "📖",
        nameAr: "قراءة 15 صفحة من المرجع الدراسي",
        nameEn: "Read 15 pages of academic textbook",
        category: "Study",
        trackingType: "count",
        targetValue: 15,
        unitAr: "صفحة",
        unitEn: "pages",
      },
      {
        sourceBundleHabitId: "daily_summary",
        emoji: "📝",
        nameAr: "تلخيص أهم نقاط اليوم في بطاقات",
        nameEn: "Summarize today's core lessons",
        category: "Study",
        trackingType: "check",
        targetValue: 1,
      },
    ],
  },
  {
    id: "bundle-glow",
    titleAr: "💅 العناية بالبشرة والجمال الطبيعي",
    titleEn: "💅 Wellness & Glow-Up Rituals",
    descAr: "طقوس العناية اليومية بالبشرة، شرب الماء، والحركة الخفيفة المريحة",
    descEn: "Nourishing daily skincare, hydration goals, and gentle body movement",
    badgeAr: "إشراقة وجمال 🌸",
    badgeEn: "Glow & Self-Care 🌸",
    gradient: "from-rose-400 via-pink-400 to-peach-400",
    estimatedMinutes: 30,
    categories: ["Self-care", "Health"],
    habits: [
      {
        sourceBundleHabitId: "skincare_am_pm",
        emoji: "🧴",
        nameAr: "روتين العناية بالبشرة الصباحي والمسائي",
        nameEn: "Morning & evening skincare routine",
        category: "Self-care",
        trackingType: "count",
        targetValue: 2,
        unitAr: "مرات",
        unitEn: "times",
      },
      {
        sourceBundleHabitId: "daily_walk",
        emoji: "🏃‍♀️",
        nameAr: "المشي 20 دقيقة ونشاط بدني ممتع",
        nameEn: "20-minute energizing walk or movement",
        category: "Health",
        trackingType: "duration",
        targetValue: 20,
        unitAr: "دقيقة",
        unitEn: "min",
      },
      {
        sourceBundleHabitId: "water_8_glasses",
        emoji: "💧",
        nameAr: "شرب 8 أكواب ماء على مدار اليوم",
        nameEn: "Drink 8 glasses of water throughout the day",
        category: "Health",
        trackingType: "count",
        targetValue: 8,
        unitAr: "أكواب",
        unitEn: "glasses",
      },
      {
        sourceBundleHabitId: "evening_tea",
        emoji: "🍵",
        nameAr: "كوب شاي الأعشاب المهدئ والراحة",
        nameEn: "Calming herbal tea wind-down",
        category: "Self-care",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "21:00",
      },
    ],
  },
  {
    id: "bundle-home",
    titleAr: "🧹 ترتيب وهدوء المنزل والمساحة",
    titleEn: "🧹 Calm Home & Space Reset",
    descAr: "عادات بسيطة للحفاظ على بيئة مرتبة ومريحة تنعكس على هدوء البال",
    descEn: "Gentle daily habits to keep your room tidy, fresh, and relaxing",
    badgeAr: "مساحة هادئة 🏡",
    badgeEn: "Cozy Home 🏡",
    gradient: "from-amber-500 via-orange-400 to-rose-400",
    estimatedMinutes: 20,
    categories: ["Home"],
    habits: [
      {
        sourceBundleHabitId: "make_bed",
        emoji: "🛏️",
        nameAr: "ترتيب السرير فور الاستيقاظ",
        nameEn: "Make bed neatly upon waking",
        category: "Home",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "07:15",
      },
      {
        sourceBundleHabitId: "quick_tidy_10m",
        emoji: "✨",
        nameAr: "10 دقائق ترتيب سريع للغرفة والمكتب",
        nameEn: "10-minute quick room & desk reset",
        category: "Home",
        trackingType: "duration",
        targetValue: 10,
        unitAr: "دقيقة",
        unitEn: "min",
      },
      {
        sourceBundleHabitId: "prep_tomorrow",
        emoji: "👗",
        nameAr: "تجهيز ملابس وأغراض الغد في المساء",
        nameEn: "Prepare tomorrow's outfit and bag",
        category: "Home",
        trackingType: "check",
        targetValue: 1,
        preferredTime: "21:30",
      },
      {
        sourceBundleHabitId: "open_windows",
        emoji: "🌿",
        nameAr: "تهوية الغرفة وتجديد الهواء النقي",
        nameEn: "Air out room & let fresh light in",
        category: "Home",
        trackingType: "check",
        targetValue: 1,
      },
    ],
  },
  {
    id: "bundle-digital",
    titleAr: "📵 التوازن الرقمي وراحة الذهن",
    titleEn: "📵 Digital Balance & Mental Clarity",
    descAr: "عادات لحماية التركيز والراحة من التشتت الرقمي وإدمان الشاشات",
    descEn: "Mindful habits to reduce screen distractions and regain mental peace",
    badgeAr: "صفاء وتركيز 💡",
    badgeEn: "Mindful Focus 💡",
    gradient: "from-indigo-900 via-purple-800 to-pink-700",
    estimatedMinutes: 0,
    categories: ["Personal", "Self-care"],
    habits: [
      {
        sourceBundleHabitId: "phone_free_morning",
        emoji: "📵",
        nameAr: "الساعة الأولى دون هاتف بعد الاستيقاظ",
        nameEn: "Phone-free first hour after waking",
        category: "Personal",
        trackingType: "check",
        targetValue: 1,
      },
      {
        sourceBundleHabitId: "screen_free_night",
        emoji: "📴",
        nameAr: "إيقاف الشاشات قبل النوم بـ 45 دقيقة",
        nameEn: "Screen-free 45 minutes before sleep",
        category: "Self-care",
        trackingType: "check",
        targetValue: 1,
      },
      {
        sourceBundleHabitId: "mindful_breaks",
        emoji: "🌿",
        nameAr: "استراحة واعية دون إشعارات أثناء العمل",
        nameEn: "Mindful notification-free focus breaks",
        category: "Personal",
        trackingType: "check",
        targetValue: 1,
      },
    ],
  },
];

const EMOJI_PALETTE = [
  "🌸", "💧", "🕌", "📿", "📖", "🌅", "🧴", "🏃‍♀️", "🎯", "🍵", "🌙", "✍️",
  "🥑", "🧘‍♀️", "📚", "🎙️", "🧹", "📵", "💡", "🤍", "☕", "☀️", "🛏️", "✨",
  "💼", "💰", "🎨", "🍏", "🌿", "👟", "🧠", "👗", "📴", "⏱️", "🧼", "🪴"
];

function Habits() {
  const navigate = useNavigate();
  const {
    state,
    toggleHabit,
    updateHabitProgress,
    addHabit,
    editHabit,
    pauseHabit,
    resumeHabit,
    archiveHabit,
    skipHabitForToday,
    removeHabit,
    importHabitBundle,
    addCustomCategory
  } = useApp();

  const { t, lang } = useLang();
  const isAr = lang === "ar";

  // Navigation Tabs: 'today' | 'week' | 'all' | 'explore'
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all" | "explore">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "week" || tab === "today" || tab === "all" || tab === "explore") {
        return tab;
      }
    }
    return "today";
  });

  // Filter and Search states
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTrackingTypeFilter, setActiveTrackingTypeFilter] = useState<"all" | HabitTrackingType>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<"active" | "paused" | "archived">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Bottom Sheets
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedBundleForPreview, setSelectedBundleForPreview] = useState<HabitBundleTemplate | null>(null);
  const [bundleSelectedHabitIds, setBundleSelectedHabitIds] = useState<Record<string, boolean>>({});
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState<Habit | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [completedSectionExpanded, setCompletedSectionExpanded] = useState(true);

  // Back button overlay dismiss handler
  useEffect(() => {
    if (showAddDrawer || editingHabit || selectedBundleForPreview || detailHabit || deleteConfirmHabit) {
      (window as any).__onBackOverlayDismiss = () => {
        if (showAddDrawer) {
          setShowAddDrawer(false);
          setEditingHabit(null);
          return true;
        }
        if (selectedBundleForPreview) {
          setSelectedBundleForPreview(null);
          return true;
        }
        if (detailHabit) {
          setDetailHabit(null);
          return true;
        }
        if (deleteConfirmHabit) {
          setDeleteConfirmHabit(null);
          return true;
        }
        return false;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }

    return () => {
      (window as any).__onBackOverlayDismiss = null;
    };
  }, [showAddDrawer, editingHabit, selectedBundleForPreview, detailHabit, deleteConfirmHabit]);

  // Form state isolated in HabitDrawerModal

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // ── 1. Calculate Active Habits for Today ───────────────────────────────────
  const todayDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  const activeHabits = useMemo(() => {
    return state.habits.filter((h) => (h.status || "active") === "active");
  }, [state.habits]);

  const scheduledTodayHabits = useMemo(() => {
    return activeHabits.filter((h) => {
      if (!h.scheduledDays || h.scheduledDays.length === 0) return true;
      return h.scheduledDays.includes(todayDayOfWeek);
    });
  }, [activeHabits, todayDayOfWeek]);

  const todayCompletedHabits = useMemo(() => {
    return scheduledTodayHabits.filter((h) => Boolean(h.days?.[6]));
  }, [scheduledTodayHabits]);

  const todayPendingHabits = useMemo(() => {
    return scheduledTodayHabits.filter((h) => !h.days?.[6]);
  }, [scheduledTodayHabits]);

  const totalScheduledCount = scheduledTodayHabits.length;
  const completedTodayCount = todayCompletedHabits.length;
  const completionPercentage = totalScheduledCount > 0 ? Math.round((completedTodayCount / totalScheduledCount) * 100) : 0;

  // ── 2. Calculate Overall Daily Streak ──────────────────────────────────────
  const overallDailyStreak = useMemo(() => {
    const activeHabitList = state.habits.filter((h) => (h.status || "active") === "active");
    if (activeHabitList.length === 0) return 0;
    return Math.max(0, ...activeHabitList.map((h) => h.streak || 0));
  }, [state.habits]);

  // ── 3. Categories List with Custom Categories ─────────────────────────────
  const allCategories = useMemo(() => {
    const defaultList = [...LIFE_CATEGORIES];
    if (state.customCategories && state.customCategories.length > 0) {
      state.customCategories.forEach((catName) => {
        if (!defaultList.some((c) => c.id === catName || c.labelAr === catName)) {
          defaultList.push({
            id: catName,
            labelAr: catName,
            labelEn: catName,
            emoji: "✨",
            color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
          });
        }
      });
    }
    return defaultList;
  }, [state.customCategories]);

    // ── 4. Open Edit Drawer ──────────────────────────────────────────────────
  const openEditDrawer = (habit: Habit) => {
    setEditingHabit(habit);
    setShowAddDrawer(true);
  };

  const openNewDrawer = () => {
    setEditingHabit(null);
    setShowAddDrawer(true);
  };

  const handleSaveHabit = (payload: Partial<Habit>) => {
    if (editingHabit) {
      editHabit(editingHabit.id, payload);
      showToast(isAr ? "✓ تم حفظ التعديلات بنجاح ✨" : "✓ Habit changes saved ✨");
    } else {
      addHabit(payload as any);
      showToast(isAr ? `✓ تم إضافة عادة "${payload.name || ""}" ✨` : `✓ Added "${payload.name || ""}" habit ✨`);
    }
    setShowAddDrawer(false);
    setEditingHabit(null);
  };

  // ── 5. Bundle Preview and Selective Import ────────────────────────────────
  const openBundlePreview = (bundle: HabitBundleTemplate) => {
    setSelectedBundleForPreview(bundle);
    const initialSelection: Record<string, boolean> = {};
    bundle.habits.forEach((h) => {
      initialSelection[h.sourceBundleHabitId] = true;
    });
    setBundleSelectedHabitIds(initialSelection);
  };

  const handleImportSelected = () => {
    if (!selectedBundleForPreview) return;
    const selectedList = selectedBundleForPreview.habits.filter((h) => bundleSelectedHabitIds[h.sourceBundleHabitId]);
    if (selectedList.length === 0) {
      showToast(isAr ? "يرجى تحديد عادة واحدة على الأقل للاستيراد" : "Please select at least one habit to add");
      return;
    }

    const count = importHabitBundle(
      selectedBundleForPreview.id,
      selectedList.map((h) => ({
        name: isAr ? h.nameAr : h.nameEn,
        nameAr: h.nameAr,
        emoji: h.emoji,
        category: h.category,
        trackingType: h.trackingType,
        targetValue: h.targetValue,
        unit: isAr ? h.unitAr : h.unitEn,
        preferredTime: h.preferredTime,
        notes: isAr ? h.notesAr : h.notesEn,
        sourceBundleHabitId: h.sourceBundleHabitId,
      }))
    );

    setSelectedBundleForPreview(null);
    setActiveTab("today");
    showToast(
      isAr
        ? `✓ تم إضافة ${count} عادات من حزمة "${selectedBundleForPreview.titleAr.split("(")[0]}" وحصلتِ على +${count * 15} XP! ✨`
        : `✓ Added ${count} habits from "${selectedBundleForPreview.titleEn}" (+ ${count * 15} XP)! ✨`
    );
  };

  return (
    <MobileShell hideTabs={Boolean(showAddDrawer || editingHabit)}>
      {(showAddDrawer || Boolean(editingHabit)) ? (
        <HabitEditPage
          habit={editingHabit}
          allCategories={LIFE_CATEGORIES}
          isAr={isAr}
          onSave={(payload) => {
            if (editingHabit) {
              editHabit(editingHabit.id, payload);
              showToast(isAr ? "تم تعديل العادة بنجاح ✨" : "Habit updated ✨");
            } else {
              addHabit(payload as any);
              showToast(isAr ? "تمت إضافة العادة بنجاح ✨" : "Habit added ✨");
            }
            setShowAddDrawer(false);
            setEditingHabit(null);
          }}
          onCancel={() => {
            setShowAddDrawer(false);
            setEditingHabit(null);
          }}
        />
      ) : (
        <Screen>
        {/* ── TOP HEADER ── */}
        <PageHeader
          title={isAr ? "عاداتي ✨" : "My Habits ✨"}
          showBack={true}
          fallbackUrl="/"
          right={
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-full text-[11.5px] font-extrabold text-hotpink shadow-xs"
                title={isAr ? "سلسلة الالتزام بالعادات اليومية" : "Daily habit streak"}
              >
                <Flame className="h-4 w-4 text-hotpink fill-hotpink" />
                <span>{isAr ? `سلسلة يومية: ${overallDailyStreak} يومًا` : `${overallDailyStreak}-day daily streak`}</span>
              </div>
            </div>
          }
        />

        <main className="px-4 pt-1 pb-16 space-y-4">
          {/* TOAST NOTICE */}
          {toastNotice && (
            <div className="animate-fade-in p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-[13px] text-center shadow-rose-md flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{toastNotice}</span>
            </div>
          )}

          {/* ── 4 HORIZONTAL NAVIGATION TABS ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "today", labelAr: "اليوم", labelEn: "Today", icon: Calendar, badge: totalScheduledCount },
              { id: "week", labelAr: "الأسبوع", labelEn: "Week", icon: Layers },
              { id: "all", labelAr: "كل العادات", labelEn: "All Habits", icon: CheckSquare, badge: state.habits.length },
              { id: "explore", labelAr: "اكتشفي ✨", labelEn: "Explore ✨", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "cursor-pointer px-4 py-2.5 rounded-2xl text-[13px] font-extrabold flex items-center gap-2 border shrink-0 transition-all active:scale-98",
                    isSelected
                      ? "bg-hotpink border-hotpink text-white shadow-rose-sm"
                      : "bg-surface border-border/80 text-ink hover:border-hotpink/40"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? "text-white" : "text-hotpink")} />
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={cn(
                        "text-[10.5px] px-1.5 py-0.2 rounded-full font-black",
                        isSelected ? "bg-white/25 text-white" : "bg-pink-100 dark:bg-pink-950 text-hotpink"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── TAB 1: TODAY (اليوم) ───────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "today" && (
            <div className="space-y-4">
              {/* GRADIENT PROGRESS CARD */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-5 text-white shadow-rose-md">
                <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-xl" />
                <span className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-300/20 blur-xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl shadow-inner border border-white/30">
                        ✨
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-200 block">
                          {isAr ? "عادات اليوم" : "TODAY'S HABITS"}
                        </span>
                        <h2 className="text-[17px] font-black tracking-tight font-display">
                          {isAr ? "خطوات صغيرة تصنع تحولًا حقيقيًا ✨" : "Small steps, real transformation ✨"}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR & STATS */}
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[12px] font-bold text-pink-100 mb-1.5">
                        <span>{isAr ? `اكتملت ${completedTodayCount} من ${totalScheduledCount}` : `${completedTodayCount} of ${totalScheduledCount} completed`}</span>
                        <span className="font-extrabold text-white text-[13.5px]">{completionPercentage}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/25 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {completionPercentage === 100 && totalScheduledCount > 0 && (
                      <div className="flex items-center gap-1 bg-amber-300 text-slate-950 px-3 py-1.5 rounded-full text-[11px] font-black shadow-md shrink-0">
                        <Award className="h-4 w-4 text-slate-950" />
                        <span>{isAr ? "أنجزتِ الكل! 👑" : "All Done! 👑"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ACTIVE SCHEDULED HABITS FOR TODAY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15.5px] font-bold text-ink flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-hotpink" />
                    <span>{isAr ? "المجدولة لليوم" : "Scheduled Today"}</span>
                    <span className="text-[12px] font-bold text-ink-light bg-surface px-2 py-0.5 rounded-full border border-border">
                      {todayPendingHabits.length}
                    </span>
                  </h3>

                  <button
                    type="button"
                    onClick={openNewDrawer}
                    className="text-[12.5px] font-extrabold text-hotpink hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isAr ? "إضافة عادة" : "Add Habit"}</span>
                  </button>
                </div>

                {todayPendingHabits.length > 0 ? (
                  <div className="space-y-2.5">
                    {todayPendingHabits.map((habit) => (
                      <HabitCardItem
                        key={habit.id}
                        habit={habit}
                        isAr={isAr}
                        onToggle={() => toggleHabit(habit.id)}
                        onUpdateProgress={(val) => updateHabitProgress(habit.id, val)}
                        onEdit={() => openEditDrawer(habit)}
                        onViewDetail={() => setDetailHabit(habit)}
                        onPause={() => {
                          pauseHabit(habit.id);
                          showToast(isAr ? "تم إيقاف العادة مؤقتاً" : "Habit paused");
                        }}
                        onSkip={() => {
                          skipHabitForToday(habit.id);
                          showToast(isAr ? "تم تخطي العادة لليوم" : "Habit skipped for today");
                        }}
                        onArchive={() => {
                          archiveHabit(habit.id);
                          showToast(isAr ? "تمت أرشفة العادة" : "Habit archived");
                        }}
                        onDelete={() => setDeleteConfirmHabit(habit)}
                      />
                    ))}
                  </div>
                ) : totalScheduledCount === 0 ? (
                  /* EMPTY STATE WHEN NO HABITS SCHEDULED */
                  <div className="rounded-3xl border border-dashed border-border p-8 text-center bg-card/60 space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 dark:bg-pink-950/60 text-3xl mx-auto border border-pink-200 dark:border-pink-900 shadow-sm">
                      🌸
                    </div>
                    <div className="max-w-xs mx-auto space-y-1">
                      <h4 className="text-[16px] font-bold text-ink">
                        {isAr ? "مساحتك للعادات جاهزة ✨" : "Your habit space is ready ✨"}
                      </h4>
                      <p className="text-[13px] text-ink-light leading-relaxed">
                        {isAr
                          ? "اختاري عادة تدعم المرأة التي تسعين لتصبحيها."
                          : "Choose a habit that supports the woman you are becoming."}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={openNewDrawer}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl grad-theme text-white font-extrabold text-[13px] shadow-rose-sm active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>{isAr ? "+ أضيفي عادتي الأولى" : "+ Add my first habit"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("explore")}
                        className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-surface border border-border text-ink font-bold text-[13px] hover:border-hotpink/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 text-hotpink" />
                        <span>{isAr ? "استكشاف الحزم الجاهزة ✨" : "Explore Bundles ✨"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ALL TODAY'S HABITS ARE COMPLETED */
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center">
                    <p className="text-[13.5px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                      <span>🎉</span>
                      <span>{isAr ? "رائع! أنجزتِ جميع عاداتك المجدولة لليوم ✨" : "Awesome! All scheduled habits completed today ✨"}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE COMPLETED TODAY SECTION */}
              {todayCompletedHabits.length > 0 && (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletedSectionExpanded(!completedSectionExpanded)}
                    className="w-full flex items-center justify-between text-[14px] font-bold text-ink-light hover:text-ink transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      <span>{isAr ? `المكتملة اليوم (${todayCompletedHabits.length})` : `Completed Today (${todayCompletedHabits.length})`}</span>
                    </span>
                    <span className="text-[12px] font-bold text-hotpink">{completedSectionExpanded ? (isAr ? "إخفاء" : "Hide") : (isAr ? "عرض" : "Show")}</span>
                  </button>

                  {completedSectionExpanded && (
                    <div className="space-y-2.5">
                      {todayCompletedHabits.map((habit) => (
                        <HabitCardItem
                          key={habit.id}
                          habit={habit}
                          isAr={isAr}
                          isCompleted={true}
                          onToggle={() => toggleHabit(habit.id)}
                          onUpdateProgress={(val) => updateHabitProgress(habit.id, val)}
                          onEdit={() => openEditDrawer(habit)}
                          onViewDetail={() => setDetailHabit(habit)}
                          onPause={() => pauseHabit(habit.id)}
                          onSkip={() => skipHabitForToday(habit.id)}
                          onArchive={() => archiveHabit(habit.id)}
                          onDelete={() => setDeleteConfirmHabit(habit)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EXPLORE BUNDLES PROMO LINK */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("explore")}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-hotpink hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAr ? "تصفحي حزم العادات الجاهزة والملهمة ➔" : "Explore ready-made inspiring bundles ➔"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── TAB 2: WEEK (الأسبوع) ──────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "week" && (
            <WeeklyHabitBoard
              isAr={isAr}
              onOpenHabitDetail={(habit) => setDetailHabit(habit)}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── TAB 3: ALL HABITS (كل العادات) ─────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "all" && (
            <div className="space-y-4">
              {/* SEARCH & STATUS FILTER */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-light" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "ابحثي في عاداتك..." : "Search your habits..."}
                    className="w-full h-11 ps-10 pe-4 rounded-2xl bg-card border border-border text-[13px] font-medium text-ink placeholder:text-ink-light focus:outline-none focus:border-hotpink"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Status Tabs (Active, Paused, Archived) */}
                <div className="flex gap-2">
                  {[
                    { id: "active", labelAr: "النشطة", labelEn: "Active", count: state.habits.filter((h) => (h.status || "active") === "active").length },
                    { id: "paused", labelAr: "المتوقفة مؤقتاً", labelEn: "Paused", count: state.habits.filter((h) => h.status === "paused").length },
                    { id: "archived", labelAr: "المؤرشفة", labelEn: "Archived", count: state.habits.filter((h) => h.status === "archived").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStatusFilter(tab.id as any)}
                      className={cn(
                        "cursor-pointer px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all flex items-center gap-1.5",
                        activeStatusFilter === tab.id
                          ? "bg-card border-hotpink text-hotpink shadow-xs"
                          : "bg-surface border-border text-ink-light hover:text-ink"
                      )}
                    >
                      <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                      <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-surface border border-border">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HABITS LIST IN ALL TAB */}
              <div className="space-y-2.5">
                {state.habits
                  .filter((h) => {
                    const status = h.status || "active";
                    if (status !== activeStatusFilter) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return h.name.toLowerCase().includes(q) || (h.category || "").toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className="rounded-2xl bg-card border border-border/80 p-4 shadow-card hover:border-hotpink/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => setDetailHabit(habit)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface border border-border text-2xl shrink-0">
                          {habit.emoji}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[14.5px] font-bold text-ink truncate flex items-center gap-1.5">
                            <span>{habit.name}</span>
                            {habit.status === "paused" && (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                {isAr ? "موقفة" : "Paused"}
                              </span>
                            )}
                            {habit.status === "archived" && (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-slate-500/10 text-slate-600 border border-slate-500/20">
                                {isAr ? "مؤرشفة" : "Archived"}
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 text-[11.5px] text-ink-light font-medium mt-0.5">
                            <span className="text-hotpink font-bold flex items-center gap-0.5">
                              <Flame className="h-3 w-3 fill-hotpink" />
                              <span>{habit.streak || 0} {isAr ? "يوم" : "days"}</span>
                            </span>
                            <span>•</span>
                            <span>{habit.category}</span>
                            <span>•</span>
                            <span className="capitalize">{habit.trackingType || "check"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailHabit(habit)}
                          className="h-8 w-8 rounded-xl bg-surface border border-border text-ink hover:border-hotpink flex items-center justify-center transition-colors cursor-pointer"
                          title={isAr ? "عرض التقدم" : "View Progress"}
                        >
                          <BarChart2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDrawer(habit)}
                          className="h-8 w-8 rounded-xl bg-surface border border-border text-ink hover:border-hotpink flex items-center justify-center transition-colors cursor-pointer"
                          title={isAr ? "تعديل" : "Edit"}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── TAB 4: EXPLORE (اكتشفي) ─────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "explore" && (
            <div className="space-y-4">
              <div>
                <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-hotpink block">
                  {isAr ? "حزم عادات جاهزة ✨" : "Ready-made Habit Bundles ✨"}
                </span>
                <h3 className="text-[17px] font-black text-ink font-display">
                  {isAr ? "باقات ملهمة لاختيار عاداتك الجديدة" : "Inspiring Bundles for Your Lifestyle"}
                </h3>
                <p className="text-[12.5px] text-ink-light leading-relaxed mt-0.5">
                  {isAr
                    ? "اختاري الحزمة المناسبة وعايني عاداتها وحددي ما ترغبين بإضافته بحرية تامة."
                    : "Preview any bundle and select only the habits you want to track."}
                </p>
              </div>

              {/* 6 READY-MADE HABIT BUNDLE CARDS */}
              <div className="grid grid-cols-1 gap-3.5">
                {READY_MADE_BUNDLES.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="rounded-3xl bg-card border border-border/80 p-5 shadow-card hover:border-hotpink/50 transition-all space-y-3.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10.5px] font-black uppercase tracking-wider px-2.5 py-0.8 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800 inline-block">
                          {isAr ? bundle.badgeAr : bundle.badgeEn}
                        </span>
                        <h4 className="text-[16px] font-bold text-ink mt-1.5">
                          {isAr ? bundle.titleAr : bundle.titleEn}
                        </h4>
                        <p className="text-[12.5px] text-ink-light leading-relaxed mt-0.5">
                          {isAr ? bundle.descAr : bundle.descEn}
                        </p>
                      </div>
                    </div>

                    {/* Habits preview tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {bundle.habits.map((h, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-surface border border-border text-ink flex items-center gap-1"
                        >
                          <span>{h.emoji}</span>
                          <span>{isAr ? h.nameAr : h.nameEn}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-[11.5px] text-ink-light font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-hotpink" />
                        <span>{isAr ? `${bundle.habits.length} عادات` : `${bundle.habits.length} habits`}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => openBundlePreview(bundle)}
                        className="py-2.5 px-4 rounded-2xl grad-theme text-white font-extrabold text-[12.5px] shadow-rose-sm active:scale-98 transition-transform flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isAr ? "معاينة الحزمة" : "Preview Bundle"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── MODAL 2: BUNDLE PREVIEW & SELECTIVE IMPORT ───────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {selectedBundleForPreview && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-hotpink">
                    {isAr ? selectedBundleForPreview.badgeAr : selectedBundleForPreview.badgeEn}
                  </span>
                  <h3 className="text-[17px] font-bold text-ink">
                    {isAr ? selectedBundleForPreview.titleAr : selectedBundleForPreview.titleEn}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBundleForPreview(null)}
                  className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-ink hover:text-hotpink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[12.5px] text-ink-light leading-relaxed">
                {isAr ? selectedBundleForPreview.descAr : selectedBundleForPreview.descEn}
              </p>

              {/* Selection Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[12px] font-bold text-ink">
                  {isAr ? "اختاري العادات المراد إضافتها:" : "Select habits to add:"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const allSelected = selectedBundleForPreview.habits.every((h) => bundleSelectedHabitIds[h.sourceBundleHabitId]);
                    const updated: Record<string, boolean> = {};
                    selectedBundleForPreview.habits.forEach((h) => {
                      updated[h.sourceBundleHabitId] = !allSelected;
                    });
                    setBundleSelectedHabitIds(updated);
                  }}
                  className="text-[12px] font-extrabold text-hotpink hover:underline cursor-pointer"
                >
                  {selectedBundleForPreview.habits.every((h) => bundleSelectedHabitIds[h.sourceBundleHabitId])
                    ? (isAr ? "إلغاء تحديد الكل" : "Deselect All")
                    : (isAr ? "تحديد الكل" : "Select All")}
                </button>
              </div>

              {/* Habits List with Checkboxes */}
              <div className="space-y-2">
                {selectedBundleForPreview.habits.map((habit) => {
                  const isChecked = Boolean(bundleSelectedHabitIds[habit.sourceBundleHabitId]);
                  const isAlreadyImported = state.habits.some(
                    (h) => h.sourceBundleHabitId === habit.sourceBundleHabitId || h.name === (isAr ? habit.nameAr : habit.nameEn)
                  );

                  return (
                    <div
                      key={habit.sourceBundleHabitId}
                      onClick={() => {
                        setBundleSelectedHabitIds({
                          ...bundleSelectedHabitIds,
                          [habit.sourceBundleHabitId]: !isChecked,
                        });
                      }}
                      className={cn(
                        "rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer transition-all",
                        isChecked
                          ? "bg-pink-50/70 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800"
                          : "bg-surface border-border opacity-75"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0",
                            isChecked ? "bg-hotpink text-white border-hotpink" : "bg-card border-border"
                          )}
                        >
                          {isChecked && <Check className="h-4 w-4 stroke-[3]" />}
                        </div>
                        <div className="text-xl">{habit.emoji}</div>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-ink truncate">
                            {isAr ? habit.nameAr : habit.nameEn}
                          </p>
                          <span className="text-[11px] text-ink-light">
                            {habit.category} • {habit.trackingType} {habit.targetValue > 1 ? `(${habit.targetValue} ${isAr ? habit.unitAr || "" : habit.unitEn || ""})` : ""}
                          </span>
                        </div>
                      </div>

                      {isAlreadyImported && (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                          {isAr ? "موجودة لديكِ" : "Installed"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Import CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleImportSelected}
                  className="w-full py-3.5 px-4 rounded-2xl grad-theme text-white font-extrabold text-[14px] shadow-rose-md active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>{isAr ? "أضيفي العادات المحددة ✨" : "Add Selected Habits ✨"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── MODAL 3: HABIT DETAIL & HEATMAP ANALYTICS ─────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {detailHabit && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl">{detailHabit.emoji}</div>
                  <div>
                    <h3 className="text-[16px] font-bold text-ink">{detailHabit.name}</h3>
                    <span className="text-[11px] text-ink-light">{detailHabit.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailHabit(null)}
                  className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-ink hover:text-hotpink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* STATS SUMMARY */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-surface border border-border p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-ink-light block">{isAr ? "السلسلة الحالية" : "Current"}</span>
                  <span className="text-[16px] font-black text-hotpink flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame className="h-4 w-4 fill-hotpink" />
                    <span>{detailHabit.streak || 0}d</span>
                  </span>
                </div>
                <div className="rounded-2xl bg-surface border border-border p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-ink-light block">{isAr ? "أفضل إنجاز" : "Best"}</span>
                  <span className="text-[16px] font-black text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Award className="h-4 w-4" />
                    <span>{detailHabit.bestStreak || detailHabit.streak || 0}d</span>
                  </span>
                </div>
                <div className="rounded-2xl bg-surface border border-border p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-ink-light block">{isAr ? "آخر 7 أيام" : "7-Day"}</span>
                  <span className="text-[16px] font-black text-emerald-500 mt-0.5 block">
                    {(detailHabit.days || []).filter(Boolean).length}/7
                  </span>
                </div>
              </div>

              {/* COMPASSIONATE STREAK MESSAGE */}
              <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 text-center">
                <p className="text-[12.5px] font-bold text-hotpink flex items-center justify-center gap-1">
                  <span>🌸</span>
                  <span>{isAr ? "بداية جديدة تبدأ اليوم ✨" : "A fresh start begins today ✨"}</span>
                </p>
                <p className="text-[11.5px] text-ink-light mt-0.5">
                  {isAr
                    ? "كل يوم هو فرصة لتجديد الالتزام وصنع عادات تدوم."
                    : "Every day is an opportunity to cultivate habits that last."}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailHabit(null);
                    openEditDrawer(detailHabit);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-surface border border-border text-ink font-bold text-[12.5px] hover:border-hotpink flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isAr ? "تعديل العادة" : "Edit Habit"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    archiveHabit(detailHabit.id);
                    setDetailHabit(null);
                    showToast(isAr ? "تم تحديث حالة الأرشفة" : "Archive status updated");
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-surface border border-border text-ink font-bold text-[12.5px] hover:border-hotpink flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{detailHabit.status === "archived" ? (isAr ? "إلغاء الأرشفة" : "Unarchive") : (isAr ? "أرشفة" : "Archive")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── MODAL 4: DELETE CONFIRMATION ─────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {deleteConfirmHabit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 text-center max-h-[85vh] overflow-y-auto overscroll-contain">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 text-2xl mx-auto border border-rose-200">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-ink">
                  {isAr ? `حذف عادة "${deleteConfirmHabit.name}"؟` : `Delete "${deleteConfirmHabit.name}"?`}
                </h3>
                <p className="text-[12.5px] text-ink-light leading-relaxed">
                  {isAr
                    ? "هل أنتِ متأكدة؟ يمكنكِ أرشفة العادة للاحتفاظ بسجل إنجازاتك السابقة."
                    : "Are you sure? You can archive it instead to keep your history."}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmHabit(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-surface border border-border text-ink font-bold text-[13px] hover:border-hotpink cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeHabit(deleteConfirmHabit.id);
                    setDeleteConfirmHabit(null);
                    showToast(isAr ? "تم حذف العادة بنجاح" : "Habit deleted");
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white font-extrabold text-[13px] shadow-rose-sm active:scale-95 cursor-pointer"
                >
                  {isAr ? "تأكيد الحذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Screen>
      )}
    </MobileShell>
  );
}