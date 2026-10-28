import React, { useState } from "react";
import { X, Droplets, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

interface AddHydrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHydrationModal: React.FC<AddHydrationModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, addHydrationEvent } = useApp();
  const isAr = lang === "ar";

  const unit = state.wellnessSettings?.waterUnit || "ml";
  const [amountStr, setAmountStr] = useState(
    unit === "oz" ? "8" : "250"
  );
  const [sourceType, setSourceType] = useState<"manual" | "habit" | "routine" | "selfcare">("manual");

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return;
    addHydrationEvent(parsed, unit, sourceType);
    onClose();
  };

  const presetAmounts = unit === "oz" ? [4, 8, 12, 16, 24] : [150, 250, 350, 500, 750];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
              <Droplets size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("addCustomWater")}
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
          {/* Presets */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-2">
              {t("quickAdd")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountStr(amt.toString())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    amountStr === amt.toString()
                      ? "bg-sky-500 text-white shadow-xs"
                      : "bg-background border border-border/70 text-ink hover:border-sky-300"
                  }`}
                >
                  +{amt} {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">
              {t("waterIntake")} ({unit === "oz" ? "oz" : (isAr ? "مليلتر" : "ml")})
            </label>
            <div className="relative">
              <input
                type="number"
                step={unit === "oz" ? "0.5" : "10"}
                min="1"
                max="5000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-sky-500 focus:outline-none text-sm font-bold text-ink"
                required
              />
              <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">
                {unit === "oz" ? "oz" : (isAr ? "مل" : "ml")}
              </span>
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>{t("save")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
