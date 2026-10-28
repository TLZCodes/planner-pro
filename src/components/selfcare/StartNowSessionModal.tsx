import React, { useState, useEffect } from "react";
import { X, Play, Pause, CheckCircle2, RotateCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import { type SelfCareActivity, type SelfCareIdea } from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface StartNowSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: SelfCareActivity | null;
  idea?: SelfCareIdea | null;
}

export const StartNowSessionModal: React.FC<StartNowSessionModalProps> = ({
  isOpen,
  onClose,
  activity,
  idea,
}) => {
  const { t, lang } = useLang();
  const { state, toggleCarePlanItem } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const durationMin =
    activity?.estimatedDurationMinutes || idea?.durationMinutes || 10;
  const initialSeconds = durationMin * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Sync initial seconds when target changes
  useEffect(() => {
    setSecondsRemaining(durationMin * 60);
    setIsRunning(true);
    setIsFinished(false);
  }, [durationMin, activity, idea]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning, secondsRemaining]);

  if (!isOpen) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  const title = activity?.title || (isAr ? idea?.titleAr : idea?.titleEn) || "Self-Care Pause";
  const icon = activity?.icon || idea?.icon || "🌸";

  const handleCompleteAndClose = () => {
    if (activity) {
      // Find today's plan item for this activity
      const planItem = (state.selfCarePlanItems || []).find(
        (p) => p.activityId === activity.id && p.localDate === today
      );
      if (planItem && planItem.status !== "completed") {
        toggleCarePlanItem(planItem.id);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/80 p-6 shadow-2xl text-center space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            {isAr ? "لحظة عناية هادئة" : "A Gentle Pause"}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Activity Title & Emoji */}
        <div className="space-y-2">
          <div className="inline-block p-4 rounded-3xl bg-pink-50 dark:bg-pink-950/40 text-4xl shadow-inner">
            {icon}
          </div>
          <h3 className="text-lg font-black text-ink">{title}</h3>
          <p className="text-xs text-ink-light">
            {isAr
              ? "استرخي وتنفسي بعمق دون استعجال."
              : "Breathe gently and let this moment belong to you."}
          </p>
        </div>

        {/* Timer Display */}
        <div className="py-3">
          <span className="text-5xl font-mono font-black text-ink tracking-tight">
            {timeFormatted}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isFinished ? (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-3.5 rounded-2xl bg-hotpink text-white shadow-rose-sm active:scale-95 transition-all"
                aria-label={isRunning ? "Pause" : "Resume"}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              </button>
              <button
                onClick={() => {
                  setSecondsRemaining(durationMin * 60);
                  setIsRunning(false);
                }}
                className="p-3.5 rounded-2xl bg-surface border border-border/60 text-ink-light hover:text-ink active:scale-95 transition-all"
                aria-label="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 size={20} />
              <span>{isAr ? "اكتملت مدة العناية ✨" : "Care pause complete ✨"}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium text-ink-light hover:text-ink hover:bg-surface"
          >
            {isAr ? "خروج" : "Exit"}
          </button>
          <button
            onClick={handleCompleteAndClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm active:scale-95"
          >
            {isAr ? "إتمام النشاط ✓" : "Mark Complete ✓"}
          </button>
        </div>
      </div>
    </div>
  );
};
