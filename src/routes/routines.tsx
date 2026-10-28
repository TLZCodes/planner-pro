import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PageHeader } from "@/components/kit";
import { RoutineStepEditPage } from "@/components/routines/RoutineStepEditPage";
import { NewRoutineModal } from "@/components/routines/NewRoutineModal";
import { IdealWeekContainer } from "@/components/routines/idealWeek/IdealWeekContainer";
import {
  useApp,
  DEFAULT_ROUTINES,
  type RoutineKey,
  type RoutineStep,
  type UserRoutine,
  type RoutineSectionKey,
  todayKey,
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  calculatePrayerStepTime,
  formatPrayerAnchorLabel,
  type PrayerName,
  type PrayerRelation,
} from "@/lib/prayer";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Clock,
  Sun,
  Moon,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkle,
  Heart,
  BookOpen,
  Zap,
  MoreVertical,
  Play,
  Copy,
  Archive,
  ArrowUp,
  ArrowDown,
  X,
  Compass,
  Bell,
  CheckCheck,
  Pause,
  RefreshCw,
  Award,
  Layers,
  Flame,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/routines")({
  validateSearch: (search: Record<string, unknown>): { key?: string } => {
    return {
      key: typeof search.key === "string" ? search.key : "ideal-day",
    };
  },
  head: () => ({
    meta: [
      { title: "My Routines ✨ — AYXA Planner Pro" },
      {
        name: "description",
        content:
          "Personalize your Ideal Day, Morning, and Evening routines with ready-made templates.",
      },
    ],
  }),
  component: RoutinesScreen,
});

const EMOJI_PALETTE = [
  "🌅",
  "🕌",
  "📿",
  "📖",
  "💧",
  "🛏️",
  "🧴",
  "🥑",
  "📝",
  "🎯",
  "🥗",
  "☕",
  "💻",
  "🏃‍♀️",
  "🛁",
  "🍲",
  "✍️",
  "🧺",
  "📵",
  "🌙",
  "🕯️",
  "👗",
  "📋",
  "☀️",
  "✨",
  "🌸",
  "🤍",
  "🧘‍♀️",
  "🚿",
  "🤲",
  "🧹",
  "🧠",
  "💡",
  "⏱️",
  "🍵",
  "💅",
  "💎",
  "🌸",
];

const SECTION_DEFS: { key: RoutineSectionKey; titleEn: string; titleAr: string; icon: string }[] = [
  { key: "morning", titleEn: "Morning ☀️", titleAr: "الصباح ☀️", icon: "☀️" },
  { key: "day", titleEn: "Day & Focus 📚", titleAr: "النهار والتركيز 📚", icon: "📚" },
  { key: "afternoon", titleEn: "Afternoon 🌿", titleAr: "بعد الظهر 🌿", icon: "🌿" },
  { key: "evening", titleEn: "Evening 🌙", titleAr: "المساء 🌙", icon: "🌙" },
  { key: "night", titleEn: "Night & Sleep 💤", titleAr: "الليل والنوم 💤", icon: "💤" },
];

function RoutinesScreen() {
  const search = useSearch({ from: "/routines" });
  const navigate = useNavigate();
  const {
    state,
    toggleRoutineStep,
    addRoutineStep,
    editRoutineStep,
    removeRoutineStep,
    moveRoutineStepSection,
    duplicateRoutineStep,
    skipRoutineStepForToday,
    reorderRoutineSteps,
    resetRoutineToday,
    restoreRoutineTemplate,
    useRoutineTemplate,
    createUserRoutine,
    duplicateRoutine,
    archiveRoutine,
    deleteCustomRoutine,
  } = useApp();
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [activeKey, setActiveKey] = useState<string>(search.key || "ideal-day");
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Sync activeKey from URL search
  useEffect(() => {
    if (search.key) {
      setActiveKey(search.key);
    }
  }, [search.key]);

  // Section collapse state with session memory
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem("ayxa_routines_collapsed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSectionCollapse = (secKey: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [secKey]: !prev[secKey] };
      try {
        sessionStorage.setItem("ayxa_routines_collapsed", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Modals & Drawers
  const [routineMenuOpen, setRoutineMenuOpen] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);
  const [stepMenuOpenId, setStepMenuOpenId] = useState<string | null>(null);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showGuidedMode, setShowGuidedMode] = useState(false);
  const [guidedStepIndex, setGuidedStepIndex] = useState(0);
  const [guidedTimerSeconds, setGuidedTimerSeconds] = useState<number | null>(null);
  const [guidedTimerActive, setGuidedTimerActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previewTemplateKey, setPreviewTemplateKey] = useState<string | null>(null);

  // Back button overlay dismiss handler
  useEffect(() => {
    if (
      showAddStepModal ||
      editingStep ||
      showNewRoutineModal ||
      showTemplateLibrary ||
      showGuidedMode ||
      previewTemplateKey
    ) {
      (window as any).__onBackOverlayDismiss = () => {
        if (showGuidedMode) {
          setShowGuidedMode(false);
          return true;
        }
        if (showAddStepModal || editingStep) {
          setShowAddStepModal(false);
          setEditingStep(null);
          return true;
        }
        if (showNewRoutineModal) {
          setShowNewRoutineModal(false);
          return true;
        }
        if (showTemplateLibrary || previewTemplateKey) {
          setShowTemplateLibrary(false);
          setPreviewTemplateKey(null);
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
  }, [
    showAddStepModal,
    editingStep,
    showNewRoutineModal,
    showTemplateLibrary,
    showGuidedMode,
    previewTemplateKey,
  ]);

  // Form State: Add/Edit Step
  const [stepName, setStepName] = useState("");
  const [stepEmoji, setStepEmoji] = useState("✨");
  const [stepSection, setStepSection] = useState<RoutineSectionKey>("morning");
  const [stepSchedType, setStepSchedType] = useState<"fixed" | "prayer" | "none">("fixed");
  const [stepFixedTime, setStepFixedTime] = useState("08:00");
  const [stepPrayerName, setStepPrayerName] = useState<PrayerName>("Fajr");
  const [stepPrayerRel, setStepPrayerRel] = useState<PrayerRelation>("at");
  const [stepPrayerOffset, setStepPrayerOffset] = useState(0);
  const [stepDuration, setStepDuration] = useState<number | "">("");
  const [stepReminder, setStepReminder] = useState(false);
  const [stepNotes, setStepNotes] = useState("");
  const [stepActiveDays, setStepActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Form State: Create Complete New Routine
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineNameAr, setNewRoutineNameAr] = useState("");
  const [newRoutineDesc, setNewRoutineDesc] = useState("");
  const [newRoutineEmoji, setNewRoutineEmoji] = useState("🌸");
  const [newRoutineColor, setNewRoutineColor] = useState("from-pink-500 via-rose-500 to-amber-400");

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3200);
  };

  // Find active routine metadata
  const isBuiltIn = !!DEFAULT_ROUTINES[activeKey];
  const customMeta = (state.customRoutines || []).find((cr) => cr.id === activeKey);
  const defaultMeta = DEFAULT_ROUTINES[activeKey] || DEFAULT_ROUTINES["ideal-day"];

  const currentRoutineTitle = customMeta
    ? isAr && customMeta.titleAr
      ? customMeta.titleAr
      : customMeta.titleEn
    : isAr
      ? defaultMeta.titleAr
      : defaultMeta.titleEn;

  const currentRoutineDesc = customMeta
    ? isAr && customMeta.subtitleAr
      ? customMeta.subtitleAr
      : customMeta.subtitleEn || ""
    : isAr
      ? defaultMeta.subtitleAr
      : defaultMeta.subtitleEn;

  const currentRoutineBadge = customMeta
    ? isAr
      ? "روتين مخصص"
      : "CUSTOM PLAN"
    : isAr
      ? defaultMeta.badgeAr
      : defaultMeta.badgeEn;

  const currentRoutineColor =
    customMeta?.color || defaultMeta?.color || "from-pink-500 to-rose-500";

  // Active steps list
  const steps: RoutineStep[] = useMemo(() => {
    return state.routines?.[activeKey] || defaultMeta.steps || [];
  }, [state.routines, activeKey, defaultMeta]);

  const completedCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group steps by section
  const sectionedSteps = useMemo(() => {
    const map: Record<string, RoutineStep[]> = {
      morning: [],
      day: [],
      afternoon: [],
      evening: [],
      night: [],
      other: [],
    };
    steps.forEach((st) => {
      const sec = st.section || "morning";
      if (map[sec]) {
        map[sec].push(st);
      } else {
        map.other.push(st);
      }
    });
    return map;
  }, [steps]);

  // Open Edit Step Modal
  const handleOpenEditStep = (st: RoutineStep) => {
    setEditingStep(st);
    setStepName(isAr && st.titleAr ? st.titleAr : st.title);
    setStepEmoji(st.emoji || "✨");
    setStepSection(st.section || "morning");
    setStepSchedType(st.schedulingType || "fixed");
    setStepFixedTime(st.time || "08:00");
    setStepPrayerName(st.prayerName || "Fajr");
    setStepPrayerRel(st.prayerRelation || "at");
    setStepPrayerOffset(st.prayerOffsetMinutes || 0);
    setStepDuration(st.durationMinutes || "");
    setStepReminder(Boolean(st.reminder));
    setStepNotes(st.notes || "");
    setStepActiveDays(st.activeDays || [0, 1, 2, 3, 4, 5, 6]);
    setStepMenuOpenId(null);
    setShowAddStepModal(true);
  };

  // Open New Step Modal
  const handleOpenAddStep = (presetSection?: RoutineSectionKey) => {
    setEditingStep(null);
    setStepName("");
    setStepEmoji("✨");
    setStepSection(presetSection || "morning");
    setStepSchedType("fixed");
    setStepFixedTime("08:00");
    setStepPrayerName("Fajr");
    setStepPrayerRel("at");
    setStepPrayerOffset(0);
    setStepDuration("");
    setStepReminder(false);
    setStepNotes("");
    setStepActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setShowAddStepModal(true);
  };

  // Save Step (New or Edit)
  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepName.trim()) return;

    let computedTime = stepFixedTime;
    if (stepSchedType === "prayer") {
      computedTime = calculatePrayerStepTime(stepPrayerName, stepPrayerRel, stepPrayerOffset);
    } else if (stepSchedType === "none") {
      computedTime = "--:--";
    }

    const payload: Partial<RoutineStep> & { title: string } = {
      title: stepName.trim(),
      titleAr: stepName.trim(),
      emoji: stepEmoji || "✨",
      section: stepSection,
      schedulingType: stepSchedType,
      time: computedTime,
      prayerName: stepSchedType === "prayer" ? stepPrayerName : undefined,
      prayerRelation: stepSchedType === "prayer" ? stepPrayerRel : undefined,
      prayerOffsetMinutes: stepSchedType === "prayer" ? stepPrayerOffset : undefined,
      durationMinutes:
        typeof stepDuration === "number" && stepDuration > 0 ? stepDuration : undefined,
      reminder: stepReminder,
      notes: stepNotes.trim() || undefined,
      activeDays: stepActiveDays,
    };

    if (editingStep) {
      editRoutineStep(activeKey, editingStep.id, payload);
      showToast(isAr ? "✓ تم تحديث الخطوة بنجاح!" : "✓ Step updated successfully!");
    } else {
      addRoutineStep(activeKey, payload);
      showToast(
        isAr ? "✓ تمت إضافة الخطوة للروتين (+15 XP)!" : "✓ Step added to routine (+15 XP)!",
      );
    }

    setShowAddStepModal(false);
    setEditingStep(null);
  };

  // Create Complete New Routine
  const handleCreateRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;

    const newId = createUserRoutine({
      titleEn: newRoutineName.trim(),
      titleAr: newRoutineNameAr.trim() || newRoutineName.trim(),
      subtitleEn: newRoutineDesc.trim() || "Personal custom routine",
      subtitleAr: newRoutineDesc.trim() || "روتين مخصص منظم",
      color: newRoutineColor,
      icon: newRoutineEmoji,
    });

    setNewRoutineName("");
    setNewRoutineNameAr("");
    setNewRoutineDesc("");
    setShowNewRoutineModal(false);
    setActiveKey(newId);
    navigate({ to: "/routines", search: { key: newId } });
    showToast(
      isAr ? "✓ تم إنشاء روتينكِ الجديد بنجاح (+30 XP)!" : "✓ New routine created (+30 XP)!",
    );
  };

  // Routine ••• Actions
  const handleResetToday = () => {
    setRoutineMenuOpen(false);
    if (
      window.confirm(
        isAr
          ? "هل ترغبين بإعادة ضبط إنجازات هذا الروتين لليوم فقط؟"
          : "Reset today's progress for this routine?",
      )
    ) {
      resetRoutineToday(activeKey);
      showToast(isAr ? "✓ تم إعادة ضبط إنجاز اليوم!" : "✓ Today's routine reset!");
    }
  };

  const handleRestoreTemplate = () => {
    setRoutineMenuOpen(false);
    if (
      window.confirm(
        isAr
          ? "هل ترغبين باستعادة القالب الأصلي الأساسي لهذا الروتين؟"
          : "Restore this routine to its original master template?",
      )
    ) {
      restoreRoutineTemplate(activeKey);
      showToast(isAr ? "✓ تم استعادة القالب الأصلي!" : "✓ Restored to master template!");
    }
  };

  const handleDuplicateRoutine = () => {
    setRoutineMenuOpen(false);
    const newId = duplicateRoutine(activeKey);
    setActiveKey(newId);
    navigate({ to: "/routines", search: { key: newId } });
    showToast(isAr ? "✓ تم تكرار الروتين بنجاح (+20 XP)!" : "✓ Routine duplicated (+20 XP)!");
  };

  const handleArchiveRoutine = () => {
    setRoutineMenuOpen(false);
    archiveRoutine(activeKey);
    showToast(isAr ? "✓ تم تحديث حالة الأرشفة!" : "✓ Routine archive state updated!");
  };

  const handleDeleteRoutine = () => {
    setRoutineMenuOpen(false);
    if (
      window.confirm(
        isAr
          ? "هل أنتِ متأكدة من حذف هذا الروتين نهائياً؟"
          : "Are you sure you want to delete this routine?",
      )
    ) {
      deleteCustomRoutine(activeKey);
      setActiveKey("ideal-day");
      navigate({ to: "/routines", search: { key: "ideal-day" } });
      showToast(isAr ? "✓ تم حذف الروتين المخصص!" : "✓ Custom routine deleted!");
    }
  };

  // Step Move Up / Down
  const handleMoveStep = (stepId: string, direction: "up" | "down") => {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;

    const nextSteps = [...steps];
    const [moved] = nextSteps.splice(idx, 1);
    nextSteps.splice(targetIdx, 0, moved);
    reorderRoutineSteps(activeKey, nextSteps);
  };

  // Start Guided Routine Mode
  const handleStartGuided = () => {
    if (steps.length === 0) return;
    const firstIncomplete = steps.findIndex((s) => !s.done);
    const startIndex = firstIncomplete >= 0 ? firstIncomplete : 0;
    setGuidedStepIndex(startIndex);
    const st = steps[startIndex];
    if (st && st.durationMinutes) {
      setGuidedTimerSeconds(st.durationMinutes * 60);
      setGuidedTimerActive(false);
    } else {
      setGuidedTimerSeconds(null);
      setGuidedTimerActive(false);
    }
    setShowGuidedMode(true);
  };

  // Guided Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (guidedTimerActive && guidedTimerSeconds !== null && guidedTimerSeconds > 0) {
      interval = setInterval(() => {
        setGuidedTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [guidedTimerActive, guidedTimerSeconds]);

  // Handle Guided step navigation
  const handleGuidedNext = () => {
    if (guidedStepIndex < steps.length - 1) {
      const nextIdx = guidedStepIndex + 1;
      setGuidedStepIndex(nextIdx);
      const nextSt = steps[nextIdx];
      if (nextSt && nextSt.durationMinutes) {
        setGuidedTimerSeconds(nextSt.durationMinutes * 60);
        setGuidedTimerActive(false);
      } else {
        setGuidedTimerSeconds(null);
        setGuidedTimerActive(false);
      }
    } else {
      setShowGuidedMode(false);
      setShowCelebration(true);
    }
  };

  const handleGuidedPrev = () => {
    if (guidedStepIndex > 0) {
      const prevIdx = guidedStepIndex - 1;
      setGuidedStepIndex(prevIdx);
      const prevSt = steps[prevIdx];
      if (prevSt && prevSt.durationMinutes) {
        setGuidedTimerSeconds(prevSt.durationMinutes * 60);
        setGuidedTimerActive(false);
      } else {
        setGuidedTimerSeconds(null);
        setGuidedTimerActive(false);
      }
    }
  };

  const handleGuidedDone = () => {
    const curSt = steps[guidedStepIndex];
    if (curSt) {
      if (!curSt.done) {
        toggleRoutineStep(activeKey, curSt.id);
      }
    }
    handleGuidedNext();
  };

  const handleGuidedSkip = () => {
    const curSt = steps[guidedStepIndex];
    if (curSt) {
      skipRoutineStepForToday(activeKey, curSt.id);
    }
    handleGuidedNext();
  };

  // Main Scrollable Tabs
  const MAIN_TABS = [
    { key: "ideal-day", labelAr: "اليوم المثالي ✨", labelEn: "Ideal Day ✨", icon: Star },
    { key: "ideal-week", labelAr: "أسبوعي المثالي 🌸", labelEn: "Ideal Week 🌸", icon: Calendar },
    { key: "morning", labelAr: "الصباح ☀️", labelEn: "Morning ☀️", icon: Sun },
    { key: "evening", labelAr: "المساء 🌙", labelEn: "Evening 🌙", icon: Moon },
    { key: "my-routines", labelAr: "روتيناتي 💗", labelEn: "My Routines 💗", icon: Heart },
  ];

  const userCustomRoutines = state.customRoutines || [];

  return (
    <MobileShell
      
    >
      {showAddStepModal || Boolean(editingStep) ? (
        <RoutineStepEditPage
          step={editingStep}
          isAr={isAr}
          onSave={(payload) => {
            if (editingStep) {
              editRoutineStep(activeKey, editingStep.id, payload);
              showToast(isAr ? "تم تحديث الخطوة بنجاح ✨" : "Step updated ✨");
            } else {
              addRoutineStep(activeKey, payload as any);
              showToast(isAr ? "تمت إضافة الخطوة للروتين ✨" : "Step added ✨");
            }
            setShowAddStepModal(false);
            setEditingStep(null);
          }}
          onCancel={() => {
            setShowAddStepModal(false);
            setEditingStep(null);
          }}
        />
      ) : showGuidedMode && steps[guidedStepIndex] ? (
        <div className="min-h-screen flex flex-col bg-canvas text-ink pb-8 animate-fade-in font-sans">
          {/* Top Bar: Title, Step Count & Exit */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
                {isAr ? "الوضع الموجه خطوة بخطوة ✨" : "Guided Routine Mode ✨"}
              </span>
              <h3 className="text-[16px] font-black text-ink">{currentRoutineTitle}</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowGuidedMode(false)}
              className="cursor-pointer flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-bold text-ink hover:text-rose-500 active:scale-95"
            >
              <X className="h-4 w-4" />
              <span>{isAr ? "خروج" : "Exit"}</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="px-5 pt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-ink-light">
              <span className="font-extrabold text-ink">
                {isAr
                  ? `الخطوة الحالية: ${guidedStepIndex + 1} من ${steps.length}`
                  : `Current Step: ${guidedStepIndex + 1} of ${steps.length}`}
              </span>
              <span className="text-[11.5px] text-hotpink font-black">
                {isAr
                  ? `${completedCount} من ${steps.length} مكتملة (${completionPct}%)`
                  : `${completedCount} of ${steps.length} completed (${completionPct}%)`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden border border-border/80 p-0.5">
              <div
                className="h-full rounded-full grad-theme transition-all duration-500 shadow-xs"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Center: Current Step Focus Card */}
          <div className="flex-1 flex items-center justify-center p-5">
            {(() => {
              const curSt = steps[guidedStepIndex];
              return (
                <div className="w-full max-w-md rounded-3xl bg-card border-2 border-hotpink/40 p-6 text-center space-y-4 shadow-rose-md animate-scale-up">
                  <span className="text-5xl block animate-bounce-soft">{curSt.emoji || "✨"}</span>

                  <div>
                    <span className="text-xs font-extrabold text-hotpink bg-hotpink/10 px-3 py-1 rounded-full border border-hotpink/20 inline-block mb-1.5">
                      {curSt.time}
                    </span>
                    <h2 className="text-[22px] font-black text-ink">
                      {isAr && curSt.titleAr ? curSt.titleAr : curSt.title}
                    </h2>
                  </div>

                  {/* Timer Countdown if duration is set */}
                  {guidedTimerSeconds !== null && (
                    <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center space-y-2">
                      <span className="text-3xl font-mono font-black text-hotpink">
                        {Math.floor(guidedTimerSeconds / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(guidedTimerSeconds % 60).toString().padStart(2, "0")}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setGuidedTimerActive(!guidedTimerActive)}
                          className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 rounded-xl grad-theme text-white text-xs font-bold"
                        >
                          {guidedTimerActive ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {guidedTimerActive
                              ? isAr
                                ? "إيقاف"
                                : "Pause"
                              : isAr
                                ? "بدء المؤقت"
                                : "Start Timer"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGuidedTimerActive(false);
                            if (curSt.durationMinutes)
                              setGuidedTimerSeconds(curSt.durationMinutes * 60);
                          }}
                          className="cursor-pointer p-1.5 rounded-xl bg-card border border-border text-ink-light hover:text-ink"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {curSt.notes && (
                    <p className="text-xs text-ink-light bg-surface p-3 rounded-xl border border-border/60">
                      {curSt.notes}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Bottom Actions Bar */}
          <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-2 shadow-lg">
            <button
              type="button"
              onClick={handleGuidedPrev}
              disabled={guidedStepIndex === 0}
              className="cursor-pointer px-4 py-3.5 rounded-2xl bg-surface border border-border text-ink font-bold text-xs disabled:opacity-30 active:scale-95"
            >
              {isAr ? "السابق" : "Previous"}
            </button>

            <button
              type="button"
              onClick={handleGuidedSkip}
              className="cursor-pointer px-3.5 py-3.5 rounded-2xl bg-surface text-amber-600 border border-amber-200 dark:border-amber-900 font-bold text-xs active:scale-95"
            >
              {isAr ? "تخطي" : "Skip"}
            </button>

            <button
              type="button"
              onClick={handleGuidedDone}
              className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white font-black text-sm shadow-rose-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>{isAr ? "تم ✓ (+10 XP)" : "Done ✓ (+10 XP)"}</span>
            </button>

            <button
              type="button"
              onClick={handleGuidedNext}
              className="cursor-pointer px-4 py-3.5 rounded-2xl bg-surface border border-border text-ink font-bold text-xs active:scale-95"
            >
              {isAr ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <Screen>
          {/* TOP HEADER */}
          <PageHeader
            title={isAr ? "روتيناتي اليومية ✨" : "My Routines ✨"}
            showBack={true}
            fallbackUrl="/"
            right={
              <div className="flex items-center gap-1.5">
                {/* Pink + Button to Create Complete Routine */}
                <button
                  type="button"
                  onClick={() => setShowNewRoutineModal(true)}
                  title={isAr ? "إنشاء روتين جديد" : "Create new routine"}
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full grad-theme text-white shadow-rose-sm active:scale-90 transition-transform"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                </button>

                {/* Selected Routine ••• Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoutineMenuOpen(!routineMenuOpen)}
                    title={isAr ? "خيارات الروتين" : "Routine options"}
                    className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/80 text-ink hover:text-hotpink hover:bg-surface transition-colors shadow-xs"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {routineMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setRoutineMenuOpen(false)}
                      />
                      <div
                        className={cn(
                          "absolute top-10 z-50 w-52 rounded-2xl bg-card border border-border/80 p-1.5 shadow-xl animate-fade-in text-[13px] font-bold text-ink space-y-0.5",
                          isAr ? "left-0" : "right-0",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setRoutineMenuOpen(false);
                            setShowNewRoutineModal(true);
                          }}
                          className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface text-ink transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-hotpink" />
                          <span>{isAr ? "تعديل الروتين" : "Edit Routine"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDuplicateRoutine}
                          className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface text-ink transition-colors"
                        >
                          <Copy className="h-4 w-4 text-purple-500" />
                          <span>{isAr ? "تكرار الروتين" : "Duplicate"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetToday}
                          className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface text-amber-600 dark:text-amber-400 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-amber-500" />
                          <span>{isAr ? "إعادة ضبط اليوم" : "Reset Today"}</span>
                        </button>

                        {isBuiltIn && (
                          <button
                            type="button"
                            onClick={handleRestoreTemplate}
                            className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface text-ink-light transition-colors"
                          >
                            <RefreshCw className="h-4 w-4 text-teal-500" />
                            <span>{isAr ? "استعادة القالب الأصلي" : "Restore to Template"}</span>
                          </button>
                        )}

                        {!isBuiltIn && (
                          <>
                            <button
                              type="button"
                              onClick={handleArchiveRoutine}
                              className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface text-ink-light transition-colors"
                            >
                              <Archive className="h-4 w-4 text-slate-500" />
                              <span>{isAr ? "أرشفة الروتين" : "Archive Routine"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDeleteRoutine}
                              className="cursor-pointer flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                              <span>{isAr ? "حذف الروتين" : "Delete Routine"}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            }
          />

          <main className="px-4 pt-2 pb-32 sm:pb-36 space-y-4">
            {/* TOAST NOTICE */}
            {toastNotice && (
              <div className="animate-fade-in p-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-[13px] text-center shadow-rose-md flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{toastNotice}</span>
              </div>
            )}

            {/* MAIN 4 HORIZONTALLY SCROLLABLE TABS */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {MAIN_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected =
                  activeKey === tab.key ||
                  (tab.key === "my-routines" &&
                    (activeKey.startsWith("custom-routine-") ||
                      activeKey.startsWith("bundle-") ||
                      activeKey === "friday" ||
                      activeKey === "study" ||
                      activeKey === "reset-day"));
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      if (tab.key === "my-routines") {
                        const target = userCustomRoutines[0]?.id || "bundle-reset";
                        setActiveKey(target);
                        navigate({ to: "/routines", search: { key: target } });
                      } else {
                        setActiveKey(tab.key);
                        navigate({ to: "/routines", search: { key: tab.key } });
                      }
                    }}
                    className={cn(
                      "cursor-pointer shrink-0 py-2.5 px-4 rounded-2xl text-[13px] font-bold border transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      isSelected
                        ? "grad-theme text-white border-transparent shadow-rose-sm scale-102 font-extrabold"
                        : "bg-card text-ink hover:bg-surface border-border/80",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}

              {/* Ready-Made Routines Library Trigger Pill */}
              <button
                type="button"
                onClick={() => setShowTemplateLibrary(true)}
                className="cursor-pointer shrink-0 py-2.5 px-3.5 rounded-2xl text-[12.5px] font-extrabold bg-pink-50 dark:bg-pink-950/40 text-hotpink border border-hotpink/30 hover:bg-pink-100 transition-colors flex items-center gap-1.5"
              >
                <Compass className="h-4 w-4" />
                <span>{isAr ? "اكتشفي الجاهزة ✨" : "Explore Library ✨"}</span>
              </button>
            </div>

            {/* SECONDARY PILLS FOR CUSTOM ROUTINES IF IN MY ROUTINES TAB */}
            {(activeKey.startsWith("custom-routine-") ||
              activeKey.startsWith("bundle-") ||
              activeKey === "friday" ||
              activeKey === "study" ||
              activeKey === "reset-day") && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto py-1 animate-fade-in border-t border-border/40 pt-2">
                <span className="text-[11px] font-extrabold text-ink-light self-center px-1 shrink-0">
                  {isAr ? "باقاتي:" : "Routines:"}
                </span>
                {[
                  { id: "bundle-reset", nameAr: "🌸 ضبط الحياة", nameEn: "🌸 Life Reset" },
                  { id: "bundle-spiritual", nameAr: "🤍 التقرب لله", nameEn: "🤍 Faith Wird" },
                  { id: "bundle-glow", nameAr: "💅 العناية", nameEn: "💅 Glow-Up" },
                  { id: "bundle-growth", nameAr: "📚 نمو الذات", nameEn: "📚 Growth" },
                  { id: "friday", nameAr: "🕌 الجمعة", nameEn: "🕌 Friday" },
                  { id: "study", nameAr: "📖 الدراسة", nameEn: "📖 Study" },
                  { id: "reset-day", nameAr: "✨ تجديد الطاقة", nameEn: "✨ Reset Day" },
                  ...userCustomRoutines.map((cr) => ({
                    id: cr.id,
                    nameAr: cr.titleAr || cr.titleEn,
                    nameEn: cr.titleEn,
                  })),
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setActiveKey(sub.id);
                      navigate({ to: "/routines", search: { key: sub.id } });
                    }}
                    className={cn(
                      "cursor-pointer shrink-0 py-1.5 px-3 rounded-xl text-[11.5px] font-bold border transition-all",
                      activeKey === sub.id
                        ? "bg-hotpink text-white border-transparent shadow-xs"
                        : "bg-surface text-ink hover:bg-card border-border",
                    )}
                  >
                    {isAr ? sub.nameAr : sub.nameEn}
                  </button>
                ))}
              </div>
            )}

            {/* IDEAL WEEK STUDIO OR DAILY ROUTINES VIEW */}
            {activeKey === "ideal-week" ? (
              <IdealWeekContainer />
            ) : (
              <>
                {/* GRADIENT HERO BANNER CARD */}
                <section
                  className={cn(
                    "relative overflow-hidden rounded-3xl p-5 text-white shadow-rose-md bg-gradient-to-br",
                    currentRoutineColor,
                  )}
                >
              <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-xl" />
              <span className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-300/20 blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-widest text-pink-100 block">
                      {currentRoutineBadge}
                    </span>
                    <h1 className="text-[21px] font-black tracking-tight mt-0.5 flex items-center gap-1.5 font-display">
                      <span>{currentRoutineTitle}</span>
                      <Sparkle className="h-4 w-4 text-amber-300 fill-amber-300" />
                    </h1>
                    <p className="text-[12.5px] text-pink-50 font-medium mt-0.5">
                      {currentRoutineDesc}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[26px] font-black text-white leading-none block">
                      {completionPct}%
                    </span>
                    <span className="text-[10px] font-bold text-pink-100 uppercase">
                      {isAr ? "مكتمل" : "Done"}
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR & STATS */}
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-pink-100 mb-1.5">
                    <span>{isAr ? "الخطوات المنجزة لليوم" : "Steps Completed Today"}</span>
                    <span className="font-extrabold text-white text-[13px]">
                      {isAr
                        ? `${completedCount} من ${totalCount} مكتملة`
                        : `${completedCount} of ${totalCount} completed`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/25 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>

                {/* MOTIVATIONAL QUOTE & CTA BUTTON */}
                <div className="mt-3.5 flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11.5px] text-pink-100 font-medium truncate">
                    {isAr
                      ? "♡ يومٌ إضافي في رحلة الوصول لأفضل نسخة منكِ"
                      : "♡ One more day of becoming her"}
                  </span>

                  <button
                    type="button"
                    onClick={handleStartGuided}
                    disabled={totalCount === 0}
                    className={cn(
                      "cursor-pointer shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-[12.5px] transition-all active:scale-95 shadow-md",
                      completionPct === 100
                        ? "bg-emerald-400 text-emerald-950"
                        : "bg-white text-ink hover:bg-pink-50",
                    )}
                  >
                    {completionPct === 100 ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>{isAr ? "اكتمل الروتين ✓" : "Routine Complete ✓"}</span>
                      </>
                    ) : completedCount > 0 ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isAr ? "تابعي الروتين ✨" : "Continue Routine ✨"}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isAr ? "ابدئي الروتين ✨" : "Start Routine ✨"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* TIMELINE ACTION BAR: TITLE & + ADD STEP */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-hotpink" />
                <span>{isAr ? "الجدول الزمني للخطوات" : "Routine Timeline & Steps"}</span>
              </h2>

              <button
                type="button"
                onClick={() => handleOpenAddStep()}
                className="cursor-pointer flex items-center gap-1.5 text-[12px] font-extrabold grad-theme text-white px-3.5 py-1.5 rounded-full shadow-rose-sm active:scale-95 transition-transform"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>{isAr ? "إضافة خطوة" : "Add Step"}</span>
              </button>
            </div>

            {/* TIMELINE STEPS ORGANIZED INTO COLLAPSIBLE SECTIONS */}
            {steps.length === 0 ? (
              <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-3 shadow-xs">
                <span className="text-3xl block">🌸</span>
                <p className="text-[14px] font-bold text-ink">
                  {isAr ? "لا توجد خطوات في هذا الروتين حالياً" : "No steps in this routine yet."}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenAddStep()}
                    className="cursor-pointer px-4 py-2 rounded-xl grad-theme text-white font-bold text-xs shadow-rose-sm"
                  >
                    {isAr ? "+ إضافة خطوة جديدة" : "+ Add New Step"}
                  </button>
                  {isBuiltIn && (
                    <button
                      type="button"
                      onClick={handleRestoreTemplate}
                      className="cursor-pointer px-4 py-2 rounded-xl bg-surface border border-border text-ink font-bold text-xs"
                    >
                      {isAr ? "استعادة القالب الأصلي" : "Restore template"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {SECTION_DEFS.map((sec) => {
                  const secSteps = sectionedSteps[sec.key] || [];
                  if (secSteps.length === 0) return null;

                  const secDone = secSteps.filter((s) => s.done).length;
                  const isCollapsed = Boolean(collapsedSections[sec.key]);

                  return (
                    <section key={sec.key} className="space-y-2">
                      {/* Collapsible Section Header */}
                      <div
                        onClick={() => toggleSectionCollapse(sec.key)}
                        className="cursor-pointer flex items-center justify-between bg-surface/80 hover:bg-surface border border-border/70 px-3.5 py-2 rounded-2xl transition-colors select-none group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sec.icon}</span>
                          <span className="text-[13.5px] font-extrabold text-ink">
                            {isAr ? sec.titleAr : sec.titleEn}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-hotpink">
                            {secDone}/{secSteps.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-ink-light group-hover:text-hotpink transition-colors">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddStep(sec.key);
                            }}
                            title={isAr ? "إضافة خطوة لهذا القسم" : "Add step to this section"}
                            className="cursor-pointer p-1 rounded-lg hover:bg-card text-ink-light hover:text-hotpink"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isCollapsed && (isAr ? "rotate-90" : "-rotate-90"),
                            )}
                          />
                        </div>
                      </div>

                      {/* Section Step Cards */}
                      {!isCollapsed && (
                        <div className="space-y-2 animate-fade-in">
                          {secSteps.map((step) => {
                            const isDone = !!step.done;
                            const isMenuOpen = stepMenuOpenId === step.id;

                            let displayTimeBadge = step.time || "08:00";
                            if (step.schedulingType === "prayer" && step.prayerName) {
                              displayTimeBadge = formatPrayerAnchorLabel(
                                step.prayerName,
                                step.prayerRelation,
                                step.prayerOffsetMinutes,
                                isAr,
                              );
                            } else if (step.schedulingType === "none") {
                              displayTimeBadge = isAr ? "أي وقت ✨" : "Anytime ✨";
                            }

                            return (
                              <div
                                key={step.id}
                                className={cn(
                                  "group relative rounded-2xl bg-card p-3 shadow-xs border transition-all duration-200 flex items-center justify-between gap-3",
                                  isDone
                                    ? "bg-pink-50/40 dark:bg-pink-950/20 border-hotpink/30 opacity-75"
                                    : "border-border/80 hover:border-hotpink/40",
                                )}
                              >
                                {/* Left: Checkbox & Step Details */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleRoutineStep(activeKey, step.id);
                                    }}
                                    aria-label="Toggle step"
                                    className={cn(
                                      "cursor-pointer flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg border-2 transition-all active:scale-90",
                                      isDone
                                        ? "grad-theme border-transparent text-white shadow-xs"
                                        : "border-border text-transparent bg-surface hover:border-hotpink/60",
                                    )}
                                  >
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  </button>

                                  {/* Time or Prayer Anchor Badge */}
                                  <span className="text-[11.5px] font-extrabold text-hotpink bg-hotpink/10 px-2 py-0.5 rounded-lg border border-hotpink/20 shrink-0 max-w-[120px] truncate">
                                    {displayTimeBadge}
                                  </span>

                                  {/* Title & Emoji */}
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span className="text-lg shrink-0">{step.emoji || "✨"}</span>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={cn(
                                          "text-[13.5px] font-bold text-ink leading-snug line-clamp-2 break-words",
                                          isDone && "line-through text-ink-light",
                                        )}
                                      >
                                        {isAr && step.titleAr ? step.titleAr : step.title}
                                      </p>
                                      {step.durationMinutes && (
                                        <span className="text-[10px] font-bold text-ink-light flex items-center gap-1 mt-0.5">
                                          <span>
                                            ⏱️ {step.durationMinutes} {isAr ? "د" : "min"}
                                          </span>
                                          {step.reminder && (
                                            <Bell className="h-2.5 w-2.5 text-amber-500" />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Quick Move & Step ••• Overflow Menu */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {/* Move Up/Down Controls */}
                                  <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveStep(step.id, "up")}
                                      title={isAr ? "تحريك لأعلى" : "Move up"}
                                      className="cursor-pointer p-0.5 text-ink-light hover:text-hotpink"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveStep(step.id, "down")}
                                      title={isAr ? "تحريك لأسفل" : "Move down"}
                                      className="cursor-pointer p-0.5 text-ink-light hover:text-hotpink"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Step ••• Overflow Button */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setStepMenuOpenId(isMenuOpen ? null : step.id)}
                                      title={isAr ? "خيارات الخطوة" : "Step options"}
                                      className="cursor-pointer p-1.5 rounded-lg text-ink-light hover:text-hotpink hover:bg-surface transition-colors"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {isMenuOpen && (
                                      <div
                                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setStepMenuOpenId(null);
                                        }}
                                      >
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border-t sm:border border-border/80 p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl space-y-2 animate-slide-up text-ink font-sans max-h-[85vh] overflow-y-auto overscroll-contain"
                                        >
                                          <div className="w-12 h-1.5 bg-border rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

                                          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
                                            <span className="text-sm font-extrabold truncate max-w-[280px] text-ink">
                                              {isAr && step.titleAr ? step.titleAr : step.title}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => setStepMenuOpenId(null)}
                                              className="cursor-pointer p-1.5 rounded-full bg-surface text-ink-light hover:text-ink active:scale-90"
                                            >
                                              <X size={16} />
                                            </button>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setStepMenuOpenId(null);
                                              handleOpenEditStep(step);
                                            }}
                                            className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
                                          >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/60 text-hotpink">
                                              <Edit2 size={17} />
                                            </span>
                                            <span>
                                              {isAr
                                                ? "تعديل الخطوة وتفاصيلها ✨"
                                                : "Edit step details ✨"}
                                            </span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              duplicateRoutineStep(activeKey, step.id);
                                              setStepMenuOpenId(null);
                                              showToast(
                                                isAr ? "✓ تم تكرار الخطوة!" : "✓ Step duplicated!",
                                              );
                                            }}
                                            className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
                                          >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                                              <Copy size={17} />
                                            </span>
                                            <span>
                                              {isAr ? "تكرار ونسخ الخطوة" : "Duplicate Step"}
                                            </span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              skipRoutineStepForToday(activeKey, step.id);
                                              setStepMenuOpenId(null);
                                              showToast(
                                                isAr
                                                  ? "✓ تم تخطي الخطوة لليوم!"
                                                  : "✓ Skipped for today!",
                                              );
                                            }}
                                            className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
                                          >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                                              <Clock size={17} />
                                            </span>
                                            <span>{isAr ? "تخطي لليوم" : "Skip for Today"}</span>
                                          </button>

                                          {/* Move to Section sub-options */}
                                          <div className="border-t border-border/60 my-1 pt-2">
                                            <span className="text-xs font-black text-ink-light px-1 block mb-1.5">
                                              {isAr ? "نقل إلى قسم آخر:" : "Move to section:"}
                                            </span>
                                            <div className="grid grid-cols-2 gap-1.5">
                                              {SECTION_DEFS.map((sDef) => {
                                                if (sDef.key === step.section) return null;
                                                return (
                                                  <button
                                                    key={sDef.key}
                                                    type="button"
                                                    onClick={() => {
                                                      moveRoutineStepSection(
                                                        activeKey,
                                                        step.id,
                                                        sDef.key,
                                                      );
                                                      setStepMenuOpenId(null);
                                                      showToast(
                                                        isAr
                                                          ? "✓ تم نقل الخطوة للقسم!"
                                                          : "✓ Moved to section!",
                                                      );
                                                    }}
                                                    className="cursor-pointer flex items-center gap-2 p-2 rounded-xl border border-border/70 bg-surface hover:bg-card text-xs font-bold text-ink"
                                                  >
                                                    <span>{sDef.icon}</span>
                                                    <span className="truncate">
                                                      {isAr ? sDef.titleAr : sDef.titleEn}
                                                    </span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          <div className="border-t border-border/60 pt-1">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                removeRoutineStep(activeKey, step.id);
                                                setStepMenuOpenId(null);
                                                showToast(
                                                  isAr ? "✓ تم حذف الخطوة!" : "✓ Step removed!",
                                                );
                                              }}
                                              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-98 transition-all text-start"
                                            >
                                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                                                <Trash2 size={17} />
                                              </span>
                                              <span>
                                                {isAr ? "حذف الخطوة نهائياً" : "Delete Step"}
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
            </>
          )}
          </main>

          {/* CREATE COMPLETE NEW ROUTINE MODAL */}
          <NewRoutineModal
            isOpen={showNewRoutineModal}
            isAr={isAr}
            onSave={(payload) => {
              const createdId = createUserRoutine({
                titleEn: payload.title,
                titleAr: payload.title,
                type: payload.type,
                icon: payload.emoji,
                color: payload.color,
                isCustom: true,
                steps: [],
              });
              if (createdId) setActiveKey(createdId);
              setShowNewRoutineModal(false);
              showToast(isAr ? "تم إنشاء الروتين المخصص بنجاح ✨" : "Custom routine created ✨");
            }}
            onCancel={() => setShowNewRoutineModal(false)}
          />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* READY-MADE ROUTINES LIBRARY MODAL */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {showTemplateLibrary && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
              <div
                className="fixed inset-0"
                onClick={() => {
                  setShowTemplateLibrary(false);
                  setPreviewTemplateKey(null);
                }}
              />
              <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950/60 text-hotpink">
                      <Compass className="h-4 w-4" />
                    </span>
                    <h3 className="text-[17px] font-extrabold text-ink">
                      {isAr ? "اكتشفي الروتينات الجاهزة ✨" : "Explore Ready-made Routines ✨"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateLibrary(false);
                      setPreviewTemplateKey(null);
                    }}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-surface text-ink-light"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Template Preview Details or List */}
                {previewTemplateKey ? (
                  <div className="space-y-3 animate-fade-in">
                    {(() => {
                      const tmpl = DEFAULT_ROUTINES[previewTemplateKey];
                      if (!tmpl) return null;
                      return (
                        <>
                          <div
                            className={cn(
                              "rounded-2xl p-4 text-white bg-gradient-to-br",
                              tmpl.color,
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-100 block">
                              {isAr ? tmpl.badgeAr : tmpl.badgeEn}
                            </span>
                            <h4 className="text-[18px] font-bold mt-0.5">
                              {isAr ? tmpl.titleAr : tmpl.titleEn}
                            </h4>
                            <p className="text-xs text-pink-100 mt-0.5">
                              {isAr ? tmpl.subtitleAr : tmpl.subtitleEn}
                            </p>
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-1.5 p-1 border border-border/70 rounded-2xl bg-surface">
                            {tmpl.steps.map((st, idx) => (
                              <div
                                key={st.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 text-xs font-bold text-ink"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold text-ink-light">
                                    {idx + 1}.
                                  </span>
                                  <span>{st.emoji}</span>
                                  <span>{isAr && st.titleAr ? st.titleAr : st.title}</span>
                                </div>
                                <span className="text-[10.5px] font-extrabold text-hotpink bg-hotpink/10 px-2 py-0.5 rounded">
                                  {st.time}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                useRoutineTemplate(previewTemplateKey);
                                setActiveKey(previewTemplateKey);
                                navigate({ to: "/routines", search: { key: previewTemplateKey } });
                                setShowTemplateLibrary(false);
                                setPreviewTemplateKey(null);
                                showToast(
                                  isAr
                                    ? "✓ تم استيراد الروتين واستخدامه بنجاح!"
                                    : "✓ Routine imported to your active routines!",
                                );
                              }}
                              className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white font-extrabold text-[13.5px] shadow-rose-sm"
                            >
                              {isAr ? "استخدمي هذا الروتين ✨" : "Use this routine ✨"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewTemplateKey(null)}
                              className="cursor-pointer px-4 py-3 rounded-xl bg-surface border border-border text-ink font-bold text-xs"
                            >
                              {isAr ? "رجوع للقائمة" : "Back"}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      "ideal-day",
                      "morning",
                      "evening",
                      "friday",
                      "study",
                      "reset-day",
                      "bundle-reset",
                      "bundle-spiritual",
                      "bundle-glow",
                      "bundle-growth",
                    ].map((tKey) => {
                      const tmpl = DEFAULT_ROUTINES[tKey];
                      if (!tmpl) return null;
                      return (
                        <div
                          key={tKey}
                          className="rounded-2xl bg-card border border-border p-3.5 hover:border-hotpink/50 transition-all flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-hotpink block">
                              {isAr ? tmpl.badgeAr : tmpl.badgeEn}
                            </span>
                            <h4 className="text-[15px] font-bold text-ink truncate mt-0.5">
                              {isAr ? tmpl.titleAr : tmpl.titleEn}
                            </h4>
                            <p className="text-[11.5px] text-ink-light truncate mt-0.5">
                              {isAr ? tmpl.subtitleAr : tmpl.subtitleEn}
                            </p>
                            <span className="text-[10.5px] font-extrabold text-ink-light bg-surface px-2 py-0.5 rounded border border-border/80 inline-block mt-1.5">
                              {tmpl.steps.length} {isAr ? "خطوات جاهزة" : "steps"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewTemplateKey(tKey)}
                              className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface border border-border text-[11.5px] font-bold text-ink hover:bg-card"
                            >
                              {isAr ? "معاينة 👁️" : "Preview 👁️"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                useRoutineTemplate(tKey);
                                setActiveKey(tKey);
                                navigate({ to: "/routines", search: { key: tKey } });
                                setShowTemplateLibrary(false);
                                showToast(
                                  isAr ? "✓ تم استخدام الروتين بنجاح!" : "✓ Routine activated!",
                                );
                              }}
                              className="cursor-pointer px-3 py-1.5 rounded-xl grad-theme text-white text-[11.5px] font-extrabold shadow-xs active:scale-95"
                            >
                              {isAr ? "استخدام ✨" : "Use ✨"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {showGuidedMode && steps[guidedStepIndex] && (
            <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-fade-in">
              {/* Top Bar: Title, Step Count & Exit */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
                    {isAr ? "الوضع الموجه خطوة بخطوة ✨" : "Guided Routine Mode ✨"}
                  </span>
                  <h3 className="text-[16px] font-black text-ink">{currentRoutineTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuidedMode(false)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-bold text-ink hover:text-rose-500"
                >
                  <X className="h-4 w-4" />
                  <span>{isAr ? "خروج" : "Exit"}</span>
                </button>
              </div>

              {/* Overall Progress Bar */}
              <div className="px-5 pt-3">
                <div className="flex items-center justify-between text-xs font-bold text-ink-light mb-1">
                  <span>
                    {isAr
                      ? `الخطوة ${guidedStepIndex + 1} من ${steps.length}`
                      : `Step ${guidedStepIndex + 1} of ${steps.length}`}
                  </span>
                  <span>{Math.round(((guidedStepIndex + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden border border-border/80">
                  <div
                    className="h-full rounded-full grad-theme transition-all duration-500"
                    style={{ width: `${((guidedStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Center: Current Step Focus Card */}
              <div className="flex-1 flex items-center justify-center p-5">
                {(() => {
                  const curSt = steps[guidedStepIndex];
                  return (
                    <div className="w-full max-w-md rounded-3xl bg-card border-2 border-hotpink/40 p-6 text-center space-y-4 shadow-rose-md animate-scale-up">
                      <span className="text-5xl block animate-bounce-soft">
                        {curSt.emoji || "✨"}
                      </span>

                      <div>
                        <span className="text-xs font-extrabold text-hotpink bg-hotpink/10 px-3 py-1 rounded-full border border-hotpink/20 inline-block mb-1.5">
                          {curSt.time}
                        </span>
                        <h2 className="text-[22px] font-black text-ink">
                          {isAr && curSt.titleAr ? curSt.titleAr : curSt.title}
                        </h2>
                      </div>

                      {/* Timer Countdown if duration is set */}
                      {guidedTimerSeconds !== null && (
                        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center space-y-2">
                          <span className="text-3xl font-mono font-black text-hotpink">
                            {Math.floor(guidedTimerSeconds / 60)
                              .toString()
                              .padStart(2, "0")}
                            :{(guidedTimerSeconds % 60).toString().padStart(2, "0")}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setGuidedTimerActive(!guidedTimerActive)}
                              className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 rounded-xl grad-theme text-white text-xs font-bold"
                            >
                              {guidedTimerActive ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {guidedTimerActive
                                  ? isAr
                                    ? "إيقاف"
                                    : "Pause"
                                  : isAr
                                    ? "بدء المؤقت"
                                    : "Start Timer"}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGuidedTimerActive(false);
                                if (curSt.durationMinutes)
                                  setGuidedTimerSeconds(curSt.durationMinutes * 60);
                              }}
                              className="cursor-pointer p-1.5 rounded-xl bg-card border border-border text-ink-light hover:text-ink"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {curSt.notes && (
                        <p className="text-xs text-ink-light bg-surface p-3 rounded-xl border border-border/60">
                          {curSt.notes}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleGuidedPrev}
                  disabled={guidedStepIndex === 0}
                  className="cursor-pointer px-4 py-3 rounded-2xl bg-surface border border-border text-ink font-bold text-xs disabled:opacity-30"
                >
                  {isAr ? "السابق" : "Previous"}
                </button>

                <button
                  type="button"
                  onClick={handleGuidedSkip}
                  className="cursor-pointer px-3 py-3 rounded-2xl bg-surface text-amber-600 border border-amber-200 dark:border-amber-900 font-bold text-xs"
                >
                  {isAr ? "تخطي اليوم" : "Skip"}
                </button>

                <button
                  type="button"
                  onClick={handleGuidedDone}
                  className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white font-black text-sm shadow-rose-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{isAr ? "تم ✓ (+10 XP)" : "Done ✓ (+10 XP)"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuidedNext}
                  className="cursor-pointer px-4 py-3 rounded-2xl bg-surface border border-border text-ink font-bold text-xs"
                >
                  {isAr ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}

          {/* CELEBRATION MODAL ON ROUTINE COMPLETION */}
          {showCelebration && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
              <div className="w-full max-w-sm rounded-3xl bg-card border-2 border-hotpink p-6 text-center space-y-4 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto overscroll-contain">
                <span className="text-5xl block animate-bounce">👑</span>
                <h3 className="text-[20px] font-black text-ink">
                  {isAr ? "أحسنتِ! اكتمل الروتين بنجاح 🎉" : "Amazing! Routine Completed 🎉"}
                </h3>
                <p className="text-xs text-ink-light font-medium">
                  {isAr
                    ? "يومٌ إضافي مشرق في مسيرة تطويركِ ووصولكِ لأفضل نسخة منكِ ♡"
                    : "One more beautiful day in your journey of becoming her ♡"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="cursor-pointer w-full py-3 rounded-2xl grad-theme text-white font-extrabold text-sm shadow-rose-sm"
                >
                  {isAr ? "متابعة إنجازاتي ✨" : "Continue ✨"}
                </button>
              </div>
            </div>
          )}
        </Screen>
      )}
    </MobileShell>
  );
}
