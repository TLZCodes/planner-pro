import React, { useState } from "react";
import { X, TrendingDown } from "lucide-react";
import {
  useApp,
  toMinorUnits,
  type FinancialTransaction,
} from "@/lib/store";

export interface BusinessExpenseModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessExpenseModal({ open, onClose, isAr, t }: BusinessExpenseModalProps) {
  const { state, addFinancialTransaction } = useApp();
  const accounts = (state.financeAccounts || []).filter((a) => !a.archivedAt);
  const projects = state.businessProjects || [];
  const baseCurrency = state.financeSettings?.baseCurrency || state.prefs?.currency || "MAD";

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [financeAccountId, setFinanceAccountId] = useState(accounts[0]?.id || "");
  const [projectId, setProjectId] = useState("");
  const [localDate, setLocalDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !financeAccountId) return;

    const amountMinor = toMinorUnits(parseFloat(amount) || 0);
    if (amountMinor <= 0) return;

    const account = accounts.find((a) => a.id === financeAccountId);
    const curr = account?.currency || baseCurrency;

    addFinancialTransaction({
      type: "expense",
      status: "posted",
      categoryId: "exp_business",
      merchantOrSource: description.trim(),
      occurredAt: `${localDate}T12:00:00.000Z`,
      localDate,
      note: note.trim() || undefined,
      sourceType: "business",
      sourceId: projectId || "business",
      legs: [
        {
          id: "leg_" + Math.random().toString(36).slice(2, 9),
          transactionId: "",
          accountId: financeAccountId,
          signedAmountMinor: -Math.abs(amountMinor),
          currency: curr,
          legType: "source",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">{t("recordExpenseBtn")}</h3>
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
              {isAr ? "الوصف أو الجهة *" : "Description or Vendor *"}
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "مثال: اشتراك برامج التصميم، استضافة..." : "e.g. Adobe subscription, Hosting..."}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "المبلغ *" : "Amount *"}
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
                {isAr ? "تاريخ الصرف" : "Date"}
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
              {isAr ? "الحساب البنكي / النقدي المسحوب منه *" : "Paid from Account *"}
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
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "ربط بمشروع معين (اختياري)" : "Link to Project (optional)"}
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            >
              <option value="">{isAr ? "-- مصروف عام للعمل --" : "-- General business expense --"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "ملاحظة" : "Note"}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "ملاحظات إضافية..." : "Additional notes..."}
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
              className="cursor-pointer flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              {isAr ? "تسجيل المصروف" : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
