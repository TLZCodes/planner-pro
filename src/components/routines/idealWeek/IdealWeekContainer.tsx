import { useState, useMemo } from "react";
import {
  type PlanningMode,
  type IdealWeekTemplate,
  type DayTypeConfig,
  type ResolvedDaySchedule,
  type IdealWeekItem,
  resolveDatedWeekSchedule,
  compileApplyWeekActionPlan,
  detectScheduleConflicts,
  STARTER_DAY_TYPES,
} from "@/lib/idealWeekEngine";
import { getWeekDaysInfo, type WeekStartDay } from "@/lib/weeklyHabitEngine";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { IdealWeekDayCard } from "./IdealWeekDayCard";
import { BetweenPrayersTimeline } from "./BetweenPrayersTimeline";
import { DayTypeSelectorModal } from "./DayTypeSelectorModal";
import { ItemEditorModal } from "./ItemEditorModal";
import { ApplyWeekPreviewModal } from "./ApplyWeekPreviewModal";
import {
  Sparkles,
  Calendar,
  Clock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Layers,
  Heart,
} from "lucide-react";

export function IdealWeekContainer() {
  const {
    state,
    saveIdealWeekTemplate,
    saveCustomDayTypes,
    applyIdealWeekPlan,
    resetIdealWeekToDefault,
  } = useApp();
  const { lang } = useLang();
  const isAr = lang === "ar";

  // Template state fallback
  const template: IdealWeekTemplate = useMemo(() => {
    return (
      state.idealWeekTemplate || {
        id: "default-ideal-week",
        name: "My Natural Rhythm",
        nameAr: "إيقاعي الطبيعي المتوازن",
        planningMode: "time_of_day",
        dayTypeAssignments: { 0: "work", 1: "work", 2: "work", 3: "study", 4: "work", 5: "weekend", 6: "rest" },
        items: [],
        enableAfterFajrSegment: true,
        afterFajrDurationMinutes: 60,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [state.idealWeekTemplate]);

  const customDayTypes: DayTypeConfig[] = state.customDayTypes || [];

  // View state: Template vs Dated Preview
  const [viewMode, setViewMode] = useState<"template" | "dated_preview">("template");
  const [weekOffset, setWeekOffset] = useState(0);

  // Week boundary calculation
  const firstDayPref = (state.habitWeekPreferences?.firstDayOfWeek || "saturday") as WeekStartDay;
  const weekInfo = useMemo(() => {
    return getWeekDaysInfo(new Date(), weekOffset, firstDayPref, isAr);
  }, [weekOffset, firstDayPref, isAr]);

  // Resolved 7-day schedule
  const resolvedDays: ResolvedDaySchedule[] = useMemo(() => {
    return resolveDatedWeekSchedule(
      weekInfo.days,
      template,
      state.deenSettings,
      customDayTypes
    );
  }, [weekInfo.days, template, state.deenSettings, customDayTypes]);

  // Selected Day drill-down index (defaults to today's weekday index in dated preview, or 0)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const activeDaySchedule = resolvedDays[selectedDayIndex] || resolvedDays[0];

  // Modals state
  const [dayTypeModalOpen, setDayTypeModalOpen] = useState(false);
  const [targetWeekdayForDayType, setTargetWeekdayForDayType] = useState<number>(0);

  const [itemEditorOpen, setItemEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IdealWeekItem | null>(null);
  const [targetWeekdayForItem, setTargetWeekdayForItem] = useState<number>(0);
  const [targetPeriodForItem, setTargetPeriodForItem] = useState<string | undefined>();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Conflict detection
  const conflicts = useMemo(() => {
    return detectScheduleConflicts(activeDaySchedule?.items || []);
  }, [activeDaySchedule]);

  // Action Plan for Preview
  const actionPlan = useMemo(() => {
    const appliedRec = state.appliedIdealWeeks?.[weekInfo.weekStartDate];
    return compileApplyWeekActionPlan(resolvedDays, state.tasks, appliedRec);
  }, [resolvedDays, state.tasks, state.appliedIdealWeeks, weekInfo.weekStartDate]);

  // Handlers
  const handleModeChange = (mode: PlanningMode) => {
    saveIdealWeekTemplate({
      ...template,
      planningMode: mode,
    });
    showToast(isAr ? "تم تحديث نمط التخطيط ✨" : "Planning mode updated ✨");
  };

  const handleDayTypeSelect = (dayTypeId: string) => {
    const nextAssignments = {
      ...template.dayTypeAssignments,
      [targetWeekdayForDayType]: dayTypeId,
    };
    saveIdealWeekTemplate({
      ...template,
      dayTypeAssignments: nextAssignments,
    });
    showToast(isAr ? "تم تخصيص نمط اليوم 🌸" : "Day type assigned 🌸");
  };

  const handleSaveItem = (item: IdealWeekItem) => {
    let nextItems = [...(template.items || [])];
    const existingIndex = nextItems.findIndex((it) => it.id === item.id);
    if (existingIndex >= 0) {
      nextItems[existingIndex] = item;
    } else {
      nextItems.push(item);
    }
    saveIdealWeekTemplate({
      ...template,
      items: nextItems,
    });
    showToast(isAr ? "تم حفظ النشاط في الإيقاع ✨" : "Rhythm activity saved ✨");
  };

  const handleDeleteItem = (itemId: string) => {
    const nextItems = (template.items || []).filter((it) => it.id !== itemId);
    saveIdealWeekTemplate({
      ...template,
      items: nextItems,
    });
    showToast(isAr ? "تم حذف النشاط" : "Activity removed");
  };

  const handleConfirmApply = () => {
    const { createdCount, scheduledCount } = applyIdealWeekPlan(actionPlan);
    showToast(
      isAr
        ? `✓ تم اعتماد وتطبيق الخطة بنجاح (${createdCount} مهام، ${scheduledCount} روتينات)!`
        : `✓ Week plan applied successfully (${createdCount} tasks, ${scheduledCount} routines)!`
    );
  };

  // Available tasks and routines for linking
  const availableRoutines = useMemo(() => {
    return Object.entries(state.routines || {}).map(([key, steps]) => ({
      key,
      title: key === "morning" ? (isAr ? "الروتين الصباحي ☀️" : "Morning Routine ☀️")
        : key === "evening" ? (isAr ? "الروتين المسائي 🌙" : "Evening Routine 🌙")
        : key === "ideal-day" ? (isAr ? "اليوم المثالي ✨" : "Ideal Day ✨")
        : key,
      stepsCount: steps.length,
    }));
  }, [state.routines, isAr]);

  const planningMode = template.planningMode;

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs text-center shadow-rose-md flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Sub-header Banner */}
      <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <h2 className="text-lg font-black text-ink">
                {isAr ? "أسبوعي المثالي" : "My Ideal Week"}
              </h2>
            </div>
            <p className="text-xs text-ink-light font-medium">
              {isAr ? "صمّمي إيقاعًا يناسب حياتكِ الحقيقية دون افتراضات مسبقة." : "Build a rhythm that fits your real life."}
            </p>
          </div>

          {/* Reset Template to Default Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(isAr ? "هل ترغبين باستعادة القالب الافتراضي للأسبوع المثالي؟" : "Reset Ideal Week to starter template?")) {
                resetIdealWeekToDefault();
                showToast(isAr ? "تم استعادة القالب الافتراضي" : "Reset to default template");
              }
            }}
            title={isAr ? "استعادة القالب الافتراضي" : "Reset template"}
            className="cursor-pointer p-2 rounded-full hover:bg-surface text-ink-light hover:text-ink transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher: Template vs Dated Week Preview */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-surface border border-border/70 text-xs font-black">
          <button
            type="button"
            onClick={() => setViewMode("template")}
            className={cn(
              "cursor-pointer py-2 rounded-xl transition-all",
              viewMode === "template"
                ? "bg-card text-hotpink shadow-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            {isAr ? "قالب الإيقاع الأسبوعي 📋" : "Ideal Week Template 📋"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("dated_preview")}
            className={cn(
              "cursor-pointer py-2 rounded-xl transition-all",
              viewMode === "dated_preview"
                ? "bg-card text-hotpink shadow-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            {isAr ? "خطة الأسبوع المحدد 📅" : "Dated Week Plan 📅"}
          </button>
        </div>
      </div>

      {/* Mode Switcher: Time of Day vs Clock vs Between the Prayers */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/80 shadow-xs gap-2">
        <span className="text-xs font-black text-ink shrink-0">
          {isAr ? "نمط التخطيط:" : "Planning Mode:"}
        </span>

        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleModeChange("time_of_day")}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              planningMode === "time_of_day"
                ? "grad-theme text-white shadow-xs"
                : "bg-surface border border-border text-ink-light hover:text-ink"
            )}
          >
            {isAr ? "فترات اليوم ☀️" : "Time of Day ☀️"}
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("clock")}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              planningMode === "clock"
                ? "grad-theme text-white shadow-xs"
                : "bg-surface border border-border text-ink-light hover:text-ink"
            )}
          >
            {isAr ? "وقت الساعة ⏱️" : "Clock Time ⏱️"}
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("between_prayers")}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              planningMode === "between_prayers"
                ? "grad-theme text-white shadow-xs"
                : "bg-surface border border-border text-ink-light hover:text-ink"
            )}
          >
            {isAr ? "بين الصلوات 🕌" : "Between Prayers 🕌"}
          </button>
        </div>
      </div>

      {/* If in Dated Preview: Week Range Navigation & Apply Action Bar */}
      {viewMode === "dated_preview" && (
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-xl bg-surface hover:bg-card border border-border text-ink cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-black text-ink block">
                {weekInfo.formattedRange}
              </span>
              <span className="text-[11px] font-bold text-hotpink">
                {weekInfo.isCurrentWeek
                  ? isAr ? "الأسبوع الحالي" : "Current Week"
                  : weekInfo.isFutureWeek
                  ? isAr ? "أسبوع قادم" : "Upcoming Week"
                  : isAr ? "أسبوع سابق" : "Past Week"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-xl bg-surface hover:bg-card border border-border text-ink cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Explicit Apply Button */}
          <button
            type="button"
            onClick={() => setApplyModalOpen(true)}
            className="cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-sm active:scale-98 transition-transform"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {isAr
                ? `معاينة واعتماد خطة هذا الأسبوع (${actionPlan.tasksToCreate.length} مهام مقترحة)`
                : `Preview & Apply to This Week (${actionPlan.tasksToCreate.length} tasks proposed)`}
            </span>
          </button>
        </div>
      )}

      {/* 7-Days Horizontal Tabs / Selector */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {resolvedDays.map((d, idx) => {
          const isSelected = selectedDayIndex === idx;
          const dayInfo = weekInfo.days[idx];

          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={cn(
                "cursor-pointer flex flex-col items-center p-2.5 rounded-2xl border transition-all shrink-0 min-w-[70px]",
                isSelected
                  ? "border-hotpink bg-pink-50/80 dark:bg-pink-950/40 shadow-xs"
                  : "border-border/70 bg-card hover:bg-surface"
              )}
            >
              <span className="text-[11px] font-bold text-ink-light">
                {dayInfo?.dayShort}
              </span>
              <span className="text-sm font-black text-ink my-0.5">
                {dayInfo?.dayNum}
              </span>
              <span className="text-base">{d.dayType.icon}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Day View Container */}
      <div className="space-y-3">
        {/* Day Card */}
        <IdealWeekDayCard
          daySchedule={activeDaySchedule}
          dayName={weekInfo.days[selectedDayIndex]?.dayName || ""}
          dayShort={weekInfo.days[selectedDayIndex]?.dayShort || ""}
          isToday={weekInfo.days[selectedDayIndex]?.isToday}
          isSelected={true}
          onClickCard={() => {}}
          onChangeDayType={() => {
            setTargetWeekdayForDayType(activeDaySchedule.weekday);
            setDayTypeModalOpen(true);
          }}
          onAddItem={() => {
            setTargetWeekdayForItem(activeDaySchedule.weekday);
            setEditingItem(null);
            setItemEditorOpen(true);
          }}
          onEditItem={(item) => {
            setTargetWeekdayForItem(activeDaySchedule.weekday);
            setEditingItem(item);
            setItemEditorOpen(true);
          }}
          isAr={isAr}
        />

        {/* Conflicts Alert if any detected */}
        {conflicts.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{isAr ? "تداخل زمني مكتشف في هذا اليوم" : "Schedule Overlap Detected"}</span>
            </div>
            {conflicts.map((c, i) => (
              <p key={i} className="text-[11px] text-ink-light leading-snug">
                {c.description}
              </p>
            ))}
          </div>
        )}

        {/* Between the Prayers Timeline (when active mode) */}
        {planningMode === "between_prayers" && (
          <div className="mt-2">
            <h4 className="text-xs font-black text-ink mb-2">
              {isAr ? "مواقيت الفترات بين الصلوات لهذا اليوم 🕌" : "Between the Prayers Rhythm for Today 🕌"}
            </h4>
            <BetweenPrayersTimeline
              periods={activeDaySchedule.prayerPeriods}
              items={activeDaySchedule.items}
              onAddItemToPeriod={(pId) => {
                setTargetWeekdayForItem(activeDaySchedule.weekday);
                setTargetPeriodForItem(pId);
                setEditingItem(null);
                setItemEditorOpen(true);
              }}
              onEditItem={(it) => {
                setTargetWeekdayForItem(activeDaySchedule.weekday);
                setEditingItem(it);
                setItemEditorOpen(true);
              }}
              isAr={isAr}
              missingPrayerTimes={!activeDaySchedule.prayerTimes}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DayTypeSelectorModal
        isOpen={dayTypeModalOpen}
        onClose={() => setDayTypeModalOpen(false)}
        selectedId={template.dayTypeAssignments[targetWeekdayForDayType] || "work"}
        onSelect={handleDayTypeSelect}
        customTypes={customDayTypes}
        onAddCustomType={(newType) => {
          saveCustomDayTypes([...customDayTypes, newType]);
        }}
        isAr={isAr}
        weekdayName={weekInfo.days[targetWeekdayForDayType]?.dayName || ""}
      />

      <ItemEditorModal
        isOpen={itemEditorOpen}
        onClose={() => setItemEditorOpen(false)}
        weekday={targetWeekdayForItem}
        weekdayName={weekInfo.days[targetWeekdayForItem]?.dayName || ""}
        item={editingItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        availableTasks={state.tasks}
        availableRoutines={availableRoutines}
        isAr={isAr}
      />

      <ApplyWeekPreviewModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        actionPlan={actionPlan}
        onConfirmApply={handleConfirmApply}
        isAr={isAr}
      />
    </div>
  );
}
