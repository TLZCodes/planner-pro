import {
  type ApplyWeekActionPlan,
} from "@/lib/idealWeekEngine";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Plus } from "lucide-react";

interface ApplyWeekPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionPlan: ApplyWeekActionPlan;
  onConfirmApply: () => void;
  isAr: boolean;
}

export function ApplyWeekPreviewModal({
  isOpen,
  onClose,
  actionPlan,
  onConfirmApply,
  isAr,
}: ApplyWeekPreviewModalProps) {
  if (!isOpen) return null;

  const totalCreates = actionPlan.tasksToCreate.length;
  const totalRoutines = actionPlan.routinesToSchedule.length;
  const totalNotes = actionPlan.planningNotesOnly.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/70 bg-surface/50">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
              {isAr ? "معاينة قبل التطبيق الفعلي" : "Plan Application Preview"}
            </span>
            <h3 className="text-base font-black text-ink">
              {isAr ? "تأكيد تطبيق الأسبوع المثالي ✨" : "Apply Ideal Week Plan ✨"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface text-ink-light hover:text-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Explanatory banner */}
          <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-pink-700 dark:text-pink-300">
              <ShieldCheck className="h-4 w-4 text-hotpink shrink-0" />
              <span>
                {isAr
                  ? "لن يتم إنشاء أو تعديل أي مهمة دون تأكيدكِ الصريح هنا"
                  : "No tasks are created or modified until you explicitly confirm here."}
              </span>
            </div>
            <p className="text-[11px] text-ink-light leading-relaxed">
              {isAr
                ? `الفترة المحددة: من ${actionPlan.weekStartDate} إلى ${actionPlan.weekEndDate}. تعديل القالب لاحقاً لن يمس المهام المنشأة.`
                : `Week range: ${actionPlan.weekStartDate} to ${actionPlan.weekEndDate}. Later template edits will never overwrite created tasks.`}
            </p>
          </div>

          {/* Already applied warning if relevant */}
          {actionPlan.alreadyAppliedWarning && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11.5px] text-ink leading-tight">
                <span className="font-black block text-amber-800 dark:text-amber-200">
                  {isAr ? "تم تطبيق هذا الأسبوع سابقاً" : "This week was previously applied"}
                </span>
                <span className="text-ink-light">
                  {isAr
                    ? "نظام الحماية يتفادى تكرار المهام المتطابقة ويضيف فقط العناصر الجديدة."
                    : "Duplicate prevention will skip existing tasks and only create new proposals."}
                </span>
              </div>
            </div>
          )}

          {/* Summary metrics pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-surface border border-border/70 text-center">
              <span className="text-lg font-black text-hotpink block">{totalCreates}</span>
              <span className="text-[10.5px] font-bold text-ink-light">
                {isAr ? "مهام ستُنشأ" : "Tasks to create"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-border/70 text-center">
              <span className="text-lg font-black text-purple-600 block">{totalRoutines}</span>
              <span className="text-[10.5px] font-bold text-ink-light">
                {isAr ? "روتينات مجدولة" : "Routines"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface border border-border/70 text-center">
              <span className="text-lg font-black text-emerald-600 block">{totalNotes}</span>
              <span className="text-[10.5px] font-bold text-ink-light">
                {isAr ? "نوايا وتوجيهات" : "Notes (0 tasks)"}
              </span>
            </div>
          </div>

          {/* Detailed items to create */}
          {totalCreates > 0 ? (
            <div className="space-y-1.5">
              <span className="text-xs font-black text-ink block">
                {isAr ? "المهام التي ستُضاف لدفتر المهام:" : "Tasks to be added to Tasks:"}
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {actionPlan.tasksToCreate.map((tc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-hotpink font-bold">✓</span>
                      <span className="font-bold text-ink">{tc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] font-mono text-ink-light">
                      <span>{tc.dueDate}</span>
                      {tc.optionalTime && <span>{tc.optionalTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface border border-border/60 text-center text-xs text-ink-light">
              {isAr ? "لا توجد مهام جديدة بحاجة للإنشاء لهذا الأسبوع." : "No new tasks need to be created for this week."}
            </div>
          )}

          {/* Planning notes reassuring label */}
          {totalNotes > 0 && (
            <div className="p-2.5 rounded-xl bg-surface/50 border border-border/50 text-[11px] text-ink-light">
              <span className="font-bold text-ink">
                {isAr ? "ملاحظات التخطيط الهادئة: " : "Planning Notes: "}
              </span>
              {isAr
                ? `لديكِ ${totalNotes} ملاحظات/نوايا ستظل محفوظة في هذا الأسبوع دون أن تتحول لمهام واجبة الإنجاز.`
                : `You have ${totalNotes} intentions/notes that remain planning-only and will never become overdue tasks.`}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border/70 bg-surface/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold text-ink-light hover:bg-surface"
          >
            {isAr ? "إلغاء والعودة" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmApply();
              onClose();
            }}
            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-md active:scale-95 transition-transform"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAr ? "تأكيد واعتماد الخطة للأسبوع ✓" : "Confirm & Apply Week Plan ✓"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
