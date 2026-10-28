import React, { useState } from "react";
import { Plus, Trash2, Sparkles, Check, Image as ImageIcon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResetAccomplishment } from "@/lib/weeklyResetEngine";
import type { Task, Goal } from "@/lib/store";

interface ResetAccomplishmentsStepProps {
  accomplishments: ResetAccomplishment[];
  completedTasks: Task[];
  activeGoals: Goal[];
  onAddAccomplishment: (acc: ResetAccomplishment) => void;
  onRemoveAccomplishment: (id: string) => void;
  isAr: boolean;
  onContinue: () => void;
}

export const ResetAccomplishmentsStep: React.FC<ResetAccomplishmentsStepProps> = ({
  accomplishments,
  completedTasks,
  activeGoals,
  onAddAccomplishment,
  onRemoveAccomplishment,
  isAr,
  onContinue,
}) => {
  const [manualTitle, setManualTitle] = useState("");
  const [manualNote, setManualNote] = useState("");

  const handleAddManual = () => {
    if (!manualTitle.trim()) return;
    onAddAccomplishment({
      id: `acc_man_${Date.now()}`,
      title: manualTitle.trim(),
      sourceType: "manual",
      note: manualNote.trim() || undefined,
    });
    setManualTitle("");
    setManualNote("");
  };

  const handleToggleTaskSuggestion = (task: Task) => {
    const existing = accomplishments.find(
      (a) => a.sourceType === "task" && a.sourceId === task.id
    );
    if (existing) {
      onRemoveAccomplishment(existing.id);
    } else {
      onAddAccomplishment({
        id: `acc_tsk_${task.id}`,
        title: task.title,
        sourceType: "task",
        sourceId: task.id,
        category: task.category,
      });
    }
  };

  const handleToggleGoalSuggestion = (goal: Goal) => {
    const existing = accomplishments.find(
      (a) => a.sourceType === "goal" && a.sourceId === goal.id
    );
    if (existing) {
      onRemoveAccomplishment(existing.id);
    } else {
      onAddAccomplishment({
        id: `acc_gol_${goal.id}`,
        title: goal.title,
        sourceType: "goal",
        sourceId: goal.id,
        category: goal.category,
      });
    }
  };

  // Filter tasks to prevent showing sensitive financial details or private task notes
  const taskSuggestions = completedTasks.slice(0, 10);
  const goalSuggestions = activeGoals.filter((g) => (g.progress || 0) > 0).slice(0, 5);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Intro */}
      <div className="rounded-3xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 p-4">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <span>🏆</span>
          <span>{isAr ? "لحظات وإنجازات أعتز بها" : "Cherished Accomplishments"}</span>
        </h3>
        <p className="text-xs font-medium text-ink-light mt-1">
          {isAr
            ? "اختاري فقط ما ترغبين في تذكره والاحتفاء به، دون أي إلزام. كل خطوة قمتِ بها لها قيمتها 🌸"
            : "Choose only what feels meaningful to remember. Celebrate small ease and quiet steps 🌸"}
        </p>
      </div>

      {/* Suggested items from completed tasks and active goals */}
      {(taskSuggestions.length > 0 || goalSuggestions.length > 0) && (
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-ink-light flex items-center gap-1.5 px-1">
            <Sparkles size={13} className="text-hotpink" />
            <span>
              {isAr ? "اقتراحات من سجلاتكِ المكتملة" : "Suggestions from this week"}
            </span>
          </span>

          <div className="flex flex-wrap gap-2">
            {taskSuggestions.map((t) => {
              const isSelected = accomplishments.some(
                (a) => a.sourceType === "task" && a.sourceId === t.id
              );
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToggleTaskSuggestion(t)}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 active:scale-95",
                    isSelected
                      ? "bg-hotpink text-white border-hotpink shadow-2xs"
                      : "bg-surface border-border/80 text-ink-light hover:text-ink hover:border-hotpink/40"
                  )}
                >
                  {isSelected ? <Check size={12} className="stroke-[3]" /> : <Plus size={12} />}
                  <span className="truncate max-w-[200px]">{t.title}</span>
                </button>
              );
            })}

            {goalSuggestions.map((g) => {
              const isSelected = accomplishments.some(
                (a) => a.sourceType === "goal" && a.sourceId === g.id
              );
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleToggleGoalSuggestion(g)}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 active:scale-95",
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                      : "bg-purple-500/10 border-purple-300/60 text-purple-700 dark:text-purple-300 hover:border-purple-500/40"
                  )}
                >
                  {isSelected ? <Check size={12} className="stroke-[3]" /> : <Plus size={12} />}
                  <span className="truncate max-w-[200px]">{g.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Accomplishment Entry */}
      <div className="rounded-2xl bg-card border border-pink-200/60 dark:border-pink-900/40 p-3.5 space-y-2">
        <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
          <Heart size={13} className="text-rose-500" />
          <span>{isAr ? "إضافة إنجاز أو لحظة خاصة يدوياً" : "Add custom accomplishment"}</span>
        </span>

        <div className="space-y-2">
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
            placeholder={
              isAr
                ? "مثال: أنهيت قراءة فصل ملهم، أو حفظت وردي بهدوء..."
                : "e.g., Read an inspiring chapter, cooked a warm meal..."
            }
            dir="auto"
            className="w-full px-3 py-2 rounded-xl bg-surface border border-border/80 text-xs font-bold text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink"
          />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
              placeholder={isAr ? "ملاحظة لطيفة (اختياري)..." : "Optional gentle note..."}
              dir="auto"
              className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border/80 text-xs font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink"
            />

            <button
              type="button"
              onClick={handleAddManual}
              disabled={!manualTitle.trim()}
              className="cursor-pointer shrink-0 px-3.5 py-1.5 rounded-xl bg-hotpink text-white text-xs font-extrabold disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all"
            >
              <span>{isAr ? "إضافة" : "Add"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Chosen Accomplishments List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs font-bold text-ink-light">
          <span>{isAr ? "الإنجازات المختارة" : "Chosen Accomplishments"}</span>
          <span>{accomplishments.length}</span>
        </div>

        {accomplishments.length === 0 ? (
          <p className="text-xs text-ink-light/70 italic text-center py-3">
            {isAr
              ? "لم تختاري أي إنجازات بعد — يمكنكِ المتابعة دون إضافة أي منها."
              : "No accomplishments selected yet — you can freely continue without adding any."}
          </p>
        ) : (
          <div className="space-y-1.5">
            {accomplishments.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-border/80"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">🌸</span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-ink truncate">{acc.title}</p>
                    {acc.note && (
                      <p className="text-[10px] text-ink-light truncate">{acc.note}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveAccomplishment(acc.id)}
                  aria-label="Remove"
                  className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "الانتقال إلى المهام المتبقية 🌿" : "Review Unfinished Items 🌿"}</span>
        </button>
      </div>
    </div>
  );
};
