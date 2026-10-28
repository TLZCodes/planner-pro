import React, { useState, useEffect } from "react";
import { X, CreditCard, Building2, CheckCircle2 } from "lucide-react";
import {
  useApp,
  toMinorUnits,
  fromMinorUnits,
  formatMoney,
  calculateInvoiceFinancials,
} from "@/lib/store";

export interface BusinessPaymentModalProps {
  open: boolean;
  onClose: () => void;
  defaultInvoiceId?: string;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessPaymentModal({
  open,
  onClose,
  defaultInvoiceId,
  isAr,
  t,
}: BusinessPaymentModalProps) {
  const { state, recordBusinessInvoicePayment } = useApp();
  const invoices = state.businessInvoices || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const transactions = state.financialTransactions || [];
  const accounts = (state.financeAccounts || []).filter((a) => !a.archivedAt);
  const baseCurrency = state.financeSettings?.baseCurrency || state.prefs?.currency || "MAD";

  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId || "");
  const [amount, setAmount] = useState("");
  const [financeAccountId, setFinanceAccountId] = useState(accounts[0]?.id || "");
  const [localDate, setLocalDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  useEffect(() => {
    if (open) {
      const invId = defaultInvoiceId || invoices.find((i) => i.status !== "paid" && i.status !== "cancelled")?.id || "";
      setInvoiceId(invId);
      setFinanceAccountId(accounts[0]?.id || "");
      setLocalDate(new Date().toISOString().slice(0, 10));
      setNote("");

      if (invId) {
        const inv = invoices.find((i) => i.id === invId);
        if (inv) {
          const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
          setAmount(fromMinorUnits(fin.outstandingMinor).toString());
        }
      }
    }
  }, [open, defaultInvoiceId]);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
      setAmount(fromMinorUnits(fin.outstandingMinor).toString());
    }
  };

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !financeAccountId) return;

    const amountMinor = toMinorUnits(parseFloat(amount) || 0);
    if (amountMinor <= 0) return;

    recordBusinessInvoicePayment({
      invoiceId,
      amountMinor,
      financeAccountId,
      localDate,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">{t("recordPaymentBtn")}</h3>
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
              {isAr ? "الفاتورة المستهدفة *" : "Target Invoice *"}
            </label>
            <select
              required
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
            >
              <option value="">{isAr ? "-- اختاري الفاتورة --" : "-- Select invoice --"}</option>
              {invoices.map((inv) => {
                const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
                return (
                  <option key={inv.id} value={inv.id}>
                    #{inv.invoiceNumber} - {formatMoney(inv.totalMinor, inv.currency || baseCurrency, false, "en-US", isAr)} ({fin.derivedStatus})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "المبلغ المقبوض *" : "Amount Received *"}
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "تاريخ القبض" : "Payment Date"}
              </label>
              <input
                type="date"
                required
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "الحساب البنكي / النقدي المستلم (من المالية) *" : "Destination Finance Account *"}
            </label>
            <select
              required
              value={financeAccountId}
              onChange={(e) => setFinanceAccountId(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) - {acc.currency}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-ink-light mt-1">
              {isAr
                ? "سيتم تسجيل هذه الدفعة تلقائيًا كحركة إيراد في دفتر المالية الحقيقي."
                : "This payment will automatically be recorded as income in your canonical Finance ledger."}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "ملاحظة" : "Note"}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "مثال: تحويل بنكي رقم #123" : "e.g. Bank transfer ref #123"}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-gold"
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
              className="cursor-pointer flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              {isAr ? "تسجيل الدفعة" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
