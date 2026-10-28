import React, { useState } from "react";
import {
  type WeekInBloomBlock,
  extractResetSourceItems,
  extractTaskAccomplishments,
  extractFocusStudyMetrics,
} from "@/lib/weekInBloomEngine";
import { type WeekInfo } from "@/lib/weeklyHabitEngine";
import { X, Sparkles, Check, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { useApp } from "@/lib/store";

interface ChooseFromWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekInfo: WeekInfo;
  isAr?: boolean;
  targetBlockType?: string;
  onSelectContent: (type: string, content: any, sourceLabel?: string) => void;
}

export function ChooseFromWeekModal({
  isOpen,
  onClose,
  weekInfo,
  isAr = false,
  targetBlockType,
  onSelectContent,
}: ChooseFromWeekModalProps) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<"reset" | "tasks" | "habits" | "focus" | "journal">(() => {
    if (targetBlockType === "accomplishments") return "tasks";
    if (targetBlockType === "supported_habit") return "habits";
    if (targetBlockType === "focus_study") return "focus";
    return "reset";
  });

  if (!isOpen) return null;

  // 1. Weekly Reset Note for this week
  const weeklyReset = (state.weeklyNotes || {})[weekInfo.weekStartDate] || (state as any).weeklyResets?.find?.(
    (r: any) => r.weekStartDate === weekInfo.weekStartDate
  );
  const resetItems = extractResetSourceItems(weeklyReset);

  // 2. Tasks completed in week
  const completedTasks = extractTaskAccomplishments(
    state.tasks,
    weekInfo.weekStartDate,
    weekInfo.weekEndDate
  );

  // 3. Habits active
  const activeHabits = (state.habits || []).filter((h) => !h.archived);

  // 4. Focus & Study
  const focusMetrics = extractFocusStudyMetrics(
    state.focusSessions,
    (state as any).studySessions,
    weekInfo.weekStartDate,
    weekInfo.weekEndDate,
    weekInfo.isCurrentWeek
  );

  // 5. Gratitude entries in Journal
  const weekJournalGratitude = (state.journal || []).filter((j) => {
    return (
      j.date >= weekInfo.weekStartDate &&
      j.date <= weekInfo.weekEndDate &&
      (j.template === "gratitude" ||
        j.tags?.includes("BarakahJar") ||
        j.tags?.includes("Gratitude"))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden animate-rise">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-surface/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌷</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "اختاري من هذا الأسبوع" : "Choose From This Week"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {weekInfo.formattedRange}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60 overflow-x-auto no-scrollbar bg-surface/30">
          <TabButton
            active={activeTab === "reset"}
            onClick={() => setActiveTab("reset")}
            label={isAr ? "مراجعة الأسبوع" : "Weekly Reset"}
            emoji="🌸"
          />
          <TabButton
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
            label={isAr ? "المهام المنجزة" : "Tasks Done"}
            emoji="✅"
          />
          <TabButton
            active={activeTab === "habits"}
            onClick={() => setActiveTab("habits")}
            label={isAr ? "العادات" : "Habits"}
            emoji="🌱"
          />
          <TabButton
            active={activeTab === "focus"}
            onClick={() => setActiveTab("focus")}
            label={isAr ? "التركيز والدراسة" : "Focus & Study"}
            emoji="⏱️"
          />
          <TabButton
            active={activeTab === "journal"}
            onClick={() => setActiveTab("journal")}
            label={isAr ? "الامتنان" : "Gratitude"}
            emoji="🤍"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Tab 1: Weekly Reset */}
          {activeTab === "reset" && (
            <div className="space-y-3">
              {resetItems.accomplishments.length > 0 && (
                <div className="p-3.5 rounded-2xl border border-pink-200/60 bg-pink-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-ink">
                      {isAr ? "إنجازات مسجلة في مراجعة الأسبوع" : "Reset Accomplishments"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectContent(
                          "accomplishments",
                          resetItems.accomplishments,
                          isAr ? "من مراجعة الأسبوع" : "From Weekly Reset"
                        );
                        onClose();
                      }}
                      className="cursor-pointer text-xs font-bold text-hotpink hover:underline"
                    >
                      {isAr ? "إدراج الكل ↵" : "Insert All ↵"}
                    </button>
                  </div>
                  <ul className="space-y-1 text-ink-light">
                    {resetItems.accomplishments.map((acc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span>•</span>
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resetItems.gratitude && (
                <ImportRow
                  title={isAr ? "امتنان الأسبوع" : "Weekly Gratitude"}
                  body={resetItems.gratitude}
                  isAr={isAr}
                  onInsert={() => {
                    onSelectContent("gratitude", resetItems.gratitude, "Weekly Reset");
                    onClose();
                  }}
                />
              )}

              {resetItems.lesson && (
                <ImportRow
                  title={isAr ? "درس الأسبوع أو ما ترغبين بتعديله" : "Lesson / Adjust"}
                  body={resetItems.lesson}
                  isAr={isAr}
                  onInsert={() => {
                    onSelectContent("lesson", resetItems.lesson, "Weekly Reset");
                    onClose();
                  }}
                />
              )}

              {resetItems.nextWeekIntention && (
                <ImportRow
                  title={isAr ? "نية الأسبوع القادم" : "Next Week Intention"}
                  body={resetItems.nextWeekIntention}
                  isAr={isAr}
                  onInsert={() => {
                    onSelectContent("next_intention", resetItems.nextWeekIntention, "Weekly Reset");
                    onClose();
                  }}
                />
              )}

              {resetItems.accomplishments.length === 0 &&
                !resetItems.gratitude &&
                !resetItems.lesson &&
                !resetItems.nextWeekIntention && (
                  <div className="p-6 text-center text-ink-light space-y-1">
                    <p className="font-bold">
                      {isAr
                        ? "لم يتم العثور على مراجعة أسبوعية مسجلة لهذا الأسبوع بعد 🌸"
                        : "No Weekly Reset record found for this week yet 🌸"}
                    </p>
                    <p className="text-[11px]">
                      {isAr
                        ? "يمكنكِ كتابة ما تشائين مباشرة في البطاقة أو الاختيار من المهام والعادات."
                        : "You can write your highlights directly or pick from completed tasks and habits."}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Tab 2: Completed Tasks */}
          {activeTab === "tasks" && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr
                  ? `أُنجزت ${completedTasks.length} مهام خلال هذا الأسبوع:`
                  : `${completedTasks.length} tasks completed during this week:`}
              </p>

              {completedTasks.length > 0 ? (
                <div className="space-y-2">
                  {completedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl border border-border/80 bg-surface/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="font-bold text-ink truncate">{t.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectContent("accomplishments", [t.title], "Completed Task");
                          onClose();
                        }}
                        className="cursor-pointer shrink-0 px-2.5 py-1 rounded-full bg-hotpink/10 text-hotpink text-[11px] font-black hover:bg-hotpink/20 transition-all"
                      >
                        {isAr ? "إضافة" : "Add"}
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      onSelectContent(
                        "accomplishments",
                        completedTasks.map((t) => t.title),
                        "Completed Tasks"
                      );
                      onClose();
                    }}
                    className="cursor-pointer w-full mt-3 py-2.5 rounded-full border border-hotpink/30 text-hotpink bg-hotpink/5 text-xs font-black text-center hover:bg-hotpink/10 transition-all"
                  >
                    {isAr ? "إضافة جميع المهام المنجزة كإنجازات" : "Add All Completed Tasks as Accomplishments"}
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-ink-light">
                  <p className="font-bold">
                    {isAr
                      ? "لا توجد مهام منجزة مسجلة في هذا الأسبوع."
                      : "No completed tasks recorded in this week."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Habits */}
          {activeTab === "habits" && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr
                  ? "اختاري عادة من عاداتكِ التي دعمتكِ هذا الأسبوع:"
                  : "Select a habit that supported you this week:"}
              </p>
              {activeHabits.length > 0 ? (
                activeHabits.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl border border-border/80 bg-surface/50 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-ink block">
                        {h.title}
                      </span>
                      <span className="text-[10.5px] text-ink-light">
                        {h.streak ? `${h.streak} ${isAr ? "أيام متتالية" : "day streak"}` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectContent(
                          "supported_habit",
                          { title: h.title, note: h.streak ? `${h.streak} days consistency` : undefined },
                          "Habit"
                        );
                        onClose();
                      }}
                      className="cursor-pointer shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black hover:bg-emerald-500/20"
                    >
                      {isAr ? "اختيار" : "Select"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-ink-light">
                  <p className="font-bold">
                    {isAr ? "لا توجد عادات مسجلة حالياً." : "No active habits recorded."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Focus & Study */}
          {activeTab === "focus" && (
            <div className="space-y-3">
              {focusMetrics ? (
                <div className="p-4 rounded-2xl border border-border/80 bg-surface/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink-light block">
                        {focusMetrics.label} {focusMetrics.isSoFar && `(${isAr ? "حتى اليوم" : "so far"})`}
                      </span>
                      <p className="text-base font-black text-ink">
                        {Math.round(focusMetrics.minutes)} {isAr ? "دقيقة" : "minutes"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectContent("focus_study", focusMetrics, "Focus Sessions");
                      onClose();
                    }}
                    className="cursor-pointer px-3.5 py-1.5 rounded-full grad-theme text-white text-xs font-extrabold shadow-rose-xs"
                  >
                    {isAr ? "إدراج" : "Insert"}
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-ink-light">
                  <p className="font-bold">
                    {isAr
                      ? "لا توجد جلسات تركيز أو دراسة مسجلة لهذا الأسبوع."
                      : "No focus or study sessions recorded for this week."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Journal & Barakah */}
          {activeTab === "journal" && (
            <div className="space-y-2.5">
              {weekJournalGratitude.length > 0 ? (
                weekJournalGratitude.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl border border-pink-200/70 bg-pink-50/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-ink">
                        {entry.title || (isAr ? "نعمة مسجلة" : "Blessing note")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectContent("gratitude", entry.body, "Journal Gratitude");
                          onClose();
                        }}
                        className="cursor-pointer text-[11px] font-black text-hotpink hover:underline"
                      >
                        {isAr ? "إدراج في الامتنان ↵" : "Insert into Gratitude ↵"}
                      </button>
                    </div>
                    <p className="text-xs text-ink-light line-clamp-3 leading-relaxed">
                      {entry.body}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-ink-light">
                  <p className="font-bold">
                    {isAr
                      ? "لا توجد تدوينات امتنان مسجلة خلال هذا الأسبوع."
                      : "No gratitude journal entries recorded in this week."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
        active
          ? "bg-hotpink text-white shadow-rose-xs"
          : "text-ink-light hover:text-ink bg-surface"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function ImportRow({
  title,
  body,
  isAr,
  onInsert,
}: {
  title: string;
  body: string;
  isAr: boolean;
  onInsert: () => void;
}) {
  return (
    <div className="p-3 rounded-2xl border border-border/80 bg-surface/40 space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-ink">{title}</span>
        <button
          type="button"
          onClick={onInsert}
          className="cursor-pointer text-[11px] font-black text-hotpink hover:underline"
        >
          {isAr ? "إدراج ↵" : "Insert ↵"}
        </button>
      </div>
      <p className="text-xs text-ink-light line-clamp-2 italic">“{body}”</p>
    </div>
  );
}
