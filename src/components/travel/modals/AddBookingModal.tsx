import React, { useState } from "react";
import { X, Ticket, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import type { BookingType, BookingStatus, PaymentStatus } from "@/lib/travelEngine";

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export function AddBookingModal({ isOpen, onClose, tripId }: AddBookingModalProps) {
  const { state, addTravelBooking } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const trip = (state.travelTrips || []).find((t) => t.id === tripId);

  const [type, setType] = useState<BookingType>("flight");
  const [providerName, setProviderName] = useState("");
  const [confirmationRef, setConfirmationRef] = useState("");
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [currency, setCurrency] = useState(trip?.primaryCurrency || "MAD");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("confirmed");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !providerName.trim()) return;
    setIsSubmitting(true);

    try {
      const amtMinor = estimatedAmount ? Math.round(parseFloat(estimatedAmount) * 100) : 0;

      addTravelBooking({
        tripId,
        type,
        providerName: providerName.trim(),
        confirmationReferenceEncryptedOrProtected: confirmationRef.trim() || undefined,
        departureLocation: departureLocation.trim() || undefined,
        arrivalLocation: arrivalLocation.trim() || undefined,
        startDateTime: startDateTime || undefined,
        currency,
        estimatedAmountMinor: amtMinor,
        paidAmountMinor: paymentStatus === "paid" ? amtMinor : 0,
        bookingStatus,
        paymentStatus,
        note: note.trim() || undefined,
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
            <Ticket size={16} className="text-purple-500" />
            <span>{t("addBookingBtn")}</span>
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
          {/* Booking Type */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "نوع الحجز" : "Booking Type"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BookingType)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              <option value="flight">{isAr ? "طيران" : "Flight"}</option>
              <option value="accommodation">{isAr ? "فندق / إقامة" : "Accommodation"}</option>
              <option value="train">{isAr ? "قطار" : "Train"}</option>
              <option value="bus">{isAr ? "حافلة" : "Bus"}</option>
              <option value="car_rental">{isAr ? "استئجار سيارة" : "Car Rental"}</option>
              <option value="activity">{isAr ? "جولة / تذكرة" : "Activity / Tour"}</option>
              <option value="restaurant">{isAr ? "مطعم" : "Restaurant"}</option>
              <option value="other">{isAr ? "أخرى" : "Other"}</option>
            </select>
          </div>

          {/* Provider Name */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "اسم مزود الخدمة *" : "Provider / Airline / Hotel *"}
            </label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. Royal Air Maroc, Booking.com, Airbnb"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* Confirmation Reference */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "رقم أو مرجع الحجز" : "Confirmation Reference"}
            </label>
            <input
              type="text"
              value={confirmationRef}
              onChange={(e) => setConfirmationRef(e.target.value)}
              placeholder="e.g. 7X9KLP"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink uppercase"
            />
          </div>

          {/* Statuses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "حالة الحجز" : "Booking Status"}
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
              >
                <option value="confirmed">{isAr ? "مؤكد" : "Confirmed"}</option>
                <option value="reserved">{isAr ? "محجوز مبدئياً" : "Reserved"}</option>
                <option value="planned">{isAr ? "مخطط له" : "Planned"}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "حالة الدفع" : "Payment Status"}
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
              >
                <option value="paid">{isAr ? "مدفوع بالكامل" : "Paid"}</option>
                <option value="partially_paid">{isAr ? "مدفوع جزئياً" : "Partially Paid"}</option>
                <option value="not_paid">{isAr ? "غير مدفوع" : "Not Paid"}</option>
              </select>
            </div>
          </div>

          {/* Estimated Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "المبلغ" : "Amount"}
              </label>
              <input
                type="number"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "العملة" : "Currency"}
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink uppercase"
              />
            </div>
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
              placeholder={isAr ? "تفاصيل المقعد أو الغرفة..." : "Seat, room type, luggage, etc."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !providerName.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "حفظ الحجز في الرحلة ✨" : "Save Booking to Trip ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
