import React, { useState, useEffect } from "react";
import { X, Sparkles, Heart, Check, BookOpen, Lock } from "lucide-react";
import { cn } from "../../../lib/utils";
import { WEEKLY_REFLECTION_PROMPTS } from "../../../lib/weeklyHabitEngine";
import type { WeeklyNoteRecord, JournalSettings } from "../../../lib/store";

interface WeeklyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStartDate: string;
  formattedRange: string;
  notesRecord?: WeeklyNoteRecord;
  journalSettings?: JournalSettings;
  onSaveAnswers: (answers: Record<string, string>) => void;
  onSaveToJournal: (reflectionText: string, answers: Record<string, string>) => void;
  isAr: boolean;
}

export const WeeklyReflectionModal: React.FC<WeeklyReflectionModalProps> = ({
  isOpen,
  onClose,
  weekStartDate,
  formattedRange,
  notesRecord,
  journalSettings,
  onSaveAnswers,
  onSaveToJournal,
  isAr,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSavedToJournal, setIsSavedToJournal] = useState(false);

  useEffect(() => {
    if (notesRecord?.reflectionAnswers) {
      setAnswers({ ...notesRecord.reflectionAnswers });
    } else {
      setAnswers({});
    }
    setIsSavedToJournal(Boolean(notesRecord?.journalEntryId));
    setActiveStep(0);
  }, [isOpen, weekStartDate, notesRecord]);

  if (!isOpen) return null;

  const handleAnswerChange = (promptId: string, value: string) => {
    const updated = { ...answers, [promptId]: value };
    setAnswers(updated);
    onSaveAnswers(updated);
  };

  const handleSaveToJournalClick = () => {
    // Format full reflection text
    const lines = [
      `🌸 ${isAr ? "تأمل نهاية الأسبوع" : "Weekly Reflection"} (${formattedRange})`,
      "",
    ];

    WEEKLY_REFLECTION_PROMPTS.forEach((p) => {
      const ans = answers[p.id]?.trim();
      if (ans) {
        lines.push(`✨ ${isAr ? p.questionAr : p.questionEn}`);
        lines.push(`${ans}`);
        lines.push("");
      }
    });

    const fullText = lines.join("\n");
    onSaveToJournal(fullText, answers);
    setIsSavedToJournal(true);
  };

  const currentPrompt = WEEKLY_REFLECTION_PROMPTS[activeStep];
  const isLastStep = activeStep === WEEKLY_REFLECTION_PROMPTS.length - 1;

  const answeredCount = WEEKLY_REFLECTION_PROMPTS.filter(
    (p) => Boolean(answers[p.id]?.trim())
  ).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950/40 dark:via-rose-950/20 dark:to-purple-950/40 p-5 border-b border-pink-100 dark:border-pink-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <div>
                <h3 className="text-base font-black text-ink">
                  {isAr ? "تأمل نهاية الأسبوع الهادئ" : "Gentle Weekly Reflection"}
                </h3>
                <p className="text-[12px] font-semibold text-pink-700 dark:text-pink-300">
                  {formattedRange}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/80 dark:bg-surface/80 border border-border flex items-center justify-center text-ink-light hover:text-ink cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-4">
            {WEEKLY_REFLECTION_PROMPTS.map((p, idx) => {
              const hasAnswer = Boolean(answers[p.id]?.trim());
              const isCurrent = idx === activeStep;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-all cursor-pointer",
                    isCurrent
                      ? "bg-hotpink"
                      : hasAnswer
                      ? "bg-pink-300 dark:bg-pink-700"
                      : "bg-pink-100 dark:bg-pink-950/40"
                  )}
                  title={isAr ? p.questionAr : p.questionEn}
                />
              );
            })}
          </div>
        </div>

        {/* Modal Body / Active Prompt Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-hotpink bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-full border border-pink-200/60 dark:border-pink-900/40">
              {isAr
                ? `سؤال ${activeStep + 1} من ${WEEKLY_REFLECTION_PROMPTS.length}`
                : `Prompt ${activeStep + 1} of ${WEEKLY_REFLECTION_PROMPTS.length}`}
            </span>

            <span className="text-[11.5px] font-bold text-ink-light flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>
                {answeredCount}/{WEEKLY_REFLECTION_PROMPTS.length} {isAr ? "مكتملة" : "answered"}
              </span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[14.5px] font-black text-ink flex items-center gap-2 leading-snug">
              <span>{currentPrompt.emoji}</span>
              <span>{isAr ? currentPrompt.questionAr : currentPrompt.questionEn}</span>
            </h4>
            <p className="text-[11.5px] text-ink-light">
              {isAr
                ? "أجيبي بعفوية وهدوء، دون قلق أو سعي للمثالية 🤍"
                : "Answer with gentle honesty and self-compassion 🤍"}
            </p>
          </div>

          <textarea
            value={answers[currentPrompt.id] || ""}
            onChange={(e) => handleAnswerChange(currentPrompt.id, e.target.value)}
            rows={4}
            placeholder={isAr ? currentPrompt.placeholderAr : currentPrompt.placeholderEn}
            className="w-full p-3.5 rounded-2xl bg-surface/70 border border-pink-200/70 dark:border-pink-900/40 text-[13px] font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink shadow-2xs resize-none transition-colors"
          />

          {/* Privacy Note if Journal Lock is enabled */}
          {journalSettings?.journalLockEnabled && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px]">
              <Lock className="h-3 w-3 shrink-0" />
              <span>
                {isAr
                  ? "قفل المذكرات مفعّل: تظل تأملاتكِ محمية ومحفوظة بخصوصية تامة 🔒"
                  : "Journal lock active: your reflections remain private and protected 🔒"}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-surface/60 border-t border-border/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="h-9 px-3.5 rounded-xl border border-border text-[12px] font-bold text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                {isAr ? "السابق" : "Back"}
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="h-9 px-4 rounded-xl bg-hotpink text-white text-[12px] font-bold shadow-xs hover:bg-hotpink/90 transition-all cursor-pointer"
              >
                {isAr ? "التالي" : "Next"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-bold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
              >
                {isAr ? "إتمام التأمل ✨" : "Done ✨"}
              </button>
            )}
          </div>

          {/* Save to Journal Button */}
          <button
            type="button"
            onClick={handleSaveToJournalClick}
            disabled={isSavedToJournal || answeredCount === 0}
            className={cn(
              "h-9 px-3.5 rounded-xl flex items-center gap-1.5 text-[11.5px] font-bold transition-all cursor-pointer",
              isSavedToJournal
                ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : answeredCount === 0
                ? "bg-surface border border-border text-ink-light opacity-50 cursor-not-allowed"
                : "bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50"
            )}
          >
            {isSavedToJournal ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{isAr ? "حُفظت في المذكرات ✓" : "Saved in Journal ✓"}</span>
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isAr ? "حفظ في المذكرات 📖" : "Save to Journal 📖"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
