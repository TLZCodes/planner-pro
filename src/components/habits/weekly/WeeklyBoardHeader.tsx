import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Calendar, RotateCcw, CalendarDays } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { WeekInfo, WeekStartDay } from "../../../lib/weeklyHabitEngine";

interface WeeklyBoardHeaderProps {
  weekInfo: WeekInfo;
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetToCurrentWeek: () => void;
  onSelectDate: (dateStr: string) => void;
  onOpenCustomize: () => void;
  firstDayOfWeek: WeekStartDay;
  isAr: boolean;
}

export const WeeklyBoardHeader: React.FC<WeeklyBoardHeaderProps> = ({
  weekInfo,
  weekOffset,
  onPrevWeek,
  onNextWeek,
  onResetToCurrentWeek,
  onSelectDate,
  onOpenCustomize,
  firstDayOfWeek,
  isAr,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const getWeekSubtitle = () => {
    if (weekOffset === 0) {
      return isAr ? "الأسبوع الحالي ✨" : "This Week ✨";
    }
    if (weekOffset === -1) {
      return isAr ? "الأسبوع الماضي 🕰️" : "Last Week 🕰️";
    }
    if (weekOffset === 1) {
      return isAr ? "الأسبوع القادم 🌿" : "Next Week 🌿";
    }
    if (weekOffset < 0) {
      return isAr ? `قبل ${Math.abs(weekOffset)} أسابيع` : `${Math.abs(weekOffset)} weeks ago`;
    }
    return isAr ? `بعد ${weekOffset} أسابيع` : `In ${weekOffset} weeks`;
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-purple-50/80 dark:from-pink-950/25 dark:via-rose-950/15 dark:to-purple-950/25 border border-pink-200/70 dark:border-pink-900/50 p-4 sm:p-5 shadow-sm backdrop-blur-xs transition-all space-y-3.5">
      {/* Decorative subtle dotted paper texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ec4899_0.6px,transparent_0.6px)] [background-size:12px_12px] opacity-[0.05] dark:opacity-[0.08]" />

      {/* Top Banner: Major Title with Handwritten English / Floral Arabic Accent */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-pink-200/50 dark:border-pink-900/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
            <span className={cn(!isAr && "font-caveat text-2xl sm:text-3xl font-bold text-hotpink tracking-wide")}>
              {isAr ? "أسبوعي 🌸" : "My Week 🌸"}
            </span>
          </h1>
          <p className="text-[12px] font-medium text-pink-800/80 dark:text-pink-200/80">
            {isAr ? "خطوات صغيرة تصنع أسبوعكِ" : "Small steps are shaping your week"}
          </p>
        </div>

        {/* Selected date range badge & customize quick button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenCustomize}
            className="h-8.5 px-3 rounded-2xl bg-white/90 dark:bg-card/90 border border-pink-200/80 dark:border-pink-900/60 flex items-center gap-1.5 text-[11.5px] font-bold text-ink hover:text-hotpink hover:border-hotpink/60 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={isAr ? "تخصيص لوحة الأسبوع" : "Customize Weekly Board"}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-hotpink" />
            <span>{isAr ? "تخصيص اللوحة" : "Customize"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        {/* Left / Prev, Today, Next */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevWeek}
            className="h-9 w-9 rounded-2xl bg-white/95 dark:bg-card/95 border border-pink-200/80 dark:border-pink-900/60 flex items-center justify-center text-ink hover:text-hotpink hover:border-hotpink/60 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={isAr ? "الأسبوع السابق" : "Previous Week"}
            aria-label={isAr ? "الأسبوع السابق" : "Previous Week"}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={onResetToCurrentWeek}
            className={cn(
              "h-9 px-3 rounded-2xl border flex items-center gap-1.5 text-[12px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer",
              weekOffset === 0
                ? "bg-pink-100/80 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800 text-hotpink cursor-default"
                : "bg-white/95 dark:bg-card/95 border-pink-200/80 dark:border-pink-900/60 text-ink hover:text-hotpink hover:bg-pink-50"
            )}
            title={isAr ? "العودة للأسبوع الحالي" : "Return to current week"}
          >
            <RotateCcw className="h-3.5 w-3.5 text-hotpink" />
            <span>{isAr ? "اليوم" : "Today"}</span>
          </button>

          <button
            type="button"
            onClick={onNextWeek}
            className="h-9 w-9 rounded-2xl bg-white/95 dark:bg-card/95 border border-pink-200/80 dark:border-pink-900/60 flex items-center justify-center text-ink hover:text-hotpink hover:border-hotpink/60 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={isAr ? "الأسبوع القادم" : "Next Week"}
            aria-label={isAr ? "الأسبوع القادم" : "Next Week"}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>

        {/* Center / Week Title & Range */}
        <div className="text-center flex-1 min-w-[150px]">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-hotpink/10 border border-hotpink/20 text-hotpink text-[11px] font-extrabold uppercase tracking-wider mb-0.5">
            <Calendar className="h-3 w-3" />
            <span>{getWeekSubtitle()}</span>
          </div>
          <h2 className="text-[14.5px] font-black text-ink tracking-tight">
            {weekInfo.formattedRange}
          </h2>
        </div>

        {/* Right / Calendar Picker */}
        <div className="flex items-center gap-2">
          {/* Native hidden datepicker input with accessible trigger */}
          <input
            ref={dateInputRef}
            type="date"
            onChange={handleDatePickerChange}
            value={weekInfo.weekStartDate}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => {
              if (dateInputRef.current) {
                if (typeof (dateInputRef.current as any).showPicker === "function") {
                  (dateInputRef.current as any).showPicker();
                } else {
                  dateInputRef.current.focus();
                  dateInputRef.current.click();
                }
              }
            }}
            className="h-9 px-3 rounded-2xl bg-white/95 dark:bg-card/95 border border-pink-200/80 dark:border-pink-900/60 flex items-center gap-1.5 text-[12px] font-bold text-ink hover:text-hotpink hover:border-hotpink/60 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={isAr ? "اختيار أسبوع محدد من التقويم" : "Select date from calendar"}
          >
            <CalendarDays className="h-3.5 w-3.5 text-hotpink" />
            <span className="hidden sm:inline">{isAr ? "اختر أسبوعاً" : "Pick Week"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
