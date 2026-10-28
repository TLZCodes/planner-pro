import React, { useState, memo } from "react";
import {
  X,
  Check,
  Clock,
  Calendar,
  Tag,
  Star,
  ListTodo,
  FileText,
  Sparkles,
} from "lucide-react";
import { type Task, type Priority, type Subtask, todayKey, getTomorrowKey } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface TaskEditorModalProps {
  task: Task | null;
  presetDueDate: string;
  allCategories: any[];
  isAr: boolean;
  onSave: (payload: Partial<Task>) => void;
  onCancel: () => void;
  addCustomCategory?: (name: string) => void;
}

export const TaskEditorModal = memo(function TaskEditorModal({
  task,
  presetDueDate,
  allCategories,
  isAr,
  onSave,
  onCancel,
}: TaskEditorModalProps) {
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

    const payload: Partial<Task> = {
      title: formTitle.trim(),
      dueDate: formDueDate,
      optionalTime: formTime.trim() || undefined,
      tag: formTag,
      priority: formPriority,
      isTopThree: formIsTopThree,
      notes: formNotes.trim() || undefined,
      subtasks: formSubtasks,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-hotpink" />
            <h2 className="text-base font-extrabold text-ink">
              {task ? (isAr ? "تعديل المهمة ✨" : "Edit Task ✨") : (isAr ? "مهمة جديدة ✨" : "New Task ✨")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink transition-colors"
            title={isAr ? "إغلاق" : "Close"}
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-ink-light">
              {isAr ? "عنوان المهمة *" : "Task Title *"}
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
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-bold text-ink outline-none focus:border-hotpink transition-colors"
              required
            />
          </div>

          {/* Date & Time Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <Calendar size={13} className="text-teal-500" />
              <span>{isAr ? "تاريخ ووقت الإنجاز" : "Due Date & Time"}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFormDueDate(todayKey())}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold border transition-all",
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
                  "cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold border transition-all",
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
                className="bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer"
              />
              <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1.5">
                <Clock size={12} className="text-hotpink" />
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
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <Tag size={13} className="text-purple-500" />
              <span>{isAr ? "التصنيف" : "Category"}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormTag(c.id)}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-bold border transition-all flex items-center gap-1",
                    formTag === c.id
                      ? "grad-theme text-white border-transparent shadow-xs"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  <span>{c.emoji}</span>
                  <span>{isAr ? c.labelAr : c.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-ink-light">
              {isAr ? "مستوى الأهمية" : "Priority Level"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "high", labelEn: "High 🔥", labelAr: "عالية 🔥", activeClass: "bg-rose-500 text-white border-rose-500" },
                { id: "medium", labelEn: "Medium ⚡", labelAr: "متوسطة ⚡", activeClass: "bg-amber-500 text-white border-amber-500" },
                { id: "low", labelEn: "Low 🌿", labelAr: "منخفضة 🌿", activeClass: "bg-teal-500 text-white border-teal-500" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormPriority(p.id as Priority)}
                  className={cn(
                    "cursor-pointer rounded-xl py-2 text-xs font-extrabold border transition-all text-center",
                    formPriority === p.id ? p.activeClass : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  {isAr ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Toggle */}
          <button
            type="button"
            onClick={() => setFormIsTopThree(!formIsTopThree)}
            className={cn(
              "cursor-pointer flex w-full items-center justify-between rounded-2xl p-3 border transition-all",
              formIsTopThree
                ? "bg-amber-500/10 border-amber-500/50 text-amber-950 dark:text-amber-100"
                : "bg-surface border-border text-ink-light hover:text-ink"
            )}
          >
            <div className="flex items-center gap-2">
              <Star size={16} className={formIsTopThree ? "text-amber-500 fill-amber-500" : "text-ink-light"} />
              <span className="text-xs font-extrabold text-ink">
                {isAr ? "تعيين كأولوية اليوم الثلاثية ⭐" : "Top 3 Priority ⭐"}
              </span>
            </div>
            <div
              className={cn(
                "h-5 w-5 rounded-full border flex items-center justify-center",
                formIsTopThree ? "bg-amber-500 border-amber-500 text-white" : "border-border bg-card"
              )}
            >
              {formIsTopThree && <Check size={12} className="stroke-[3]" />}
            </div>
          </button>

          {/* Subtasks */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <ListTodo size={13} className="text-purple-500" />
              <span>{isAr ? "الخطوات الفرعية" : "Subtasks"}</span>
            </label>
            <div className="flex gap-2">
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
                placeholder={isAr ? "إضافة خطوة فرعية..." : "Add subtask..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-hotpink"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="cursor-pointer px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-hotpink hover:bg-hotpink/10"
              >
                +
              </button>
            </div>
            {formSubtasks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {formSubtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface p-2 border border-border/50">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 flex-1 text-start cursor-pointer"
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          st.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-card"
                        )}
                      >
                        {st.done && <Check size={10} className="stroke-[3]" />}
                      </div>
                      <span className={cn("text-xs font-semibold text-ink", st.done && "line-through opacity-50")}>{st.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="cursor-pointer text-ink-light/50 hover:text-rose-500 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <FileText size={13} className="text-amber-500" />
              <span>{isAr ? "ملاحظات إضافية" : "Notes"}</span>
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder={isAr ? "أية ملاحظات أو تفاصيل..." : "Any details..."}
              rows={2}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-semibold text-ink outline-none focus:border-hotpink resize-none leading-relaxed"
            />
          </div>
        </form>

        {/* Modal Bottom Actions */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-t border-border/60 bg-surface/50 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 py-3 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface active:scale-95 transition-all text-center"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!formTitle.trim()}
            className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 active:scale-95 transition-all text-center disabled:opacity-50"
          >
            {task ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "إضافة المهمة ✨" : "Add Task ✨")}
          </button>
        </div>
      </div>
    </div>
  );
});
