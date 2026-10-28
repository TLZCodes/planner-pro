import React from "react";
import {
  X,
  Users,
  Phone,
  Mail,
  MessageCircle,
  FolderKanban,
  FileText,
  Star,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateInvoiceFinancials,
  calculateProjectProgress,
  type BusinessClient,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface BusinessClientDetailModalProps {
  open: boolean;
  onClose: () => void;
  client: BusinessClient | null;
  onEditClient: (client: BusinessClient) => void;
  onOpenProject: (projectId: string) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessClientDetailModal({
  open,
  onClose,
  client,
  onEditClient,
  onOpenProject,
  isAr,
  t,
}: BusinessClientDetailModalProps) {
  const { state, updateBusinessClient, deleteBusinessClient } = useApp();

  if (!open || !client) return null;

  const projects = (state.businessProjects || []).filter((p) => p.clientId === client.id);
  const invoices = (state.businessInvoices || []).filter((i) => i.clientId === client.id);
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const transactions = state.financialTransactions || [];
  const milestones = state.businessMilestones || [];
  const taskLinks = state.businessProjectTaskLinks || [];
  const tasks = state.tasks || [];

  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  let totalPaidMinor = 0;
  for (const inv of invoices) {
    const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
    totalPaidMinor += fin.paidMinor;
  }

  const toggleFavorite = () => {
    updateBusinessClient(client.id, { favorite: !client.favorite });
  };

  const handleDelete = () => {
    if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذا العميل؟" : "Are you sure you want to delete this client?")) {
      deleteBusinessClient(client.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold font-extrabold text-base shadow-xs">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-ink">{client.name}</h3>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`cursor-pointer p-0.5 ${client.favorite ? "text-amber-500 fill-amber-500" : "text-border"}`}
                >
                  <Star size={15} className={client.favorite ? "fill-amber-500" : ""} />
                </button>
              </div>
              {client.company && (
                <p className="text-xs font-semibold text-ink-light">{client.company}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditClient(client);
              }}
              className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-ink"
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-rose-500"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-1.5 rounded-xl text-ink-light hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Contact bar ── */}
        <div className="flex items-center justify-between rounded-2xl bg-surface p-3 text-xs">
          <div>
            <span className="text-[10px] text-ink-light uppercase font-bold">{isAr ? "إجمالي المقبوض" : "Total Paid"}</span>
            <p className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatMoney(totalPaidMinor, baseCurrency, isHidden, "en-US", isAr)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="cursor-pointer p-2 rounded-xl bg-card border border-border text-ink-light hover:text-gold shadow-xs"
              >
                <Phone size={14} />
              </a>
            )}
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer p-2 rounded-xl bg-card border border-border text-ink-light hover:text-emerald-500 shadow-xs"
              >
                <MessageCircle size={14} />
              </a>
            )}
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="cursor-pointer p-2 rounded-xl bg-card border border-border text-ink-light hover:text-gold shadow-xs"
              >
                <Mail size={14} />
              </a>
            )}
          </div>
        </div>

        {/* ── Linked Projects ── */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
            <FolderKanban size={13} className="text-gold" />
            <span>{isAr ? "المشاريع المرتبطة" : "Linked Projects"} ({projects.length})</span>
          </h4>

          {projects.length === 0 ? (
            <p className="text-xs text-ink-light text-center py-2">
              {isAr ? "لا توجد مشاريع مخصصة لهذا العميل بعد." : "No projects for this client yet."}
            </p>
          ) : (
            <div className="space-y-1.5">
              {projects.map((p) => {
                const prog = calculateProjectProgress(p, milestones, taskLinks, tasks);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onOpenProject(p.id);
                    }}
                    className="cursor-pointer rounded-2xl bg-surface p-2.5 space-y-1.5 hover:border hover:border-gold transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-ink">
                      <span>{p.title}</span>
                      <span className="font-mono text-ink-light">{prog}%</span>
                    </div>
                    <ProgressBar value={prog} className="h-1" barClass="grad-theme" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Invoices History ── */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-light flex items-center gap-1.5">
            <FileText size={13} className="text-amber-500" />
            <span>{isAr ? "سجل الفواتير" : "Invoices"} ({invoices.length})</span>
          </h4>

          {invoices.length === 0 ? (
            <p className="text-xs text-ink-light text-center py-2">
              {isAr ? "لا توجد فواتير منشأة لهذا العميل بعد." : "No invoices created for this client yet."}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {invoices.map((inv) => {
                const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl bg-surface p-2 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-ink">#{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-ink-light block">{inv.issueDate}</span>
                    </div>
                    <div className="text-end">
                      <span className="font-mono font-bold text-ink">
                        {formatMoney(inv.totalMinor, inv.currency || baseCurrency, isHidden, "en-US", isAr)}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-gold block">
                        {fin.derivedStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
