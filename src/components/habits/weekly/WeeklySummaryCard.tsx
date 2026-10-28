import React from "react";
import { Sparkles, Flame, CheckCircle2, Heart, CalendarCheck2 } from "lucide-react";
import type { WeeklyHabitProgress } from "../../../lib/weeklyHabitEngine";

interface WeeklySummaryCardProps {
  progress: WeeklyHabitProgress;
  isAr: boolean;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ progress, isAr }) => {
  const getEncouragementText = () => {
    if (progress.isFutureWeek) {
      return isAr
        ? "أسبوع قادم مليء بالفرص والبدايات الهادئة 🌸"
        : "An upcoming week ready for gentle steps and fresh intention 🌸";
    }
    if (!progress.hasEligibleDue || progress.dueOccurrences === 0) {
      return isAr
        ? "ابدئي بتحديد عاداتكِ لهذا الأسبوع بلطف ✨"
        : "Begin this week with gentle consistency ✨";
    }
    if (progress.percentage >= 90) {
      return isAr
        ? "تألق استثنائي! استمراريتكِ تبعث على الفخر والإلهام 💖"
        : "Radiant consistency! You are showing up beautifully 💖";
    }
    if (progress.percentage >= 70) {
      return isAr
        ? "إيقاع رائع ومتوازن، خطوة بخطوة نحو أهدافكِ 🌸"
        : "A wonderful, balanced rhythm. One gentle step at a time 🌸";
    }
    if (progress.percentage >= 40) {
      return isAr
        ? "كل خطوة صغيرة لها أثر كبير، استمري بلطف 🕊️"
        : "Every small step counts. Keep moving forward with ease 🕊️";
    }
    return isAr
      ? "تذكّري: الاستمرارية بلطف قبل المثالية دائماً 🤍"
      : "Remember: Consistency with kindness over perfection 🤍";
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-pink-200/70 dark:border-pink-900/40 p-4 sm:p-5 shadow-sm transition-all">
      {/* Delicate pastel top gradient line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress & Headline */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-ink">
              {progress.isFutureWeek
                ? isAr ? "تخطيط الأسبوع" : "Planned Week"
                : !progress.hasEligibleDue
                ? isAr ? "لا توجد عادات مجدولة" : "No Due Habits"
                : `${progress.percentage}%`}
            </span>
            <span className="text-[12.5px] font-bold text-ink-light">
              {progress.isCurrentWeek
                ? progress.hasEligibleDue
                  ? isAr ? `(من المجدول حتى اليوم)` : `(due through today)`
                  : ""
                : progress.isPastWeek
                ? progress.hasEligibleDue
                  ? isAr ? `(إجمالي الأسبوع)` : `(whole week)`
                  : ""
                : isAr ? `(أسبوع قادم)` : `(upcoming)`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-pink-100/70 dark:bg-pink-950/40 rounded-full overflow-hidden p-0.5 border border-pink-200/40 dark:border-pink-900/30">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress.isFutureWeek || !progress.hasEligibleDue ? 0 : progress.percentage}%`,
              }}
            />
          </div>

          <p className="text-[12px] font-medium text-ink-light flex items-center gap-1.5 pt-0.5">
            <Heart className="h-3.5 w-3.5 text-hotpink shrink-0" />
            <span>{getEncouragementText()}</span>
          </p>
        </div>

        {/* Micro-metrics pills */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Completed / Due or Planned */}
          <div className="px-3 py-2 rounded-2xl bg-surface border border-border/80 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="text-start leading-tight">
              <span className="text-[10px] text-ink-light block font-semibold">
                {progress.isFutureWeek ? (isAr ? "مخطط" : "Planned") : (isAr ? "المكتمل" : "Completed")}
              </span>
              <span className="text-[12.5px] font-bold text-ink">
                {progress.isFutureWeek ? (
                  <span>{progress.totalWholeWeekPossible} {isAr ? "مخطط" : "habits"}</span>
                ) : (
                  <>
                    {progress.completedOccurrences}
                    <span className="text-ink-light font-normal text-[11px]">
                      /{progress.isCurrentWeek ? progress.dueOccurrences : progress.totalWholeWeekPossible}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Days with check-ins (Neutral replacement for Top Habit) */}
          <div className="px-3 py-2 rounded-2xl bg-surface border border-border/80 flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4 text-hotpink shrink-0" />
            <div className="text-start leading-tight">
              <span className="text-[10px] text-ink-light block font-semibold">
                {isAr ? "أيام الإنجاز" : "Check-in Days"}
              </span>
              <span className="text-[12.5px] font-bold text-ink">
                {progress.daysWithCheckinsCount}/7
              </span>
            </div>
          </div>

          {progress.perfectDaysCount > 0 && !progress.isFutureWeek && (
            <div className="px-3 py-2 rounded-2xl bg-surface border border-border/80 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="text-start leading-tight">
                <span className="text-[10px] text-ink-light block font-semibold">
                  {isAr ? "أيام كاملة" : "Perfect Days"}
                </span>
                <span className="text-[12.5px] font-bold text-ink">
                  {progress.perfectDaysCount}d
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
