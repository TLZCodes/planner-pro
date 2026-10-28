import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, memo } from "react";
import {
  Plus,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Star,
  MoreVertical,
  Check, CheckCircle, Eye,
  Clock,
  Calendar,
  Tag,
  Target,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  Compass,
  Heart,
  TrendingUp,
  ListTodo,
  Layers,
  Repeat,
  AlertCircle,
  HelpCircle,
  X,
  Smile,
  Zap,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import {
  Screen,
  ProgressRing,
  ProgressBar,
  PillTag,
} from "@/components/kit";
import { GoalEditPage } from "@/components/goals/GoalEditPage";
import { GoalCard } from "@/components/goals/GoalCard";
import {
  useApp,
  type Goal,
  type GoalMilestone,
  type GoalStatus,
  type GoalProgressMethod,
  type GoalLinkedSourceType,
  type GoalCheckIn,
  DEFAULT_TASK_CATEGORIES,
  todayKey,
  getTomorrowKey,
} from "@/lib/store";
import { VisionBoardCollection } from "@/components/vision/VisionBoardCollection";
import { VisionBoardView } from "@/components/vision/VisionBoardView";
import { SomedayGardenTab } from "@/components/goals/garden/SomedayGardenTab";
import { type VisionBoardItem } from "@/lib/visionEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/goals")({
  validateSearch: (search: Record<string, unknown>): { tab?: string; boardId?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    boardId: typeof search.boardId === "string" ? search.boardId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Goals — AYXA Planner Pro" },
      {
        name: "description",
        content: "Break big dreams into key results, milestones and daily actions you can track.",
      },
    ],
  }),
  component: GoalsPage,
});

type StatusTab = "active" | "completed" | "archived";

const EMOJI_PALETTE = ["🎯", "🎓", "💰", "💼", "🌸", "🥑", "🏡", "🌙", "📚", "✨", "🚀", "💡", "🌿", "🧘‍♀️", "🎨", "✈️"];

function GoalsPage() {
  const navigate = useNavigate();
  const {
    state,
    addGoal,
    editGoal,
    updateGoalProgress,
    toggleGoalFocus,
    replaceGoalFocus,
    pauseGoal,
    resumeGoal,
    completeGoal,
    uncompleteGoal,
    archiveGoal,
    restoreGoal,
    removeGoal,
    addGoalMilestone,
    editGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,
    reorderGoalMilestones,
    addGoalCheckIn,
    updateGoalNumericValue,
    addVisionBoard,
    updateVisionBoard,
    deleteVisionBoard,
    archiveVisionBoard,
    restoreVisionBoard,
    duplicateVisionBoard,
    togglePinVisionBoardToHome,
    addVisionBoardItem,
    updateVisionBoardItem,
    deleteVisionBoardItem,
    reorderVisionBoardItems,
    moveVisionBoardItem,
    addCustomCategory,
    addTask,
    addHabit,
    addXP,
  } = useApp();

  const search = Route.useSearch();
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const todayStr = todayKey();

  // Main Module Tabs: Goals | Vision Board | Someday Garden
  const [selectedMainTab, setSelectedMainTab] = useState<"goals" | "vision" | "garden">(
    search.tab === "vision" ? "vision" : search.tab === "garden" ? "garden" : "goals"
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(
    search.boardId || null
  );

  // Sync with URL query parameters
  useEffect(() => {
    if (search.tab === "vision") {
      setSelectedMainTab("vision");
    } else if (search.tab === "garden") {
      setSelectedMainTab("garden");
    }
    if (search.boardId) {
      setSelectedBoardId(search.boardId);
    }
  }, [search.tab, search.boardId]);

  // Navigation Tabs: Active, Completed, Archived
  const [activeTab, setActiveTab] = useState<StatusTab>("active");

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter Sheet State
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterFocusOnly, setFilterFocusOnly] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>("All");
  const [filterPaused, setFilterPaused] = useState<"all" | "activeOnly" | "pausedOnly">("all");

  // Active Goal Details View
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // Card Menu Dropdown
  const [menuGoalId, setMenuGoalId] = useState<string | null>(null);

  // Focus Goal Replace Modal
  const [focusConflictGoalId, setFocusConflictGoalId] = useState<string | null>(null);

  // Check-in Drawer
  const [checkInGoalId, setCheckInGoalId] = useState<string | null>(null);
  const [checkInProgress, setCheckInProgress] = useState<number>(50);
  const [checkInWentWell, setCheckInWentWell] = useState("");
  const [checkInChallenge, setCheckInChallenge] = useState("");
  const [checkInNextStep, setCheckInNextStep] = useState("");
  const [checkInNote, setCheckInNote] = useState("");

  // AI Plan Generator Modal
  const [aiModalGoalId, setAiModalGoalId] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    milestones: { title: string; checked: boolean }[];
    nextAction: string;
    habits: { name: string; emoji: string; checked: boolean }[];
    tasks: { title: string; checked: boolean }[];
  } | null>(null);

  // 4-Step Goal Creation / Edit Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Inline milestone add in details view
  const [detailsNewMilestone, setDetailsNewMilestone] = useState("");

  // Auto focus search
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus on click outside (only active when menu is open)
  useEffect(() => {
    if (!menuGoalId) return;
    const handleGlobalClick = () => setMenuGoalId(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [menuGoalId]);

  // Back button overlay dismiss handler
  useEffect(() => {
    if (wizardOpen || editingGoal || activeGoalId || filterOpen || focusConflictGoalId || checkInGoalId || aiModalGoalId || selectedBoardId) {
      (window as any).__onBackOverlayDismiss = () => {
        if (selectedBoardId) {
          setSelectedBoardId(null);
          return true;
        }
        if (aiModalGoalId) {
          setAiModalGoalId(null);
          return true;
        }
        if (checkInGoalId) {
          setCheckInGoalId(null);
          return true;
        }
        if (focusConflictGoalId) {
          setFocusConflictGoalId(null);
          return true;
        }
        if (filterOpen) {
          setFilterOpen(false);
          return true;
        }
        if (wizardOpen || editingGoal) {
          setWizardOpen(false);
          setEditingGoal(null);
          return true;
        }
        if (activeGoalId) {
          setActiveGoalId(null);
          return true;
        }
        return false;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }
  }, [wizardOpen, editingGoal, activeGoalId, filterOpen, focusConflictGoalId, checkInGoalId, aiModalGoalId, selectedBoardId]);

  // Turn a Vision Board item into a canonical goal
  const handleTurnVisionItemIntoGoal = (item: VisionBoardItem) => {
    const goalTitle = item.title || item.content || (isAr ? "هدفي الجديد" : "My New Goal");
    setSelectedMainTab("goals");
    handleOpenWizard({
      id: "",
      title: goalTitle,
      area: "Personal",
      status: "active",
      progressMethod: "milestones",
      progress: 0,
      target: "2027",
    } as Goal);
  };

  // All Life-Area Categories
  const customCategories = state.customCategories || [];
  const allCategories = useMemo(() => {
    const defaultList = DEFAULT_TASK_CATEGORIES.map((c) => ({
      id: c.id,
      labelEn: c.labelEn,
      labelAr: c.labelAr,
      emoji: c.emoji,
      bg: c.bg,
    }));
    const customList = customCategories.map((name) => ({
      id: name,
      labelEn: name,
      labelAr: name,
      emoji: "🌸",
      bg: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800",
    }));
    return [...defaultList, ...customList];
  }, [customCategories]);

  // Filter & Search Logic
  const filterGoal = (g: Goal): boolean => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (g.title || "").toLowerCase().includes(q) || (g.titleAr || "").toLowerCase().includes(q);
      const matchCategory = (g.area || "").toLowerCase().includes(q);
      const matchWhy = (g.why || "").toLowerCase().includes(q);
      const matchNext = (g.nextAction || "").toLowerCase().includes(q);
      const matchNotes = (g.notes || "").toLowerCase().includes(q);
      const matchMilestone = (g.milestones || []).some((m) => (m.title || "").toLowerCase().includes(q));
      if (!matchTitle && !matchCategory && !matchWhy && !matchNext && !matchNotes && !matchMilestone) {
        return false;
      }
    }

    // Category filter
    if (filterCategory !== "All") {
      if (g.area !== filterCategory) return false;
    }

    // Focus only filter
    if (filterFocusOnly && !g.isFocusGoal) {
      return false;
    }

    // Progress Method filter
    if (filterMethod !== "All") {
      if (g.progressMethod !== filterMethod) return false;
    }

    // Paused filter
    if (filterPaused === "activeOnly" && g.status === "paused") return false;
    if (filterPaused === "pausedOnly" && g.status !== "paused") return false;

    return true;
  };

  // Status Tab Grouping
  const activeGoals = useMemo(() => {
    return state.goals.filter((g) => (g.status === "active" || g.status === "paused") && filterGoal(g));
  }, [state.goals, searchQuery, filterCategory, filterFocusOnly, filterMethod, filterPaused]);

  const completedGoals = useMemo(() => {
    return state.goals.filter((g) => (g.status === "completed" || g.progress >= 100) && filterGoal(g));
  }, [state.goals, searchQuery, filterCategory, filterFocusOnly, filterMethod, filterPaused]);

  const archivedGoals = useMemo(() => {
    return state.goals.filter((g) => g.status === "archived" && filterGoal(g));
  }, [state.goals, searchQuery, filterCategory, filterFocusOnly, filterMethod, filterPaused]);

  // Focus Goals (Max 3 Active)
  const focusGoals = useMemo(() => {
    return activeGoals.filter((g) => g.isFocusGoal);
  }, [activeGoals]);

  const otherActiveGoals = useMemo(() => {
    return activeGoals.filter((g) => !g.isFocusGoal);
  }, [activeGoals]);

  const activeFocusCount = useMemo(() => {
    return state.goals.filter((g) => g.status === "active" && g.isFocusGoal).length;
  }, [state.goals]);

  // Overall Progress Calculation:
  // Arithmetic mean of all currently active, non-paused goals.
  // Paused, completed, and archived are excluded.
  const { overallProgress, activeNonPausedCount } = useMemo(() => {
    const activeNonPaused = state.goals.filter((g) => g.status === "active");
    if (activeNonPaused.length === 0) {
      return { overallProgress: 0, activeNonPausedCount: 0 };
    }
    const sum = activeNonPaused.reduce((acc, g) => acc + (g.progress || 0), 0);
    const avg = Math.round(sum / activeNonPaused.length);
    return { overallProgress: Math.min(100, Math.max(0, avg)), activeNonPausedCount: activeNonPaused.length };
  }, [state.goals]);

  // Motivational quote calculation
  const motivationalLine = useMemo(() => {
    if (activeNonPausedCount === 0) {
      return isAr ? "ابدئي فصلاً جديداً وأضيفي هدفكِ الملهم ✨" : "Start your next chapter & add a goal ✨";
    }
    if (overallProgress >= 80) {
      return isAr ? "أنتِ على وشك تحقيق إنجازات عظيمة! فخورة بكِ 🌟" : "You're so close to greatness! Keep shining 🌟";
    }
    if (overallProgress >= 40) {
      return isAr ? "خطواتكِ الصغيرة تبني فصلكِ القادم بكل ثقة ✨" : "Small steps are building your next chapter ✨";
    }
    return isAr ? "البدايات تصنع الفارق.. استمري خطوة بخطوة 🌸" : "Every big journey starts with one mindful step 🌸";
  }, [overallProgress, activeNonPausedCount, isAr]);

  // Open 4-step creation wizard
  const handleOpenWizard = (goalToEdit?: Goal) => {
    setEditingGoal(goalToEdit || null);
    setWizardOpen(true);
  };

  // Toggle Focus with 3 limit check
  const handleToggleFocus = (goalId: string) => {
    const res = toggleGoalFocus(goalId);
    if (!res.ok) {
      setFocusConflictGoalId(goalId);
    }
  };

  // Open Check-in Drawer
  const handleOpenCheckIn = (goal: Goal) => {
    setCheckInGoalId(goal.id);
    setCheckInProgress(goal.progress || 0);
    setCheckInWentWell("");
    setCheckInChallenge("");
    setCheckInNextStep(goal.nextAction || "");
    setCheckInNote("");
  };

  // Save Check-in
  const handleSaveCheckIn = () => {
    if (!checkInGoalId) return;
    addGoalCheckIn(checkInGoalId, {
      date: todayStr,
      progress: checkInProgress,
      wentWell: checkInWentWell.trim() || undefined,
      challenge: checkInChallenge.trim() || undefined,
      nextStep: checkInNextStep.trim() || undefined,
      note: checkInNote.trim() || undefined,
    });
    if (checkInNextStep.trim()) {
      editGoal(checkInGoalId, { nextAction: checkInNextStep.trim() });
    }
    setCheckInGoalId(null);
  };

  // AI Goal Planner Generation
  const handleStartAiPlan = (goal: Goal) => {
    setAiModalGoalId(goal.id);
    setAiGenerating(true);
    setAiSuggestions(null);

    // Simulate smart AI breakdown tailored to the goal
    setTimeout(() => {
      const area = goal.area || "Personal";
      let suggestedMilestones: string[] = [];
      let suggestedHabits: { name: string; emoji: string }[] = [];
      let suggestedTasks: string[] = [];
      let nextStep = "";

      if (area === "Study") {
        suggestedMilestones = [
          isAr ? "إنشاء جدول مراجعة أسبوعي للمواد الصعبة" : "Create weekly study schedule for key topics",
          isAr ? "تلخيص 50% من الفصول والمذكرات الدراسية" : "Summarize 50% of coursework chapters",
          isAr ? "حل 3 اختبارات تجريبية سابقة بتركيز" : "Solve 3 practice exams with high focus",
          isAr ? "المراجعة الشاملة والتجهيز للاختبار النهائي" : "Comprehensive final review session",
        ];
        suggestedHabits = [
          { name: isAr ? "جلسة دراسة مركزة 45 دقيقة يومياً" : "Daily 45-min deep study session", emoji: "📚" },
          { name: isAr ? "مراجعة بطاقات الاستذكار السريعة" : "Flashcard spaced repetition review", emoji: "💡" },
        ];
        suggestedTasks = [
          isAr ? "تحميل مراجع ومذكرات المنهج الجديد" : "Download course slides and syllabus",
          isAr ? "ترتيب مكتب الدراسة وتجهيز الإضاءة" : "Organize study desk & environment",
        ];
        nextStep = isAr ? "تحديد المواد الثلاث الأولى ذات الأولوية" : "Identify the top 3 high-priority modules";
      } else if (area === "Money") {
        suggestedMilestones = [
          isAr ? "حصر وتتبع جميع المصاريف اليومية بدقة" : "Track all daily expenses for 30 days",
          isAr ? "ادخار أول 25% من المبلغ المستهدف" : "Save first 25% of target amount",
          isAr ? "توفير 50% في حساب الاستثمار أو الطوارئ" : "Reach 50% milestone in dedicated fund",
          isAr ? "اكتمال المبلغ المستهدف والاحتفال بالانضباط" : "Reach 100% financial target & celebrate",
        ];
        suggestedHabits = [
          { name: isAr ? "تسجيل المصاريف اليومية قبل النوم" : "Log daily expenses before bed", emoji: "💰" },
          { name: isAr ? "تطبيق قاعدة 24 ساعة قبل الشراء غير الضروري" : "24-hour pause before impulsive buys", emoji: "🧘‍♀️" },
        ];
        suggestedTasks = [
          isAr ? "فتح حساب ادخار فرعي مخصص للهدف" : "Open a dedicated savings sub-account",
          isAr ? "إلغاء الاشتراكات الشهرية غير المستخدمة" : "Audit and cancel unused subscriptions",
        ];
        nextStep = isAr ? "تحويل أول دفعة ادخارية لهذا الأسبوع" : "Transfer this week's savings portion";
      } else if (area === "Work" || area === "Business") {
        suggestedMilestones = [
          isAr ? "دراسة السوق وتحديد الشريحة المستهدفة" : "Conduct customer research & market validation",
          isAr ? "تصميم النموذج الأولي للمنتج أو الخدمة" : "Build minimum viable product or portfolio",
          isAr ? "إطلاق العرض الأول والحصول على أول 5 عملاء" : "Launch initial offer and land first 5 clients",
          isAr ? "تطوير المنظومة ورفع الإيرادات الشهرية" : "Scale operations and monthly revenue",
        ];
        suggestedHabits = [
          { name: isAr ? "جلسة عمل عميق صباحية 60 دقيقة" : "Morning 60-min deep work sprint", emoji: "💻" },
          { name: isAr ? "التواصل مع عميل أو شريك محتمل يومياً" : "Reach out to 1 prospective lead daily", emoji: "🤝" },
        ];
        suggestedTasks = [
          isAr ? "صياغة الرسالة التسويقية والقيمة المضافة" : "Draft core value proposition statement",
          isAr ? "تجهيز صفحة الهبوط أو الحساب المهني" : "Set up professional landing page / profile",
        ];
        nextStep = isAr ? "اعتماد خطة إطلاق النسخة الأولى من المشروع" : "Finalize MVP launch roadmap";
      } else {
        suggestedMilestones = [
          isAr ? "البدء بالخطوة التأسيسية الأولى وتجهيز البيئة" : "Foundation step & set up environment",
          isAr ? "الوصول إلى منتصف الطريق بثبات واستمرارية" : "Reach halfway milestone with consistency",
          isAr ? "تجاوز التحديات وصقل النتائج المحققة" : "Refine results & overcome bottlenecks",
          isAr ? "تحقيق الهدف كاملاً وتوثيق الدروس المستفادة" : "Complete goal & reflect on lessons",
        ];
        suggestedHabits = [
          { name: isAr ? "متابعة التقدم اليومي بامتنان وتفاؤل" : "Mindful daily progress check-in", emoji: "✨" },
          { name: isAr ? "تخصيص 20 دقيقة يومياً لتطوير الذات" : "20 mins daily self-improvement", emoji: "🌸" },
        ];
        suggestedTasks = [
          isAr ? "تدوين خطوات العمل في مفكرة التخطيط" : "Write down action steps in planner",
        ];
        nextStep = isAr ? "إنجاز أول خطوة تنفيذية بسيطة اليوم" : "Execute the first small step today";
      }

      setAiSuggestions({
        milestones: suggestedMilestones.map((title) => ({ title, checked: true })),
        nextAction: nextStep,
        habits: suggestedHabits.map((h) => ({ ...h, checked: true })),
        tasks: suggestedTasks.map((title) => ({ title, checked: true })),
      });
      setAiGenerating(false);
    }, 900);
  };

  // Apply AI Suggestions selectively
  const handleApplyAiSuggestions = (goalId: string) => {
    if (!aiSuggestions) return;

    const targetGoal = state.goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    // 1. Add selected milestones
    const existingTitles = new Set((targetGoal.milestones || []).map((m) => m.title));
    const newMilestones: GoalMilestone[] = [...(targetGoal.milestones || [])];

    aiSuggestions.milestones.forEach((m) => {
      if (m.checked && !existingTitles.has(m.title)) {
        newMilestones.push({
          id: 'm-' + Math.random().toString(36).slice(2, 7),
          title: m.title,
          completed: false,
          weight: 1,
        });
      }
    });

    // 2. Set next action if present
    const updates: Partial<Goal> = {
      milestones: newMilestones,
      progressMethod: "milestones",
    };
    if (aiSuggestions.nextAction && !targetGoal.nextAction) {
      updates.nextAction = aiSuggestions.nextAction;
    }

    editGoal(goalId, updates);

    // 3. Add selected habits
    aiSuggestions.habits.forEach((h) => {
      if (h.checked) {
        addHabit({
          name: h.name,
          emoji: h.emoji,
          category: targetGoal.area,
          trackingType: "check",
          targetValue: 1,
        });
      }
    });

    // 4. Add selected tasks
    aiSuggestions.tasks.forEach((t) => {
      if (t.checked) {
        addTask({
          title: t.title,
          tag: targetGoal.area,
          priority: "medium",
          dueDate: todayStr,
        });
      }
    });

    addXP(30);
    setAiModalGoalId(null);
  };

  // Active Goal for Details View
  const activeGoal = state.goals.find((g) => g.id === activeGoalId);
  const activeVisionBoard = (state.visionBoards || []).find((b) => b.id === selectedBoardId);

  // ════════════════════════════════════════════════════════════════════════════
  // ── RENDER ROOT (SINGLE SHELL FOR INSTANT RESPONSIVE BACK NAVIGATION) ──────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <MobileShell hideHeader={Boolean(wizardOpen || activeGoal || (selectedMainTab === "vision" && activeVisionBoard))}>
      {wizardOpen ? (
        <GoalEditPage
          key={editingGoal ? editingGoal.id : "new-goal-wizard"}
          goal={editingGoal}
          allCategories={allCategories}
          activeFocusCount={activeFocusCount}
          isAr={isAr}
          onSave={(payload) => {
            if (editingGoal) {
              editGoal(editingGoal.id, payload);
            } else {
              addGoal(payload as any);
              addXP(50);
            }
            setWizardOpen(false);
            setEditingGoal(null);
          }}
          onCancel={() => {
            setWizardOpen(false);
            setEditingGoal(null);
          }}
          addCustomCategory={addCustomCategory}
        />
      ) : activeGoal ? (
        <div className="min-h-screen flex flex-col bg-canvas text-ink pb-32 font-sans">
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveGoalId(null);
                }}
                className="cursor-pointer pointer-events-auto touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface border border-border text-ink hover:text-hotpink active:scale-90 transition-all shadow-xs"
                aria-label="Back to Goals List"
              >
                <ArrowLeft size={20} className="rtl:rotate-180" />
              </button>
              <div className="min-w-0">
                <h1 className="text-[17px] font-extrabold text-ink truncate flex items-center gap-1.5">
                  <span>{activeGoal.icon || "🎯"}</span>
                  <span className="truncate">{activeGoal.title}</span>
                </h1>
                <p className="text-[11px] font-semibold text-ink-light truncate">
                  {t(activeGoal.area)} • {activeGoal.target}
                </p>
              </div>
            </div>

            {/* Quick Actions Header: Focus, Edit, Menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleFocus(activeGoal.id)}
                className={cn(
                  "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-90",
                  activeGoal.isFocusGoal
                    ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-xs"
                    : "bg-surface border-border text-ink-light hover:text-amber-500"
                )}
                aria-label="Toggle Focus"
              >
                <Star size={17} className={activeGoal.isFocusGoal ? "fill-amber-500" : ""} />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenWizard(activeGoal);
                }}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink active:scale-90 transition-all"
                aria-label="Edit Goal"
              >
                <Edit2 size={16} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuGoalId(menuGoalId === activeGoal.id ? null : activeGoal.id);
                }}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink active:scale-90 transition-all"
                aria-label="More Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </header>

          {/* Details Body */}
          <main className="flex-1 px-4 py-4 space-y-4 max-w-xl mx-auto w-full">
            {/* 1. Next Action Prominent Banner */}
            {activeGoal.nextAction && (
              <div className="rounded-3xl grad-theme p-4 text-white shadow-sm space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-white/90">
                  <span className="flex items-center gap-1.5">
                    <Zap size={15} className="fill-white" />
                    <span>{isAr ? "الخطوة التنفيذية التالية 🚀" : "Next Action 🚀"}</span>
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {isAr ? "ابدئي بها الآن" : "Start Now"}
                  </span>
                </div>
                <p className="text-[15px] font-black leading-snug">{activeGoal.nextAction}</p>
              </div>
            )}

            {/* 2. Overview Progress Ring & Status */}
            <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm text-center space-y-3">
              <div className="flex justify-center">
                <ProgressRing
                  value={activeGoal.progress}
                  size={120}
                  stroke={10}
                  label={activeGoal.progress + '%'}
                />
              </div>

              <div>
                <h2 className="text-xl font-black text-ink">{activeGoal.title}</h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <PillTag>{t(activeGoal.area)}</PillTag>
                  <span className="text-xs font-bold text-ink-light flex items-center gap-1">
                    <Calendar size={13} className="text-hotpink" />
                    <span>{activeGoal.target}</span>
                  </span>
                  {activeGoal.status === "paused" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {isAr ? "متوقف مؤقتاً" : "Paused"}
                    </span>
                  )}
                  {activeGoal.isFocusGoal && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                      <Star size={11} className="fill-amber-500" />
                      <span>{isAr ? "هدف أساسي" : "Focus Goal"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Why This Matters Card */}
            {(activeGoal.why || activeGoal.successVision) && (
              <div className="rounded-3xl bg-card border border-border/80 p-4.5 shadow-xs space-y-3">
                {activeGoal.why && (
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-500" />
                      <span>{isAr ? "لماذا يهمكِ هذا الهدف؟" : "Why this matters to you"}</span>
                    </span>
                    <p className="text-xs font-semibold text-ink leading-relaxed bg-surface p-3 rounded-2xl border border-border/60">
                      {activeGoal.why}
                    </p>
                  </div>
                )}
                {activeGoal.successVision && (
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>{isAr ? "رؤية النجاح والاحتفال:" : "Vision of Success"}</span>
                    </span>
                    <p className="text-xs font-semibold text-ink leading-relaxed bg-surface p-3 rounded-2xl border border-border/60">
                      {activeGoal.successVision}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 4. Interactive Progress Tracking Method View */}
            <div className="rounded-3xl bg-card border border-border/80 p-4.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-teal-500" />
                  <span>
                    {activeGoal.progressMethod === "milestones"
                      ? isAr
                        ? "المحطات والخطوات الرئيسية"
                        : "Milestones Checklist"
                      : activeGoal.progressMethod === "numeric"
                      ? isAr
                        ? "القيمة الرقمية المستهدفة"
                        : "Numeric Target"
                      : isAr
                      ? "تحديث نسبة الإنجاز"
                      : "Progress Slider"}
                  </span>
                </span>
                <span className="font-mono text-sm font-black text-hotpink">{activeGoal.progress}%</span>
              </div>

              {/* Milestones Checklist */}
              {activeGoal.progressMethod === "milestones" && (
                <div className="space-y-2">
                  {(activeGoal.milestones || []).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2.5 rounded-2xl bg-surface border border-border/70 p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => toggleGoalMilestone(activeGoal.id, m.id)}
                          className="h-5 w-5 rounded-md accent-hotpink cursor-pointer shrink-0"
                        />
                        <span
                          className={cn(
                            "text-xs font-bold text-ink truncate leading-tight",
                            m.completed && "line-through text-ink-light"
                          )}
                        >
                          {m.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGoalMilestone(activeGoal.id, m.id)}
                        className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                        aria-label="Remove milestone"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={detailsNewMilestone}
                      onChange={(e) => setDetailsNewMilestone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && detailsNewMilestone.trim()) {
                          e.preventDefault();
                          addGoalMilestone(activeGoal.id, { title: detailsNewMilestone.trim() });
                          setDetailsNewMilestone("");
                        }
                      }}
                      placeholder={isAr ? "+ أضيفي محطة رئيسية جديدة..." : "+ Add new milestone..."}
                      className="flex-1 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (detailsNewMilestone.trim()) {
                          addGoalMilestone(activeGoal.id, { title: detailsNewMilestone.trim() });
                          setDetailsNewMilestone("");
                        }
                      }}
                      className="cursor-pointer rounded-2xl grad-theme px-3.5 py-2.5 text-xs font-bold text-white shadow-xs"
                    >
                      {isAr ? "إضافة" : "Add"}
                    </button>
                  </div>
                </div>
              )}

              {/* Numeric Target Steppers */}
              {activeGoal.progressMethod === "numeric" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-surface p-3.5 rounded-2xl border border-border">
                    <button
                      type="button"
                      onClick={() => {
                        const step = 100;
                        const nextVal = Math.max(
                          activeGoal.startingValue || 0,
                          (activeGoal.currentValue || 0) - step
                        );
                        updateGoalNumericValue(activeGoal.id, nextVal);
                      }}
                      className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-ink font-mono font-bold active:scale-95"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <span className="font-mono text-xl font-black text-ink">
                        {(activeGoal.currentValue || 0).toLocaleString()}{" "}
                        <span className="text-xs font-bold text-hotpink">{activeGoal.unit || "SAR"}</span>
                      </span>
                      <p className="text-[11px] font-semibold text-ink-light">
                        {isAr ? 'من أصل ' + (activeGoal.targetValue || 100).toLocaleString() : 'out of ' + (activeGoal.targetValue || 100).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const step = 100;
                        const nextVal = Math.min(
                          activeGoal.targetValue || 1000,
                          (activeGoal.currentValue || 0) + step
                        );
                        updateGoalNumericValue(activeGoal.id, nextVal);
                      }}
                      className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl grad-theme text-white font-mono font-bold active:scale-95 shadow-xs"
                    >
                      +
                    </button>
                  </div>
                  <ProgressBar value={activeGoal.progress} className="h-3" barClass="grad-theme" />
                </div>
              )}

              {/* Manual Progress Slider */}
              {activeGoal.progressMethod === "manual" && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeGoal.progress}
                    onChange={(e) => updateGoalProgress(activeGoal.id, Number(e.target.value))}
                    className="w-full accent-hotpink cursor-pointer h-2.5 bg-ghost rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-ink-light">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. AYXA AI Goal Breakdown Plan Button */}
            <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/20 p-4.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-hotpink" />
                  <span>{isAr ? "مساعد التخطيط الذكي AYXA AI ✨" : "AYXA AI Goal Planner ✨"}</span>
                </span>
                <span className="text-[10px] font-bold bg-white/70 dark:bg-black/40 px-2 py-0.5 rounded-full text-purple-700 dark:text-purple-300">
                  {isAr ? "تقسيم واقتراح خطة" : "Breakdown Plan"}
                </span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                {isAr
                  ? "حوّلي هذا الهدف تلقائياً إلى محطات إنجاز واضحة، خطوات تنفيذية، وعادات يومية مساندة."
                  : "Automatically break down this goal into clear milestones, next actions, and daily supporting habits."}
              </p>
              <button
                type="button"
                onClick={() => handleStartAiPlan(activeGoal)}
                className="cursor-pointer w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                <span>{isAr ? "✨ حوّلي هذا الهدف إلى خطة" : "✨ Break this goal into a plan"}</span>
              </button>
            </div>

            {/* 6. Check-ins & Reflections Log */}
            <div className="rounded-3xl bg-card border border-border/80 p-4.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
                  <Clock size={15} className="text-purple-500" />
                  <span>{isAr ? "سجل المراجعات الدورية والتأملات" : "Check-in Reflections Log"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenCheckIn(activeGoal)}
                  className="cursor-pointer text-xs font-bold text-hotpink hover:underline"
                >
                  {isAr ? "+ تسجيل مراجعة ✨" : "+ New Check-in ✨"}
                </button>
              </div>

              {(activeGoal.checkIns || []).length === 0 ? (
                <div className="text-center py-4 bg-surface rounded-2xl border border-dashed border-border/80 space-y-1">
                  <p className="text-xs font-bold text-ink-light">
                    {isAr ? "لا توجد مراجعات مسجلة بعد" : "No check-in logs yet"}
                  </p>
                  <p className="text-[11px] text-ink-light/80">
                    {isAr ? "كل خطوة لها أثر. ما خطوتك الصغيرة التالية؟ ✨" : "Every step counts. What is your next small move? ✨"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(activeGoal.checkIns || []).map((ci) => (
                    <div key={ci.id} className="p-3 rounded-2xl bg-surface border border-border/60 space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[11px] font-bold text-ink-light">
                        <span>{ci.date}</span>
                        <span className="font-mono text-hotpink">{ci.progress}%</span>
                      </div>
                      {ci.wentWell && (
                        <p className="text-ink font-medium">
                          <span className="font-bold text-teal-600">✓ {isAr ? "ما سار بشكل جيد: " : "Went well: "}</span>
                          {ci.wentWell}
                        </p>
                      )}
                      {ci.challenge && (
                        <p className="text-ink font-medium">
                          <span className="font-bold text-amber-600">⚠ {isAr ? "التحدي: " : "Challenge: "}</span>
                          {ci.challenge}
                        </p>
                      )}
                      {ci.nextStep && (
                        <p className="text-ink font-medium">
                          <span className="font-bold text-hotpink">→ {isAr ? "الخطوة التالية: " : "Next step: "}</span>
                          {ci.nextStep}
                        </p>
                      )}
                      {ci.note && <p className="text-ink-light italic">{ci.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete / Archive / Delete Action Bar */}
            <div className="pt-2 grid grid-cols-2 gap-2.5">
              {activeGoal.status !== "completed" ? (
                <button
                  type="button"
                  onClick={() => {
                    completeGoal(activeGoal.id);
                    setActiveGoalId(null);
                  }}
                  className="cursor-pointer py-3.5 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>{isAr ? "إكمال الهدف بنجاح 🏆" : "Mark Complete 🏆"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => uncompleteGoal(activeGoal.id)}
                  className="cursor-pointer py-3.5 rounded-2xl bg-surface border border-border text-ink text-xs font-extrabold active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} />
                  <span>{isAr ? "إعادة الهدف للنشطة" : "Reopen Goal"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeGoal.status === "paused") {
                    resumeGoal(activeGoal.id);
                  } else {
                    pauseGoal(activeGoal.id);
                  }
                }}
                className="cursor-pointer py-3.5 rounded-2xl bg-surface border border-border text-ink text-xs font-extrabold hover:bg-muted active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                {activeGoal.status === "paused" ? <Play size={16} /> : <Pause size={16} />}
                <span>{activeGoal.status === "paused" ? (isAr ? "استئناف الهدف" : "Resume Goal") : (isAr ? "إيقاف مؤقت" : "Pause Goal")}</span>
              </button>
            </div>
          </main>
        </div>
      ) : selectedMainTab === "vision" && activeVisionBoard ? (
        <VisionBoardView
          board={activeVisionBoard}
          items={state.visionBoardItems || []}
          goals={state.goals}
          isAr={isAr}
          onBack={() => setSelectedBoardId(null)}
          onUpdateBoard={(updates) => updateVisionBoard(activeVisionBoard.id, updates)}
          onDuplicateBoard={() => {
            const newId = duplicateVisionBoard(activeVisionBoard.id);
            if (newId) setSelectedBoardId(newId);
          }}
          onArchiveBoard={() => {
            archiveVisionBoard(activeVisionBoard.id);
            setSelectedBoardId(null);
          }}
          onDeleteBoard={() => {
            deleteVisionBoard(activeVisionBoard.id);
            setSelectedBoardId(null);
          }}
          onAddItem={(item) => addVisionBoardItem(item)}
          onUpdateItem={(id, updates) => updateVisionBoardItem(id, updates)}
          onDeleteItem={(id) => deleteVisionBoardItem(id)}
          onMoveItem={(itemId, direction) => moveVisionBoardItem(activeVisionBoard.id, itemId, direction)}
          onTurnIntoGoal={handleTurnVisionItemIntoGoal}
        />
      ) : (
        <Screen className="goals-page pb-32 sm:pb-36 min-h-screen bg-canvas text-ink font-sans">
          {/* Top Header with Safe Area, Back Button, Search & Filter & Plus */}
          <header className="sticky top-0 z-30 bg-card border-b border-border/60 px-4 pt-4 pb-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate({ to: "/" });
                  }}
                  className="cursor-pointer pointer-events-auto touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface border border-border text-ink hover:text-hotpink active:scale-90 transition-all shadow-xs"
                  aria-label="Back to Home"
                >
                  <ArrowLeft size={20} className="rtl:rotate-180" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-[19px] font-extrabold text-ink tracking-tight flex items-center gap-1.5 truncate">
                    <span>
                      {selectedMainTab === "vision"
                        ? "🌸"
                        : selectedMainTab === "garden"
                        ? "🌱"
                        : "🎯"}
                    </span>
                    <span>
                      {selectedMainTab === "vision"
                        ? isAr
                          ? "لوحة رؤيتي 🌸"
                          : "Vision Board 🌸"
                        : selectedMainTab === "garden"
                        ? isAr
                          ? "حديقة أمنياتي 🌱"
                          : "Someday Garden 🌱"
                        : isAr
                        ? "أهدافي ✨"
                        : "My Goals ✨"}
                    </span>
                  </h1>
                  <p className="text-[11.5px] font-semibold text-ink-light mt-0.5 truncate">
                    {selectedMainTab === "vision"
                      ? isAr
                        ? "مساحة صغيرة للحياة التي ترغبين في بنائها."
                        : "A little space for the life you want to build."
                      : selectedMainTab === "garden"
                      ? isAr
                        ? "بعض الأمنيات تحتاج مساحة قبل أن تحتاج موعدًا."
                        : "Some dreams need room before they need a deadline."
                      : motivationalLine}
                  </p>
                </div>
              </div>

              {/* Actions: Search, Filter, Add */}
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedMainTab === "goals" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSearchOpen((prev) => !prev)}
                      className={cn(
                        "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95",
                        searchOpen || searchQuery
                          ? "bg-hotpink/10 border-hotpink text-hotpink"
                          : "bg-surface border-border/80 text-ink-light hover:text-ink"
                      )}
                      aria-label="Search"
                    >
                      <Search size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterOpen(true)}
                      className={cn(
                        "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95",
                        filterCategory !== "All" || filterFocusOnly || filterMethod !== "All" || filterPaused !== "all"
                          ? "bg-hotpink/10 border-hotpink text-hotpink"
                          : "bg-surface border-border/80 text-ink-light hover:text-ink"
                      )}
                      aria-label="Filter"
                    >
                      <SlidersHorizontal size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWizard()}
                      className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full grad-theme text-white shadow-xs active:scale-95 transition-all"
                      aria-label="Add Goal"
                    >
                      <Plus size={16} className="stroke-[3]" />
                    </button>
                  </>
                ) : selectedMainTab === "vision" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const newId = addVisionBoard({
                        title: isAr ? "لوحة أحلامي 2027 ✨" : "My 2027 Vision ✨",
                        timeHorizon: "2027",
                        theme: "blossom",
                        layout: "collage",
                      });
                      setSelectedBoardId(newId);
                    }}
                    className="cursor-pointer flex h-9 items-center gap-1 px-3 rounded-full grad-theme text-white text-xs font-black shadow-xs active:scale-95 transition-all"
                    aria-label="New Vision Board"
                  >
                    <Plus size={15} className="stroke-[3]" />
                    <span>{isAr ? "لوحة جديدة" : "New Board"}</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Inline Search Bar when toggled */}
            {selectedMainTab === "goals" && searchOpen && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-hotpink/50 bg-surface px-3 py-1.5 shadow-inner animate-fade-in">
                <Search size={15} className="text-hotpink shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحثي في الأهداف، المحطات، التصنيفات..." : "Search goals, milestones, notes..."}
                  className="flex-1 bg-transparent text-xs font-bold text-ink outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="cursor-pointer text-ink-light hover:text-ink p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Main Module Tabs: Goals 🎯 | Vision Board 🌸 | Someday Garden 🌱 */}
          <div className="px-4 pt-3 pb-1">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-surface border border-border">
              <button
                type="button"
                onClick={() => setSelectedMainTab("goals")}
                className={cn(
                  "cursor-pointer py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1",
                  selectedMainTab === "goals"
                    ? "grad-theme text-white shadow-xs"
                    : "text-ink-light hover:text-ink"
                )}
              >
                <span>🎯</span>
                <span className="truncate">{isAr ? "أهدافي" : "Goals"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMainTab("vision")}
                className={cn(
                  "cursor-pointer py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1",
                  selectedMainTab === "vision"
                    ? "grad-theme text-white shadow-xs"
                    : "text-ink-light hover:text-ink"
                )}
              >
                <span>🌸</span>
                <span className="truncate">{isAr ? "الرؤية" : "Vision"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMainTab("garden")}
                className={cn(
                  "cursor-pointer py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1",
                  selectedMainTab === "garden"
                    ? "grad-theme text-white shadow-xs"
                    : "text-ink-light hover:text-ink"
                )}
              >
                <span>🌱</span>
                <span className="truncate">{isAr ? "حديقتي" : "Garden"}</span>
              </button>
            </div>
          </div>

          {selectedMainTab === "garden" ? (
            <SomedayGardenTab
              onOpenGoalDetails={(goalId) => {
                setSelectedMainTab("goals");
                setActiveGoalId(goalId);
              }}
            />
          ) : selectedMainTab === "vision" ? (
            <div className="px-4 py-3">
              <VisionBoardCollection
                boards={state.visionBoards || []}
                items={state.visionBoardItems || []}
                isAr={isAr}
                onOpenBoard={(id) => setSelectedBoardId(id)}
                onCreateBoard={(payload) => addVisionBoard(payload)}
                onUpdateBoard={(id, updates) => updateVisionBoard(id, updates)}
                onDuplicateBoard={(id) => duplicateVisionBoard(id)}
                onArchiveBoard={(id) => archiveVisionBoard(id)}
                onRestoreBoard={(id) => restoreVisionBoard(id)}
                onDeleteBoard={(id) => deleteVisionBoard(id)}
                onTogglePin={(id) => togglePinVisionBoardToHome(id)}
              />
            </div>
          ) : (
            <>
              {/* Overall Progress Circular Card */}
              <div className="px-4 pt-4 pb-2">
                <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm text-center space-y-3">
              <div className="flex justify-center">
                <ProgressRing
                  value={overallProgress}
                  size={130}
                  stroke={11}
                  label={overallProgress + '%'}
                  caption={isAr ? "التقدم الإجمالي" : "Overall Progress"}
                />
              </div>

              <div>
                <p className="text-[13px] font-black text-ink">
                  {isAr
                    ? activeNonPausedCount + ' أهداف نشطة • ' + completedGoals.length + ' مكتملة'
                    : activeNonPausedCount + ' active goals • ' + completedGoals.length + ' completed'}
                </p>
                <p className="text-xs font-semibold text-hotpink mt-0.5">
                  {motivationalLine}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Status Tabs: Active, Completed, Archived */}
          <div className="px-4 pt-2 pb-1">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface border border-border">
              {[
                { id: "active", labelAr: 'النشطة (' + activeGoals.length + ')', labelEn: 'Active (' + activeGoals.length + ')' },
                { id: "completed", labelAr: 'المكتملة (' + completedGoals.length + ')', labelEn: 'Completed (' + completedGoals.length + ')' },
                { id: "archived", labelAr: 'المؤرشفة (' + archivedGoals.length + ')', labelEn: 'Archived (' + archivedGoals.length + ')' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as StatusTab)}
                  className={cn(
                    "cursor-pointer py-2 rounded-xl text-xs font-extrabold transition-all text-center",
                    activeTab === tab.id
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink"
                  )}
                >
                  {isAr ? tab.labelAr : tab.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Goals List Content */}
          <div className="px-4 py-3 space-y-4">
            {/* TAB 1: ACTIVE GOALS */}
            {activeTab === "active" && (
              <div className="space-y-4">
                {/* Focus Goals Section ⭐ */}
                {focusGoals.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-ink flex items-center gap-1.5">
                        <Star size={15} className="text-amber-500 fill-amber-500" />
                        <span>{isAr ? "أهدافي الأساسية ⭐" : "My Focus Goals ⭐"}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {activeFocusCount} / 3
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {focusGoals.map((g) => (
                        <GoalCard
                          key={g.id}
                          goal={g}
                          isAr={isAr}
                          t={t}
                          onOpen={() => setActiveGoalId(g.id)}
                          onToggleFocus={() => handleToggleFocus(g.id)}
                          onEdit={() => handleOpenWizard(g)}
                          onComplete={() => completeGoal(g.id)}
                          onPause={() => (g.status === "paused" ? resumeGoal(g.id) : pauseGoal(g.id))}
                          onArchive={() => archiveGoal(g.id)}
                          onDelete={() => removeGoal(g.id)}
                          onCheckIn={() => handleOpenCheckIn(g)}
                          menuOpen={menuGoalId === g.id}
                          setMenuOpen={(val) => setMenuGoalId(val ? g.id : null)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Active Goals Section */}
                <div className="space-y-2.5">
                  {focusGoals.length > 0 && otherActiveGoals.length > 0 && (
                    <span className="text-xs font-black text-ink-light block pt-1">
                      {isAr ? "أهداف نشطة أخرى" : "Other Active Goals"}
                    </span>
                  )}

                  {otherActiveGoals.length > 0 ? (
                    otherActiveGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        isAr={isAr}
                        t={t}
                        onOpen={() => setActiveGoalId(g.id)}
                        onToggleFocus={() => handleToggleFocus(g.id)}
                        onEdit={() => handleOpenWizard(g)}
                        onComplete={() => completeGoal(g.id)}
                        onPause={() => (g.status === "paused" ? resumeGoal(g.id) : pauseGoal(g.id))}
                        onArchive={() => archiveGoal(g.id)}
                        onDelete={() => removeGoal(g.id)}
                        onCheckIn={() => handleOpenCheckIn(g)}
                        menuOpen={menuGoalId === g.id}
                        setMenuOpen={(val) => setMenuGoalId(val ? g.id : null)}
                      />
                    ))
                  ) : focusGoals.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl bg-card border border-dashed border-border p-6 space-y-3">
                      <span className="text-4xl block">🌸</span>
                      <h3 className="text-base font-black text-ink">
                        {isAr ? "فصلكِ القادم يبدأ من هنا ✨" : "Your next chapter starts here ✨"}
                      </h3>
                      <p className="text-xs font-semibold text-ink-light max-w-xs mx-auto">
                        {isAr
                          ? "أنشئي هدفًا وحوّليه إلى خطوات صغيرة قابلة للإنجاز والمتابعة."
                          : "Create a goal and turn it into small achievable steps you can track."}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenWizard()}
                        className="cursor-pointer py-3 px-6 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        <span>{isAr ? "+ أنشئي هدفي الأول" : "+ Create my first goal"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* TAB 2: COMPLETED GOALS */}
            {activeTab === "completed" && (
              <div className="space-y-2.5">
                {completedGoals.length > 0 ? (
                  completedGoals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      isAr={isAr}
                      t={t}
                      onOpen={() => setActiveGoalId(g.id)}
                      onToggleFocus={() => handleToggleFocus(g.id)}
                      onEdit={() => handleOpenWizard(g)}
                      onComplete={() => uncompleteGoal(g.id)}
                      onPause={() => (g.status === "paused" ? resumeGoal(g.id) : pauseGoal(g.id))}
                      onArchive={() => archiveGoal(g.id)}
                      onDelete={() => removeGoal(g.id)}
                      onCheckIn={() => handleOpenCheckIn(g)}
                      menuOpen={menuGoalId === g.id}
                      setMenuOpen={(val) => setMenuGoalId(val ? g.id : null)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 rounded-3xl bg-card border border-dashed border-border p-6 space-y-2">
                    <span className="text-3xl block">🏆</span>
                    <p className="text-xs font-bold text-ink-light">
                      {isAr ? "ستظهر أهدافكِ المكتملة هنا لتتألق إنجازاتكِ ✨" : "Your completed goals will shine here ✨"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ARCHIVED GOALS */}
            {activeTab === "archived" && (
              <div className="space-y-2.5">
                {archivedGoals.length > 0 ? (
                  archivedGoals.map((g) => (
                    <GoalCard
                      key={g.id}
                      goal={g}
                      isAr={isAr}
                      t={t}
                      onOpen={() => setActiveGoalId(g.id)}
                      onToggleFocus={() => handleToggleFocus(g.id)}
                      onEdit={() => handleOpenWizard(g)}
                      onComplete={() => completeGoal(g.id)}
                      onPause={() => restoreGoal(g.id)}
                      onArchive={() => restoreGoal(g.id)}
                      onDelete={() => removeGoal(g.id)}
                      onCheckIn={() => handleOpenCheckIn(g)}
                      menuOpen={menuGoalId === g.id}
                      setMenuOpen={(val) => setMenuGoalId(val ? g.id : null)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 rounded-3xl bg-card border border-dashed border-border p-6 space-y-2">
                    <span className="text-3xl block">📦</span>
                    <p className="text-xs font-bold text-ink-light">
                      {isAr ? "لا توجد أهداف مؤرشفة" : "No archived goals"}
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </>
    )}
  </Screen>
      )}
    </MobileShell>
  );
}