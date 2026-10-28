import React, { memo } from "react";
import { Star, X, ArrowRight } from "lucide-react";
import { type Task } from "@/lib/store";

export interface TopThreeConflictModalProps {
  conflictTask: Task | null;
  activeTop3Tasks: Task[];
  replaceTargetId: string | null;
  setReplaceTargetId: (id: string) => void;
  isAr: boolean;
  onConfirmReplace: (targetId: string) => void;
  onCancel: () => void;
}

export const TopThreeConflictModal = memo(function TopThreeConflictModal({
  conflictTask,
  activeTop3Tasks,
  replaceTargetId,
  setReplaceTargetId,
  isAr,
  onConfirmReplace,
  onCancel,
}: TopThreeConflictModalProps) {
  if (!conflictTask) return null;

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
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <h3 className="text-base font-extrabold text-ink">
              {isAr ? "اكتملت أهداف اليوم الثلاثية (3/3)" : "Top 3 Limit Reached (3/3)"}
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

        <p className="text-xs font-semibold text-ink-light leading-relaxed">
          {isAr
            ? `تريدين إضافة "${conflictTask.title}" إلى أولوياتك اليوم؟ اختاري مهمة لاستبدالها:`
            : `To add "${conflictTask.title}", choose which top-3 priority to replace:`}
        </p>

        <div className="space-y-2">
          {activeTop3Tasks.map((t) => (
            <label
              key={t.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface hover:border-hotpink/50 cursor-pointer"
            >
              <span className="text-xs font-bold text-ink truncate flex-1">{t.title}</span>
              <input
                type="radio"
                name="replace-top3"
                checked={replaceTargetId === t.id}
                onChange={() => setReplaceTargetId(t.id)}
                className="h-4 w-4 accent-hotpink cursor-pointer ml-2 rtl:mr-2"
              />
            </label>
          ))}
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
            disabled={!replaceTargetId}
            onClick={() => replaceTargetId && onConfirmReplace(replaceTargetId)}
            className="flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{isAr ? "استبدال الأولوية" : "Replace"}</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
});
