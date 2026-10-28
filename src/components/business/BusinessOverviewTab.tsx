import React, { memo } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  FolderKanban,
  Users,
  FileText,
  CreditCard,
  Receipt,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateBusinessFinances,
  calculateInvoiceFinancials,
  calculateBusinessFocusMinutes,
  type BusinessPeriod,
} from "@/lib/store";
import { GlassCard, ProgressBar } from "@/components/kit";

export interface BusinessOverviewTabProps {
  period: BusinessPeriod;
  onPeriodChange: (period: BusinessPeriod) => void;
  onSelectTab: (tab: "projects" | "clients" | "offers" | "insights") => void;
  onOpenNewProject: () => void;
  onOpenNewClient: () => void;
  onOpenNewOffer: () => void;
  onOpenNewInvoice: () => void;
  onOpenRecordPayment: () => void;
  onOpenRecordExpense: () => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const BusinessOverviewTab = memo(function BusinessOverviewTab({
  period,
  onPeriodChange,
  onSelectTab,
  onOpenNewProject,
  onOpenNewClient,
  onOpenNewOffer,
  onOpenNewInvoice,
  onOpenRecordPayment,
  onOpenRecordExpense,
  isAr,
  t,
}: BusinessOverviewTabProps) {
  const { state } = useApp();
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const transactions = state.financialTransactions || [];
  const projects = state.businessProjects || [];
  const clients = state.businessClients || [];
  const invoices = state.businessInvoices || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const focusSessions = state.focusSessions || [];
  const tasks = state.tasks || [];

  // Financial calculations from canonical Finance transactions
  const { revenueMinor, expensesMinor, netProfitMinor, transactionCount } =
    calculateBusinessFinances(transactions, period);

  // Outstanding invoices
  let totalOutstandingMinor = 0;
  let outstandingCount = 0;
  for (const inv of invoices) {
    if (inv.status === "cancelled") continue;
    const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
    if (fin.outstandingMinor > 0) {
      totalOutstandingMinor += fin.outstandingMinor;
      outstandingCount++;
    }
  }

  // Active projects count
  const activeProjects = projects.filter((p) => p.status === "active");

  // Upcoming project deadline
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingProject = [...activeProjects]
    .filter((p) => p.targetDate && p.targetDate >= todayStr)
    .sort((a, b) => (a.targetDate! > b.targetDate! ? 1 : -1))[0];

  // Business tasks due today
  const businessTaskLinks = state.businessProjectTaskLinks || [];
  const businessTaskIds = new Set(businessTaskLinks.map((l) => l.taskId));
  const tasksDueToday = tasks.filter(
    (task) =>
      !task.done &&
      task.dueDate === todayStr &&
      (task.tag === "Work" || task.tag === "Business" || businessTaskIds.has(task.id))
  );

  // Focus time this week (minutes)
  const focusMinutes = calculateBusinessFocusMinutes(focusSessions, period);
  const focusHoursFormatted = (focusMinutes / 60).toFixed(1);

  // Recent payments
  const recentPayments = transactions
    .filter((tx) => tx.sourceType === "business" && tx.type === "income" && tx.status === "posted" && !tx.deletedAt)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 3);

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
                ? "bg-gold text-white shadow-xs scale-100"
                : "bg-card border border-border text-ink-light hover:text-ink active:scale-95"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Gold Revenue & Cash Flow Card ── */}
      <GlassCard gradient="grad-gold" className="relative overflow-hidden p-5 shadow-rose">
        <div className="flex items-center justify-between text-white/80">
          <p className="label-xs text-white/80">{t("revenueThisMonth")}</p>
          <span className="flex items-center gap-1 text-[11px] font-bold text-white/90">
            <CalendarDays size={13} />
            <span>{periods.find((p) => p.id === period)?.label}</span>
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-mono text-3xl font-extrabold text-white tracking-tight">
            {formatMoney(revenueMinor, baseCurrency, isHidden, "en-US", isAr)}
          </p>
          {transactionCount > 0 && (
            <span className="text-[11px] font-bold text-white/90">
              {transactionCount} {isAr ? "حركة مالية" : "transactions"}
            </span>
          )}
        </div>

        {/* Expenses & Profit breakdown inside card */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              {t("businessExpenses")}
            </p>
            <p className="font-mono text-sm font-extrabold text-white mt-0.5">
              {formatMoney(expensesMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              {t("businessProfit")}
            </p>
            <p className="font-mono text-sm font-extrabold text-white mt-0.5">
              {formatMoney(netProfitMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── 4 Quick Stat Tiles ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Outstanding Invoices */}
        <div
          onClick={() => onSelectTab("offers")}
          className="cursor-pointer rounded-2xl bg-card border border-border p-3.5 shadow-xs hover:border-gold active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between text-ink-light">
            <span className="text-[11px] font-bold">{t("outstandingInvoices")}</span>
            <Receipt size={15} className="text-amber-500" />
          </div>
          <p className="font-mono text-base font-extrabold text-ink mt-1.5">
            {formatMoney(totalOutstandingMinor, baseCurrency, isHidden, "en-US", isAr)}
          </p>
          <p className="text-[10px] font-semibold text-ink-light mt-0.5">
            {outstandingCount} {isAr ? "فاتورة معلقة" : "unpaid invoices"}
          </p>
        </div>

        {/* Active Projects */}
        <div
          onClick={() => onSelectTab("projects")}
          className="cursor-pointer rounded-2xl bg-card border border-border p-3.5 shadow-xs hover:border-gold active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between text-ink-light">
            <span className="text-[11px] font-bold">{t("activeProjectsCount")}</span>
            <FolderKanban size={15} className="text-hotpink" />
          </div>
          <p className="font-mono text-base font-extrabold text-ink mt-1.5">
            {activeProjects.length}
          </p>
          <p className="text-[10px] font-semibold text-ink-light mt-0.5 truncate">
            {upcomingProject
              ? `${isAr ? "تسليم:" : "Next:"} ${upcomingProject.targetDate}`
              : isAr ? "لا توجد مواعيد تسليم" : "No upcoming deadline"}
          </p>
        </div>

        {/* Tasks Due Today */}
        <div className="rounded-2xl bg-card border border-border p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-light">
            <span className="text-[11px] font-bold">{t("tasksDueToday")}</span>
            <CheckCircle2 size={15} className="text-emerald-500" />
          </div>
          <p className="font-mono text-base font-extrabold text-ink mt-1.5">
            {tasksDueToday.length}
          </p>
          <p className="text-[10px] font-semibold text-ink-light mt-0.5">
            {tasksDueToday.length === 0
              ? isAr ? "كل شيء منجز اليوم! ✨" : "All clear today! ✨"
              : isAr ? "مهام بحاجة للإنجاز" : "Tasks waiting"}
          </p>
        </div>

        {/* Focus Time */}
        <div className="rounded-2xl bg-card border border-border p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-light">
            <span className="text-[11px] font-bold">{t("focusTimeThisWeek")}</span>
            <Clock size={15} className="text-purple-500" />
          </div>
          <p className="font-mono text-base font-extrabold text-ink mt-1.5">
            {focusHoursFormatted} <span className="text-xs font-semibold text-ink-light">{isAr ? "ساعة" : "hrs"}</span>
          </p>
          <p className="text-[10px] font-semibold text-ink-light mt-0.5">
            {focusMinutes} {isAr ? "دقيقة تركيز مسجلة" : "minutes tracked"}
          </p>
        </div>
      </div>

      {/* ── Quick Action Grid ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light px-1">
          {isAr ? "إجراءات سريعة" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onOpenNewProject}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold mb-1.5">
              <Plus size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("addProjectBtn")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewInvoice}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1.5">
              <FileText size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("createInvoiceBtn")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRecordPayment}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1.5">
              <CreditCard size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("recordPaymentBtn")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewClient}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1.5">
              <Users size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("addClientBtn")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewOffer}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-1.5">
              <Receipt size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("addOfferBtn")}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRecordExpense}
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 text-center shadow-xs hover:border-gold active:scale-95 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-1.5">
              <TrendingDown size={16} />
            </div>
            <span className="text-[11px] font-bold text-ink leading-tight">{t("recordExpenseBtn")}</span>
          </button>
        </div>
      </div>

      {/* ── Recent Payments ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
            {t("recentPayments")}
          </h3>
          <button
            type="button"
            onClick={() => onSelectTab("offers")}
            className="cursor-pointer text-[11px] font-bold text-gold hover:underline flex items-center gap-1"
          >
            <span>{isAr ? "عرض الكل" : "View All"}</span>
            <ArrowRight size={12} className="rtl:rotate-180" />
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <p className="text-xs font-medium text-ink-light">
              {isAr ? "لم يتم تسجيل أي مدفوعات بعد" : "No business payments logged yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((p) => {
              const amt = p.legs[0]?.signedAmountMinor || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl bg-card border border-border p-3.5 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{p.merchantOrSource}</p>
                      <p className="text-[10px] font-semibold text-ink-light">{p.localDate}</p>
                    </div>
                  </div>
                  <p className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(amt, baseCurrency, isHidden, "en-US", isAr)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
