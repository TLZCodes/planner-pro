import React, { useState } from "react";
import {
  X,
  Plus,
  Clock,
  Calendar,
  Bell,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import {
  CARE_CATEGORIES,
  type CareCategory,
  type CareRecurrenceRule,
} from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface AddCareActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLinkExisting: () => void;
  initialValues?: {
    title?: string;
    icon?: string;
    category?: CareCategory;
    durationMinutes?: number;
    recurrenceRule?: CareRecurrenceRule;
  };
}

const EMOJIS = ["🌸", "🧴", "🍵", "🧘‍♀️", "🪟", "📵", "🚶‍♀️", "🛁", "✨", "📖", "📝", "🤲", "💌", "🛋️", "🌿", "💧", "🕯️", "☀️", "🌙"];

export const AddCareActivityModal: React.FC<AddCareActivityModalProps> = ({
  isOpen,
  onClose,
  onOpenLinkExisting,
  initialValues,
}) => {
  const { t, lang } = useLang();
  const { addCareActivity } = useApp();
  const isAr = lang === "ar";

  const [title, setTitle] = useState(initialValues?.title || "");
  const [icon, setIcon] = useState(initialValues?.icon || "🌸");
  const [category, setCategory] = useState<CareCategory>(
    initialValues?.category || "body"
  );
  const [recurrenceRule, setRecurrenceRule] = useState<CareRecurrenceRule>(
    initialValues?.recurrenceRule || "daily"
  );
  const [durationMinutes, setDurationMinutes] = useState(
    (initialValues?.durationMinutes || 10).toString()
  );
  const [preferredTime, setPreferredTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync when initialValues change
  React.useEffect(() => {
    if (initialValues) {
      if (initialValues.title) setTitle(initialValues.title);
      if (initialValues.icon) setIcon(initialValues.icon);
      if (initialValues.category) setCategory(initialValues.category);
      if (initialValues.durationMinutes) setDurationMinutes(initialValues.durationMinutes.toString());
      if (initialValues.recurrenceRule) setRecurrenceRule(initialValues.recurrenceRule);
    }
  }, [initialValues]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    addCareActivity({
      title: title.trim(),
      icon,
      category,
      recurrenceRule,
      estimatedDurationMinutes: parseInt(durationMinutes, 10) || 10,
      preferredTime: preferredTime || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      sourceType: "custom",
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border/70 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h3 className="text-base font-bold text-ink">
              {isAr ? "إضافة نشاط عناية جديد" : "Add Care Activity"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Link Existing Banner */}
        <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon size={14} className="text-pink-600 dark:text-pink-400" />
            <span className="text-xs text-ink">
              {isAr ? "لديكِ عادات أو روتين ترغبين بربطه؟" : "Have a Habit or Routine to link?"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLinkExisting();
            }}
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
          >
            {isAr ? "ربط عنصر موجود" : "Link Existing"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              {isAr ? "عنوان النشاط *" : "Activity Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: شاي الأعشاب الدافئ" : "e.g., Warm chamomile tea pause"}
              className="w-full rounded-2xl bg-surface border border-border/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-pink-500 transition-all"
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {isAr ? "الأيقونة" : "Icon"}
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={cn(
                    "p-2 rounded-2xl text-xl transition-all flex-shrink-0 border",
                    icon === e
                      ? "bg-pink-500/20 border-pink-500 scale-110 shadow-sm"
                      : "bg-surface border-border/40 hover:bg-ghost"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {isAr ? "التصنيف" : "Category"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CARE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    "p-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center gap-1",
                    category === cat.key
                      ? "bg-hotpink text-white border-hotpink font-bold shadow-sm"
                      : "bg-surface border-border/40 text-ink hover:bg-ghost"
                  )}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate w-full text-[11px]">
                    {isAr ? cat.labelAr : cat.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule / Recurrence */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {isAr ? "التكرار" : "Schedule"}
            </label>
            <div className="flex gap-1.5">
              {(
                [
                  { key: "daily", label: isAr ? "يومي" : "Daily" },
                  { key: "weekdays", label: isAr ? "أيام العمل" : "Weekdays" },
                  { key: "weekly", label: isAr ? "أسبوعي" : "Weekly" },
                  { key: "none", label: isAr ? "مرة واحدة" : "One-time" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRecurrenceRule(opt.key)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-medium border text-center transition-all",
                    recurrenceRule === opt.key
                      ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-400 font-bold"
                      : "bg-surface border-border/40 text-ink"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Preferred Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {isAr ? "المدة (دقائق)" : "Duration (mins)"}
              </label>
              <div className="flex items-center gap-1">
                {["5", "10", "15", "30"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationMinutes(d)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-semibold border",
                      durationMinutes === d
                        ? "bg-hotpink text-white border-hotpink"
                        : "bg-surface border-border/40 text-ink"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {isAr ? "الوقت المفضل (اختياري)" : "Preferred Time"}
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-xl bg-surface border border-border/50 px-2.5 py-1.5 text-xs text-ink outline-none"
              />
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-pink-500" />
              <div>
                <p className="text-xs font-bold text-ink">
                  {isAr ? "تذكير لطيف" : "Gentle Reminder"}
                </p>
                <p className="text-[10px] text-ink-light">
                  {isAr ? "إشعار هادئ في الوقت المحدد" : "Soft reminder notification"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-ink-light hover:text-ink hover:bg-surface"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-rose-sm active:scale-95 disabled:opacity-50"
            >
              {isAr ? "حفظ النشاط" : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
