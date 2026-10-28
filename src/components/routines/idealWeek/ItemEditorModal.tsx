import { useState } from "react";
import {
  type IdealWeekItem,
  type IdealWeekItemType,
  type BetweenPrayersPeriodId,
} from "@/lib/idealWeekEngine";
import type { Task, RoutineStep } from "@/lib/store";
import { cn } from "@/lib/utils";
import { X, Clock, Sparkles, Check, Trash2, Moon } from "lucide-react";

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekday: number;
  weekdayName: string;
  item: IdealWeekItem | null;
  onSave: (item: IdealWeekItem) => void;
  onDelete?: (itemId: string) => void;
  availableTasks: Task[];
  availableRoutines: { key: string; title: string; stepsCount: number }[];
  isAr: boolean;
}

export function ItemEditorModal({
  isOpen,
  onClose,
  weekday,
  weekdayName,
  item,
  onSave,
  onDelete,
  availableTasks,
  availableRoutines,
  isAr,
}: ItemEditorModalProps) {
  if (!isOpen) return null;

  const isEditing = Boolean(item);

  const [type, setType] = useState<IdealWeekItemType>(item?.type || "task_proposal");
  const [title, setTitle] = useState(item?.title || "");
  const [titleAr, setTitleAr] = useState(item?.titleAr || "");
  const [category, setCategory] = useState(item?.category || "Personal");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "day" | "evening" | "night">(
    item?.timeOfDay || "morning"
  );
  const [clockTime, setClockTime] = useState(item?.clockTime || "09:00");
  const [durationMinutes, setDurationMinutes] = useState(item?.durationMinutes || 45);
  const [crossesMidnight, setCrossesMidnight] = useState(Boolean(item?.crossesMidnight));
  const [notes, setNotes] = useState(item?.notes || "");
  const [routineKey, setRoutineKey] = useState(item?.routineKey || "morning");
  const [linkedTaskId, setLinkedTaskId] = useState(item?.linkedTaskId || "");
  const [prayerPeriodId, setPrayerPeriodId] = useState<BetweenPrayersPeriodId>(
    item?.prayerPeriodId || "fajr_dhuhr"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && type !== "routine") return;

    let finalTitle = title.trim();
    if (type === "routine") {
      const matchR = availableRoutines.find((r) => r.key === routineKey);
      finalTitle = matchR?.title || (isAr ? "روتين مخصص" : "Routine");
    }

    const compiled: IdealWeekItem = {
      id: item?.id || `item_${Date.now()}`,
      weekday,
      title: finalTitle,
      titleAr: titleAr.trim() || undefined,
      type,
      category,
      timeOfDay,
      clockTime,
      durationMinutes: Number(durationMinutes) || 0,
      crossesMidnight,
      notes: notes.trim() || undefined,
      routineKey: type === "routine" ? routineKey : undefined,
      linkedTaskId: type === "linked_task" ? linkedTaskId : undefined,
      prayerPeriodId,
      order: item?.order ?? 0,
    };

    onSave(compiled);
    onClose();
  };

  const TYPE_OPTIONS: { id: IdealWeekItemType; labelEn: string; labelAr: string; icon: string; descEn: string; descAr: string }[] = [
    {
      id: "task_proposal",
      labelEn: "Task Proposal",
      labelAr: "مهمة مقترحة",
      icon: "🎯",
      descEn: "Will be created as an active task only when you apply the week.",
      descAr: "ستُنشأ كمهمة حقيقية فقط عند اعتماد وتطبيق الأسبوع.",
    },
    {
      id: "routine",
      labelEn: "Routine",
      labelAr: "روتين",
      icon: "☀️",
      descEn: "Link an existing routine to repeat on this rhythm.",
      descAr: "ربط روتين من روتيناتي الحالية للتكرار بهذا اليوم.",
    },
    {
      id: "note",
      labelEn: "Planning Note",
      labelAr: "ملاحظة / نيّة",
      icon: "🕊️",
      descEn: "A gentle intention or note. Never mutates tasks or habits.",
      descAr: "نيّة أو توجيه هادئ، لا يُنشئ أي مهام أو عادات تلقائياً.",
    },
    {
      id: "linked_task",
      labelEn: "Link Existing Task",
      labelAr: "ربط مهمة موجودة",
      icon: "🔗",
      descEn: "Anchor an already created task to this day's rhythm.",
      descAr: "إدراج مهمة أنشئتِها مسبقاً ضمن إيقاع هذا اليوم.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/70 bg-surface/50">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
              {weekdayName} • {isEditing ? (isAr ? "تعديل العنصر" : "Edit Item") : (isAr ? "إضافة عنصر للإيقاع" : "Add Rhythm Item")}
            </span>
            <h3 className="text-base font-black text-ink">
              {isAr ? "تصميم نشاط اليوم 🌸" : "Design Rhythm Activity 🌸"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface text-ink-light hover:text-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Type Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-ink">
              {isAr ? "نوع النشاط" : "Activity Type"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={cn(
                    "cursor-pointer p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2.5",
                    type === opt.id
                      ? "border-hotpink bg-pink-50/70 dark:bg-pink-950/30 text-ink shadow-xs"
                      : "border-border/70 hover:border-border hover:bg-surface/50 text-ink-light"
                  )}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <div>
                    <span className="text-xs font-black block text-ink">
                      {isAr ? opt.labelAr : opt.labelEn}
                    </span>
                    <span className="text-[10px] text-ink-light line-clamp-1">
                      {isAr ? opt.descAr : opt.descEn}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Routine Selection */}
          {type === "routine" && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-surface border border-border/80">
              <label className="text-xs font-black text-ink block">
                {isAr ? "اختاري الروتين المرتبط" : "Select Routine"}
              </label>
              <select
                value={routineKey}
                onChange={(e) => setRoutineKey(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-bold text-ink"
              >
                {availableRoutines.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.title} ({r.stepsCount} {isAr ? "خطوات" : "steps"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Linked Task Selection */}
          {type === "linked_task" && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-surface border border-border/80">
              <label className="text-xs font-black text-ink block">
                {isAr ? "اختاري مهمة من قائمة مهامكِ" : "Select Existing Task"}
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => {
                  setLinkedTaskId(e.target.value);
                  const found = availableTasks.find((t) => t.id === e.target.value);
                  if (found) setTitle(found.title);
                }}
                className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-bold text-ink"
              >
                <option value="">{isAr ? "-- اختاري مهمة --" : "-- Select task --"}</option>
                {availableTasks.slice(0, 30).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.tag || "Task"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title Inputs (if not routine) */}
          {type !== "routine" && (
            <div className="space-y-2">
              <label className="text-xs font-black text-ink block">
                {isAr ? "عنوان النشاط" : "Activity Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? "مثال: جلسة عمل عميق أو قراءة" : "e.g. Deep focus sprint or reading"}
                className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-bold text-ink"
                required
              />
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={isAr ? "العنوان بالعربية (اختياري)" : "Arabic title (optional)"}
                className="w-full p-2 text-xs rounded-xl border border-border bg-card text-ink"
              />
            </div>
          )}

          {/* Time & Duration Fields */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-surface/60 border border-border/70">
            <div>
              <label className="text-[11px] font-black text-ink block mb-1">
                {isAr ? "وقت الساعة" : "Clock Time"}
              </label>
              <input
                type="time"
                value={clockTime}
                onChange={(e) => setClockTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-border bg-card text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-ink block mb-1">
                {isAr ? "المدة (بالدقائق)" : "Duration (mins)"}
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-border bg-card text-xs font-mono font-bold"
              />
            </div>

            {/* Time of Day */}
            <div>
              <label className="text-[11px] font-black text-ink block mb-1">
                {isAr ? "فترة اليوم" : "Time of Day"}
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-border bg-card text-xs font-bold"
              >
                <option value="morning">{isAr ? "الصباح ☀️" : "Morning ☀️"}</option>
                <option value="day">{isAr ? "النهار 📚" : "Day 📚"}</option>
                <option value="evening">{isAr ? "المساء 🌿" : "Evening 🌿"}</option>
                <option value="night">{isAr ? "الليل 💤" : "Night 💤"}</option>
              </select>
            </div>

            {/* Between the Prayers Period */}
            <div>
              <label className="text-[11px] font-black text-ink block mb-1">
                {isAr ? "بين الصلوات" : "Between Prayers"}
              </label>
              <select
                value={prayerPeriodId}
                onChange={(e) => setPrayerPeriodId(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-border bg-card text-xs font-bold"
              >
                <option value="after_fajr">{isAr ? "بعد الفجر 🌅" : "After Fajr 🌅"}</option>
                <option value="fajr_dhuhr">{isAr ? "الفجر ← الظهر ☀️" : "Fajr → Dhuhr ☀️"}</option>
                <option value="dhuhr_asr">{isAr ? "الظهر ← العصر 🕌" : "Dhuhr → Asr 🕌"}</option>
                <option value="asr_maghrib">{isAr ? "العصر ← المغرب 🌿" : "Asr → Maghrib 🌿"}</option>
                <option value="maghrib_isha">{isAr ? "المغرب ← العشاء 🕯️" : "Maghrib → Isha 🕯️"}</option>
                <option value="after_isha">{isAr ? "بعد العشاء 🌙" : "After Isha 🌙"}</option>
              </select>
            </div>
          </div>

          {/* Midnight Crossing Checkbox */}
          <label className="cursor-pointer flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 text-xs">
            <input
              type="checkbox"
              checked={crossesMidnight}
              onChange={(e) => setCrossesMidnight(e.target.checked)}
              className="accent-hotpink rounded h-4 w-4"
            />
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span>{isAr ? "يمتد هذا النشاط عبر منتصف الليل إلى اليوم التالي" : "This activity crosses midnight into next day"}</span>
            </div>
          </label>

          {/* Notes / Intention */}
          <div className="space-y-1">
            <label className="text-xs font-black text-ink block">
              {isAr ? "ملاحظة أو نيّة مرافقة" : "Gentle Note or Intention"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "مثال: التركيز على الجودة والراحة بدون استعجال..." : "e.g. Focus on presence and ease without rush..."}
              className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-medium resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/70">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (item) onDelete(item.id);
                  onClose();
                }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 text-xs font-bold"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isAr ? "حذف" : "Delete"}</span>
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-ink-light hover:bg-surface"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                className="cursor-pointer px-5 py-2.5 rounded-2xl grad-theme text-white text-xs font-black shadow-rose-sm active:scale-95 transition-transform"
              >
                {isAr ? "حفظ النشاط ✨" : "Save Activity ✨"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
