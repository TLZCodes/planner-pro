import React, { useState, memo } from "react";
import {
  ArrowLeft,
  Smile,
  Tag,
  Clock,
  Bell,
  Calendar,
  Check,
} from "lucide-react";
import {
  type Habit,
  type HabitTrackingType,
  type HabitScheduleType,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const EMOJI_PALETTE_HABITS = [
  "🌸", "💧", "📚", "🧘‍♀️", "🏃‍♀️", "✨", "🌙", "🥑",
  "💪", "🎨", "✍️", "💰", "🌿", "🍎", "☕", "🕯️",
  "🎯", "🌅", "🛌", "🚶‍♀️", "🎧", "📵", "🧴", "💊",
  "🧹", "🍳", "💡", "🪴", "📖", "🦷", "🤍", "🧎‍♀️"
];

export interface HabitEditPageProps {
  habit: Habit | null;
  allCategories: any[];
  isAr: boolean;
  onSave: (payload: Partial<Habit>) => void;
  onCancel: () => void;
}

export const HabitEditPage = memo(function HabitEditPage({
  habit,
  allCategories,
  isAr,
  onSave,
  onCancel,
}: HabitEditPageProps) {
  const [formName, setFormName] = useState(habit?.name || "");
  const [formEmoji, setFormEmoji] = useState(habit?.emoji || "🌸");
  const [formCategory, setFormCategory] = useState(habit?.category || "Health");
  const [formTrackingType, setFormTrackingType] = useState<HabitTrackingType>(habit?.trackingType || "check");
  const [formTargetValue, setFormTargetValue] = useState(habit?.targetValue || 1);
  const [formUnit, setFormUnit] = useState(habit?.unit || "");
  const [formScheduleType, setFormScheduleType] = useState<HabitScheduleType>(habit?.scheduleType || "daily");
  const [formScheduledDays, setFormScheduledDays] = useState<number[]>(habit?.scheduledDays || [0, 1, 2, 3, 4, 5, 6]);
  const [formPreferredTime, setFormPreferredTime] = useState(habit?.preferredTime || "");
  const [formReminder, setFormReminder] = useState(Boolean(habit?.reminder));
  const [formReminderTime, setFormReminderTime] = useState(habit?.reminderTime || "08:00");
  const [formNotes, setFormNotes] = useState(habit?.notes || "");

  const handleToggleDay = (d: number) => {
    setFormScheduledDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim()) return;

    onSave({
      name: formName.trim(),
      emoji: formEmoji,
      category: formCategory,
      trackingType: formTrackingType,
      targetValue: formTrackingType === "check" ? 1 : Number(formTargetValue) || 1,
      unit: formTrackingType === "check" ? undefined : formUnit.trim() || undefined,
      scheduleType: formScheduleType,
      scheduledDays: formScheduleType === "custom" ? formScheduledDays : [0, 1, 2, 3, 4, 5, 6],
      preferredTime: formPreferredTime.trim() || undefined,
      reminder: formReminder,
      reminderTime: formReminder ? formReminderTime : undefined,
      notes: formNotes.trim() || undefined,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink pb-32 animate-fade-in">
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer pointer-events-auto touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface/90 border border-border text-ink hover:bg-surface active:scale-90 transition-transform shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
          </button>
          <div>
            <h2 className="font-display text-[17px] font-bold text-ink leading-tight">
              {habit ? (isAr ? "تعديل العادة ✨" : "Edit Habit ✨") : (isAr ? "عادة جديدة ✨" : "New Habit ✨")}
            </h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "حددي اسم العادة وتكرارها وطريقة قياسها" : "Set habit name, tracking, and schedule"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Page Form Body */}
      <form onSubmit={handleSave} className="flex-1 px-4 py-5 space-y-4 max-w-xl mx-auto w-full">
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="block text-xs font-extrabold text-ink-light">
            {isAr ? "اسم العادة (مطلوب) *" : "Habit Name (Required) *"}
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={isAr ? "مثال: شرب الماء، القراءة 15 دقيقة..." : "e.g. Drink water, read 15 mins..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            dir="auto"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-ink outline-none focus:border-hotpink transition-colors"
            required
          />
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
            <Smile size={14} className="text-hotpink" />
            <span>{isAr ? "أيقونة أو رمز العادة" : "Habit Icon / Emoji"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PALETTE_HABITS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormEmoji(emoji)}
                className={cn(
                  "cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl text-lg border transition-all active:scale-90",
                  formEmoji === emoji ? "border-hotpink bg-hotpink/10 shadow-rose-sm scale-110" : "border-border bg-surface hover:bg-muted"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
            <Tag size={14} className="text-purple-500" />
            <span>{isAr ? "تصنيف العادة" : "Category"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFormCategory(c.id)}
                className={cn(
                  "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5",
                  formCategory === c.id ? "grad-theme text-white border-transparent shadow-rose-md" : "bg-surface border-border text-ink-light hover:text-ink"
                )}
              >
                <span>{c.emoji}</span>
                <span>{isAr ? c.labelAr : c.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
          <label className="block text-xs font-extrabold text-ink-light">
            {isAr ? "نوع التتبع والقياس:" : "Tracking Type:"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "check", labelAr: "صح / خطأ", labelEn: "Checkbox", icon: "✓" },
              { id: "count", labelAr: "عدد مرات", labelEn: "Count", icon: "🔢" },
              { id: "duration", labelAr: "مدة زمنية", labelEn: "Timer", icon: "⏱️" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormTrackingType(t.id as any)}
                className={cn(
                  "cursor-pointer p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1",
                  formTrackingType === t.id ? "grad-theme text-white border-transparent shadow-rose-sm scale-105" : "bg-surface border-border text-ink-light hover:text-ink"
                )}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs font-extrabold">{isAr ? t.labelAr : t.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 space-y-2.5">
          <button
            type="submit"
            disabled={!formName.trim()}
            className="cursor-pointer w-full py-4 rounded-2xl grad-theme text-white text-[15px] font-extrabold shadow-rose-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check size={18} className="stroke-[3]" />
            <span>{habit ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "أنشئي العادة ✨" : "Create Habit ✨")}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl border border-border/80 bg-surface/80 text-ink-light hover:text-ink text-xs font-bold transition-all text-center cursor-pointer active:scale-98"
          >
            {isAr ? "✕ إلغاء والرجوع للعادات" : "✕ Cancel & Return to Habits"}
          </button>
        </div>
      </form>
    </div>
  );
});
