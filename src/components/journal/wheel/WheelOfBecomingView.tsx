import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  type WheelOfBecomingRecord,
  type WheelAreaConfig,
  type WheelReflectionNotes,
  getYearMonth,
  getAdjacentYearMonth,
  isMonthPast,
  isMonthInFuture,
  formatMonthLabel,
  normalizeWheelRecord,
  calculateWheelMetrics,
} from "@/lib/wheelOfBecomingEngine";
import { useApp, type Goal } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { WheelSvg } from "./WheelSvg";
import { WheelAreaCard } from "./WheelAreaCard";
import { WheelFocusCard } from "./WheelFocusCard";
import { WheelReflectionNotesView } from "./WheelReflectionNotes";
import { WheelComparisonView } from "./WheelComparisonView";
import { WheelCustomAreasModal } from "./WheelCustomAreasModal";
import { WheelExportModal } from "./WheelExportModal";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  ArrowLeftRight,
  Download,
  Check,
  RotateCcw,
  Plus,
  ArrowLeft,
  Lock,
} from "lucide-react";

interface WheelOfBecomingViewProps {
  initialMonth?: string;
  onExit: () => void;
  onOpenGoal?: (goalId: string) => void;
}

export function WheelOfBecomingView({
  initialMonth,
  onExit,
  onOpenGoal,
}: WheelOfBecomingViewProps) {
  const {
    state,
    saveWheelRecord,
    updateWheelCustomization,
    linkGoalToWheel,
    unlinkGoalFromWheel,
    addGoal,
  } = useApp();

  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const currentMonth = getYearMonth();

  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return initialMonth && /^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : currentMonth;
  });

  // Modals & Panels State
  const [customAreasOpen, setCustomAreasOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [focusedAreaId, setFocusedAreaId] = useState<string | null>(null);

  // Goal Conversion Modal State
  const [createGoalModalOpen, setCreateGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Personal");

  // Save Status Indicator
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "failed">("saved");
  const saveTimeoutRef = useRef<any>(null);

  // Find or initialize record for selectedMonth
  const existingRecord = useMemo(() => {
    const list = state.wheelOfBecomingRecords || [];
    return list.find((r) => r.yearMonth === selectedMonth) || null;
  }, [state.wheelOfBecomingRecords, selectedMonth]);

  // Previous month record for comparison
  const previousRecord = useMemo(() => {
    const prevMonth = getAdjacentYearMonth(selectedMonth, -1);
    const list = state.wheelOfBecomingRecords || [];
    return list.find((r) => r.yearMonth === prevMonth) || null;
  }, [state.wheelOfBecomingRecords, selectedMonth]);

  // Active Draft Record
  const [recordDraft, setRecordDraft] = useState<WheelOfBecomingRecord>(() => {
    return normalizeWheelRecord(
      existingRecord,
      selectedMonth,
      state.wheelCustomization?.customAreas
    );
  });

  // Re-sync draft when selectedMonth or existingRecord changes
  useEffect(() => {
    setRecordDraft(
      normalizeWheelRecord(
        existingRecord,
        selectedMonth,
        state.wheelCustomization?.customAreas
      )
    );
  }, [selectedMonth, existingRecord, state.wheelCustomization?.customAreas]);

  // Debounced Autosave to canonical store
  const persistDraft = (updated: WheelOfBecomingRecord) => {
    setRecordDraft(updated);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        saveWheelRecord(updated);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save wheel record:", err);
        setSaveStatus("failed");
      }
    }, 400);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedMonth((prev) => getAdjacentYearMonth(prev, -1));
    setShowComparison(false);
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => getAdjacentYearMonth(prev, 1));
    setShowComparison(false);
  };

  const handleReturnToCurrent = () => {
    setSelectedMonth(currentMonth);
    setShowComparison(false);
  };

  // Check-in mutations
  const handleRateArea = (areaId: string, rating?: number) => {
    const nextRatings = { ...recordDraft.ratings };
    if (typeof rating === "number") {
      nextRatings[areaId] = rating;
    } else {
      delete nextRatings[areaId];
    }
    persistDraft({
      ...recordDraft,
      ratings: nextRatings,
    });
  };

  const handleNoteChange = (areaId: string, noteText: string) => {
    const nextNotes = { ...recordDraft.notes };
    if (noteText.trim()) {
      nextNotes[areaId] = noteText;
    } else {
      delete nextNotes[areaId];
    }
    persistDraft({
      ...recordDraft,
      notes: nextNotes,
    });
  };

  const handleSelectFocusArea = (areaId?: string) => {
    persistDraft({
      ...recordDraft,
      focusAreaId: areaId,
    });
  };

  const handleIntentionChange = (intention: string) => {
    persistDraft({
      ...recordDraft,
      focusIntention: intention,
    });
  };

  const handleGentleActionChange = (action: string) => {
    persistDraft({
      ...recordDraft,
      gentleAction: action,
    });
  };

  const handleReflectionPromptChange = (key: keyof WheelReflectionNotes, val: string) => {
    persistDraft({
      ...recordDraft,
      reflectionNotes: {
        ...(recordDraft.reflectionNotes || {}),
        [key]: val,
      },
    });
  };

  const handleCustomAreasSave = (newAreas: WheelAreaConfig[]) => {
    updateWheelCustomization({ customAreas: newAreas });
    persistDraft({
      ...recordDraft,
      areas: newAreas,
    });
  };

  // Goal Linking Handlers
  const handleLinkGoal = (goalId: string) => {
    linkGoalToWheel(selectedMonth, goalId);
  };

  const handleUnlinkGoal = () => {
    unlinkGoalFromWheel(selectedMonth);
  };

  const handleOpenTurnIntoGoal = () => {
    const defaultTitle = recordDraft.focusIntention || (focusedArea?.nameEn ? `Care for ${focusedArea.nameEn}` : "");
    setNewGoalTitle(defaultTitle);
    setCreateGoalModalOpen(true);
  };

  const handleCreateAndLinkGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const createdId = addGoal({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      target: "Someday",
      status: "active",
      progress: 0,
      milestones: [],
    } as any);

    if (createdId) {
      linkGoalToWheel(selectedMonth, createdId);
    }
    setCreateGoalModalOpen(false);
  };

  // Metrics and Status
  const metrics = calculateWheelMetrics(recordDraft);
  const isPast = isMonthPast(selectedMonth, currentMonth);
  const isFuture = isMonthInFuture(selectedMonth, currentMonth);
  const formattedMonth = formatMonthLabel(selectedMonth, isAr);
  const activeAreas = recordDraft.areas.filter((a) => !a.hidden);
  const focusedArea = activeAreas.find((a) => a.id === recordDraft.focusAreaId);

  // Click on SVG wedge scrolls into view
  const handleSelectAreaFromWheel = (areaId: string) => {
    setFocusedAreaId(areaId);
    const el = document.getElementById(`area-card-${areaId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* ── Sub-Header: Return Button & Month Navigation ── */}
      <div className="flex flex-col gap-3">
        {/* Top bar with Return link and Autosave indicator */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5B64] hover:text-[#3D1E28] transition-colors py-1"
          >
            <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "العودة إلى اليوميات" : "Return to Journal"}</span>
          </button>

          {/* Autosave status pill */}
          <span className="text-[11px] font-semibold text-[#A89297] flex items-center gap-1">
            {saveStatus === "saving" ? (
              <span className="text-amber-600 animate-pulse">{isAr ? "جاري الحفظ..." : "Saving..."}</span>
            ) : saveStatus === "failed" ? (
              <span className="text-rose-600">{isAr ? "تعذر الحفظ" : "Save failed"}</span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check size={12} />
                <span>{isAr ? "محفوظ تلقائيًا ✓" : "Saved ✓"}</span>
              </span>
            )}
          </span>
        </div>

        {/* Month Selector Bar */}
        <div className="p-3 rounded-3xl bg-white border border-[#F2E5E3] shadow-xs flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-2xl hover:bg-rose-50 text-[#7A5B64] active:scale-90 transition-all"
            aria-label={isAr ? "الشهر السابق" : "Previous month"}
          >
            <ChevronLeft size={18} className={isAr ? "rotate-180" : ""} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-700">
              <Calendar size={15} />
            </span>
            <div className="min-w-0 text-center">
              <span className="text-sm font-serif font-black text-[#3D1E28] block truncate">
                {formattedMonth}
              </span>
              {selectedMonth !== currentMonth && (
                <button
                  type="button"
                  onClick={handleReturnToCurrent}
                  className="text-[10px] font-bold text-[#E87A90] hover:underline"
                >
                  {isAr ? "العودة للشهر الحالي" : "Return to current month"}
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-2xl hover:bg-rose-50 text-[#7A5B64] active:scale-90 transition-all"
            aria-label={isAr ? "الشهر القادم" : "Next month"}
          >
            <ChevronRight size={18} className={isAr ? "rotate-180" : ""} />
          </button>
        </div>
      </div>

      {/* ── Timing Banners (Backfilled / Future Draft) ── */}
      {isPast && (
        <div className="px-3.5 py-2 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-800 flex items-center justify-between">
          <span>{isAr ? "تأمل سابق لهذا الشهر (تم تدوينه لاحقًا)" : "Backfilled reflection (entered after the month)"}</span>
          {recordDraft.enteredAt && (
            <span className="text-[10px] opacity-75 font-mono">
              {new Date(recordDraft.enteredAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {isFuture && (
        <div className="px-3.5 py-2 rounded-2xl bg-purple-50/70 border border-purple-200/70 text-[11px] text-purple-800">
          <span>{isAr ? "مسودة تحضيرية لشهر قادم — لا تمثل تقييمًا لحالة منتهية بعد 🌸" : "Preparation draft for future month — not an observed monthly state 🌸"}</span>
        </div>
      )}

      {/* ── Hero Wheel Card ── */}
      <div className="rounded-3xl border border-[#F2E5E3] bg-gradient-to-b from-[#FFF9F6] via-white to-[#FFF9F6] p-4 sm:p-6 shadow-xs flex flex-col items-center">
        {/* Title & Tagline */}
        <div className="text-center space-y-1 mb-2">
          <h2 className="text-lg font-serif font-black text-[#3D1E28]">
            {isAr ? "دائرة التوازن 🌸" : "Wheel of Becoming 🌸"}
          </h2>
          <p className="text-xs text-[#7A5B64] max-w-xs mx-auto">
            {metrics.ratedCount === 0
              ? isAr
                ? "لحظة لتتأمّلي أين أنتِ الآن 🌸 يمكنكِ تقييم بعض الجوانب، أو كتابة فكرة، أو اختيار مجال للاهتمام."
                : "A moment to notice where you are 🌸 You can rate a few areas, write a thought, or simply choose a focus."
              : isAr
              ? "تأمّلي ما يحتاج منكِ بعض الاهتمام هذا الشهر."
              : "Notice what needs a little care this month."}
          </p>
        </div>

        {/* Wheel SVG Component */}
        <div className="py-2">
          <WheelSvg
            record={recordDraft}
            selectedAreaId={focusedAreaId}
            onSelectArea={handleSelectAreaFromWheel}
            isAr={isAr}
          />
        </div>

        {/* Checked-in count indicator (Truthful counts, zero grade or percentage) */}
        <div className="mt-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#9D174D] border border-rose-200/60 shadow-2xs">
            {isAr
              ? `${metrics.ratedCount} من ${metrics.activeAreasCount} جوانب مقيّمة`
              : `${metrics.ratedCount} of ${metrics.activeAreasCount} areas checked in`}
          </span>

          {focusedArea && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs flex items-center gap-1">
              <Sparkles size={11} />
              <span>{isAr ? `الاهتمام: ${focusedArea.nameAr}` : `Focus: ${focusedArea.nameEn}`}</span>
            </span>
          )}
        </div>

        {/* Action Buttons Strip */}
        <div className="mt-4 flex items-center gap-2 flex-wrap justify-center pt-3 border-t border-[#F2E5E3]/80 w-full">
          <button
            type="button"
            onClick={() => setShowComparison((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border ${
              showComparison
                ? "bg-[#9D174D] text-white border-[#9D174D] shadow-xs"
                : "bg-white text-[#7A5B64] border-[#F2E5E3] hover:bg-rose-50"
            }`}
          >
            <ArrowLeftRight size={13} />
            <span>{isAr ? "مقارنة مع الشهر السابق" : "Compare Month"}</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomAreasOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#7A5B64] border border-[#F2E5E3] hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <SlidersHorizontal size={13} />
            <span>{isAr ? "تخصيص الجوانب" : "Customize Areas"}</span>
          </button>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#7A5B64] border border-[#F2E5E3] hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>{isAr ? "تصدير الدائرة" : "Export"}</span>
          </button>
        </div>
      </div>

      {/* ── Month Comparison Section (When Toggled) ── */}
      {showComparison && (
        <WheelComparisonView
          currentRecord={recordDraft}
          previousRecord={previousRecord}
          onClose={() => setShowComparison(false)}
          isAr={isAr}
        />
      )}

      {/* ── Gentle Focus Card ── */}
      <WheelFocusCard
        record={recordDraft}
        areas={recordDraft.areas}
        goals={state.goals || []}
        onSelectFocusArea={handleSelectFocusArea}
        onIntentionChange={handleIntentionChange}
        onGentleActionChange={handleGentleActionChange}
        onLinkGoal={handleLinkGoal}
        onUnlinkGoal={handleUnlinkGoal}
        onOpenCreateGoalModal={handleOpenTurnIntoGoal}
        isAr={isAr}
      />

      {/* ── Accessible Areas Check-in List ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#7A5B64] flex items-center gap-1.5">
            <span>{isAr ? "تقييم الجوانب وملاحظات الرضا 🌸" : "Life Areas Satisfaction (1–10)"}</span>
          </h3>
          <span className="text-[11px] text-[#A89297]">
            {isAr ? "ما مدى رضاكِ عن هذا الجانب حاليًا؟" : "How satisfied do you feel?"}
          </span>
        </div>

        <div className="space-y-3">
          {activeAreas.map((area) => (
            <WheelAreaCard
              key={area.id}
              area={area}
              rating={recordDraft.ratings[area.id]}
              note={recordDraft.notes[area.id] || ""}
              isFocused={focusedAreaId === area.id}
              onRate={handleRateArea}
              onNoteChange={handleNoteChange}
              isAr={isAr}
            />
          ))}
        </div>
      </div>

      {/* ── Guided Monthly Reflection Prompts ── */}
      <WheelReflectionNotesView
        notes={recordDraft.reflectionNotes}
        onChange={handleReflectionPromptChange}
        isAr={isAr}
      />

      {/* ── Modals ── */}
      {/* 1. Custom Areas Modal */}
      <WheelCustomAreasModal
        open={customAreasOpen}
        onClose={() => setCustomAreasOpen(false)}
        currentAreas={recordDraft.areas}
        onSaveAreas={handleCustomAreasSave}
        isAr={isAr}
      />

      {/* 2. Export Preview Modal */}
      <WheelExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        record={recordDraft}
        isAr={isAr}
      />

      {/* 3. Turn Intention into Goal Modal */}
      {createGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateAndLinkGoal}
            className="w-full max-w-sm rounded-3xl bg-[#FFF9F6] border border-[#F2E5E3] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#3D1E28]">
                {isAr ? "تحويل النية إلى هدف 🎯" : "Turn Intention into Goal 🎯"}
              </h4>
              <button
                type="button"
                onClick={() => setCreateGoalModalOpen(false)}
                className="text-[#7A5B64] hover:text-[#3D1E28]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7A5B64]">
              {isAr
                ? "سيتم إنشاء هذا الهدف في وحدة الأهداف وربطه بتأمل هذا الشهر."
                : "This goal will be saved to your Goals module and linked to this month's reflection."}
            </p>

            <div>
              <label className="text-xs font-bold text-[#3D1E28] block mb-1">
                {isAr ? "عنوان الهدف:" : "Goal Title:"}
              </label>
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                required
                dir="auto"
                className="w-full p-2.5 rounded-xl border border-[#F2E5E3] bg-white text-xs text-[#3D1E28]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3D1E28] block mb-1">
                {isAr ? "التصنيف:" : "Category:"}
              </label>
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-[#F2E5E3] bg-white text-[#3D1E28]"
              >
                <option value="Personal">{isAr ? "شخصي" : "Personal"}</option>
                <option value="Health">{isAr ? "صحة" : "Health"}</option>
                <option value="Faith">{isAr ? "إيمان" : "Faith"}</option>
                <option value="Learning">{isAr ? "تعلّم" : "Learning"}</option>
                <option value="Career">{isAr ? "عمل" : "Career"}</option>
                <option value="Home">{isAr ? "منزل" : "Home"}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F2E5E3]">
              <button
                type="button"
                onClick={() => setCreateGoalModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#7A5B64]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#9D174D] text-white text-xs font-bold shadow-rose active:scale-95"
              >
                {isAr ? "إنشاء وربط الهدف" : "Create & Link"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
