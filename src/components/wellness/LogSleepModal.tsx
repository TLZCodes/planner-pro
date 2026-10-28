import React, { useState, useEffect } from "react";
import { X, Moon, Star, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import { calculateSleepDuration, formatSleepDuration } from "@/lib/wellnessEngine";

interface LogSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogSleepModal: React.FC<LogSleepModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, logSleepRecord } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const [mode, setMode] = useState<"times" | "duration">("times");
  const [bedtimeStr, setBedtimeStr] = useState("23:00");
  const [wakeTimeStr, setWakeTimeStr] = useState("07:00");
  const [durationHours, setDurationHours] = useState("8");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [note, setNote] = useState("");

  // Calculate duration from times
  const computedMinutes = React.useMemo(() => {
    if (mode === "duration") {
      const h = parseInt(durationHours) || 0;
      const m = parseInt(durationMinutes) || 0;
      return h * 60 + m;
    }
    // Mode times: calculate assuming bedtime yesterday night and wake today
    // E.g. 23:00 -> 07:00 is 8 hours
    const [bH, bM] = bedtimeStr.split(":").map(Number);
    const [wH, wM] = wakeTimeStr.split(":").map(Number);
    if (isNaN(bH) || isNaN(wH)) return 0;

    let totalMin = wH * 60 + wM - (bH * 60 + bM);
    if (totalMin <= 0) {
      totalMin += 24 * 60; // crossed midnight!
    }
    return totalMin;
  }, [mode, bedtimeStr, wakeTimeStr, durationHours, durationMinutes]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (computedMinutes <= 0) return;

    // Generate ISO timestamps
    const now = new Date();
    const [wH, wM] = wakeTimeStr.split(":").map(Number);
    const endDate = new Date(now);
    endDate.setHours(wH || 7, wM || 0, 0, 0);

    const startDate = new Date(endDate.getTime() - computedMinutes * 60 * 1000);

    logSleepRecord({
      sleepLocalDate: today,
      durationMinutes: computedMinutes,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      quality,
      note: note.trim() || undefined,
      sourceType: "manual",
      timezone: state.wellnessSettings?.timezone || "UTC",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Moon size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("sleepAnalysis")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-card-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Mode toggle */}
          <div className="flex p-1 rounded-xl bg-background border border-border">
            <button
              type="button"
              onClick={() => setMode("times")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "times"
                  ? "bg-indigo-500 text-white shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t("bedtime")} & {t("wakeTime")}
            </button>
            <button
              type="button"
              onClick={() => setMode("duration")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "duration"
                  ? "bg-indigo-500 text-white shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t("duration")}
            </button>
          </div>

          {mode === "times" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  {t("bedtime")}
                </label>
                <input
                  type="time"
                  value={bedtimeStr}
                  onChange={(e) => setBedtimeStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink text-center"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  {t("wakeTime")}
                </label>
                <input
                  type="time"
                  value={wakeTimeStr}
                  onChange={(e) => setWakeTimeStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink text-center"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  {isAr ? "الساعات" : "Hours"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink text-center"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">
                  {isAr ? "الدقائق" : "Minutes"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink text-center"
                  required
                />
              </div>
            </div>
          )}

          {/* Computed Duration Preview */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-xs font-medium text-ink-muted">
              {t("duration")}:
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {formatSleepDuration(computedMinutes, isAr)}
            </span>
          </div>

          {/* Quality Rating */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">
              {t("sleepQuality")}
            </label>
            <div className="flex items-center justify-around p-2 rounded-2xl bg-background border border-border">
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    quality === q
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-500 scale-110 shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                  title={`${q} / 5`}
                >
                  <Star size={18} fill={quality >= q ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          {/* Private Note */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {t("sleepNote")} ({isAr ? "اختياري" : "Optional"})
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "استيقظت بنشاط، شربت بابونج..." : "Felt rested, chamomile tea..."}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-ink placeholder:text-ink-muted/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-card-hover transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
