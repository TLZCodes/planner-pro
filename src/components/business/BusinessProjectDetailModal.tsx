import React, { useState } from "react";
import {
  X,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  Receipt,
  FileText,
  DollarSign,
  Play,
} from "lucide-react";
import {
  useApp,
  formatMoney,
  calculateProjectProgress,
  calculateProjectFinancials,
  calculateBusinessFocusMinutes,
  type BusinessProject,
  type ProjectStatus,
} from "@/lib/store";
import { ProgressBar } from "@/components/kit";
import { useNavigate } from "@tanstack/react-router";

export interface BusinessProjectDetailModalProps {
  open: boolean;
  onClose: () => void;
  project: BusinessProject | null;
  onEditProject: (project: BusinessProject) => void;
  onCreateInvoiceForProject: (projectId: string) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessProjectDetailModal({
  open,
  onClose,
  project,
  onEditProject,
  onCreateInvoiceForProject,
  isAr,
  t,
}: BusinessProjectDetailModalProps) {
  const navigate = useNavigate();
  const {
    state,
    updateBusinessProject,
    deleteBusinessProject,
    addProjectMilestone,
    updateProjectMilestone,
    deleteProjectMilestone,
    addTask,
    addProjectTaskLink,
    removeProjectTaskLink,
    toggleTask,
    addBusinessNote,
    deleteBusinessNote,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"milestones" | "tasks" | "finances" | "notes">("milestones");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");

  if (!open || !project) return null;

  const clients = state.businessClients || [];
  const client = clients.find((c) => c.id === project.clientId);
  const milestones = (state.businessMilestones || []).filter((m) => m.projectId === project.id);
  const taskLinks = (state.businessProjectTaskLinks || []).filter((l) => l.projectId === project.id);
  const allTasks = state.tasks || [];
  const linkedTaskIds = new Set(taskLinks.map((l) => l.taskId));
  const linkedTasks = allTasks.filter((t) => linkedTaskIds.has(t.id));
  const invoices = state.businessInvoices || [];
  const paymentLinks = state.businessInvoicePaymentLinks || [];
  const transactions = state.financialTransactions || [];
  const notes = (state.businessNotes || []).filter((n) => n.projectId === project.id);
  const focusSessions = state.focusSessions || [];

  const settings = state.financeSettings || { baseCurrency: "MAD", balancesHidden: false };
  const baseCurrency = settings.baseCurrency || project.currency || "MAD";
  const isHidden = Boolean(settings.balancesHidden);

  const progress = calculateProjectProgress(project, milestones, taskLinks, allTasks);
  const financials = calculateProjectFinancials(project.id, invoices, paymentLinks, transactions);
  const focusMinutes = calculateBusinessFocusMinutes(focusSessions, undefined, project.id);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    addProjectMilestone({
      projectId: project.id,
      title: newMilestoneTitle.trim(),
      order: milestones.length,
      weight: 1,
      status: "pending",
    });
    setNewMilestoneTitle("");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTaskId = "task_" + Math.random().toString(36).slice(2, 9);
    addTask({
      id: newTaskId,
      title: newTaskTitle.trim(),
      tag: "Business",
      priority: "medium",
      due: project.targetDate || "Today",
      dueDate: project.targetDate || new Date().toISOString().slice(0, 10),
      isTopThree: false,
      done: false,
    });
    addProjectTaskLink(project.id, newTaskId);
    setNewTaskTitle("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteBody.trim()) return;
    addBusinessNote({
      projectId: project.id,
      title: newNoteTitle.trim() || (isAr ? "ملاحظة" : "Note"),
      body: newNoteBody.trim(),
    });
    setNewNoteTitle("");
    setNewNoteBody("");
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateBusinessProject(project.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذا المشروع؟" : "Are you sure you want to delete this project?")) {
      deleteBusinessProject(project.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <FolderKanban size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-ink">{project.title}</h3>
                {client && (
                  <p className="text-xs font-semibold text-ink-light">
                    {client.name} {client.company ? `(${client.company})` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditProject(project);
              }}
              className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-ink"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer p-1.5 rounded-xl bg-surface text-ink-light hover:text-rose-500"
              title="Delete"
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

        {/* ── Status & Target Date bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-ink-light">{isAr ? "الحالة:" : "Status:"}</span>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="rounded-xl bg-card border border-border px-2 py-1 text-xs font-bold text-ink outline-none"
            >
              <option value="planned">{t("statusPlanned")}</option>
              <option value="active">{t("statusActive")}</option>
              <option value="waiting">{t("statusWaiting")}</option>
              <option value="paused">{t("statusPaused")}</option>
              <option value="completed">{t("statusCompleted")}</option>
            </select>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="font-extrabold text-ink">
              {formatMoney(project.agreedAmountMinor, baseCurrency, isHidden, "en-US", isAr)}
            </span>
            {project.targetDate && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-ink-light">
                <Calendar size={12} />
                <span>{project.targetDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-light">
            <span>{isAr ? "نسبة الإنجاز" : "Project Progress"}</span>
            <span className="font-mono font-bold text-ink">{progress}%</span>
          </div>
          <ProgressBar value={progress} className="h-2" barClass="grad-theme" />
        </div>

        {/* ── Focus Time Shortcut ── */}
        <div className="flex items-center justify-between rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-bold text-ink">
                {focusMinutes} {isAr ? "دقيقة تركيز مسجلة" : "mins tracked on this project"}
              </p>
              <p className="text-[10px] text-ink-light">
                {isAr ? "الجلسات تُسجل مباشرة من Focus" : "Sessions linked via Focus engine"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/focus" as any });
            }}
            className="cursor-pointer flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <Play size={12} />
            <span>{isAr ? "بدء تركيز" : "Focus"}</span>
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex rounded-2xl bg-surface p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`cursor-pointer flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "milestones" ? "bg-card text-ink shadow-xs" : "text-ink-light"
            }`}
          >
            {t("methodMilestones")} ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`cursor-pointer flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "tasks" ? "bg-card text-ink shadow-xs" : "text-ink-light"
            }`}
          >
            {t("methodTasks")} ({linkedTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("finances")}
            className={`cursor-pointer flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "finances" ? "bg-card text-ink shadow-xs" : "text-ink-light"
            }`}
          >
            {isAr ? "المالية" : "Finances"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`cursor-pointer flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === "notes" ? "bg-card text-ink shadow-xs" : "text-ink-light"
            }`}
          >
            {isAr ? "ملاحظات" : "Notes"} ({notes.length})
          </button>
        </div>

        {/* ── TAB CONTENT: MILESTONES ── */}
        {activeTab === "milestones" && (
          <div className="space-y-3">
            <form onSubmit={handleAddMilestone} className="flex gap-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder={isAr ? "أضيفي محطة جديدة..." : "Add a new milestone..."}
                className="flex-1 rounded-2xl bg-surface border border-border px-3 py-2 text-xs font-medium text-ink outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-2xl grad-theme px-3.5 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95"
              >
                <Plus size={15} />
              </button>
            </form>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {milestones.length === 0 ? (
                <p className="text-xs text-ink-light text-center py-3">
                  {isAr ? "لا توجد محطات بعد. أضيفي أول محطة أعلاه." : "No milestones yet. Add the first one above."}
                </p>
              ) : (
                milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-surface p-2.5 border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateProjectMilestone(m.id, {
                            status: m.status === "completed" ? "pending" : "completed",
                          })
                        }
                        className={`cursor-pointer flex h-5 w-5 items-center justify-center rounded-lg border transition-all ${
                          m.status === "completed"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-border hover:border-gold"
                        }`}
                      >
                        {m.status === "completed" && <Check size={12} />}
                      </button>
                      <span className={m.status === "completed" ? "line-through text-ink-light" : "font-bold text-ink"}>
                        {m.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteProjectMilestone(m.id)}
                      className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: TASKS ── */}
        {activeTab === "tasks" && (
          <div className="space-y-3">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={isAr ? "مهمة عمل جديدة ترتبط بالمهام العامة..." : "New task (links to canonical Tasks)..."}
                className="flex-1 rounded-2xl bg-surface border border-border px-3 py-2 text-xs font-medium text-ink outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-2xl grad-theme px-3.5 py-2 text-xs font-bold text-white shadow-rose-sm active:scale-95"
              >
                <Plus size={15} />
              </button>
            </form>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {linkedTasks.length === 0 ? (
                <p className="text-xs text-ink-light text-center py-3">
                  {isAr ? "لا توجد مهام مرتبطة بهذا المشروع بعد." : "No tasks linked to this project yet."}
                </p>
              ) : (
                linkedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl bg-surface p-2.5 border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTask(t.id)}
                        className={`cursor-pointer flex h-5 w-5 items-center justify-center rounded-lg border transition-all ${
                          t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-gold"
                        }`}
                      >
                        {t.done && <Check size={12} />}
                      </button>
                      <span className={t.done ? "line-through text-ink-light" : "font-bold text-ink"}>
                        {t.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const link = taskLinks.find((l) => l.taskId === t.id);
                        if (link) removeProjectTaskLink(link.id);
                      }}
                      className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                      title="Unlink"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: FINANCES ── */}
        {activeTab === "finances" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl bg-surface p-3 space-y-1">
                <span className="text-[10px] text-ink-light uppercase font-bold">{isAr ? "المفوتر" : "Invoiced"}</span>
                <p className="font-mono text-sm font-extrabold text-ink">
                  {formatMoney(financials.invoicedMinor, baseCurrency, isHidden, "en-US", isAr)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-3 space-y-1">
                <span className="text-[10px] text-ink-light uppercase font-bold">{isAr ? "المقبوض" : "Collected"}</span>
                <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(financials.paidRevenueMinor, baseCurrency, isHidden, "en-US", isAr)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-3 space-y-1">
                <span className="text-[10px] text-ink-light uppercase font-bold">{isAr ? "المصروفات" : "Expenses"}</span>
                <p className="font-mono text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {formatMoney(financials.expensesMinor, baseCurrency, isHidden, "en-US", isAr)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-3 space-y-1">
                <span className="text-[10px] text-ink-light uppercase font-bold">{isAr ? "صافي الربح" : "Profit"}</span>
                <p className="font-mono text-sm font-extrabold text-gold">
                  {formatMoney(financials.profitMinor, baseCurrency, isHidden, "en-US", isAr)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateInvoiceForProject(project.id);
              }}
              className="cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-2xl bg-surface border border-border py-2 text-xs font-bold text-ink hover:border-gold transition-all"
            >
              <FileText size={14} className="text-amber-500" />
              <span>{isAr ? "إنشاء فاتورة لهذا المشروع" : "Create Invoice for this Project"}</span>
            </button>
          </div>
        )}

        {/* ── TAB CONTENT: NOTES ── */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            <form onSubmit={handleAddNote} className="space-y-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder={isAr ? "عنوان الملاحظة (اختياري)..." : "Note Title (optional)..."}
                className="w-full rounded-xl bg-surface border border-border px-3 py-1.5 text-xs font-bold text-ink outline-none"
              />
              <textarea
                rows={2}
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                placeholder={isAr ? "ملاحظة أو تدوينة سريعة عن المشروع..." : "Quick note or update..."}
                className="w-full rounded-xl bg-surface border border-border px-3 py-1.5 text-xs font-medium text-ink outline-none resize-none"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-xl grad-theme px-3 py-1.5 text-xs font-bold text-white shadow-rose-sm active:scale-95"
              >
                {isAr ? "حفظ الملاحظة" : "Save Note"}
              </button>
            </form>

            <div className="space-y-2 max-h-44 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="rounded-2xl bg-surface p-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{n.title}</span>
                    <button
                      type="button"
                      onClick={() => deleteBusinessNote(n.id)}
                      className="cursor-pointer text-ink-light hover:text-rose-500 p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-ink-light font-medium">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
