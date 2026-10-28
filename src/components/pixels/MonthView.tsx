import React from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  getDaysInMonth,
  getFirstDayWeekday,
  formatDayKey,
  isFutureDate,
  CANONICAL_MOODS,
  type MoodPalette,
  type DailyMoodRecord,
  type LegacyMoodSnapshot,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  year: number;
  monthIndex: number;
  onMonthChange: (newMonthIndex: number) => void;
  dailyMoods: Record<string, DailyMoodRecord>;
  legacySnapshots: Record<string, LegacyMoodSnapshot>;
  palette: MoodPalette;
  weekStart: "mon" | "sun";
  todayStr: string;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  year,
  monthIndex,
  onMonthChange,
  dailyMoods,
  legacySnapshots,
  palette,
  weekStart,
  todayStr,
  selectedDate,
  onSelectDate,
}) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const MONTHS_LIST = [
    { nameEn: "January", nameAr: "يناير" },
    { nameEn: "February", nameAr: "فبراير" },
    { nameEn: "March", nameAr: "مارس" },
    { nameEn: "April", nameAr: "أبريل" },
    { nameEn: "May", nameAr: "مايو" },
    { nameEn: "June", nameAr: "يونيو" },
    { nameEn: "July", nameAr: "يوليو" },
    { nameEn: "August", nameAr: "أغسطس" },
    { nameEn: "September", nameAr: "سبتمبر" },
    { nameEn: "October", nameAr: "أكتوبر" },
    { nameEn: "November", nameAr: "نوفمبر" },
    { nameEn: "December", nameAr: "ديسمبر" },
  ];

  const weekdays =
    weekStart === "mon"
      ? isAr
        ? ["إث", "ثل", "أرب", "خم", "جم", "سب", "أح"]
        : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
      : isAr
      ? ["أح", "إث", "ثل", "أرب", "خم", "جم", "سب"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => {
    if (monthIndex > 0) onMonthChange(monthIndex - 1);
  };

  const handleNextMonth = () => {
    if (monthIndex < 11) onMonthChange(monthIndex + 1);
  };

  const daysCount = getDaysInMonth(year, monthIndex);
  const offset = getFirstDayWeekday(year, monthIndex, weekStart);
  const currentMonthObj = MONTHS_LIST[monthIndex];

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* Month Navigation Row */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm">
        <button
          onClick={handlePrevMonth}
          disabled={monthIndex === 0}
          className="p-2 rounded-xl text-ink-light hover:text-ink hover:bg-surface disabled:opacity-30 active:scale-95 transition-all"
          aria-label={isAr ? "الشهر السابق" : "Previous Month"}
        >
          {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="text-center">
          <h3 className="text-base font-black text-ink">
            {isAr ? currentMonthObj.nameAr : currentMonthObj.nameEn} {year}
          </h3>
        </div>

        <button
          onClick={handleNextMonth}
          disabled={monthIndex === 11}
          className="p-2 rounded-xl text-ink-light hover:text-ink hover:bg-surface disabled:opacity-30 active:scale-95 transition-all"
          aria-label={isAr ? "الشهر التالي" : "Next Month"}
        >
          {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* 44x44 Accessible Day Grid Card */}
      <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3">
        {/* Weekday Row */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-ink-light">
          {weekdays.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`offset-${i}`} className="min-h-[44px] min-w-[44px] aspect-square" />
          ))}

          {Array.from({ length: daysCount }).map((_, dIdx) => {
            const dayNum = dIdx + 1;
            const dateKey = formatDayKey(year, monthIndex, dayNum);
            const isToday = dateKey === todayStr;
            const isSelected = dateKey === selectedDate;
            const isFuture = isFutureDate(dateKey, todayStr);
            const record = dailyMoods[dateKey];
            const legacy = legacySnapshots[dateKey];

            const moodDef = record ? CANONICAL_MOODS.find((m) => m.id === record.mood) : null;
            const moodColor = record ? palette.moodColors[record.mood] : undefined;

            // Screen reader accessible label
            const dateLabel = isAr
              ? `${dayNum} ${currentMonthObj.nameAr}`
              : `${currentMonthObj.nameEn} ${dayNum}`;
            const moodLabel = moodDef ? (isAr ? moodDef.labelAr : moodDef.labelEn) : (isAr ? "غير مسجل" : "Not logged");
            const energyLabel = record?.energy ? (isAr ? `الطاقة ${record.energy}` : `Energy ${record.energy}`) : "";
            const ariaLabel = `${dateLabel}, ${moodLabel}${energyLabel ? `, ${energyLabel}` : ""}`;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isFuture}
                onClick={() => onSelectDate(dateKey)}
                aria-label={ariaLabel}
                style={{ backgroundColor: moodColor }}
                className={cn(
                  "min-h-[44px] min-w-[44px] aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border shadow-sm select-none",
                  record
                    ? "text-white font-bold border-white/40 shadow-sm"
                    : legacy
                    ? "bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold"
                    : isFuture
                    ? "bg-surface/40 border-border/30 text-ink-light/40 opacity-40 cursor-not-allowed"
                    : "bg-surface border-border/60 text-ink hover:border-pink-400 hover:bg-ghost active:scale-95 cursor-pointer",
                  isToday && "ring-2 ring-hotpink ring-offset-2 ring-offset-card shadow-rose-sm",
                  isSelected && "ring-2 ring-ink ring-offset-1"
                )}
              >
                <span className={cn("text-xs leading-none font-bold", record && "drop-shadow")}>
                  {dayNum}
                </span>

                {record && moodDef && (
                  <span className="text-sm mt-1 leading-none drop-shadow">
                    {moodDef.emoji}
                  </span>
                )}

                {legacy && !record && (
                  <span className="text-xs text-amber-600 mt-0.5 leading-none" title="Legacy unresolved: Sick">
                    ⚠️
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
