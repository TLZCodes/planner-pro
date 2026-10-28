import React, { useState } from "react";
import { X, Clock, MapPin, DollarSign, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import type { ActivityType } from "@/lib/travelEngine";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  defaultDayId?: string;
}

export function AddActivityModal({
  isOpen,
  onClose,
  tripId,
  defaultDayId,
}: AddActivityModalProps) {
  const { state, addItineraryItem } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const days = (state.travelDays || []).filter((d) => d.tripId === tripId);
  const trip = (state.travelTrips || []).find((t) => t.id === tripId);

  const [dayId, setDayId] = useState(defaultDayId || days[0]?.id || "");
  const [type, setType] = useState<ActivityType>("activity");
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentDay = days.find((d) => d.id === dayId) || days[0];
  const dateStr = currentDay?.localDate || trip?.startDate || new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim() || !dayId) return;
    setIsSubmitting(true);

    try {
      const amtMinor = estimatedCost ? Math.round(parseFloat(estimatedCost) * 100) : undefined;
      const startIso = allDay ? undefined : `${dateStr}T${startTime}`;
      const endIso = allDay ? undefined : `${dateStr}T${endTime}`;

      const existingItems = (state.itineraryItems || []).filter(
        (i) => i.tripId === tripId && i.travelDayId === dayId
      );

      addItineraryItem({
        tripId,
        travelDayId: dayId,
        type,
        title: title.trim(),
        allDay,
        startLocalDateTime: startIso,
        endLocalDateTime: endIso,
        timezone: trip?.destinationTimezone || "UTC",
        locationName: locationName.trim() || undefined,
        address: address.trim() || undefined,
        estimatedAmountMinor: amtMinor,
        currency: trip?.primaryCurrency || "MAD",
        note: note.trim() || undefined,
        status: "confirmed",
        order: existingItems.length,
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
            <Sparkles size={16} className="text-hotpink" />
            <span>{t("addActivityBtn")}</span>
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
          {/* Day selection */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "يوم الرحلة *" : "Trip Day *"}
            </label>
            <select
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              {days.map((d, i) => (
                <option key={d.id} value={d.id}>
                  {isAr ? `اليوم ${i + 1} (${d.localDate})` : `Day ${i + 1} (${d.localDate})`}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "نوع النشاط" : "Activity Type"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              <option value="activity">{isAr ? "نشاط أو جولة" : "Activity / Tour"}</option>
              <option value="food">{isAr ? "طعام ومطاعم" : "Food & Dining"}</option>
              <option value="flight">{isAr ? "طيران" : "Flight"}</option>
              <option value="accommodation">{isAr ? "إقامة أو فندق" : "Accommodation"}</option>
              <option value="transport">{isAr ? "تنقل ومواصلات" : "Transport"}</option>
              <option value="shopping">{isAr ? "تسوق" : "Shopping"}</option>
              <option value="rest">{isAr ? "راحة واستجمام" : "Rest & Relax"}</option>
              <option value="custom">{isAr ? "مخصص" : "Custom"}</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "اسم النشاط *" : "Activity Title *"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Arashiyama Bamboo Grove"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* All-day toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-bold text-ink-light">{t("allDay")}</span>
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
          </div>

          {/* Start and End Times (if not all day) */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-light block mb-1">
                  {isAr ? "وقت البداية" : "Start Time"}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-light block mb-1">
                  {isAr ? "وقت النهاية" : "End Time"}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
                />
              </div>
            </div>
          )}

          {/* Location Name & Address */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الموقع أو العنوان" : "Location or Address"}
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Sagatenryuji, Ukyo Ward, Kyoto"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "التكلفة التقديرية (اختياري)" : "Estimated Cost (Optional)"}
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
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
              placeholder={isAr ? "تذكير أو تذاكر..." : "Reminders, entry tickets, etc."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "حفظ النشاط في البرنامج ✨" : "Save Activity to Itinerary ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
