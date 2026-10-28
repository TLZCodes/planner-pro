import React, { useState, memo } from "react";
import {
  PieChart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  toMinorUnits,
  calculateBudgetUsage,
  type Budget,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface FinanceBudgetsTabProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const FinanceBudgetsTab = memo(function FinanceBudgetsTab({
  selectedMonth,
  onMonthChange,
  isAr,
  t,
}: FinanceBudgetsTabProps) {
  const { state, addBudget, updateBudget } = useApp();
  const budgets = state.financeBudgets || [];
  const categories = state.financeCategories || [];
  const transactions = state.financialTransactions || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const [editModalOpen, setEditModalOpen] = useState(false);

  // Find active budget for current month
  const activeBudget = budgets.find((b) => b.month === selectedMonth);
  const usage = activeBudget ? calculateBudgetUsage(activeBudget, transactions) : null;

  // Month navigation
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

  // Budget Editor Form State
  const [overallLimitInput, setOverallLimitInput] = useState<string>("");
  const [categoryLimitsInput, setCategoryLimitsInput] = useState<Record<string, string>>({});

  const handleOpenEdit = () => {
    if (activeBudget) {
      setOverallLimitInput(activeBudget.overallLimitMinor ? (activeBudget.overallLimitMinor / 100).toString() : "");
      const map: Record<string, string> = {};
      for (const cl of activeBudget.categoryLimits || []) {
        map[cl.categoryId] = (cl.limitMinor / 100).toString();
      }
      setCategoryLimitsInput(map);
    } else {
      setOverallLimitInput("5000");
      setCategoryLimitsInput({
        exp_food: "1500",
        exp_housing: "2000",
        exp_transport: "500",
        exp_selfcare: "400",
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const overallMinor = overallLimitInput ? toMinorUnits(overallLimitInput) : 0;
    const catLimits = Object.entries(categoryLimitsInput)
      .map(([catId, val]) => ({
        categoryId: catId,
        limitMinor: toMinorUnits(val),
      }))
      .filter((cl) => cl.limitMinor > 0);

    if (activeBudget) {
      updateBudget(activeBudget.id, {
        overallLimitMinor: overallMinor || undefined,
        categoryLimits: catLimits,
        currency: baseCurrency,
      });
    } else {
      addBudget({
        name: `Budget ${selectedMonth}`,
        month: selectedMonth,
        currency: baseCurrency,
        overallLimitMinor: overallMinor || undefined,
        categoryLimits: catLimits,
      });
    }
    setEditModalOpen(false);
  };

  const expenseCategories = categories.filter((c) => c.type === "expense" && !c.archived);

  return (
    <div className="space-y-4">
      {/* ── Month Header ── */}
      <div className="flex items-center justify-between rounded-2xl bg-card border border-border px-3 py-2.5 shadow-xs">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
          className="cursor-pointer p-1 rounded-full hover:bg-surface active:scale-90 transition-all text-ink"
        >
          {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <div className="text-center">
          <p className="text-xs font-extrabold text-ink">{monthLabel}</p>
          <p className="text-[10px] font-semibold text-ink-light">{t("budgetTitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next Month"
          className="cursor-pointer p-1 rounded-full hover:bg-surface active:scale-90 transition-all text-ink"
        >
          {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* ── Overall Budget Card or Empty State ── */}
      {!activeBudget || !usage ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-ink-light/50 mb-2">
            <PieChart size={24} />
          </div>
          <p className="text-xs font-bold text-ink">{t("noBudgetsYet")}</p>
          <p className="text-[11px] font-medium text-ink-light mt-1 max-w-xs leading-relaxed">
            {t("budgetSubtitle")}
          </p>
          <button
            type="button"
            onClick={handleOpenEdit}
            className="cursor-pointer mt-3.5 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{t("createMonthBudget")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Monthly Card */}
          <div className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider">{isAr ? "إجمالي الإنفاق من الميزانية" : "Total Budget Spent"}</p>
                <p className="font-mono text-xl font-extrabold text-ink mt-0.5">
                  {formatMoney(usage.totalSpentMinor, baseCurrency, isHidden, "en-US", isAr)}
                  <span className="text-xs font-semibold text-ink-light">
                    {" "}/ {formatMoney(usage.totalLimitMinor, baseCurrency, isHidden, "en-US", isAr)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="cursor-pointer flex items-center gap-1 rounded-xl bg-surface border border-border px-3 py-1.5 text-[11px] font-bold text-ink hover:bg-surface/80 active:scale-95 transition-all"
              >
                <Sliders size={13} />
                <span>{t("editBudget")}</span>
              </button>
            </div>

            <ProgressBar
              value={Math.min(100, usage.pctUsed)}
              className="h-2.5"
              barClass={usage.pctUsed > 100 ? "bg-amber-500" : "grad-theme"}
            />

            <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light pt-0.5">
              <span>{usage.pctUsed}% {isAr ? "مستخدم" : "used"}</span>
              <span className={usage.totalRemainingMinor < 0 ? "text-amber-600 dark:text-amber-400 font-bold" : ""}>
                {usage.totalRemainingMinor >= 0
                  ? `${formatMoney(usage.totalRemainingMinor, baseCurrency, isHidden, "en-US", isAr)} ${t("remaining")}`
                  : t("overBudgetNonShaming")}
              </span>
            </div>
          </div>

          {/* Category Budgets Grid / List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light px-1">
              {isAr ? "الميزانيات حسب الفئة" : "Category Budgets"}
            </h3>

            {usage.categoryUsages.map((cu) => {
              const categoryObj = categories.find((c) => c.id === cu.categoryId);
              const catName = categoryObj ? t(categoryObj.localizedBuiltInKey || categoryObj.name) : cu.categoryId;
              const isOver = cu.spentMinor > cu.limitMinor;

              return (
                <div
                  key={cu.categoryId}
                  className="rounded-2xl bg-card border border-border/80 p-3.5 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{categoryObj?.icon || "🏷️"}</span>
                      <div>
                        <p className="text-xs font-bold text-ink leading-tight">{catName}</p>
                        <p className="text-[10.5px] font-semibold text-ink-light">
                          {formatMoney(cu.spentMinor, baseCurrency, isHidden, "en-US", isAr)} {t("spentOf")}{" "}
                          {formatMoney(cu.limitMinor, baseCurrency, isHidden, "en-US", isAr)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isOver ? "text-amber-600 dark:text-amber-400" : "text-ink"
                      }`}
                    >
                      {cu.pctUsed}%
                    </span>
                  </div>

                  <ProgressBar
                    value={Math.min(100, cu.pctUsed)}
                    className="h-1.5"
                    barClass={isOver ? "bg-amber-500" : "bg-emerald-500"}
                  />

                  {isOver && (
                    <p className="text-[10.5px] font-medium text-amber-600 dark:text-amber-400 leading-tight">
                      {t("overBudgetNonShaming")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Budget Edit Modal ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-rose-lg space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-[15px] text-ink">{t("addBudget")}</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="cursor-pointer p-1 text-ink-light hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "الحد الشهري الإجمالي (اختياري)" : "Overall Monthly Limit (Optional)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={overallLimitInput}
                  onChange={(e) => setOverallLimitInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-surface px-3 py-2 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider">
                  {isAr ? "حدود الفئات" : "Category Limits"}
                </p>

                {expenseCategories.map((cat) => {
                  const catName = t(cat.localizedBuiltInKey || cat.name);
                  const currentVal = categoryLimitsInput[cat.id] || "";

                  return (
                    <div key={cat.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <span>{cat.icon}</span>
                        <span>{catName}</span>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          value={currentVal}
                          onChange={(e) =>
                            setCategoryLimitsInput((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          className="w-full rounded-xl bg-surface px-2.5 py-1.5 text-xs font-bold text-ink border border-border outline-none focus:border-hotpink font-mono text-end"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-3 rounded-xl grad-theme text-white text-xs font-extrabold shadow-rose-sm active:scale-95 transition-all"
                >
                  {isAr ? "حفظ الميزانية" : "Save Budget"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="cursor-pointer py-3 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-ink-light hover:text-ink active:scale-95"
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
