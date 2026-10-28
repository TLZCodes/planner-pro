import React, { useState } from "react";
import { X, FileText, Shield, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { deriveDocumentStatus, type DocumentType } from "@/lib/travelEngine";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
}

export function AddDocumentModal({ isOpen, onClose, tripId }: AddDocumentModalProps) {
  const { addTravelDocument } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [type, setType] = useState<DocumentType>("passport");
  const [displayName, setDisplayName] = useState("");
  const [issuingCountry, setIssuingCountry] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !displayName.trim()) return;
    setIsSubmitting(true);

    try {
      const status = deriveDocumentStatus(expiryDate);

      addTravelDocument({
        tripId,
        type,
        displayName: displayName.trim(),
        issuingCountry: issuingCountry.trim() || undefined,
        expiryDate: expiryDate || undefined,
        status,
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
            <FileText size={16} className="text-hotpink" />
            <span>{t("addDocumentBtn")}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Reassurance Notice */}
        <div className="rounded-2xl bg-surface border border-border p-3 flex items-start gap-2 text-xs text-ink-light leading-relaxed">
          <Shield size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <p>
            {isAr
              ? "🔒 لأمانكِ وخصوصيتكِ، يُخزن تاريخ الانتهاء وبيانات الحالة فقط محلياً على جهازكِ، ولا يتم طلب أرقام الهويات أو الجوازات إطلاقاً."
              : "🔒 For privacy & safety, only expiry and validity status metadata are stored locally. Full document numbers are never requested."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Document Type */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "نوع الوثيقة" : "Document Type"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              <option value="passport">{isAr ? "جواز سفر" : "Passport"}</option>
              <option value="visa">{isAr ? "تأشيرة دخول (فيزا)" : "Visa"}</option>
              <option value="insurance">{isAr ? "تأمين سفر" : "Travel Insurance"}</option>
              <option value="ticket">{isAr ? "تذكرة طيران / قطار" : "Ticket"}</option>
              <option value="booking_confirmation">{isAr ? "تأكيد حجز" : "Booking Confirmation"}</option>
              <option value="emergency_contacts">{isAr ? "أرقام الطوارئ" : "Emergency Contacts"}</option>
              <option value="other">{isAr ? "أخرى" : "Other"}</option>
            </select>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "اسم الوثيقة أو التسمية *" : "Display Name *"}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Amina's Passport, Schengen Visa"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* Issuing Country */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الدولة المصدرة" : "Issuing Country"}
            </label>
            <input
              type="text"
              value={issuingCountry}
              onChange={(e) => setIssuingCountry(e.target.value)}
              placeholder="e.g. Morocco, Japan, France"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "تاريخ انتهاء الصلاحية" : "Expiry Date"}
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !displayName.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "حفظ الوثيقة بأمان ✨" : "Save Document Securely ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
