import React, { useState } from "react";
import { X, Calendar, MapPin, DollarSign, CheckSquare, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CHECKLIST_TEMPLATES, type TripStatus } from "@/lib/travelEngine";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (tripId: string) => void;
  initialDestination?: string;
}

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  initialDestination = "",
}: CreateTripModalProps) {
  const { state, createTravelTrip, importChecklistTemplate } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Destination
  const [city, setCity] = useState(initialDestination);
  const [title, setTitle] = useState(initialDestination);
  const [countryCode, setCountryCode] = useState("");

  // Step 2: Dates
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [travelerCount, setTravelerCount] = useState(1);
  const [destinationTimezone, setDestinationTimezone] = useState("UTC");

  // Step 3: Planning & Budget
  const [budgetStr, setBudgetStr] = useState("5000");
  const [currency, setCurrency] = useState(state.prefs?.currency || "MAD");
  const [status, setStatus] = useState<TripStatus>("planning");
  const [notes, setNotes] = useState("");

  // Step 4: Templates
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("international_trip");

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !city.trim()) return;
    if (step < 4) setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleCreate = () => {
    if (isSubmitting || !city.trim() || !startDate || !endDate) return;
    setIsSubmitting(true);

    try {
      const budgetMinor = Math.max(0, Math.round(parseFloat(budgetStr || "0") * 100));

      const newTripId = createTravelTrip({
        title: title.trim() || city.trim(),
        primaryCity: city.trim(),
        countryCode: countryCode.trim() || undefined,
        startDate,
        endDate,
        destinationTimezone,
        travelerCount: Math.max(1, travelerCount),
        status,
        primaryCurrency: currency,
        estimatedBudgetMinor: budgetMinor,
        notes: notes.trim() || undefined,
      });

      // Import selected template items
      const template = CHECKLIST_TEMPLATES.find((tpl) => tpl.id === selectedTemplateId);
      if (template) {
        importChecklistTemplate(
          newTripId,
          template.items.map((item) => ({
            category: item.category,
            title: isAr ? item.titleAr : item.titleEn,
            required: item.required,
          }))
        );
      }

      onTripCreated(newTripId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
              <Sparkles size={16} className="text-hotpink" />
              <span>{t("createTripBtn")}</span>
            </h3>
            <p className="text-[11px] text-ink-light">
              {isAr ? `الخطوة ${step} من 4` : `Step ${step} of 4`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── STEP 1: DESTINATION ── */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "المدينة أو الوجهة *" : "Destination City *"}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (!title || title === city) setTitle(e.target.value);
                }}
                placeholder="e.g. Kyoto, Paris, Istanbul"
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "عنوان الرحلة" : "Trip Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spring in Kyoto 🌸"
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "رمز الدولة أو الدولة" : "Country Code / Country"}
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="e.g. Japan, France, Morocco"
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: DATES & TRAVELERS ── */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-light block mb-1">
                  {isAr ? "تاريخ البداية *" : "Start Date *"}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl bg-surface px-3 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-light block mb-1">
                  {isAr ? "تاريخ النهاية *" : "End Date *"}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl bg-surface px-3 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "عدد المسافرين" : "Number of Travelers"}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={travelerCount}
                onChange={(e) => setTravelerCount(parseInt(e.target.value) || 1)}
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: PLANNING & BUDGET ── */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-light block mb-1">
                  {isAr ? "الميزانية التقديرية" : "Estimated Budget"}
                </label>
                <input
                  type="number"
                  value={budgetStr}
                  onChange={(e) => setBudgetStr(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
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

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "حالة الرحلة" : "Trip Status"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TripStatus)}
                className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
              >
                <option value="planning">{t("statusPlanning")}</option>
                <option value="booked">{t("statusBooked")}</option>
                <option value="in_progress">{t("statusInProgress")}</option>
                <option value="wishlist">{t("statusWishlist")}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "ملاحظات خاصة" : "Private Notes"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={isAr ? "ملاحظات أو أفكار عن الرحلة..." : "Ideas, packing reminders, etc."}
                className="w-full rounded-2xl bg-surface p-3 text-xs text-ink outline-none border border-border focus:border-hotpink resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: PREPARATION TEMPLATES & CONFIRMATION ── */}
        {step === 4 && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-xs font-bold text-ink block">
              {isAr ? "اختيار قالب التحضيرات الأولية" : "Select Initial Checklist Template"}
            </label>

            <div className="space-y-2">
              {CHECKLIST_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl p-3 border text-xs transition-all space-y-1",
                    selectedTemplateId === tpl.id
                      ? "border-hotpink bg-hotpink/10 text-hotpink shadow-xs"
                      : "border-border bg-surface text-ink-light hover:text-ink"
                  )}
                >
                  <p className="font-bold text-ink">{isAr ? tpl.nameAr : tpl.nameEn}</p>
                  <p className="text-[11px] text-ink-light">
                    {isAr ? tpl.descriptionAr : tpl.descriptionEn} ({tpl.items.length} items)
                  </p>
                </div>
              ))}
            </div>

            {/* Summary preview */}
            <div className="rounded-2xl bg-card border border-border p-3 text-xs space-y-1 mt-2">
              <p className="font-bold text-ink">{title || city}</p>
              <p className="text-ink-light text-[11px]">
                {startDate} → {endDate} • Budget: {budgetStr} {currency}
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-ink-light hover:text-ink px-3 py-2"
            >
              <ChevronLeft size={16} className={isAr ? "rotate-180" : ""} />
              <span>{isAr ? "السابق" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !city.trim()}
              className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-hotpink px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              <ChevronRight size={16} className={isAr ? "rotate-180" : ""} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>{isAr ? "تأكيد وإنشاء الرحلة ✨" : "Confirm & Create Trip ✨"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
