import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Check, Compass, Edit3 } from "lucide-react";
import { PRESET_INTENTIONS } from "../../../lib/weeklyHabitEngine";
import type { WeeklyIntentionRecord } from "../../../lib/store";

interface WeeklyIntentionCardProps {
  weekStartDate: string;
  intentionRecord?: WeeklyIntentionRecord;
  onSaveIntention: (text: string, presetTag?: string) => void;
  isAr: boolean;
}

export const WeeklyIntentionCard: React.FC<WeeklyIntentionCardProps> = ({
  weekStartDate,
  intentionRecord,
  onSaveIntention,
  isAr,
}) => {
  const [text, setText] = useState(intentionRecord?.text || "");
  const [isSaved, setIsSaved] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const saveTimeoutRef = useRef<any>(null);

  // Sync when weekStartDate changes
  useEffect(() => {
    setText(intentionRecord?.text || "");
    setIsSaved(false);
  }, [weekStartDate, intentionRecord?.text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    setIsSaved(false);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSaveIntention(val.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, 600);
  };

  const handleSelectPreset = (preset: string) => {
    setText(preset);
    onSaveIntention(preset, preset);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const presets = isAr ? PRESET_INTENTIONS.ar : PRESET_INTENTIONS.en;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 p-4 shadow-2xs transition-all">
      {/* Delicate Washi Tape decorative element */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-4 bg-gradient-to-r from-rose-200/70 via-pink-200/80 to-rose-200/70 dark:from-rose-900/40 dark:via-pink-900/50 dark:to-rose-900/40 rotate-[-1deg] rounded-xs shadow-2xs border-y border-white/40 dark:border-pink-800/30 pointer-events-none" />

      <div className="space-y-2 pt-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-900/80 dark:text-amber-200/90 font-bold text-[12px]">
            <Compass className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isAr ? "نيّتي الهادئة للأسبوع" : "Weekly Gentle Focus"}</span>
          </div>

          {/* Save Status Badge */}
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
              <Check className="h-3 w-3" />
              <span>{isAr ? "حُفظت ✨" : "Saved ✨"}</span>
            </span>
          )}
        </div>

        {/* Text Input with Paper styling */}
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isAr ? "نيّتي الهادئة لهذا الأسبوع… ✨" : "My gentle focus this week… ✨"}
            className="w-full h-10 px-3.5 rounded-2xl bg-white/90 dark:bg-card/90 border border-amber-200/80 dark:border-amber-900/40 text-[13px] font-medium text-ink placeholder:text-ink-light/60 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 shadow-2xs transition-colors"
          />
        </div>

        {/* Presets Chips if empty or user wants inspiration */}
        {(!text.trim() || isFocused) && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar">
            <span className="text-[10.5px] font-semibold text-ink-light shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{isAr ? "اقتراحات لطيفة:" : "Gentle ideas:"}</span>
            </span>
            {presets.slice(0, 3).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-surface/80 border border-amber-200/60 dark:border-amber-900/30 text-[11px] font-medium text-ink-light hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
