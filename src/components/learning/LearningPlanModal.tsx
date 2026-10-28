import { useState, memo } from "react";
import { X, Calendar, Plus, Clock } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";

interface LearningPlanModalProps {
  open: boolean;
  onClose: () => void;
  defaultLearningItemId?: string;
}

export const LearningPlanModal = memo(function LearningPlanModal({
  open, onClose, defaultLearningItemId,
}: LearningPlanModalProps) {
  const { addLearningPlanItem, state } = useApp();
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [title, setTitle] = useState("");
  const [learningItemId, setLearningItemId] = useState(defaultLearningItemId || state.learningItems?.[0]?.id || "");
  const [localDate, setLocalDate] = useState(new Date().toISOString().slice(0, 10));
  const [plannedMinutes, setPlannedMinutes] = useState(30);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !learningItemId) return;

    addLearningPlanItem({
      title: title.trim(),
      learningItemId,
      localDate,
      plannedMinutes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden" dir={dir}>
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-hotpink/10 text-hotpink"><Calendar size={16} /></span>
            <h2 className="text-base font-bold text-ink font-sans font-bold">
              {isAr ? "جدولة جلسة دراسة / مهمة" : "Schedule Study Plan"}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "المادة / الهدف *" : "Subject / Item *"}</label>
            <select
              required
              value={learningItemId}
              onChange={(e) => setLearningItemId(e.target.value)}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60"
            >
              {(state.learningItems || []).map((it) => (
                <option key={it.id} value={it.id}>{it.icon} {it.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "موضوع الجلسة / المهمة *" : "Topic / Task Title *"}</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثلاً: حل تمارين الفصل الثاني، قراءة 20 صفحة..." : "e.g. Solve Chapter 2 exercises, read 20 pages..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60 focus:border-hotpink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-ink-light block mb-1">{isAr ? "التاريخ" : "Date"}</label>
              <input
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full rounded-xl bg-ghost px-3 py-2 text-xs text-ink outline-none border border-border/60"
              />
            </div>
            <div>
              <label className="font-bold text-ink-light block mb-1">{isAr ? "المدة المستهدفة (دقائق)" : "Duration (mins)"}</label>
              <input
                type="number"
                min="5"
                step="5"
                value={plannedMinutes}
                onChange={(e) => setPlannedMinutes(parseInt(e.target.value) || 30)}
                className="w-full rounded-xl bg-ghost px-3 py-2 text-xs text-ink outline-none border border-border/60 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-ghost text-ink-light text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95">
              {isAr ? "جدولة الخطة" : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
