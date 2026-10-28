import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Trophy,
  Lock,
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  ShieldCheck,
  Award,
  ChevronRight,
  Info,
  X,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, ProgressBar } from "@/components/kit";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type BadgeDefinition,
  type BadgeAward,
  type BadgeProgress,
  type BadgeCategory,
  calculateAllBadgeProgress,
  calculateBadgeProgress,
  getBadgeDefinitions,
  DEFAULT_BADGE_SETTINGS,
} from "@/lib/badgeEngine";
import { getProgressionOverview } from "@/lib/progressionEngine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Badges & Achievements — AYXA Planner Pro" },
      {
        name: "description",
        content: "Authoritative achievement collection backed by your real personal progress.",
      },
    ],
  }),
  component: BadgesPage,
});

type StatusFilter = "all" | "unlocked" | "in_progress";

const hexStyle = {
  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
};

export function BadgesPage() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";
  const { state, markCelebrationShown, updateBadgeSettings } = useApp();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory>("all");
  const [selectedBadgeProgress, setSelectedBadgeProgress] = useState<BadgeProgress | null>(null);
  const [shareBadge, setShareBadge] = useState<BadgeDefinition | null>(null);
  const [shareTheme, setShareTheme] = useState<"rose" | "gold" | "lavender" | "dark">(
    state.badgeSettings?.sharingDefaults?.theme || "rose"
  );
  const [copied, setCopied] = useState(false);

  // Canonical progression data
  const xp = state.xp || 0;
  const overview = getProgressionOverview(xp);

  // All badge progress calculated from authoritative store records
  const allProgress = useMemo(() => {
    return calculateAllBadgeProgress(state, { includeFaith: true, includeInactive: false });
  }, [state]);

  const activeBadgeCount = allProgress.length;
  const unlockedProgressList = useMemo(() => allProgress.filter((p) => p.isUnlocked), [allProgress]);
  const inProgressList = useMemo(() => allProgress.filter((p) => !p.isUnlocked), [allProgress]);
  const unlockedCount = unlockedProgressList.length;
  const completionPercentage = activeBadgeCount > 0 ? Math.round((unlockedCount / activeBadgeCount) * 100) : 0;

  // Filtered list according to Status Tabs and Category Pills
  const filteredBadges = useMemo(() => {
    return allProgress.filter((p) => {
      // Status filter
      if (statusFilter === "unlocked" && !p.isUnlocked) return false;
      if (statusFilter === "in_progress" && p.isUnlocked) return false;

      // Category filter
      if (categoryFilter !== "all" && p.definition.category !== categoryFilter) return false;

      return true;
    });
  }, [allProgress, statusFilter, categoryFilter]);

  // Recently Unlocked (last 3 unlocked awards)
  const recentlyUnlocked = useMemo(() => {
    const awardsWithProgress: Array<{ progress: BadgeProgress; earnedAt: string }> = [];
    for (const p of unlockedProgressList) {
      if (p.award) {
        awardsWithProgress.push({ progress: p, earnedAt: p.award.earnedAt });
      }
    }
    return awardsWithProgress
      .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt))
      .slice(0, 3)
      .map((item) => item.progress);
  }, [unlockedProgressList]);

  // Almost There: locked badges with progress >= 30% sorted by percentage descending
  const almostThere = useMemo(() => {
    return inProgressList
      .filter((p) => p.percentage >= 30)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [inProgressList]);

  // Celebration Queue: find any awards where celebrationShownAt is not set
  const pendingCelebrations = useMemo(() => {
    if (state.badgeSettings?.celebrationMode === "silent") return [];
    return (state.badgeAwards || []).filter((a) => !a.celebrationShownAt);
  }, [state.badgeAwards, state.badgeSettings?.celebrationMode]);

  const currentCelebrationAward = pendingCelebrations[0] || null;
  const currentCelebrationBadge = useMemo(() => {
    if (!currentCelebrationAward) return null;
    return allProgress.find((p) => p.badgeId === currentCelebrationAward.badgeId) || null;
  }, [currentCelebrationAward, allProgress]);

  const handleBack = () => {
    const historyIdx = typeof window !== "undefined" ? (window.history.state?.idx ?? -1) : -1;
    if (historyIdx > 0) {
      window.history.back();
    } else {
      navigate({ to: "/more" });
    }
  };

  const handleDismissCelebration = (awardId: string) => {
    markCelebrationShown(awardId);
  };

  const categories: { key: BadgeCategory; label: string; icon: string }[] = [
    { key: "all", label: t("catAll") || (isAr ? "الكل" : "All"), icon: "✨" },
    { key: "productivity", label: t("catProductivity") || (isAr ? "الإنتاجية" : "Productivity"), icon: "⚡" },
    { key: "habits_routines", label: t("catHabitsRoutines") || (isAr ? "العادات والروتين" : "Habits & Routines"), icon: "🌱" },
    { key: "goals", label: t("catGoals") || (isAr ? "الأهداف" : "Goals"), icon: "🎯" },
    { key: "focus_learning", label: t("catFocusLearning") || (isAr ? "التركيز والتعلم" : "Focus & Learning"), icon: "🧠" },
    { key: "wellness", label: t("catWellness") || (isAr ? "العافية" : "Wellness"), icon: "💧" },
    { key: "business", label: t("catBusiness") || (isAr ? "الأعمال" : "Business"), icon: "💼" },
    { key: "faith", label: t("catFaith") || (isAr ? "الروحانيات" : "Faith"), icon: "🌙" },
  ];

  return (
    <MobileShell>
      <Screen>
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <header className="grad-theme px-4 pt-6 pb-8 text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              aria-label={isAr ? "رجوع" : "Back"}
              className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all border border-white/30 text-white shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
            </button>
            <span className="text-[12px] font-bold text-white/95 uppercase tracking-wider">
              {isAr ? "معرض الأوسمة والشارات" : "Badges & Achievements"}
            </span>
            <div className="w-9" />
          </div>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card text-4xl shadow-rose-md ring-4 ring-white/60">
            {state.user?.avatar || state.user?.emoji || "🌸"}
          </div>

          <p className="mt-3 font-display text-xl font-bold text-white">
            {isAr ? `المستوى ${overview.level} · ${overview.tier.labelAr}` : `Level ${overview.level} · ${overview.tier.label}`}
          </p>
          <p className="font-mono text-[14px] text-white/90">{overview.totalXp.toLocaleString()} XP</p>
          <ProgressBar value={overview.levelPct} className="mt-4 bg-white/30" barClass="grad-gold" />
          <p className="mt-2 text-[12px] text-white/85">
            {overview.xpToNextLevel} {isAr ? `نقطة خبرة للمستوى ${overview.level + 1}` : `XP to Level ${overview.level + 1}`}
          </p>
        </header>

        {/* ── COMPACT COLLECTION OVERVIEW CARD ──────────────────────────────── */}
        <div className="px-4 -mt-4 space-y-3">
          <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 text-2xl font-bold">
                  🏆
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    {t("collectionProgressTitle") || (isAr ? "تقدم المجموعة" : "Collection Progress")}
                  </h3>
                  <p className="text-xs text-ink-light font-bold">
                    {unlockedCount} / {activeBadgeCount} {isAr ? "شارات مفتوحة" : "badges unlocked"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full grad-theme text-white shadow-2xs">
                {completionPercentage}%
              </span>
            </div>

            <ProgressBar value={completionPercentage} className="h-2.5 bg-surface border border-border/40" barClass="grad-theme" />
          </div>

          {/* ── RECENTLY UNLOCKED SECTION (Compact Horizontal Carousel) ────── */}
          {recentlyUnlocked.length > 0 && (
            <div className="rounded-3xl bg-card border border-border/70 p-4 shadow-rose-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                <h4 className="text-[13px] font-black text-ink">
                  {t("recentlyUnlockedTitle") || (isAr ? "أحدث الأوسمة المفتوحة" : "Recently Unlocked")}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {recentlyUnlocked.map((p) => {
                  const def = p.definition;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => setSelectedBadgeProgress(p)}
                      className="cursor-pointer flex flex-col items-center p-2.5 rounded-2xl bg-surface/80 hover:bg-surface border border-border/60 text-center active:scale-95 transition-all shadow-2xs"
                    >
                      <div
                        style={hexStyle}
                        className="flex h-12 w-12 items-center justify-center text-xl grad-theme text-white shadow-xs"
                      >
                        {def.icon}
                      </div>
                      <p className="text-[11px] font-bold text-ink mt-1.5 truncate max-w-full">
                        {isAr ? def.nameAr : def.nameEn}
                      </p>
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md mt-0.5">
                        {isAr ? "تم الفتح ✓" : "Unlocked ✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ALMOST THERE SECTION ────────────────────────────────────────── */}
          {almostThere.length > 0 && (
            <div className="rounded-3xl bg-card border border-border/70 p-4 shadow-rose-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-rose-500" />
                <h4 className="text-[13px] font-black text-ink">
                  {t("almostThereTitle") || (isAr ? "اقتربتِ من الفتح" : "Almost There")}
                </h4>
              </div>

              <div className="space-y-2">
                {almostThere.map((p) => {
                  const def = p.definition;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => setSelectedBadgeProgress(p)}
                      className="cursor-pointer w-full flex items-center justify-between p-2.5 rounded-2xl bg-surface/70 hover:bg-surface border border-border/60 active:scale-95 transition-all text-start"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={hexStyle}
                          className="flex h-10 w-10 shrink-0 items-center justify-center text-lg bg-ghost border border-border/60 text-ink"
                        >
                          {def.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-ink truncate">
                            {isAr ? def.nameAr : def.nameEn}
                          </p>
                          <p className="text-[10px] text-ink-light font-medium truncate">
                            {isAr ? def.shortCriterionAr : def.shortCriterionEn}
                          </p>
                        </div>
                      </div>

                      <div className="text-end shrink-0 pl-2 rtl:pr-2 rtl:pl-0">
                        <span className="text-[11px] font-mono font-black text-hotpink">
                          {p.percentage}%
                        </span>
                        <p className="text-[9.5px] font-mono text-ink-light">
                          {p.formattedProgress}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── STATUS FILTER TABS (Unlocked | In Progress | All) ───────────── */}
        <div className="mt-6 px-4">
          <div className="flex rounded-2xl bg-surface p-1 border border-border/70 text-xs font-black">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "cursor-pointer flex-1 py-2 text-center rounded-xl transition-all active:scale-95",
                statusFilter === "all"
                  ? "bg-card text-ink shadow-2xs font-extrabold border border-border/60"
                  : "text-ink-light hover:text-ink"
              )}
            >
              {t("statusAll") || (isAr ? "الكل" : "All")} ({activeBadgeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unlocked")}
              className={cn(
                "cursor-pointer flex-1 py-2 text-center rounded-xl transition-all active:scale-95",
                statusFilter === "unlocked"
                  ? "grad-theme text-white shadow-rose-xs font-extrabold"
                  : "text-ink-light hover:text-ink"
              )}
            >
              {t("statusUnlocked") || (isAr ? "المفتوحة" : "Unlocked")} ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={cn(
                "cursor-pointer flex-1 py-2 text-center rounded-xl transition-all active:scale-95",
                statusFilter === "in_progress"
                  ? "bg-card text-ink shadow-2xs font-extrabold border border-border/60"
                  : "text-ink-light hover:text-ink"
              )}
            >
              {t("statusInProgress") || (isAr ? "قيد الإنجاز" : "In Progress")} ({inProgressList.length})
            </button>
          </div>
        </div>

        {/* ── CATEGORY PILLS (Horizontal Scroll without Clipping) ─────────── */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 mt-1">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoryFilter(c.key)}
              className={cn(
                "cursor-pointer shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border active:scale-95",
                categoryFilter === c.key
                  ? "grad-theme text-white border-transparent shadow-rose-xs"
                  : "bg-card text-ink-light hover:text-ink border-border/80"
              )}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* ── BADGE GRID ──────────────────────────────────────────────────── */}
        <div className="px-4 mt-2 pb-12">
          {filteredBadges.length === 0 ? (
            <div className="rounded-3xl bg-card border border-border/70 p-8 text-center space-y-2 mt-4">
              <div className="text-4xl">🌸</div>
              <h4 className="text-sm font-black text-ink">
                {statusFilter === "unlocked"
                  ? t("emptyUnlockedTitle") || (isAr ? "لم تفتحي أي وسام بعد" : "No badges unlocked yet")
                  : t("emptyInProgressTitle") || (isAr ? "أنجزتِ جميع الأوسمة!" : "All active badges unlocked!")}
              </h4>
              <p className="text-xs text-ink-light max-w-xs mx-auto">
                {statusFilter === "unlocked"
                  ? t("emptyUnlockedDesc") || (isAr ? "أكملي مهامكِ وعاداتكِ اليومية لفتح أول أوسمتكِ!" : "Complete tasks and habits to unlock your first badge!")
                  : t("emptyInProgressDesc") || (isAr ? "إنجاز استثنائي! حققتِ جميع الأهداف المتاحة." : "Incredible dedication! You've unlocked everything.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBadges.map((p) => {
                const def = p.definition;
                const isUnlocked = p.isUnlocked;

                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => setSelectedBadgeProgress(p)}
                    className={cn(
                      "cursor-pointer group relative rounded-3xl p-3.5 border flex flex-col items-center gap-2 text-center transition-all active:scale-95",
                      isUnlocked
                        ? "bg-card border-border/80 hover:border-hotpink/50 shadow-rose-xs"
                        : "bg-surface/50 border-border/50 hover:bg-surface/80 opacity-80"
                    )}
                  >
                    {/* XP Tag Pill */}
                    <div className="absolute top-2.5 end-2.5">
                      <span className="text-[9.5px] font-mono font-bold text-hotpink bg-pink-500/10 dark:bg-pink-500/20 px-1.5 py-0.5 rounded-full">
                        +{def.xpReward} XP
                      </span>
                    </div>

                    {/* Badge Icon */}
                    <div
                      style={hexStyle}
                      className={cn(
                        "mt-1 flex h-14 w-14 items-center justify-center text-2xl transition-transform group-hover:scale-105",
                        isUnlocked
                          ? "grad-theme text-white shadow-xs"
                          : "bg-ghost border border-border/70 text-ink-light"
                      )}
                    >
                      {isUnlocked ? def.icon : <Lock size={18} className="text-ink-light" />}
                    </div>

                    {/* Title & Short Criterion */}
                    <div className="min-w-0 w-full mt-1">
                      <p className={cn("text-[12px] font-black truncate", isUnlocked ? "text-ink" : "text-ink-light")}>
                        {isAr ? def.nameAr : def.nameEn}
                      </p>
                      <p className="text-[10px] text-ink-light line-clamp-2 leading-tight mt-0.5">
                        {isAr ? def.shortCriterionAr : def.shortCriterionEn}
                      </p>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="w-full space-y-1 mt-auto pt-1">
                      <ProgressBar
                        value={p.percentage}
                        className="h-1.5 bg-surface border border-border/40"
                        barClass={isUnlocked ? "grad-theme" : "bg-hotpink/70"}
                      />

                      <div className="flex items-center justify-between text-[9px] font-mono text-ink-light">
                        <span>{p.formattedProgress}</span>
                        <span className="font-bold">{p.percentage}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── BADGE DETAIL MODAL / SHEET ───────────────────────────────────── */}
        {selectedBadgeProgress && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-card border border-border/80 p-6 space-y-4 shadow-rose-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-light uppercase tracking-wider">
                  {t("badgeCriterionLabel") || (isAr ? "تفاصيل الوسام" : "Badge Details")}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBadgeProgress(null)}
                  className="cursor-pointer h-8 w-8 rounded-full bg-surface hover:bg-border/60 flex items-center justify-center text-ink-light hover:text-ink transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Large Hex Icon */}
              <div className="text-center space-y-2">
                <div
                  style={hexStyle}
                  className={cn(
                    "mx-auto flex h-20 w-20 items-center justify-center text-4xl shadow-rose-md",
                    selectedBadgeProgress.isUnlocked
                      ? "grad-theme text-white"
                      : "bg-surface border border-border/80 text-ink-light"
                  )}
                >
                  {selectedBadgeProgress.isUnlocked ? selectedBadgeProgress.definition.icon : "🔒"}
                </div>

                <h3 className="text-lg font-black text-ink">
                  {isAr ? selectedBadgeProgress.definition.nameAr : selectedBadgeProgress.definition.nameEn}
                </h3>
                <p className="text-xs text-ink-light leading-relaxed max-w-xs mx-auto">
                  {isAr ? selectedBadgeProgress.definition.descAr : selectedBadgeProgress.definition.descEn}
                </p>
              </div>

              {/* Exact Criterion Card */}
              <div className="rounded-2xl bg-surface/80 border border-border/70 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-ink">
                  <Info size={14} className="text-hotpink" />
                  <span>{t("badgeCriterionLabel") || (isAr ? "معيار الاستحقاق الدقيق" : "Exact Criterion")}</span>
                </div>
                <p className="text-[12px] text-ink-light font-medium leading-relaxed">
                  {isAr ? selectedBadgeProgress.definition.criterionAr : selectedBadgeProgress.definition.criterionEn}
                </p>

                {/* Privacy Badge */}
                {selectedBadgeProgress.definition.privacyClassification !== "public_safe" && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-300">
                    <ShieldCheck size={13} />
                    <span>{t("privacySafeNotice") || (isAr ? "بياناتكِ المالية والشخصية تظل خاصة 100%" : "Private by default")}</span>
                  </div>
                )}
              </div>

              {/* Progress & Reward Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 text-center">
                  <p className="text-[10.5px] font-bold text-ink-light">
                    {t("badgeProgressLabel") || (isAr ? "نسبة التقدم" : "Progress")}
                  </p>
                  <p className="text-[15px] font-mono font-black text-ink mt-0.5">
                    {selectedBadgeProgress.formattedProgress}
                  </p>
                  <ProgressBar
                    value={selectedBadgeProgress.percentage}
                    className="h-1.5 bg-card mt-2"
                    barClass={selectedBadgeProgress.isUnlocked ? "grad-theme" : "bg-hotpink"}
                  />
                </div>

                <div className="rounded-2xl bg-surface/70 border border-border/60 p-3 text-center">
                  <p className="text-[10.5px] font-bold text-ink-light">
                    {t("badgeRewardLabel") || (isAr ? "المكافأة" : "Reward")}
                  </p>
                  <p className="text-[15px] font-mono font-black text-hotpink mt-0.5">
                    +{selectedBadgeProgress.definition.xpReward} XP
                  </p>
                  <span className="inline-block text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-hotpink mt-2">
                    {selectedBadgeProgress.isUnlocked
                      ? (isAr ? "مكتسبة ✓" : "Earned ✓")
                      : (isAr ? "عند الإنجاز" : "On Unlock")}
                  </span>
                </div>
              </div>

              {/* Actions Button Group */}
              <div className="pt-2 space-y-2">
                {selectedBadgeProgress.isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      const def = selectedBadgeProgress.definition;
                      setSelectedBadgeProgress(null);
                      setShareBadge(def);
                    }}
                    className="cursor-pointer w-full py-3 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Share2 size={15} />
                    <span>{t("shareBadgeBtn") || (isAr ? "مشاركة بطاقة الإنجاز" : "Share Achievement Card")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const route = selectedBadgeProgress.definition.relatedFeatureRoute;
                      setSelectedBadgeProgress(null);
                      navigate({ to: route });
                    }}
                    className="cursor-pointer w-full py-3 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={15} />
                    <span>
                      {isAr
                        ? selectedBadgeProgress.definition.relatedFeatureLabelAr
                        : selectedBadgeProgress.definition.relatedFeatureLabelEn}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedBadgeProgress(null)}
                  className="cursor-pointer w-full py-2.5 rounded-2xl bg-surface hover:bg-card border border-border/70 text-ink-light hover:text-ink text-xs font-bold active:scale-95"
                >
                  {t("close") || (isAr ? "إغلاق" : "Close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRIVACY-SAFE BRANDED SHARE CARD MODAL ───────────────────────── */}
        {shareBadge && (
          <ShareCardModal
            badge={shareBadge}
            award={unlockedProgressList.find((p) => p.badgeId === shareBadge.id)?.award}
            theme={shareTheme}
            onChangeTheme={setShareTheme}
            onClose={() => setShareBadge(null)}
          />
        )}

        {/* ── UNLOCK CELEBRATION MODAL (Queue Supported) ─────────────────── */}
        {currentCelebrationAward && currentCelebrationBadge && (
          <CelebrationModal
            award={currentCelebrationAward}
            badgeProgress={currentCelebrationBadge}
            onDismiss={() => handleDismissCelebration(currentCelebrationAward.id)}
            onViewInCollection={() => {
              handleDismissCelebration(currentCelebrationAward.id);
              setSelectedBadgeProgress(currentCelebrationBadge);
            }}
          />
        )}
      </Screen>
    </MobileShell>
  );
}

// ── SHARE CARD MODAL WITH HTML5 CANVAS RENDER ─────────────────────────────────

interface ShareCardModalProps {
  badge: BadgeDefinition;
  award?: BadgeAward;
  theme: "rose" | "gold" | "lavender" | "dark";
  onChangeTheme: (theme: "rose" | "gold" | "lavender" | "dark") => void;
  onClose: () => void;
}

function ShareCardModal({ badge, award, theme, onChangeTheme, onClose }: ShareCardModalProps) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  const userName = state.user?.name || (isAr ? "مستخدمة أيكسا" : "AYXA Planner");
  const earnedDateStr = award?.earnedAt ? new Date(award.earnedAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  // Draw card onto canvas for crisp PNG export
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Theme backgrounds
    let bgGrad = ctx.createLinearGradient(0, 0, width, height);
    let cardBg = "#ffffff";
    let textColor = "#1e293b";
    let textDim = "#64748b";
    let accentColor = "#e11d48";

    if (theme === "rose") {
      bgGrad.addColorStop(0, "#fff1f2");
      bgGrad.addColorStop(0.5, "#fdf2f8");
      bgGrad.addColorStop(1, "#fce7f3");
      cardBg = "#ffffff";
      textColor = "#881337";
      textDim = "#9f1239";
      accentColor = "#e11d48";
    } else if (theme === "gold") {
      bgGrad.addColorStop(0, "#fefce8");
      bgGrad.addColorStop(0.5, "#fffbeb");
      bgGrad.addColorStop(1, "#fef3c7");
      cardBg = "#ffffff";
      textColor = "#78350f";
      textDim = "#92400e";
      accentColor = "#d97706";
    } else if (theme === "lavender") {
      bgGrad.addColorStop(0, "#f5f3ff");
      bgGrad.addColorStop(0.5, "#faf5ff");
      bgGrad.addColorStop(1, "#ede9fe");
      cardBg = "#ffffff";
      textColor = "#4c1d95";
      textDim = "#6d28d9";
      accentColor = "#7c3aed";
    } else {
      bgGrad.addColorStop(0, "#0f172a");
      bgGrad.addColorStop(0.5, "#1e1b4b");
      bgGrad.addColorStop(1, "#020617");
      cardBg = "#1e293b";
      textColor = "#f8fafc";
      textDim = "#94a3b8";
      accentColor = "#f43f5e";
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative inner card with rounded corners
    ctx.fillStyle = cardBg;
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    const pad = 60;
    roundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 40);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Header branding
    ctx.textAlign = "center";
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText("AYXA PLANNER PRO ✨", width / 2, pad + 70);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = textDim;
    ctx.fillText(isAr ? "وسام إنجاز معتمد" : "OFFICIAL ACHIEVEMENT AWARD", width / 2, pad + 105);

    // Hexagon / Circle Badge Icon
    ctx.font = "80px sans-serif";
    ctx.fillText(badge.icon, width / 2, height / 2 - 120);

    // Badge Title
    ctx.font = "bold 42px sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText(isAr ? badge.nameAr : badge.nameEn, width / 2, height / 2 - 20);

    // Short Description
    ctx.font = "20px sans-serif";
    ctx.fillStyle = textDim;
    ctx.fillText(isAr ? badge.descAr : badge.descEn, width / 2, height / 2 + 25);

    // Criterion Box
    ctx.fillStyle = theme === "dark" ? "#334155" : "#f8fafc";
    roundRect(ctx, pad + 40, height / 2 + 80, width - (pad + 40) * 2, 140, 20);
    ctx.fill();

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(isAr ? "معيار الإنجاز المحقق" : "CRITERION MET", width / 2, height / 2 + 120);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText(isAr ? badge.criterionAr : badge.criterionEn, width / 2, height / 2 + 160);

    // Footer info: user name and date
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText(userName, width / 2, height - pad - 80);

    if (earnedDateStr) {
      ctx.font = "15px sans-serif";
      ctx.fillStyle = textDim;
      ctx.fillText(earnedDateStr, width / 2, height - pad - 50);
    }
  }, [badge, theme, isAr, userName, earnedDateStr]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ayxa-badge-${badge.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border/80 p-5 space-y-4 shadow-rose-md text-center">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-ink">
            {isAr ? "بطاقة المشاركة الجمالية" : "Aesthetic Share Card"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-8 w-8 rounded-full bg-surface flex items-center justify-center text-ink-light hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Theme Selectors */}
        <div className="flex items-center justify-center gap-2">
          {(["rose", "gold", "lavender", "dark"] as const).map((tKey) => (
            <button
              key={tKey}
              type="button"
              onClick={() => onChangeTheme(tKey)}
              className={cn(
                "cursor-pointer px-3 py-1 rounded-full text-[11px] font-bold border transition-all active:scale-95",
                theme === tKey
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface text-ink-light border-border/70"
              )}
            >
              {tKey === "rose" ? "🌸 Rose" : tKey === "gold" ? "👑 Gold" : tKey === "lavender" ? "✨ Lavender" : "🌙 Dark"}
            </button>
          ))}
        </div>

        {/* Live Canvas Element */}
        <div className="rounded-2xl overflow-hidden shadow-rose border border-border/60 max-w-[280px] mx-auto">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        <p className="text-[11px] text-ink-light">
          {isAr
            ? "آمن للخصوصية 100%: لا يتم إظهار أي مبالغ أو نصوص خاصة."
            : "100% Privacy safe: No private numbers or texts are shared."}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            className="cursor-pointer py-2.5 rounded-xl grad-theme text-white text-xs font-black shadow-rose-xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>{isAr ? "تحميل الصورة" : "Download PNG"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="cursor-pointer py-2.5 rounded-xl bg-surface hover:bg-card border border-border/80 text-ink text-xs font-black active:scale-95 flex items-center justify-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الصورة" : "Copy Image")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UNLOCK CELEBRATION MODAL ─────────────────────────────────────────────────

interface CelebrationModalProps {
  award: BadgeAward;
  badgeProgress: BadgeProgress;
  onDismiss: () => void;
  onViewInCollection: () => void;
}

function CelebrationModal({ award, badgeProgress, onDismiss, onViewInCollection }: CelebrationModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const def = badgeProgress.definition;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/80 p-6 text-center space-y-4 shadow-rose-md">
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping opacity-75" />
          <div
            style={hexStyle}
            className="relative flex h-20 w-20 items-center justify-center text-4xl grad-theme text-white shadow-rose-md"
          >
            {def.icon}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black text-hotpink uppercase tracking-wider">
            {isAr ? "وسام جديد مفتوح 🎉" : "NEW BADGE UNLOCKED 🎉"}
          </span>
          <h3 className="text-xl font-black text-ink">
            {isAr ? def.nameAr : def.nameEn}
          </h3>
          <p className="text-xs text-ink-light leading-relaxed">
            {isAr ? def.descAr : def.descEn}
          </p>
        </div>

        {/* XP Award Pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-500/10 text-hotpink text-sm font-black font-mono">
          <Sparkles size={16} />
          <span>+{def.xpReward} XP</span>
        </div>

        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onDismiss}
            className="cursor-pointer w-full py-3 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-sm active:scale-95"
          >
            {isAr ? "متابعة التألق ✨" : "Celebrate & Continue ✨"}
          </button>

          <button
            type="button"
            onClick={onViewInCollection}
            className="cursor-pointer w-full py-2.5 rounded-2xl bg-surface hover:bg-card border border-border/70 text-ink text-xs font-bold active:scale-95"
          >
            {isAr ? "عرض في المعرض 🏆" : "View in Collection 🏆"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CANVAS ROUND RECT HELPER ──────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
