import React, { useState } from "react";
import {
  Mail,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  Trash2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";
import {
  type FutureMeCapsule,
  FUTURE_ME_PROMPTS,
  addCalendarMonths,
  addCalendarYears,
  getLocalDateInTimezone,
  daysUntilDate,
  isCapsuleReadyToOpen,
  deriveCapsuleUiState,
  formatCapsuleDate,
  maskSealedCapsuleForPublicView,
} from "@/lib/futureMeEngine";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface FutureMeCapsuleViewProps {
  isAr: boolean;
  onOpenJournalEditorWithReply?: (capsuleId: string, title: string) => void;
}

export const FutureMeCapsuleView: React.FC<FutureMeCapsuleViewProps> = ({
  isAr,
  onOpenJournalEditorWithReply,
}) => {
  const {
    state,
    saveCapsuleDraft,
    sealCapsuleAction,
    openCapsuleAction,
    unsealCapsuleEarlyAction,
    deleteCapsuleAction,
  } = useApp();

  const capsules = state.timeCapsules || [];
  const [filter, setFilter] = useState<"all" | "sealed" | "ready" | "opened">("all");
  const [activeCapsuleModal, setActiveCapsuleModal] = useState<FutureMeCapsule | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Composer Form State
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [openingDatePreset, setOpeningDatePreset] = useState<"1m" | "3m" | "6m" | "1y" | "custom">("1y");
  const [customDate, setCustomDate] = useState("");
  const [stampStyle, setStampStyle] = useState<"flower" | "heart" | "moon" | "bird">("flower");

  const todayStr = getLocalDateInTimezone(new Date());

  const getComputedOpeningDate = (): string => {
    if (openingDatePreset === "1m") return addCalendarMonths(todayStr, 1);
    if (openingDatePreset === "3m") return addCalendarMonths(todayStr, 3);
    if (openingDatePreset === "6m") return addCalendarMonths(todayStr, 6);
    if (openingDatePreset === "1y") return addCalendarYears(todayStr, 1);
    return customDate || addCalendarMonths(todayStr, 1);
  };

  const handleOpenCompose = () => {
    setDraftTitle("");
    setDraftBody("");
    setOpeningDatePreset("1y");
    setCustomDate(addCalendarYears(todayStr, 1));
    setStampStyle("flower");
    setIsComposeOpen(true);
  };

  const handleSealLetter = () => {
    if (!draftBody.trim()) return;
    const finalDate = getComputedOpeningDate();
    const id = saveCapsuleDraft({
      title: draftTitle.trim() || (isAr ? "رسالة إلى نفسي في المستقبل 💌" : "Letter to My Future Self 💌"),
      body: draftBody.trim(),
      openingDate: finalDate,
      stampStyle,
    });
    sealCapsuleAction(id);
    setIsComposeOpen(false);
  };

  const handleSaveDraftOnly = () => {
    if (!draftBody.trim() && !draftTitle.trim()) return;
    const finalDate = getComputedOpeningDate();
    saveCapsuleDraft({
      title: draftTitle.trim() || (isAr ? "مسودة رسالة 💌" : "Draft Letter 💌"),
      body: draftBody.trim(),
      openingDate: finalDate,
      stampStyle,
      status: "draft",
    });
    setIsComposeOpen(false);
  };

  const filteredCapsules = capsules.filter((c) => {
    const uiState = deriveCapsuleUiState(c);
    if (filter === "all") return true;
    if (filter === "sealed") return uiState === "sealed";
    if (filter === "ready") return uiState === "ready";
    if (filter === "opened") return uiState === "opened";
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/40 bg-gradient-to-br from-[#FFF5F7] via-[#FFF0F4] to-[#FDF4FF] dark:from-[#1F141A] dark:to-[#171324] p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-card/80 border border-pink-200/60 dark:border-pink-800 text-hotpink text-xs font-black">
              <Mail size={13} aria-hidden="true" />
              <span>{isAr ? "رسائل المستقبل" : "Dear Future Me"}</span>
            </div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight">
              {isAr ? "إلى نفسي في المستقبل 💌" : "Dear Future Me 💌"}
            </h2>
            <p className="text-xs font-semibold text-ink-light leading-relaxed max-w-md">
              {isAr
                ? "اكتبي ما في قلبكِ اليوم، واختمي رسالتكِ ليوم قادم. كلماتكِ أمانة يحملها لكِ الزمن برفق."
                : "Pour your present heart onto paper, seal your letter, and let time deliver your words when the day arrives."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCompose}
            className="cursor-pointer py-2.5 px-4 rounded-xl grad-theme text-xs font-black text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} className="stroke-[3]" aria-hidden="true" />
            <span>{isAr ? "رسالة جديدة ✨" : "New Letter ✨"}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-pink-200/40 dark:border-pink-900/30 overflow-x-auto no-scrollbar">
          {[
            { id: "all", labelEn: "All", labelAr: "الكل", count: capsules.length },
            { id: "sealed", labelEn: "Sealed 🔒", labelAr: "مختومة 🔒", count: capsules.filter((c) => deriveCapsuleUiState(c) === "sealed").length },
            { id: "ready", labelEn: "Ready ✨", labelAr: "جاهزة للفتح ✨", count: capsules.filter((c) => deriveCapsuleUiState(c) === "ready").length },
            { id: "opened", labelEn: "Opened 💌", labelAr: "مفتوحة 💌", count: capsules.filter((c) => deriveCapsuleUiState(c) === "opened").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                filter === tab.id
                  ? "bg-hotpink text-white shadow-rose-xs"
                  : "bg-surface/80 border border-border/80 text-ink-light hover:text-ink"
              )}
            >
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              {tab.count > 0 && <span className="ml-1 opacity-80">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Letters List / Empty State */}
      {filteredCapsules.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border p-6 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 dark:bg-pink-950/50 text-hotpink text-2xl mx-auto shadow-inner">
            💌
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-ink">
              {isAr ? "لا توجد رسائل لنفسكِ المستقبلية بعد 🌸" : "No letters to your future self yet 🌸"}
            </h3>
            <p className="text-xs font-semibold text-ink-light max-w-xs mx-auto leading-relaxed">
              {isAr
                ? "اكتبي رسالة لنفسكِ بعد شهر أو سنة من الآن، وتأمّلي كيف تزهر خطواتكِ مع الأيام."
                : "Write a letter to yourself 1 month or 1 year from today, and see how your journey blossoms."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCompose}
            className="cursor-pointer py-2.5 px-5 rounded-2xl grad-theme text-xs font-black text-white shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} className="stroke-[3]" aria-hidden="true" />
            <span>{isAr ? "اكتبي أول رسالة 💌" : "Write Your First Letter 💌"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCapsules.map((capsule) => {
            const uiState = deriveCapsuleUiState(capsule);
            const isReady = uiState === "ready";
            const isOpened = uiState === "opened";
            const isSealed = uiState === "sealed";
            const daysLeft = daysUntilDate(capsule.openingDate);
            const displayCapsule = isSealed ? maskSealedCapsuleForPublicView(capsule, isAr) : capsule;

            return (
              <div
                key={capsule.id}
                onClick={() => {
                  if (isReady) {
                    openCapsuleAction(capsule.id);
                  }
                  setActiveCapsuleModal(capsule);
                }}
                className={cn(
                  "cursor-pointer rounded-3xl border p-4 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden flex flex-col justify-between group",
                  isReady
                    ? "bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-950/20 dark:to-pink-950/20 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30"
                    : isOpened
                    ? "bg-card border-border hover:border-hotpink/40"
                    : "bg-surface/90 border-border/80 hover:border-pink-300"
                )}
              >
                {/* Stamp accent */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base" aria-hidden="true">
                        {capsule.stampStyle === "heart" ? "💖" : capsule.stampStyle === "moon" ? "🌙" : capsule.stampStyle === "bird" ? "🕊️" : "🌸"}
                      </span>
                      <h4 className="text-sm font-extrabold text-ink truncate group-hover:text-hotpink transition-colors">
                        {displayCapsule.title}
                      </h4>
                    </div>
                    <p className="text-[11px] font-semibold text-ink-light flex items-center gap-1">
                      <Calendar size={12} aria-hidden="true" />
                      <span>
                        {isAr ? "موعد الفتح: " : "Opens: "}
                        {formatCapsuleDate(capsule.openingDate, isAr)}
                      </span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black shadow-xs animate-pulse">
                        <Sparkles size={11} aria-hidden="true" />
                        <span>{isAr ? "جاهزة للفتح!" : "Ready to Open!"}</span>
                      </span>
                    ) : isOpened ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        <Unlock size={11} aria-hidden="true" />
                        <span>{isAr ? "مفتوحة" : "Opened"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/50 text-hotpink border border-pink-200 dark:border-pink-800 text-[11px] font-bold">
                        <Lock size={11} aria-hidden="true" />
                        <span>{isAr ? `خلال ${daysLeft} يوم` : `In ${daysLeft} days`}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Preview / Mask */}
                <p className="text-xs font-medium text-ink-light line-clamp-2 leading-relaxed">
                  {displayCapsule.body}
                </p>

                {/* Footer bar */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-semibold text-ink-light">
                  <span>
                    {isAr ? "خُتمت في: " : "Sealed: "}
                    {formatCapsuleDate(capsule.sealedAt ? capsule.sealedAt.slice(0, 10) : capsule.createdAt.slice(0, 10), isAr)}
                  </span>
                  <span className="text-hotpink font-bold flex items-center gap-1">
                    <span>{isReady ? (isAr ? "افتحي الرسالة" : "Open Letter") : isOpened ? (isAr ? "قراءة الرسالة" : "Read Letter") : (isAr ? "تفاصيل" : "Details")}</span>
                    <span aria-hidden="true">{isAr ? "←" : "→"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Letter Reading / Opening Modal */}
      {activeCapsuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {activeCapsuleModal.stampStyle === "heart" ? "💖" : activeCapsuleModal.stampStyle === "moon" ? "🌙" : activeCapsuleModal.stampStyle === "bird" ? "🕊️" : "🌸"}
                </span>
                <div>
                  <h3 className="text-base font-black text-ink">
                    {activeCapsuleModal.status === "sealed" && !isCapsuleReadyToOpen(activeCapsuleModal)
                      ? (isAr ? "رسالة مختومة بأمان 🔒" : "Sealed Letter 🔒")
                      : activeCapsuleModal.title}
                  </h3>
                  <p className="text-xs font-semibold text-ink-light">
                    {isAr ? "تاريخ الفتح: " : "Opening Date: "}
                    {formatCapsuleDate(activeCapsuleModal.openingDate, isAr)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCapsuleModal(null)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink transition-all"
                aria-label="Close"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Letter Content or Sealed Lock State */}
            {activeCapsuleModal.status === "sealed" && !isCapsuleReadyToOpen(activeCapsuleModal) ? (
              <div className="text-center py-10 px-4 space-y-4 bg-pink-50/50 dark:bg-pink-950/30 rounded-2xl border border-pink-200/60 dark:border-pink-900/40">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/60 text-hotpink mx-auto">
                  <Lock size={28} aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-ink">
                    {isAr ? "هذه الرسالة مختومة حتى يحين موعدها 💌" : "This letter is sealed until its time arrives 💌"}
                  </h4>
                  <p className="text-xs font-semibold text-ink-light max-w-xs mx-auto leading-relaxed">
                    {isAr
                      ? `ستصبح جاهزة للفتح بعد ${daysUntilDate(activeCapsuleModal.openingDate)} يوماً (${formatCapsuleDate(activeCapsuleModal.openingDate, isAr)}).`
                      : `It will be ready to open in ${daysUntilDate(activeCapsuleModal.openingDate)} days (${formatCapsuleDate(activeCapsuleModal.openingDate, isAr)}).`}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isAr ? "هل ترغبين في كسر الختم وقراءة الرسالة مبكراً؟" : "Do you want to break the seal and read this letter early?")) {
                        unsealCapsuleEarlyAction(activeCapsuleModal.id);
                        setActiveCapsuleModal(null);
                      }
                    }}
                    className="cursor-pointer text-[11px] font-bold text-ink-light hover:text-hotpink underline transition-colors"
                  >
                    {isAr ? "كسر الختم وقراءتها الآن (مبكراً)" : "Break seal and read early"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-pink-200/60 dark:border-pink-900/40 bg-surface p-5 space-y-3 font-serif">
                  <div className="text-xs font-semibold text-ink-light flex items-center justify-between border-b border-border/50 pb-2">
                    <span>{isAr ? "إلى نفسي العزيزة،" : "To my dear future self,"}</span>
                    <span>{formatCapsuleDate(activeCapsuleModal.sealedAt ? activeCapsuleModal.sealedAt.slice(0, 10) : activeCapsuleModal.createdAt.slice(0, 10), isAr)}</span>
                  </div>
                  <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                    {activeCapsuleModal.body}
                  </div>
                  <div className="pt-4 text-xs font-bold text-hotpink border-t border-border/50 text-end font-sans">
                    {isAr ? "مع كل الحب والرجاء 🌸" : "With all my love & hope 🌸"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذه الرسالة؟" : "Are you sure you want to delete this letter?")) {
                        deleteCapsuleAction(activeCapsuleModal.id);
                        setActiveCapsuleModal(null);
                      }
                    }}
                    className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>{isAr ? "حذف" : "Delete"}</span>
                  </button>

                  {onOpenJournalEditorWithReply && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenJournalEditorWithReply(activeCapsuleModal.id, activeCapsuleModal.title || "Reply to Future Me");
                        setActiveCapsuleModal(null);
                      }}
                      className="cursor-pointer py-2 px-4 rounded-xl grad-theme text-xs font-black text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <BookOpen size={13} aria-hidden="true" />
                      <span>{isAr ? "كتابة رد في اليوميات ✍️" : "Write a Reply in Journal ✍️"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Letter Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">💌</span>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    {isAr ? "رسالة جديدة إلى نفسي المستقبلية" : "New Letter to My Future Self"}
                  </h3>
                  <p className="text-[11px] font-semibold text-ink-light">
                    {isAr ? "اكتبي بصدق ولطف، فالزمن يحفظ أثركِ" : "Write with honesty and kindness"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink transition-all"
                aria-label="Close"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-ink-light block">
                {isAr ? "أفكار ملهمة للكتابة 🌸:" : "Inspiring prompts 🌸:"}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {FUTURE_ME_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => {
                      const promptText = isAr ? prompt.textAr : prompt.textEn;
                      setDraftBody((prev) => (prev ? `${prev}\n\n• ${promptText}\n` : `• ${promptText}\n`));
                    }}
                    className="cursor-pointer text-start px-2.5 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900 text-[11px] font-bold text-ink-light hover:text-hotpink hover:border-hotpink/40 transition-all shrink-0"
                  >
                    <span>{isAr ? prompt.textAr : prompt.textEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "عنوان الرسالة (اختياري)" : "Letter Title (optional)"}
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={isAr ? "مثال: إلى نفسي بعد عام من اليوم ✨" : "e.g., To me one year from today ✨"}
                  className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-xs font-bold text-ink placeholder:text-ink-light/50 outline-none focus:border-hotpink transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink-light block mb-1">
                  {isAr ? "نص الرسالة" : "Your Letter"}
                </label>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  placeholder={isAr ? "اكتبي ما تشعرين به اليوم، آمالكِ، مخاوفكِ، ودعواتكِ الصادقة..." : "What are your hopes, fears, quiet prayers, and intentions right now?..."}
                  rows={8}
                  className="w-full rounded-2xl bg-surface border border-border p-3.5 text-xs font-medium text-ink placeholder:text-ink-light/50 outline-none focus:border-hotpink transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Opening Date Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-light flex items-center justify-between">
                  <span>{isAr ? "متى ترغبين في فتح الرسالة؟ 📅" : "When should this letter open? 📅"}</span>
                  <span className="text-hotpink font-extrabold">{formatCapsuleDate(getComputedOpeningDate(), isAr)}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "1m", labelEn: "1 Month", labelAr: "شهر" },
                    { id: "3m", labelEn: "3 Months", labelAr: "3 أشهر" },
                    { id: "6m", labelEn: "6 Months", labelAr: "6 أشهر" },
                    { id: "1y", labelEn: "1 Year", labelAr: "سنة كاملة" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setOpeningDatePreset(p.id as any)}
                      className={cn(
                        "cursor-pointer py-2 rounded-xl text-xs font-bold text-center transition-all",
                        openingDatePreset === p.id
                          ? "bg-hotpink text-white shadow-rose-xs"
                          : "bg-surface border border-border text-ink-light hover:text-ink"
                      )}
                    >
                      {isAr ? p.labelAr : p.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stamp Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-light block">
                  {isAr ? "طابع الختم 💌" : "Envelope Stamp 💌"}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: "flower", emoji: "🌸", label: isAr ? "وردة" : "Flower" },
                    { id: "heart", emoji: "💖", label: isAr ? "قلب" : "Heart" },
                    { id: "moon", emoji: "🌙", label: isAr ? "هلال" : "Moon" },
                    { id: "bird", emoji: "🕊️", label: isAr ? "حمامة" : "Bird" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStampStyle(s.id as any)}
                      className={cn(
                        "cursor-pointer flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all",
                        stampStyle === s.id
                          ? "border-hotpink bg-pink-50 dark:bg-pink-950/40 text-hotpink shadow-xs"
                          : "border-border bg-surface text-ink-light hover:border-hotpink/30"
                      )}
                    >
                      <span aria-hidden="true">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={handleSaveDraftOnly}
                className="cursor-pointer py-2.5 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-ink hover:text-hotpink transition-all"
              >
                {isAr ? "حفظ كمسودة" : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={handleSealLetter}
                disabled={!draftBody.trim()}
                className={cn(
                  "cursor-pointer py-2.5 px-5 rounded-xl text-xs font-black text-white shadow-xs transition-all flex items-center gap-1.5",
                  draftBody.trim()
                    ? "grad-theme active:scale-95"
                    : "bg-ink-light/40 cursor-not-allowed"
                )}
              >
                <Lock size={13} aria-hidden="true" />
                <span>{isAr ? "ختم الرسالة بأمان 🔒" : "Seal Letter 🔒"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
