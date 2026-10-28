import React, { memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
  Plus,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PiggyBank,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateAccountBalanceMinor,
  calculateNetPositionMinor,
  calculateMonthlyStats,
  calculateBudgetUsage,
  fromMinorUnits,
  type FinancialTransaction,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface FinanceOverviewTabProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onSelectTab: (tab: "overview" | "transactions" | "budgets" | "savings") => void;
  onOpenNewTx: () => void;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onSelectTx: (tx: FinancialTransaction) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceOverviewTab = memo(function FinanceOverviewTab({
  selectedMonth,
  onMonthChange,
  onSelectTab,
  onOpenNewTx,
  onOpenAccounts,
  onOpenReports,
  onSelectTx,
  isAr,
  t,
}: FinanceOverviewTabProps) {
  const { state, updateFinanceSettings } = useApp();
  const accounts = state.financeAccounts || [];
  const transactions = state.financialTransactions || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  // 1. Authoritative Net Position (Assets - Liabilities)
  const { netPositionMinor, assetsTotalMinor, liabilitiesTotalMinor } = calculateNetPositionMinor(
    accounts,
    transactions
  );

  // 2. Selected Month Cash Flow
  const { incomeMinor, expensesMinor, netCashFlowMinor } = calculateMonthlyStats(
    transactions,
    selectedMonth
  );

  // 3. Current Budget Health
  const currentBudget = (state.financeBudgets || []).find((b) => b.month === selectedMonth);
  const budgetUsage = currentBudget ? calculateBudgetUsage(currentBudget, transactions) : null;

  // 4. Savings Total
  const totalSavingsMinor = (state.savingsContributions || []).reduce((sum, c) => sum + c.amountMinor, 0);

  // 5. Month navigation
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(newMonth);
  };

  const monthLabel = (() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString(isAr ? "ar-MA" : "en-US", { month: "long", year: "numeric" });
  })();

  // 6. Recent 5 posted transactions
  const recentTransactions = transactions
    .filter((tx) => tx.status === "posted" && !tx.deletedAt)
    .slice(0, 5);

  const toggleBalances = () => {
    updateFinanceSettings({ balancesHidden: !isHidden });
  };

  return (
    <div className="space-y-4">
      {/* ── Prominent Soft Rose Balance Card ── */}
      <div className="relative overflow-hidden rounded-3xl grad-theme p-5 text-white shadow-rose-md">
        <div className="flex items-center justify-between opacity-90">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">{t("totalBalance")}</span>
            <button
              type="button"
              onClick={toggleBalances}
              aria-label={isHidden ? t("showBalances") : t("hideBalances")}
              className="cursor-pointer p-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white"
            >
              {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenAccounts}
            className="cursor-pointer flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3 py-1 text-[11px] font-bold text-white transition-all active:scale-95"
          >
            <Wallet size={13} />
            <span>{accounts.length} {t("accounts")}</span>
          </button>
        </div>

        {/* Balance Amount */}
        <p className="mt-2 font-mono text-3xl font-extrabold tracking-tight">
          {formatMoney(netPositionMinor, baseCurrency, isHidden, "en-US", isAr)}
        </p>

        {/* Month Selector Bar */}
        <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="cursor-pointer p-1 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/90"
          >
            {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <span className="text-xs font-extrabold text-white tracking-wide">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="cursor-pointer p-1 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/90"
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Monthly Cash Flow (Income, Expenses, Net Flow) */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center">
          <div className="rounded-2xl bg-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-semibold text-white/80">
              <TrendingUp size={12} className="text-emerald-300" />
              <span>{t("income")}</span>
            </div>
            <p className="mt-1 font-mono text-[12.5px] font-bold text-white">
              {formatMoney(incomeMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-semibold text-white/80">
              <TrendingDown size={12} className="text-rose-200" />
              <span>{t("expenses")}</span>
            </div>
            <p className="mt-1 font-mono text-[12.5px] font-bold text-white">
              {formatMoney(expensesMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-2">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-semibold text-white/80">
              <ArrowRightLeft size={12} className="text-white/80" />
              <span>{t("netCashFlow")}</span>
            </div>
            <p className={`mt-1 font-mono text-[12.5px] font-bold ${netCashFlowMinor >= 0 ? "text-white" : "text-rose-200"}`}>
              {formatMoney(netCashFlowMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Action Shortcuts ── */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onOpenNewTx}
          className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 shadow-xs hover:border-hotpink active:scale-95 transition-all text-ink"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl grad-theme text-white shadow-rose-sm mb-1.5">
            <Plus size={18} />
          </div>
          <span className="text-[11px] font-bold">{t("addTransaction")}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("budgets")}
          className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 shadow-xs hover:border-hotpink active:scale-95 transition-all text-ink"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-1.5">
            <PieChart size={18} />
          </div>
          <span className="text-[11px] font-bold">{t("tabBudgets")}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("savings")}
          className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 shadow-xs hover:border-hotpink active:scale-95 transition-all text-ink"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 mb-1.5">
            <PiggyBank size={18} />
          </div>
          <span className="text-[11px] font-bold">{t("tabSavings")}</span>
        </button>

        <button
          type="button"
          onClick={onOpenReports}
          className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 shadow-xs hover:border-hotpink active:scale-95 transition-all text-ink"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 mb-1.5">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[11px] font-bold">{t("tabReports")}</span>
        </button>
      </div>

      {/* ── Budget Usage Progress Snapshot ── */}
      {budgetUsage ? (
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">{t("budgetTitle")}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-ink-light border border-border">
                {budgetUsage.pctUsed}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("budgets")}
              className="cursor-pointer text-[11px] font-bold text-hotpink hover:underline"
            >
              {t("viewAllTransactions")} →
            </button>
          </div>

          <ProgressBar
            value={Math.min(100, budgetUsage.pctUsed)}
            className="h-2.5"
            barClass={budgetUsage.pctUsed > 100 ? "bg-amber-500" : "grad-theme"}
          />

          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light">
            <span>
              {formatMoney(budgetUsage.totalSpentMinor, baseCurrency, isHidden, "en-US", isAr)} {t("spentOf")}{" "}
              {formatMoney(budgetUsage.totalLimitMinor, baseCurrency, isHidden, "en-US", isAr)}
            </span>
            <span>
              {budgetUsage.totalRemainingMinor >= 0
                ? `${formatMoney(budgetUsage.totalRemainingMinor, baseCurrency, isHidden, "en-US", isAr)} ${t("remaining")}`
                : t("overBudgetNonShaming")}
            </span>
          </div>
        </div>
      ) : null}

      {/* ── Recent Transactions Section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
            {t("recentTransactions")}
          </h3>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab("transactions")}
              className="cursor-pointer text-xs font-bold text-hotpink hover:underline"
            >
              {t("viewAllTransactions")}
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-7 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-ink-light/50 mb-2">
              <Wallet size={24} />
            </div>
            <p className="text-xs font-bold text-ink">{t("noTransactions")}</p>
            <p className="text-[11px] font-medium text-ink-light mt-1 max-w-xs leading-relaxed">
              {t("noTransactionsHint")}
            </p>
            <button
              type="button"
              onClick={onOpenNewTx}
              className="cursor-pointer mt-3.5 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>{t("addFirstTransaction")}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isInc = tx.type === "income";
              const isTransfer = tx.type === "transfer";
              const primaryLeg = tx.legs[0];
              const signedMinor = primaryLeg ? primaryLeg.signedAmountMinor : 0;
              const absMinor = Math.abs(signedMinor);

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTx(tx)}
                  className="cursor-pointer flex items-center justify-between rounded-2xl bg-card border border-border/80 p-3 shadow-xs hover:border-hotpink/60 active:scale-99 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isTransfer
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : isInc
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isTransfer ? (
                        <ArrowRightLeft size={16} />
                      ) : isInc ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink leading-tight">
                        {tx.merchantOrSource}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-ink-light">
                          {tx.localDate}
                        </span>
                        {tx.sourceType && tx.sourceType !== "manual" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-surface text-ink-light border border-border">
                            {tx.sourceType === "business"
                              ? "💼 Business"
                              : tx.sourceType === "travel"
                              ? "✈️ Travel"
                              : tx.sourceType === "sadaqah"
                              ? "🤲 Sadaqah"
                              : "🎯 Goal"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-extrabold ${
                      isTransfer
                        ? "text-blue-600 dark:text-blue-400"
                        : isInc
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isTransfer ? "" : isInc ? "+" : "-"}
                    {formatMoney(absMinor, primaryLeg?.currency || baseCurrency, isHidden, "en-US", isAr)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
