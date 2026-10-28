import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, Camera } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";

interface TripCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
}

export function TripCompletionModal({
  isOpen,
  onClose,
  tripId,
}: TripCompletionModalProps) {
  const { state, completeTravelTrip, addTravelMemory } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const trip = (state.travelTrips || []).find((t) => t.id === tripId);

  const [caption, setCaption] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !trip) return null;

  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      completeTravelTrip(trip.id);

      if (caption.trim()) {
        addTravelMemory({
          tripId: trip.id,
          localDate: new Date().toISOString().slice(0, 10),
          caption: caption.trim(),
          reflection: reflection.trim() || undefined,
        });
      }

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
            <CheckCircle2 size={16} className="text-amber-500" />
            <span>{isAr ? "إنهاء الرحلة وحفظ الذكريات" : "Wrap Up Trip & Save Memories"}</span>
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
            ? `هل ترغبين في نقل رحلة "${trip.title || trip.primaryCity}" إلى سجل الرحلات السابقة؟ يمكنكِ تدوين لحظتكِ المفضلة أو خاطرة دافئة عن الرحلة الآن.`
            : `Would you like to move "${trip.title || trip.primaryCity}" to your Past Journeys archive? You can record your favorite memory or reflection now.`}
        </p>

        {/* Memory caption */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "لحظة مفضلة أو عنوان للذكرى (اختياري)" : "Favorite Moment / Caption (Optional)"}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isAr ? "مثال: غروب الشمس الهادئ، فنجان الشاي الدافئ..." : "Golden hour, peaceful stroll..."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "خاطرة خاصة أو انطباع (اختياري)" : "Private Reflection (Optional)"}
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder={isAr ? "كيف كانت مشاعركِ وماذا تعلمتِ من هذه الرحلة؟" : "How did this trip inspire or restore you?"}
              className="w-full rounded-2xl bg-surface p-3 text-xs text-ink outline-none border border-border focus:border-hotpink resize-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {isAr ? "تأكيد إكمال الرحلة وحفظها ✨" : "Confirm Completion & Archive ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
