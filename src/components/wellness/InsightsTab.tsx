import React, { useState } from "react";
import { Sparkles, Droplets, Moon, Activity, Smile, Heart, Info } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  calculateWellnessInsights,
  formatSleepDuration,
  convertMlToOz,
  type WellnessInsights,
} from "@/lib/wellnessEngine";

export const InsightsTab: React.FC = () => {
  const { t, lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";

  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7);

  const settings = state.wellnessSettings;
  const unit = settings?.waterUnit || "ml";
  const waterTargetMl = settings?.dailyWaterTarget
    ? (unit === "oz" ? Math.round(settings.dailyWaterTarget * 29.5735) : settings.dailyWaterTarget)
    : 2000;

  const insights: WellnessInsights = calculateWellnessInsights(
    state.hydrationEvents || [],
    state.sleepRecords || [],
    state.workoutLogs || [],
    state.dailyMoods || {},
    waterTargetMl,
    unit,
    rangeDays,
    new Date(),
    settings?.timezone
  );

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-200">
      {/* Time Range Pills */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-card border border-border/70 max-w-xs mx-auto shadow-2xs">
        {([7, 30, 90] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRangeDays(r)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              rangeDays === r
                ? "bg-rose-500 text-white shadow-2xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {r === 7 ? t("insightsRange7") : r === 30 ? t("insightsRange30") : t("insightsRange90")}
          </button>
        ))}
      </div>

      {!insights.hasEnoughData ? (
        <div className="py-14 text-center text-xs text-ink-muted bg-card rounded-3xl border border-dashed border-border/70 p-6">
          <span className="text-3xl block mb-3">🌿</span>
          <h3 className="text-sm font-bold text-ink mb-1.5">{t("beginGently")}</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            {t("emptyWellnessInsights")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Calm Gentle Banner */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
            <Sparkles size={18} className="shrink-0 text-rose-500 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {isAr ? "نظرة لطيفة على عاداتكِ" : "A Gentle Look at Your Rhythm"}
              </span>
              <span>
                {isAr
                  ? `خلال آخر ${rangeDays} أيام، تعتنين بنفسكِ خطوة بخطوة. لا ضغط ولا أحكام، فقط استمعي لجسدكِ.`
                  : `Over the past ${rangeDays} days, you're caring for yourself one moment at a time. No rigid targets—just noticing.`}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Hydration Insight */}
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-sky-500 mb-2">
                <Droplets size={16} />
                <span className="text-xs font-bold text-ink">
                  {t("waterIntake")}
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-ink">
                  {insights.averageWaterPerLoggedDay}{" "}
                  <span className="text-xs font-semibold text-ink-muted">
                    {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
                  </span>
                </span>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {t("avgDailyWater")}
                </p>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
                  {insights.waterTargetDays} / {rangeDays} {t("daysTargetReached")}
                </div>
              </div>
            </div>

            {/* Sleep Insight */}
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-indigo-500 mb-2">
                <Moon size={16} />
                <span className="text-xs font-bold text-ink">
                  {t("sleepRest")}
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-ink">
                  {formatSleepDuration(insights.averageSleepMinutes, isAr)}
                </span>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {t("avgSleepDuration")}
                </p>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  {insights.sleepLoggedDays} / {rangeDays} {t("loggedDaysOutOf")}
                </div>
              </div>
            </div>

            {/* Movement Insight */}
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <Activity size={16} />
                <span className="text-xs font-bold text-ink">
                  {t("workoutMovement")}
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-ink">
                  {insights.movementDays}{" "}
                  <span className="text-xs font-semibold text-ink-muted">
                    {isAr ? "أيام" : "days"}
                  </span>
                </span>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {t("activeMovementDays")}
                </p>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                  {insights.totalWorkoutMinutes} {isAr ? "دقيقة نشاط إجمالية" : "total active mins"}
                </div>
              </div>
            </div>

            {/* Mood Insight */}
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Smile size={16} />
                <span className="text-xs font-bold text-ink">
                  {t("moodAndEnergy")}
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-ink capitalize">
                  {insights.topMood || (isAr ? "متنوع" : "Balanced")}
                </span>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {t("topMoodFeeling")}
                </p>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                  {insights.moodCount} / {rangeDays} {isAr ? "تسجيلات مشاعر" : "check-ins"}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-muted py-2">
            <Info size={13} />
            <span>{t("privacyAssurance")}</span>
          </div>
        </div>
      )}
    </div>
  );
};
