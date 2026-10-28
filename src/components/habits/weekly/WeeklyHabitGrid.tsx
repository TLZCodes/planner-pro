import React, { useState } from "react";
import {
  Flame,
  Check,
  Plus,
  Minus,
  Target,
  CalendarDays,
  ListFilter,
  Grid3X3,
  Ban,
  Clock,
  Sparkles,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Habit } from "../../../lib/store";
import {
  type WeekInfo,
  type DayInfo,
  type HabitWeekGroupingMode,
  type HabitWeekDensity,
  getHabitCellData,
  groupHabits,
  isFlexibleHabit,
  getFlexibleHabitWeekCount,
} from "../../../lib/weeklyHabitEngine";

interface WeeklyHabitGridProps {
  habits: Habit[];
  weekInfo: WeekInfo;
  groupingMode: HabitWeekGroupingMode;
  density: HabitWeekDensity;
  showStreaks: boolean;
  showFlexibleSection: boolean;
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onUpdateHabitProgress: (habitId: string, value: number, dateStr: string) => void;
  onSkipHabit?: (habitId: string, dateStr: string) => void;
  onOpenHabitDetail: (habit: Habit) => void;
  isAr: boolean;
}

interface QuantitativeModalState {
  habit: Habit;
  day: DayInfo;
  value: number;
}

export const WeeklyHabitGrid: React.FC<WeeklyHabitGridProps> = ({
  habits,
  weekInfo,
  groupingMode,
  density,
  showStreaks,
  showFlexibleSection,
  onToggleHabit,
  onUpdateHabitProgress,
  onSkipHabit,
  onOpenHabitDetail,
  isAr,
}) => {
  const [viewMode, setViewMode] = useState<"matrix" | "dayList">("matrix");
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayIdx = weekInfo.days.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });
  const [quantModal, setQuantModal] = useState<QuantitativeModalState | null>(null);

  const activeHabits = habits.filter((h) => (h.status || "active") === "active");

  // Separate fixed-day scheduled habits from flexible X-times-per-week habits
  const scheduledHabits = activeHabits.filter((h) => !isFlexibleHabit(h));
  const flexibleHabits = activeHabits.filter((h) => isFlexibleHabit(h));

  const groups = groupHabits(scheduledHabits, groupingMode, isAr);
  const isCompact = density === "compact";

  const handleCellClick = (habit: Habit, day: DayInfo) => {
    // If future day, do not record completion to prevent fake future occurrences
    if (day.isFuture) return;

    const isQuantitative = habit.trackingType === "count" || habit.trackingType === "duration";
    const cellData = getHabitCellData(habit, day);

    if (isQuantitative) {
      setQuantModal({
        habit,
        day,
        value: cellData.currentVal,
      });
      return;
    }

    onToggleHabit(habit.id, day.dateStr);
  };

  const handleSaveQuantitative = (val: number) => {
    if (!quantModal) return;
    onUpdateHabitProgress(quantModal.habit.id, Math.max(0, val), quantModal.day.dateStr);
    setQuantModal(null);
  };

  const handleSkipQuantitative = () => {
    if (!quantModal) return;
    if (onSkipHabit) {
      onSkipHabit(quantModal.habit.id, quantModal.day.dateStr);
    }
    setQuantModal(null);
  };

  const renderCell = (habit: Habit, day: DayInfo) => {
    const cellData = getHabitCellData(habit, day);

    if (cellData.status === "not_scheduled") {
      return (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <span className="text-border text-xs select-none">—</span>
        </div>
      );
    }

    if (cellData.status === "paused") {
      return (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <span className="text-[10px] text-ink-light opacity-50 select-none" title={isAr ? "متوقفة مؤقتاً" : "Paused"}>
            ⏸
          </span>
        </div>
      );
    }

    if (cellData.status === "future_scheduled") {
      return (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <div
            className="h-6 w-6 rounded-xl border border-dashed border-pink-200/80 dark:border-pink-900/40 bg-pink-50/20 dark:bg-pink-950/10 flex items-center justify-center cursor-not-allowed opacity-75"
            title={isAr ? "مجدولة للأيام القادمة" : "Scheduled for upcoming day"}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-pink-300 dark:bg-pink-700" />
          </div>
        </div>
      );
    }

    if (cellData.status === "skipped") {
      return (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <button
            type="button"
            onClick={() => handleCellClick(habit, day)}
            className="h-6.5 w-6.5 rounded-xl border border-amber-300/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
            title={isAr ? "تم التخطي — انقري للتعديل" : "Skipped — tap to change"}
          >
            <Ban className="h-3 w-3" />
          </button>
        </div>
      );
    }

    if (cellData.status === "partial_progress") {
      return (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <button
            type="button"
            onClick={() => handleCellClick(habit, day)}
            className={cn(
              "relative rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/40 text-hotpink font-black flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105",
              isCompact ? "h-6.5 min-w-[26px] px-1 text-[9.5px]" : "h-7 min-w-[30px] px-1.5 text-[10px]"
            )}
            title={
              isAr
                ? `تقدم جزئي: ${cellData.currentVal}/${cellData.targetVal} ${habit.unit || ""}`
                : `Partial: ${cellData.currentVal}/${cellData.targetVal} ${habit.unit || ""}`
            }
          >
            <span>{cellData.currentVal}</span>
          </button>
        </div>
      );
    }

    // Interactive cells (completed, due_today, past_incomplete)
    const isDone = cellData.isCompleted;
    const isToday = day.isToday;

    return (
      <div className="flex items-center justify-center h-full min-h-[36px]">
        <button
          type="button"
          onClick={() => handleCellClick(habit, day)}
          className={cn(
            "relative rounded-xl flex items-center justify-center transition-all cursor-pointer select-none active:scale-90",
            isCompact ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]",
            isDone
              ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xs font-black ring-2 ring-pink-400/20 hover:scale-105"
              : isToday
              ? "bg-pink-50/90 dark:bg-pink-950/30 border-2 border-hotpink/80 text-hotpink font-bold hover:bg-pink-100/80 shadow-2xs animate-pulse-subtle"
              : "bg-surface border border-pink-200/60 dark:border-pink-900/40 text-ink-light hover:border-hotpink/60 hover:text-hotpink"
          )}
          title={
            isDone
              ? isAr ? "تم الإنجاز! انقري للإلغاء" : "Completed! Tap to undo"
              : isToday
              ? isAr ? "مطلوبة اليوم ✨ انقري للإنجاز" : "Due today ✨ Tap to complete"
              : isAr ? "تسجيل بأثر رجعي" : "Past incomplete — tap to log"
          }
        >
          {isDone ? (
            <Check className={cn("stroke-[3]", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          ) : (
            <span className="opacity-0 group-hover:opacity-100">+</span>
          )}
        </button>
      </div>
    );
  };

  const selectedDay = weekInfo.days[selectedDayIndex] || weekInfo.days[0];
  const selectedDayHabits = scheduledHabits.filter((h) =>
    (h.scheduledDays || [0, 1, 2, 3, 4, 5, 6]).includes(selectedDay.dayOfWeekIndex)
  );

  return (
    <div className="space-y-3.5">
      {/* ── View Switcher: Matrix Grid vs Accessible Day List ── */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-pink-200/60 dark:border-pink-900/40">
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "matrix"
                ? "bg-hotpink text-white shadow-2xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>{isAr ? "جدول الأسبوع" : "Weekly Matrix"}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("dayList")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "dayList"
                ? "bg-hotpink text-white shadow-2xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>{isAr ? "قائمة الأيام" : "Day List"}</span>
          </button>
        </div>

        <span className="text-[11px] text-ink-light font-medium hidden sm:inline">
          {viewMode === "matrix"
            ? isAr ? "تمرير أفقي لعرض الأيام" : "Scroll horizontally to view days"
            : isAr ? "عرض يومي بلمسات سهلة" : "Accessible day-by-day touch view"}
        </span>
      </div>

      {/* ── MODE A: 7-Day Matrix Table with Sticky Habit Column ── */}
      {viewMode === "matrix" && (
        <div className="overflow-hidden rounded-3xl bg-card border border-pink-200/70 dark:border-pink-900/40 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start min-w-[580px]">
              {/* Table Header: Habit & Days */}
              <thead>
                <tr className="border-b border-pink-100 dark:border-pink-950/60 bg-gradient-to-r from-pink-50/60 via-surface to-pink-50/60 dark:from-pink-950/20 dark:via-surface dark:to-pink-950/20">
                  {/* Sticky Habit Header */}
                  <th
                    scope="col"
                    className={cn(
                      "sticky start-0 z-20 bg-pink-50/95 dark:bg-surface/95 backdrop-blur-xs py-3 px-3 text-start text-[11px] font-extrabold uppercase tracking-wider text-ink border-e border-pink-100 dark:border-pink-950/60",
                      isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-hotpink">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{isAr ? "العادة المجدولة" : "Scheduled Habit"}</span>
                    </span>
                  </th>

                  {/* 7 Day Column Headers */}
                  {weekInfo.days.map((day) => (
                    <th
                      key={day.dateStr}
                      scope="col"
                      className={cn(
                        "py-2.5 px-1 text-center font-bold text-ink transition-colors",
                        day.isToday && "bg-pink-100/50 dark:bg-pink-950/30 text-hotpink font-extrabold"
                      )}
                    >
                      <span className="text-[10px] uppercase opacity-75 block">
                        {day.dayShort}
                      </span>
                      <span
                        className={cn(
                          "text-[12.5px] inline-flex items-center justify-center rounded-full h-6 w-6 mt-0.5",
                          day.isToday
                            ? "bg-hotpink text-white font-black shadow-2xs"
                            : "text-ink"
                        )}
                      >
                        {day.dayNum}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/40">
                {groups.map((group) => (
                  <React.Fragment key={group.id}>
                    {/* Group Section Header if grouping is active */}
                    {groupingMode !== "none" && (
                      <tr className="bg-pink-50/40 dark:bg-pink-950/15">
                        <td
                          colSpan={8}
                          className="py-1.5 px-3 text-[11px] font-black text-pink-700 dark:text-pink-300"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>{group.emoji}</span>
                            <span>{isAr ? group.titleAr : group.titleEn}</span>
                            <span className="text-ink-light text-[10px] font-normal">
                              ({group.habits.length})
                            </span>
                          </span>
                        </td>
                      </tr>
                    )}

                    {/* Habit Rows */}
                    {group.habits.map((habit) => (
                      <tr
                        key={habit.id}
                        className="hover:bg-pink-50/30 dark:hover:bg-pink-950/10 transition-colors group"
                      >
                        {/* Sticky Habit Info Column */}
                        <td
                          className={cn(
                            "sticky start-0 z-10 bg-card/95 backdrop-blur-xs py-2.5 px-3 border-e border-pink-100 dark:border-pink-950/60 transition-colors group-hover:bg-pink-50/40 dark:group-hover:bg-surface",
                            isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                          )}
                        >
                          <div
                            onClick={() => onOpenHabitDetail(habit)}
                            className="flex items-center gap-2 min-w-0 cursor-pointer text-start"
                            title={isAr ? "عرض وتعديل العادة" : "View habit details"}
                          >
                            <span className="text-base shrink-0 select-none">
                              {habit.emoji || "🌸"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold text-ink truncate group-hover:text-hotpink transition-colors">
                                {habit.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-ink-light">
                                {habit.category && (
                                  <span className="truncate">{habit.category}</span>
                                )}
                                {showStreaks && (habit.streak || 0) > 0 && (
                                  <span className="inline-flex items-center gap-0.5 font-bold text-hotpink shrink-0">
                                    <Flame className="h-2.5 w-2.5 fill-hotpink" />
                                    <span>{habit.streak}d</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 7 Day Matrix Cells */}
                        {weekInfo.days.map((day) => (
                          <td
                            key={day.dateStr}
                            className={cn(
                              "py-1.5 px-1 text-center transition-colors",
                              day.isToday && "bg-pink-50/30 dark:bg-pink-950/20"
                            )}
                          >
                            {renderCell(habit, day)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                {scheduledHabits.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-ink-light text-[13px] font-medium">
                      {isAr ? "لا توجد عادات مجدولة نشطة حالياً." : "No scheduled habits active."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODE B: Accessible Day-by-Day List View ── */}
      {viewMode === "dayList" && (
        <div className="space-y-3">
          {/* 7-Day Quick Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {weekInfo.days.map((day, idx) => (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={cn(
                  "flex-1 min-w-[54px] py-2 px-1.5 rounded-2xl border text-center transition-all cursor-pointer",
                  selectedDayIndex === idx
                    ? "bg-hotpink text-white border-hotpink shadow-xs font-bold"
                    : day.isToday
                    ? "bg-pink-50 dark:bg-pink-950/30 border-hotpink/60 text-hotpink font-bold"
                    : "bg-card border-pink-200/60 dark:border-pink-900/40 text-ink hover:border-hotpink/40"
                )}
              >
                <span className="block text-[10px] uppercase opacity-80">{day.dayShort}</span>
                <span className="block text-[13px] font-black">{day.dayNum}</span>
                {day.isToday && (
                  <span
                    className={cn(
                      "inline-block h-1 w-1 rounded-full mx-auto mt-0.5",
                      selectedDayIndex === idx ? "bg-white" : "bg-hotpink"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Scheduled Habits for the Selected Day */}
          <div className="rounded-3xl bg-card border border-pink-200/70 dark:border-pink-900/40 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-[13px] font-black text-ink flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-hotpink" />
                <span>
                  {selectedDay.dayName} ({selectedDay.dateStr})
                </span>
              </span>
              <span className="text-[11px] font-semibold text-ink-light">
                {selectedDayHabits.length} {isAr ? "عادات مجدولة" : "habits due"}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {selectedDayHabits.map((habit) => {
                const cellData = getHabitCellData(habit, selectedDay);
                const isDone = cellData.isCompleted;

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-2xl bg-surface/70 border border-border/80 flex items-center justify-between gap-3 hover:border-pink-300 transition-all"
                  >
                    <div
                      onClick={() => onOpenHabitDetail(habit)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-xl shrink-0">{habit.emoji || "🌸"}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-ink truncate">{habit.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-ink-light">
                          {habit.category && <span>{habit.category}</span>}
                          {habit.streak > 0 && (
                            <span className="text-hotpink font-bold flex items-center gap-0.5">
                              <Flame className="h-3 w-3 fill-hotpink" />
                              <span>{habit.streak}d</span>
                            </span>
                          )}
                          {(habit.trackingType === "count" || habit.trackingType === "duration") && (
                            <span>
                              {cellData.currentVal}/{cellData.targetVal} {habit.unit || ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Touch Action Button (>= 44px) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSkipHabit && !selectedDay.isFuture && (
                        <button
                          type="button"
                          onClick={() => onSkipHabit(habit.id, selectedDay.dateStr)}
                          className={cn(
                            "h-9 px-2.5 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer",
                            cellData.isSkipped
                              ? "bg-amber-100 dark:bg-amber-950/40 border-amber-300 text-amber-800"
                              : "bg-surface border-border text-ink-light hover:text-ink"
                          )}
                          title={isAr ? "تخطي اليوم" : "Skip today"}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{isAr ? "تخطي" : "Skip"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCellClick(habit, selectedDay)}
                        disabled={selectedDay.isFuture}
                        className={cn(
                          "h-10 min-w-[80px] px-3 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all cursor-pointer select-none active:scale-95",
                          selectedDay.isFuture
                            ? "bg-surface border border-dashed border-border text-ink-light opacity-50 cursor-not-allowed"
                            : isDone
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : cellData.isPartial
                            ? "bg-rose-100 dark:bg-rose-950/40 border border-rose-300 text-hotpink"
                            : "bg-hotpink text-white shadow-2xs hover:bg-hotpink/90"
                        )}
                      >
                        {isDone ? (
                          <>
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>{isAr ? "مكتمل" : "Done"}</span>
                          </>
                        ) : cellData.isPartial ? (
                          <span>{cellData.currentVal}/{cellData.targetVal}</span>
                        ) : (
                          <span>{isAr ? "إنجاز" : "Log"}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedDayHabits.length === 0 && (
                <p className="py-6 text-center text-[12.5px] text-ink-light">
                  {isAr ? "لا توجد عادات مجدولة لهذا اليوم ✨" : "No habits scheduled for this day ✨"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Optional Flexible X-Times-Per-Week Section ── */}
      {showFlexibleSection && flexibleHabits.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-card border border-purple-200/70 dark:border-purple-900/40 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-extrabold text-[12.5px]">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{isAr ? "عادات أسبوعية مرنة" : "Flexible Weekly Habits"}</span>
            </div>
            <span className="text-[11px] text-ink-light">
              {isAr ? "مرات محددة بالأسبوع" : "X times per week"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {flexibleHabits.map((h) => {
              const { completedThisWeek, targetFrequency, isMet } = getFlexibleHabitWeekCount(
                h,
                weekInfo.days
              );
              const todayStr = weekInfo.days.find((d) => d.isToday)?.dateStr || weekInfo.days[0].dateStr;
              const isTodayCompleted = Boolean(h.history?.[todayStr]?.completed) || (h.days?.[6] ?? false);

              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-purple-50/30 dark:bg-purple-950/15 border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 transition-all"
                >
                  <div
                    onClick={() => onOpenHabitDetail(h)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    <span className="text-lg shrink-0">{h.emoji || "🌿"}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-ink truncate">{h.name}</p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                        <span>
                          {completedThisWeek}/{targetFrequency} {isAr ? "هذا الأسبوع" : "this week"}
                        </span>
                        {isMet && <span>✓ {isAr ? "مكتملة!" : "Met!"}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Quick Log Button for Today */}
                  <button
                    type="button"
                    onClick={() => onToggleHabit(h.id, todayStr)}
                    className={cn(
                      "h-8 px-3 rounded-xl flex items-center gap-1 text-[11.5px] font-bold transition-all cursor-pointer active:scale-95 shrink-0",
                      isTodayCompleted
                        ? "bg-emerald-500 text-white shadow-2xs"
                        : "bg-white dark:bg-surface border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50"
                    )}
                  >
                    {isTodayCompleted ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{isAr ? "اليوم ✓" : "Today ✓"}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isAr ? "تسجيل اليوم" : "Log Today"}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quantitative Habit Entry Modal ── */}
      {quantModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/60 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl">{quantModal.habit.emoji || "🌸"}</span>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-black text-ink truncate">
                    {quantModal.habit.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-hotpink">
                    {quantModal.day.dateStr} {quantModal.day.isToday && (isAr ? "(اليوم)" : "(Today)")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuantModal(null)}
                className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-ink-light hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper Input */}
            <div className="py-2 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuantModal({
                      ...quantModal,
                      value: Math.max(0, quantModal.value - 1),
                    })
                  }
                  className="h-10 w-10 rounded-2xl bg-surface border border-pink-200 dark:border-pink-900 flex items-center justify-center text-ink font-bold hover:bg-pink-50 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="text-center min-w-[100px]">
                  <input
                    type="number"
                    min={0}
                    value={quantModal.value}
                    onChange={(e) =>
                      setQuantModal({
                        ...quantModal,
                        value: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-24 text-center text-3xl font-black text-ink bg-transparent border-b-2 border-hotpink focus:outline-none"
                  />
                  <span className="block text-[12px] font-bold text-ink-light mt-1">
                    {quantModal.habit.unit || (isAr ? "مرة" : "count")} (
                    {isAr ? "الهدف" : "Target"}: {quantModal.habit.targetValue || 1})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setQuantModal({
                      ...quantModal,
                      value: quantModal.value + 1,
                    })
                  }
                  className="h-10 w-10 rounded-2xl bg-surface border border-pink-200 dark:border-pink-900 flex items-center justify-center text-ink font-bold hover:bg-pink-50 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Target Chips */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuantModal({
                      ...quantModal,
                      value: quantModal.habit.targetValue || 1,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-pink-100/80 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 text-hotpink text-[11.5px] font-bold cursor-pointer hover:bg-pink-200/80"
                >
                  {isAr ? "الهدف الكامل ✓" : "Full Target ✓"}
                </button>

                <button
                  type="button"
                  onClick={() => setQuantModal({ ...quantModal, value: 0 })}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border text-ink-light text-[11.5px] font-semibold cursor-pointer hover:text-ink"
                >
                  <RotateCcw className="h-3 w-3 inline me-1" />
                  {isAr ? "مسح (0)" : "Clear"}
                </button>

                {onSkipHabit && (
                  <button
                    type="button"
                    onClick={handleSkipQuantitative}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 text-[11.5px] font-semibold cursor-pointer hover:bg-amber-100"
                  >
                    <Ban className="h-3 w-3 inline me-1" />
                    {isAr ? "تخطي" : "Skip"}
                  </button>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/80">
              <button
                type="button"
                onClick={() => setQuantModal(null)}
                className="flex-1 h-10 rounded-2xl border border-border text-[12px] font-bold text-ink hover:bg-surface cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuantitative(quantModal.value)}
                className="flex-1 h-10 rounded-2xl bg-hotpink text-white text-[12px] font-bold shadow-xs hover:bg-hotpink/90 active:scale-95 cursor-pointer"
              >
                {isAr ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
