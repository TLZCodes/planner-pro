import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, memo } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Wallet,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PageHeader, FilterPills } from "@/components/kit";
import { useApp, type FinancialTransaction } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { isFinanceSessionUnlocked } from "@/lib/financeSecurity";

import { FinanceOverviewTab } from "@/components/finance/FinanceOverviewTab";
import { FinanceTransactionsTab } from "@/components/finance/FinanceTransactionsTab";
import { FinanceBudgetsTab } from "@/components/finance/FinanceBudgetsTab";
import { FinanceSavingsTab } from "@/components/finance/FinanceSavingsTab";
import { FinanceAccountsModal } from "@/components/finance/FinanceAccountsModal";
import { FinanceReportsModal } from "@/components/finance/FinanceReportsModal";
import { FinanceSettingsModal } from "@/components/finance/FinanceSettingsModal";
import { FinanceTransactionModal } from "@/components/finance/FinanceTransactionModal";
import { FinanceLockOverlay } from "@/components/finance/FinanceLockOverlay";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "My Finances — AYXA Planner Pro" },
      {
        name: "description",
        content: "Private, trustworthy personal financial ledger, cash flow, budgets and savings.",
      },
    ],
  }),
  component: Finance,
});

type TabKey = "overview" | "transactions" | "budgets" | "savings";

function Finance() {
  const { state, updateFinanceSettings } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const settings = state.financeSettings || {
    baseCurrency: "MAD",
    balancesHidden: false,
    financeLockEnabled: false,
    autoLockMinutes: 5,
  };

  const isHidden = Boolean(settings.balancesHidden);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Selected Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Security Lock state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (!settings.financeLockEnabled || !settings.pinHash) return false;
    return !isFinanceSessionUnlocked(settings.autoLockMinutes || 5);
  });

  // Modals state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [accountsModalOpen, setAccountsModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Handle hardware / back button overlay dismiss
  useEffect(() => {
    const anyModalOpen =
      txModalOpen || accountsModalOpen || reportsModalOpen || settingsModalOpen;
    if (anyModalOpen) {
      (window as any).__onBackOverlayDismiss = () => {
        if (txModalOpen) setTxModalOpen(false);
        else if (accountsModalOpen) setAccountsModalOpen(false);
        else if (reportsModalOpen) setReportsModalOpen(false);
        else if (settingsModalOpen) setSettingsModalOpen(false);
        return true;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && anyModalOpen) {
        setTxModalOpen(false);
        setAccountsModalOpen(false);
        setReportsModalOpen(false);
        setSettingsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      (window as any).__onBackOverlayDismiss = null;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [txModalOpen, accountsModalOpen, reportsModalOpen, settingsModalOpen]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: t("tabOverview") },
    { key: "transactions", label: t("tabTransactions") },
    { key: "budgets", label: t("tabBudgets") },
    { key: "savings", label: t("tabSavings") },
  ];

  const handleOpenNewTx = () => {
    setEditingTx(null);
    setTxModalOpen(true);
  };

  const handleSelectTx = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };

  const toggleBalances = () => {
    updateFinanceSettings({ balancesHidden: !isHidden });
  };

  return (
    <MobileShell>
      {/* ── Security Lock Screen ── */}
      {isLocked ? (
        <FinanceLockOverlay onUnlock={() => setIsLocked(false)} isAr={isAr} t={t} />
      ) : (
        <Screen className="pb-36">
          {/* ── Header ── */}
          <PageHeader
            title={t("myFinances")}
            fallbackUrl="/more"
            right={
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleBalances}
                  aria-label={isHidden ? t("showBalances") : t("hideBalances")}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-2xl bg-card border border-border text-ink hover:bg-surface active:scale-90 transition-all shadow-xs"
                >
                  {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>

                <button
                  type="button"
                  onClick={() => setAccountsModalOpen(true)}
                  aria-label={t("accounts")}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-2xl bg-card border border-border text-ink hover:bg-surface active:scale-90 transition-all shadow-xs"
                >
                  <Wallet size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(true)}
                  aria-label={t("tabSettings")}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-2xl bg-card border border-border text-ink hover:bg-surface active:scale-90 transition-all shadow-xs"
                >
                  <Settings size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewTx}
                  aria-label={t("addTransaction")}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-2xl grad-theme text-white shadow-rose-sm active:scale-90 transition-transform"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                </button>
              </div>
            }
          />

          {/* ── 4 Primary Tabs ── */}
          <div className="mb-4">
            <FilterPills
              pills={tabs}
              active={activeTab}
              onChange={(k) => setActiveTab(k as TabKey)}
            />
          </div>

          {/* ── Active Tab View ── */}
          {activeTab === "overview" && (
            <FinanceOverviewTab
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onSelectTab={setActiveTab}
              onOpenNewTx={handleOpenNewTx}
              onOpenAccounts={() => setAccountsModalOpen(true)}
              onOpenReports={() => setReportsModalOpen(true)}
              onSelectTx={handleSelectTx}
              isAr={isAr}
              t={t}
            />
          )}

          {activeTab === "transactions" && (
            <FinanceTransactionsTab
              onOpenNewTx={handleOpenNewTx}
              onSelectTx={handleSelectTx}
              isAr={isAr}
              t={t}
            />
          )}

          {activeTab === "budgets" && (
            <FinanceBudgetsTab
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              isAr={isAr}
              t={t}
            />
          )}

          {activeTab === "savings" && (
            <FinanceSavingsTab isAr={isAr} t={t} />
          )}

          {/* ── Modals ── */}
          <FinanceTransactionModal
            isOpen={txModalOpen}
            editingTx={editingTx}
            onClose={() => {
              setTxModalOpen(false);
              setEditingTx(null);
            }}
            isAr={isAr}
            t={t}
          />

          <FinanceAccountsModal
            isOpen={accountsModalOpen}
            onClose={() => setAccountsModalOpen(false)}
            isAr={isAr}
            t={t}
          />

          <FinanceReportsModal
            isOpen={reportsModalOpen}
            onClose={() => setReportsModalOpen(false)}
            isAr={isAr}
            t={t}
          />

          <FinanceSettingsModal
            isOpen={settingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            isAr={isAr}
            t={t}
          />
        </Screen>
      )}
    </MobileShell>
  );
}
