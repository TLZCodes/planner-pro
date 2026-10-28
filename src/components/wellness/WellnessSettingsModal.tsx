import React, { useState } from "react";
import { X, Settings, ShieldCheck, Download, Trash2, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { convertMlToOz, convertOzToMl, type WaterUnit } from "@/lib/wellnessEngine";

interface WellnessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WellnessSettingsModal: React.FC<WellnessSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useLang();
  const { state, updateWellnessSettings } = useApp();
  const isAr = lang === "ar";

  const currentSettings = state.wellnessSettings;
  const [unit, setUnit] = useState<WaterUnit>(currentSettings?.waterUnit || "ml");
  const [targetStr, setTargetStr] = useState(
    (currentSettings?.dailyWaterTarget || (unit === "oz" ? 68 : 2000)).toString()
  );
  const [cupSizeStr, setCupSizeStr] = useState(
    (currentSettings?.defaultDrinkAmount || (unit === "oz" ? 8 : 250)).toString()
  );
  const [stepGoalStr, setStepGoalStr] = useState(
    (currentSettings?.optionalStepGoal || 8000).toString()
  );

  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleUnitChange = (newUnit: WaterUnit) => {
    if (newUnit === unit) return;
    const currentTarget = parseFloat(targetStr) || 2000;
    const currentCup = parseFloat(cupSizeStr) || 250;

    if (newUnit === "oz") {
      setTargetStr(convertMlToOz(currentTarget).toString());
      setCupSizeStr(convertMlToOz(currentCup).toString());
    } else {
      setTargetStr(convertOzToMl(currentTarget).toString());
      setCupSizeStr(convertOzToMl(currentCup).toString());
    }
    setUnit(newUnit);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetStr) || (unit === "oz" ? 68 : 2000);
    const parsedCup = parseFloat(cupSizeStr) || (unit === "oz" ? 8 : 250);
    const parsedStep = parseInt(stepGoalStr, 10) || 8000;

    updateWellnessSettings({
      waterUnit: unit,
      dailyWaterTarget: parsedTarget,
      defaultDrinkAmount: parsedCup,
      optionalStepGoal: parsedStep,
    });

    onClose();
  };

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      wellnessSettings: state.wellnessSettings,
      hydrationEvents: state.hydrationEvents,
      sleepRecords: state.sleepRecords,
      dailyStepRecords: state.dailyStepRecords,
      workoutLogs: state.workoutLogs,
      careActivityLinks: state.careActivityLinks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ayxa-wellness-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl p-5 max-h-[85vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <Settings size={18} />
            </span>
            <h3 className="text-base font-bold text-ink">
              {t("wellnessSettingsTitle")}
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
          {/* Unit Setting */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">
              {t("waterUnitSetting")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUnitChange("ml")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  unit === "ml"
                    ? "bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-300 shadow-2xs font-bold"
                    : "bg-background border-border text-ink-muted hover:text-ink"
                }`}
              >
                {t("milliliters")}
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange("oz")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  unit === "oz"
                    ? "bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-300 shadow-2xs font-bold"
                    : "bg-background border-border text-ink-muted hover:text-ink"
                }`}
              >
                {t("fluidOunces")}
              </button>
            </div>
          </div>

          {/* Daily Water Target */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {t("dailyWaterGoalSetting")} ({unit === "oz" ? "oz" : "ml"})
            </label>
            <input
              type="number"
              step={unit === "oz" ? "1" : "50"}
              min="100"
              max="10000"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink"
              required
            />
          </div>

          {/* Default Cup Size */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {t("cupSizeSetting")} ({unit === "oz" ? "oz" : "ml"})
            </label>
            <input
              type="number"
              step={unit === "oz" ? "1" : "25"}
              min="50"
              max="2000"
              value={cupSizeStr}
              onChange={(e) => setCupSizeStr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink"
              required
            />
          </div>

          {/* Daily Step Goal */}
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">
              {t("stepGoalSetting")} ({isAr ? "خطوة" : "steps"})
            </label>
            <input
              type="number"
              step="500"
              min="1000"
              max="50000"
              value={stepGoalStr}
              onChange={(e) => setStepGoalStr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-ink"
              required
            />
          </div>

          {/* Privacy Assurance */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 leading-relaxed">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>{t("privacyAssurance")}</span>
          </div>

          {/* Data Export Button */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-ink hover:bg-card-hover transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>{isAr ? "تصدير بيانات العافية (JSON)" : "Export Wellness Data (JSON)"}</span>
            </button>
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
