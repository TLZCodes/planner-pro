import React, { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, Calendar } from "lucide-react";
import {
  useApp,
  formatMoney,
  toMinorUnits,
  fromMinorUnits,
  calculateInvoiceTotals,
  type InvoiceLineItem,
} from "@/lib/store";

export interface BusinessInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

interface TempLineItem {
  offerId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function BusinessInvoiceModal({ open, onClose, isAr, t }: BusinessInvoiceModalProps) {
  const { state, addBusinessInvoice } = useApp();
  const clients = state.businessClients || [];
  const projects = state.businessProjects || [];
  const offers = state.businessOffers || [];
  const profile = state.businessProfile || {
    invoicePrefix: "INV-",
    nextInvoiceSequence: 1001,
    defaultPaymentTerms: "Payment due within 14 days.",
    defaultCurrency: "MAD",
  };
  const baseCurrency = state.financeSettings?.baseCurrency || profile.defaultCurrency || "MAD";

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueDefault = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(dueDefault);
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [terms, setTerms] = useState("");
  const [lineItems, setLineItems] = useState<TempLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    if (open) {
      setInvoiceNumber(`${profile.invoicePrefix}${profile.nextInvoiceSequence}`);
      setClientId(clients[0]?.id || "");
      setProjectId("");
      setIssueDate(todayStr);
      setDueDate(dueDefault);
      setDiscount("");
      setTax("");
      setTerms(profile.defaultPaymentTerms || "");
      setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    }
  }, [open]);

  if (!open) return null;

  // Calculate live totals
  const itemsForCalc = lineItems.map((li) => ({
    quantityDecimal: li.quantity,
    unitPriceMinor: toMinorUnits(li.unitPrice),
  }));
  const discountMinor = toMinorUnits(parseFloat(discount) || 0);
  const taxMinor = toMinorUnits(parseFloat(tax) || 0);
  const totals = calculateInvoiceTotals(itemsForCalc, discountMinor, taxMinor);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleSelectOffer = (idx: number, offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;
    const updated = [...lineItems];
    updated[idx] = {
      offerId,
      description: offer.title,
      quantity: 1,
      unitPrice: fromMinorUnits(offer.priceMinor),
    };
    setLineItems(updated);
  };

  const handleUpdateItem = (idx: number, field: keyof TempLineItem, val: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setLineItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !invoiceNumber.trim() || lineItems.length === 0) return;

    const formattedItems: Array<Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt">> =
      lineItems.map((li, idx) => ({
        offerId: li.offerId,
        descriptionSnapshot: li.description.trim() || "Item",
        quantityDecimal: li.quantity,
        unitPriceMinor: toMinorUnits(li.unitPrice),
        subtotalMinor: Math.round(li.quantity * toMinorUnits(li.unitPrice)),
        order: idx,
      }));

    addBusinessInvoice(
      {
        invoiceNumber: invoiceNumber.trim(),
        clientId,
        projectId: projectId || undefined,
        currency: baseCurrency,
        issueDate,
        dueDate,
        subtotalMinor: totals.subtotalMinor,
        discountMinor: totals.discountMinor,
        taxMinor: totals.taxMinor,
        totalMinor: totals.totalMinor,
        status: "draft",
        terms: terms.trim() || undefined,
      },
      formattedItems
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">{t("createInvoiceBtn")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-ink-light hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "رقم الفاتورة *" : "Invoice # *"}
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "العميل *" : "Client *"}
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              >
                <option value="">{isAr ? "-- اختاري العميل --" : "-- Select client --"}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "المشروع المرتبط" : "Project"}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-2.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              >
                <option value="">{isAr ? "-- اختياري --" : "-- None --"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "تاريخ الإصدار" : "Issue Date"}
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-2 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "تاريخ الاستحقاق" : "Due Date"}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-2 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-ink-light">
                {isAr ? "بنود الفاتورة" : "Line Items"}
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="cursor-pointer text-[11px] font-bold text-gold hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>{isAr ? "إضافة بند" : "Add item"}</span>
              </button>
            </div>

            {lineItems.map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-surface p-2.5 space-y-2 border border-border/50">
                {offers.length > 0 && (
                  <select
                    value={item.offerId || ""}
                    onChange={(e) => handleSelectOffer(idx, e.target.value)}
                    className="w-full rounded-xl bg-card border border-border px-2.5 py-1 text-[11px] font-semibold text-ink-light outline-none"
                  >
                    <option value="">{isAr ? "أو اختاري من العروض الجاهزة..." : "Or choose from offers..."}</option>
                    {offers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ({fromMinorUnits(o.priceMinor)} {baseCurrency})
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                    placeholder={isAr ? "وصف البند أو الخدمة..." : "Item description..."}
                    className="flex-1 rounded-xl bg-card border border-border px-3 py-1.5 text-xs font-medium text-ink outline-none focus:border-gold"
                  />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                    placeholder="Qty"
                    className="w-14 rounded-xl bg-card border border-border px-2 py-1.5 text-xs font-mono text-center font-medium text-ink outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                    className="w-20 rounded-xl bg-card border border-border px-2 py-1.5 text-xs font-mono text-end font-medium text-ink outline-none"
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="rounded-2xl bg-surface p-3.5 space-y-2 text-xs font-semibold text-ink-light">
            <div className="flex justify-between">
              <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
              <span className="font-mono font-bold text-ink">
                {formatMoney(totals.subtotalMinor, baseCurrency, false, "en-US", isAr)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
              <div>
                <label className="text-[10px] text-ink-light block">{isAr ? "الخصم" : "Discount"}</label>
                <input
                  type="number"
                  step="any"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-card border border-border px-2 py-1 text-xs font-mono outline-none text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-light block">{isAr ? "الضريبة" : "Tax"}</label>
                <input
                  type="number"
                  step="any"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-card border border-border px-2 py-1 text-xs font-mono outline-none text-ink"
                />
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-border text-sm font-extrabold text-ink">
              <span>{isAr ? "الإجمالي النهائي:" : "Grand Total:"}</span>
              <span className="font-mono text-base text-gold">
                {formatMoney(totals.totalMinor, baseCurrency, false, "en-US", isAr)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "شروط الدفع والملاحظات" : "Payment Terms & Notes"}
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={isAr ? "تفاصيل التحويل البنكي أو طريقة السداد..." : "Bank details, payment instructions..."}
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
              {isAr ? "إنشاء الفاتورة" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
