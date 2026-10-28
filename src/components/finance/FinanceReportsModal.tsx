import React, { useState, memo } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateMonthlyStats,
  calculateNetPositionMinor,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface FinanceReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceReportsModal = memo(function FinanceReportsModal({
  isOpen,
  onClose,
  isAr,
  t,
}: FinanceReportsModalProps) {
  if (!isOpen) return null;

  const { state, updateFinanceSettings } = useApp();
  const transactions = state.financialTransactions || [];
  const categories = state.financeCategories || [];
  const accounts = state.financeAccounts || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const monthLabel = (() => {
    const [year, month] = currentMonth.split("-").map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString(isAr ? "ar-MA" : "en-US", { month: "long", year: "numeric" });
  })();

  const {
    incomeMinor,
    expensesMinor,
    netCashFlowMinor,
    expensesByCategoryMinor,
    transactionCount,
  } = calculateMonthlyStats(transactions, currentMonth);

  const categoryBreakdown = Object.entries(expensesByCategoryMinor)
    .map(([catId, spentMinor]) => {
      const categoryObj = categories.find((c) => c.id === catId);
      const pct = expensesMinor > 0 ? Math.round((spentMinor / expensesMinor) * 100) : 0;
      return {
        catId,
        name: categoryObj ? t(categoryObj.localizedBuiltInKey || categoryObj.name) : catId,
        icon: categoryObj?.icon || "🏷️",
        color: categoryObj?.color || "#f43f5e",
        spentMinor,
        pct,
      };
    })
    .sort((a, b) => b.spentMinor - a.spentMinor);

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
            <h2 className="text-base font-bold text-ink leading-tight">{t("tabReports")}</h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "تحليل التدفق النقدي والمصروفات" : "Cash flow & spending breakdown"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateFinanceSettings({ balancesHidden: !isHidden })}
          className="cursor-pointer p-2 rounded-full bg-surface border border-border text-ink hover:bg-surface/80 active:scale-95 transition-all"
        >
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-36">
        {/* Month Selector */}
        <div className="flex items-center justify-between rounded-2xl bg-card border border-border px-3 py-2 shadow-xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="cursor-pointer p-1 rounded-full hover:bg-surface text-ink active:scale-90"
          >
            {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <span className="text-xs font-extrabold text-ink">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="cursor-pointer p-1 rounded-full hover:bg-surface text-ink active:scale-90"
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Cash Flow Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-card border border-border p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={13} />
              <span>{t("income")}</span>
            </div>
            <p className="font-mono text-sm font-extrabold text-ink mt-1">
              {formatMoney(incomeMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10.5px] font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown size={13} />
              <span>{t("expenses")}</span>
            </div>
            <p className="font-mono text-sm font-extrabold text-ink mt-1">
              {formatMoney(expensesMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-3 text-center shadow-xs">
            <p className="text-[10.5px] font-bold text-ink-light">
              {t("netCashFlow")}
            </p>
            <p className={`font-mono text-sm font-extrabold mt-1 ${netCashFlowMinor >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatMoney(netCashFlowMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
              {isAr ? "المصروفات حسب الفئة" : "Spending by Category"}
            </h3>
            <span className="text-[10px] font-semibold text-ink-light">
              {transactionCount} {isAr ? "معاملة هذا الشهر" : "transactions this month"}
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs font-medium text-ink-light py-4 text-center">
              {isAr ? "لا توجد مصروفات مسجلة في هذا الشهر" : "No expenses logged for this month"}
            </p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.catId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span>{formatMoney(cat.spentMinor, baseCurrency, isHidden, "en-US", isAr)}</span>
                      <span className="text-[10px] font-semibold text-ink-light">({cat.pct}%)</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={cat.pct}
                    className="h-1.5"
                    barClass="grad-theme"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
