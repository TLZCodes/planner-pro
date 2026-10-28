import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Settings,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type PixelsTab = "year" | "month" | "insights";

interface PixelsHeaderProps {
  activeTab: PixelsTab;
  onTabChange: (tab: PixelsTab) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onJumpToToday: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
}

export const PixelsHeader: React.FC<PixelsHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedYear,
  onYearChange,
  onJumpToToday,
  onOpenSettings,
  onOpenExport,
}) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const currentYear = new Date().getFullYear();

  const handlePrevYear = () => onYearChange(selectedYear - 1);
  const handleNextYear = () => onYearChange(selectedYear + 1);

  const tabs: { key: PixelsTab; label: string; icon: string }[] = [
    { key: "year", label: t("tabYear") || (isAr ? "السنة" : "Year"), icon: "🌈" },
    { key: "month", label: t("tabMonth") || (isAr ? "الشهر" : "Month"), icon: "📅" },
    { key: "insights", label: t("tabInsights") || (isAr ? "الإحصاءات" : "Insights"), icon: "✨" },
  ];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 pb-2">
      {/* Top action row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link
          to="/more"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-card/80 text-ink shadow-sm border border-border/50 hover:bg-surface transition-all active:scale-95"
        >
          {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{t("backToMore") || (isAr ? "العودة للمزيد" : "Back to More")}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onJumpToToday}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/40 hover:bg-pink-100 transition-all active:scale-95 shadow-sm"
          >
            {t("todayJumpBtn") || (isAr ? "اليوم" : "Today")}
          </button>

          <button
            onClick={onOpenExport}
            className="p-2 rounded-full bg-card border border-border/60 text-ink-light hover:text-ink shadow-sm active:scale-95 transition-all"
            title={t("exportYearTitle") || "Export"}
            aria-label="Export Year"
          >
            <Download size={16} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-card border border-border/60 text-ink-light hover:text-ink shadow-sm active:scale-95 transition-all"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Title & Year Picker */}
      <div className="px-4 pt-1 pb-2 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight font-display flex items-center gap-2">
            <span>{isAr ? "سنتي بالألوان" : "Year in Pixels"}</span>
            <span className="text-pink-500">🌈</span>
          </h1>
          <p className="text-xs text-ink-light mt-0.5">
            {t("pixelsPageSubtitle") ||
              (isAr ? "لون لطيف يحفظ شعور كل يوم." : "One gentle color for each day.")}
          </p>
        </div>

        {/* Dynamic Year Stepper */}
        <div className="flex items-center gap-1 bg-card/80 border border-border/60 rounded-full px-2.5 py-1 shadow-sm text-xs font-bold text-ink">
          <button
            onClick={handlePrevYear}
            className="p-1 rounded-full text-ink-light hover:text-ink active:scale-90 transition-all"
            aria-label={t("prevYearBtn") || "Previous Year"}
          >
            {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <span className="px-2 font-mono font-black text-sm text-pink-600 dark:text-pink-400">
            {selectedYear}
          </span>

          <button
            onClick={handleNextYear}
            disabled={selectedYear >= currentYear + 1}
            className="p-1 rounded-full text-ink-light hover:text-ink active:scale-90 transition-all disabled:opacity-30"
            aria-label={t("nextYearBtn") || "Next Year"}
          >
            {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* 3 Main Tabs */}
      <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shadow-sm",
                isActive
                  ? "bg-hotpink text-white shadow-rose-sm"
                  : "bg-card border border-border/60 text-ink-light hover:text-ink hover:bg-surface"
              )}
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
