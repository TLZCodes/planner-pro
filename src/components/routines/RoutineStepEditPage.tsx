import React, { useState, memo } from "react";
import { ArrowLeft, X, Clock, Bell, Check } from "lucide-react";
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

export interface RoutineStepEditPageProps {
  step: RoutineStep | null;
  defaultSection?: RoutineSectionKey;
  isAr: boolean;
  onSave: (payload: Partial<RoutineStep>) => void;
  onCancel: () => void;
}

export const RoutineStepEditPage = memo(function RoutineStepEditPage({
  step,
  defaultSection = "morning",
  isAr,
  onSave,
  onCancel,
}: RoutineStepEditPageProps) {
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
              {step ? (isAr ? "تعديل خطوة الروتين ✨" : "Edit Step ✨") : (isAr ? "خطوة جديدة ✨" : "New Step ✨")}
            </h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? "حددي اسم النشاط ووقته والتذكير" : "Set step activity, timing, and reminder"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Page Form Body */}
      <form onSubmit={handleSave} className="flex-1 px-4 py-5 space-y-4 max-w-xl mx-auto w-full">
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
          <label className="text-[12px] font-bold text-ink block mb-1">
            {isAr ? "اسم الخطوة / النشاط *" : "Step Title / Activity *"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "مثال: ورد القرآن، فطور صحي، تدوين الامتنان..." : "e.g. Quran recitation, healthy breakfast..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            dir="auto"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-ink outline-none focus:border-hotpink"
            required
          />
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
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

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
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

        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
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

          {schedType === "fixed" ? (
            <div>
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
                <label className="text-[11px] font-bold text-ink block mb-1">{isAr ? "الصلاة" : "Prayer"}</label>
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
                <label className="text-[11px] font-bold text-ink block mb-1">{isAr ? "الموضع" : "Relation"}</label>
                <select
                  value={prayerRel}
                  onChange={(e) => setPrayerRel(e.target.value as PrayerRelation)}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs font-bold text-ink outline-none"
                >
                  <option value="at">{isAr ? "عند الأذان" : "At prayer"}</option>
                  <option value="before">{isAr ? "قبل بـ" : "Before"}</option>
                  <option value="after">{isAr ? "بعد بـ" : "After"}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink block mb-1">{isAr ? "الفارق" : "Offset"}</label>
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
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 space-y-2.5">
          <button
            type="submit"
            className="cursor-pointer w-full py-4 rounded-2xl grad-theme text-white text-[15px] font-extrabold shadow-rose-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} className="stroke-[3]" />
            <span>{step ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "إضافة الخطوة ✨" : "Add Step ✨")}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl border border-border/80 bg-surface/80 text-ink-light hover:text-ink text-xs font-bold transition-all text-center cursor-pointer active:scale-98"
          >
            {isAr ? "✕ إلغاء والرجوع للروتين" : "✕ Cancel & Return to Routines"}
          </button>
        </div>
      </form>
    </div>
  );
});
