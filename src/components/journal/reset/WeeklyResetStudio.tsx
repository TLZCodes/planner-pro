import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, type Priority as TaskPriority } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  getWeekDaysInfo,
  type WeekInfo,
  type WeekStartDay,
} from "@/lib/weeklyHabitEngine";
import {
  aggregateWeekOverviewMetrics,
  initializeWeeklyResetDraft,
  compileResetJournalBody,
  type WeeklyResetDraft,
  type TaskMutationPlan,
  type NextWeekPriority,
  type ResetAccomplishment,
} from "@/lib/weeklyResetEngine";

import { ResetWeekHeader } from "./ResetWeekHeader";
import { ResetOverviewStep } from "./ResetOverviewStep";
import { ResetReflectionStep } from "./ResetReflectionStep";
import { ResetAccomplishmentsStep } from "./ResetAccomplishmentsStep";
import { ResetUnfinishedTasksStep } from "./ResetUnfinishedTasksStep";
import { ResetNextPrioritiesStep } from "./ResetNextPrioritiesStep";
import { ResetActionPreviewModal } from "./ResetActionPreviewModal";
import { ResetCompletionView } from "./ResetCompletionView";
import { useNavigate } from "@tanstack/react-router";

interface WeeklyResetStudioProps {
  initialWeekStartDate?: string;
  onExit?: () => void;
  onOpenJournalEntry?: (id: string) => void;
}

export const WeeklyResetStudio: React.FC<WeeklyResetStudioProps> = ({
  initialWeekStartDate,
  onExit,
  onOpenJournalEntry,
}) => {
  const navigate = useNavigate();
  const {
    state,
    setWeeklyNote,
    saveWeeklyReflectionToJournal,
    editTask,
    removeTask,
    addTask,
  } = useApp();
  const { lang } = useLang();
  const isAr = lang === "ar";

  const firstDay =
    state.habitWeekPreferences?.firstDayOfWeek ||
    (state.prefs?.weekStartsOn as WeekStartDay) ||
    "saturday";

  // Calculate initial week offset based on initialWeekStartDate if provided
  const [weekOffset, setWeekOffset] = useState(() => {
    if (!initialWeekStartDate) return 0;
    const nowInfo = getWeekDaysInfo(new Date(), 0, firstDay, isAr);
    if (nowInfo.weekStartDate === initialWeekStartDate) return 0;

    const targetDate = new Date(initialWeekStartDate + "T12:00:00Z");
    const nowDate = new Date(nowInfo.weekStartDate + "T12:00:00Z");
    const diffDays = Math.round(
      (targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.round(diffDays / 7);
  });

  const weekInfo = useMemo(() => {
    return getWeekDaysInfo(new Date(), weekOffset, firstDay, isAr);
  }, [weekOffset, firstDay, isAr]);

  const existingNote = state.weeklyNotes?.[weekInfo.weekStartDate];
  const existingJournal = existingNote?.journalEntryId
    ? state.journal.find((j) => j.id === existingNote.journalEntryId)
    : undefined;

  // Aggregate factual metrics
  const metrics = useMemo(() => {
    return aggregateWeekOverviewMetrics({
      weekInfo,
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      focusSessions: state.focusSessions,
      studySessions: state.studySessions,
      routines: state.routines,
      routineCompletionsByDate: state.routineCompletionsByDate,
      dailyMoods: state.dailyMoods,
      dailyHydration: state.dailyHydration,
    });
  }, [weekInfo, state]);

  // Working Draft State
  const [draft, setDraft] = useState<WeeklyResetDraft>(() =>
    initializeWeeklyResetDraft(weekInfo, existingNote, existingJournal)
  );

  // Sync draft when week changes
  useEffect(() => {
    setDraft(initializeWeeklyResetDraft(weekInfo, existingNote, existingJournal));
  }, [weekInfo.weekStartDate]);

  // Autosave draft to store.weeklyNotes with debounce
  const saveTimeoutRef = useRef<any>(null);
  const saveDraftToStore = (updatedDraft: WeeklyResetDraft) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setWeeklyNote(weekInfo.weekStartDate, existingNote?.text || "", {
        reflectionAnswers: updatedDraft.reflectionAnswers,
        energyDrained: updatedDraft.energyDrained,
        energyRestored: updatedDraft.energyRestored,
        accomplishments: updatedDraft.accomplishments,
        nextWeekPriorities: updatedDraft.nextWeekPriorities,
        nextWeekIntention: updatedDraft.nextWeekIntention,
        completedReflection: updatedDraft.status === "finished",
        journalEntryId: updatedDraft.journalEntryId,
      });
    }, 600);
  };

  // Step tabs
  const STEPS = [
    { id: 0, labelEn: "Overview 📊", labelAr: "نظرة عامة 📊" },
    { id: 1, labelEn: "Reflections 🌸", labelAr: "التأملات 🌸" },
    { id: 2, labelEn: "Accomplishments 🏆", labelAr: "الإنجازات 🏆" },
    { id: 3, labelEn: "Unfinished Tasks 🌿", labelAr: "المهام المتبقية 🌿" },
    { id: 4, labelEn: "Next Priorities 🎯", labelAr: "أولويات القادم 🎯" },
  ];

  const [activeStep, setActiveStep] = useState<number>(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isApplyingMutations, setIsApplyingMutations] = useState(false);
  const [mutationError, setMutationError] = useState<string | undefined>();

  // Handlers for draft fields
  const handleAnswerChange = (promptId: string, val: string) => {
    const nextAnswers = { ...draft.reflectionAnswers, [promptId]: val };
    const nextDraft = { ...draft, reflectionAnswers: nextAnswers };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleEnergyDrainedChange = (val: string) => {
    const nextDraft = { ...draft, energyDrained: val };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleEnergyRestoredChange = (val: string) => {
    const nextDraft = { ...draft, energyRestored: val };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleAddAccomplishment = (acc: ResetAccomplishment) => {
    const nextAccs = [...draft.accomplishments, acc];
    const nextDraft = { ...draft, accomplishments: nextAccs };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleRemoveAccomplishment = (id: string) => {
    const nextAccs = draft.accomplishments.filter((a) => a.id !== id);
    const nextDraft = { ...draft, accomplishments: nextAccs };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleSetActionPlan = (plan: TaskMutationPlan) => {
    const nextPlans = { ...draft.taskActionPlans, [plan.taskId]: plan };
    const nextDraft = { ...draft, taskActionPlans: nextPlans };
    setDraft(nextDraft);
  };

  const handleUpdatePriority = (index: number, priority: NextWeekPriority) => {
    const nextPriorities = [...draft.nextWeekPriorities];
    nextPriorities[index] = priority;
    const nextDraft = { ...draft, nextWeekPriorities: nextPriorities };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  const handleUpdateIntention = (val: string) => {
    const nextDraft = { ...draft, nextWeekIntention: val };
    setDraft(nextDraft);
    saveDraftToStore(nextDraft);
  };

  // Execution of task mutations & final journal saving
  const handleConfirmApplyMutations = () => {
    setIsApplyingMutations(true);
    setMutationError(undefined);

    try {
      // 1. Apply reschedule actions
      Object.values(draft.taskActionPlans).forEach((plan) => {
        if (plan.action === "reschedule" && plan.newDueDate) {
          editTask(plan.taskId, {
            due: plan.newDueDate,
            dueDate: plan.newDueDate,
            dueTime: plan.newDueTime,
          });
        } else if (plan.action === "delete") {
          removeTask(plan.taskId);
        }
      });

      // 2. Create proposed new tasks from priorities
      const updatedPriorities = draft.nextWeekPriorities.map((p) => {
        if (p.type === "proposed_task" && p.title.trim() && !p.isApplied) {
          addTask({
            title: p.title.trim(),
            due: p.proposedDueDate,
            dueDate: p.proposedDueDate,
            dueTime: p.proposedDueTime,
            category: p.category || "General",
            tag: p.category || "General",
            priority: "medium",
            goalId: p.linkedGoalId,
          });
          return { ...p, isApplied: true };
        }
        return p;
      });

      // 3. Compile markdown and save to Journal
      const journalBody = compileResetJournalBody(draft, weekInfo.formattedRange, isAr);
      const savedJournalId = saveWeeklyReflectionToJournal(
        weekInfo.weekStartDate,
        journalBody,
        draft.reflectionAnswers
      );

      // 4. Update draft status
      const finishedDraft: WeeklyResetDraft = {
        ...draft,
        status: "finished",
        nextWeekPriorities: updatedPriorities,
        journalEntryId: savedJournalId,
      };
      setDraft(finishedDraft);
      saveDraftToStore(finishedDraft);

      setPreviewModalOpen(false);
      setIsApplyingMutations(false);
    } catch (err: any) {
      setMutationError(
        isAr
          ? "حدث خطأ غير متوقع أثناء تطبيق التغييرات. تم حفظ مسودتكِ بأمان."
          : "An unexpected error occurred. Your reflection draft was preserved safely."
      );
      setIsApplyingMutations(false);
    }
  };

  // If already finished and not in edit mode
  const isFinished = draft.status === "finished";

  return (
    <div className="space-y-4 pb-12">
      {/* Week Header Navigation */}
      <ResetWeekHeader
        weekInfo={weekInfo}
        weekOffset={weekOffset}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onCurrentWeek={() => setWeekOffset(0)}
        onPickDate={(dateStr) => {
          // Calculate offset
          const nowInfo = getWeekDaysInfo(new Date(), 0, firstDay, isAr);
          const targetDate = new Date(dateStr + "T12:00:00Z");
          const nowDate = new Date(nowInfo.weekStartDate + "T12:00:00Z");
          const diffDays = Math.round(
            (targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          setWeekOffset(Math.round(diffDays / 7));
        }}
        isAr={isAr}
      />

      {isFinished ? (
        /* Completed Resting View */
        <ResetCompletionView
          isAr={isAr}
          journalEntryId={draft.journalEntryId || existingNote?.journalEntryId}
          onEditAgain={() => {
            setDraft((prev) => ({ ...prev, status: "draft" }));
          }}
          onViewJournal={() => {
            const jId = draft.journalEntryId || existingNote?.journalEntryId;
            if (jId && onOpenJournalEntry) {
              onOpenJournalEntry(jId);
            } else if (onExit) {
              onExit();
            }
          }}
          onBackToPlanner={() => {
            if (onExit) onExit();
          }}
          onCreateKeepsake={() => {
            navigate({
              to: "/journal",
              search: { tab: "bloom", week: weekInfo.weekStartDate },
            });
          }}
        />
      ) : (
        /* Multi-step studio wizard */
        <div className="space-y-4">
          {/* Step Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {STEPS.map((s) => {
              const active = activeStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStep(s.id)}
                  className={cn(
                    "cursor-pointer shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95",
                    active
                      ? "bg-hotpink text-white border-hotpink shadow-rose-xs"
                      : "bg-surface border-border/80 text-ink-light hover:text-ink hover:border-hotpink/30"
                  )}
                >
                  {isAr ? s.labelAr : s.labelEn}
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          <div className="pt-1">
            {activeStep === 0 && (
              <ResetOverviewStep
                metrics={metrics}
                weekInfo={weekInfo}
                isCurrentWeek={weekOffset === 0}
                isAr={isAr}
                onContinue={() => setActiveStep(1)}
              />
            )}

            {activeStep === 1 && (
              <ResetReflectionStep
                answers={draft.reflectionAnswers}
                energyDrained={draft.energyDrained}
                energyRestored={draft.energyRestored}
                onAnswerChange={handleAnswerChange}
                onEnergyDrainedChange={handleEnergyDrainedChange}
                onEnergyRestoredChange={handleEnergyRestoredChange}
                isAr={isAr}
                onContinue={() => setActiveStep(2)}
              />
            )}

            {activeStep === 2 && (
              <ResetAccomplishmentsStep
                accomplishments={draft.accomplishments}
                completedTasks={metrics.completedTasksInWeek as any}
                activeGoals={state.goals}
                onAddAccomplishment={handleAddAccomplishment}
                onRemoveAccomplishment={handleRemoveAccomplishment}
                isAr={isAr}
                onContinue={() => setActiveStep(3)}
              />
            )}

            {activeStep === 3 && (
              <ResetUnfinishedTasksStep
                unfinishedTasks={metrics.unfinishedTasksInWeek as any}
                taskActionPlans={draft.taskActionPlans}
                weekInfo={weekInfo}
                onSetActionPlan={handleSetActionPlan}
                isAr={isAr}
                onContinue={() => setActiveStep(4)}
              />
            )}

            {activeStep === 4 && (
              <ResetNextPrioritiesStep
                priorities={draft.nextWeekPriorities}
                intention={draft.nextWeekIntention}
                activeGoals={state.goals}
                openTasks={state.tasks.filter((t) => !t.done)}
                weekInfo={weekInfo}
                onUpdatePriority={handleUpdatePriority}
                onUpdateIntention={handleUpdateIntention}
                isAr={isAr}
                onContinue={() => setPreviewModalOpen(true)}
              />
            )}
          </div>

          {/* Bottom Bar: Finish and Save */}
          <div className="flex items-center justify-between pt-4 border-t border-pink-200/50 dark:border-pink-900/40">
            <button
              type="button"
              onClick={onExit}
              className="cursor-pointer px-4 py-2 rounded-full border border-border text-xs font-bold text-ink-light hover:text-ink flex items-center gap-1"
            >
              {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span>{isAr ? "الرجوع لليوميات" : "Back to Journal"}</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              <span>{isAr ? "إتمام مراجعة الأسبوع ✨" : "Finish Reset ✨"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Task Mutation Preview Modal */}
      <ResetActionPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        taskActionPlans={draft.taskActionPlans}
        priorities={draft.nextWeekPriorities}
        isAr={isAr}
        onConfirmApply={handleConfirmApplyMutations}
        isApplying={isApplyingMutations}
        errorMessage={mutationError}
      />
    </div>
  );
};
