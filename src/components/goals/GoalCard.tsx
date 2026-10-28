import React, { memo } from "react";
import {
  Star,
  MoreVertical,
  Eye,
  Edit2,
  Clock,
  Play,
  Pause,
  CheckCircle,
  Archive,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import { type Goal } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface GoalCardProps {
  goal: Goal;
  isAr: boolean;
  t?: (k: string) => string;
  menuOpen?: boolean;
  setMenuOpen?: (open: boolean) => void;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFocus: () => void;
  onCheckIn?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onAiBreakdown?: () => void;
}

export const GoalCard = memo(function GoalCard({
  goal,
  isAr,
  menuOpen,
  setMenuOpen,
  onOpen,
  onEdit,
  onToggleFocus,
  onCheckIn,
  onPause,
  onComplete,
  onArchive,
  onDelete,
  onAiBreakdown,
}: GoalCardProps) {
  const isPaused = goal.status === "paused";
  const isCompleted = goal.status === "completed";
  const isArchived = goal.status === "archived";

  return (
    <>
      <div
        className={cn(
          "group relative rounded-3xl p-4.5 border transition-all shadow-xs space-y-3.5",
          isCompleted
            ? "bg-emerald-500/5 border-emerald-500/30"
            : isPaused
            ? "bg-amber-500/5 border-amber-500/30"
            : goal.isFocusGoal
            ? "bg-card border-hotpink/40 shadow-rose-sm"
            : "bg-card border-border/80 hover:border-hotpink/40"
        )}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border text-2xl shadow-xs">
              {goal.icon || "🎯"}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded-full bg-pink-500/10 text-hotpink px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  {goal.area}
                </span>
                {goal.isFocusGoal && (
                  <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-black flex items-center gap-0.5">
                    <Star size={10} className="fill-amber-500 text-amber-500" />
                    <span>{isAr ? "أساسي ⭐" : "Focus ⭐"}</span>
                  </span>
                )}
                {isPaused && (
                  <span className="rounded-full bg-amber-500/15 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                    {isAr ? "موقوف" : "Paused"}
                  </span>
                )}
                {isCompleted && (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    {isAr ? "مكتمل 🏆" : "Done 🏆"}
                  </span>
                )}
              </div>

              <h3 className="text-[15.5px] font-black text-ink mt-1 truncate">
                {goal.title}
              </h3>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFocus();
              }}
              className={cn(
                "cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-90",
                goal.isFocusGoal ? "bg-amber-500/15 border-amber-500 text-amber-500" : "bg-surface border-border/70 text-ink-light/50 hover:text-amber-500"
              )}
            >
              <Star size={15} className={cn(goal.isFocusGoal && "fill-amber-500")} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (setMenuOpen) setMenuOpen(!menuOpen);
              }}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/70 text-ink-light hover:text-ink active:scale-90"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-extrabold text-ink">
            <span>{isAr ? "نسبة التقدم" : "Progress"}</span>
            <span className="font-mono text-hotpink font-black text-sm">{goal.progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden border border-border/60">
            <div
              className="h-full rounded-full grad-theme transition-all duration-700"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Full-Screen Action Sheet */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            if (setMenuOpen) setMenuOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border-t sm:border border-border/80 p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl space-y-2 animate-slide-up text-ink font-sans max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
              <span className="text-sm font-extrabold truncate max-w-[280px] text-ink">
                {goal.title}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen && setMenuOpen(false)}
                className="cursor-pointer p-1.5 rounded-full bg-surface text-ink-light hover:text-ink active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (setMenuOpen) setMenuOpen(false);
                onOpen();
              }}
              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <Eye size={17} />
              </span>
              <span>{isAr ? "عرض تفاصيل ومحطات الهدف 🔍" : "View Goal Details 🔍"}</span>
            </button>


            {onCheckIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (setMenuOpen) setMenuOpen(false);
                  onCheckIn();
                }}
                className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/60 text-hotpink">
                  <Clock size={17} />
                </span>
                <span>{isAr ? "تسجيل مراجعة أسبوعية 📝" : "Log Check-in 📝"}</span>
              </button>
            )}

            {onPause && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (setMenuOpen) setMenuOpen(false);
                  onPause();
                }}
                className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  {isPaused ? <Play size={17} /> : <Pause size={17} />}
                </span>
                <span>{isPaused ? (isAr ? "استئناف الهدف" : "Resume Goal") : (isAr ? "إيقاف مؤقت" : "Pause Goal")}</span>
              </button>
            )}

            {onComplete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (setMenuOpen) setMenuOpen(false);
                  onComplete();
                }}
                className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-98 transition-all text-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <CheckCircle size={17} />
                </span>
                <span>{isCompleted ? (isAr ? "إلغاء الإنجاز" : "Uncomplete") : (isAr ? "إكمال الهدف بنجاح 🏆" : "Mark as Complete 🏆")}</span>
              </button>
            )}

            <div className="border-t border-border/60 my-1 pt-1" />

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (setMenuOpen) setMenuOpen(false);
                  onDelete();
                }}
                className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-98 transition-all text-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <Trash2 size={17} />
                </span>
                <span>{isAr ? "حذف الهدف نهائياً" : "Delete Goal"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
});
