import React, { useState } from "react";
import { X, Check, Clock, Plus, Minus, Droplet, Hash } from "lucide-react";
import { type SelfCareBingoTile } from "@/lib/selfCareBingoEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile: SelfCareBingoTile | null;
  onSaveProgress: (tileId: string, value: number) => void;
}

export const BingoProgressModal: React.FC<BingoProgressModalProps> = ({
  isOpen,
  onClose,
  tile,
  onSaveProgress,
}) => {
  const { lang } = useLang();
  const isAr = lang === "ar";

  if (!isOpen || !tile) return null;

  const [currentVal, setCurrentVal] = useState<number>(tile.currentValue || 0);
  const targetVal = tile.targetValue || 1;
  const isDuration = tile.activityType === "duration";
  const isHydration = tile.activityType === "hydration";

  const step = isDuration ? 5 : 1;

  const handleIncrement = () => setCurrentVal((prev) => prev + step);
  const handleDecrement = () => setCurrentVal((prev) => Math.max(0, prev - step));

  const handleCompleteFull = () => {
    setCurrentVal(targetVal);
    onSaveProgress(tile.id, targetVal);
    onClose();
  };

  const handleSave = () => {
    onSaveProgress(tile.id, currentVal);
    onClose();
  };

  const displayTitle = (isAr && tile.titleAr) ? tile.titleAr : tile.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card border border-border/80 shadow-2xl p-5 text-ink animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tile.icon || "🌸"}</span>
            <div>
              <h3 className="text-sm font-bold text-ink">{displayTitle}</h3>
              <p className="text-[11px] text-ink-light">
                {isDuration
                  ? isAr ? `الهدف: ${targetVal} دقيقة` : `Target: ${targetVal} minutes`
                  : isHydration
                  ? isAr ? `الهدف: ${targetVal} أكواب ماء` : `Target: ${targetVal} cups`
                  : isAr ? `الهدف: ${targetVal}` : `Target: ${targetVal}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Counter Stepper */}
        <div className="my-6 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleDecrement}
              className="w-11 h-11 rounded-full border border-border/80 flex items-center justify-center text-ink hover:bg-surface active:scale-95 transition-all"
              aria-label="Decrease"
            >
              <Minus size={18} />
            </button>

            <div className="min-w-[100px] text-center">
              <span className="text-3xl font-black text-hotpink">{currentVal}</span>
              <span className="text-xs text-ink-light block font-medium">
                {isDuration ? (isAr ? "دقيقة" : "min") : isHydration ? (isAr ? "كوب" : "cups") : (isAr ? "إنجاز" : "units")}
              </span>
            </div>

            <button
              onClick={handleIncrement}
              className="w-11 h-11 rounded-full border border-border/80 flex items-center justify-center text-ink hover:bg-surface active:scale-95 transition-all"
              aria-label="Increase"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Quick presets for duration */}
          {isDuration && (
            <div className="flex items-center gap-2 mt-2">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setCurrentVal(mins)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border transition-all",
                    currentVal === mins
                      ? "bg-hotpink text-white border-hotpink"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCompleteFull}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold border border-pink-300 text-pink-700 bg-pink-50 hover:bg-pink-100 transition-all active:scale-95"
          >
            {isAr ? "إكمال بالكامل ✨" : "Mark as completed ✨"}
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-rose-sm hover:opacity-95 transition-all active:scale-95"
          >
            {isAr ? "حفظ التقدم" : "Save progress"}
          </button>
        </div>
      </div>
    </div>
  );
};
