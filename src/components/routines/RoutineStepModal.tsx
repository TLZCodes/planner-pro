import React, { useState, memo } from "react";
import { X, Clock, Sparkles, Check, Bell } from "lucide-react";
import { type RoutineStep, type RoutineSectionKey } from "@/lib/store";
import { type PrayerName, type PrayerRelation } from "@/lib/prayer";
import { cn } from "@/lib/utils";

const EMOJI_PALETTE = [
  "🌅", "🕌", "📿", "📖", "💧", "🛏️", "🧴", "🥑", "📝", "🎯",
  "🥗", "☕", "💻", "🏃‍♀️", "🛁", "🍲", "✍️", "🧺", "📵", "🌙",
  "🕯️", "👗", "📋", "☀️", "✨", "🌸", "🤍", "🧘‍♀️", "🚿", "🤲",
  "🧹", "🧠", "💡", "⏱️", "🍵", "💅", "💎", "🌸"
];

const SECTION_DEFS: { key: RoutineSectionKey; titleEn: string; titleAr: string; icon: string }[] = [
  { key: "morning", titleEn: "Morning ☀️", titleAr: "الصباح ☀️", icon: "☀️" },
  { key: "day", titleEn: "Day & Focus 📚", titleAr: "النهار والتركيز 📚", icon: "📚" },
  { key: "afternoon", titleEn: "Afternoon 🌿", titleAr: "بعد الظهر 🌿", icon: "🌿" },
  { key: "evening", titleEn: "Evening 🌙", titleAr: "المساء 🌙", icon: "🌙" },
  { key: "night", titleEn: "Night & Sleep 💤", titleAr: "الليل والنوم 💤", icon: "💤" },
];

export interface RoutineStepModalProps {
  isOpen: boolean;
  step: RoutineStep | null;
  defaultSection?: RoutineSectionKey;
  isAr: boolean;
  onSave: (payload: Partial<RoutineStep>) => void;
  onCancel: () => void;
}

export const RoutineStepModal = memo(function RoutineStepModal({
  isOpen,
  step,
  defaultSection = "morning",
  isAr,
  onSave,
  onCancel,
}: RoutineStepModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState(step?.title || "");
  const [emoji, setEmoji] = useState(step?.emoji || "✨");
  const [section, setSection] = useState<RoutineSectionKey>(step?.section || defaultSection);
  const [schedType, setSchedType] = useState<"fixed" | "prayer" | "none">(step?.schedulingType || "fixed");
  const [fixedTime, setFixedTime] = useState(step?.time || "08:00");
  const [prayerName, setPrayerName] = useState<PrayerName>((step?.prayerName as PrayerName) || "Fajr");
  const [prayerRel, setPrayerRel] = useState<PrayerRelation>(step?.prayerRelation || "at");
  const [prayerOffset, setPrayerOffset] = useState<number>(step?.prayerOffsetMinutes || 0);
  const [duration, setDuration] = useState<number>(step?.durationMinutes || 15);
  const [reminder, setReminder] = useState<boolean>(step?.reminder || false);
  const [notes, setNotes] = useState<string>(step?.notes || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      title: name.trim(),
      titleAr: name.trim(),
      emoji,
      section,
      schedulingType: schedType,
      time: schedType === "fixed" ? fixedTime : (step?.time || "08:00"),
      prayerName: schedType === "prayer" ? prayerName : undefined,
      prayerRelation: schedType === "prayer" ? prayerRel : undefined,
      prayerOffsetMinutes: schedType === "prayer" ? Number(prayerOffset) || 0 : undefined,
      durationMinutes: Number(duration) || undefined,
      reminder,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h3 className="text-[17px] font-bold text-ink">
              {step
                ? isAr
                  ? "تعديل خطوة الروتين ✨"
                  : "Edit Routine Step ✨"
                : isAr
                ? "إضافة خطوة جديدة ✨"
                : "Add New Step ✨"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer p-1.5 rounded-full hover:bg-surface text-ink-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "اسم الخطوة / النشاط *" : "Step Title / Activity *"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "مثال: ورد القرآن، تدوين الامتنان..." : "e.g. Quran recitation, gratitude..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm font-bold text-ink outline-none focus:border-hotpink"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "الأيقونة والرمز" : "Emoji Icon"}
            </label>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 text-lg">
              {EMOJI_PALETTE.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border",
                    emoji === e && "ring-2 ring-hotpink scale-110 bg-pink-50 dark:bg-pink-950/60"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "الفترة الزمنية (القسم)" : "Routine Section"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SECTION_DEFS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  className={cn(
                    "cursor-pointer p-2 rounded-xl text-center border text-[11.5px] font-bold transition-colors",
                    section === s.key ? "bg-hotpink/10 border-hotpink text-hotpink" : "bg-surface border-border text-ink-light"
                  )}
                >
                  {isAr ? s.titleAr : s.titleEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "نوع التوقيت والجدولة" : "Scheduling Type"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSchedType("fixed")}
                className={cn(
                  "cursor-pointer p-2.5 rounded-xl border text-center text-xs font-bold transition-all",
                  schedType === "fixed" ? "bg-hotpink text-white border-transparent shadow-xs" : "bg-surface border-border text-ink-light"
                )}
              >
                {isAr ? "ساعة محددة ⏰" : "Fixed Time ⏰"}
              </button>
              <button
                type="button"
                onClick={() => setSchedType("prayer")}
                className={cn(
                  "cursor-pointer p-2.5 rounded-xl border text-center text-xs font-bold transition-all",
                  schedType === "prayer" ? "bg-hotpink text-white border-transparent shadow-xs" : "bg-surface border-border text-ink-light"
                )}
              >
                {isAr ? "مرتبط بالصلاة 🕌" : "Prayer-linked 🕌"}
              </button>
            </div>
          </div>

          {schedType === "fixed" ? (
            <div>
              <label className="text-[12px] font-bold text-ink block mb-1">
                {isAr ? "وقت التنفيذ (الساعة)" : "Execution Time"}
              </label>
              <input
                type="time"
                value={fixedTime}
                onChange={(e) => setFixedTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-sm font-bold text-ink outline-none focus:border-hotpink"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 bg-surface p-3 rounded-2xl border border-border/80">
              <div>
                <label className="text-[11px] font-bold text-ink block mb-1">
                  {isAr ? "الصلاة" : "Prayer"}
                </label>
                <select
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value as PrayerName)}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs font-bold text-ink outline-none"
                >
                  <option value="Fajr">{isAr ? "الفجر" : "Fajr"}</option>
                  <option value="Sunrise">{isAr ? "الشروق" : "Sunrise"}</option>
                  <option value="Dhuhr">{isAr ? "الظهر" : "Dhuhr"}</option>
                  <option value="Asr">{isAr ? "العصر" : "Asr"}</option>
                  <option value="Maghrib">{isAr ? "المغرب" : "Maghrib"}</option>
                  <option value="Isha">{isAr ? "العشاء" : "Isha"}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink block mb-1">
                  {isAr ? "العلاقة" : "Relation"}
                </label>
                <select
                  value={prayerRel}
                  onChange={(e) => setPrayerRel(e.target.value as PrayerRelation)}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs font-bold text-ink outline-none"
                >
                  <option value="at">{isAr ? "مع الأذان" : "At prayer"}</option>
                  <option value="before">{isAr ? "قبل بـ" : "Before"}</option>
                  <option value="after">{isAr ? "بعد بـ" : "After"}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink block mb-1">
                  {isAr ? "الفارق (دقيقة)" : "Offset (min)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={prayerOffset}
                  onChange={(e) => setPrayerOffset(Number(e.target.value))}
                  disabled={prayerRel === "at"}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs font-bold text-ink outline-none disabled:opacity-40"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] font-bold text-ink block mb-1">
                {isAr ? "المدة المتوقعة (دقائق)" : "Duration (minutes)"}
              </label>
              <input
                type="number"
                min={1}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="cursor-pointer flex items-center gap-2 p-2.5 rounded-2xl bg-surface border border-border text-xs font-bold text-ink">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="h-4 w-4 rounded accent-hotpink cursor-pointer"
                />
                <Bell size={14} className="text-hotpink" />
                <span>{isAr ? "تفعيل تذكير 🔔" : "Reminder 🔔"}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "ملاحظات أو توجيهات (اختياري)" : "Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "أضيفي نصيحة أو تفاصيل..." : "Add tips or details..."}
              autoComplete="off"
              dir="auto"
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white font-extrabold text-[14px] shadow-rose-sm active:scale-98 transition-transform"
            >
              {step ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "إضافة الخطوة ✨" : "Add Step ✨")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-5 py-3.5 rounded-2xl bg-surface text-ink-light font-bold text-[13.5px] border border-border hover:bg-card"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
