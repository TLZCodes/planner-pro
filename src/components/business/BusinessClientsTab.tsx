import React, { useState, memo } from "react";
import {
  Users,
  Plus,
  Search,
  Star,
  Mail,
  Phone,
  MessageCircle,
  FolderKanban,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateInvoiceFinancials,
  type BusinessClient,
  type ClientStatus,
} from "@/lib/store";

export interface BusinessClientsTabProps {
  onOpenNewClient: () => void;
  onSelectClient: (client: BusinessClient) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const BusinessClientsTab = memo(function BusinessClientsTab({
  onOpenNewClient,
  onSelectClient,
  isAr,
  t,
}: BusinessClientsTabProps) {
  const { state, updateBusinessClient } = useApp();
  const clients = state.businessClients || [];
  const projects = state.businessProjects || [];
  const invoices = state.businessInvoices || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const transactions = state.financialTransactions || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");

  const filteredClients = clients.filter((c) => {
    if (c.status === "archived") return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCompany = c.company ? c.company.toLowerCase().includes(q) : false;
      const matchTag = c.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchCompany || matchTag;
    }
    return true;
  });

  const statuses: { id: ClientStatus; label: string; color: string }[] = [
    { id: "lead", label: t("clientLead"), color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { id: "active", label: t("clientActive"), color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { id: "past", label: t("clientPast"), color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
  ];

  const toggleFavorite = (client: BusinessClient, e: React.MouseEvent) => {
    e.stopPropagation();
    updateBusinessClient(client.id, { favorite: !client.favorite });
  };

  return (
    <div className="space-y-4 px-4 pb-12 animate-fade-in">
      {/* ── Search & Header ── */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card border border-border px-3 py-2 shadow-xs">
          <Search size={15} className="text-ink-light" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث عن عميل، شركة، أو تصنيف..." : "Search client, company, or tag..."}
            className="w-full bg-transparent text-xs font-bold text-ink outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNewClient}
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl grad-theme text-white shadow-rose-sm active:scale-90 transition-transform"
        >
          <Plus size={18} className="stroke-[2.5]" />
        </button>
      </div>

      {/* ── Status Filters ── */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "grad-theme text-white shadow-rose-sm"
              : "bg-card border border-border text-ink-light hover:text-ink"
          }`}
        >
          {isAr ? "الكل" : "All"} ({clients.length})
        </button>
        {statuses.map((s) => {
          const count = clients.filter((c) => c.status === s.id).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                statusFilter === s.id
                  ? "grad-theme text-white shadow-rose-sm"
                  : "bg-card border border-border text-ink-light hover:text-ink"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Client Cards or Empty ── */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-3 shadow-xs my-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gold/10 text-gold shadow-xs">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-ink">{t("noClientsTitle")}</h3>
            <p className="text-xs font-medium text-ink-light mt-1 max-w-xs">{t("noClientsDesc")}</p>
          </div>
          <button
            type="button"
            onClick={onOpenNewClient}
            className="cursor-pointer mt-2 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{t("addClientBtn")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredClients.map((c) => {
            const clientProjects = projects.filter((p) => p.clientId === c.id);
            const clientInvoices = invoices.filter((i) => i.clientId === c.id);
            let totalPaidMinor = 0;
            for (const inv of clientInvoices) {
              const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
              totalPaidMinor += fin.paidMinor;
            }

            const statusObj = statuses.find((s) => s.id === c.status) || statuses[1];
            const priorityColors = {
              high: "bg-rose-500/10 text-rose-600 border-rose-200",
              medium: "bg-amber-500/10 text-amber-600 border-amber-200",
              low: "bg-zinc-500/10 text-zinc-600 border-zinc-200",
            };

            return (
              <div
                key={c.id}
                onClick={() => onSelectClient(c)}
                className="cursor-pointer group relative rounded-3xl bg-card border border-border p-4 shadow-xs hover:border-gold active:scale-99 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar initial */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold font-extrabold text-sm shadow-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-ink group-hover:text-gold transition-colors">
                          {c.name}
                        </h4>
                        {/* Labeled Favorite Toggle (Replacing ambiguous 5-star rating) */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(c, e)}
                          title={c.favorite ? "Unfavorite" : "Favorite"}
                          aria-label={c.favorite ? "Favorited client" : "Favorite this client"}
                          className={`cursor-pointer p-0.5 transition-transform active:scale-125 ${
                            c.favorite ? "text-amber-500 fill-amber-500" : "text-border hover:text-amber-400"
                          }`}
                        >
                          <Star size={14} className={c.favorite ? "fill-amber-500" : ""} />
                        </button>
                      </div>
                      {c.company && (
                        <p className="text-[11px] font-semibold text-ink-light">{c.company}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                        priorityColors[c.priority || "medium"]
                      }`}
                    >
                      {t(`priority${(c.priority || "medium").charAt(0).toUpperCase() + (c.priority || "medium").slice(1)}`)}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${statusObj.color}`}>
                      {statusObj.label}
                    </span>
                  </div>
                </div>

                {/* Tags if any */}
                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-light"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Client Stats & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px] font-semibold text-ink-light">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FolderKanban size={12} className="text-gold" />
                      <span>{clientProjects.length} {isAr ? "مشاريع" : "projects"}</span>
                    </span>
                    <span className="font-mono font-bold text-ink">
                      {formatMoney(totalPaidMinor, baseCurrency, isHidden, "en-US", isAr)}
                    </span>
                  </div>

                  {/* Direct contact shortcuts */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-gold active:scale-90 transition-all"
                        aria-label="Call client"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-emerald-500 active:scale-90 transition-all"
                        aria-label="WhatsApp client"
                      >
                        <MessageCircle size={13} />
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-gold active:scale-90 transition-all"
                        aria-label="Email client"
                      >
                        <Mail size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
