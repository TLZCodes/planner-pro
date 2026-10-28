import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Tag,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp, type Goal, DEFAULT_TASK_CATEGORIES } from "@/lib/store";
import {
  type SomedayWish,
  findPotentialGoalMatches,
} from "@/lib/somedayGardenEngine";

interface TurnWishIntoGoalModalProps {
  isOpen: boolean;
  wish: SomedayWish | null;
  onClose: () => void;
  onGoalCreated: (goalId: string) => void;
  onLinkExistingInstead?: (goalId: string) => void;
}

export function TurnWishIntoGoalModal({
  isOpen,
  wish,
  onClose,
  onGoalCreated,
  onLinkExistingInstead,
}: TurnWishIntoGoalModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { state, convertWishToGoal } = useApp();

  const [proposedTitle, setProposedTitle] = useState("");
  const [proposedDesc, setProposedDesc] = useState("");
  const [area, setArea] = useState("Personal");
  const [hasTargetDate, setHasTargetDate] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [why, setWhy] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && wish) {
      setProposedTitle(wish.title || "");
      setProposedDesc(wish.description || "");
      setWhy(wish.personalReason || "");
      setNextAction(wish.nextSmallStepNote || "");
      setHasTargetDate(false);
      setTargetDate("");
      setIsSubmitting(false);
      setErrorMsg("");

      // Map wish category to goal area if compatible
      const defaultGoalAreas = ["Personal", "Study", "Work", "Home", "Health", "Self-care", "Money", "Deen"];
      if (wish.category && defaultGoalAreas.includes(wish.category)) {
        setArea(wish.category);
      } else if (wish.category === "Something to save for") {
        setArea("Money");
      } else if (wish.category === "Things to learn") {
        setArea("Study");
      } else {
        setArea("Personal");
      }
    }
  }, [isOpen, wish]);

  if (!isOpen || !wish) return null;

  // Potential duplicate detection
  const potentialMatches = findPotentialGoalMatches(proposedTitle, state.goals || []);

  const handleConfirm = () => {
    if (isSubmitting) return;
    const finalTitle = proposedTitle.trim();
    if (!finalTitle) {
      setErrorMsg(isAr ? "يرجى كتابة عنوان للهدف" : "Please enter a title for the Goal");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdGoalId = convertWishToGoal(wish.id, {
        title: finalTitle,
        description: proposedDesc.trim() || undefined,
        area,
        why: why.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        target: hasTargetDate && targetDate ? targetDate : "Someday",
        targetDate: hasTargetDate && targetDate ? targetDate : undefined,
        status: "active",
        progress: 0,
      });

      onGoalCreated(createdGoalId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? "فشل إنشاء الهدف" : "Failed to create Goal"));
      setIsSubmitting(false);
    }
  };

  const goalAreas = ["Personal", "Study", "Work", "Home", "Health", "Self-care", "Money", "Deen"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="turn-into-goal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FFFBFD] dark:bg-[#1E141B] rounded-t-3xl sm:rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-xl max-h-[90vh] flex flex-col overflow-hidden text-[#3B1238] dark:text-pink-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
              <Target size={18} />
            </span>
            <div>
              <h2 id="turn-into-goal-title" className="text-base font-black text-[#3B1238] dark:text-pink-100">
                {isAr ? "تحويل إلى هدف 🎯" : "Turn into a Goal 🎯"}
              </h2>
              <p className="text-[11px] font-semibold text-[#6E4268] dark:text-pink-300">
                {isAr ? "معاينة قابلة للتعديل قبل الاعتماد الرسمي" : "Editable preview before official creation"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#6E4268] dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 transition-all cursor-pointer"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Potential Matches Warning */}
          {potentialMatches.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-200">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>
                  {isAr ? "أهداف مشابهة موجودة بالفعل في حسابكِ:" : "Similar goals found in your list:"}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {isAr
                  ? "يمكنكِ ربط هذه الأمنية بهدف قائم بدلاً من إنشاء هدف مكرر."
                  : "You can link to an existing goal rather than creating a duplicate."}
              </p>
              <div className="space-y-1.5 pt-1">
                {potentialMatches.slice(0, 2).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-[#281825]/80 border border-amber-200/60 text-xs font-bold"
                  >
                    <span className="truncate max-w-[200px]">{match.title}</span>
                    {onLinkExistingInstead && (
                      <button
                        type="button"
                        onClick={() => {
                          onLinkExistingInstead(match.id);
                          onClose();
                        }}
                        className="cursor-pointer text-[10px] text-amber-800 dark:text-amber-200 hover:underline flex items-center gap-1 font-black"
                      >
                        <LinkIcon size={12} />
                        <span>{isAr ? "ربط بهذا الهدف" : "Link this goal"}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "عنوان الهدف المقترح *" : "Proposed Goal Title *"}
            </label>
            <input
              type="text"
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-sm font-bold text-[#3B1238] dark:text-pink-100 outline-none focus:border-hotpink shadow-inner transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "الوصف والرؤية" : "Description & Vision"}
            </label>
            <textarea
              rows={2}
              value={proposedDesc}
              onChange={(e) => setProposedDesc(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 outline-none focus:border-hotpink shadow-inner resize-none transition-all"
            />
          </div>

          {/* Area / Category */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1.5">
              {isAr ? "مجال الهدف" : "Goal Area"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {goalAreas.map((itemArea) => (
                <button
                  key={itemArea}
                  type="button"
                  onClick={() => setArea(itemArea)}
                  className={cn(
                    "cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full border transition-all min-h-[36px]",
                    area === itemArea
                      ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                      : "bg-white dark:bg-[#281825] text-[#6E4268] dark:text-pink-200 border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-50"
                  )}
                >
                  {t(itemArea)}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date (Optional) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200/80 dark:border-pink-900/60 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTargetDate}
                onChange={(e) => setHasTargetDate(e.target.checked)}
                className="w-4 h-4 rounded text-hotpink accent-hotpink"
              />
              <span className="text-xs font-bold text-[#3B1238] dark:text-pink-200">
                {isAr ? "تحديد موعد مستهدف (اختياري تمامًا)" : "Set a target date (completely optional)"}
              </span>
            </label>
            {hasTargetDate && (
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-pink-50/50 dark:bg-[#1E141B] border border-pink-200 dark:border-pink-900/60 text-xs font-bold text-[#3B1238] dark:text-pink-100 outline-none"
              />
            )}
          </div>

          {/* Why this matters */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "لماذا يهمكِ هذا الهدف؟" : "Why this goal matters"}
            </label>
            <input
              type="text"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 outline-none focus:border-hotpink shadow-inner transition-all"
            />
          </div>

          {/* Next action step */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "الخطوة التنفيذية الأولى" : "First Action Step"}
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full h-10 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 outline-none focus:border-hotpink shadow-inner transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-100 dark:border-pink-900/40 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer min-h-[44px] px-4 py-2.5 rounded-full border border-pink-200 dark:border-pink-900 text-xs font-black text-[#6E4268] dark:text-pink-200 hover:bg-pink-50 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء (حفظ كأمنية فقط)" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="cursor-pointer min-h-[44px] flex-1 py-2.5 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>
              {isSubmitting
                ? isAr
                  ? "جاري إنشاء الهدف..."
                  : "Creating Goal..."
                : isAr
                ? "إنشاء الهدف والربط 🎯"
                : "Create Goal & Link 🎯"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
