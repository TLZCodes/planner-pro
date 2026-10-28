import React, { useState, useEffect } from "react";
import { X, Settings, Briefcase, Building } from "lucide-react";
import { useApp, DEFAULT_BUSINESS_PROFILE } from "@/lib/store";

export interface BusinessSettingsModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessSettingsModal({ open, onClose, isAr, t }: BusinessSettingsModalProps) {
  const { state, updateBusinessProfile } = useApp();
  const profile = state.businessProfile || DEFAULT_BUSINESS_PROFILE;

  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerDisplayName, setOwnerDisplayName] = useState(profile.ownerDisplayName || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");
  const [invoicePrefix, setInvoicePrefix] = useState(profile.invoicePrefix);
  const [nextInvoiceSequence, setNextInvoiceSequence] = useState(profile.nextInvoiceSequence.toString());
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(profile.defaultPaymentTerms || "");

  useEffect(() => {
    if (open) {
      setBusinessName(profile.businessName);
      setOwnerDisplayName(profile.ownerDisplayName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setInvoicePrefix(profile.invoicePrefix);
      setNextInvoiceSequence(profile.nextInvoiceSequence.toString());
      setDefaultPaymentTerms(profile.defaultPaymentTerms || "");
    }
  }, [open, profile]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      businessName: businessName.trim() || "My Studio",
      ownerDisplayName: ownerDisplayName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      invoicePrefix: invoicePrefix.trim() || "INV-",
      nextInvoiceSequence: parseInt(nextInvoiceSequence, 10) || 1001,
      defaultPaymentTerms: defaultPaymentTerms.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Settings size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">
              {isAr ? "إعدادات وهوية العمل" : "Business Settings"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-ink-light hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "اسم العمل أو الاستوديو *" : "Business / Studio Name *"}
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "الاسم الشخصي" : "Owner Name"}
              </label>
              <input
                type="text"
                value={ownerDisplayName}
                onChange={(e) => setOwnerDisplayName(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "الهاتف" : "Phone"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "البريد الإلكتروني للعمل" : "Business Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "العنوان أو المدينة" : "Address / Location"}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "بادئة الفواتير" : "Invoice Prefix"}
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "الرقم التسلسلي القادم" : "Next Sequence #"}
              </label>
              <input
                type="number"
                value={nextInvoiceSequence}
                onChange={(e) => setNextInvoiceSequence(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "شروط الدفع الافتراضية للفواتير" : "Default Payment Terms"}
            </label>
            <textarea
              rows={2}
              value={defaultPaymentTerms}
              onChange={(e) => setDefaultPaymentTerms(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 rounded-2xl bg-surface border border-border py-2.5 text-xs font-bold text-ink-light hover:text-ink"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 rounded-2xl grad-theme py-2.5 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
            >
              {isAr ? "حفظ الإعدادات" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
