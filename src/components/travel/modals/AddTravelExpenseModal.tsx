import React, { useState } from "react";
import { X, PiggyBank, Sparkles, CreditCard } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { DEFAULT_BUDGET_CATEGORIES } from "@/lib/travelEngine";

interface AddTravelExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export function AddTravelExpenseModal({
  isOpen,
  onClose,
  tripId,
}: AddTravelExpenseModalProps) {
  const { state, recordTravelExpense } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const accounts = state.financeAccounts || [];
  const trip = (state.travelTrips || []).find((t) => t.id === tripId);

  const [amountStr, setAmountStr] = useState("");
  const [merchant, setMerchant] = useState("");
  const [categoryId, setCategoryId] = useState("food");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !amountStr.trim() || !merchant.trim()) return;
    setIsSubmitting(true);

    try {
      recordTravelExpense({
        tripId,
        amountStr: amountStr.trim(),
        merchantOrSource: merchant.trim(),
        categoryId,
        accountId: accountId || accounts[0]?.id || "acc_default",
        date,
        note: note.trim() || undefined,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <PiggyBank size={16} className="text-amber-500" />
            <span>{t("addTravelExpenseBtn")}</span>
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
          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "المبلغ *" : "Amount *"} ({trip?.primaryCurrency || "MAD"})
            </label>
            <input
              type="number"
              step="any"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-base font-black text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* Place or Merchant */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الجهة أو المحل *" : "Merchant / Venue / Place *"}
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Kyoto Station Café, Hotel, Metro ticket"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "بند السفر" : "Travel Category"}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              {DEFAULT_BUDGET_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {isAr ? cat.labelAr : cat.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Finance Account */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1 flex items-center gap-1">
              <CreditCard size={12} />
              <span>{isAr ? "حساب الدفع في المالية" : "Paid from Account (Finance)"}</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "التاريخ" : "Date"}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
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
              placeholder={isAr ? "تفاصيل إضافية..." : "Add details..."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          {/* Reassurance note */}
          <div className="rounded-2xl bg-surface border border-border p-3 text-[11px] text-ink-light leading-relaxed">
            {isAr
              ? "🔒 سيتم تسجيل هذه المعاملة مباشرة في سجلكِ المالي العام وربطها بهذه الرحلة تلقائياً."
              : "🔒 This records a real transaction in your Finance ledger and automatically links it to this trip."}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amountStr.trim() || !merchant.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-amber-500 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "تسجيل المصروف في المالية ✨" : "Record Expense in Finance ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
