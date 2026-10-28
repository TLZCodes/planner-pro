import React, { useState, memo } from "react";
import { Lock, Fingerprint, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { hashPin, setFinanceSessionUnlocked } from "@/lib/financeSecurity";

export interface FinanceLockOverlayProps {
  onUnlock: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceLockOverlay = memo(function FinanceLockOverlay({
  onUnlock,
  isAr,
  t,
}: FinanceLockOverlayProps) {
  const { state } = useApp();
  const settings = state.financeSettings || { financeLockEnabled: false };
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      const hashed = await hashPin(nextPin);
      if (hashed === settings.pinHash) {
        setFinanceSessionUnlocked(true);
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas p-6 animate-fade-in text-ink select-none">
      <div className="flex flex-col items-center space-y-4 max-w-xs w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl grad-theme text-white shadow-rose-md">
          <Lock size={28} />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-ink">{t("financeLocked")}</h2>
          <p className="text-xs font-semibold text-ink-light mt-1">{t("enterPin")}</p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3.5 py-4">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full transition-all ${
                  error
                    ? "bg-destructive scale-110 animate-shake"
                    : filled
                    ? "grad-theme scale-110 shadow-rose-sm"
                    : "bg-surface border border-border"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-bold text-destructive animate-fade-in">
            {t("wrongPin")}
          </p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="cursor-pointer flex h-14 w-full items-center justify-center rounded-2xl bg-card border border-border/80 text-lg font-mono font-extrabold text-ink shadow-xs hover:border-hotpink active:scale-90 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="cursor-pointer flex h-14 w-full items-center justify-center rounded-2xl bg-card border border-border/80 text-lg font-mono font-extrabold text-ink shadow-xs hover:border-hotpink active:scale-90 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteDigit}
            aria-label="Delete digit"
            className="cursor-pointer flex h-14 w-full items-center justify-center rounded-2xl bg-surface border border-border/80 text-sm font-bold text-ink-light hover:text-ink active:scale-90 transition-all"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
});
