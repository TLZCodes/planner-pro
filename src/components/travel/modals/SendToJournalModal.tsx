import React, { useState } from "react";
import { X, BookOpen, Sparkles, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";

interface SendToJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId: string | null;
}

export function SendToJournalModal({
  isOpen,
  onClose,
  memoryId,
}: SendToJournalModalProps) {
  const { state, sendTravelMemoryToJournal } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const memory = (state.travelMemories || []).find((m) => m.id === memoryId);
  const trip = memory ? (state.travelTrips || []).find((t) => t.id === memory.tripId) : null;
  const tripTitle = trip?.primaryCity || trip?.title || "Travel";

  const [title, setTitle] = useState(
    memory ? `✈️ ${tripTitle}: ${memory.caption}` : "✈️ Trip Memory"
  );
  const [body, setBody] = useState(memory?.reflection || memory?.caption || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !memory) return null;

  const handleConfirm = () => {
    if (isSubmitting || !body.trim()) return;
    setIsSubmitting(true);
    try {
      sendTravelMemoryToJournal(memory.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface-cream text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <BookOpen size={16} className="text-hotpink" />
            <span>{t("sendToJournalBtn")}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-ink-light leading-relaxed">
          {isAr
            ? "راجعي المسودة أدناه قبل إضافتها إلى مفكرتكِ ويومياتكِ الخاصة."
            : "Review and edit the journal entry preview below before confirming."}
        </p>

        {/* Formatted Journal Preview */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3 shadow-xs">
          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "عنوان اليومية" : "Journal Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "نص الخاطرة أو الذكرى" : "Entry Body / Reflection"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-surface p-3 text-xs text-ink outline-none border border-border focus:border-hotpink resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-light pt-1 border-t border-border/40">
            <span>
              {isAr ? "تاريخ اليومية" : "Entry Date"}: {memory.localDate}
            </span>
            <span className="font-bold text-hotpink">#Travel #{tripTitle}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !body.trim()}
            className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {isAr ? "تأكيد الإرسال لليوميات 📖" : "Confirm & Add to Journal 📖"}
          </button>
        </div>
      </div>
    </div>
  );
}
