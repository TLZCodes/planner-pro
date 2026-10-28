import React, { memo } from "react";
import { Calendar, X } from "lucide-react";
import { type Task, todayKey, getTomorrowKey } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface MoveTaskDateModalProps {
  task: Task | null;
  moveToDate: string;
  setMoveToDate: (date: string) => void;
  isAr: boolean;
  onConfirmMove: () => void;
  onCancel: () => void;
}

export const MoveTaskDateModal = memo(function MoveTaskDateModal({
  task,
  moveToDate,
  setMoveToDate,
  isAr,
  onConfirmMove,
  onCancel,
}: MoveTaskDateModalProps) {
  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-border p-5 shadow-2xl space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-teal-500" />
            <h3 className="text-base font-extrabold text-ink">
              {isAr ? "تغيير تاريخ المهمة" : "Reschedule Task"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-light"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs font-semibold text-ink-light truncate">{task.title}</p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMoveToDate(todayKey())}
            className={cn(
              "cursor-pointer flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all text-center",
              moveToDate === todayKey() ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink"
            )}
          >
            {isAr ? "اليوم" : "Today"}
          </button>
          <button
            type="button"
            onClick={() => setMoveToDate(getTomorrowKey())}
            className={cn(
              "cursor-pointer flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all text-center",
              moveToDate === getTomorrowKey() ? "grad-theme text-white border-transparent" : "bg-surface border-border text-ink"
            )}
          >
            {isAr ? "غداً" : "Tomorrow"}
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-ink-light mb-1">{isAr ? "أو اختيار تاريخ محدد:" : "Or select date:"}</label>
          <input
            type="date"
            value={moveToDate}
            onChange={(e) => setMoveToDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-ink outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface cursor-pointer"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirmMove}
            className="flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 cursor-pointer text-center"
          >
            {isAr ? "نقل التاريخ" : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
});
