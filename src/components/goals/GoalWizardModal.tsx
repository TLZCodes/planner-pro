import React, { useState, memo } from "react";
import {
  X,
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
import { type Goal, type GoalProgressMethod } from "@/lib/store";
import { cn } from "@/lib/utils";

const EMOJI_PALETTE = [
  "🎯", "⭐", "💰", "💪", "📚", "🕌", "🌸", "🌿", "🚀", "🎓",
  "🎨", "🏡", "✈️", "💍", "💼", "🥑", "🏆", "💎", "💻", "🧠",
  "📖", "✨", "🤍", "🧘‍♀️", "🏃‍♀️", "🕯️", "📝", "🌍", "🔥", "👑"
];

export interface GoalWizardModalProps {
  goal: Goal | null;
  allCategories: any[];
  activeFocusCount: number;
  isAr: boolean;
  todayStr: string;
  onSave: (payload: Partial<Goal>) => void;
  onCancel: () => void;
  addCustomCategory?: (cat: string) => void;
}

export const GoalWizardModal = memo(function GoalWizardModal({
  goal,
  allCategories,
  activeFocusCount,
  isAr,
  todayStr,
  onSave,
  onCancel,
  addCustomCategory,
}: GoalWizardModalProps) {
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
  const [formStartDate, setFormStartDate] = useState(goal?.startDate || todayStr);
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
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xl bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-border/80 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{formIcon}</span>
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {goal ? (isAr ? "تعديل الهدف ✨" : "Edit Goal ✨") : (isAr ? "هدف جديد ✨" : "New Goal ✨")}
              </h2>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? 'الخطوة ' + wizardStep + ' من 4' : 'Step ' + wizardStep + ' of 4'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink transition-colors"
            title={isAr ? "إغلاق" : "Close"}
          >
            <X size={17} />
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="px-5 pt-3 pb-1 shrink-0">
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

        {/* Scrollable Wizard Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* STEP 1: YOUR GOAL */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-1">
                <h3 className="text-lg font-black text-ink">
                  {isAr ? "ما الذي تريدين تحقيقه؟ ✨" : "What do you want to achieve? ✨"}
                </h3>
                <p className="text-xs font-semibold text-ink-light mt-0.5">
                  {isAr ? "حددي عنوان هدفكِ ومجال الحياة الذي ينتمي إليه" : "Define your goal title and life area"}
                </p>
              </div>

              {/* Title Input */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light">
                  {isAr ? "عنوان الهدف (مطلوب) *" : "Goal Title (Required) *"}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    isAr ? "مثال: ادخار 20,000 ريال، التخرج مع مرتبة الشرف..." : "e.g. Save 20,000, Graduate with honours..."
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-bold text-ink outline-none focus:border-hotpink transition-colors"
                />
              </div>

              {/* Emoji Palette Selector */}
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
                        formIcon === emoji
                          ? "border-hotpink bg-hotpink/10 shadow-rose-sm scale-110"
                          : "border-border bg-surface hover:bg-muted"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Life Area Selector */}
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
                        formCategory === c.id
                          ? "grad-theme text-white border-transparent shadow-rose-md"
                          : "bg-surface border-border text-ink-light hover:text-ink"
                      )}
                    >
                      <span>{c.emoji}</span>
                      <span>{isAr ? c.labelAr : c.labelEn}</span>
                    </button>
                  ))}

                  {!creatingCategory ? (
                    <button
                      type="button"
                      onClick={() => setCreatingCategory(true)}
                      className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold border border-dashed border-hotpink/60 text-hotpink bg-hotpink/5 hover:bg-hotpink/10 transition-colors"
                    >
                      {isAr ? "+ تصنيف مخصص" : "+ Custom category"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={isAr ? "اسم التصنيف..." : "Category..."}
                        autoComplete="off"
                        className="rounded-full border border-hotpink bg-surface px-3 py-1.5 text-xs font-bold text-ink outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryName.trim() && addCustomCategory) {
                            addCustomCategory(newCategoryName.trim());
                            setFormCategory(newCategoryName.trim());
                            setNewCategoryName("");
                            setCreatingCategory(false);
                          }
                        }}
                        className="cursor-pointer rounded-full grad-theme px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                      >
                        {isAr ? "إضافة" : "Add"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Short Description */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light">
                  {isAr ? "وصف مختصر (اختياري)" : "Short Description (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    isAr
                      ? "أضيفي ملخصاً أو تفاصيل موجزة عن الهدف..."
                      : "Add a brief summary or notes about this goal..."
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: YOUR WHY */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-1">
                <h3 className="text-lg font-black text-ink">
                  {isAr ? "لماذا يهمك هذا الهدف؟ 💗" : "Why does this matter to you? 💗"}
                </h3>
                <p className="text-xs font-semibold text-ink-light mt-0.5">
                  {isAr ? "الدافع القوي والرؤية الواضحة يمنحانكِ الاستمرارية" : "Your deep purpose and vision fuels consistency"}
                </p>
              </div>

              {/* Why This Matters */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500" />
                  <span>{isAr ? "لماذا هذا الهدف مهم لكِ الآن؟" : "Why is this goal important to you now?"}</span>
                </label>
                <textarea
                  rows={3}
                  value={formWhy}
                  onChange={(e) => setFormWhy(e.target.value)}
                  placeholder={
                    isAr
                      ? "اكتبي شعوركِ والسبب الذي يجعلكِ مستعدة لبذل الجهد لتحقيقه..."
                      : "Write down your motivation, purpose and why you care deeply..."
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
                />
              </div>

              {/* Success Vision */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>{isAr ? "كيف سيبدو أو يشعركِ النجاح عند تحقيقه؟" : "What will success look or feel like?"}</span>
                </label>
                <textarea
                  rows={3}
                  value={formSuccessVision}
                  onChange={(e) => setFormSuccessVision(e.target.value)}
                  placeholder={
                    isAr
                      ? "تصوري اللحظة التي تكتمل فيها المهمة: كيف ستحتفلين؟ كيف ستكون حياتك؟"
                      : "Visualize the moment you finish: How will you celebrate? How will life improve?"
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-medium text-ink outline-none focus:border-hotpink leading-relaxed"
                />
              </div>

              {/* Additional Notes */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light">
                  {isAr ? "ملاحظات أو روابط ملهمة (اختياري)" : "Inspirational Notes or Links (Optional)"}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isAr ? "كتب، بودكاست، اقتباس ملهم..." : "Books, links, quote..."}
                  autoComplete="off"
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-ink outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: YOUR PLAN */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-1">
                <h3 className="text-lg font-black text-ink">
                  {isAr ? "خطة العمل والقياس 🎯" : "Action Plan & Tracking 🎯"}
                </h3>
                <p className="text-xs font-semibold text-ink-light mt-0.5">
                  {isAr ? "اختاري الطريقة الأنسب لقياس تقدمكِ في هذا الهدف" : "Choose the tracking method that fits this goal"}
                </p>
              </div>

              {/* Method Selector */}
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
                        formMethod === m.id
                          ? "grad-theme text-white border-transparent shadow-rose-sm scale-105"
                          : "bg-surface border-border text-ink-light hover:text-ink"
                      )}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-extrabold">{isAr ? m.labelAr : m.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method A: Milestones List */}
              {formMethod === "milestones" && (
                <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-ink-light">
                      {isAr ? "محطات الإنجاز المرحلية:" : "Key Milestone Steps:"}
                    </label>
                    <span className="text-[11px] font-bold text-hotpink">
                      {formMilestones.filter((m) => m.completed).length}/{formMilestones.length} {isAr ? "مكتملة" : "done"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {formMilestones.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-surface border border-border/60"
                      >
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
                        <button
                          type="button"
                          onClick={() => handleWizardRemoveMilestone(m.id)}
                          className="cursor-pointer text-ink-light hover:text-rose-500 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Inline */}
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
                      placeholder={isAr ? "أضيفي محطة أو مرحلة جديدة..." : "Add next milestone step..."}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      dir="auto"
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleWizardAddMilestone}
                      className="cursor-pointer px-3.5 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-xs"
                    >
                      {isAr ? "إضافة" : "Add"}
                    </button>
                  </div>
                </div>
              )}

              {/* Method B: Numeric Values */}
              {formMethod === "numeric" && (
                <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                        {isAr ? "القيمة الابتدائية:" : "Start Value:"}
                      </label>
                      <input
                        type="number"
                        value={formStartValue}
                        onChange={(e) => setFormStartValue(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface p-2 text-xs font-bold text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                        {isAr ? "الحالية الآن:" : "Current Value:"}
                      </label>
                      <input
                        type="number"
                        value={formCurrentValue}
                        onChange={(e) => setFormCurrentValue(Number(e.target.value))}
                        className="w-full rounded-xl border border-hotpink bg-surface p-2 text-xs font-bold text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                        {isAr ? "المستهدفة:" : "Target Value:"}
                      </label>
                      <input
                        type="number"
                        value={formTargetValue}
                        onChange={(e) => setFormTargetValue(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface p-2 text-xs font-bold text-ink outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-ink-light mb-1">
                      {isAr ? "وحدة القياس:" : "Unit of Measure:"}
                    </label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder={isAr ? "مثال: ريال، صفحة، كيلو، ساعة..." : "e.g. SAR, pages, kg, hours..."}
                      autoComplete="off"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-ink outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Method C: Manual Progress */}
              {formMethod === "manual" && (
                <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs font-extrabold text-ink">
                    <span>{isAr ? "نسبة التقدم الحالية:" : "Current Progress:"}</span>
                    <span className="font-mono text-hotpink text-sm">{formManualProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formManualProgress}
                    onChange={(e) => setFormManualProgress(Number(e.target.value))}
                    className="w-full accent-hotpink cursor-pointer h-2 bg-ghost rounded-lg"
                  />
                </div>
              )}

              {/* Dates */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-ink-light mb-1">
                      {isAr ? "تاريخ البدء:" : "Start Date:"}
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs font-bold text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-ink-light mb-1">
                      {isAr ? "تاريخ الإنجاز المستهدف:" : "Target Due Date:"}
                    </label>
                    <input
                      type="date"
                      value={formTargetDate}
                      onChange={(e) => {
                        setFormTargetDate(e.target.value);
                        setFormTargetLabel(e.target.value);
                      }}
                      className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs font-bold text-ink outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: YOUR SYSTEM */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-1">
                <h3 className="text-lg font-black text-ink">
                  {isAr ? "منظومة الاستمرارية والإنجاز ⚡" : "Consistency & Execution System ⚡"}
                </h3>
                <p className="text-xs font-semibold text-ink-light mt-0.5">
                  {isAr ? "الأهداف تتحقق بالأنظمة اليومية والمراجعة المنتظمة" : "Goals happen through daily actions & regular reviews"}
                </p>
              </div>

              {/* Immediate Next Action */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                  <Zap size={14} className="text-hotpink" />
                  <span>{isAr ? "ما هي أصغر خطوة تالية يمكنكِ البدء بها اليوم؟" : "What is the smallest immediate next action?"}</span>
                </label>
                <input
                  type="text"
                  value={formNextAction}
                  onChange={(e) => setFormNextAction(e.target.value)}
                  placeholder={
                    isAr ? "مثال: تحميل التطبيق، فتح الحساب، كتابة أول صفحة..." : "e.g. Download app, open account, write 1 page..."
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  dir="auto"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-bold text-ink outline-none focus:border-hotpink"
                />
              </div>

              {/* Check-in Frequency */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs space-y-2">
                <label className="block text-xs font-extrabold text-ink-light flex items-center gap-1.5">
                  <Clock size={14} className="text-purple-500" />
                  <span>{isAr ? "تكرار المراجعة الدورية والتأمل:" : "Check-in & Reflection Frequency:"}</span>
                </label>
                <select
                  value={formCheckInFreq}
                  onChange={(e) => setFormCheckInFreq(e.target.value as any)}
                  className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink outline-none"
                >
                  <option value="weekly">{isAr ? "أسبوعياً (موصى به ✨)" : "Weekly (Recommended ✨)"}</option>
                  <option value="monthly">{isAr ? "شهرياً" : "Monthly"}</option>
                  <option value="none">{isAr ? "بدون مراجعة دورية" : "No Check-in"}</option>
                </select>
              </div>

              {/* Focus Goal Toggle */}
              <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <div>
                    <span className="text-xs font-extrabold text-ink block">
                      {isAr ? "إضافة إلى أهدافي الأساسية ⭐" : "Add to My Focus Goals ⭐"}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-light">
                      {isAr ? 'الحد الأقصى 3 أهداف أساسية (' + activeFocusCount + '/3)' : 'Max 3 active focus goals (' + activeFocusCount + '/3)'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsFocus}
                  onChange={(e) => setFormIsFocus(e.target.checked)}
                  className="h-5 w-5 rounded-lg accent-hotpink cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Step Actions */}
        <div className="flex items-center gap-3 px-5 py-3.5 pb-[calc(env(safe-area-inset-bottom,16px)+14px)] sm:pb-3.5 border-t border-border/60 bg-surface/50 shrink-0">
          {wizardStep > 1 && (
            <button
              type="button"
              onClick={() => setWizardStep((prev) => (prev - 1) as any)}
              className="cursor-pointer py-3 px-4 rounded-2xl border border-border text-xs font-extrabold text-ink-light hover:bg-surface active:scale-95 transition-all text-center"
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
              className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isAr ? "المتابعة للخطوة التالية" : "Continue"}</span>
              <ChevronRight size={16} className="rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!formTitle.trim()}
              className="cursor-pointer flex-1 py-3 rounded-2xl grad-theme text-white text-xs font-extrabold shadow-rose-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check size={16} className="stroke-[3]" />
              <span>
                {goal
                  ? isAr
                    ? "حفظ التعديلات ✨"
                    : "Save Changes ✨"
                  : isAr
                  ? "أنشئي هدفي ✨"
                  : "Create My Goal ✨"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
