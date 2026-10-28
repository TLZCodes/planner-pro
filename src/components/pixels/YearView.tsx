import React from "react";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  getDaysInMonth,
  getFirstDayWeekday,
  formatDayKey,
  isFutureDate,
  type MoodPalette,
  type DailyMoodRecord,
  type LegacyMoodSnapshot,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface YearViewProps {
  year: number;
  dailyMoods: Record<string, DailyMoodRecord>;
  legacySnapshots: Record<string, LegacyMoodSnapshot>;
  palette: MoodPalette;
  weekStart: "mon" | "sun";
  todayStr: string;
  onSelectMonth: (monthIndex: number) => void;
  onSelectDate: (dateKey: string) => void;
}

export const YearView: React.FC<YearViewProps> = ({
  year,
  dailyMoods,
  legacySnapshots,
  palette,
  weekStart,
  todayStr,
  onSelectMonth,
  onSelectDate,
}) => {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const MONTHS_LIST = [
    { nameEn: "January", shortEn: "Jan", nameAr: "يناير", shortAr: "ينا" },
    { nameEn: "February", shortEn: "Feb", nameAr: "فبراير", shortAr: "فبر" },
    { nameEn: "March", shortEn: "Mar", nameAr: "مارس", shortAr: "مار" },
    { nameEn: "April", shortEn: "Apr", nameAr: "أبريل", shortAr: "أبر" },
    { nameEn: "May", shortEn: "May", nameAr: "مايو", shortAr: "ماي" },
    { nameEn: "June", shortEn: "Jun", nameAr: "يونيو", shortAr: "يون" },
    { nameEn: "July", shortEn: "Jul", nameAr: "يوليو", shortAr: "يول" },
    { nameEn: "August", shortEn: "Aug", nameAr: "أغسطس", shortAr: "أغس" },
    { nameEn: "September", shortEn: "Sep", nameAr: "سبتمبر", shortAr: "سبت" },
    { nameEn: "October", shortEn: "Oct", nameAr: "أكتوبر", shortAr: "أكت" },
    { nameEn: "November", shortEn: "Nov", nameAr: "نوفمبر", shortAr: "نوف" },
    { nameEn: "December", shortEn: "Dec", nameAr: "ديسمبر", shortAr: "ديس" },
  ];

  const weekdays =
    weekStart === "mon"
      ? isAr
        ? ["إث", "ثل", "أر", "خم", "جم", "سب", "أح"]
        : ["M", "T", "W", "T", "F", "S", "S"]
      : isAr
      ? ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"]
      : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-3 px-4 pt-2 pb-28 animate-fade-in">
      {/* Quick Month Jump Toolbar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {MONTHS_LIST.map((m, idx) => (
          <button
            key={m.nameEn}
            type="button"
            onClick={() => onSelectMonth(idx)}
            className="cursor-pointer shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface border border-border/70 text-ink-light hover:text-ink hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/30 transition-all active:scale-95"
            title={`${isAr ? m.nameAr : m.nameEn} — ${year}`}
          >
            {isAr ? m.shortAr : m.shortEn}
          </button>
        ))}
      </div>

      {/* Compact 12-Month Annual Matrix (2-col mobile, 3-col tablet, 4-col desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {MONTHS_LIST.map((mObj, mIdx) => {
          const daysCount = getDaysInMonth(year, mIdx);
          const offset = getFirstDayWeekday(year, mIdx, weekStart);

          // Calculate logged days in this month
          let monthLogged = 0;
          for (let d = 1; d <= daysCount; d++) {
            const k = formatDayKey(year, mIdx, d);
            if (dailyMoods[k] || legacySnapshots[k]) {
              monthLogged++;
            }
          }

          return (
            <div
              key={mObj.nameEn}
              className="p-2.5 sm:p-3 rounded-2xl bg-card border border-border/70 shadow-xs hover:border-pink-300/80 transition-all space-y-2 group"
            >
              {/* Month Card Header */}
              <div
                onClick={() => onSelectMonth(mIdx)}
                className="flex items-center justify-between pb-1.5 border-b border-border/40 cursor-pointer"
                title={isAr ? `فتح ${mObj.nameAr}` : `Open ${mObj.nameEn}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-black text-ink truncate group-hover:text-hotpink transition-colors">
                    {isAr ? mObj.nameAr : mObj.nameEn}
                  </span>
                  <span className="text-[9px] font-semibold text-ink-light shrink-0">
                    {monthLogged}/{daysCount}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-[10px] font-bold text-hotpink group-hover:underline shrink-0">
                  <span>{isAr ? "فتح" : "Open"}</span>
                  {isAr ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
                </div>
              </div>

              {/* Weekday Tiny Headers */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-bold text-ink-light select-none">
                {weekdays.map((w, wIdx) => (
                  <span key={`${w}-${wIdx}`}>{w}</span>
                ))}
              </div>

              {/* Compact Pixel Matrix */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`offset-${i}`} className="aspect-square w-full rounded-[2px]" />
                ))}

                {Array.from({ length: daysCount }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const dateKey = formatDayKey(year, mIdx, dayNum);
                  const isToday = dateKey === todayStr;
                  const isFuture = isFutureDate(dateKey, todayStr);
                  const record = dailyMoods[dateKey];
                  const hasLegacy = !!legacySnapshots[dateKey];

                  let fillColor = palette.emptyColor;
                  if (record) {
                    fillColor = palette.moodColors[record.mood] || "#F472B6";
                  } else if (hasLegacy) {
                    fillColor = "#F59E0B"; // Amber badge for unresolved legacy
                  } else if (isFuture) {
                    fillColor = palette.futureColor;
                  }

                  return (
                    <div
                      key={dateKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isFuture) {
                          onSelectDate(dateKey);
                        }
                      }}
                      title={`${mObj.nameEn} ${dayNum}${record ? `: ${record.mood}` : ""}`}
                      style={{ backgroundColor: fillColor }}
                      className={cn(
                        "aspect-square w-full rounded-[3px] transition-all relative flex items-center justify-center text-[7px]",
                        isToday && "ring-1.5 ring-hotpink ring-offset-0.5 z-10",
                        !isFuture && "hover:scale-125 cursor-pointer shadow-2xs hover:z-20",
                        isFuture && "opacity-35"
                      )}
                    >
                      {hasLegacy && !record && (
                        <span className="text-[6px] text-white font-bold leading-none">!</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
