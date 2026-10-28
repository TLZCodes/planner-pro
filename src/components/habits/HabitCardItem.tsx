import React, { useState, memo } from "react";
import {
  Flame,
  Clock,
  MoreVertical,
  Edit3,
  BarChart2,
  Pause,
  RotateCcw,
  Archive,
  Trash2,
  X,
} from "lucide-react";
import { type Habit } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface HabitCardItemProps {
  habit: Habit;
  isAr: boolean;
  isCompleted?: boolean;
  onToggle: () => void;
  onUpdateProgress: (val: number) => void;
  onEdit: () => void;
  onViewDetail: () => void;
  onPause: () => void;
  onSkip: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const HabitCardItem = memo(function HabitCardItem({
  habit,
  isAr,
  isCompleted = false,
  onToggle,
  onUpdateProgress,
  onEdit,
  onViewDetail,
  onPause,
  onSkip,
  onArchive,
  onDelete,
}: HabitCardItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const target = habit.targetValue || 1;
  const currentVal = habit.currentValue || (isCompleted ? target : 0);
  const trackingType = habit.trackingType || "check";

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border/80 p-3.5 shadow-card hover:border-hotpink/40 transition-all flex items-center justify-between gap-3 relative",
        isCompleted && "opacity-80 bg-surface/60 border-border/50"
      )}
    >
      {/* 1. Left Checkbox / Stepper */}
      <div className="shrink-0 flex items-center">
        {trackingType === "check" ? (
          <button
            type="button"
            onClick={() => onToggle()}
            className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center text-base font-bold transition-transform active:scale-90 cursor-pointer",
              isCompleted
                ? "bg-hotpink text-white shadow-rose-sm"
                : "bg-surface border-2 border-border text-transparent hover:border-hotpink"
            )}
            title={isAr ? "إكمال العادة" : "Complete habit"}
          >
            ✓
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                const nextVal = Math.max(0, currentVal - 1);
                onUpdateProgress(nextVal);
              }}
              disabled={currentVal <= 0}
              className="h-7 w-7 rounded-lg bg-card border border-border text-ink hover:border-hotpink flex items-center justify-center text-xs font-black disabled:opacity-40 cursor-pointer"
            >
              -
            </button>
            <span
              onClick={onToggle}
              className={cn(
                "px-2 text-[12px] font-black cursor-pointer",
                isCompleted ? "text-hotpink" : "text-ink"
              )}
            >
              {currentVal}/{target}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextVal = currentVal + 1;
                onUpdateProgress(nextVal);
              }}
              className="h-7 w-7 rounded-lg bg-card border border-border text-ink hover:border-hotpink flex items-center justify-center text-xs font-black cursor-pointer"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* 2. Habit Title & Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg shrink-0">{habit.emoji}</span>
          <h4
            className={cn(
              "text-[14px] font-bold text-ink truncate",
              isCompleted && "line-through text-ink-light"
            )}
          >
            {habit.name}
          </h4>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-light font-medium mt-1">
          <span className="text-hotpink font-bold flex items-center gap-0.5">
            <Flame className="h-3 w-3 fill-hotpink" />
            <span>{habit.streak || 0} {isAr ? "يوم" : "days"}</span>
          </span>
          <span>•</span>
          <span>{habit.category}</span>
          {habit.preferredTime && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-hotpink" />
                <span>{habit.preferredTime}</span>
              </span>
            </>
          )}
          {habit.reminder && <span>🔔</span>}
        </div>
      </div>

      {/* 3. Menu (•••) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="h-8 w-8 rounded-xl bg-surface border border-border text-ink hover:border-hotpink flex items-center justify-center transition-colors cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border-t sm:border border-border/80 p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl space-y-2 animate-slide-up text-ink font-sans max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
              <span className="text-sm font-extrabold truncate max-w-[280px] text-ink">
                {isAr && habit.nameAr ? habit.nameAr : habit.name}
              </span>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="cursor-pointer p-1.5 rounded-full bg-surface text-ink-light hover:text-ink active:scale-90"
              >
                <X size={16} />
              </button>
            </div>


            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onViewDetail();
              }}
              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <BarChart2 size={17} />
              </span>
              <span>{isAr ? "عرض إحصائيات والتقدم 📊" : "View Progress 📊"}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onSkip();
              }}
              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-ink hover:bg-surface active:scale-98 transition-all text-start"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <RotateCcw size={17} />
              </span>
              <span>{isAr ? "تخطي العادة لليوم" : "Skip for Today"}</span>
            </button>

            <div className="border-t border-border/60 my-1 pt-1" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDelete();
              }}
              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-98 transition-all text-start"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <Trash2 size={17} />
              </span>
              <span>{isAr ? "حذف العادة نهائياً" : "Delete Habit"}</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
});
