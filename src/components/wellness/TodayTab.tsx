import React from "react";
import {
  Droplets,
  Moon,
  Footprints,
  Sparkles,
  Heart,
  Plus,
  RotateCcw,
  Clock,
  ChevronRight,
  Smile,
  Zap,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey, type CanonicalMood } from "@/lib/store";
import {
  calculateDailyHydration,
  formatSleepDuration,
  type DailyHydrationSummary,
} from "@/lib/wellnessEngine";

interface TodayTabProps {
  onOpenAddHydration: () => void;
  onOpenHydrationHistory: () => void;
  onOpenLogSleep: () => void;
  onOpenLogSteps: () => void;
  onOpenLogWorkout: () => void;
}

const CANONICAL_MOODS: { key: CanonicalMood; emoji: string; labelEn: string; labelAr: string }[] = [
  { key: "happy", emoji: "🌸", labelEn: "Happy", labelAr: "سعيدة" },
  { key: "calm", emoji: "🕊️", labelEn: "Calm", labelAr: "مطمئنة" },
  { key: "okay", emoji: "🌿", labelEn: "Okay", labelAr: "بخير" },
  { key: "sad", emoji: "🌧️", labelEn: "Sad", labelAr: "حزينة" },
  { key: "anxious", emoji: "☁️", labelEn: "Anxious", labelAr: "قلقة" },
  { key: "tired", emoji: "🌙", labelEn: "Tired", labelAr: "مرهقة" },
  { key: "grateful", emoji: "✨", labelEn: "Grateful", labelAr: "ممتنة" },
];

export const TodayTab: React.FC<TodayTabProps> = ({
  onOpenAddHydration,
  onOpenHydrationHistory,
  onOpenLogSleep,
  onOpenLogSteps,
  onOpenLogWorkout,
}) => {
  const { t, lang } = useLang();
  const {
    state,
    addHydrationEvent,
    undoLastHydrationEvent,
    setDailyMood,
    toggleSelfcare,
  } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  // Settings
  const settings = state.wellnessSettings;
  const unit = settings?.waterUnit || "ml";
  const target = settings?.dailyWaterTarget || (unit === "oz" ? 68 : 2000);
  const cupSize = settings?.defaultDrinkAmount || (unit === "oz" ? 8 : 250);

  // Hydration summary
  const hydration: DailyHydrationSummary = calculateDailyHydration(
    state.hydrationEvents || [],
    target,
    cupSize,
    unit,
    today
  );

  // Today Sleep Record
  const todaySleep = (state.sleepRecords || []).find((s) => s.sleepLocalDate === today);

  // Today Steps Record
  const todayStepRecord = state.dailyStepRecords?.[today];
  const stepCount = todayStepRecord?.stepCount || 0;
  const stepGoal = settings?.optionalStepGoal || 8000;
  const stepPct = Math.min(100, Math.round((stepCount / stepGoal) * 100));

  // Today Mood Record
  const todayMood = state.dailyMoods?.[today];
  const currentMoodObj = CANONICAL_MOODS.find((m) => m.key === todayMood?.mood);

  // Today Workouts
  const todayWorkouts = (state.workoutLogs || []).filter(
    (w) => w.localDate === today && !w.deletedAt
  );
  const totalWorkoutMinutes = todayWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);

  // Today Care activities (selfcare)
  const careItems = state.selfcare || [];
  const completedCareCount = careItems.filter((i) => i.done).length;

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-200">
      {/* ── CARD 1: Hydration ── */}
      <div className="p-4.5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center text-lg">
              💧
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                {t("waterIntake")}
                {hydration.isTargetReached && (
                  <span className="text-xs text-emerald-500 font-semibold">✨</span>
                )}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {t("dailyTarget")}: {target} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")} ({hydration.targetCups} {isAr ? "أكواب" : "cups"})
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-lg font-black text-ink">
              {hydration.consumedInUserUnit}
            </span>
            <span className="text-xs font-semibold text-ink-muted ms-1">
              / {target} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-sky-50 dark:bg-sky-950/40 overflow-hidden mb-3 border border-sky-100 dark:border-sky-900/30">
          <div
            className="h-full bg-linear-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${hydration.percentage}%` }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addHydrationEvent(cupSize, unit, "manual")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>+{cupSize} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}</span>
            </button>
            <button
              onClick={onOpenAddHydration}
              className="px-2.5 py-1.5 rounded-xl bg-background border border-border/70 text-xs font-semibold text-ink hover:bg-card-hover transition-colors cursor-pointer"
            >
              {t("addCustomWater")}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {hydration.activeEvents.length > 0 && (
              <button
                onClick={() => undoLastHydrationEvent(today)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card-hover transition-colors"
                title={t("undoLast")}
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={onOpenHydrationHistory}
              className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline px-1.5 py-1"
            >
              {t("viewHistory")}
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Sleep & Rest ── */}
      <div className="p-4.5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center text-lg">
              🌙
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">
                {t("sleepRest")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {todaySleep ? (
                  <span>
                    {todaySleep.quality ? "⭐".repeat(todaySleep.quality) : ""} · {t("enteredManually")}
                  </span>
                ) : (
                  <span>{t("emptyNothingLogged")}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogSleep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>{todaySleep ? t("edit") : t("logSleep")}</span>
          </button>
        </div>

        {todaySleep ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border/60 mt-2">
            <div>
              <span className="text-lg font-black text-ink">
                {formatSleepDuration(todaySleep.durationMinutes, isAr)}
              </span>
              {todaySleep.note && (
                <p className="text-[11px] text-ink-muted mt-0.5 italic">
                  "{todaySleep.note}"
                </p>
              )}
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
              {todaySleep.quality && todaySleep.quality >= 4 ? t("qualityRestful") : t("qualityGood")}
            </span>
          </div>
        ) : (
          <div className="py-2.5 text-center text-xs text-ink-muted bg-background/50 rounded-2xl border border-dashed border-border/60">
            {t("emptyNothingLogged")}
          </div>
        )}
      </div>

      {/* ── CARD 3: Steps & Movement ── */}
      <div className="p-4.5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center text-lg">
              🚶‍♀️
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">
                {t("movementSteps")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {todayStepRecord ? t("enteredManually") : t("sourceNotConnected")}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogSteps}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>{todayStepRecord ? t("edit") : t("logSteps")}</span>
          </button>
        </div>

        {todayStepRecord ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-lg font-black text-ink">
                {stepCount.toLocaleString()} {isAr ? "خطوة" : "steps"}
              </span>
              <span className="text-xs font-semibold text-ink-muted">
                {t("dailyTarget")}: {stepGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${stepPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="py-2.5 text-center text-xs text-ink-muted bg-background/50 rounded-2xl border border-dashed border-border/60">
            {t("emptyNothingLogged")}
          </div>
        )}
      </div>

      {/* ── CARD 4: Mood & Energy ── */}
      <div className="p-4.5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center text-lg">
              🌸
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">
                {t("moodAndEnergy")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {currentMoodObj
                  ? `${currentMoodObj.emoji} ${isAr ? currentMoodObj.labelAr : currentMoodObj.labelEn}`
                  : t("emptyNothingLogged")}
              </p>
            </div>
          </div>

          {todayMood && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {isAr ? "الطاقة: " : "Energy: "}
              {todayMood.energy === "high"
                ? (isAr ? "عالية ⚡" : "High ⚡")
                : todayMood.energy === "low"
                ? (isAr ? "هادئة 🍵" : "Low 🍵")
                : (isAr ? "معتدلة ✨" : "Medium ✨")}
            </span>
          )}
        </div>

        {/* Mood quick select pills */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {CANONICAL_MOODS.map((m) => {
            const isSelected = todayMood?.mood === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setDailyMood(today, m.key, todayMood?.energy || "medium", "wellness")}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-100 dark:bg-amber-950 border-2 border-amber-400 scale-105 shadow-xs font-bold"
                    : "bg-background border border-border/60 hover:bg-card-hover"
                }`}
                title={isAr ? m.labelAr : m.labelEn}
              >
                <span className="text-base">{m.emoji}</span>
                <span className="text-[9px] text-ink mt-0.5 truncate max-w-[40px]">
                  {isAr ? m.labelAr : m.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CARD 5: Care Rituals ── */}
      <div className="p-4.5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">
                {t("careActivities")}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {completedCareCount} / {careItems.length} {isAr ? "طقوس مكتملة" : "completed"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {careItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSelfcare(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                item.done
                  ? "bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 text-ink-muted"
                  : "bg-background border-border/60 text-ink hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.emoji}</span>
                <span className={`text-xs font-semibold ${item.done ? "line-through opacity-70" : ""}`}>
                  {item.label}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  item.done
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "border-border bg-card"
                }`}
              >
                {item.done && <span className="text-[11px] font-bold">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
