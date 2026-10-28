import React, { useState, memo } from "react";
import {
  Wallet,
  Plus,
  ArrowLeft,
  Edit2,
  Archive,
  CreditCard,
  Building2,
  Coins,
  Check,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  toMinorUnits,
  calculateAccountBalanceMinor,
  calculateNetPositionMinor,
  type FinanceAccount,
  type AccountType,
  type BalanceClass,
} from "@/lib/store";

export interface FinanceAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceAccountsModal = memo(function FinanceAccountsModal({
  isOpen,
  onClose,
  isAr,
  t,
}: FinanceAccountsModalProps) {
  if (!isOpen) return null;

  const { state, addFinanceAccount, updateFinanceAccount, archiveFinanceAccount } = useApp();
  const accounts = (state.financeAccounts || []).filter((a) => a.status !== "archived");
  const transactions = state.financialTransactions || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const { netPositionMinor, assetsTotalMinor, liabilitiesTotalMinor } = calculateNetPositionMinor(
    accounts,
    transactions
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<FinanceAccount | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [balanceClass, setBalanceClass] = useState<BalanceClass>("asset");
  const [currency, setCurrency] = useState(baseCurrency);
  const [openingBalanceStr, setOpeningBalanceStr] = useState("0");
  const [icon, setIcon] = useState("💳");
  const [color, setColor] = useState("#e11d48");

  const handleOpenAdd = () => {
    setEditingAcc(null);
    setName("");
    setType("bank");
    setBalanceClass("asset");
    setCurrency(baseCurrency);
    setOpeningBalanceStr("0");
    setIcon("💳");
    setColor("#e11d48");
    setFormOpen(true);
  };

  const handleOpenEdit = (acc: FinanceAccount) => {
    setEditingAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setBalanceClass(acc.balanceClass);
    setCurrency(acc.currency || baseCurrency);
    setOpeningBalanceStr((acc.openingBalanceMinor / 100).toString());
    setIcon(acc.icon || "💳");
    setColor(acc.color || "#e11d48");
    setFormOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const openingMinor = toMinorUnits(openingBalanceStr);

    if (editingAcc) {
      updateFinanceAccount(editingAcc.id, {
        name: name.trim(),
        type,
        balanceClass,
        currency,
        openingBalanceMinor: openingMinor,
        icon,
        color,
      });
    } else {
      addFinanceAccount({
        name: name.trim(),
        type,
        balanceClass,
        currency,
        openingBalanceMinor: openingMinor,
        icon,
        color,
        includeInTotals: true,
        status: "active",
      });
    }
    setFormOpen(false);
  };

  const assetAccounts = accounts.filter((a) => a.balanceClass === "asset");
  const liabilityAccounts = accounts.filter((a) => a.balanceClass === "liability");

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
            <h2 className="text-base font-bold text-ink leading-tight">{t("accounts")}</h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "إدارة وتوزيع الحسابات والمحافظ" : "Manage your accounts & balances"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="cursor-pointer flex items-center gap-1.5 rounded-2xl grad-theme px-3.5 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>{t("addAccount")}</span>
        </button>
      </header>

      {/* ── Body ── */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-36">
        {/* Net Worth Summary */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-2.5">
          <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider">{t("netWorth")}</p>
          <p className="font-mono text-2xl font-extrabold text-ink">
            {formatMoney(netPositionMinor, baseCurrency, isHidden, "en-US", isAr)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light border-t border-border/80 pt-2">
            <span>{isAr ? "إجمالي الأصول:" : "Total Assets:"} {formatMoney(assetsTotalMinor, baseCurrency, isHidden, "en-US", isAr)}</span>
            <span>{isAr ? "إجمالي الالتزامات:" : "Liabilities:"} {formatMoney(liabilitiesTotalMinor, baseCurrency, isHidden, "en-US", isAr)}</span>
          </div>
        </div>

        {/* Assets Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light px-1">
            {isAr ? "الأصول والحسابات الجارية" : "Asset Accounts"}
          </h3>
          <div className="space-y-2">
            {assetAccounts.map((acc) => {
              const balMinor = calculateAccountBalanceMinor(acc, transactions);
              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-2xl bg-card border border-border/80 p-3.5 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{acc.name}</h4>
                      <p className="text-[10px] font-semibold text-ink-light capitalize">
                        {acc.type} • {acc.currency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-ink">
                      {formatMoney(balMinor, acc.currency || baseCurrency, isHidden, "en-US", isAr)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      aria-label="Edit Account"
                      className="cursor-pointer p-1 text-ink-light hover:text-ink active:scale-90"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities Section */}
        {liabilityAccounts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light px-1">
              {isAr ? "الالتزامات والديون" : "Liability & Debt Accounts"}
            </h3>
            <div className="space-y-2">
              {liabilityAccounts.map((acc) => {
                const balMinor = calculateAccountBalanceMinor(acc, transactions);
                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-2xl bg-card border border-border/80 p-3.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{acc.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-ink">{acc.name}</h4>
                        <p className="text-[10px] font-semibold text-ink-light capitalize">
                          {acc.type} • {acc.currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        {formatMoney(balMinor, acc.currency || baseCurrency, isHidden, "en-US", isAr)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(acc)}
                        aria-label="Edit Account"
                        className="cursor-pointer p-1 text-ink-light hover:text-ink active:scale-90"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Account Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-rose-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-[15px] text-ink">
                {editingAcc ? t("editAccount") : t("addAccount")}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="cursor-pointer p-1 text-ink-light hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "أيقونة" : "Icon"}
                  </label>
                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-xl bg-surface px-2.5 py-2 text-center text-base border border-border outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {t("accountName")}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? "مثال: البنك الشعبي، كاش الجيب..." : "e.g. Main Bank, Cash Wallet..."}
                    required
                    className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {t("accountType")}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
                  >
                    <option value="bank">{t("bankAccount")}</option>
                    <option value="cash">{t("cashAccount")}</option>
                    <option value="savings">{t("savingsAccount")}</option>
                    <option value="wallet">Mobile Wallet</option>
                    <option value="credit_debt">{t("creditDebtAccount")}</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "تصنيف الرصيد" : "Class"}
                  </label>
                  <select
                    value={balanceClass}
                    onChange={(e) => setBalanceClass(e.target.value as BalanceClass)}
                    className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
                  >
                    <option value="asset">{isAr ? "أصل مالي (+)" : "Asset (+)"}</option>
                    <option value="liability">{isAr ? "التزام / دين (-)" : "Liability / Debt (-)"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {t("openingBalance")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalanceStr}
                    onChange={(e) => setOpeningBalanceStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-light block mb-1">
                    {isAr ? "العملة" : "Currency"}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface px-2.5 py-2 text-xs font-bold text-ink border border-border outline-none"
                  >
                    <option value="MAD">MAD (د.م.)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all"
                >
                  {isAr ? "حفظ الحساب" : "Save Account"}
                </button>
                {editingAcc && (
                  <button
                    type="button"
                    onClick={() => {
                      archiveFinanceAccount(editingAcc.id);
                      setFormOpen(false);
                    }}
                    className="cursor-pointer py-3 px-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 active:scale-95"
                  >
                    {t("archiveAccount")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="cursor-pointer py-3 px-3 rounded-xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-95"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
