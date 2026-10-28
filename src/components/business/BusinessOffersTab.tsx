import React, { useState, memo } from "react";
import {
  FileText,
  Plus,
  Receipt,
  CreditCard,
  Send,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateInvoiceFinancials,
  type BusinessInvoice,
  type BusinessOffer,
  type InvoiceStatus,
} from "@/lib/store";
import { GlassCard } from "@/components/kit";

export interface BusinessOffersTabProps {
  onOpenNewOffer: () => void;
  onOpenNewInvoice: () => void;
  onOpenRecordPayment: (invoiceId?: string) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const BusinessOffersTab = memo(function BusinessOffersTab({
  onOpenNewOffer,
  onOpenNewInvoice,
  onOpenRecordPayment,
  isAr,
  t,
}: BusinessOffersTabProps) {
  const { state, updateBusinessInvoice } = useApp();
  const offers = state.businessOffers || [];
  const invoices = state.businessInvoices || [];
  const clients = state.businessClients || [];
  const projects = state.businessProjects || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const transactions = state.financialTransactions || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const [activeSubView, setActiveSubView] = useState<"invoices" | "offers" | "payments">("invoices");

  const invoiceStatuses: Record<InvoiceStatus, { label: string; color: string }> = {
    draft: { label: t("invoiceDraft"), color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
    sent: { label: t("invoiceSent"), color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    partially_paid: { label: t("invoicePartiallyPaid"), color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    paid: { label: t("invoicePaid"), color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    overdue: { label: t("invoiceOverdue"), color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    cancelled: { label: t("invoiceCancelled"), color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  };

  const handleMarkAsSent = (inv: BusinessInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    updateBusinessInvoice(inv.id, {
      status: "sent",
      sentAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4 px-4 pb-12 animate-fade-in">
      {/* ── Sub-view Segmented Tabs ── */}
      <div className="flex rounded-2xl bg-card border border-border p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubView("invoices")}
          className={`cursor-pointer flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubView === "invoices"
              ? "bg-gold text-white shadow-xs"
              : "text-ink-light hover:text-ink"
          }`}
        >
          {t("subInvoices")} ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubView("offers")}
          className={`cursor-pointer flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubView === "offers"
              ? "bg-gold text-white shadow-xs"
              : "text-ink-light hover:text-ink"
          }`}
        >
          {t("subOffers")} ({offers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubView("payments")}
          className={`cursor-pointer flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubView === "payments"
              ? "bg-gold text-white shadow-xs"
              : "text-ink-light hover:text-ink"
          }`}
        >
          {t("subPayments")} ({paymentLinks.length})
        </button>
      </div>

      {/* ── SUB-VIEW: INVOICES ── */}
      {activeSubView === "invoices" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
              {isAr ? "سجل الفواتير" : "Invoices"}
            </h3>
            <button
              type="button"
              onClick={onOpenNewInvoice}
              className="cursor-pointer flex items-center gap-1 text-xs font-bold text-gold hover:underline"
            >
              <Plus size={14} />
              <span>{t("createInvoiceBtn")}</span>
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-3 shadow-xs my-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gold/10 text-gold shadow-xs">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-ink">{t("noInvoicesTitle")}</h3>
                <p className="text-xs font-medium text-ink-light mt-1 max-w-xs">{t("noInvoicesDesc")}</p>
              </div>
              <button
                type="button"
                onClick={onOpenNewInvoice}
                className="cursor-pointer mt-2 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>{t("createInvoiceBtn")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                const project = projects.find((p) => p.id === inv.projectId);
                const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
                const statusObj = invoiceStatuses[fin.derivedStatus] || invoiceStatuses.draft;

                return (
                  <div
                    key={inv.id}
                    className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-ink">
                            #{inv.invoiceNumber}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                        </div>
                        {client && (
                          <p className="text-xs font-bold text-ink-light mt-1">
                            {client.name} {project ? `• ${project.title}` : ""}
                          </p>
                        )}
                      </div>

                      <div className="text-end">
                        <p className="font-mono text-sm font-extrabold text-ink">
                          {formatMoney(inv.totalMinor, inv.currency || baseCurrency, isHidden, "en-US", isAr)}
                        </p>
                        {fin.outstandingMinor > 0 && fin.paidMinor > 0 && (
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            {isAr ? "متبقي:" : "Rem:"} {formatMoney(fin.outstandingMinor, inv.currency || baseCurrency, isHidden, "en-US", isAr)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light pt-1 border-t border-border/60">
                      <span>{isAr ? "تاريخ الإصدار:" : "Issued:"} {inv.issueDate}</span>
                      <span>{isAr ? "الاستحقاق:" : "Due:"} {inv.dueDate}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {fin.derivedStatus === "draft" && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsSent(inv, e)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1 rounded-xl bg-surface border border-border py-1.5 text-xs font-bold text-ink hover:border-gold transition-all"
                        >
                          <Send size={12} />
                          <span>{t("markAsSentBtn")}</span>
                        </button>
                      )}

                      {fin.outstandingMinor > 0 && fin.derivedStatus !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => onOpenRecordPayment(inv.id)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-1.5 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                        >
                          <CreditCard size={12} />
                          <span>{t("recordPaymentBtn")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-VIEW: OFFERS / PRICING MENU ── */}
      {activeSubView === "offers" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
              {isAr ? "قائمة الخدمات والمنتجات" : "Offers & Packages"}
            </h3>
            <button
              type="button"
              onClick={onOpenNewOffer}
              className="cursor-pointer flex items-center gap-1 text-xs font-bold text-gold hover:underline"
            >
              <Plus size={14} />
              <span>{t("addOfferBtn")}</span>
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-3 shadow-xs my-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-500 mx-auto shadow-xs">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-ink">{isAr ? "لا توجد عروض أو خدمات بعد" : "No offers cataloged yet"}</h3>
                <p className="text-xs font-medium text-ink-light mt-1 max-w-xs">
                  {isAr ? "حددي باقاتكِ وخدماتكِ لتسهيل إدراجها في الفواتير." : "Define your packages, services, and pricing for quick invoicing."}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewOffer}
                className="cursor-pointer mt-2 inline-flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>{t("addOfferBtn")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {offers.map((off) => (
                <div
                  key={off.id}
                  className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-ink">{off.title}</h4>
                      <span className="inline-block mt-0.5 rounded-md bg-surface px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-light">
                        {off.type}
                      </span>
                    </div>
                    <p className="font-mono text-sm font-extrabold text-gold">
                      {formatMoney(off.priceMinor, off.currency || baseCurrency, isHidden, "en-US", isAr)}
                    </p>
                  </div>

                  {off.description && (
                    <p className="text-xs text-ink-light font-medium">{off.description}</p>
                  )}

                  {off.includedItems && off.includedItems.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {off.includedItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-ink">
                          <Check size={12} className="text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {off.deliveryEstimate && (
                    <p className="text-[10px] font-semibold text-ink-light flex items-center gap-1 pt-1 border-t border-border/50">
                      <Clock size={11} />
                      <span>{isAr ? "مدة التسليم المقدرة:" : "Est. Delivery:"} {off.deliveryEstimate}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-VIEW: PAYMENTS LEDGER ── */}
      {activeSubView === "payments" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-light">
              {isAr ? "المدفوعات المسجلة في المالية" : "Payments in Finance Ledger"}
            </h3>
            <button
              type="button"
              onClick={() => onOpenRecordPayment()}
              className="cursor-pointer flex items-center gap-1 text-xs font-bold text-gold hover:underline"
            >
              <Plus size={14} />
              <span>{t("recordPaymentBtn")}</span>
            </button>
          </div>

          {paymentLinks.length === 0 ? (
            <div className="rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-3 shadow-xs my-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto shadow-xs">
                <CreditCard size={24} />
              </div>
              <p className="text-xs font-medium text-ink-light">
                {isAr ? "لم يتم ربط أي مدفوعات بفواتير حتى الآن" : "No invoice payments recorded yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paymentLinks.map((pl) => {
                const inv = invoices.find((i) => i.id === pl.invoiceId);
                const tx = transactions.find((t) => t.id === pl.financeTransactionId);
                const account = state.financeAccounts.find((a) => a.id === tx?.legs[0]?.accountId);

                return (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between rounded-2xl bg-card border border-border p-3.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">
                          {inv ? `#${inv.invoiceNumber} Payment` : "Business Payment"}
                        </p>
                        <p className="text-[10.5px] font-semibold text-ink-light">
                          {tx?.localDate || pl.linkedAt.slice(0, 10)} {account ? `• ${account.name}` : ""}
                        </p>
                      </div>
                    </div>

                    <p className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatMoney(pl.amountMinor, pl.currency || baseCurrency, isHidden, "en-US", isAr)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
