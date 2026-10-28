import React from "react";
import { Heart, Sparkles, BookOpen, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResetCompletionViewProps {
  isAr: boolean;
  journalEntryId?: string;
  onEditAgain: () => void;
  onViewJournal: () => void;
  onBackToPlanner: () => void;
  onCreateKeepsake?: () => void;
}

export const ResetCompletionView: React.FC<ResetCompletionViewProps> = ({
  isAr,
  journalEntryId,
  onEditAgain,
  onViewJournal,
  onBackToPlanner,
  onCreateKeepsake,
}) => {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-200/80 dark:border-pink-900/50 p-6 sm:p-8 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-300">
      {/* Decorative icon */}
      <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-rose-md">
        <Sparkles size={28} />
      </div>

      {/* Main Copy from prompt specification */}
      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-lg sm:text-xl font-black text-ink">
          {isAr
            ? "أسبوعكِ كان حاضرًا ومقدّرًا 🌸"
            : "Your week has been honored 🌸"}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-ink-light leading-relaxed">
          {isAr
            ? "استريحي الآن، أو استقبلي أسبوعكِ القادم بقلب خفيف ومطمئن."
            : "Rest now, or step into next week with a light heart."}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {journalEntryId && (
          <button
            type="button"
            onClick={onViewJournal}
            className="cursor-pointer px-4 py-2.5 rounded-full bg-surface border border-pink-300/80 dark:border-pink-900/60 text-xs font-extrabold text-ink hover:text-hotpink flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
          >
            <BookOpen size={14} className="text-purple-600" />
            <span>{isAr ? "عرض في اليوميات 📖" : "View in Journal 📖"}</span>
          </button>
        )}

        {onCreateKeepsake && (
          <button
            type="button"
            onClick={onCreateKeepsake}
            className="cursor-pointer px-4 py-2.5 rounded-full bg-pink-500/10 border border-pink-400/80 text-hotpink text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-pink-500/20 active:scale-95 transition-all"
          >
            <span>🌷</span>
            <span>{isAr ? "اصنعي تذكاراً للأسبوع 🌷" : "Create a keepsake 🌷"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onEditAgain}
          className="cursor-pointer px-4 py-2.5 rounded-full bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <RotateCcw size={13} />
          <span>{isAr ? "تعديل المراجعة" : "Edit Reflection"}</span>
        </button>

        <button
          type="button"
          onClick={onBackToPlanner}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "العودة للرئيسية 🏡" : "Back to Home 🏡"}</span>
        </button>
      </div>
    </div>
  );
};
