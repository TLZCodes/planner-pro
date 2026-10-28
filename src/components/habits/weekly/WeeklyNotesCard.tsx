import React, { useState, useEffect, useRef } from "react";
import { StickyNote, Check, Sparkles, BookOpen } from "lucide-react";
import type { WeeklyNoteRecord } from "../../../lib/store";

interface WeeklyNotesCardProps {
  weekStartDate: string;
  notesRecord?: WeeklyNoteRecord;
  onSaveNotes: (text: string) => void;
  onOpenReflectionModal: () => void;
  isAr: boolean;
}

export const WeeklyNotesCard: React.FC<WeeklyNotesCardProps> = ({
  weekStartDate,
  notesRecord,
  onSaveNotes,
  onOpenReflectionModal,
  isAr,
}) => {
  const [text, setText] = useState(notesRecord?.text || "");
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setText(notesRecord?.text || "");
    setIsSaved(false);
  }, [weekStartDate, notesRecord?.text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setIsSaved(false);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSaveNotes(val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, 800);
  };

  const hasCompletedReflection = Boolean(notesRecord?.completedReflection);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-200/70 dark:border-yellow-900/30 p-4 sm:p-5 shadow-2xs transition-all">
      {/* Decorative Washi Tape element */}
      <div className="absolute -top-1 right-8 w-20 h-4 bg-gradient-to-r from-amber-200/80 via-yellow-200/90 to-amber-200/80 dark:from-amber-900/40 dark:via-yellow-900/50 dark:to-amber-900/40 rotate-[2deg] rounded-xs shadow-2xs border-y border-white/40 dark:border-yellow-800/30 pointer-events-none" />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-900 dark:text-yellow-200 font-extrabold text-[13px]">
            <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{isAr ? "ملاحظات وتأملات الأسبوع 🌸" : "Weekly Notes & Gentle Thoughts 🌸"}</span>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
                <Check className="h-3 w-3" />
                <span>{isAr ? "حُفظت ✨" : "Saved ✨"}</span>
              </span>
            )}

            {hasCompletedReflection && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold">
                <span>✓ {isAr ? "اكتمل التأمل" : "Reflected"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Paper textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={handleChange}
            rows={3}
            placeholder={
              isAr
                ? "مساحتكِ الهادئة لتدوين أي أفكار، خواطر، أو ملاحظات لطيفة حول أسبوعكِ..."
                : "Your gentle space to jot down thoughts, moments of ease, or observations about your week..."
            }
            className="w-full p-3 rounded-2xl bg-white/80 dark:bg-card/90 border border-yellow-200/80 dark:border-yellow-900/40 text-[12.5px] font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 shadow-2xs resize-none transition-colors"
          />
        </div>

        {/* Action: Open Guided Reflection Modal */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-ink-light font-medium">
            {isAr
              ? "تأملي برفق في نهاية الأسبوع لتعزيز حضوركِ وسلامكِ الداخلي"
              : "Reflect gently at week's end to honor your rhythms and growth"}
          </p>

          <button
            type="button"
            onClick={onOpenReflectionModal}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[12px] shadow-2xs hover:shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {hasCompletedReflection
                ? isAr ? "مراجعة التأمل 🌸" : "Review Reflection 🌸"
                : isAr ? "تأمل نهاية الأسبوع ✨" : "Gentle Weekly Reflection ✨"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
