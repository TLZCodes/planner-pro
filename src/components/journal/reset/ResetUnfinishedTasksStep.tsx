import React from "react";
import {
  Calendar,
  Clock,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store";
import type {
  TaskMutationPlan,
  UnfinishedTaskAction,
} from "@/lib/weeklyResetEngine";
import type { WeekInfo } from "@/lib/weeklyHabitEngine";

interface ResetUnfinishedTasksStepProps {
  unfinishedTasks: Task[];
  taskActionPlans: Record<string, TaskMutationPlan>;
  weekInfo: WeekInfo;
  onSetActionPlan: (plan: TaskMutationPlan) => void;
  isAr: boolean;
  onContinue: () => void;
}

export const ResetUnfinishedTasksStep: React.FC<ResetUnfinishedTasksStepProps> = ({
  unfinishedTasks,
  taskActionPlans,
  weekInfo,
  onSetActionPlan,
  isAr,
  onContinue,
}) => {
  // Helper to compute next week's start date
  const computeNextWeekStartDate = (): string => {
    const d = new Date(weekInfo.weekEndDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const nextWeekStart = computeNextWeekStartDate();

  const handleActionChange = (
    task: Task,
    action: UnfinishedTaskAction,
    newDate?: string
  ) => {
    const origDate = task.dueDate || (task.due ? task.due.slice(0, 10) : undefined);
    onSetActionPlan({
      taskId: task.id,
      taskTitle: task.title,
      action,
      originalDueDate: origDate,
      newDueDate:
        action === "reschedule"
          ? newDate || nextWeekStart
          : action === "keep"
          ? origDate
          : undefined,
      category: task.category,
      linkedGoalId: task.goalId,
    });
  };

  const handleDateChange = (task: Task, dateVal: string) => {
    const existing = taskActionPlans[task.id];
    onSetActionPlan({
      taskId: task.id,
      taskTitle: task.title,
      action: "reschedule",
      originalDueDate: task.dueDate || (task.due ? task.due.slice(0, 10) : undefined),
      newDueDate: dateVal,
      newDueTime: existing?.newDueTime,
      category: task.category,
      linkedGoalId: task.goalId,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Intro */}
      <div className="rounded-3xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 p-4">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <span>🌿</span>
          <span>{isAr ? "مراجعة المهام المتبقية" : "Review Unfinished Items"}</span>
        </h3>
        <p className="text-xs font-medium text-ink-light mt-1">
          {isAr
            ? "المهام التي لم تُنجز ليست فشلاً، بل فرصة لإعادة الترتيب برفق: إبقاء كما هي، جدولتها لتاريخ مناسب، أو حذفها بسلام."
            : "Unfinished tasks are not setbacks. Re-align with ease: keep as-is, reschedule smoothly, or release them."}
        </p>
      </div>

      {unfinishedTasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-surface/50 p-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="text-sm font-extrabold text-ink">
            {isAr
              ? "لا توجد مهام مفتوحة مجدولة في هذا الأسبوع ✨"
              : "No unfinished tasks scheduled for this week ✨"}
          </h4>
          <p className="text-xs font-medium text-ink-light max-w-sm mx-auto">
            {isAr
              ? "جدولكِ كان منسقًا ومنتهيًا، أو أنكِ أغلقتِ كافة مهامكِ برقة ونجاح."
              : "All scheduled tasks for this period have been attended to or wrapped up."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-ink-light">
            <span>{isAr ? "المهام المجدولة المفتوحة" : "Scheduled Open Tasks"}</span>
            <span>{unfinishedTasks.length}</span>
          </div>

          <div className="space-y-2.5">
            {unfinishedTasks.map((task) => {
              const currentPlan = taskActionPlans[task.id];
              const activeAction: UnfinishedTaskAction = currentPlan?.action || "keep";
              const targetDate = currentPlan?.newDueDate || nextWeekStart;

              return (
                <div
                  key={task.id}
                  className="rounded-2xl bg-card border border-pink-200/60 dark:border-pink-900/40 p-3.5 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-ink leading-snug truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10.5px] font-semibold text-ink-light">
                        {task.category && (
                          <span className="px-1.5 py-0.5 rounded-md bg-surface border border-border/60">
                            {task.category}
                          </span>
                        )}
                        <span>
                          {isAr ? "تاريخ الاستحقاق:" : "Due:"}{" "}
                          {task.dueDate || (task.due ? task.due.slice(0, 10) : "—")}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold border",
                        activeAction === "keep"
                          ? "bg-ink/5 text-ink-light border-border/60"
                          : activeAction === "reschedule"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/40"
                          : "bg-rose-500/10 text-rose-600 border-rose-300/40"
                      )}
                    >
                      {activeAction === "keep"
                        ? isAr
                          ? "إبقاء كما هي"
                          : "Keep as-is"
                        : activeAction === "reschedule"
                        ? isAr
                          ? "إعادة جدولة"
                          : "Reschedule"
                        : isAr
                        ? "حذف / إزالة"
                        : "Delete"}
                    </span>
                  </div>

                  {/* Action Choices */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-pink-200/40 dark:border-pink-900/20">
                    <button
                      type="button"
                      onClick={() => handleActionChange(task, "keep")}
                      className={cn(
                        "cursor-pointer px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all",
                        activeAction === "keep"
                          ? "bg-hotpink text-white shadow-2xs"
                          : "bg-surface text-ink-light border border-border/60 hover:text-ink"
                      )}
                    >
                      <span>{isAr ? "إبقاء كالمعتاد" : "Keep as-is"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleActionChange(task, "reschedule", nextWeekStart)}
                      className={cn(
                        "cursor-pointer px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1",
                        activeAction === "reschedule"
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "bg-surface text-ink-light border border-border/60 hover:text-ink"
                      )}
                    >
                      <ArrowRight size={11} />
                      <span>{isAr ? "للأسبوع القادم" : "Next Week"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleActionChange(task, "delete")}
                      className={cn(
                        "cursor-pointer px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1",
                        activeAction === "delete"
                          ? "bg-rose-600 text-white shadow-2xs"
                          : "bg-surface text-ink-light border border-border/60 hover:text-rose-600"
                      )}
                    >
                      <Trash2 size={11} />
                      <span>{isAr ? "حذف بسلام" : "Delete"}</span>
                    </button>
                  </div>

                  {/* Reschedule Date Picker Input if reschedule selected */}
                  {activeAction === "reschedule" && (
                    <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                      <span className="text-[11px] font-bold text-ink-light shrink-0 flex items-center gap-1">
                        <Calendar size={12} className="text-purple-600" />
                        <span>{isAr ? "تاريخ جديد:" : "New Date:"}</span>
                      </span>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => handleDateChange(task, e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-surface border border-purple-300/60 text-xs font-bold text-ink outline-none"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "أولويات الأسبوع القادم 🎯" : "Next Week Priorities 🎯"}</span>
        </button>
      </div>
    </div>
  );
};
