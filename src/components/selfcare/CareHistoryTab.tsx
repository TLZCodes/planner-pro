import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Heart,
  CheckCircle2,
  Sparkles,
  PieChart,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CARE_CATEGORIES, type CareCategory } from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

export const CareHistoryTab: React.FC = () => {
  const { t, lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";

  const [period, setPeriod] = useState<"7d" | "30d">("7d");

  const activities = state.selfCareActivities || [];
  const planItems = state.selfCarePlanItems || [];

  // Filter completed items within the period
  const cutoffDays = period === "7d" ? 7 : 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);
  const cutoffDateStr = cutoffDate.toISOString().slice(0, 10);

  const completedInPeriod = planItems.filter(
    (p) => p.status === "completed" && p.localDate >= cutoffDateStr
  );

  // Group by unique dates with at least one completed care moment
  const uniqueCareDates = Array.from(
    new Set(completedInPeriod.map((p) => p.localDate))
  );

  // Compute total duration in minutes
  const actMap = new Map(activities.map((a) => [a.id, a]));
  let totalMinutes = 0;
  const categoryCounts: Record<string, number> = {};

  completedInPeriod.forEach((p) => {
    const act = actMap.get(p.activityId);
    const duration = p.plannedDuration || act?.estimatedDurationMinutes || 10;
    totalMinutes += duration;

    const cat = act?.category || "custom";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* 7d vs 30d Filter Pills */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPeriod("7d")}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
            period === "7d"
              ? "bg-hotpink text-white border-hotpink shadow-sm"
              : "bg-card border-border/60 text-ink-light hover:text-ink"
          )}
        >
          {isAr ? "آخر 7 أيام" : "Past 7 Days"}
        </button>
        <button
          onClick={() => setPeriod("30d")}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
            period === "30d"
              ? "bg-hotpink text-white border-hotpink shadow-sm"
              : "bg-card border-border/60 text-ink-light hover:text-ink"
          )}
        >
          {isAr ? "آخر 30 يومًا" : "Past 30 Days"}
        </button>
      </div>

      {/* Gentle Header Note */}
      <div className="rounded-3xl bg-pink-500/10 border border-pink-500/20 p-4 text-center space-y-1">
        <span className="text-xl">🌸</span>
        <h3 className="text-sm font-bold text-ink">
          {isAr ? "كل لحظة عناية تُحدث فرقًا" : "Every moment of care matters"}
        </h3>
        <p className="text-xs text-ink-light max-w-sm mx-auto">
          {isAr
            ? "لا توجد أهداف إجبارية. عنايتكِ بنفسكِ رحلة هادئة مبنية على اللطف والتجدد."
            : "No pressure or rigid scores—just gentle moments you chose for your wellbeing."}
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm text-center space-y-1">
          <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
            {uniqueCareDates.length}
          </span>
          <p className="text-xs font-bold text-ink">
            {isAr ? "أيام العناية" : "Care Days"}
          </p>
          <p className="text-[10px] text-ink-light">
            {isAr
              ? `من أصل ${cutoffDays} يومًا`
              : `out of ${cutoffDays} days`}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm text-center space-y-1">
          <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
            {totalMinutes}
          </span>
          <p className="text-xs font-bold text-ink">
            {isAr ? "دقائق العناية" : "Minutes of Care"}
          </p>
          <p className="text-[10px] text-ink-light">
            {isAr ? "وقت مستقطع لنفسكِ" : "gentle pause time"}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <PieChart size={14} className="text-pink-500" />
            <span>{isAr ? "توزيع العناية حسب التصنيف" : "Care by Category"}</span>
          </div>

          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([catKey, count]) => {
              const cat = CARE_CATEGORIES.find((c) => c.key === catKey);
              const pct = Math.round((count / completedInPeriod.length) * 100);

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink">
                      <span>{cat?.icon || "🌸"}</span>
                      <span>{isAr ? cat?.labelAr : cat?.labelEn}</span>
                    </span>
                    <span className="text-ink-light font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Completed Timeline */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light px-1">
          {isAr ? "سجل اللحظات الأخيرة" : "Recent Care Moments"}
        </h4>

        {completedInPeriod.length === 0 ? (
          <div className="rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-2">
            <span className="text-3xl">🌿</span>
            <p className="text-xs text-ink-light">
              {t("historyEmptyTitle") ||
                (isAr
                  ? "ستظهر لحظات عنايتكِ اللطيفة هنا."
                  : "Your gentle care moments will appear here.")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedInPeriod.slice(0, 10).map((item) => {
              const act = actMap.get(item.activityId);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-base">{act?.icon || "🌸"}</span>
                    <div>
                      <h5 className="text-xs font-bold text-ink">
                        {act?.title || "Care Activity"}
                      </h5>
                      <span className="text-[10px] text-ink-light">
                        {item.localDate}
                      </span>
                    </div>
                  </div>

                  {(item.plannedDuration || act?.estimatedDurationMinutes) && (
                    <span className="text-[11px] text-ink-light font-medium flex items-center gap-1">
                      <Clock size={11} />
                      <span>
                        {item.plannedDuration || act?.estimatedDurationMinutes} {isAr ? "د" : "min"}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
