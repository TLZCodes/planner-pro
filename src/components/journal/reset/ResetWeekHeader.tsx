import React from "react";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekInfo } from "@/lib/weeklyHabitEngine";

interface ResetWeekHeaderProps {
  weekInfo: WeekInfo;
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onPickDate: (dateStr: string) => void;
  isAr: boolean;
}

export const ResetWeekHeader: React.FC<ResetWeekHeaderProps> = ({
  weekInfo,
  weekOffset,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onPickDate,
  isAr,
}) => {
  const isCurrentWeek = weekOffset === 0;
  const isFutureWeek = weekOffset > 0;

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-200/70 dark:border-pink-900/40 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title and Week Badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌸</span>
            <h2 className="text-base font-black text-ink">
              {isAr ? "مساحة مراجعة الأسبوع" : "Weekly Reset Studio"}
            </h2>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border",
                isCurrentWeek
                  ? "bg-hotpink/10 text-hotpink border-hotpink/20"
                  : isFutureWeek
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/40"
                  : "bg-ink/5 text-ink-light border-border/80"
              )}
            >
              {isCurrentWeek
                ? isAr
                  ? "الأسبوع الحالي (حتى الآن)"
                  : "Current week (so far)"
                : isFutureWeek
                ? isAr
                  ? "أسبوع قادم (تخطيط)"
                  : "Future week (planning)"
                : isAr
                ? "أسبوع مضى"
                : "Past week"}
            </span>
          </div>

          <p className="text-xs font-semibold text-ink-light flex items-center gap-1.5">
            <Calendar size={13} className="text-hotpink shrink-0" />
            <span>{weekInfo.formattedRange}</span>
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label={isAr ? "الأسبوع السابق" : "Previous week"}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink active:scale-95 transition-all shadow-2xs"
          >
            {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {!isCurrentWeek && (
            <button
              type="button"
              onClick={onCurrentWeek}
              className="cursor-pointer px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-hotpink/10 text-hotpink border border-hotpink/25 hover:bg-hotpink/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <RotateCcw size={11} />
              <span>{isAr ? "هذا الأسبوع" : "This Week"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNextWeek}
            aria-label={isAr ? "الأسبوع التالي" : "Next week"}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink active:scale-95 transition-all shadow-2xs"
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
