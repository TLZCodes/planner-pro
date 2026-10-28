import React, { useState, memo } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Calendar,
  Tag,
  Star,
  ListTodo,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { type Task, type Priority, type Subtask, todayKey, getTomorrowKey } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface TaskEditPageProps {
  task: Task | null;
  presetDueDate: string;
  allCategories: any[];
  isAr: boolean;
  onSave: (payload: Partial<Task>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const TaskEditPage = memo(function TaskEditPage({
  task,
  presetDueDate,
  allCategories,
  isAr,
  onSave,
  onCancel,
  onDelete,
}: TaskEditPageProps) {
  const [formTitle, setFormTitle] = useState(task?.title || "");
  const [formDueDate, setFormDueDate] = useState(task?.dueDate || presetDueDate || todayKey());
  const [formTime, setFormTime] = useState(task?.optionalTime || "");
  const [formTag, setFormTag] = useState(task?.tag || "Work");
  const [formPriority, setFormPriority] = useState<Priority>(task?.priority || "medium");
  const [formIsTopThree, setFormIsTopThree] = useState(task?.isTopThree || false);
  const [formNotes, setFormNotes] = useState(task?.notes || "");
  const [formSubtasks, setFormSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [formNewSubtask, setFormNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (!formNewSubtask.trim()) return;
    const newSt: Subtask = {
      id: Math.random().toString(36).slice(2, 9),
      title: formNewSubtask.trim(),
      done: false,
    };
    setFormSubtasks((prev) => [...prev, newSt]);
    setFormNewSubtask("");
  };

  const handleRemoveSubtask = (id: string) => {
    setFormSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setFormSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) return;

    onSave({
      title: formTitle.trim(),
      dueDate: formDueDate,
      optionalTime: formTime.trim() || undefined,
      tag: formTag,
      priority: formPriority,
      isTopThree: formIsTopThree,
      notes: formNotes.trim() || undefined,
      subtasks: formSubtasks,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink pb-36 overflow-y-auto">
      {/* Top Header with Instant Save Button */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer pointer-events-auto touch-manipulation flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface border border-border text-ink hover:bg-surface active:scale-90 transition-transform shadow-xs"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
          </button>
          <div>
            <h2 className="font-display text-[17px] font-bold text-ink leading-tight">
              {task ? (isAr ? "تعديل المهمة ✨" : "Edit Task ✨") : (isAr ? "مهمة جديدة ✨" : "New Task ✨")}
            </h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "حددي تفاصيل المهمة" : "Set task details"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 active:scale-90"
              title={isAr ? "حذف" : "Delete"}
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!formTitle.trim()}
            className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <Check size={15} className="stroke-[3]" />
            <span>{isAr ? "حفظ ✨" : "Save ✨"}</span>
          </button>
        </div>
      </header>

      {/* Main Page Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4 max-w-xl mx-auto w-full">
        {/* Title Input */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="block text-xs font-extrabold text-ink-light">
            {isAr ? "عنوان المهمة (مطلوب) *" : "Task Title (Required) *"}
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={isAr ? "اكتبي ما تودين إنجازه..." : "What needs to be done..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            dir="auto"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-bold text-ink outline-none focus:border-hotpink transition-colors"
            required
          />
        </div>

        {/* Date & Time Selector */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2.5">
          <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-500" />
            <span>{isAr ? "تاريخ ووقت الإنجاز" : "Due Date & Time"}</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFormDueDate(todayKey())}
              className={cn(
                "cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold border transition-all",
                formDueDate === todayKey()
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface border-border text-ink-light hover:text-ink"
              )}
            >
              {isAr ? "اليوم" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => setFormDueDate(getTomorrowKey())}
              className={cn(
                "cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold border transition-all",
                formDueDate === getTomorrowKey()
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface border-border text-ink-light hover:text-ink"
              )}
            >
              {isAr ? "غداً" : "Tomorrow"}
            </button>
            <input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              autoComplete="off"
              className="bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none cursor-pointer"
            />
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3 py-2">
              <Clock size={13} className="text-hotpink" />
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                autoComplete="off"
                className="bg-transparent text-xs font-bold text-ink outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2.5">
          <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
            <Tag size={14} className="text-purple-500" />
            <span>{isAr ? "التصنيف" : "Category"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFormTag(c.id)}
                className={cn(
                  "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5",
                  formTag === c.id
                    ? "grad-theme text-white border-transparent shadow-rose-sm"
                    : "bg-surface border-border text-ink-light hover:text-ink"
                )}
              >
                <span>{c.emoji}</span>
                <span>{isAr ? c.labelAr : c.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Top-3 Focus */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-ink-light">
              {isAr ? "مستوى الأولوية:" : "Priority Level:"}
            </label>
            <div className="flex gap-1.5">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormPriority(p)}
                  className={cn(
                    "cursor-pointer px-3 py-1 rounded-xl text-xs font-bold border transition-all capitalize",
                    formPriority === p
                      ? p === "high"
                        ? "bg-rose-500 text-white border-transparent shadow-xs"
                        : p === "medium"
                        ? "bg-amber-500 text-white border-transparent shadow-xs"
                        : "bg-blue-500 text-white border-transparent shadow-xs"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  {p === "high" ? (isAr ? "عالية 🔥" : "High") : p === "medium" ? (isAr ? "متوسطة ⚡" : "Medium") : (isAr ? "منخفضة 🌿" : "Low")}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <div>
                <span className="text-xs font-extrabold text-ink block">
                  {isAr ? "تعيين كأولوية كبرى لليوم (Top 3) ⭐" : "Top 3 Daily Focus ⭐"}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formIsTopThree}
              onChange={(e) => setFormIsTopThree(e.target.checked)}
              className="h-5 w-5 rounded-lg accent-hotpink cursor-pointer"
            />
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <ListTodo size={14} className="text-hotpink" />
              <span>{isAr ? "المهام الفرعية (قائمة تفصيلية):" : "Subtasks:"}</span>
            </label>
            {formSubtasks.length > 0 && (
              <span className="text-[11px] font-bold text-hotpink">
                {formSubtasks.filter((s) => s.done).length}/{formSubtasks.length}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {formSubtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface border border-border/60"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className={cn(
                      "cursor-pointer flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all",
                      st.done ? "grad-theme border-transparent text-white" : "border-border bg-card"
                    )}
                  >
                    {st.done && <Check size={10} className="stroke-[3]" />}
                  </button>
                  <span className={cn("text-xs font-bold truncate", st.done && "line-through text-ink-light")}>
                    {st.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={formNewSubtask}
              onChange={(e) => setFormNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder={isAr ? "أضيفي خطوة فرعية..." : "Add subtask..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="cursor-pointer px-4 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-xs"
            >
              {isAr ? "إضافة" : "Add"}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
            <FileText size={14} className="text-amber-500" />
            <span>{isAr ? "ملاحظات إضافية (اختياري)" : "Notes (Optional)"}</span>
          </label>
          <textarea
            rows={2}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder={isAr ? "أي تفاصيل أو تذكيرات متعلقة بالمهمة..." : "Any details or reminders..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            dir="auto"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
          />
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 space-y-2.5">
          <button
            type="submit"
            disabled={!formTitle.trim()}
            className="cursor-pointer w-full py-4 rounded-2xl grad-theme text-white text-[15px] font-extrabold shadow-rose-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check size={18} className="stroke-[3]" />
            <span>{task ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "حفظ المهمة ✨" : "Save Task ✨")}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl border border-border/80 bg-surface/80 text-ink-light hover:text-ink text-xs font-bold transition-all text-center cursor-pointer active:scale-98"
          >
            {isAr ? "✕ إلغاء والرجوع للمهام" : "✕ Cancel & Return to Tasks"}
          </button>
        </div>
      </form>
    </div>
  );
});
