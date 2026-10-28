import React from "react";
import {
  PieChart,
  BarChart3,
  Zap,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  CANONICAL_MOODS,
  type MoodSummaryStats,
  type MoodPalette,
  type DailyMoodRecord,
  getDaysInMonth,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface InsightsTabProps {
  stats: MoodSummaryStats;
  year: number;
  palette: MoodPalette;
  dailyMoods: Record<string, DailyMoodRecord>;
  onCheckInToday: () => void;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  stats,
  year,
  palette,
  dailyMoods,
  onCheckInToday,
}) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const MONTH_NAMES = [
    { en: "Jan", ar: "يناير" },
    { en: "Feb", ar: "فبراير" },
    { en: "Mar", ar: "مارس" },
    { en: "Apr", ar: "أبريل" },
    { en: "May", ar: "مايو" },
    { en: "Jun", ar: "يونيو" },
    { en: "Jul", ar: "يوليو" },
    { en: "Aug", ar: "أغسطس" },
    { en: "Sep", ar: "سبتمبر" },
    { en: "Oct", ar: "أكتوبر" },
    { en: "Nov", ar: "نوفمبر" },
    { en: "Dec", ar: "ديسمبر" },
  ];

  if (stats.daysLoggedYear === 0) {
    return (
      <div className="px-4 pt-4 pb-28 text-center space-y-3 animate-fade-in">
        <div className="p-8 rounded-3xl bg-card border border-dashed border-border/80 max-w-sm mx-auto space-y-3">
          <span className="text-4xl">🌈</span>
          <h4 className="text-sm font-bold text-ink">
            {t("insightsEmptyTitle") ||
              (isAr
                ? "ستظهر إحصاءاتكِ بعد بضعة تسجيلات."
                : "Your insights will appear after a few check-ins.")}
          </h4>
          <p className="text-xs text-ink-light leading-relaxed">
            {t("yearEmptyDesc") ||
              (isAr
                ? "اختاري شعور اليوم عندما تكونين مستعدة."
                : "Choose today’s mood whenever you feel ready.")}
          </p>
          <button
            onClick={onCheckInToday}
            className="mt-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95 transition-all"
          >
            {t("checkInTodayBtn") || (isAr ? "سجّلي شعور اليوم" : "Check in today")}
          </button>
        </div>
      </div>
    );
  }

  // Monthly breakdown counts
  const monthlyCounts = MONTH_NAMES.map((_, mIdx) => {
    const prefix = `${year}-${String(mIdx + 1).padStart(2, "0")}-`;
    const count = Object.keys(dailyMoods || {}).filter((k) => k.startsWith(prefix)).length;
    return count;
  });

  const maxMonthCount = Math.max(...monthlyCounts, 1);

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* 1. Gentle Factual Notice */}
      <div className="rounded-3xl bg-pink-500/10 border border-pink-500/20 p-4 text-center space-y-1">
        <span className="text-xl">🌸</span>
        <h3 className="text-sm font-bold text-ink">
          {isAr
            ? `سجّلتِ مشاعركِ في ${stats.daysLoggedYear} يومًا خلال سنة ${year}`
            : `You logged your mood on ${stats.daysLoggedYear} days in ${year}`}
        </h3>
        <p className="text-xs text-ink-light max-w-sm mx-auto">
          {isAr
            ? "هذه الإحصاءات توثيق بصري هادئ لرحلتكِ، دون أحكام أو تصنيفات قاسية."
            : "A gentle visual reflection of your journey—no scores, pressure, or judgment."}
        </p>
      </div>

      {/* 2. Mood Distribution Card */}
      <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <PieChart size={14} className="text-pink-500" />
          <span>{isAr ? "توزيع المشاعر خلال السنة" : "Yearly Mood Distribution"}</span>
        </div>

        <div className="space-y-2.5">
          {CANONICAL_MOODS.map((m) => {
            const count = stats.moodCounts[m.id] || 0;
            const percentage = stats.daysLoggedYear > 0
              ? Math.round((count / stats.daysLoggedYear) * 100)
              : 0;
            const color = palette.moodColors[m.id] || m.defaultColor;

            return (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <span>{m.emoji}</span>
                    <span>{isAr ? m.labelAr : m.labelEn}</span>
                  </span>
                  <span className="text-ink-light font-bold">
                    {count} {isAr ? "يوم" : "days"} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/30">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Monthly Activity Breakdown Card */}
      <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <BarChart3 size={14} className="text-purple-500" />
          <span>{isAr ? "أيام التسجيل حسب الشهر" : "Check-in Days by Month"}</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
          {MONTH_NAMES.map((m, mIdx) => {
            const count = monthlyCounts[mIdx];
            const heightPct = Math.round((count / maxMonthCount) * 100);

            return (
              <div key={m.en} className="flex flex-col items-center gap-1">
                <div className="w-full h-20 bg-surface rounded-xl flex items-end p-1 border border-border/40">
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-lg transition-all duration-500"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-ink">
                  {isAr ? m.ar.slice(0, 3) : m.en}
                </span>
                <span className="text-[9px] text-ink-light font-mono">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Energy Distribution Card */}
      <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <Zap size={14} className="text-amber-500" />
          <span>{isAr ? "توزيع مستويات الطاقة" : "Energy Levels"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-surface border border-border/50 space-y-1">
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {stats.energyCounts.low}
            </span>
            <p className="text-[11px] font-bold text-ink">{isAr ? "منخفضة 🪫" : "Low 🪫"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-surface border border-border/50 space-y-1">
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {stats.energyCounts.medium}
            </span>
            <p className="text-[11px] font-bold text-ink">{isAr ? "متوسطة ⚡" : "Medium ⚡"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-surface border border-border/50 space-y-1">
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {stats.energyCounts.high}
            </span>
            <p className="text-[11px] font-bold text-ink">{isAr ? "مرتفعة 🚀" : "High 🚀"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
