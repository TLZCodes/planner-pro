import React, { useState } from "react";
import { X, Activity, Flame } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import { WORKOUT_TYPES, type WorkoutActivityType } from "@/lib/wellnessEngine";

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, logWorkout } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const [activityType, setActivityType] = useState<WorkoutActivityType>("walking");
  const [durationStr, setDurationStr] = useState("30");
  const [intensity, setIntensity] = useState<"gentle" | "moderate" | "intense">("moderate");
  const [distanceStr, setDistanceStr] = useState("");
  const [caloriesStr, setCaloriesStr] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(durationStr, 10);
    if (isNaN(duration) || duration <= 0) return;

    const distance = distanceStr ? parseFloat(distanceStr) : undefined;
    const calories = caloriesStr ? parseInt(caloriesStr, 10) : undefined;

    logWorkout({
      localDate: today,
      activityType,
      durationMinutes: duration,
      intensity,
      distance: !isNaN(distance as number) ? distance : undefined,
      calories: !isNaN(calories as number) ? calories : undefined,
      note: note.trim() || undefined,
      sourceType: "manual",
      idempotencyKey: `manual_wkt_${Date.now()}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <Activity size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("logWorkout")}
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
          {/* Activity Type Selection */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-2">
              {t("activityType")}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {WORKOUT_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setActivityType(type.key)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    activityType === type.key
                      ? "bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 font-bold shadow-2xs"
                      : "bg-background border-border/60 text-ink-muted hover:text-ink hover:border-border"
                  }`}
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-[10px] mt-1 line-clamp-1">
                    {isAr ? type.labelAr.replace(/[^\p{L}\s]/gu, "") : type.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration in Minutes */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {t("duration")} ({isAr ? "دقيقة" : "minutes"})
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationStr(mins.toString())}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    durationStr === mins.toString()
                      ? "bg-rose-500 text-white shadow-2xs"
                      : "bg-background border border-border text-ink hover:bg-card-hover"
                  }`}
                >
                  {mins} {isAr ? "د" : "m"}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="600"
              value={durationStr}
              onChange={(e) => setDurationStr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink"
              required
            />
          </div>

          {/* Intensity */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">
              {t("intensity")}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { key: "gentle", label: t("intensityGentle") },
                  { key: "moderate", label: t("intensityModerate") },
                  { key: "intense", label: t("intensityIntense") },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIntensity(item.key)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    intensity === item.key
                      ? "bg-rose-50 border-rose-400 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 shadow-2xs"
                      : "bg-background border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Distance & Calories */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-ink-muted block mb-1">
                {t("distanceOptional")}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder={isAr ? "كم" : "km"}
                value={distanceStr}
                onChange={(e) => setDistanceStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-ink"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-muted block mb-1">
                {t("caloriesOptional")}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder={isAr ? "سعرة" : "kcal"}
                value={caloriesStr}
                onChange={(e) => setCaloriesStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-ink"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {isAr ? "ملاحظة خاصة" : "Private Note"}
            </label>
            <input
              type="text"
              placeholder={isAr ? "شعور خفيف ومنعش في الهواء الطلق..." : "Outdoor park walk, brisk pace..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
