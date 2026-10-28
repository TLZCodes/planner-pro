import React from "react";
import {
  CheckCircle2,
  Sparkles,
  Timer,
  GraduationCap,
  Target,
  ListTodo,
  Smile,
  Droplets,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekOverviewMetrics } from "@/lib/weeklyResetEngine";
import type { WeekInfo } from "@/lib/weeklyHabitEngine";

interface ResetOverviewStepProps {
  metrics: WeekOverviewMetrics;
  weekInfo: WeekInfo;
  isCurrentWeek: boolean;
  isAr: boolean;
  onContinue: () => void;
}

export const ResetOverviewStep: React.FC<ResetOverviewStepProps> = ({
  metrics,
  weekInfo,
  isCurrentWeek,
  isAr,
  onContinue,
}) => {
  const focusMinutes = Math.round(metrics.totalFocusSeconds / 60);
  const focusHours = (focusMinutes / 60).toFixed(1);
  const studyHours = (metrics.totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Intro greeting */}
      <div className="rounded-3xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 p-4">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <span>🌿</span>
          <span>
            {isAr
              ? isCurrentWeek
                ? "نظرة هادئة على أسبوعكِ حتى الآن"
                : "نظرة هادئة وموثوقة على حصاد الأسبوع"
              : isCurrentWeek
              ? "A gentle view of your week so far"
              : "A gentle factual look at your week"}
          </span>
        </h3>
        <p className="text-xs font-medium text-ink-light mt-1">
          {isAr
            ? "جميع الأرقام مستمدة مباشرة من أنشطتكِ المسجلة دون أي تقديرات مصطنعة أو مقارنات مجحفة."
            : "All figures are drawn directly from your recorded actions with zero estimation or pressure."}
        </p>
      </div>

      {!metrics.hasAnyActivity ? (
        /* Neutral empty state */
        <div className="rounded-3xl border border-dashed border-border/80 bg-surface/50 p-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10 text-hotpink">
            <Sparkles size={22} />
          </div>
          <h4 className="text-sm font-extrabold text-ink">
            {isAr ? "لا توجد سجلات مسجلة لهذا الأسبوع بعد 🌸" : "No records for this week yet 🌸"}
          </h4>
          <p className="text-xs font-medium text-ink-light max-w-sm mx-auto">
            {isAr
              ? "مساحتكِ نقية تمامًا. يمكنكِ البدء بتدوين تأملاتكِ أو التخطيط للأيام القادمة برفق."
              : "Your week is quiet and open. You can still write reflections or plan ahead with a restful mind."}
          </p>
        </div>
      ) : (
        /* Metrics Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Tasks Completed */}
          <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>{isAr ? "المهام المنجزة" : "Tasks Done"}</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                {isAr ? "أسبوعي" : "week"}
              </span>
            </div>
            <div className="text-xl font-black text-ink">
              {metrics.completedTasksCount}
            </div>
            <p className="text-[10px] font-semibold text-ink-light/80">
              {isAr
                ? `${metrics.completedTasksCount} مهمة أُنجزت خلال هذا الأسبوع`
                : `${metrics.completedTasksCount} completed in this week window`}
            </p>
          </div>

          {/* 2. Habit Progress */}
          {(() => {
            const habitDenominator = isCurrentWeek
              ? metrics.habitProgress.dueOccurrences
              : metrics.habitProgress.totalWholeWeekPossible;
            const hasEligibleHabits = metrics.habitProgress.hasEligibleDue && habitDenominator > 0;

            return (
              <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                    <Sparkles size={14} className="text-hotpink" />
                    <span>{isAr ? "إنجاز العادات" : "Habits"}</span>
                  </span>
                  <span className={cn(
                    "text-[10px] font-extrabold px-1.5 py-0.5 rounded-full",
                    hasEligibleHabits
                      ? "bg-hotpink/10 text-hotpink"
                      : "bg-surface text-ink-light border border-border/60"
                  )}>
                    {hasEligibleHabits
                      ? `${metrics.habitProgress.percentage}%`
                      : isAr ? "لا عادات" : "No Habits"}
                  </span>
                </div>
                <div className="text-xl font-black text-ink">
                  {hasEligibleHabits ? metrics.habitProgress.completedOccurrences : 0}
                  <span className="text-xs font-bold text-ink-light ml-1">
                    / {hasEligibleHabits ? habitDenominator : 0}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-ink-light/80">
                  {hasEligibleHabits
                    ? isAr
                      ? isCurrentWeek
                        ? `${metrics.habitProgress.completedOccurrences} من أصل ${habitDenominator} عادة مستحقة حتى اليوم`
                        : `${metrics.habitProgress.completedOccurrences} من أصل ${habitDenominator} عادة مستحقة للأسبوع`
                      : isCurrentWeek
                      ? `${metrics.habitProgress.completedOccurrences} completed of ${habitDenominator} due through today`
                      : `${metrics.habitProgress.completedOccurrences} completed of ${habitDenominator} due for the week`
                    : isAr
                    ? "لا توجد عادات مستحقة لهذا الأسبوع"
                    : "No due habits scheduled for this week"}
                </p>
              </div>
            );
          })()}

          {/* 3. Focus Time */}
          <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                <Timer size={14} className="text-amber-500" />
                <span>{isAr ? "وقت التركيز" : "Focus Time"}</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                {focusMinutes > 60 ? `${focusHours}h` : `${focusMinutes}m`}
              </span>
            </div>
            <div className="text-xl font-black text-ink">
              {focusMinutes}
              <span className="text-xs font-bold text-ink-light ml-1">
                {isAr ? "دقيقة" : "min"}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-ink-light/80">
              {isAr ? "جلسات تركيز موثقة" : "Recorded focus blocks"}
            </p>
          </div>

          {/* 4. Study Time (with Overlap Badge) */}
          <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                <GraduationCap size={14} className="text-blue-500" />
                <span>{isAr ? "وقت الدراسة" : "Study Time"}</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                {metrics.totalStudyMinutes > 60
                  ? `${studyHours}h`
                  : `${metrics.totalStudyMinutes}m`}
              </span>
            </div>
            <div className="text-xl font-black text-ink">
              {metrics.totalStudyMinutes}
              <span className="text-xs font-bold text-ink-light ml-1">
                {isAr ? "دقيقة" : "min"}
              </span>
            </div>
            {metrics.studyFocusOverlapMinutes > 0 ? (
              <p className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Info size={10} className="shrink-0" />
                <span>
                  {isAr
                    ? `يشمل ${metrics.studyFocusOverlapMinutes} دقيقة مسجلة بكتل التركيز`
                    : `Includes ${metrics.studyFocusOverlapMinutes}m during focus blocks`}
                </span>
              </p>
            ) : (
              <p className="text-[10px] font-semibold text-ink-light/80">
                {isAr ? "جلسات مذاكرة مسجلة" : "Dedicated study logged"}
              </p>
            )}
          </div>

          {/* 5. Goals snapshot */}
          <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                <Target size={14} className="text-purple-500" />
                <span>{isAr ? "الأهداف النشطة" : "Active Goals"}</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                {isAr ? "لقطة حالية" : "snapshot"}
              </span>
            </div>
            <div className="text-xl font-black text-ink">
              {metrics.activeGoalsCount}
            </div>
            <p className="text-[10px] font-semibold text-ink-light/80">
              {isAr
                ? `${metrics.goalsWithProgressCount} هدف به تقدم مسجل`
                : `${metrics.goalsWithProgressCount} with recorded progress`}
            </p>
          </div>

          {/* 6. Routines & Wellbeing */}
          <div className="rounded-2xl bg-card border border-pink-200/50 dark:border-pink-900/30 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-light flex items-center gap-1.5">
                <Smile size={14} className="text-rose-500" />
                <span>{isAr ? "حضور المزاج" : "Mood Logs"}</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                {metrics.daysWithMoodLogsCount} / 7
              </span>
            </div>
            <div className="text-xl font-black text-ink">
              {metrics.daysWithMoodLogsCount}
              <span className="text-xs font-bold text-ink-light ml-1">
                {isAr ? "أيام" : "days"}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-ink-light/80">
              {isAr
                ? metrics.routineDoneCount > 0
                  ? `${metrics.routineDoneCount} خطوة روتين منجزة`
                  : "تسجيلات الحالة الشعورية"
                : metrics.routineDoneCount > 0
                ? `${metrics.routineDoneCount} routine steps checked`
                : "Mindful check-in days"}
            </p>
          </div>
        </div>
      )}

      {/* Button to proceed to next step */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "الانتقال إلى التأملات 🌸" : "Continue to Reflections 🌸"}</span>
        </button>
      </div>
    </div>
  );
};
