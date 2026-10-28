import React, { useState, useMemo, memo } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  type FinancialTransaction,
  type TransactionType,
} from "@/lib/store";

export interface FinanceTransactionsTabProps {
  onOpenNewTx: () => void;
  onSelectTx: (tx: FinancialTransaction) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceTransactionsTab = memo(function FinanceTransactionsTab({
  onOpenNewTx,
  onSelectTx,
  isAr,
  t,
}: FinanceTransactionsTabProps) {
  const { state } = useApp();
  const transactions = state.financialTransactions || [];
  const accounts = state.financeAccounts || [];
  const categories = state.financeCategories || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Filtering and sorting logic
  const filteredTransactions = useMemo(() => {
    let list = [...transactions].filter((tx) => !tx.deletedAt);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((tx) => {
        const merchantMatch = (tx.merchantOrSource || "").toLowerCase().includes(q);
        const noteMatch = (tx.note || "").toLowerCase().includes(q);
        const tagMatch = (tx.tags || []).some((tag) => tag.toLowerCase().includes(q));
        const catMatch = (tx.categoryId || "").toLowerCase().includes(q);
        return merchantMatch || noteMatch || tagMatch || catMatch;
      });
    }

    // Type filter
    if (selectedType !== "all") {
      list = list.filter((tx) => tx.type === selectedType);
    }

    // Account filter
    if (selectedAccount !== "all") {
      list = list.filter((tx) => tx.legs.some((l) => l.accountId === selectedAccount));
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((tx) => tx.categoryId === selectedCategory);
    }

    // Linked source filter
    if (selectedSource !== "all") {
      list = list.filter((tx) => tx.sourceType === selectedSource);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "newest") {
        return (b.localDate || b.occurredAt).localeCompare(a.localDate || a.occurredAt);
      }
      if (sortBy === "oldest") {
        return (a.localDate || a.occurredAt).localeCompare(b.localDate || b.occurredAt);
      }
      const aAmt = Math.abs(a.legs[0]?.signedAmountMinor || 0);
      const bAmt = Math.abs(b.legs[0]?.signedAmountMinor || 0);
      if (sortBy === "highest") {
        return bAmt - aAmt;
      }
      return aAmt - bAmt;
    });

    return list;
  }, [transactions, searchQuery, selectedType, selectedAccount, selectedCategory, selectedSource, sortBy]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, FinancialTransaction[]> = {};
    for (const tx of filteredTransactions) {
      const dateKey = tx.localDate || tx.occurredAt.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    }
    return groups;
  }, [filteredTransactions]);

  const typePills = [
    { key: "all", label: isAr ? "الكل" : "All" },
    { key: "income", label: t("income") },
    { key: "expense", label: t("expenses") },
    { key: "transfer", label: t("transfer") },
    { key: "refund", label: t("refund") },
  ];

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls ── */}
      <div className="space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-light rtl:right-3.5 rtl:left-auto" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالتاجر، الملاحظة، التصنيف..." : "Search merchant, note, category..."}
            className="w-full rounded-2xl bg-card border border-border py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-xs font-bold text-ink placeholder:text-ink-light/60 outline-none focus:border-hotpink shadow-xs"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
          {typePills.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedType(p.key)}
              className={`cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                selectedType === p.key
                  ? "grad-theme text-white shadow-rose-sm"
                  : "bg-card border border-border/80 text-ink-light hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Account & Source Filters Row */}
        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex-1 cursor-pointer rounded-xl bg-card border border-border px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none"
            >
              <option value="all">{isAr ? "جميع الحسابات" : "All Accounts"}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon} {acc.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="flex-1 cursor-pointer rounded-xl bg-card border border-border px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none"
          >
            <option value="all">{isAr ? "كل المصادر" : "All Sources"}</option>
            <option value="business">💼 Business</option>
            <option value="travel">✈️ Travel</option>
            <option value="goal">🎯 Goal</option>
            <option value="sadaqah">🤲 Sadaqah</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="cursor-pointer rounded-xl bg-card border border-border px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none"
          >
            <option value="newest">{isAr ? "الأحدث" : "Newest"}</option>
            <option value="oldest">{isAr ? "الأقدم" : "Oldest"}</option>
            <option value="highest">{isAr ? "الأعلى قيمة" : "Highest"}</option>
            <option value="lowest">{isAr ? "الأقل قيمة" : "Lowest"}</option>
          </select>
        </div>
      </div>

      {/* ── Transaction List Grouped by Date ── */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-ink-light/50 mb-2">
            <SlidersHorizontal size={22} />
          </div>
          <p className="text-xs font-bold text-ink">{t("noTransactions")}</p>
          <p className="text-[11px] font-medium text-ink-light mt-1">
            {searchQuery || selectedType !== "all" || selectedAccount !== "all"
              ? isAr
                ? "لا توجد معاملات تطابق عوامل التصفية الحالية"
                : "No transactions match your active filters"
              : t("noTransactionsHint")}
          </p>
          <button
            type="button"
            onClick={onOpenNewTx}
            className="cursor-pointer mt-3.5 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{t("addTransaction")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateStr, txGroup]) => {
            const dateObj = new Date(dateStr + "T00:00:00");
            const headerLabel = dateObj.toLocaleDateString(isAr ? "ar-MA" : "en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <div key={dateStr} className="space-y-1.5">
                <div className="flex items-center justify-between px-1.5 pt-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-light">
                    {headerLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-ink-light">
                    {txGroup.length} {isAr ? "معاملة" : "items"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {txGroup.map((tx) => {
                    const isInc = tx.type === "income";
                    const isTransfer = tx.type === "transfer";
                    const isRefund = tx.type === "refund";
                    const primaryLeg = tx.legs[0];
                    const signedMinor = primaryLeg ? primaryLeg.signedAmountMinor : 0;
                    const absMinor = Math.abs(signedMinor);

                    const categoryObj = categories.find((c) => c.id === tx.categoryId);
                    const catName = categoryObj ? t(categoryObj.localizedBuiltInKey || categoryObj.name) : tx.categoryId;

                    const accountObj = accounts.find((a) => a.id === primaryLeg?.accountId);

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTx(tx)}
                        className={`cursor-pointer flex items-center justify-between rounded-2xl bg-card border border-border/80 p-3 shadow-xs hover:border-hotpink/60 active:scale-99 transition-all ${
                          tx.status === "voided" ? "opacity-50 grayscale" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isTransfer
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : isRefund
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : isInc
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isTransfer ? (
                              <ArrowRightLeft size={16} />
                            ) : isInc || isRefund ? (
                              <ArrowDownLeft size={16} />
                            ) : (
                              <ArrowUpRight size={16} />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-ink leading-tight">
                                {tx.merchantOrSource}
                              </p>
                              {tx.status === "voided" && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-destructive/10 text-destructive">
                                  Voided
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-ink-light">
                                {catName}
                              </span>
                              {accountObj && (
                                <span className="text-[10px] font-semibold text-ink-light">
                                  • {accountObj.name}
                                </span>
                              )}
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
                            tx.status === "voided"
                              ? "line-through text-ink-light"
                              : isTransfer
                              ? "text-blue-600 dark:text-blue-400"
                              : isInc || isRefund
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isTransfer ? "" : isInc || isRefund ? "+" : "-"}
                          {formatMoney(absMinor, primaryLeg?.currency || baseCurrency, isHidden, "en-US", isAr)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
