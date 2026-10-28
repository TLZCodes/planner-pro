import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Clock,
  Play,
  MoreVertical,
  Plus,
  Droplets,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Smile,
  Heart,
  Undo2,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import {
  calculateCareProgress,
  CARE_CATEGORIES,
  CURATED_CARE_IDEAS,
  type SelfCareActivity,
  type SelfCarePlanItem,
} from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface TodayCareTabProps {
  selectedDate: string;
  onOpenAdd: () => void;
  onStartNow: (activity: SelfCareActivity) => void;
  onNavigateToIdeas: (need?: string) => void;
}

export const TodayCareTab: React.FC<TodayCareTabProps> = ({
  selectedDate,
  onOpenAdd,
  onStartNow,
  onNavigateToIdeas,
}) => {
  const { t, lang } = useLang();
  const {
    state,
    toggleCarePlanItem,
    skipCarePlanItem,
    saveCareCheckIn,
    addHydrationEvent,
    undoLastHydrationEvent,
  } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const activities = state.selfCareActivities || [];
  const planItems = (state.selfCarePlanItems || []).filter(
    (p) => p.localDate === selectedDate
  );

  const summary = calculateCareProgress(planItems, activities);

  // Check-in state for selected date
  const checkIn = state.selfCareCheckIns?.[selectedDate] || {
    selectedNeeds: [],
    availableTimeRange: "any",
  };
  const [showCheckInForm, setShowCheckInForm] = useState(
    checkIn.selectedNeeds.length === 0
  );

  const availableNeeds: { key: string; label: string; icon: string }[] = [
    { key: "rest", label: t("needRest") || (isAr ? "الراحة" : "Rest"), icon: "🌙" },
    { key: "calm", label: t("needCalm") || (isAr ? "الهدوء" : "Calm"), icon: "🕊️" },
    { key: "movement", label: t("needMovement") || (isAr ? "الحركة" : "Movement"), icon: "🤸‍♀️" },
    { key: "hydration", label: t("needHydration") || (isAr ? "شرب الماء" : "Hydration"), icon: "💧" },
    { key: "fresh_air", label: t("needFreshAir") || (isAr ? "الهواء الطلق" : "Fresh air"), icon: "🌿" },
    { key: "joy", label: t("needJoy") || (isAr ? "الفرح" : "Joy"), icon: "🌸" },
    { key: "connection", label: t("needConnection") || (isAr ? "التواصل" : "Connection"), icon: "💬" },
    { key: "spiritual", label: t("needSpiritual") || (isAr ? "وقفة إيمانية" : "Spiritual pause"), icon: "🤲" },
  ];

  const timeOptions: { key: "5m" | "15m" | "30m" | "any"; label: string }[] = [
    { key: "5m", label: t("time5m") || (isAr ? "5 دقائق" : "5 min") },
    { key: "15m", label: t("time15m") || (isAr ? "15 دقيقة" : "15 min") },
    { key: "30m", label: t("time30m") || (isAr ? "30 دقيقة+" : "30+ min") },
    { key: "any", label: t("timeAny") || (isAr ? "دون تحديد" : "Any time") },
  ];

  const handleToggleNeed = (needKey: string) => {
    const current = checkIn.selectedNeeds || [];
    const next = current.includes(needKey)
      ? current.filter((n) => n !== needKey)
      : [...current, needKey];
    saveCareCheckIn(selectedDate, next, checkIn.availableTimeRange);
  };

  const handleSelectTime = (timeKey: "5m" | "15m" | "30m" | "any") => {
    saveCareCheckIn(selectedDate, checkIn.selectedNeeds || [], timeKey);
  };

  // Canonical hydration for snapshot
  const dailyHyd = state.dailyHydration?.[selectedDate] || {
    consumedMl: 0,
    targetMl: state.wellnessSettings?.dailyWaterTarget || 2000,
  };
  const unit = state.wellnessSettings?.waterUnit || "ml";
  const defaultAmount = state.wellnessSettings?.defaultDrinkAmount || 250;

  const handleAddWater = () => {
    addHydrationEvent(defaultAmount, unit, "manual", undefined, selectedDate);
  };

  const handleUndoWater = () => {
    undoLastHydrationEvent(selectedDate);
  };

  // Activity map
  const actMap = new Map<string, SelfCareActivity>(
    activities.map((a) => [a.id, a])
  );

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* 1. Today's Care Summary */}
      <div className="rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10 border border-pink-500/20 p-4 sm:p-5 shadow-rose-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
              {t("todaysCareTitle") || (isAr ? "عناية اليوم 🌸" : "Today’s Care 🌸")}
            </span>
            <h2 className="text-base sm:text-lg font-black text-ink">
              {summary.hasActivities
                ? isAr
                  ? `أكملتِ ${summary.completedCount} من ${summary.plannedCount} من أنشطة العناية`
                  : `${summary.completedCount} of ${summary.plannedCount} care activities completed`
                : isAr
                ? "ما الذي سيدعمكِ اليوم؟ 🌸"
                : "What would feel supportive today? 🌸"}
            </h2>
            <p className="text-xs text-ink-light">
              {summary.hasActivities
                ? t("careSummarySub") ||
                  (isAr
                    ? "دون ضغط، اختاري ما يدعمكِ اليوم."
                    : "No pressure—choose what supports you today.")
                : t("emptyCareDesc") ||
                  (isAr
                    ? "اختاري نشاط عناية صغيرًا، أو خذي وقتًا للراحة."
                    : "Choose one small care activity—or simply rest.")}
            </p>
          </div>

          {summary.hasActivities && (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
                {summary.progressPercentage}%
              </span>
              <span className="text-[10px] text-ink-light font-medium">
                {summary.completedMinutesTotal} / {summary.estimatedMinutesTotal} {isAr ? "د" : "min"}
              </span>
            </div>
          )}
        </div>

        {summary.hasActivities ? (
          <div className="mt-3 w-full bg-white/50 dark:bg-black/20 rounded-full h-2 overflow-hidden border border-border/40">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.progressPercentage}%` }}
            />
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onOpenAdd}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95 transition-all"
            >
              {t("chooseForToday") || (isAr ? "اختاري لليوم" : "Choose for today")}
            </button>
            <button
              onClick={() => onNavigateToIdeas()}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-ink bg-card border border-border/60 hover:bg-surface shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-pink-500" />
              <span>{t("tabIdeas") || (isAr ? "تصفحي الأفكار" : "Explore Ideas")}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Gentle Check-in Card ("What do you need today?") */}
      <div className="rounded-3xl bg-card border border-border/70 p-4 sm:p-5 shadow-rose-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h3 className="text-sm font-bold text-ink">
              {t("checkInTitle") || (isAr ? "ماذا تحتاجين اليوم؟" : "What do you need today?")}
            </h3>
          </div>
          <button
            onClick={() => setShowCheckInForm(!showCheckInForm)}
            className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            {showCheckInForm
              ? isAr
                ? "إخفاء"
                : "Done"
              : isAr
              ? "تعديل"
              : "Edit"}
          </button>
        </div>

        {showCheckInForm ? (
          <div className="space-y-3">
            {/* Needs Pills */}
            <div className="flex flex-wrap gap-1.5">
              {availableNeeds.map((item) => {
                const isSelected = (checkIn.selectedNeeds || []).includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => handleToggleNeed(item.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border",
                      isSelected
                        ? "bg-pink-500 text-white border-pink-500 shadow-sm font-bold"
                        : "bg-surface border-border/50 text-ink hover:bg-ghost"
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Filter Row */}
            <div className="pt-2 border-t border-border/40">
              <span className="text-[11px] font-bold text-ink-light block mb-1.5">
                {t("availableTimeLabel") || (isAr ? "الوقت المتاح:" : "Available time:")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {timeOptions.map((opt) => {
                  const isSelected = (checkIn.availableTimeRange || "any") === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectTime(opt.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-[11px] transition-all border",
                        isSelected
                          ? "bg-hotpink/15 text-hotpink border-hotpink/40 font-bold"
                          : "bg-surface border-border/40 text-ink-light hover:text-ink"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {(checkIn.selectedNeeds || []).length > 0 ? (
              checkIn.selectedNeeds.map((k) => {
                const found = availableNeeds.find((n) => n.key === k);
                return (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/40"
                  >
                    <span>{found?.icon}</span>
                    <span>{found?.label || k}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-ink-light italic">
                {isAr
                  ? "حددي ما تحتاجينه لتلقي اقتراحات هادئة تناسبكِ."
                  : "Tap edit to choose what supports your energy today."}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Today's Selected Care Activities */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
            {isAr ? "أنشطة العناية المختارة" : "Today’s Activities"}
          </h3>
          <button
            onClick={onOpenAdd}
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
          >
            <Plus size={13} />
            <span>{isAr ? "إضافة نشاط" : "Add Activity"}</span>
          </button>
        </div>

        {planItems.length === 0 ? (
          <div className="rounded-3xl bg-card border border-dashed border-border/80 p-6 text-center space-y-2">
            <span className="text-3xl">🌸</span>
            <h4 className="text-sm font-bold text-ink">
              {isAr ? "لم تختاري أنشطة لهذا اليوم بعد" : "No activities planned for today"}
            </h4>
            <p className="text-xs text-ink-light max-w-xs mx-auto">
              {isAr
                ? "يمكنكِ إضافة نشاط خفيف، أو تصفح الأفكار الهادئة."
                : "Choose a small nurturing ritual, or simply let yourself rest."}
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95"
            >
              {isAr ? "+ أضيفي نشاط عناية" : "+ Add Care Activity"}
            </button>
          </div>
        ) : (
          planItems.map((item) => {
            const act = actMap.get(item.activityId);
            const isDone = item.status === "completed";
            const isSkipped = item.status === "skipped";

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm transition-all",
                  isDone && "bg-ghost/60 opacity-75 border-border/40",
                  isSkipped && "opacity-50 line-through bg-ghost/40"
                )}
              >
                {/* Complete Toggle & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleCarePlanItem(item.id)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all border active:scale-90 flex-shrink-0",
                      isDone
                        ? "bg-pink-500 border-pink-500 text-white shadow-sm"
                        : "border-border/70 bg-surface hover:border-pink-400"
                    )}
                    aria-label={isDone ? "Undo completion" : "Mark completed"}
                  >
                    {isDone && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{act?.icon || "🌸"}</span>
                      <span
                        className={cn(
                          "text-sm font-bold text-ink truncate",
                          isDone && "line-through text-ink-light"
                        )}
                      >
                        {act?.title || "Care Activity"}
                      </span>
                      {act?.sourceType && act.sourceType !== "custom" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200/60 uppercase">
                          {act.sourceType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-ink-light mt-0.5">
                      {(item.plannedDuration || act?.estimatedDurationMinutes) && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>
                            {item.plannedDuration || act?.estimatedDurationMinutes} {isAr ? "د" : "min"}
                          </span>
                        </span>
                      )}
                      {act?.preferredTime && <span>• {act.preferredTime}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions: Start Now & Skip */}
                <div className="flex items-center gap-1">
                  {!isDone && !isSkipped && act && (
                    <button
                      onClick={() => onStartNow(act)}
                      className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 hover:bg-pink-100 transition-all"
                      title={t("startNowBtn") || (isAr ? "ابدئي الآن" : "Start now")}
                      aria-label="Start session"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  )}
                  {!isDone && !isSkipped && (
                    <button
                      onClick={() => skipCarePlanItem(item.id)}
                      className="px-2 py-1 rounded-xl text-[10px] font-medium text-ink-light hover:text-ink hover:bg-surface transition-all"
                      title={t("skipTodayBtn") || (isAr ? "تخطي لليوم" : "Skip")}
                    >
                      {isAr ? "تخطي" : "Skip"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Compact Synchronized Wellness Snapshot Card */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-teal-500/10 border border-sky-500/20 p-4 sm:p-5 shadow-rose-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            {t("wellnessSnapshotTitle") || (isAr ? "لمحة عن العافية" : "Wellness snapshot")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-ink">
              {dailyHyd.consumedMl} <span className="text-xs font-normal text-ink-light">/ {dailyHyd.targetMl} {unit}</span>
            </span>
          </div>
          <Link
            to="/wellness"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>{t("viewInWellness") || (isAr ? "عرضها في العافية" : "View in Wellness")}</span>
            {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddWater}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-sm active:scale-95 transition-all"
          >
            <Droplets size={13} />
            <span>+{defaultAmount} {unit}</span>
          </button>
          {dailyHyd.consumedMl > 0 && (
            <button
              onClick={handleUndoWater}
              className="p-2 rounded-2xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-white/70 dark:bg-card/70 border border-sky-300/40 hover:bg-white shadow-sm active:scale-95 transition-all"
              title={t("undoWaterBtn") || (isAr ? "تراجع" : "Undo")}
              aria-label="Undo water"
            >
              <Undo2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 5. Gentle Suggestions Row */}
      <div className="rounded-3xl bg-card border border-border/70 p-4 shadow-rose-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <Sparkles size={14} className="text-pink-500" />
            <span>{t("gentleSuggestions") || (isAr ? "اقتراحات لطيفة لكِ" : "Gentle suggestions for you")}</span>
          </div>
          <button
            onClick={() => onNavigateToIdeas()}
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
          >
            {isAr ? "عرض الكل" : "See all"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CURATED_CARE_IDEAS.slice(0, 4).map((idea) => (
            <div
              key={idea.id}
              onClick={() => onNavigateToIdeas(idea.relatedNeeds[0])}
              className="min-w-[160px] p-3 rounded-2xl bg-surface border border-border/50 hover:border-pink-400/60 cursor-pointer transition-all active:scale-95 space-y-1"
            >
              <span className="text-xl">{idea.icon}</span>
              <p className="text-xs font-bold text-ink line-clamp-1">
                {isAr ? idea.titleAr : idea.titleEn}
              </p>
              <p className="text-[10px] text-ink-light">
                {idea.durationMinutes} {isAr ? "دقائق" : "min"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Reflect in Journal Button */}
      <div className="text-center pt-1">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-xs font-bold text-ink hover:bg-surface shadow-sm active:scale-95 transition-all"
        >
          <BookOpen size={14} className="text-pink-500" />
          <span>{t("reflectInJournal") || (isAr ? "اكتبي في يومياتكِ 📖" : "Reflect in Journal 📖")}</span>
        </Link>
      </div>
    </div>
  );
};
