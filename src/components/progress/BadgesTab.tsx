import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trophy, Award, Lock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type BadgeDefinition,
  type BadgeProgress,
  type BadgeCategory,
  calculateAllBadgeProgress,
} from "@/lib/badgeEngine";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

const hexStyle = {
  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
};

export function BadgesTab() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { state } = useApp();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<BadgeCategory>("all");
  const [selectedBadgeProgress, setSelectedBadgeProgress] = useState<BadgeProgress | null>(null);

  const allProgress = useMemo(() => {
    return calculateAllBadgeProgress(state, { includeFaith: true, includeInactive: false });
  }, [state]);

  const unlockedCount = useMemo(() => {
    return allProgress.filter((p) => p.isUnlocked).length;
  }, [allProgress]);

  const categories: { id: BadgeCategory; label: string }[] = [
    { id: "all", label: t("catAll") || (isAr ? "الكل" : "All") },
    { id: "productivity", label: t("catProductivity") || (isAr ? "الإنتاجية" : "Productivity") },
    { id: "habits_routines", label: t("catHabitsRoutines") || (isAr ? "العادات والروتين" : "Habits & Routines") },
    { id: "goals", label: t("catGoals") || (isAr ? "الأهداف" : "Goals") },
    { id: "focus_learning", label: t("catFocusLearning") || (isAr ? "التركيز والتعلم" : "Focus & Learning") },
    { id: "wellness", label: t("catWellness") || (isAr ? "العافية" : "Wellness") },
    { id: "business", label: t("catBusiness") || (isAr ? "الأعمال" : "Business") },
    { id: "faith", label: t("catFaith") || (isAr ? "الروحانيات" : "Faith") },
  ];

  const filteredBadges = useMemo(() => {
    return allProgress.filter((p) => {
      if (activeCategory === "all") return true;
      return p.definition.category === activeCategory;
    });
  }, [allProgress, activeCategory]);

  return (
    <div className="space-y-5">
      {/* Top Banner: Unlocked Count & Link to /badges */}
      <div className="rounded-3xl bg-card border border-border/70 p-4.5 shadow-rose-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 text-2xl font-bold">
            🏆
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-black text-ink truncate">
              {t("badgesUnlockedSummary") || (isAr ? "الأوسمة المفتوحة" : "Unlocked Badges")}
            </h3>
            <p className="text-[12px] font-bold text-ink-light">
              {unlockedCount} / {allProgress.length} {isAr ? "شارات مفتوحة" : "badges unlocked"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/badges" })}
          className="cursor-pointer shrink-0 px-3.5 py-2 rounded-xl grad-theme text-white text-[11.5px] font-black active:scale-95 transition-all shadow-rose-xs flex items-center gap-1.5"
        >
          <span>{isAr ? "فتح المعرض الكامل 🏆" : "View Full Collection 🏆"}</span>
          <ArrowRight size={13} className="rtl:rotate-180" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-3.5 py-1 text-[11.5px] font-extrabold border transition-all active:scale-95",
                isActive
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface text-ink-light hover:text-ink border-border/70"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
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
                "cursor-pointer relative rounded-3xl p-4 border flex flex-col items-center gap-2 text-center transition-all active:scale-95 shadow-2xs",
                isUnlocked
                  ? "bg-card border-border/80 hover:border-hotpink/50 hover:shadow-rose-xs"
                  : "bg-surface/50 border-border/40 opacity-70"
              )}
            >
              <div
                style={hexStyle}
                className={cn(
                  "flex h-13 w-13 items-center justify-center text-2xl shadow-inner border transition-transform group-hover:scale-105",
                  isUnlocked
                    ? "grad-theme text-white border-white/40 shadow-xs"
                    : "bg-ghost border-border/60 text-ink-light"
                )}
              >
                {isUnlocked ? def.icon : "🔒"}
              </div>

              <div className="min-w-0 w-full">
                <p className="text-[12px] font-black text-ink truncate leading-tight">
                  {isAr ? def.nameAr : def.nameEn}
                </p>
                <p className="text-[10px] font-medium text-ink-light line-clamp-2 mt-0.5">
                  {isAr ? def.shortCriterionAr : def.shortCriterionEn}
                </p>
              </div>

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

      {/* Badge Detail Modal */}
      {selectedBadgeProgress && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in">
          <div className="w-full max-w-sm max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border/80 p-6 text-center space-y-4 shadow-rose-md">
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

            <div className="space-y-1">
              <h3 className="text-[16px] font-black text-ink">
                {isAr ? selectedBadgeProgress.definition.nameAr : selectedBadgeProgress.definition.nameEn}
              </h3>
              <p className="text-[12px] font-medium text-ink-light">
                {isAr ? selectedBadgeProgress.definition.criterionAr : selectedBadgeProgress.definition.criterionEn}
              </p>
            </div>

            <div className="rounded-2xl bg-surface/80 p-3 text-center space-y-1">
              <p className="text-[11px] font-mono font-bold text-ink">
                {selectedBadgeProgress.formattedProgress} ({selectedBadgeProgress.percentage}%)
              </p>
              <ProgressBar
                value={selectedBadgeProgress.percentage}
                className="h-2 bg-card"
                barClass={selectedBadgeProgress.isUnlocked ? "grad-theme" : "bg-hotpink"}
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedBadgeProgress(null);
                  navigate({ to: "/badges" });
                }}
                className="cursor-pointer w-full py-2.5 rounded-xl grad-theme text-white text-xs font-black shadow-rose-xs active:scale-95"
              >
                {isAr ? "عرض في صفحة الشارات 🏆" : "Open in Badges 🏆"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadgeProgress(null)}
                className="cursor-pointer w-full py-2.5 rounded-xl bg-surface hover:bg-card border border-border/70 text-ink text-xs font-bold active:scale-95"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
