import React from "react";
import { Calendar, Heart, Flame, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { CANONICAL_MOODS, type MoodSummaryStats } from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface SummaryStripProps {
  stats: MoodSummaryStats;
  streak: number;
  showStreak: boolean;
  selectedYear: number;
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({
  stats,
  streak,
  showStreak,
  selectedYear,
}) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const topMoodDef = stats.topMood
    ? CANONICAL_MOODS.find((m) => m.id === stats.topMood)
    : null;

  return (
    <div className="space-y-2 px-4 pt-1">
      {/* Compact Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Days checked in this year */}
        <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-base font-black text-ink leading-none block">
              {stats.daysLoggedYear}
            </span>
            <span className="text-[10px] font-medium text-ink-light truncate block mt-0.5">
              {t("statDaysCheckedIn") || (isAr ? "أيام التسجيل" : "Days checked in")}
            </span>
          </div>
        </div>

        {/* 2. Days checked in this month */}
        <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-base font-black text-ink leading-none block">
              {stats.daysLoggedMonth}
            </span>
            <span className="text-[10px] font-medium text-ink-light truncate block mt-0.5">
              {t("statThisMonth") || (isAr ? "هذا الشهر" : "This month")}
            </span>
          </div>
        </div>

        {/* 3. Most frequent mood */}
        <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-base flex-shrink-0">
            {topMoodDef ? topMoodDef.emoji : "—"}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-ink leading-none truncate block">
              {topMoodDef
                ? stats.isTie
                  ? isAr
                    ? `${topMoodDef.labelAr} (تعادل)`
                    : `${topMoodDef.labelEn} (Tie)`
                  : isAr
                  ? topMoodDef.labelAr
                  : topMoodDef.labelEn
                : "—"}
            </span>
            <span className="text-[10px] font-medium text-ink-light truncate block mt-0.5">
              {t("statMostFrequentMood") || (isAr ? "الشعور الأكثر تكرارًا" : "Top mood")}
            </span>
          </div>
        </div>

        {/* 4. Gentle streak (optional) */}
        {showStreak && (
          <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0">
              <Flame size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-base font-black text-ink leading-none block">
                {streak} {isAr ? "أيام" : "days"}
              </span>
              <span className="text-[10px] font-medium text-ink-light truncate block mt-0.5">
                {t("statGentleStreak") || (isAr ? "الاستمرارية" : "Gentle streak")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Gentle supportive note under streak if active */}
      {showStreak && streak > 0 && (
        <p className="text-[11px] text-ink-light/80 italic text-center px-2">
          {t("streakSupportiveCopy") ||
            (isAr ? "كل تسجيل له قيمته، حتى بعد انقطاع." : "Every check-in is valuable, even after a break.")}
        </p>
      )}
    </div>
  );
};
