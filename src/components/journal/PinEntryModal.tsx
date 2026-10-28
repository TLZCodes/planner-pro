import React, { memo } from "react";
import { Lock, X, KeyRound } from "lucide-react";
import { type JournalEntry } from "@/lib/store";

export interface PinEntryModalProps {
  isOpen: boolean;
  pendingEntry: JournalEntry | null;
  pinInput: string;
  setPinInput: (val: string) => void;
  pinError: string;
  isAr: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

export const PinEntryModal = memo(function PinEntryModal({
  isOpen,
  pendingEntry,
  pinInput,
  setPinInput,
  pinError,
  isAr,
  onVerify,
  onCancel,
}: PinEntryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border p-5 space-y-4 shadow-2xl text-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-hotpink text-2xl mx-auto border border-pink-500/20">
          <KeyRound className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-ink">
            {isAr ? "تدوينة مقفلة 🔒" : "Locked Entry 🔒"}
          </h3>
          <p className="text-[11px] font-semibold text-ink-light mt-0.5">
            {isAr ? "أدخلي رمز المرور لفتح هذه التدوينة الخاصة" : "Enter your PIN to read this private entry"}
          </p>
        </div>

        <input
          type="password"
          maxLength={8}
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onVerify();
          }}
          placeholder="••••"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full text-center text-xl tracking-widest font-black rounded-2xl bg-surface border border-border py-3 text-ink outline-none focus:border-hotpink shadow-inner"
        />

        {pinError && (
          <p className="text-xs font-bold text-rose-500 animate-shake">{pinError}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-ink-light hover:bg-surface"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onVerify}
            className="cursor-pointer flex-1 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose-md hover:brightness-110"
          >
            {isAr ? "فتح التدوينة" : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
});
