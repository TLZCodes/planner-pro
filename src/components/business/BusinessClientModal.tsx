import React, { useState, useEffect } from "react";
import { X, Users, Star } from "lucide-react";
import {
  useApp,
  type BusinessClient,
  type ClientStatus,
  type ClientPriority,
} from "@/lib/store";

export interface BusinessClientModalProps {
  open: boolean;
  onClose: () => void;
  clientToEdit?: BusinessClient | null;
  isAr: boolean;
  t: (key: string) => string;
}

export function BusinessClientModal({
  open,
  onClose,
  clientToEdit,
  isAr,
  t,
}: BusinessClientModalProps) {
  const { addBusinessClient, updateBusinessClient } = useApp();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");
  const [priority, setPriority] = useState<ClientPriority>("medium");
  const [favorite, setFavorite] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompany(clientToEdit.company || "");
      setEmail(clientToEdit.email || "");
      setPhone(clientToEdit.phone || "");
      setStatus(clientToEdit.status);
      setPriority(clientToEdit.priority || "medium");
      setFavorite(Boolean(clientToEdit.favorite));
      setTagsInput(clientToEdit.tags?.join(", ") || "");
      setNotes(clientToEdit.notes || "");
    } else {
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setStatus("active");
      setPriority("medium");
      setFavorite(false);
      setTagsInput("");
      setNotes("");
    }
  }, [clientToEdit, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (clientToEdit) {
      updateBusinessClient(clientToEdit.id, {
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status,
        priority,
        favorite,
        tags,
        notes: notes.trim() || undefined,
      });
    } else {
      addBusinessClient({
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status,
        priority,
        favorite,
        tags,
        notes: notes.trim() || undefined,
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
              <Users size={18} />
            </div>
            <h3 className="text-base font-extrabold text-ink">
              {clientToEdit ? t("editClient") : t("addClientBtn")}
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
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-ink-light">
              {isAr ? "اسم العميل *" : "Client Name *"}
            </label>
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`cursor-pointer flex items-center gap-1 text-xs font-bold transition-colors ${
                favorite ? "text-amber-500" : "text-ink-light hover:text-ink"
              }`}
            >
              <Star size={14} className={favorite ? "fill-amber-500 text-amber-500" : ""} />
              <span>{isAr ? "عميل مفضل" : "Favorite"}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "مثال: مريم العلمي" : "e.g. Maryam Alami"}
            className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
          />

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "الشركة / المؤسسة" : "Company / Brand"}
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={isAr ? "مثال: استوديو الإبداع" : "e.g. Creative Studio"}
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 600-000000"
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "الحالة" : "Status"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              >
                <option value="lead">{t("clientLead")}</option>
                <option value="active">{t("clientActive")}</option>
                <option value="past">{t("clientPast")}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-light block mb-1">
                {isAr ? "الأولوية" : "Priority"}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ClientPriority)}
                className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
              >
                <option value="low">{t("priorityLow")}</option>
                <option value="medium">{t("priorityMedium")}</option>
                <option value="high">{t("priorityHigh")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "التصنيفات (مفصولة بفواصل)" : "Tags (comma-separated)"}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Design, Retainer, VIP"
              className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink-light block mb-1">
              {isAr ? "ملاحظات إضافية" : "Notes"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "تفضيلات العميل أو تفاصيل أخرى..." : "Client preferences or specifics..."}
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
              {clientToEdit ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة العميل" : "Add Client")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
