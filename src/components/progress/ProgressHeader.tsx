import React from "react";
import { ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ProgressTabId = "overview" | "activity" | "challenges" | "badges";

interface ProgressHeaderProps {
  activeTab: ProgressTabId;
  onTabChange: (tab: ProgressTabId) => void;
  onOpenSettings: () => void;
  onBack: () => void;
  canonicalXp: number;
  level: number;
  tierEmoji: string;
}

export function ProgressHeader({
  activeTab,
  onTabChange,
  onOpenSettings,
  onBack,
  canonicalXp,
  level,
  tierEmoji,
}: ProgressHeaderProps) {
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const tabs: { id: ProgressTabId; label: string }[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "activity", label: t("tabActivity") },
    { id: "challenges", label: t("tabChallenges") },
    { id: "badges", label: t("tabBadges") },
  ];

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/70 pt-3 pb-2 shadow-xs transition-colors">
      <div className="px-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink hover:bg-card active:scale-95 transition-all shadow-2xs shrink-0"
              aria-label={isAr ? "الرجوع للمزيد" : "Back to More"}
            >
              <ArrowLeft size={18} className="rtl:rotate-180 transition-transform" />
            </button>

            <div className="min-w-0">
              <h1 className="text-[19px] font-black text-ink tracking-tight flex items-center gap-1.5 truncate font-display">
                <span>{t("progressPageTitle")}</span>
              </h1>
              <p className="text-[11px] font-semibold text-ink-light truncate mt-0.5">
                {t("progressPageSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick XP Chip */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border/80 text-[11.5px] font-extrabold text-ink shadow-2xs">
              <span>{tierEmoji}</span>
              <span className="font-mono text-hotpink">{canonicalXp.toLocaleString()} XP</span>
              <span className="text-ink-light">•</span>
              <span>{isAr ? `المستوى ${level}` : `Lv ${level}`}</span>
            </div>

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink hover:bg-card active:scale-95 transition-all shadow-2xs"
              aria-label={t("progressSettingsTitle")}
              title={t("progressSettingsTitle")}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* 4 Tabs Bar */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "cursor-pointer shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-black transition-all active:scale-95 border",
                  isActive
                    ? "grad-theme text-white border-transparent shadow-rose-sm"
                    : "bg-surface text-ink-light hover:text-ink border-border/70 hover:border-border"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
