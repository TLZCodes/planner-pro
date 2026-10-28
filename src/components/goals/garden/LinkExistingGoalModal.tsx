import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp, type Goal } from "@/lib/store";
import { type SomedayWish } from "@/lib/somedayGardenEngine";

interface LinkExistingGoalModalProps {
  isOpen: boolean;
  wish: SomedayWish | null;
  onClose: () => void;
  onGoalLinked: (goalId: string) => void;
}

export function LinkExistingGoalModal({
  isOpen,
  wish,
  onClose,
  onGoalLinked,
}: LinkExistingGoalModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { state, linkWishToGoal } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    wish?.linkedGoalId || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allGoals: Goal[] = state.goals || [];

  const filteredGoals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allGoals.filter((g) => {
      if (g.status === "archived") return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        (g.area && g.area.toLowerCase().includes(q)) ||
        (g.target && g.target.toLowerCase().includes(q))
      );
    });
  }, [allGoals, searchQuery]);

  if (!isOpen || !wish) return null;

  const handleConfirm = () => {
    if (!selectedGoalId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      linkWishToGoal(wish.id, selectedGoalId);
      onGoalLinked(selectedGoalId);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const selectedGoal = allGoals.find((g) => g.id === selectedGoalId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-goal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFBFD] dark:bg-[#1E141B] rounded-t-3xl sm:rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-xl max-h-[85vh] flex flex-col overflow-hidden text-[#3B1238] dark:text-pink-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <LinkIcon size={18} />
            </span>
            <div>
              <h2 id="link-goal-title" className="text-base font-black text-[#3B1238] dark:text-pink-100">
                {isAr ? "ربط بهدف موجود 🔗" : "Link an Existing Goal 🔗"}
              </h2>
              <p className="text-[11px] font-semibold text-[#6E4268] dark:text-pink-300">
                {isAr ? "اختاري هدفًا نشطًا لربطه بهذه الأمنية" : "Connect an active goal to this someday wish"}
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

        {/* Search Bar */}
        <div className="p-4 border-b border-pink-100/60 dark:border-pink-900/30">
          <div className="flex items-center gap-2 px-3.5 h-11 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 shadow-inner">
            <Search size={15} className="text-[#6E4268] dark:text-pink-300 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحثي في أهدافكِ الحالية..." : "Search your active goals..."}
              className="flex-1 bg-transparent text-xs font-bold text-[#3B1238] dark:text-pink-100 outline-none placeholder:text-pink-300"
            />
          </div>
        </div>

        {/* List of Goals */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredGoals.length === 0 ? (
            <div className="py-10 text-center text-[#6E4268] dark:text-pink-300 space-y-1">
              <p className="text-xs font-bold">{isAr ? "لا توجد أهداف مطابقة" : "No matching goals found"}</p>
              <p className="text-[11px]">{isAr ? "يمكنكِ تحويل الأمنية إلى هدف جديد" : "You can convert this wish to a new goal"}</p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const isSelected = selectedGoalId === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={cn(
                    "cursor-pointer w-full text-start p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[50px]",
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-100 shadow-xs ring-1 ring-teal-500"
                      : "bg-white dark:bg-[#281825] border-pink-200/80 dark:border-pink-900/60 text-[#3B1238] dark:text-pink-100 hover:bg-pink-50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black truncate">{goal.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#6E4268] dark:text-pink-300">
                      <span>{t(goal.area)}</span>
                      <span>•</span>
                      <span>{goal.progress}%</span>
                      {goal.target && (
                        <>
                          <span>•</span>
                          <span className="truncate">{goal.target}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shrink-0">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-100 dark:border-pink-900/40 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer min-h-[44px] px-4 py-2.5 rounded-full border border-pink-200 dark:border-pink-900 text-xs font-black text-[#6E4268] dark:text-pink-200 hover:bg-pink-50 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedGoalId || isSubmitting}
            className="cursor-pointer min-h-[44px] flex-1 py-2.5 px-5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <LinkIcon size={14} />
            <span>{isSubmitting ? (isAr ? "جاري الربط..." : "Linking...") : (isAr ? "تأكيد الربط 🔗" : "Confirm Link 🔗")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
