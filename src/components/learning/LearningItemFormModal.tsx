import { useState, useEffect, memo } from "react";
import { X, Sparkles } from "lucide-react";
import {
  useApp, type LearningItem, type LearningItemType,
  type LearningProgressMethod, LEARNING_ITEM_COLORS, LEARNING_ITEM_ICONS
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LearningItemFormModalProps {
  item?: LearningItem | null;
  open: boolean;
  onClose: () => void;
  defaultType?: LearningItemType;
}

export const LearningItemFormModal = memo(function LearningItemFormModal({
  item, open, onClose, defaultType = "subject",
}: LearningItemFormModalProps) {
  const { addLearningItem, editLearningItem } = useApp();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const [title, setTitle] = useState("");
  const [type, setType] = useState<LearningItemType>(defaultType);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#8b5cf6");
  const [progressMethod, setProgressMethod] = useState<LearningProgressMethod>("study_time");
  const [weeklyTargetMinutes, setWeeklyTargetMinutes] = useState(180);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(0);
  const [totalLessons, setTotalLessons] = useState<number | undefined>(undefined);
  const [completedLessons, setCompletedLessons] = useState<number | undefined>(0);
  const [author, setAuthor] = useState("");
  const [platform, setPlatform] = useState("");
  const [instructor, setInstructor] = useState("");
  const [level, setLevel] = useState<string>("Beginner");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setType(item.type || "subject");
      setDescription(item.description || "");
      setIcon(item.icon || "📚");
      setColor(item.color || "#8b5cf6");
      setProgressMethod(item.progressMethod || "study_time");
      setWeeklyTargetMinutes(item.weeklyTargetMinutes || 180);
      setTotalPages(item.totalPages);
      setCurrentPage(item.currentPage || 0);
      setTotalLessons(item.totalLessons);
      setCompletedLessons(item.completedLessons || 0);
      setAuthor(item.author || "");
      setPlatform(item.platform || "");
      setInstructor(item.instructor || "");
      setLevel(item.level || "Beginner");
      setTargetDate(item.targetDate || "");
    } else {
      setTitle("");
      setType(defaultType);
      setDescription("");
      setIcon(LEARNING_ITEM_ICONS[defaultType]?.[0] || "📚");
      setColor(LEARNING_ITEM_COLORS[0]);
      setProgressMethod(
        defaultType === "book" ? "pages_read"
        : defaultType === "course" ? "lessons_completed"
        : defaultType === "skill" ? "manual_percentage"
        : "study_time"
      );
      setWeeklyTargetMinutes(180);
      setTotalPages(undefined);
      setCurrentPage(0);
      setTotalLessons(undefined);
      setCompletedLessons(0);
      setAuthor("");
      setPlatform("");
      setInstructor("");
      setLevel("Beginner");
      setTargetDate("");
    }
  }, [item, defaultType, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (item) {
      editLearningItem(item.id, {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        icon,
        color,
        progressMethod,
        weeklyTargetMinutes: progressMethod === "study_time" ? weeklyTargetMinutes : undefined,
        totalPages: type === "book" ? totalPages : undefined,
        currentPage: type === "book" ? currentPage : undefined,
        totalLessons: type === "course" ? totalLessons : undefined,
        completedLessons: type === "course" ? completedLessons : undefined,
        author: type === "book" ? author.trim() || undefined : undefined,
        platform: type === "course" ? platform.trim() || undefined : undefined,
        instructor: type === "course" ? instructor.trim() || undefined : undefined,
        level: type === "skill" ? (level as any) : undefined,
        targetDate: targetDate || undefined,
      });
    } else {
      addLearningItem({
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        icon,
        color,
        progressMethod,
        weeklyTargetMinutes: progressMethod === "study_time" ? weeklyTargetMinutes : undefined,
        totalPages: type === "book" ? totalPages : undefined,
        currentPage: type === "book" ? currentPage : undefined,
        totalLessons: type === "course" ? totalLessons : undefined,
        completedLessons: type === "course" ? completedLessons : undefined,
        author: type === "book" ? author.trim() || undefined : undefined,
        platform: type === "course" ? platform.trim() || undefined : undefined,
        instructor: type === "course" ? instructor.trim() || undefined : undefined,
        level: type === "skill" ? (level as any) : undefined,
        targetDate: targetDate || undefined,
      });
    }
    onClose();
  };

  const iconsList = LEARNING_ITEM_ICONS[type] || LEARNING_ITEM_ICONS.subject;

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden" dir={dir}>
        
        {/* Header */}
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-hotpink/10 text-hotpink"><Sparkles size={16} /></span>
            <h2 className="text-base font-bold text-ink font-sans font-bold">
              {item ? (isAr ? "تعديل عنصر التعلّم" : "Edit Learning Goal") : (isAr ? "إضافة هدف تعلّم جديد" : "New Learning Goal")}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Type Selector */}
          <div>
            <label className="font-bold text-ink-light block mb-1.5">{isAr ? "نوع الهدف" : "Type"}</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(["subject", "course", "book", "skill", "exam_prep"] as LearningItemType[]).map((tType) => (
                <button
                  type="button"
                  key={tType}
                  onClick={() => {
                    setType(tType);
                    setIcon(LEARNING_ITEM_ICONS[tType]?.[0] || "📚");
                    if (tType === "book") setProgressMethod("pages_read");
                    else if (tType === "course") setProgressMethod("lessons_completed");
                    else if (tType === "skill") setProgressMethod("manual_percentage");
                    else setProgressMethod("study_time");
                  }}
                  className={cn(
                    "py-2 px-1 rounded-xl text-center font-bold text-[11px] border transition-all",
                    type === tType
                      ? "border-hotpink bg-hotpink/15 text-hotpink shadow-xs"
                      : "border-border/60 bg-card text-ink-light hover:text-ink"
                  )}
                >
                  {t(`type${tType.charAt(0).toUpperCase() + tType.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-ink-light block mb-1.5">{isAr ? "العنوان *" : "Title *"}</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "book" ? (isAr ? "اسم الكتاب..." : "Book title...")
                : type === "course" ? (isAr ? "اسم الدورة..." : "Course title...")
                : type === "skill" ? (isAr ? "اسم المهارة..." : "Skill name...")
                : (isAr ? "اسم المادة (مثلاً: الرياضيات، البرمجة)..." : "Subject title (e.g. Mathematics)...")
              }
              className="w-full rounded-xl bg-ghost px-3.5 py-2.5 text-xs text-ink outline-none border border-border/60 focus:border-hotpink"
            />
          </div>

          {/* Icon & Color Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-ink-light block mb-1.5">{isAr ? "الأيقونة" : "Icon"}</label>
              <div className="flex gap-1.5 flex-wrap">
                {iconsList.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center text-base border transition-all",
                      icon === ic ? "border-hotpink bg-hotpink/20 scale-110" : "border-border/40 bg-card hover:bg-ghost"
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-ink-light block mb-1.5">{isAr ? "اللون" : "Theme Color"}</label>
              <div className="flex gap-1.5 flex-wrap">
                {LEARNING_ITEM_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform",
                      color === c ? "scale-125 border-ink" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Type-specific Fields */}
          {type === "book" && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-card border border-border/60">
              <div className="col-span-3 sm:col-span-1">
                <label className="font-bold text-ink-light block mb-1">{isAr ? "المؤلف" : "Author"}</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author"
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
              </div>
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "إجمالي الصفحات" : "Total Pages"}</label>
                <input type="number" min="1" value={totalPages || ""} onChange={(e) => setTotalPages(parseInt(e.target.value) || undefined)} placeholder="300"
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40 font-mono" />
              </div>
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "الصفحة الحالية" : "Current"}</label>
                <input type="number" min="0" value={currentPage || 0} onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40 font-mono" />
              </div>
            </div>
          )}

          {type === "course" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-card border border-border/60">
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "المنصة" : "Platform"}</label>
                <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Coursera / Udemy"
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
              </div>
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "المحاضر" : "Instructor"}</label>
                <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Instructor"
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
              </div>
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "إجمالي الدروس" : "Total Lessons"}</label>
                <input type="number" min="1" value={totalLessons || ""} onChange={(e) => setTotalLessons(parseInt(e.target.value) || undefined)} placeholder="20"
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40 font-mono" />
              </div>
              <div>
                <label className="font-bold text-ink-light block mb-1">{isAr ? "المكتملة" : "Completed"}</label>
                <input type="number" min="0" value={completedLessons || 0} onChange={(e) => setCompletedLessons(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40 font-mono" />
              </div>
            </div>
          )}

          {type === "skill" && (
            <div className="p-3 rounded-2xl bg-card border border-border/60">
              <label className="font-bold text-ink-light block mb-1">{isAr ? "المستوى الحالي" : "Skill Level"}</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((lvl) => (
                  <button type="button" key={lvl} onClick={() => setLevel(lvl)}
                    className={cn(
                      "py-1.5 rounded-xl text-center text-xs font-bold border transition-all",
                      level === lvl ? "border-hotpink bg-hotpink/15 text-hotpink" : "border-border/40 bg-ghost text-ink-light"
                    )}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tracking Method */}
          <div>
            <label className="font-bold text-ink-light block mb-1.5">{isAr ? "طريقة حساب التقدم" : "Progress Tracking Method"}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(["study_time", "lessons_completed", "modules_completed", "pages_read", "manual_percentage"] as LearningProgressMethod[]).map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setProgressMethod(pm)}
                  className={cn(
                    "p-2 rounded-xl text-center font-bold text-[10px] border transition-all",
                    progressMethod === pm
                      ? "border-hotpink bg-hotpink/15 text-hotpink"
                      : "border-border/40 bg-card text-ink-light hover:text-ink"
                  )}
                >
                  {pm === "study_time" ? (isAr ? "⏱️ وقت المذاكرة" : "⏱️ Study Time")
                    : pm === "lessons_completed" ? (isAr ? "📖 إكمال الدروس" : "📖 Lessons")
                    : pm === "modules_completed" ? (isAr ? "📦 إكمال الوحدات" : "📦 Modules")
                    : pm === "pages_read" ? (isAr ? "📄 قراءة الصفحات" : "📄 Pages")
                    : (isAr ? "🎯 نسبة مئوية" : "🎯 Manual %")}
                </button>
              ))}
            </div>
          </div>

          {progressMethod === "study_time" && (
            <div>
              <label className="font-bold text-ink-light block mb-1">{isAr ? "الهدف الأسبوعي بالدقائق" : "Weekly Target (minutes)"}</label>
              <input
                type="number"
                min="10"
                step="10"
                value={weeklyTargetMinutes}
                onChange={(e) => setWeeklyTargetMinutes(parseInt(e.target.value) || 180)}
                className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60 font-mono"
              />
            </div>
          )}

          {/* Target Date */}
          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "تاريخ الإنجاز المستهدف (اختياري)" : "Target Completion Date (Optional)"}</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-ink-light block mb-1">{isAr ? "ملاحظة أو وصف (اختياري)" : "Notes / Description"}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "أهدافكِ وما تريدين تحقيقه في هذا المسار..." : "Your goals and expectations..."}
              className="w-full rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/60 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-ghost text-ink-light text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95">
              {item ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة الهدف" : "Create Goal")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
