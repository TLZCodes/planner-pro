import React, { useState, memo } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Smile,
  Tag,
  Heart,
  Sparkles,
  Zap,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import { type Goal, type GoalProgressMethod, todayKey } from "@/lib/store";
import { cn } from "@/lib/utils";

const EMOJI_PALETTE = [
  "🎯", "⭐", "💰", "💪", "📚", "🕌", "🌸", "🌿", "🚀", "🎓",
  "🎨", "🏡", "✈️", "💍", "💼", "🥑", "🏆", "💎", "💻", "🧠",
  "📖", "✨", "🤍", "🧘‍♀️", "🏃‍♀️", "🕯️", "📝", "🌍", "🔥", "👑"
];

export interface GoalEditPageProps {
  goal: Goal | null;
  allCategories: any[];
  activeFocusCount: number;
  isAr: boolean;
  onSave: (payload: Partial<Goal>) => void;
  onCancel: () => void;
  addCustomCategory?: (cat: string) => void;
}

export const GoalEditPage = memo(function GoalEditPage({
  goal,
  allCategories,
  activeFocusCount,
  isAr,
  onSave,
  onCancel,
  addCustomCategory,
}: GoalEditPageProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Your Goal
  const [formTitle, setFormTitle] = useState(goal?.title || "");
  const [formIcon, setFormIcon] = useState(goal?.icon || "🎯");
  const [formCategory, setFormCategory] = useState(goal?.area || "Personal");
  const [formDescription, setFormDescription] = useState(goal?.description || "");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Step 2: Your Why
  const [formWhy, setFormWhy] = useState(goal?.why || "");
  const [formSuccessVision, setFormSuccessVision] = useState(goal?.successVision || "");
  const [formNotes, setFormNotes] = useState(goal?.notes || "");

  // Step 3: Your Plan
  const [formStartDate, setFormStartDate] = useState(goal?.startDate || todayKey());
  const [formTargetDate, setFormTargetDate] = useState(goal?.targetDate || "2026-12-31");
  const [formTargetLabel, setFormTargetLabel] = useState(goal?.target || "Dec 2026");
  const [formMethod, setFormMethod] = useState<GoalProgressMethod>(goal?.progressMethod || "milestones");
  const [formMilestones, setFormMilestones] = useState<{ id: string; title: string; completed: boolean }[]>(
    goal?.milestones
      ? goal.milestones.map((m) => ({ id: m.id, title: m.title, completed: m.completed }))
      : [
          { id: "m-1", title: isAr ? "تحديد خطة العمل والبدء بأول خطوة" : "Define action plan and start step 1", completed: false },
          { id: "m-2", title: isAr ? "إنجاز 50% من المتطلبات الأساسية" : "Complete 50% of core requirements", completed: false },
          { id: "m-3", title: isAr ? "المراجعة والوصول للهدف النهائي بنجاح" : "Final review & complete goal successfully", completed: false },
        ]
  );
  const [formNewMilestone, setFormNewMilestone] = useState("");
  const [formStartValue, setFormStartValue] = useState(goal?.startingValue || 0);
  const [formCurrentValue, setFormCurrentValue] = useState(goal?.currentValue || 0);
  const [formTargetValue, setFormTargetValue] = useState(goal?.targetValue || 100);
  const [formUnit, setFormUnit] = useState(goal?.unit || "SAR");
  const [formManualProgress, setFormManualProgress] = useState(goal?.progress || 0);

  // Step 4: Your System
  const [formNextAction, setFormNextAction] = useState(goal?.nextAction || "");
  const [formCheckInFreq, setFormCheckInFreq] = useState<"weekly" | "monthly" | "custom" | "none">(goal?.checkInFrequency || "weekly");
  const [formReminder, setFormReminder] = useState(goal?.reminder || false);
  const [formIsFocus, setFormIsFocus] = useState(goal?.isFocusGoal ?? (activeFocusCount < 3));

  const handleWizardAddMilestone = () => {
    if (!formNewMilestone.trim()) return;
    setFormMilestones((prev) => [
      ...prev,
      { id: 'm-' + Math.random().toString(36).slice(2, 7), title: formNewMilestone.trim(), completed: false },
    ]);
    setFormNewMilestone("");
  };

  const handleWizardRemoveMilestone = (id: string) => {
    setFormMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;

    let computedProgress = 0;
    if (formMethod === "milestones" && formMilestones.length > 0) {
      const doneCount = formMilestones.filter((m) => m.completed).length;
      computedProgress = Math.round((doneCount / formMilestones.length) * 100);
    } else if (formMethod === "numeric") {
      const range = formTargetValue - formStartValue;
      computedProgress = range > 0 ? Math.min(100, Math.max(0, Math.round(((formCurrentValue - formStartValue) / range) * 100))) : 0;
    } else if (formMethod === "manual") {
      computedProgress = formManualProgress;
    }

    const payload: Partial<Goal> = {
      title: formTitle.trim(),
      icon: formIcon,
      area: formCategory,
      description: formDescription.trim() || undefined,
      why: formWhy.trim() || undefined,
      successVision: formSuccessVision.trim() || undefined,
      notes: formNotes.trim() || undefined,
      startDate: formStartDate,
      targetDate: formTargetDate,
      target: formTargetLabel || formTargetDate,
      progressMethod: formMethod,
      milestones:
        formMethod === "milestones"
          ? formMilestones.map((m, idx) => ({
              id: m.id,
              title: m.title,
              completed: m.completed,
              order: idx,
              weight: 1,
            }))
          : [],
      startingValue: formMethod === "numeric" ? formStartValue : undefined,
      currentValue: formMethod === "numeric" ? formCurrentValue : undefined,
      targetValue: formMethod === "numeric" ? formTargetValue : undefined,
      unit: formMethod === "numeric" ? formUnit : undefined,
      progress: computedProgress,
      nextAction: formNextAction.trim() || undefined,
      checkInFrequency: formCheckInFreq,
      reminder: formReminder,
      isFocusGoal: formIsFocus,
      status: computedProgress >= 100 ? "completed" : (goal?.status || "active"),
    };

    onSave(payload);
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
              {goal ? (isAr ? "تعديل الهدف ✨" : "Edit Goal ✨") : (isAr ? "هدف جديد ✨" : "New Goal ✨")}
            </h2>
            <p className="text-[11px] font-semibold text-ink-light">
              {isAr ? 'الخطوة ' + wizardStep + ' من 4' : 'Step ' + wizardStep + ' of 4'}
            </p>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="px-5 pt-3 pb-1 max-w-xl mx-auto w-full">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              onClick={() => setWizardStep(stepNum as any)}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer",
                stepNum <= wizardStep ? "grad-theme shadow-rose-sm" : "bg-ghost"
              )}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-4 space-y-4 max-w-xl mx-auto w-full">
        {/* STEP 1 */}
        {wizardStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light">
                {isAr ? "عنوان الهدف (مطلوب) *" : "Goal Title (Required) *"}
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={isAr ? "مثال: ادخار 20,000 ريال، التخرج مع مرتبة الشرف..." : "e.g. Save 20,000, Graduate with honours..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-bold text-ink outline-none focus:border-hotpink transition-colors"
              />
            </div>

            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2.5">
              <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                <Smile size={14} className="text-hotpink" />
                <span>{isAr ? "أيقونة أو رمز الهدف" : "Goal Icon / Emoji"}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_PALETTE.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormIcon(emoji)}
                    className={cn(
                      "cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl text-xl border transition-all active:scale-90",
                      formIcon === emoji ? "border-hotpink bg-hotpink/10 shadow-rose-sm scale-110" : "border-border bg-surface hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2.5">
              <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                <Tag size={14} className="text-purple-500" />
                <span>{isAr ? "مجال الحياة (التصنيف)" : "Life Area (Category)"}</span>
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

            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light">
                {isAr ? "وصف مختصر (اختياري)" : "Short Description (Optional)"}
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={isAr ? "أضيفي ملخصاً أو تفاصيل موجزة عن الهدف..." : "Add a brief summary or notes about this goal..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {wizardStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500" />
                <span>{isAr ? "لماذا هذا الهدف مهم لكِ الآن؟" : "Why is this goal important to you now?"}</span>
              </label>
              <textarea
                rows={3}
                value={formWhy}
                onChange={(e) => setFormWhy(e.target.value)}
                placeholder={isAr ? "اكتبي شعوركِ والسبب الذي يجعلكِ مستعدة لبذل الجهد لتحقيقه..." : "Write down your motivation, purpose and why you care deeply..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
              />
            </div>

            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>{isAr ? "كيف سيبدو أو يشعركِ النجاح عند تحقيقه؟" : "What will success look or feel like?"}</span>
              </label>
              <textarea
                rows={3}
                value={formSuccessVision}
                onChange={(e) => setFormSuccessVision(e.target.value)}
                placeholder={isAr ? "تصوري اللحظة التي تكتمل فيها المهمة..." : "Visualize the moment you finish..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {wizardStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light">
                {isAr ? "طريقة قياس التقدم:" : "Tracking Method:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "milestones", labelAr: "المحطات", labelEn: "Milestones", icon: "🚩" },
                  { id: "numeric", labelAr: "قيمة رقمية", labelEn: "Target Value", icon: "🔢" },
                  { id: "manual", labelAr: "شريط يدوي", labelEn: "Manual Bar", icon: "📊" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormMethod(m.id as any)}
                    className={cn(
                      "cursor-pointer p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1",
                      formMethod === m.id ? "grad-theme text-white border-transparent shadow-rose-sm scale-105" : "bg-surface border-border text-ink-light hover:text-ink"
                    )}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-extrabold">{isAr ? m.labelAr : m.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {formMethod === "milestones" && (
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-ink-light">
                    {isAr ? "محطات الإنجاز المرحلية:" : "Key Milestone Steps:"}
                  </label>
                  <span className="text-[11px] font-bold text-hotpink">
                    {formMilestones.filter((m) => m.completed).length}/{formMilestones.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {formMilestones.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormMilestones((prev) =>
                              prev.map((item) => (item.id === m.id ? { ...item, completed: !item.completed } : item))
                            );
                          }}
                          className={cn(
                            "cursor-pointer flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                            m.completed ? "grad-theme border-transparent text-white" : "border-border bg-card"
                          )}
                        >
                          {m.completed && <Check size={11} className="stroke-[3]" />}
                        </button>
                        <span className={cn("text-xs font-bold truncate", m.completed && "line-through text-ink-light")}>
                          {idx + 1}. {m.title}
                        </span>
                      </div>
                      <button type="button" onClick={() => handleWizardRemoveMilestone(m.id)} className="cursor-pointer text-ink-light hover:text-rose-500 p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={formNewMilestone}
                    onChange={(e) => setFormNewMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleWizardAddMilestone();
                      }
                    }}
                    placeholder={isAr ? "أضيفي محطة جديدة..." : "Add milestone..."}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    dir="auto"
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-ink outline-none"
                  />
                  <button type="button" onClick={handleWizardAddMilestone} className="cursor-pointer px-3.5 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-xs">
                    {isAr ? "إضافة" : "Add"}
                  </button>
                </div>
              </div>
            )}

            {formMethod === "numeric" && (
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-ink-light mb-1">{isAr ? "البداية:" : "Start:"}</label>
                    <input type="number" value={formStartValue} onChange={(e) => setFormStartValue(Number(e.target.value))} className="w-full rounded-xl border border-border bg-surface p-2 text-xs font-bold text-ink outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-ink-light mb-1">{isAr ? "الحالية:" : "Current:"}</label>
                    <input type="number" value={formCurrentValue} onChange={(e) => setFormCurrentValue(Number(e.target.value))} className="w-full rounded-xl border border-hotpink bg-surface p-2 text-xs font-bold text-ink outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-ink-light mb-1">{isAr ? "المستهدفة:" : "Target:"}</label>
                    <input type="number" value={formTargetValue} onChange={(e) => setFormTargetValue(Number(e.target.value))} className="w-full rounded-xl border border-border bg-surface p-2 text-xs font-bold text-ink outline-none" />
                  </div>
                </div>
              </div>
            )}

            {formMethod === "manual" && (
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-extrabold text-ink">
                  <span>{isAr ? "نسبة التقدم الحالية:" : "Current Progress:"}</span>
                  <span className="font-mono text-hotpink text-sm">{formManualProgress}%</span>
                </div>
                <input type="range" min="0" max="100" value={formManualProgress} onChange={(e) => setFormManualProgress(Number(e.target.value))} className="w-full accent-hotpink cursor-pointer h-2 bg-ghost rounded-lg" />
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {wizardStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                <Zap size={14} className="text-hotpink" />
                <span>{isAr ? "أصغر خطوة تالية يمكنكِ البدء بها اليوم؟" : "Next immediate action?"}</span>
              </label>
              <input
                type="text"
                value={formNextAction}
                onChange={(e) => setFormNextAction(e.target.value)}
                placeholder={isAr ? "مثال: فتح حساب، قراءة أول صفحة..." : "e.g. Open account, read page 1..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-bold text-ink outline-none focus:border-hotpink"
              />
            </div>

            <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <div>
                  <span className="text-xs font-extrabold text-ink block">
                    {isAr ? "إضافة إلى أهدافي الأساسية ⭐" : "Add to Focus Goals ⭐"}
                  </span>
                </div>
              </div>
              <input type="checkbox" checked={formIsFocus} onChange={(e) => setFormIsFocus(e.target.checked)} className="h-5 w-5 rounded-lg accent-hotpink cursor-pointer" />
            </div>
          </div>
        )}

        {/* Bottom Step Actions */}
        <div className="pt-3 flex gap-2">
          {wizardStep > 1 && (
            <button
              type="button"
              onClick={() => setWizardStep((prev) => (prev - 1) as any)}
              className="cursor-pointer py-3.5 px-5 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface"
            >
              {isAr ? "← السابق" : "← Back"}
            </button>
          )}

          {wizardStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (wizardStep === 1 && !formTitle.trim()) return;
                setWizardStep((prev) => (prev + 1) as any);
              }}
              disabled={wizardStep === 1 && !formTitle.trim()}
              className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isAr ? "المتابعة للخطوة التالية" : "Continue"}</span>
              <ChevronRight size={16} className="rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check size={16} className="stroke-[3]" />
              <span>{goal ? (isAr ? "حفظ التعديلات ✨" : "Save Changes ✨") : (isAr ? "أنشئي هدفي ✨" : "Create Goal ✨")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
