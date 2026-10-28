import React, { useState, memo } from "react";
import {
  X,
  Smile,
  Tag,
  Clock,
  Bell,
  Sparkles,
  Link2,
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

export interface HabitDrawerModalProps {
  habit: Habit | null;
  allCategories: any[];
  isAr: boolean;
  onSave: (payload: Partial<Habit>) => void;
  onCancel: () => void;
}

export const HabitDrawerModal = memo(function HabitDrawerModal({
  habit,
  allCategories,
  isAr,
  onSave,
  onCancel,
}: HabitDrawerModalProps) {
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

  const handleSave = () => {
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
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{formEmoji}</span>
            <h2 className="text-base font-extrabold text-ink">
              {habit ? (isAr ? "تعديل العادة ✨" : "Edit Habit ✨") : (isAr ? "عادة جديدة ✨" : "New Habit ✨")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                    formEmoji === emoji
                      ? "border-hotpink bg-hotpink/10 shadow-rose-sm scale-110"
                      : "border-border bg-surface hover:bg-muted"
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
                    formCategory === c.id
                      ? "grad-theme text-white border-transparent shadow-rose-md"
                      : "bg-surface border-border text-ink-light hover:text-ink"
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
                    formTrackingType === t.id
                      ? "grad-theme text-white border-transparent shadow-rose-sm scale-105"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-extrabold">{isAr ? t.labelAr : t.labelEn}</span>
                </button>
              ))}
            </div>

            {formTrackingType !== "check" && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <div>
                  <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                    {isAr ? "الهدف اليومي:" : "Daily Target:"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formTargetValue}
                    onChange={(e) => setFormTargetValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs font-bold text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                    {isAr ? "الوحدة:" : "Unit:"}
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder={formTrackingType === "duration" ? (isAr ? "دقيقة" : "mins") : (isAr ? "أكواب، صفحات..." : "cups, pages...")}
                    className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs font-bold text-ink outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <Calendar size={14} className="text-teal-500" />
              <span>{isAr ? "الجدول والتكرار:" : "Schedule:"}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormScheduleType("daily")}
                className={cn(
                  "cursor-pointer p-2.5 rounded-xl border text-xs font-bold transition-all",
                  formScheduleType === "daily" ? "grad-theme text-white border-transparent shadow-xs" : "bg-surface border-border text-ink-light"
                )}
              >
                {isAr ? "يومياً ✨" : "Daily ✨"}
              </button>
              <button
                type="button"
                onClick={() => setFormScheduleType("custom")}
                className={cn(
                  "cursor-pointer p-2.5 rounded-xl border text-xs font-bold transition-all",
                  formScheduleType === "custom" ? "grad-theme text-white border-transparent shadow-xs" : "bg-surface border-border text-ink-light"
                )}
              >
                {isAr ? "أيام محددة 📅" : "Specific Days 📅"}
              </button>
            </div>

            {formScheduleType === "custom" && (
              <div className="flex justify-between gap-1 pt-2">
                {[
                  { d: 0, ar: "ح", en: "S" },
                  { d: 1, ar: "ن", en: "M" },
                  { d: 2, ar: "ث", en: "T" },
                  { d: 3, ar: "ر", en: "W" },
                  { d: 4, ar: "خ", en: "T" },
                  { d: 5, ar: "ج", en: "F" },
                  { d: 6, ar: "س", en: "S" },
                ].map(({ d, ar, en }) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleToggleDay(d)}
                    className={cn(
                      "cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black border transition-all",
                      formScheduledDays.includes(d) ? "grad-theme text-white border-transparent shadow-xs" : "bg-surface border-border text-ink-light"
                    )}
                  >
                    {isAr ? ar : en}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
            <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
              <Link2 size={14} className="text-pink-500" />
              <span>{isAr ? "ملاحظات أو محفز العادة:" : "Notes / Habit Trigger:"}</span>
            </label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder={isAr ? "مثال: بعد صلاة الفجر، بعد قهوة الصباح..." : "e.g. After morning coffee, after shower..."}
              autoComplete="off"
              dir="auto"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3.5 pb-[calc(env(safe-area-inset-bottom,16px)+14px)] sm:pb-3.5 border-t border-border/60 bg-surface/50 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 py-3 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!formName.trim()}
            className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 disabled:opacity-50"
          >
            {habit ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "أنشئي العادة ✨" : "Create Habit ✨")}
          </button>
        </div>
      </div>
    </div>
  );
});
