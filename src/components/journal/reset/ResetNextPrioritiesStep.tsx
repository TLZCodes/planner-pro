import React from "react";
import { Target, ListTodo, Plus, Calendar, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NextWeekPriority, PriorityType } from "@/lib/weeklyResetEngine";
import type { Goal, Task } from "@/lib/store";
import type { WeekInfo } from "@/lib/weeklyHabitEngine";

interface ResetNextPrioritiesStepProps {
  priorities: NextWeekPriority[];
  intention: string;
  activeGoals: Goal[];
  openTasks: Task[];
  weekInfo: WeekInfo;
  onUpdatePriority: (index: number, priority: NextWeekPriority) => void;
  onUpdateIntention: (val: string) => void;
  isAr: boolean;
  onContinue: () => void;
}

export const ResetNextPrioritiesStep: React.FC<ResetNextPrioritiesStepProps> = ({
  priorities,
  intention,
  activeGoals,
  openTasks,
  weekInfo,
  onUpdatePriority,
  onUpdateIntention,
  isAr,
  onContinue,
}) => {
  // Compute default proposed due date: first day of next week
  const computeNextWeekStartDate = (): string => {
    const d = new Date(weekInfo.weekEndDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  const defaultDueDate = computeNextWeekStartDate();

  // Ensure 3 priorities array
  const safePriorities = [
    priorities[0] || { id: "p1", title: "", type: "note" as const },
    priorities[1] || { id: "p2", title: "", type: "note" as const },
    priorities[2] || { id: "p3", title: "", type: "note" as const },
  ];

  const handleTypeChange = (index: number, newType: PriorityType) => {
    const curr = safePriorities[index];
    onUpdatePriority(index, {
      ...curr,
      type: newType,
      proposedDueDate: newType === "proposed_task" ? curr.proposedDueDate || defaultDueDate : undefined,
    });
  };

  const handleTitleChange = (index: number, val: string) => {
    onUpdatePriority(index, {
      ...safePriorities[index],
      title: val,
    });
  };

  const handleGoalSelect = (index: number, goalId: string) => {
    const g = activeGoals.find((item) => item.id === goalId);
    onUpdatePriority(index, {
      ...safePriorities[index],
      linkedGoalId: goalId,
      title: safePriorities[index].title || (g ? g.title : ""),
    });
  };

  const handleTaskSelect = (index: number, taskId: string) => {
    const t = openTasks.find((item) => item.id === taskId);
    onUpdatePriority(index, {
      ...safePriorities[index],
      linkedTaskId: taskId,
      title: safePriorities[index].title || (t ? t.title : ""),
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Intro */}
      <div className="rounded-3xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 p-4">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <span>🎯</span>
          <span>{isAr ? "أولويات الأسبوع القادم الثلاث" : "Top 3 Priorities for Next Week"}</span>
        </h3>
        <p className="text-xs font-medium text-ink-light mt-1">
          {isAr
            ? "اختاري حتى ثلاث أولويات فقط تمنحكِ الوضوح والتركيز. يمكن أن تكون خاطرة، هدفًا، أو مهمة جديدة تنشأ في جدولكِ."
            : "Focus gently on up to three priorities. A comforting note, an existing goal, or a scheduled action."}
        </p>
      </div>

      {/* Overarching Intention Card */}
      <div className="rounded-2xl bg-card border border-pink-200/60 dark:border-pink-900/40 p-3.5 space-y-1.5 shadow-2xs">
        <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
          <Sparkles size={13} className="text-hotpink" />
          <span>{isAr ? "نية أو عنوان الأسبوع القادم ✨" : "Next Week's Overarching Intention ✨"}</span>
        </span>
        <input
          type="text"
          value={intention}
          onChange={(e) => onUpdateIntention(e.target.value)}
          placeholder={
            isAr
              ? "مثال: أسبوع الهدوء والتنفس، أو إنجاز بحث التخرج براحة..."
              : "e.g., A week of gentle pacing, deep focus, or nourishing rest..."
          }
          dir="auto"
          className="w-full px-3 py-2 rounded-xl bg-surface border border-border/80 text-xs font-bold text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink"
        />
      </div>

      {/* 3 Priority Cards */}
      <div className="space-y-3">
        {safePriorities.map((p, idx) => {
          return (
            <div
              key={p.id || idx}
              className="rounded-2xl bg-card border border-pink-200/60 dark:border-pink-900/40 p-4 space-y-3 shadow-2xs"
            >
              {/* Header and Type Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-hotpink flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hotpink text-white text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{isAr ? `الأولوية ${idx + 1}` : `Priority ${idx + 1}`}</span>
                </span>

                {/* Priority Type selector pills */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/70 text-[10.5px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(idx, "note")}
                    className={cn(
                      "cursor-pointer px-2 py-0.5 rounded-lg transition-all",
                      p.type === "note"
                        ? "bg-hotpink text-white shadow-2xs"
                        : "text-ink-light hover:text-ink"
                    )}
                  >
                    {isAr ? "خاطرة / نية" : "Note"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange(idx, "linked_goal")}
                    className={cn(
                      "cursor-pointer px-2 py-0.5 rounded-lg transition-all",
                      p.type === "linked_goal"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "text-ink-light hover:text-ink"
                    )}
                  >
                    {isAr ? "ربط بهدف" : "Goal"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange(idx, "proposed_task")}
                    className={cn(
                      "cursor-pointer px-2 py-0.5 rounded-lg transition-all",
                      p.type === "proposed_task"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-ink-light hover:text-ink"
                    )}
                  >
                    {isAr ? "مهمة جديدة" : "New Task"}
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={p.title}
                onChange={(e) => handleTitleChange(idx, e.target.value)}
                placeholder={
                  isAr
                    ? `ما الذي ترغبين في وضعه كأولوية ${idx + 1}؟`
                    : `What is your priority #${idx + 1}?`
                }
                dir="auto"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border/80 text-xs sm:text-sm font-bold text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink"
              />

              {/* Conditional Options: Linked Goal Selector */}
              {p.type === "linked_goal" && activeGoals.length > 0 && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-ink-light flex items-center gap-1">
                    <Target size={12} className="text-purple-600" />
                    <span>{isAr ? "اختاري هدفاً مرتبطاً:" : "Select linked goal:"}</span>
                  </span>
                  <select
                    value={p.linkedGoalId || ""}
                    onChange={(e) => handleGoalSelect(idx, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-purple-300/60 text-xs font-bold text-ink outline-none"
                  >
                    <option value="">{isAr ? "— اختاري هدفاً —" : "— Select goal —"}</option>
                    {activeGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Options: Proposed New Task Config */}
              {p.type === "proposed_task" && (
                <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-light">
                    <Calendar size={13} className="text-blue-500" />
                    <span>{isAr ? "تاريخ التنفيذ:" : "Due Date:"}</span>
                    <input
                      type="date"
                      value={p.proposedDueDate || defaultDueDate}
                      onChange={(e) =>
                        onUpdatePriority(idx, {
                          ...p,
                          proposedDueDate: e.target.value,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-surface border border-border/80 text-xs font-bold text-ink outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-light">
                    <Clock size={13} className="text-blue-500" />
                    <span>{isAr ? "الوقت (اختياري):" : "Time:"}</span>
                    <input
                      type="time"
                      value={p.proposedDueTime || ""}
                      onChange={(e) =>
                        onUpdatePriority(idx, {
                          ...p,
                          proposedDueTime: e.target.value,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-surface border border-border/80 text-xs font-bold text-ink outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "معاينة واعتماد الإجراءات ✨" : "Review & Apply ✨"}</span>
        </button>
      </div>
    </div>
  );
};
