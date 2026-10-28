import React, { useState, memo } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateProjectProgress,
  type BusinessProject,
  type ProjectStatus,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";

export interface BusinessProjectsTabProps {
  onOpenNewProject: () => void;
  onSelectProject: (project: BusinessProject) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const BusinessProjectsTab = memo(function BusinessProjectsTab({
  onOpenNewProject,
  onSelectProject,
  isAr,
  t,
}: BusinessProjectsTabProps) {
  const { state, updateBusinessProject } = useApp();
  const projects = state.businessProjects || [];
  const clients = state.businessClients || [];
  const milestones = state.businessMilestones || [];
  const taskLinks = state.businessProjectTaskLinks || [];
  const tasks = state.tasks || [];
  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || state.prefs?.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "all">("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const client = clients.find((c) => c.id === p.clientId);
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesClient = client ? client.name.toLowerCase().includes(q) : false;
      return matchesTitle || matchesClient;
    }
    return true;
  });

  const statuses: { id: ProjectStatus; label: string; color: string }[] = [
    { id: "planned", label: t("statusPlanned"), color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { id: "active", label: t("statusActive"), color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { id: "waiting", label: t("statusWaiting"), color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { id: "paused", label: t("statusPaused"), color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { id: "completed", label: t("statusCompleted"), color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    updateBusinessProject(projectId, { status: newStatus });
    setMenuOpenId(null);
  };

  return (
    <div className="space-y-4 px-4 pb-12 animate-fade-in">
      {/* ── Search & View Mode Header ── */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card border border-border px-3 py-2 shadow-xs">
          <Search size={15} className="text-ink-light" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث عن مشروع أو عميل..." : "Search project or client..."}
            className="w-full bg-transparent text-xs font-bold text-ink outline-none"
          />
        </div>

        {/* View Toggle */}
        <div className="flex rounded-2xl bg-card border border-border p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List View"
            className={`cursor-pointer p-1.5 rounded-xl transition-all ${
              viewMode === "list" ? "bg-surface text-ink shadow-xs" : "text-ink-light hover:text-ink"
            }`}
          >
            <LayoutList size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("board")}
            aria-label="Board View"
            className={`cursor-pointer p-1.5 rounded-xl transition-all ${
              viewMode === "board" ? "bg-surface text-ink shadow-xs" : "text-ink-light hover:text-ink"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl grad-theme text-white shadow-rose-sm active:scale-90 transition-transform"
        >
          <Plus size={18} className="stroke-[2.5]" />
        </button>
      </div>

      {/* ── Filter Pills ── */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
            selectedStatus === "all"
              ? "grad-theme text-white shadow-rose-sm"
              : "bg-card border border-border text-ink-light hover:text-ink"
          }`}
        >
          {isAr ? "الكل" : "All"} ({projects.length})
        </button>
        {statuses.map((s) => {
          const count = projects.filter((p) => p.status === s.id).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStatus(s.id)}
              className={`cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedStatus === s.id
                  ? "grad-theme text-white shadow-rose-sm"
                  : "bg-card border border-border text-ink-light hover:text-ink"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-dashed border-border/80 p-8 text-center space-y-3 shadow-xs my-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gold/10 text-gold shadow-xs">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-ink">{t("noProjectsTitle")}</h3>
            <p className="text-xs font-medium text-ink-light mt-1 max-w-xs">{t("noProjectsDesc")}</p>
          </div>
          <button
            type="button"
            onClick={onOpenNewProject}
            className="cursor-pointer mt-2 flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>{t("createFirstProject")}</span>
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* ── List View ── */
        <div className="space-y-2.5">
          {filteredProjects.map((p) => {
            const client = clients.find((c) => c.id === p.clientId);
            const progress = calculateProjectProgress(p, milestones, taskLinks, tasks);
            const statusConfig = statuses.find((s) => s.id === p.status) || statuses[0];

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="cursor-pointer group relative rounded-3xl bg-card border border-border p-4 shadow-xs hover:border-gold active:scale-99 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-ink group-hover:text-gold transition-colors">
                      {p.title}
                    </h4>
                    {client && (
                      <p className="text-[11px] font-semibold text-ink-light mt-0.5">{client.name}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>

                    {/* Move to status menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === p.id ? null : p.id);
                        }}
                        className="cursor-pointer p-1 rounded-full text-ink-light hover:text-ink"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {menuOpenId === p.id && (
                        <div className="absolute right-0 top-6 z-20 w-36 rounded-2xl bg-card border border-border p-1.5 shadow-rose-md text-xs font-bold text-ink space-y-1 animate-fade-in">
                          <p className="text-[10px] text-ink-light px-2 py-0.5">{isAr ? "تغيير الحالة:" : "Move to:"}</p>
                          {statuses.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={(e) => handleStatusChange(p.id, s.id, e)}
                              className="w-full text-start px-2 py-1 rounded-lg hover:bg-surface text-[11px]"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light">
                    <span>
                      {p.progressMethod === "milestones"
                        ? t("methodMilestones")
                        : p.progressMethod === "tasks"
                        ? t("methodTasks")
                        : t("methodManual")}
                    </span>
                    <span className="font-mono font-bold text-ink">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} className="h-1.5" barClass="grad-theme" />
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-ink-light pt-0.5">
                  <span className="font-mono font-extrabold text-ink">
                    {formatMoney(p.agreedAmountMinor, p.currency || baseCurrency, isHidden, "en-US", isAr)}
                  </span>
                  {p.targetDate && (
                    <span className="flex items-center gap-1 text-[10.5px]">
                      <Calendar size={11} />
                      <span>{p.targetDate}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Board View ── */
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4 pt-1">
          {statuses.map((column) => {
            const columnProjects = projects.filter((p) => p.status === column.id);
            return (
              <div
                key={column.id}
                className="w-64 shrink-0 rounded-3xl bg-surface/50 border border-border p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between px-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${column.color}`}>
                    {column.label} ({columnProjects.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {columnProjects.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    const progress = calculateProjectProgress(p, milestones, taskLinks, tasks);
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="cursor-pointer rounded-2xl bg-card border border-border p-3 shadow-xs hover:border-gold active:scale-98 transition-all space-y-2"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-ink leading-snug">{p.title}</h5>
                          {client && (
                            <p className="text-[10px] font-medium text-ink-light mt-0.5">{client.name}</p>
                          )}
                        </div>

                        <ProgressBar value={progress} className="h-1" barClass="grad-theme" />

                        <div className="flex items-center justify-between text-[10px] font-bold text-ink-light pt-0.5">
                          <span className="font-mono text-ink">
                            {formatMoney(p.agreedAmountMinor, p.currency || baseCurrency, isHidden, "en-US", isAr)}
                          </span>
                          <span>{progress}%</span>
                        </div>
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
