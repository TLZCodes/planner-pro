import React from "react";
import { ArrowLeft, ArrowRight, Settings, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";

export type WellnessTab = "today" | "trackers" | "movement" | "insights";

interface WellnessHeaderProps {
  activeTab: WellnessTab;
  onTabChange: (tab: WellnessTab) => void;
  onOpenSettings: () => void;
}

export const WellnessHeader: React.FC<WellnessHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
}) => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const tabs: { key: WellnessTab; label: string; icon: string }[] = [
    { key: "today", label: t("wellnessTabToday"), icon: "✨" },
    { key: "trackers", label: t("wellnessTabTrackers"), icon: "💧" },
    { key: "movement", label: t("wellnessTabMovement"), icon: "🏃‍♀️" },
    { key: "insights", label: t("wellnessTabInsights"), icon: "📊" },
  ];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 pb-2">
      {/* Top Bar with Back & Settings */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate({ to: "/more" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-xl bg-card border border-border/60 hover:bg-card-hover transition-colors shadow-2xs cursor-pointer"
          title={t("backToMore")}
        >
          {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
          <span>{t("backToMore")}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-card border border-border/60 text-ink-muted hover:text-ink hover:bg-card-hover transition-colors shadow-2xs cursor-pointer"
          title={t("wellnessSettingsTitle")}
        >
          <Settings size={17} />
        </button>
      </div>

      {/* Title & Subtitle */}
      <div className="px-4 mb-3">
        <h1 className="text-xl font-bold text-ink flex items-center gap-2">
          {t("myWellnessTitle")}
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          {t("myWellnessSubtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-rose-500 text-white font-semibold shadow-xs"
                  : "bg-card text-ink-muted hover:text-ink border border-border/50 hover:bg-card-hover"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
