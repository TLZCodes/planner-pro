import React from "react";
import { X, SlidersHorizontal, Check, Eye, EyeOff, Calendar, LayoutGrid, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import type {
  HabitWeekPreferences,
  HabitWeekGroupingMode,
  HabitWeekDensity,
  WeekStartDay,
} from "../../../lib/weeklyHabitEngine";

interface CustomizeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: HabitWeekPreferences;
  onUpdatePreferences: (prefs: Partial<HabitWeekPreferences>) => void;
  isAr: boolean;
}

export const CustomizeBoardModal: React.FC<CustomizeBoardModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  isAr,
}) => {
  if (!isOpen) return null;

  const currentFirstDay = preferences.firstDayOfWeek || "saturday";
  const currentGrouping = preferences.groupingMode || "none";
  const currentDensity = preferences.density || "comfortable";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-pink-50/60 via-surface to-pink-50/60 dark:from-pink-950/20 dark:via-surface dark:to-pink-950/20">
          <div className="flex items-center gap-2 text-ink">
            <SlidersHorizontal className="h-4 w-4 text-hotpink" />
            <h3 className="text-base font-black">
              {isAr ? "تخصيص لوحة الأسبوع" : "Customize Weekly Board"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-ink-light hover:text-ink cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ── 1. First Day of Week ── */}
          <div className="space-y-2">
            <label className="text-[12px] font-extrabold text-ink flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-hotpink" />
              <span>{isAr ? "بداية الأسبوع" : "Week Starts On"}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "saturday", ar: "السبت", en: "Saturday" },
                  { id: "sunday", ar: "الأحد", en: "Sunday" },
                  { id: "monday", ar: "الإثنين", en: "Monday" },
                ] as { id: WeekStartDay; ar: string; en: string }[]
              ).map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ firstDayOfWeek: day.id })}
                  className={cn(
                    "h-10 rounded-2xl border text-[12px] font-bold transition-all cursor-pointer",
                    currentFirstDay === day.id
                      ? "bg-hotpink text-white border-hotpink shadow-2xs"
                      : "bg-surface border-border text-ink hover:border-hotpink/50"
                  )}
                >
                  {isAr ? day.ar : day.en}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Habit Grouping Mode ── */}
          <div className="space-y-2">
            <label className="text-[12px] font-extrabold text-ink flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-hotpink" />
              <span>{isAr ? "تجميع العادات" : "Habit Grouping"}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "none", ar: "بدون تجميع", en: "None" },
                  { id: "timeOfDay", ar: "حسب الوقت", en: "Time of Day" },
                  { id: "category", ar: "التصنيف", en: "Category" },
                ] as { id: HabitWeekGroupingMode; ar: string; en: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ groupingMode: m.id })}
                  className={cn(
                    "h-10 rounded-2xl border text-[11.5px] font-bold transition-all cursor-pointer",
                    currentGrouping === m.id
                      ? "bg-hotpink text-white border-hotpink shadow-2xs"
                      : "bg-surface border-border text-ink hover:border-hotpink/50"
                  )}
                >
                  {isAr ? m.ar : m.en}
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. Density ── */}
          <div className="space-y-2">
            <label className="text-[12px] font-extrabold text-ink flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-hotpink" />
              <span>{isAr ? "كثافة العرض" : "Row Density"}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "comfortable", ar: "مريح (افتراضي)", en: "Comfortable" },
                  { id: "compact", ar: "مدمج (لشاشات أصغر)", en: "Compact" },
                ] as { id: HabitWeekDensity; ar: string; en: string }[]
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onUpdatePreferences({ density: d.id })}
                  className={cn(
                    "h-10 rounded-2xl border text-[12px] font-bold transition-all cursor-pointer",
                    currentDensity === d.id
                      ? "bg-hotpink text-white border-hotpink shadow-2xs"
                      : "bg-surface border-border text-ink hover:border-hotpink/50"
                  )}
                >
                  {isAr ? d.ar : d.en}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Cross-Module Tracker Toggles ── */}
          <div className="space-y-2 pt-1 border-t border-border">
            <span className="text-[12px] font-extrabold text-ink block">
              {isAr ? "صفوف متتبعات العافية المتزامنة" : "Synchronized Wellness Rows"}
            </span>

            <div className="space-y-2">
              {[
                {
                  key: "showWater" as const,
                  emoji: "💧",
                  labelAr: "شرب الماء اليومي",
                  labelEn: "Daily Hydration",
                  val: preferences.showWater ?? true,
                },
                {
                  key: "showMood" as const,
                  emoji: "🌸",
                  labelAr: "شعور اليوم (المزاج)",
                  labelEn: "Daily Mood",
                  val: preferences.showMood ?? true,
                },
                {
                  key: "showEnergy" as const,
                  emoji: "⚡",
                  labelAr: "مستوى الطاقة",
                  labelEn: "Energy Rhythm",
                  val: preferences.showEnergy ?? true,
                },
                {
                  key: "showDayRating" as const,
                  emoji: "⭐",
                  labelAr: "تقييم اليوم (1-5)",
                  labelEn: "Day Rating (1-5)",
                  val: preferences.showDayRating ?? true,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-surface/80 border border-border/80"
                >
                  <div className="flex items-center gap-2 text-[12px] font-bold text-ink">
                    <span>{item.emoji}</span>
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdatePreferences({ [item.key]: !item.val })}
                    className={cn(
                      "h-7 px-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1",
                      item.val
                        ? "bg-emerald-500 text-white"
                        : "bg-surface border border-border text-ink-light"
                    )}
                  >
                    {item.val ? (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>{isAr ? "مفعّل" : "Visible"}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>{isAr ? "مخفي" : "Hidden"}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. Planner Elements Toggles ── */}
          <div className="space-y-2 pt-1 border-t border-border">
            <span className="text-[12px] font-extrabold text-ink block">
              {isAr ? "عناصر لوحة التخطيط" : "Planner Board Elements"}
            </span>

            <div className="space-y-2">
              {[
                {
                  key: "showIntentionCard" as const,
                  labelAr: "بطاقة النيّة الأسبوعية",
                  labelEn: "Weekly Intention Card",
                  val: preferences.showIntentionCard ?? true,
                },
                {
                  key: "showNotesCard" as const,
                  labelAr: "بطاقة الملاحظات والتأمل",
                  labelEn: "Weekly Notes & Reflection Card",
                  val: preferences.showNotesCard ?? true,
                },
                {
                  key: "showFlexibleSection" as const,
                  labelAr: "قسم العادات المرنة (مرات/أسبوع)",
                  labelEn: "Flexible Habits Section",
                  val: preferences.showFlexibleSection ?? true,
                },
                {
                  key: "showStreaks" as const,
                  labelAr: "عرض سلسلة الأيام في العادات",
                  labelEn: "Show Streaks in Habit Rows",
                  val: preferences.showStreaks ?? true,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-surface/80 border border-border/80"
                >
                  <span className="text-[12px] font-bold text-ink">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdatePreferences({ [item.key]: !item.val })}
                    className={cn(
                      "h-7 px-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1",
                      item.val
                        ? "bg-hotpink text-white"
                        : "bg-surface border border-border text-ink-light"
                    )}
                  >
                    {item.val ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>{isAr ? "ظاهر" : "Visible"}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>{isAr ? "مخفي" : "Hidden"}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface/80 text-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-2xl bg-hotpink text-white text-[13px] font-extrabold shadow-xs hover:bg-hotpink/90 transition-all cursor-pointer"
          >
            {isAr ? "تم وحفظ الإعدادات ✨" : "Done & Apply ✨"}
          </button>
        </div>
      </div>
    </div>
  );
};
