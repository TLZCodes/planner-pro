import React from "react";
import {
  Droplets,
  Moon,
  Footprints,
  Plus,
  RotateCcw,
  Clock,
  Trash2,
  Smile,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey, type CanonicalMood } from "@/lib/store";
import {
  calculateDailyHydration,
  formatSleepDuration,
  type DailyHydrationSummary,
} from "@/lib/wellnessEngine";

interface TrackersTabProps {
  onOpenAddHydration: () => void;
  onOpenHydrationHistory: () => void;
  onOpenLogSleep: () => void;
  onOpenLogSteps: () => void;
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

export const TrackersTab: React.FC<TrackersTabProps> = ({
  onOpenAddHydration,
  onOpenHydrationHistory,
  onOpenLogSleep,
  onOpenLogSteps,
}) => {
  const { t, lang } = useLang();
  const {
    state,
    addHydrationEvent,
    undoLastHydrationEvent,
    deleteHydrationEvent,
    setDailyMood,
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

  // Sleep record
  const todaySleep = (state.sleepRecords || []).find((s) => s.sleepLocalDate === today);

  // Steps record
  const todayStepRecord = state.dailyStepRecords?.[today];
  const stepCount = todayStepRecord?.stepCount || 0;
  const stepGoal = settings?.optionalStepGoal || 8000;

  // Mood record
  const todayMood = state.dailyMoods?.[today];

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-200">
      {/* ── 1. HYDRATION TRACKER ── */}
      <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
              <Droplets size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                {t("waterTracker")}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {t("dailyTarget")}: {target} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")} ({hydration.targetCups} {isAr ? "أكواب" : "cups"})
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xl font-black text-sky-600 dark:text-sky-400">
              {hydration.consumedInUserUnit}
            </span>
            <span className="text-xs font-semibold text-ink-muted ms-1">
              / {target} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
            </span>
          </div>
        </div>

        {/* Progress & Cup Icons */}
        <div className="py-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted mb-2">
            <span>{hydration.percentage}% {t("consumed")}</span>
            <span>
              {hydration.remainingInUserUnit > 0
                ? `${hydration.remainingInUserUnit} ${unit === "oz" ? "oz" : (isAr ? "مل" : "ml")} ${t("remaining")}`
                : t("targetReached")}
            </span>
          </div>

          {/* Cup icons visualizer */}
          <div className="flex flex-wrap gap-2 py-2">
            {Array.from({ length: Math.max(hydration.targetCups, hydration.cupEquivalents) }).map(
              (_, idx) => {
                const isFilled = idx < hydration.cupEquivalents;
                return (
                  <div
                    key={idx}
                    className={`w-9 h-11 rounded-xl flex items-center justify-center text-sm border transition-all ${
                      isFilled
                        ? "bg-sky-500 border-sky-600 text-white shadow-xs scale-105"
                        : "bg-background border-dashed border-border/70 text-ink-muted opacity-50"
                    }`}
                    title={`${(idx + 1) * cupSize} ${unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}`}
                  >
                    🥛
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <button
            onClick={() => addHydrationEvent(cupSize, unit, "manual")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>+{cupSize} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}</span>
          </button>
          <button
            onClick={() => addHydrationEvent(cupSize * 2, unit, "manual")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60 text-xs font-bold hover:bg-sky-100 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>+{cupSize * 2} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}</span>
          </button>
          <button
            onClick={onOpenAddHydration}
            className="px-3 py-2 rounded-xl bg-background border border-border/70 text-xs font-semibold text-ink hover:bg-card-hover transition-colors cursor-pointer"
          >
            {t("addCustomWater")}
          </button>

          {hydration.activeEvents.length > 0 && (
            <button
              onClick={() => undoLastHydrationEvent(today)}
              className="p-2 rounded-xl bg-background border border-border text-ink-muted hover:text-ink hover:bg-card-hover transition-colors cursor-pointer ms-auto"
              title={t("undoLast")}
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Today's Events Timeline */}
        {hydration.activeEvents.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/40">
            <h4 className="text-xs font-bold text-ink-muted mb-2">
              {t("viewHistory")}
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {hydration.activeEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">
                      +{ev.amount} {ev.unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
                    </span>
                    <span className="text-[10px] text-ink-muted capitalize">
                      ({ev.sourceType})
                    </span>
                  </div>
                  <button
                    onClick={() => deleteHydrationEvent(ev.id)}
                    className="text-rose-400 hover:text-rose-600 p-1"
                    title={t("delete")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. SLEEP TRACKER ── */}
      <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Moon size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                {t("sleepAnalysis")}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {todaySleep ? t("enteredManually") : t("emptyNothingLogged")}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogSleep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{todaySleep ? t("edit") : t("logSleep")}</span>
          </button>
        </div>

        {todaySleep ? (
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border/60">
              <div>
                <span className="text-xl font-black text-ink">
                  {formatSleepDuration(todaySleep.durationMinutes, isAr)}
                </span>
                {todaySleep.note && (
                  <p className="text-xs text-ink-muted mt-1 italic">
                    "{todaySleep.note}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {todaySleep.quality &&
                  Array.from({ length: todaySleep.quality }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-ink-muted bg-background/50 rounded-2xl border border-dashed border-border/60 mt-3">
            {t("emptyNothingLogged")}
          </div>
        )}
      </div>

      {/* ── 3. STEPS TRACKER ── */}
      <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <Footprints size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                {t("movementSteps")}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {todayStepRecord ? t("enteredManually") : t("sourceNotConnected")}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogSteps}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{todayStepRecord ? t("edit") : t("logSteps")}</span>
          </button>
        </div>

        <div className="mt-3">
          {todayStepRecord ? (
            <div className="p-3.5 rounded-2xl bg-background border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-black text-ink">
                  {stepCount.toLocaleString()} {isAr ? "خطوة" : "steps"}
                </span>
                <span className="text-xs font-semibold text-ink-muted">
                  {t("dailyTarget")}: {stepGoal.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
                <div
                  className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full"
                  style={{ width: `${Math.min(100, (stepCount / stepGoal) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-ink-muted bg-background/50 rounded-2xl border border-dashed border-border/60">
              {t("emptyNothingLogged")}
            </div>
          )}

          {/* Honest sync message */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-background border border-border/50 text-[11px] text-ink-muted mt-3">
            <ShieldCheck size={14} className="shrink-0 text-ink-muted" />
            <span>{t("sourceHealthOff")}</span>
          </div>
        </div>
      </div>

      {/* ── 4. MOOD & ENERGY TRACKER ── */}
      <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <Smile size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                {t("moodAndEnergy")}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {isAr ? "مشاعركِ وطاقتكِ اليوم" : "Your daily mood and energy"}
              </p>
            </div>
          </div>
        </div>

        {/* 7 Canonical Moods Selector */}
        <div className="mt-3">
          <label className="text-xs font-semibold text-ink-muted block mb-2">
            {isAr ? "كيف تشعرين اليوم؟" : "How are you feeling today?"}
          </label>
          <div className="grid grid-cols-7 gap-1">
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
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[10px] text-ink mt-1 truncate max-w-[42px]">
                    {isAr ? m.labelAr : m.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level Selector */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <label className="text-xs font-semibold text-ink-muted block mb-2">
            {isAr ? "مستوى طاقتكِ اليوم" : "Energy Level"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: "low", labelEn: "Low 🍵", labelAr: "هادئة 🍵" },
                { key: "medium", labelEn: "Medium ✨", labelAr: "معتدلة ✨" },
                { key: "high", labelEn: "High ⚡", labelAr: "عالية ⚡" },
              ] as const
            ).map((item) => {
              const isSelected = (todayMood?.energy || "medium") === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setDailyMood(
                      today,
                      todayMood?.mood || "okay",
                      item.key,
                      "wellness"
                    )
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold shadow-2xs"
                      : "bg-background border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {isAr ? item.labelAr : item.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
