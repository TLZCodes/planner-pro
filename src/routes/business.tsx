import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Receipt,
  PieChart,
  Settings,
  Plus,
  Landmark,
} from "lucide-react";
import { useApp, type BusinessPeriod, type BusinessProject, type BusinessClient } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BusinessOverviewTab } from "@/components/business/BusinessOverviewTab";
import { BusinessProjectsTab } from "@/components/business/BusinessProjectsTab";
import { BusinessClientsTab } from "@/components/business/BusinessClientsTab";
import { BusinessOffersTab } from "@/components/business/BusinessOffersTab";
import { BusinessInsightsTab } from "@/components/business/BusinessInsightsTab";
import { BusinessProjectModal } from "@/components/business/BusinessProjectModal";
import { BusinessClientModal } from "@/components/business/BusinessClientModal";
import { BusinessOfferModal } from "@/components/business/BusinessOfferModal";
import { BusinessInvoiceModal } from "@/components/business/BusinessInvoiceModal";
import { BusinessPaymentModal } from "@/components/business/BusinessPaymentModal";
import { BusinessExpenseModal } from "@/components/business/BusinessExpenseModal";
import { BusinessSettingsModal } from "@/components/business/BusinessSettingsModal";
import { BusinessProjectDetailModal } from "@/components/business/BusinessProjectDetailModal";
import { BusinessClientDetailModal } from "@/components/business/BusinessClientDetailModal";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/business")({
  component: BusinessPage,
});

type BusinessTab = "overview" | "projects" | "clients" | "offers" | "insights";

export function BusinessPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { state } = useApp();

  const [activeTab, setActiveTab] = useState<BusinessTab>("overview");
  const [period, setPeriod] = useState<BusinessPeriod>("this_month");

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<BusinessProject | null>(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<BusinessClient | null>(null);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDefaultInvoiceId, setPaymentDefaultInvoiceId] = useState<string | undefined>(undefined);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<BusinessProject | null>(null);
  const [selectedClient, setSelectedClient] = useState<BusinessClient | null>(null);

  const tabs: { id: BusinessTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: t("tabOverview"), icon: <LayoutDashboard size={14} /> },
    { id: "projects", label: t("tabProjects"), icon: <FolderKanban size={14} /> },
    { id: "clients", label: t("tabClients"), icon: <Users size={14} /> },
    { id: "offers", label: t("tabOffers"), icon: <Receipt size={14} /> },
    { id: "insights", label: t("tabInsights"), icon: <PieChart size={14} /> },
  ];

  return (
    <MobileShell>
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative min-h-screen bg-surface-cream text-ink animate-fade-in font-sans"
      >
      {/* ── Top App Bar ── */}
      <div className="sticky top-0 z-30 bg-surface-cream/80 backdrop-blur-md px-4 pt-3 pb-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-ink tracking-tight">
              {t("myBusiness")}
            </h1>
            <p className="text-[11px] font-semibold text-ink-light mt-0.5">
              {t("businessSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="cursor-pointer p-2 rounded-2xl bg-card border border-border text-ink-light hover:text-ink shadow-xs transition-colors"
              title={isAr ? "إعدادات وهوية العمل" : "Business Settings"}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* ── 5 Primary Segmented Tabs ── */}
        <div className="no-scrollbar mt-3 flex items-center gap-1 overflow-x-auto rounded-2xl bg-card/80 p-1 border border-border/60 shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gold text-white shadow-xs"
                    : "text-ink-light hover:text-ink"
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Tab Views ── */}
      <main className="mt-4">
        {activeTab === "overview" && (
          <BusinessOverviewTab
            period={period}
            onPeriodChange={setPeriod}
            onSelectTab={setActiveTab}
            onOpenNewProject={() => {
              setEditingProject(null);
              setProjectModalOpen(true);
            }}
            onOpenNewClient={() => {
              setEditingClient(null);
              setClientModalOpen(true);
            }}
            onOpenNewOffer={() => setOfferModalOpen(true)}
            onOpenNewInvoice={() => setInvoiceModalOpen(true)}
            onOpenRecordPayment={() => {
              setPaymentDefaultInvoiceId(undefined);
              setPaymentModalOpen(true);
            }}
            onOpenRecordExpense={() => setExpenseModalOpen(true)}
            isAr={isAr}
            t={t}
          />
        )}

        {activeTab === "projects" && (
          <BusinessProjectsTab
            onOpenNewProject={() => {
              setEditingProject(null);
              setProjectModalOpen(true);
            }}
            onSelectProject={(proj) => setSelectedProject(proj)}
            isAr={isAr}
            t={t}
          />
        )}

        {activeTab === "clients" && (
          <BusinessClientsTab
            onOpenNewClient={() => {
              setEditingClient(null);
              setClientModalOpen(true);
            }}
            onSelectClient={(cli) => setSelectedClient(cli)}
            isAr={isAr}
            t={t}
          />
        )}

        {activeTab === "offers" && (
          <BusinessOffersTab
            onOpenNewOffer={() => setOfferModalOpen(true)}
            onOpenNewInvoice={() => setInvoiceModalOpen(true)}
            onOpenRecordPayment={(invId) => {
              setPaymentDefaultInvoiceId(invId);
              setPaymentModalOpen(true);
            }}
            isAr={isAr}
            t={t}
          />
        )}

        {activeTab === "insights" && (
          <BusinessInsightsTab
            period={period}
            onPeriodChange={setPeriod}
            isAr={isAr}
            t={t}
          />
        )}
      </main>

      {/* ── Modals ── */}
      <BusinessProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        projectToEdit={editingProject}
        isAr={isAr}
        t={t}
      />

      <BusinessClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        clientToEdit={editingClient}
        isAr={isAr}
        t={t}
      />

      <BusinessOfferModal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        isAr={isAr}
        t={t}
      />

      <BusinessInvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        isAr={isAr}
        t={t}
      />

      <BusinessPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentDefaultInvoiceId(undefined);
        }}
        defaultInvoiceId={paymentDefaultInvoiceId}
        isAr={isAr}
        t={t}
      />

      <BusinessExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        isAr={isAr}
        t={t}
      />

      <BusinessSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        isAr={isAr}
        t={t}
      />

      <BusinessProjectDetailModal
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        onEditProject={(proj) => {
          setEditingProject(proj);
          setProjectModalOpen(true);
        }}
        onCreateInvoiceForProject={(projId) => {
          setInvoiceModalOpen(true);
        }}
        isAr={isAr}
        t={t}
      />

      <BusinessClientDetailModal
        open={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        client={selectedClient}
        onEditClient={(cli) => {
          setEditingClient(cli);
          setClientModalOpen(true);
        }}
        onOpenProject={(projId) => {
          const p = (state.businessProjects || []).find((proj) => proj.id === projId);
          if (p) setSelectedProject(p);
        }}
        isAr={isAr}
        t={t}
      />
      </div>
    </MobileShell>
  );
}
export default BusinessPage;
