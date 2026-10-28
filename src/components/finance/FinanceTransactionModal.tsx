import React, { useState, useEffect, memo } from "react";
import {
  ArrowLeft,
  Plus,
  ArrowRightLeft,
  Check,
  Trash2,
  AlertTriangle,
  FileText,
  Tag,
  Paperclip,
  Building2,
  Compass,
  Target,
  HandHeart,
} from "lucide-react";
import {
  useApp,
  toMinorUnits,
  fromMinorUnits,
  createTransferTransaction,
  createAdjustmentTransaction,
  type FinancialTransaction,
  type FinancialTransactionLeg,
  type TransactionType,
} from "@/lib/store";

export interface FinanceTransactionModalProps {
  isOpen: boolean;
  editingTx?: FinancialTransaction | null;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceTransactionModal = memo(function FinanceTransactionModal({
  isOpen,
  editingTx,
  onClose,
  isAr,
  t,
}: FinanceTransactionModalProps) {
  if (!isOpen) return null;

  const {
    state,
    addFinancialTransaction,
    updateFinancialTransaction,
    voidFinancialTransaction,
    deleteFinancialTransaction,
    addSadaqahEntry,
  } = useApp();

  const accounts = state.financeAccounts || [];
  const categories = state.financeCategories || [];
  const trips = state.trips || [];
  const goals = state.goals || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";

  // Form State
  const [type, setType] = useState<TransactionType>(editingTx ? editingTx.type : "expense");
  const [amountStr, setAmountStr] = useState(
    editingTx
      ? Math.abs(fromMinorUnits(editingTx.legs[0]?.signedAmountMinor || 0)).toString()
      : ""
  );
  const [merchant, setMerchant] = useState(editingTx ? editingTx.merchantOrSource : "");
  const [categoryId, setCategoryId] = useState(editingTx ? editingTx.categoryId : "exp_food");
  const [accountId, setAccountId] = useState(
    editingTx ? editingTx.legs[0]?.accountId : accounts[0]?.id || ""
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    editingTx && editingTx.type === "transfer"
      ? editingTx.legs[1]?.accountId || accounts[1]?.id || ""
      : accounts[1]?.id || ""
  );
  const [date, setDate] = useState(
    editingTx ? editingTx.localDate : new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(editingTx ? editingTx.note || "" : "");
  const [tagsStr, setTagsStr] = useState(editingTx && editingTx.tags ? editingTx.tags.join(", ") : "");

  // Cross-module linking state
  const [sourceType, setSourceType] = useState<"manual" | "business" | "travel" | "goal" | "sadaqah">(
    editingTx && editingTx.sourceType ? editingTx.sourceType : "manual"
  );
  const [sourceId, setSourceId] = useState(editingTx ? editingTx.sourceId || "" : "");
  const [sadaqahConfirmed, setSadaqahConfirmed] = useState(false);

  // Local receipt attachment
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    editingTx ? editingTx.receiptAttachment : undefined
  );

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setReceiptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountStr.trim() || !merchant.trim()) return;

    const amtMinor = toMinorUnits(amountStr);
    const tags = tagsStr
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // 1. Transfer Transaction
    if (type === "transfer") {
      if (accountId === destinationAccountId) return;
      if (editingTx) {
        // Update existing transfer
        const sourceLeg: FinancialTransactionLeg = {
          id: editingTx.legs[0]?.id || "leg_src",
          transactionId: editingTx.id,
          accountId,
          signedAmountMinor: -Math.abs(amtMinor),
          currency: baseCurrency,
          legType: "source",
          createdAt: editingTx.createdAt,
        };
        const destLeg: FinancialTransactionLeg = {
          id: editingTx.legs[1]?.id || "leg_dst",
          transactionId: editingTx.id,
          accountId: destinationAccountId,
          signedAmountMinor: Math.abs(amtMinor),
          currency: baseCurrency,
          legType: "destination",
          createdAt: editingTx.createdAt,
        };
        updateFinancialTransaction(editingTx.id, {
          merchantOrSource: merchant.trim(),
          localDate: date,
          note: note.trim() || undefined,
          tags,
          legs: [sourceLeg, destLeg],
        });
      } else {
        const transferTx = createTransferTransaction({
          sourceAccountId: accountId,
          destinationAccountId,
          amountMinor: amtMinor,
          currency: baseCurrency,
          localDate: date,
          merchantOrSource: merchant.trim(),
          note: note.trim() || undefined,
        });
        addFinancialTransaction({
          ...transferTx,
          tags,
          sourceType: sourceType !== "manual" ? sourceType : undefined,
          sourceId: sourceId || undefined,
        });
      }
      onClose();
      return;
    }

    // 2. Standard Income / Expense / Refund / Adjustment
    const isIncome = type === "income" || type === "refund";
    const signedAmtMinor = isIncome ? Math.abs(amtMinor) : -Math.abs(amtMinor);

    if (editingTx) {
      const leg: FinancialTransactionLeg = {
        id: editingTx.legs[0]?.id || "leg_" + editingTx.id,
        transactionId: editingTx.id,
        accountId,
        signedAmountMinor: signedAmtMinor,
        currency: baseCurrency,
        legType: isIncome ? "destination" : "source",
        createdAt: editingTx.createdAt,
      };

      updateFinancialTransaction(editingTx.id, {
        type,
        categoryId,
        merchantOrSource: merchant.trim(),
        localDate: date,
        note: note.trim() || undefined,
        tags,
        sourceType: sourceType !== "manual" ? sourceType : undefined,
        sourceId: sourceId || undefined,
        receiptAttachment: receiptUrl,
        legs: [leg],
      });
    } else {
      const now = new Date().toISOString();
      const leg: FinancialTransactionLeg = {
        id: "leg_temp",
        transactionId: "tx_temp",
        accountId,
        signedAmountMinor: signedAmtMinor,
        currency: baseCurrency,
        legType: isIncome ? "destination" : "source",
        createdAt: now,
      };

      addFinancialTransaction({
        type,
        status: "posted",
        categoryId,
        merchantOrSource: merchant.trim(),
        occurredAt: `${date}T12:00:00.000Z`,
        localDate: date,
        note: note.trim() || undefined,
        tags,
        sourceType: sourceType !== "manual" ? sourceType : undefined,
        sourceId: sourceId || undefined,
        receiptAttachment: receiptUrl,
        legs: [leg],
      });

      // Explicit link to private Sadaqah log if requested
      if (sourceType === "sadaqah" && sadaqahConfirmed) {
        addSadaqahEntry({
          localDate: date,
          amount: fromMinorUnits(amtMinor),
          currency: baseCurrency,
          category: merchant.trim() || "Giving",
          privateNote: note.trim() || undefined,
          isAnonymous: true,
        });
      }
    }

    onClose();
  };

  const handleVoid = () => {
    if (editingTx) {
      voidFinancialTransaction(editingTx.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editingTx) {
      deleteFinancialTransaction(editingTx.id);
      onClose();
    }
  };

  const availableCategories = categories.filter((c) => {
    if (type === "income") return c.type === "income";
    if (type === "expense" || type === "refund") return c.type === "expense";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas text-ink animate-fade-in overflow-y-auto">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-ink hover:bg-surface/80 active:scale-90 transition-all"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-ink leading-tight">
              {editingTx ? (isAr ? "تعديل المعاملة" : "Edit Transaction") : t("addTransaction")}
            </h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "تسجيل حركة مالية في السجل الكنسي" : "Record entry in canonical ledger"}
            </p>
          </div>
        </div>

        {editingTx && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoid}
              className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-95"
            >
              {isAr ? "إلغاء المعاملة (Void)" : "Void"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </header>

      {/* ── Form Body ── */}
      <form onSubmit={handleSave} className="p-4 space-y-4 max-w-lg mx-auto w-full pb-36">
        {/* Type Selector Toggle */}
        <div className="flex rounded-2xl bg-surface p-1 border border-border">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategoryId("exp_food");
            }}
            className={`cursor-pointer flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              type === "expense" ? "bg-rose-500 text-white shadow-xs" : "text-ink-light hover:text-ink"
            }`}
          >
            {t("expenses")}
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategoryId("inc_salary");
            }}
            className={`cursor-pointer flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              type === "income" ? "bg-emerald-600 text-white shadow-xs" : "text-ink-light hover:text-ink"
            }`}
          >
            {t("income")}
          </button>
          <button
            type="button"
            onClick={() => setType("transfer")}
            className={`cursor-pointer flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              type === "transfer" ? "grad-theme text-white shadow-xs" : "text-ink-light hover:text-ink"
            }`}
          >
            {t("transfer")}
          </button>
        </div>

        {/* Amount & Currency */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs">
          <label className="text-[11px] font-bold text-ink-light block mb-1">
            {isAr ? "المبلغ" : "Amount"} ({baseCurrency})
          </label>
          <input
            type="number"
            step="0.01"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="0.00"
            required
            autoFocus
            className="w-full rounded-2xl bg-surface px-4 py-3 font-mono text-2xl font-extrabold text-ink outline-none border border-border focus:border-hotpink"
          />
        </div>

        {/* Merchant / Payee / Source */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs">
          <label className="text-[11px] font-bold text-ink-light block mb-1">
            {type === "income"
              ? isAr ? "المصدر / جهة الدخل" : "Source / Payer"
              : type === "transfer"
              ? isAr ? "عنوان التحويل" : "Transfer Title"
              : isAr ? "التاجر / الوصف" : "Merchant / Description"}
          </label>
          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={
              type === "income"
                ? isAr ? "مثال: الراتب الشهري، مكافأة عمل..." : "e.g. Salary, Client payment..."
                : type === "transfer"
                ? isAr ? "تحويل لحساب الادخار" : "Transfer to savings"
                : isAr ? "مثال: بقالة، مقهى، كتب دراسية..." : "e.g. Grocery, Coffee, Books..."
            }
            required
            dir="auto"
            className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
          />
        </div>

        {/* Account Selection */}
        {type === "transfer" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-3xl bg-card border border-border p-3.5 shadow-xs">
              <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                {isAr ? "من حساب" : "From Account"}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-card border border-border p-3.5 shadow-xs">
              <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                {isAr ? "إلى حساب" : "To Account"}
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-3xl bg-card border border-border p-3.5 shadow-xs">
              <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                {t("accounts")}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-card border border-border p-3.5 shadow-xs">
              <label className="text-[10.5px] font-bold text-ink-light block mb-1">
                {isAr ? "التصنيف" : "Category"}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {t(c.localizedBuiltInKey || c.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs">
          <label className="text-[11px] font-bold text-ink-light block mb-1">
            {isAr ? "تاريخ المعاملة" : "Transaction Date"}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
          />
        </div>

        {/* Cross-Module Linking Options */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2.5">
          <label className="text-[11px] font-bold text-ink-light block">
            {isAr ? "ربط المعاملة بقسم آخر (اختياري)" : "Link with another module (Optional)"}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setSourceType(sourceType === "business" ? "manual" : "business")}
              className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                sourceType === "business"
                  ? "border-hotpink bg-hotpink/10 text-hotpink"
                  : "border-border bg-surface text-ink-light"
              }`}
            >
              <Building2 size={16} className="mb-1" />
              <span>Business</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType(sourceType === "travel" ? "manual" : "travel")}
              className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                sourceType === "travel"
                  ? "border-hotpink bg-hotpink/10 text-hotpink"
                  : "border-border bg-surface text-ink-light"
              }`}
            >
              <Compass size={16} className="mb-1" />
              <span>Travel</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType(sourceType === "goal" ? "manual" : "goal")}
              className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                sourceType === "goal"
                  ? "border-hotpink bg-hotpink/10 text-hotpink"
                  : "border-border bg-surface text-ink-light"
              }`}
            >
              <Target size={16} className="mb-1" />
              <span>Goal</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType(sourceType === "sadaqah" ? "manual" : "sadaqah")}
              className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all ${
                sourceType === "sadaqah"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-surface text-ink-light"
              }`}
            >
              <HandHeart size={16} className="mb-1" />
              <span>Sadaqah</span>
            </button>
          </div>

          {sourceType === "sadaqah" && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 space-y-2">
              <p>{t("sadaqahConfirmText")}</p>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={sadaqahConfirmed}
                  onChange={(e) => setSadaqahConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <span>{isAr ? "تأكيد إضافة قيد في سجل الصدقات الخاص" : "Confirm private log entry"}</span>
              </label>
            </div>
          )}
        </div>

        {/* Note & Tags */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2">
          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "ملاحظة خاصة" : "Private Note"}
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "ملاحظة خاصة بكِ..." : "Add private note..."}
              className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "وسوم مفصولة بفواصل" : "Tags (comma separated)"}
            </label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="coffee, monthly, work"
              className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
            />
          </div>
        </div>

        {/* Receipt Attachment */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-ink-light flex items-center gap-1.5">
              <Paperclip size={13} />
              <span>{isAr ? "صورة الإيصال / الفاتورة (محليًا)" : "Receipt Attachment (Local)"}</span>
            </label>
            {receiptUrl && (
              <button
                type="button"
                onClick={() => setReceiptUrl(undefined)}
                className="cursor-pointer text-[10px] font-bold text-destructive hover:underline"
              >
                {isAr ? "إزالة" : "Remove"}
              </button>
            )}
          </div>

          {receiptUrl ? (
            <img
              src={receiptUrl}
              alt="Receipt Preview"
              className="h-32 w-full object-cover rounded-2xl border border-border"
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="w-full text-xs text-ink-light file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-surface file:text-ink cursor-pointer"
            />
          )}
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white text-[13px] font-extrabold shadow-rose-sm active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>{isAr ? "حفظ المعاملة" : "Save Transaction"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer py-3.5 px-5 rounded-2xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-98"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
});
