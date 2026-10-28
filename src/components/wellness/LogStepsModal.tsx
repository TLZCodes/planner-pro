import React, { useState } from "react";
import { X, Footprints } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";

interface LogStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogStepsModal: React.FC<LogStepsModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, logStepRecord } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const existing = state.dailyStepRecords?.[today]?.stepCount || 0;
  const [stepsStr, setStepsStr] = useState(existing > 0 ? existing.toString() : "5000");

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(stepsStr, 10);
    if (isNaN(count) || count < 0) return;
    logStepRecord(today, count, "manual");
    onClose();
  };

  const presetSteps = [2000, 5000, 8000, 10000];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <Footprints size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("movementSteps")}
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
          {/* Quick presets */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-2">
              {t("quickAdd")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetSteps.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStepsStr(p.toString())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    stepsStr === p.toString()
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-background border border-border/70 text-ink hover:border-emerald-300"
                  }`}
                >
                  {p.toLocaleString()} {isAr ? "خطوة" : "steps"}
                </button>
              ))}
            </div>
          </div>

          {/* Steps Input */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">
              {isAr ? "عدد الخطوات اليومية" : "Daily Step Count"}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                value={stepsStr}
                onChange={(e) => setStepsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-emerald-500 focus:outline-none text-base font-bold text-ink"
                required
              />
              <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">
                {isAr ? "خطوة" : "steps"}
              </span>
            </div>
          </div>

          {/* Source Notice */}
          <div className="p-2.5 rounded-xl bg-background border border-border/60 text-[11px] text-ink-muted leading-relaxed">
            {t("sourceHealthOff")}
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
