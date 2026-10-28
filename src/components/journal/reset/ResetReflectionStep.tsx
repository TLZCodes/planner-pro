import React, { useState } from "react";
import { Sparkles, Zap, BatteryLow, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKLY_RESET_PROMPTS,
  ENERGY_CARDS,
  type ReflectionPromptItem,
} from "@/lib/weeklyResetEngine";

interface ResetReflectionStepProps {
  answers: Record<string, string>;
  energyDrained: string;
  energyRestored: string;
  onAnswerChange: (promptId: string, value: string) => void;
  onEnergyDrainedChange: (value: string) => void;
  onEnergyRestoredChange: (value: string) => void;
  isAr: boolean;
  onContinue: () => void;
}

export const ResetReflectionStep: React.FC<ResetReflectionStepProps> = ({
  answers,
  energyDrained,
  energyRestored,
  onAnswerChange,
  onEnergyDrainedChange,
  onEnergyRestoredChange,
  isAr,
  onContinue,
}) => {
  const [activeTab, setActiveTab] = useState<"prompts" | "energy">("prompts");
  const [activePromptIdx, setActivePromptIdx] = useState(0);

  const currentPrompt = WEEKLY_RESET_PROMPTS[activePromptIdx];
  const answeredPromptsCount = WEEKLY_RESET_PROMPTS.filter(
    (p) => Boolean(answers[p.id]?.trim())
  ).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Sub-tabs: Gentle Prompts & Energy Reflection */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-200/50 dark:border-pink-900/40 pb-2">
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-2xl border border-border/70">
          <button
            type="button"
            onClick={() => setActiveTab("prompts")}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all",
              activeTab === "prompts"
                ? "bg-hotpink text-white shadow-rose-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            <span>{isAr ? "أسئلة التأمل الهادئة 🌸" : "Reflections 🌸"}</span>
            {answeredPromptsCount > 0 && (
              <span className="ml-1 text-[10px] opacity-90">({answeredPromptsCount}/6)</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("energy")}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all",
              activeTab === "energy"
                ? "bg-hotpink text-white shadow-rose-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            <span>{isAr ? "مستوى الطاقة والحيوية ⚡" : "Energy & Vitality ⚡"}</span>
          </button>
        </div>

        <p className="text-[11px] font-semibold text-ink-light/80 hidden sm:block">
          {isAr ? "تجاوزي أي سؤال تشائين بكل راحة 🤍" : "Skip freely — no minimum length 🤍"}
        </p>
      </div>

      {activeTab === "prompts" ? (
        /* Prompt Carousel / Single Focus Card */
        <div className="space-y-3">
          {/* Prompt Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {WEEKLY_RESET_PROMPTS.map((p, idx) => {
              const isSelected = activePromptIdx === idx;
              const isAnswered = Boolean(answers[p.id]?.trim());

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePromptIdx(idx)}
                  className={cn(
                    "cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1",
                    isSelected
                      ? "bg-hotpink/15 border-hotpink text-hotpink shadow-2xs"
                      : isAnswered
                      ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-surface border-border/70 text-ink-light hover:text-ink"
                  )}
                >
                  <span>{p.emoji}</span>
                  <span>{idx + 1}</span>
                  {isAnswered && <Check size={11} className="stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Active Prompt Card */}
          <div className="relative rounded-3xl bg-card border border-pink-200/80 dark:border-pink-900/50 p-5 shadow-xs overflow-hidden">
            {/* Washi tape accent */}
            <div className="absolute -top-1 left-8 w-16 h-3.5 bg-gradient-to-r from-pink-200/90 to-rose-200/90 dark:from-pink-900/40 dark:to-rose-900/40 rotate-[-2deg] rounded-xs shadow-2xs pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-hotpink uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>
                    {isAr
                      ? `سؤال التأمل ${activePromptIdx + 1} من 6`
                      : `Prompt ${activePromptIdx + 1} of 6`}
                  </span>
                </span>
                <span className="text-xl">{currentPrompt.emoji}</span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-ink leading-snug">
                {isAr ? currentPrompt.questionAr : currentPrompt.questionEn}
              </h4>

              <textarea
                value={answers[currentPrompt.id] || ""}
                onChange={(e) => onAnswerChange(currentPrompt.id, e.target.value)}
                rows={4}
                dir="auto"
                placeholder={
                  isAr ? currentPrompt.placeholderAr : currentPrompt.placeholderEn
                }
                className="w-full p-3.5 rounded-2xl bg-surface/80 border border-border/80 text-xs sm:text-sm font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-hotpink shadow-2xs resize-none transition-colors"
              />

              {/* Prev / Next prompt buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setActivePromptIdx((prev) => Math.max(0, prev - 1))}
                  disabled={activePromptIdx === 0}
                  className="cursor-pointer text-xs font-bold text-ink-light hover:text-ink disabled:opacity-40 flex items-center gap-1"
                >
                  {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  <span>{isAr ? "السابق" : "Previous"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActivePromptIdx((prev) =>
                      Math.min(WEEKLY_RESET_PROMPTS.length - 1, prev + 1)
                    )
                  }
                  disabled={activePromptIdx === WEEKLY_RESET_PROMPTS.length - 1}
                  className="cursor-pointer text-xs font-bold text-hotpink hover:underline disabled:opacity-40 flex items-center gap-1"
                >
                  <span>{isAr ? "التالي" : "Next"}</span>
                  {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Energy Reflection Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Drained Energy */}
          <div className="relative rounded-3xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/70 dark:border-amber-900/40 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <BatteryLow size={18} className="text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs sm:text-sm font-black">
                {isAr ? ENERGY_CARDS.drained.titleAr : ENERGY_CARDS.drained.titleEn}
              </h4>
            </div>

            <textarea
              value={energyDrained}
              onChange={(e) => onEnergyDrainedChange(e.target.value)}
              rows={4}
              dir="auto"
              placeholder={
                isAr
                  ? ENERGY_CARDS.drained.placeholderAr
                  : ENERGY_CARDS.drained.placeholderEn
              }
              className="w-full p-3 rounded-2xl bg-white/90 dark:bg-card/90 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-amber-400 shadow-2xs resize-none"
            />
          </div>

          {/* Restored Energy */}
          <div className="relative rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200/70 dark:border-emerald-900/40 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Zap size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-black">
                {isAr ? ENERGY_CARDS.restored.titleAr : ENERGY_CARDS.restored.titleEn}
              </h4>
            </div>

            <textarea
              value={energyRestored}
              onChange={(e) => onEnergyRestoredChange(e.target.value)}
              rows={4}
              dir="auto"
              placeholder={
                isAr
                  ? ENERGY_CARDS.restored.placeholderAr
                  : ENERGY_CARDS.restored.placeholderEn
              }
              className="w-full p-3 rounded-2xl bg-white/90 dark:bg-card/90 border border-emerald-200/80 dark:border-emerald-900/40 text-xs sm:text-sm font-medium text-ink placeholder:text-ink-light/50 focus:outline-none focus:border-emerald-400 shadow-2xs resize-none"
            />
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <span>{isAr ? "الانتقال إلى الإنجازات 🏆" : "Continue to Accomplishments 🏆"}</span>
        </button>
      </div>
    </div>
  );
};
