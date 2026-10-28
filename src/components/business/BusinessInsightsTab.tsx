import React, { memo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  PieChart,
  Users,
  FolderKanban,
  Receipt,
  CalendarDays,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateBusinessFinances,
  calculateProjectFinancials,
  calculateBusinessFocusMinutes,
  type BusinessPeriod,
} from "@/lib/store";
import { GlassCard, ProgressBar } from "@/components/kit";

export interface BusinessInsightsTabProps {
  period: BusinessPeriod;
  onPeriodChange: (period: BusinessPeriod) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const BusinessInsightsTab = memo(function BusinessInsightsTab({
  period,
  onPeriodChange,
  isAr,
  t,
}: BusinessInsightsTabProps) {
  const { state } = useApp();
  const transactions = state.financialTransactions || [];
  const projects = state.businessProjects || [];
  const clients = state.businessClients || [];
  const invoices = state.businessInvoices || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const focusSessions = state.focusSessions || [];

  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const { revenueMinor, expensesMinor, netProfitMinor } =
    calculateBusinessFinances(transactions, period);

  const focusMinutes = calculateBusinessFocusMinutes(focusSessions, period);
  const focusHours = (focusMinutes / 60);

  // Client Revenue breakdown
  const clientRevenueMap: Record<string, number> = {};
  for (const link of paymentLinks) {
    if (link.removedAt) continue;
    const inv = invoices.find((i) => i.id === link.invoiceId);
    if (!inv || !inv.clientId) continue;
    const tx = transactions.find((t) => t.id === link.financeTransactionId);
    if (tx && tx.status === "posted" && !tx.deletedAt) {
      clientRevenueMap[inv.clientId] = (clientRevenueMap[inv.clientId] || 0) + link.amountMinor;
    }
  }

  const clientBreakdown = Object.entries(clientRevenueMap)
    .map(([clientId, amountMinor]) => {
      const client = clients.find((c) => c.id === clientId);
      return {
        id: clientId,
        name: client ? client.name : "Unknown Client",
        amountMinor,
        percentage: revenueMinor > 0 ? Math.round((amountMinor / revenueMinor) * 100) : 0,
      };
    })
    .sort((a, b) => b.amountMinor - a.amountMinor);

  // Project profitability
  const projectFinancials = projects.map((p) => {
    const fin = calculateProjectFinancials(p.id, invoices, paymentLinks, transactions);
    const pFocusMinutes = calculateBusinessFocusMinutes(focusSessions, undefined, p.id);
    return {
      project: p,
      ...fin,
      focusMinutes: pFocusMinutes,
    };
  });

  const periods: { id: BusinessPeriod; label: string }[] = [
    { id: "this_month", label: t("periodThisMonth") },
    { id: "last_month", label: t("periodLastMonth") },
    { id: "this_quarter", label: t("periodThisQuarter") },
    { id: "this_year", label: t("periodThisYear") },
    { id: "all_time", label: t("periodAllTime") },
  ];

  return (
    <div className="space-y-4 px-4 pb-12 animate-fade-in">
      {/* ── Period Selector ── */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPeriodChange(p.id)}
            className={`cursor-pointer shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              period === p.id
                ? "bg-gold text-white shadow-xs"
                : "bg-card border border-border text-ink-light hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Profitability Summary ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-ink-light">{t("businessRevenue")}</p>
          <p className="font-mono text-lg font-extrabold text-ink">
            {formatMoney(revenueMinor, baseCurrency, isHidden, "en-US", isAr)}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{isAr ? "إجمالي الإيرادات المقبوضة" : "Collected Revenue"}</span>
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-ink-light">{t("businessProfit")}</p>
          <p className="font-mono text-lg font-extrabold text-ink">
            {formatMoney(netProfitMinor, baseCurrency, isHidden, "en-US", isAr)}
          </p>
          <p className="text-[10px] font-semibold text-gold flex items-center gap-1">
            <PieChart size={12} />
            <span>
              {revenueMinor > 0 ? `${Math.round((netProfitMinor / revenueMinor) * 100)}%` : "0%"} {isAr ? "هامش الربح" : "margin"}
            </span>
          </p>
        </div>
      </div>

      {/* ── Focus Yield Correlation ── */}
      <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
            <Clock size={13} className="text-purple-500" />
            <span>{isAr ? "مردود وقت التركيز" : "Focus Time Yield"}</span>
          </h4>
          <span className="text-xs font-mono font-bold text-ink">
            {focusHours.toFixed(1)} {isAr ? "ساعة" : "hrs"}
          </span>
        </div>

        <p className="text-xs text-ink-light font-medium">
          {focusHours > 0 && revenueMinor > 0
            ? `${isAr ? "معدل الإيراد لكل ساعة تركيز مسجلة:" : "Average earned per tracked focus hour:"} ` +
              formatMoney(Math.round(revenueMinor / focusHours), baseCurrency, isHidden, "en-US", isAr)
            : isAr
            ? "سجلي ساعات التركيز المرتبطة بمشاريعكِ لحساب معدل المردود بالساعة."
            : "Track focus sessions on your projects to see your effective hourly yield."}
        </p>
      </div>

      {/* ── Client Revenue Breakdown ── */}
      <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
          <Users size={13} className="text-blue-500" />
          <span>{isAr ? "توزيع الإيرادات حسب العملاء" : "Revenue by Client"}</span>
        </h4>

        {clientBreakdown.length === 0 ? (
          <p className="text-xs font-medium text-ink-light text-center py-2">
            {isAr ? "لا توجد إيرادات مسجلة للعملاء في هذه الفترة" : "No client revenue in this period"}
          </p>
        ) : (
          <div className="space-y-2.5">
            {clientBreakdown.map((cb) => (
              <div key={cb.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>{cb.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink-light font-medium">{cb.percentage}%</span>
                    <span className="font-mono">{formatMoney(cb.amountMinor, baseCurrency, isHidden, "en-US", isAr)}</span>
                  </div>
                </div>
                <ProgressBar value={cb.percentage} className="h-1.5" barClass="bg-blue-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Project Financials List ── */}
      <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
          <FolderKanban size={13} className="text-gold" />
          <span>{isAr ? "ربحية المشاريع" : "Project Profitability"}</span>
        </h4>

        {projectFinancials.length === 0 ? (
          <p className="text-xs font-medium text-ink-light text-center py-2">
            {isAr ? "لا توجد مشاريع مسجلة بعد" : "No projects to report"}
          </p>
        ) : (
          <div className="space-y-2">
            {projectFinancials.map(({ project, paidRevenueMinor, expensesMinor, profitMinor }) => (
              <div
                key={project.id}
                className="rounded-2xl bg-surface p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-ink">{project.title}</p>
                  <p className="text-[10px] text-ink-light mt-0.5">
                    {isAr ? "مقبوض:" : "Paid:"} {formatMoney(paidRevenueMinor, project.currency || baseCurrency, isHidden, "en-US", isAr)}
                    {" • "}
                    {isAr ? "مصروف:" : "Exp:"} {formatMoney(expensesMinor, project.currency || baseCurrency, isHidden, "en-US", isAr)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-mono font-extrabold text-ink">
                    {formatMoney(profitMinor, project.currency || baseCurrency, isHidden, "en-US", isAr)}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {isAr ? "صافي الربح" : "Net Profit"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
