import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Bell,
  Archive,
  RotateCcw,
  Pause,
  Play,
  Trash2,
  Unlink,
  Plus,
  Filter,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  CARE_CATEGORIES,
  type SelfCareActivity,
  type CareCategory,
} from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface MyActivitiesTabProps {
  onOpenAdd: () => void;
  onEditActivity?: (activity: SelfCareActivity) => void;
}

type FilterType = "all" | "active" | "scheduled" | "linked" | "archived";

export const MyActivitiesTab: React.FC<MyActivitiesTabProps> = ({
  onOpenAdd,
  onEditActivity,
}) => {
  const { t, lang } = useLang();
  const {
    state,
    archiveCareActivity,
    restoreCareActivity,
    updateCareActivity,
    deleteCareActivity,
  } = useApp();
  const isAr = lang === "ar";

  const [activeFilter, setActiveFilter] = useState<FilterType>("active");
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | "all">("all");

  const activities = state.selfCareActivities || [];

  const filtered = activities.filter((act) => {
    // Status filter
    if (activeFilter === "active" && act.status !== "active") return false;
    if (activeFilter === "archived" && act.status !== "archived") return false;
    if (activeFilter === "scheduled" && act.recurrenceRule === "none") return false;
    if (activeFilter === "linked" && act.sourceType === "custom") return false;

    // Category filter
    if (selectedCategory !== "all" && act.category !== selectedCategory) return false;

    return true;
  });

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "active", label: isAr ? "النشطة" : "Active" },
    { key: "scheduled", label: isAr ? "المجدولة" : "Scheduled" },
    { key: "linked", label: isAr ? "المرتبطة" : "Linked" },
    { key: "archived", label: isAr ? "المؤرشفة" : "Archived" },
    { key: "all", label: isAr ? "الكل" : "All" },
  ];

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              activeFilter === tab.key
                ? "bg-hotpink text-white border-hotpink shadow-sm"
                : "bg-card border-border/60 text-ink-light hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap border",
            selectedCategory === "all"
              ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300"
              : "bg-surface border-border/40 text-ink-light"
          )}
        >
          {isAr ? "جميع التصنيفات" : "All Categories"}
        </button>
        {CARE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap border flex items-center gap-1",
              selectedCategory === cat.key
                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300"
                : "bg-surface border-border/40 text-ink-light"
            )}
          >
            <span>{cat.icon}</span>
            <span>{isAr ? cat.labelAr : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Activities List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-2">
          <span className="text-3xl">🌸</span>
          <h4 className="text-sm font-bold text-ink">
            {t("myActivitiesEmptyTitle") ||
              (isAr ? "أنشئي عناية تناسب حياتكِ الحقيقية." : "Create care that fits your real life.")}
          </h4>
          <p className="text-xs text-ink-light max-w-xs mx-auto">
            {isAr
              ? "أضيفي أنشطتكِ المفضلة لتظهر في خطة يومكِ وتدعم راحتكِ."
              : "Add custom care activities to nourish your mind and body gently."}
          </p>
          <button
            onClick={onOpenAdd}
            className="mt-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95"
          >
            {t("addCareActivityBtn") || (isAr ? "+ أضيفي نشاط عناية" : "+ Add Care Activity")}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((act) => {
            const isPaused = act.status === "paused";
            const isArchived = act.status === "archived";
            const cat = CARE_CATEGORIES.find((c) => c.key === act.category);

            return (
              <div
                key={act.id}
                className={cn(
                  "p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm space-y-3 transition-all",
                  (isPaused || isArchived) && "opacity-60 bg-ghost/50"
                )}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl p-2 rounded-2xl bg-surface border border-border/40 flex-shrink-0">
                      {act.icon || "🌸"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-ink truncate">
                          {act.title}
                        </h4>
                        {act.sourceType !== "custom" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 uppercase">
                            {act.sourceType}
                          </span>
                        )}
                        {isPaused && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                            {isAr ? "موقف مؤقتًا" : "Paused"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-light mt-0.5">
                        {isAr ? cat?.labelAr : cat?.labelEn}
                      </p>
                    </div>
                  </div>

                  {/* Top action: Pause/Resume or Restore */}
                  <div className="flex items-center gap-1">
                    {isArchived ? (
                      <button
                        onClick={() => restoreCareActivity(act.id)}
                        className="p-1.5 text-xs text-pink-600 hover:text-pink-700 hover:bg-surface rounded-xl transition-all"
                        title={isAr ? "استعادة" : "Restore"}
                      >
                        <RotateCcw size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateCareActivity(act.id, {
                            status: isPaused ? "active" : "paused",
                          })
                        }
                        className="p-1.5 text-xs text-ink-light hover:text-ink hover:bg-surface rounded-xl transition-all"
                        title={isPaused ? (isAr ? "استئناف" : "Resume") : (isAr ? "إيقاف مؤقت" : "Pause")}
                      >
                        {isPaused ? <Play size={15} /> : <Pause size={15} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Meta Row */}
                <div className="flex items-center gap-3 text-xs text-ink-light pt-1 border-t border-border/40">
                  {act.estimatedDurationMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{act.estimatedDurationMinutes} {isAr ? "دقيقة" : "min"}</span>
                    </span>
                  )}
                  {act.recurrenceRule && act.recurrenceRule !== "none" && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{act.recurrenceRule}</span>
                    </span>
                  )}
                  {act.reminderEnabled && (
                    <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                      <Bell size={12} />
                      <span>{act.reminderTime || "Remind"}</span>
                    </span>
                  )}

                  {/* Archive / Delete actions on the right */}
                  <div className="ml-auto flex items-center gap-1.5">
                    {!isArchived && (
                      <button
                        onClick={() => archiveCareActivity(act.id)}
                        className="text-[11px] text-ink-light hover:text-ink px-2 py-0.5 rounded-lg hover:bg-surface"
                      >
                        {isAr ? "أرشفة" : "Archive"}
                      </button>
                    )}
                    {act.sourceType === "custom" ? (
                      <button
                        onClick={() => deleteCareActivity(act.id)}
                        className="text-ink-light/50 hover:text-danger p-1 rounded-lg"
                        title={isAr ? "حذف" : "Delete"}
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteCareActivity(act.id)}
                        className="text-[11px] text-ink-light hover:text-danger px-1.5 py-0.5 rounded-lg flex items-center gap-1"
                        title={t("unlinkBtn") || (isAr ? "إلغاء الربط" : "Unlink")}
                      >
                        <Unlink size={11} />
                        <span>{isAr ? "فك الربط" : "Unlink"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
