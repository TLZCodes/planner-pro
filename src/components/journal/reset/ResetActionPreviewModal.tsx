import React from "react";
import { X, Sparkles, Check, AlertTriangle, ArrowRight, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskMutationPlan, NextWeekPriority } from "@/lib/weeklyResetEngine";

interface ResetActionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskActionPlans: Record<string, TaskMutationPlan>;
  priorities: NextWeekPriority[];
  isAr: boolean;
  onConfirmApply: () => void;
  isApplying?: boolean;
  errorMessage?: string;
}

export const ResetActionPreviewModal: React.FC<ResetActionPreviewModalProps> = ({
  isOpen,
  onClose,
  taskActionPlans,
  priorities,
  isAr,
  onConfirmApply,
  isApplying = false,
  errorMessage,
}) => {
  if (!isOpen) return null;

  // Filter plans that actually mutate tasks
  const reschedulePlans = Object.values(taskActionPlans).filter(
    (p) => p.action === "reschedule"
  );
  const deletePlans = Object.values(taskActionPlans).filter(
    (p) => p.action === "delete"
  );
  const newTasksToCreate = priorities.filter(
    (p) => p.type === "proposed_task" && p.title.trim() && !p.isApplied
  );

  const totalMutations =
    reschedulePlans.length + deletePlans.length + newTasksToCreate.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950/40 dark:via-rose-950/20 dark:to-purple-950/40 p-5 border-b border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-base font-black text-ink">
                {isAr ? "معاينة واعتماد إجراءات المهام" : "Review & Apply Task Actions"}
              </h3>
              <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                {isAr
                  ? "تأكيد صريح قبل تطبيق أي تغيير على جدول مهامكِ"
                  : "Explicit confirmation before updating tasks"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {totalMutations === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm font-extrabold text-ink">
                {isAr
                  ? "لا توجد تعديلات مجدولة على المهام 🌸"
                  : "No task modifications requested 🌸"}
              </p>
              <p className="text-xs text-ink-light font-medium">
                {isAr
                  ? "سيتم حفظ تأملاتكِ وأولوياتكِ في دفتر اليوميات وسجل المراجعة مباشرة دون المساس بالمهام الحالية."
                  : "Your reflections and priorities will be honored in Journal and Reset records without altering tasks."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Reschedule list */}
              {reschedulePlans.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <ArrowRight size={13} />
                    <span>
                      {isAr
                        ? `مهام ستتم إعادة جدولتها (${reschedulePlans.length})`
                        : `Tasks to Reschedule (${reschedulePlans.length})`}
                    </span>
                  </span>
                  <div className="space-y-1.5">
                    {reschedulePlans.map((p) => (
                      <div
                        key={p.taskId}
                        className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-300/40 text-xs flex items-center justify-between"
                      >
                        <span className="font-extrabold text-ink truncate max-w-[220px]">
                          {p.taskTitle}
                        </span>
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                          {p.newDueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deletion list */}
              {deletePlans.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-rose-600 flex items-center gap-1.5">
                    <Trash2 size={13} />
                    <span>
                      {isAr
                        ? `مهام سيتم حذفها (${deletePlans.length})`
                        : `Tasks to Delete (${deletePlans.length})`}
                    </span>
                  </span>
                  <div className="space-y-1.5">
                    {deletePlans.map((p) => (
                      <div
                        key={p.taskId}
                        className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-300/40 text-xs flex items-center justify-between"
                      >
                        <span className="font-extrabold text-ink truncate max-w-[220px]">
                          {p.taskTitle}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600">
                          {isAr ? "حذف دائم" : "Delete"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New tasks to create */}
              {newTasksToCreate.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Plus size={13} />
                    <span>
                      {isAr
                        ? `مهام جديدة سيتم إنشاؤها (${newTasksToCreate.length})`
                        : `New Tasks to Create (${newTasksToCreate.length})`}
                    </span>
                  </span>
                  <div className="space-y-1.5">
                    {newTasksToCreate.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-300/40 text-xs flex items-center justify-between"
                      >
                        <span className="font-extrabold text-ink truncate max-w-[220px]">
                          {p.title}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
                          {p.proposedDueDate || "Next week"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-4 bg-surface border-t border-border/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-full border border-border text-xs font-bold text-ink-light hover:text-ink"
          >
            <span>{isAr ? "إلغاء / تعديل" : "Cancel / Adjust"}</span>
          </button>

          <button
            type="button"
            onClick={onConfirmApply}
            disabled={isApplying}
            className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check size={14} className="stroke-[3]" />
            <span>
              {isApplying
                ? isAr
                  ? "جارٍ التطبيق..."
                  : "Applying..."
                : totalMutations > 0
                ? isAr
                  ? "تأكيد وتطبيق التغييرات ✨"
                  : "Confirm & Apply Changes ✨"
                : isAr
                ? "إتمام المراجعة وحفظها ✨"
                : "Finish & Save Reset ✨"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
