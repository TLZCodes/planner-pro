import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Plus, Settings, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type SelfCareTab = "today" | "activities" | "bingo" | "ideas" | "history";

interface SelfCareHeaderProps {
  activeTab: SelfCareTab;
  onTabChange: (tab: SelfCareTab) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAdd: () => void;
  onOpenSettings: () => void;
}

export const SelfCareHeader: React.FC<SelfCareHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  onOpenAdd,
  onOpenSettings,
}) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  const tabs: { key: SelfCareTab; label: string; icon: string }[] = [
    { key: "today", label: t("tabTodayCare") || (isAr ? "اليوم" : "Today"), icon: "🌸" },
    { key: "activities", label: t("tabMyActivities") || (isAr ? "أنشطتي" : "My Activities"), icon: "📋" },
    { key: "bingo", label: t("tabBingo") || (isAr ? "بينغو" : "Bingo"), icon: "✨" },
    { key: "ideas", label: t("tabIdeas") || (isAr ? "أفكار" : "Ideas"), icon: "💡" },
    { key: "history", label: t("tabCareHistory") || (isAr ? "السجل" : "History"), icon: "📅" },
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

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-rose-sm hover:opacity-95 active:scale-95 transition-all"
            aria-label={t("addCareActivityBtn") || "+ Add Care Activity"}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">{t("addCareActivityBtn") || (isAr ? "+ أضيفي نشاط عناية" : "+ Add Care Activity")}</span>
            <span className="sm:hidden">{isAr ? "إضافة" : "Add"}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-card border border-border/60 text-ink-light hover:text-ink shadow-sm active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="px-4 pt-1 pb-2">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight font-display flex items-center gap-2">
            <span>{isAr ? "العناية بنفسي" : "Self-care"}</span>
            <span className="text-pink-500">🌸</span>
          </h1>

          {/* Date Picker Pill */}
          <div className="flex items-center gap-1 bg-card/80 border border-border/60 rounded-full px-2 py-0.5 shadow-sm text-xs text-ink font-medium">
            <button onClick={handlePrevDay} className="p-0.5 text-ink-light hover:text-ink" aria-label="Previous Day">
              {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <span className="px-1 font-bold text-[11px]">
              {isToday ? (isAr ? "اليوم" : "Today") : selectedDate}
            </span>
            <button onClick={handleNextDay} className="p-0.5 text-ink-light hover:text-ink" aria-label="Next Day">
              {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-ink-light mt-0.5">
          {t("selfCareSubtitle") || (isAr ? "مساحة صغيرة ولطيفة لكِ." : "A gentle pause made for you.")}
        </p>
      </div>

      {/* 4 Tabs */}
      <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar pt-1 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shadow-sm",
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
