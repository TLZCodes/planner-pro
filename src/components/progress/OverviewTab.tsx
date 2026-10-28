import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  Target,
  BookHeart,
  Heart,
  Flame,
  Trophy,
  ArrowRight,
  TrendingUp,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type ProgressionOverview,
  type XPEvent,
  type DailyXpSummary,
  aggregateXpHistory,
  getPrivacySafeLabel,
} from "@/lib/progressionEngine";
import { getBadgeDefinitions } from "@/lib/badgeEngine";
import { CHALLENGES } from "@/lib/gamification";
import { cn } from "@/lib/utils";

type GrowthPeriod = "this_week" | "last_week" | "last_30_days";

interface OverviewTabProps {
  overview: ProgressionOverview;
  onNavigateTab: (tabId: "activity" | "challenges" | "badges") => void;
}

export function OverviewTab({ overview, onNavigateTab }: OverviewTabProps) {
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";
  const { state } = useApp();

  const [period, setPeriod] = useState<GrowthPeriod>("this_week");
  const [chartDays, setChartDays] = useState<7 | 14 | 30>(14);
  const [showFaithArea, setShowFaithArea] = useState<boolean>(
    state.userProgressSettings?.showFaithCategory ?? true
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ── 1. Calculate Real Domain Statistics for the Period ─────────────────────
  const growthStats = useMemo(() => {
    const now = new Date();
    let startDaysAgo = 7;
    let endDaysAgo = 0;

    if (period === "this_week") {
      startDaysAgo = 7;
      endDaysAgo = 0;
    } else if (period === "last_week") {
      startDaysAgo = 14;
      endDaysAgo = 7;
    } else {
      startDaysAgo = 30;
      endDaysAgo = 0;
    }

    const startDate = new Date(now);
    startDate.setUTCDate(startDate.getUTCDate() - startDaysAgo);
    const startDateStr = startDate.toISOString().slice(0, 10);

    const endDate = new Date(now);
    endDate.setUTCDate(endDate.getUTCDate() - endDaysAgo);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const isInRange = (dStr?: string) => {
      if (!dStr) return false;
      const clean = dStr.slice(0, 10);
      return clean >= startDateStr && clean <= endDateStr;
    };

    // Tasks completed
    const tasksDone = (state.tasks || []).filter((t) => t.done && isInRange(t.doneDate || t.createdAt)).length;

    // Habits checked
    const habitCheckins = (state.habits || []).reduce((acc, h) => {
      const days = Object.keys(h.history || {}).filter((d) => h.history?.[d] && isInRange(d)).length;
      return acc + days;
    }, 0);

    // Routine steps completed
    const routineSteps = Object.keys(state.routineLogs || {}).filter(
      (k) => state.routineLogs[k] && isInRange(k.slice(0, 10))
    ).length;

    // Focus minutes
    const focusMinutes = (state.focusSessions || []).filter((s) => isInRange(s.completedAt || s.startedAt))
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // Learning / flashcards
    const flashcardsReviewed = (state.reviewSessions || []).filter((r) => isInRange(r.createdAt))
      .reduce((acc, r) => acc + (r.cardCount || 0), 0);

    // Goals progressed
    const goalsActive = (state.goals || []).filter((g) => (g.current || 0) > 0).length;

    // Journal writing days
    const journalDays = Object.keys(state.dailyMoods || {}).filter((d) => isInRange(d)).length;

    // Care activities completed
    const careCompleted = (state.selfcare || []).filter((s) => s.done && isInRange(s.doneDate)).length;

    return {
      tasksDone,
      habitCheckins,
      routineSteps,
      focusMinutes,
      flashcardsReviewed,
      goalsActive,
      journalDays,
      careCompleted,
    };
  }, [state, period]);

  // ── 2. XP Trend Chart Data ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    return aggregateXpHistory(state.xpLedger || [], chartDays, todayStr);
  }, [state.xpLedger, chartDays, todayStr]);

  const maxChartXp = useMemo(() => {
    const vals = chartData.map((d) => d.xpEarned);
    return Math.max(...vals, 40);
  }, [chartData]);

  // ── 3. Recent XP Activity (last 4 active events) ───────────────────────────
  const recentEvents = useMemo(() => {
    return (state.xpLedger || [])
      .filter((e) => e.state === "active")
      .slice(-4)
      .reverse();
  }, [state.xpLedger]);

  // ── 4. Active Challenges Snapshot ─────────────────────────────────────────
  const dailyChallenges = useMemo(() => CHALLENGES.slice(0, 2), []);
  const activeBadgesCount = useMemo(() => getBadgeDefinitions({ includeInactive: false }).length, []);
  const unlockedBadgesCount = (state.unlockedBadges || []).length;

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: WEEKLY GROWTH SUMMARY ─────────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-hotpink text-base">
              📈
            </span>
            <h2 className="text-[14.5px] font-black text-ink">
              {t("growthSummaryTitle")}
            </h2>
          </div>

          {/* Period Selector Chips */}
          <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border/70 text-[11px] font-bold">
            {(["this_week", "last_week", "last_30_days"] as GrowthPeriod[]).map((p) => {
              const isActive = period === p;
              const label =
                p === "this_week"
                  ? t("periodThisWeek")
                  : p === "last_week"
                  ? t("periodLastWeek")
                  : t("periodLast30Days");
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "cursor-pointer px-2.5 py-1 rounded-full transition-all active:scale-95",
                    isActive
                      ? "grad-theme text-white shadow-2xs font-extrabold"
                      : "text-ink-light hover:text-ink"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 space-y-1">
            <p className="text-[11px] font-bold text-ink-light flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>{t("growthTasksDone")}</span>
            </p>
            <p className="text-[18px] font-mono font-black text-ink">
              {growthStats.tasksDone}
            </p>
          </div>

          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 space-y-1">
            <p className="text-[11px] font-bold text-ink-light flex items-center gap-1">
              <Flame size={13} className="text-amber-500" />
              <span>{t("growthHabitDays")}</span>
            </p>
            <p className="text-[18px] font-mono font-black text-ink">
              {growthStats.habitCheckins}
            </p>
          </div>

          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 space-y-1">
            <p className="text-[11px] font-bold text-ink-light flex items-center gap-1">
              <Clock size={13} className="text-indigo-500" />
              <span>{t("growthFocusMinutes")}</span>
            </p>
            <p className="text-[18px] font-mono font-black text-ink">
              {growthStats.focusMinutes} <span className="text-xs font-sans text-ink-light">{isAr ? "د" : "m"}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 space-y-1">
            <p className="text-[11px] font-bold text-ink-light flex items-center gap-1">
              <BookHeart size={13} className="text-rose-500" />
              <span>{t("growthWritingDays")}</span>
            </p>
            <p className="text-[18px] font-mono font-black text-ink">
              {growthStats.journalDays}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: XP TREND CHART ────────────────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-base">
              ⚡
            </span>
            <h2 className="text-[14.5px] font-black text-ink">
              {t("xpTrendTitle")}
            </h2>
          </div>

          {/* 7, 14, 30 Days Toggle */}
          <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border/70 text-[11px] font-bold">
            {([7, 14, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setChartDays(d)}
                className={cn(
                  "cursor-pointer px-2.5 py-0.5 rounded-full transition-all active:scale-95",
                  chartDays === d
                    ? "grad-theme text-white shadow-2xs font-extrabold"
                    : "text-ink-light hover:text-ink"
                )}
              >
                {d === 7 ? t("trend7Days") : d === 14 ? t("trend14Days") : t("trend30Days")}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-2">
          <div className="flex items-end gap-1.5 h-28 w-full px-1">
            {chartData.map((day, idx) => {
              const heightPct = Math.max(6, Math.round((day.xpEarned / maxChartXp) * 100));
              const isToday = day.date === todayStr;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className={cn(
                        "w-full max-w-[20px] rounded-t-lg transition-all duration-500",
                        day.xpEarned > 0
                          ? isToday
                            ? "bg-gradient-to-t from-pink-600 via-rose-500 to-amber-300 shadow-rose-xs"
                            : "bg-gradient-to-t from-pink-400 to-rose-400 opacity-85 group-hover:opacity-100"
                          : "bg-border/50"
                      )}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.date}: +${day.xpEarned} XP`}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[9.5px] font-bold truncate",
                      isToday ? "text-hotpink font-black" : "text-ink-light"
                    )}
                  >
                    {isAr ? day.dayLabelAr : day.dayLabelEn}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-ink-light font-medium text-center mt-2">
            {isAr
              ? `إجمالي النقاط المكتسبة خلال هذه الفترة: ${chartData.reduce((acc, d) => acc + d.xpEarned, 0).toLocaleString()} نقطة خبرة`
              : `Total XP earned in this period: ${chartData.reduce((acc, d) => acc + d.xpEarned, 0).toLocaleString()} XP`}
          </p>
        </div>
      </div>

      {/* ── SECTION 3: PROGRESS AREAS ────────────────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 text-base">
              🌸
            </span>
            <h2 className="text-[14.5px] font-black text-ink">
              {t("progressAreasTitle")}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowFaithArea((prev) => !prev)}
            className="cursor-pointer flex items-center gap-1 text-[11px] font-bold text-ink-light hover:text-ink"
            title={t("hideSensitiveArea")}
          >
            {showFaithArea ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showFaithArea ? (isAr ? "إخفاء الروحانيات" : "Hide faith") : (isAr ? "إظهار الروحانيات" : "Show faith")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Productivity */}
          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div>
                <p className="text-[12.5px] font-bold text-ink">{t("areaProductivity")}</p>
                <p className="text-[11px] font-semibold text-ink-light">
                  {growthStats.tasksDone} {isAr ? "مهام منجزة" : "tasks completed"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-hotpink">+{growthStats.tasksDone * 10} XP</span>
          </div>

          {/* Habits & Routines */}
          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔁</span>
              <div>
                <p className="text-[12.5px] font-bold text-ink">{t("areaHabitsRoutines")}</p>
                <p className="text-[11px] font-semibold text-ink-light">
                  {growthStats.habitCheckins} {isAr ? "تسجيلات عادة" : "habit check-ins"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-hotpink">+{growthStats.habitCheckins * 20} XP</span>
          </div>

          {/* Focus & Learning */}
          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🧠</span>
              <div>
                <p className="text-[12.5px] font-bold text-ink">{t("areaFocusLearning")}</p>
                <p className="text-[11px] font-semibold text-ink-light">
                  {growthStats.focusMinutes} {isAr ? "دقيقة تركيز" : "focus minutes"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-hotpink">+{growthStats.focusMinutes} XP</span>
          </div>

          {/* Wellness & Care */}
          <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌿</span>
              <div>
                <p className="text-[12.5px] font-bold text-ink">{t("areaWellnessCare")}</p>
                <p className="text-[11px] font-semibold text-ink-light">
                  {growthStats.careCompleted} {isAr ? "أنشطة عناية" : "care activities"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-hotpink">+{growthStats.careCompleted * 10} XP</span>
          </div>

          {/* Faith (Only if enabled) */}
          {showFaithArea && (
            <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌙</span>
                <div>
                  <p className="text-[12.5px] font-bold text-ink">{t("areaFaith")}</p>
                  <p className="text-[11px] font-semibold text-ink-light">
                    {isAr ? "استمرارية العبادات والأذكار اليومية بهدوء" : "Gentle consistency in prayer and adhkar"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-ink-light bg-card px-2.5 py-1 rounded-full border border-border/60">
                {isAr ? "خاص ومحفوظ" : "Private & peaceful"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 4: RECENT XP ACTIVITY SNAPSHOT ──────────────────────── */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 text-base">
              💎
            </span>
            <h2 className="text-[14.5px] font-black text-ink">
              {t("recentXpActivity")}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("activity")}
            className="cursor-pointer text-[12px] font-black text-hotpink hover:underline flex items-center gap-1 active:scale-95"
          >
            <span>{t("viewAllActivity")}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-[13px] font-bold text-ink">{t("emptyLedgerTitle")}</p>
            <p className="text-[11.5px] text-ink-light">{t("emptyLedgerDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-surface/70 border border-border/60 p-2.5 px-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink truncate">
                    {getPrivacySafeLabel(event, isAr)}
                  </p>
                  <p className="text-[10.5px] font-semibold text-ink-light">
                    {event.localDate || event.createdAt.slice(0, 10)}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-black text-hotpink shrink-0">
                  +{event.amount} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 5: BADGES SUMMARY SNAPSHOT ───────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 text-2xl font-bold">
            🏆
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-ink truncate">
              {t("badgesUnlockedCount")}
            </p>
            <p className="text-[11.5px] font-semibold text-ink-light truncate">
              {unlockedBadgesCount} / {activeBadgesCount} {isAr ? "شارات مفتوحة" : "badges unlocked"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab("badges")}
          className="cursor-pointer shrink-0 px-3.5 py-2 rounded-xl bg-surface hover:bg-card border border-border/80 text-ink text-[11.5px] font-black active:scale-95 transition-all shadow-2xs"
        >
          {isAr ? "عرض الشارات 🏆" : "View Badges 🏆"}
        </button>
      </div>
    </div>
  );
}
