import React, { useState, useEffect } from "react";
import { X, FolderKanban } from "lucide-react";
import {
  useApp,
  toMinorUnits,
  fromMinorUnits,
  type BusinessProject,
  type ProjectStatus,
  type ProjectProgressMethod,
} from "@/lib/store";

export interface BusinessProjectModalProps {
  open: boolean;
  onClose: () => void;
  projectToEdit?: BusinessProject | null;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessProjectModal({
  open,
  onClose,
  projectToEdit,
  isAr,
  t,
}: BusinessProjectModalProps) {
  const { state, addBusinessProject, updateBusinessProject } = useApp();
  const clients = state.businessClients || [];
  const baseCurrency = state.financeSettings?.baseCurrency || state.prefs?.currency || "MAD";

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [agreedAmount, setAgreedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progressMethod, setProgressMethod] = useState<ProjectProgressMethod>("milestones");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setClientId(projectToEdit.clientId || "");
      setAgreedAmount(fromMinorUnits(projectToEdit.agreedAmountMinor).toString());
      setTargetDate(projectToEdit.targetDate || "");
      setProgressMethod(projectToEdit.progressMethod || "milestones");
      setDescription(projectToEdit.description || "");
      setStatus(projectToEdit.status);
    } else {
      setTitle("");
      setClientId("");
      setAgreedAmount("");
      setTargetDate("");
      setProgressMethod("milestones");
      setDescription("");
      setStatus("active");
    }
  }, [projectToEdit, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const amountMinor = toMinorUnits(parseFloat(agreedAmount) || 0);

    if (projectToEdit) {
      updateBusinessProject(projectToEdit.id, {
        title: title.trim(),
        clientId: clientId || undefined,
        agreedAmountMinor: amountMinor,
        targetDate: targetDate || undefined,
        progressMethod,
        description: description.trim() || undefined,
        status,
      });
    } else {
      addBusinessProject({
        title: title.trim(),
        clientId: clientId || undefined,
        agreedAmountMinor: amountMinor,
        currency: baseCurrency,
        targetDate: targetDate || undefined,
        progressMethod,
        progressPercentage: 0,
        description: description.trim() || undefined,
        status,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-rose-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <FolderKanban size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">
              {projectToEdit ? t("editProject") : t("newProject")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-ink-light hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "عنوان المشروع *" : "Project Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: تصميم هوية بصرية" : "e.g. Brand Identity Design"}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "العميل المرتبط" : "Linked Client"}
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            >
              <option value="">{isAr ? "-- بدون عميل محدد --" : "-- No specific client --"}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "القيمة المتفق عليها" : "Agreed Value"}
              </label>
              <input
                type="number"
                step="any"
                value={agreedAmount}
                onChange={(e) => setAgreedAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "موعد التسليم المستهدف" : "Target Date"}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "طريقة قياس التقدم" : "Progress Tracking Method"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["milestones", "tasks", "manual"] as ProjectProgressMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setProgressMethod(m)}
                  className={`cursor-pointer rounded-xl py-2 text-[11px] font-bold border transition-all text-center ${
                    progressMethod === m
                      ? "bg-gold/15 border-gold text-gold"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  }`}
                >
                  {m === "milestones"
                    ? t("methodMilestones")
                    : m === "tasks"
                    ? t("methodTasks")
                    : t("methodManual")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "الوصف أو الملاحظات" : "Description or Notes"}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "تفاصيل نطاق العمل أو المتطلبات..." : "Scope of work, deliverables..."}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 rounded-2xl bg-surface border border-border py-2.5 text-xs font-bold text-ink-light hover:text-ink"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 rounded-2xl grad-theme py-2.5 text-xs font-bold text-white shadow-rose-sm active:scale-95 transition-all"
            >
              {projectToEdit ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إنشاء المشروع" : "Create Project")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
