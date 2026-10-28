import React, { useState, useEffect } from "react";
import { Check, X, Sparkles, AlertCircle, RefreshCw, Clock, Calendar, Bookmark, Bell } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type AiProposal,
  type AiProposalDestination,
  applyProposalToStore,
  type MutationResult,
} from "@/lib/aiPlannerEngine";

interface AiPlanReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sourceType: "ai_suggestion" | "built_in_template";
  initialProposals: AiProposal[];
  onProposalsApplied?: (results: MutationResult[]) => void;
}

export function AiPlanReviewSheet({
  isOpen,
  onClose,
  title,
  sourceType,
  initialProposals,
  onProposalsApplied,
}: AiPlanReviewSheetProps) {
  const { lang, dir } = useLang();
  const {
    addTask,
    addRoutineStep,
    createUserRoutine,
    addGoalMilestone,
    addGoal,
    addLearningPlanItem,
    addStudyMinutes,
  } = useApp();
  const isAr = lang === "ar";

  const [proposals, setProposals] = useState<AiProposal[]>(() =>
    initialProposals.map((p) => ({
      ...p,
      reminder: p.reminder ?? false, // Strictly default false
    }))
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialProposals.map((p) => p.id))
  );

  const [appliedResults, setAppliedResults] = useState<Record<string, MutationResult>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProposals(
        initialProposals.map((p) => ({
          ...p,
          reminder: p.reminder ?? false,
        }))
      );
      setSelectedIds(new Set(initialProposals.map((p) => p.id)));
      setAppliedResults({});
      setHasCompleted(false);
    }
  }, [isOpen, initialProposals]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(proposals.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleUpdateField = (
    id: string,
    field: keyof AiProposal,
    val: any
  ) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleApplySelected = () => {
    if (selectedIds.size === 0 || isApplying) return;

    setIsApplying(true);
    const appliedSet = new Set<string>(
      Object.keys(appliedResults).filter((id) => appliedResults[id].success)
    );

    const newResults: Record<string, MutationResult> = { ...appliedResults };
    const allResultsList: MutationResult[] = [];

    const actions = {
      addTask,
      addRoutineStep,
      createUserRoutine,
      addGoalMilestone,
      addGoal,
      addLearningPlanItem,
      addStudyMinutes,
    };

    proposals.forEach((p) => {
      if (selectedIds.has(p.id)) {
        const res = applyProposalToStore(p, actions, appliedSet);
        newResults[p.id] = res;
        allResultsList.push(res);
      }
    });

    setAppliedResults(newResults);
    setIsApplying(false);
    setHasCompleted(true);

    if (onProposalsApplied) {
      onProposalsApplied(allResultsList);
    }
  };

  const failedCount = Object.values(appliedResults).filter((r) => !r.success).length;
  const successCount = Object.values(appliedResults).filter((r) => r.success).length;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-sheet-title"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-surface/50">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  sourceType === "built_in_template"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                    : "bg-pink-100 text-hotpink dark:bg-pink-950/60 dark:text-pink-300"
                }`}
              >
                {sourceType === "built_in_template"
                  ? (isAr ? "قالب مدمج (ثابت)" : "Built-in Template (Deterministic)")
                  : (isAr ? "مقترح الذكاء الاصطناعي" : "AI Proposal (Untrusted Input)")}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                {isAr ? "0 XP (إنجاز حقيقي)" : "Strictly 0 XP"}
              </span>
            </div>
            <h2 id="review-sheet-title" className="text-base font-bold text-ink mt-1">
              {title || (isAr ? "مراجعة الخطة واعتمادها 📋" : "Review & Confirm Plan 📋")}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-light hover:bg-surface hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selection Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-surface/30 border-b border-border/50 text-xs">
          <span className="font-semibold text-ink-light">
            {isAr
              ? `المحدد: ${selectedIds.size} من ${proposals.length}`
              : `Selected: ${selectedIds.size} of ${proposals.length}`}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="font-bold text-hotpink hover:underline cursor-pointer"
            >
              {isAr ? "تحديد الكل" : "Select All"}
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="font-bold text-ink-light hover:text-ink cursor-pointer"
            >
              {isAr ? "إلغاء التحديد" : "Deselect All"}
            </button>
          </div>
        </div>

        {/* Proposals List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-sm">
          {proposals.map((p) => {
            const isChecked = selectedIds.has(p.id);
            const status = appliedResults[p.id];

            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-3.5 transition-all ${
                  status?.success
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : status && !status.success
                    ? "border-danger/40 bg-danger/5"
                    : isChecked
                    ? "border-pink-300 dark:border-pink-800 bg-card shadow-sm"
                    : "border-border/60 bg-surface/40 opacity-60"
                }`}
              >
                {/* Top Row: Checkbox + Title + Status */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelect(p.id)}
                    disabled={status?.success}
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                      isChecked
                        ? "bg-hotpink border-hotpink text-white"
                        : "border-border bg-card"
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => handleUpdateField(p.id, "title", e.target.value)}
                      placeholder={isAr ? "عنوان العنصر" : "Proposal title"}
                      disabled={status?.success}
                      className="w-full bg-transparent font-bold text-sm text-ink outline-none border-b border-border/40 focus:border-hotpink pb-1"
                    />

                    {/* Metadata & Editing Controls */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Destination Picker */}
                      <select
                        value={p.destination}
                        onChange={(e) =>
                          handleUpdateField(
                            p.id,
                            "destination",
                            e.target.value as AiProposalDestination
                          )
                        }
                        disabled={status?.success}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-ink font-semibold outline-none focus:border-hotpink cursor-pointer"
                      >
                        <option value="tasks">{isAr ? "📋 المهام" : "📋 Tasks"}</option>
                        <option value="routines">{isAr ? "🌸 الروتين" : "🌸 Routines"}</option>
                        <option value="goals">{isAr ? "🎯 الأهداف" : "🎯 Goals"}</option>
                        <option value="learning">{isAr ? "📚 الدراسة" : "📚 Learning"}</option>
                      </select>

                      {/* Date */}
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-ink-light">
                        <Calendar size={12} />
                        <input
                          type="date"
                          value={p.targetDate || ""}
                          onChange={(e) => handleUpdateField(p.id, "targetDate", e.target.value)}
                          disabled={status?.success}
                          className="bg-transparent text-xs text-ink outline-none"
                        />
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-ink-light">
                        <Clock size={12} />
                        <input
                          type="time"
                          value={p.clockTime || ""}
                          onChange={(e) => handleUpdateField(p.id, "clockTime", e.target.value)}
                          disabled={status?.success}
                          className="bg-transparent text-xs text-ink outline-none"
                        />
                      </div>

                      {/* Tag / Category */}
                      {p.category && (
                        <span className="rounded-md bg-pink-100 dark:bg-pink-950/40 text-hotpink px-2 py-0.5 text-[11px] font-bold">
                          #{p.category}
                        </span>
                      )}

                      {/* Reminder Checkbox (Default false) */}
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-light cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(p.reminder)}
                          onChange={(e) => handleUpdateField(p.id, "reminder", e.target.checked)}
                          disabled={status?.success}
                          className="accent-hotpink h-3.5 w-3.5 rounded cursor-pointer"
                        />
                        <Bell size={11} />
                        <span>{isAr ? "تذكير" : "Reminder"}</span>
                      </label>
                    </div>

                    {/* Status Badge */}
                    {status && (
                      <div className="pt-1">
                        {status.success ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check size={12} />
                            {isAr ? "تمت الإضافة لجدولكِ بنجاح ✓" : "Saved to planner successfully ✓"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-danger">
                            <AlertCircle size={12} />
                            {status.error || (isAr ? "تعذر الحفظ" : "Failed to save")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border/80 px-5 py-4 bg-surface/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-bold text-ink-light hover:text-ink cursor-pointer"
          >
            {hasCompleted ? (isAr ? "إغلاق" : "Close") : (isAr ? "إلغاء" : "Cancel")}
          </button>

          <div className="flex items-center gap-2">
            {hasCompleted && failedCount > 0 && (
              <button
                type="button"
                onClick={handleApplySelected}
                disabled={isApplying}
                className="flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-4 py-2 text-xs font-bold text-danger hover:bg-danger/20 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={isApplying ? "animate-spin" : ""} />
                {isAr ? `إعادة محاولة (${failedCount})` : `Retry Failed (${failedCount})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleApplySelected}
              disabled={isApplying || selectedIds.size === 0 || (hasCompleted && failedCount === 0)}
              className="grad-theme flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-rose active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isApplying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  {isAr ? "جارٍ الحفظ..." : "Saving..."}
                </>
              ) : hasCompleted && failedCount === 0 ? (
                <>
                  <Check size={14} />
                  {isAr ? `تم حفظ ${successCount} عناصر ✓` : `Saved ${successCount} items ✓`}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {isAr
                    ? `إضافة العناصر المحددة (${selectedIds.size})`
                    : `Save Selected (${selectedIds.size})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
