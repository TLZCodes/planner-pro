import React, { useState } from "react";
import { X, CheckCircle2, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import type { ChecklistCategory } from "@/lib/travelEngine";

interface AddChecklistItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export function AddChecklistItemModal({
  isOpen,
  onClose,
  tripId,
}: AddChecklistItemModalProps) {
  const { state, addTravelChecklistItem } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>("packing");
  const [required, setRequired] = useState(true);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    setIsSubmitting(true);

    try {
      const existingItems = (state.travelChecklistItems || []).filter((c) => c.tripId === tripId);

      addTravelChecklistItem({
        tripId,
        title: title.trim(),
        category,
        required,
        completed: false,
        note: note.trim() || undefined,
        order: existingItems.length,
        contributionMode: "checklist_only",
      });

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
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{t("addChecklistItemBtn")}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "البند *" : "Item Title *"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Travel adapter, Passport copy, Sunscreen"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "القسم" : "Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ChecklistCategory)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              <option value="packing">{isAr ? "تجهيز الحقيبة" : "Packing"}</option>
              <option value="documents">{isAr ? "الوثائق" : "Documents"}</option>
              <option value="bookings">{isAr ? "الحجوزات" : "Bookings"}</option>
              <option value="health">{isAr ? "الصحة والأدوية" : "Health"}</option>
              <option value="money">{isAr ? "المال والبطاقات" : "Money"}</option>
              <option value="before_leaving">{isAr ? "قبل المغادرة" : "Before Leaving"}</option>
              <option value="during_travel">{isAr ? "أثناء السفر" : "During Travel"}</option>
              <option value="custom">{isAr ? "مخصص" : "Custom"}</option>
            </select>
          </div>

          {/* Required toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
            <div>
              <p className="text-xs font-bold text-ink">{isAr ? "بند ضروري للتحضير" : "Required Item"}</p>
              <p className="text-[10px] text-ink-light">
                {isAr ? "يؤثر في نسبة الجاهزية والتحضير" : "Counts toward honest preparation percentage"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "ملاحظة خاصة" : "Private Note"}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "ملاحظة إضافية..." : "Add details..."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "إضافة البند للقائمة ✨" : "Add Item to Checklist ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
