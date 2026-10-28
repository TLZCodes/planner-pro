import React, { useState, useMemo, useEffect } from "react";
import {
  type WeekInBloomKeepsake,
  type WeekInBloomBlock,
  type BloomLayout,
  type BloomTheme,
  type BloomBlockType,
  BLOOM_THEMES,
  createNewBloomKeepsake,
  normalizeWeekInBloomKeepsake,
} from "@/lib/weekInBloomEngine";
import {
  type WeekInfo,
  getWeekDaysInfo,
  formatLocalDateStr,
} from "@/lib/weeklyHabitEngine";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BloomCardPreview } from "./BloomCardPreview";
import { BloomBlockEditor } from "./BloomBlockEditor";
import { ChooseFromWeekModal } from "./ChooseFromWeekModal";
import { BloomExportModal } from "./BloomExportModal";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  Copy,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  BookOpen,
  Calendar,
} from "lucide-react";

interface WeekInBloomViewProps {
  initialWeekStartDate?: string;
  onExit: () => void;
  onOpenJournalEntry?: (journalId: string) => void;
}

export function WeekInBloomView({
  initialWeekStartDate,
  onExit,
  onOpenJournalEntry,
}: WeekInBloomViewProps) {
  const { state, saveWeekInBloomKeepsake, deleteWeekInBloomKeepsake, duplicateWeekInBloomKeepsake } = useApp();
  const { lang } = useLang();
  const isAr = lang === "ar";

  // Week offset state
  const [weekOffset, setWeekOffset] = useState(0);

  // Derive WeekInfo based on preferences
  const weekStartDay = (state.prefs?.firstDayOfWeek as any) || "saturday";
  const weekInfo: WeekInfo = useMemo(() => {
    return getWeekDaysInfo(new Date(), weekOffset, weekStartDay, isAr);
  }, [weekOffset, weekStartDay, isAr]);

  // Sync initial week if provided
  useEffect(() => {
    if (initialWeekStartDate) {
      const today = new Date();
      const currentStart = getWeekDaysInfo(today, 0, weekStartDay, isAr).weekStartDate;
      if (initialWeekStartDate !== currentStart) {
        // Calculate offset difference
        const d1 = new Date(currentStart + "T00:00:00");
        const d2 = new Date(initialWeekStartDate + "T00:00:00");
        const diffWeeks = Math.round((d2.getTime() - d1.getTime()) / (7 * 86400000));
        setWeekOffset(diffWeeks);
      }
    }
  }, [initialWeekStartDate, weekStartDay, isAr]);

  // Existing keepsakes for this week
  const keepsakesForWeek = useMemo(() => {
    const list = state.weekInBloomKeepsakes || [];
    return list.filter((k) => k.weekStartDate === weekInfo.weekStartDate);
  }, [state.weekInBloomKeepsakes, weekInfo.weekStartDate]);

  // Current active keepsake draft
  const [activeKeepsake, setActiveKeepsake] = useState<WeekInBloomKeepsake | null>(() => {
    if (keepsakesForWeek.length > 0) {
      return keepsakesForWeek[0];
    }
    return null;
  });

  // Keep activeKeepsake in sync when week changes
  useEffect(() => {
    if (keepsakesForWeek.length > 0) {
      setActiveKeepsake(keepsakesForWeek[0]);
    } else {
      setActiveKeepsake(null);
    }
  }, [weekInfo.weekStartDate, keepsakesForWeek]);

  // UI Modes
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [targetBlockType, setTargetBlockType] = useState<BloomBlockType | undefined>(undefined);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  // Initialize a new keepsake for the current week
  const handleStartNewKeepsake = () => {
    const newK = createNewBloomKeepsake({
      weekStartDate: weekInfo.weekStartDate,
      weekEndDate: weekInfo.weekEndDate,
      title: isAr ? `أسبوعي يزهر (${weekInfo.formattedRange})` : `My Week in Bloom (${weekInfo.formattedRange})`,
      layout: "scrapbook",
      theme: "blush",
    });
    setActiveKeepsake(newK);
    setIsPreviewMode(false);
  };

  // Update block
  const handleUpdateBlock = (updated: WeekInBloomBlock) => {
    if (!activeKeepsake) return;
    const nextBlocks = activeKeepsake.blocks.map((b) => (b.id === updated.id ? updated : b));
    setActiveKeepsake({ ...activeKeepsake, blocks: nextBlocks });
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (!activeKeepsake || index <= 0) return;
    const nextBlocks = [...activeKeepsake.blocks];
    const temp = nextBlocks[index - 1];
    nextBlocks[index - 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    setActiveKeepsake({ ...activeKeepsake, blocks: nextBlocks });
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (!activeKeepsake || index >= activeKeepsake.blocks.length - 1) return;
    const nextBlocks = [...activeKeepsake.blocks];
    const temp = nextBlocks[index + 1];
    nextBlocks[index + 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    setActiveKeepsake({ ...activeKeepsake, blocks: nextBlocks });
  };

  // Open source picker
  const handleOpenSourcePicker = (type: BloomBlockType) => {
    setTargetBlockType(type);
    setSourcePickerOpen(true);
  };

  // Source item selected
  const handleSelectSourceContent = (type: string, content: any, sourceLabel?: string) => {
    if (!activeKeepsake) return;
    const nextBlocks = activeKeepsake.blocks.map((b) => {
      if (b.type === type) {
        let newContent = content;
        if (type === "accomplishments") {
          const current = Array.isArray(b.content) ? b.content : [];
          const incoming = Array.isArray(content) ? content : [content];
          newContent = Array.from(new Set([...current, ...incoming]));
        }
        return {
          ...b,
          visible: true,
          content: newContent,
          sourceRef: sourceLabel ? { type: "source", label: sourceLabel } : undefined,
        };
      }
      return b;
    });
    setActiveKeepsake({ ...activeKeepsake, blocks: nextBlocks });
  };

  // Save to Journal
  const handleSave = (saveToJournal: boolean) => {
    if (!activeKeepsake) return;
    setSaveStatus("saving");
    try {
      const id = saveWeekInBloomKeepsake(
        {
          ...activeKeepsake,
          isDraft: !saveToJournal,
        },
        saveToJournal
      );
      setActiveKeepsake((prev) => (prev ? { ...prev, id, isDraft: !saveToJournal } : null));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // Duplicate
  const handleDuplicate = () => {
    if (!activeKeepsake) return;
    const newId = duplicateWeekInBloomKeepsake(activeKeepsake.id);
    const duplicated = (state.weekInBloomKeepsakes || []).find((k) => k.id === newId);
    if (duplicated) {
      setActiveKeepsake(duplicated);
    }
  };

  // Delete
  const handleDelete = () => {
    if (!activeKeepsake) return;
    deleteWeekInBloomKeepsake(activeKeepsake.id);
    setConfirmDeleteModal(false);
    setActiveKeepsake(null);
  };

  const layouts: Array<{ id: BloomLayout; labelEn: string; labelAr: string; emoji: string }> = [
    { id: "scrapbook", labelEn: "Scrapbook", labelAr: "قصاصات مزهرة", emoji: "🌷" },
    { id: "minimal", labelEn: "Soft Minimal", labelAr: "بساطة هادئة", emoji: "🌿" },
    { id: "photo_diary", labelEn: "Photo Diary", labelAr: "مذكرات مصورة", emoji: "📸" },
  ];

  const themes = Object.values(BLOOM_THEMES);

  return (
    <div className="space-y-4 pb-20 animate-fade-in" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner: Title & Return to Journal */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-lg font-black text-ink flex items-center gap-1.5">
            <span>{isAr ? "أسبوعي يزهر 🌷" : "My Week in Bloom 🌷"}</span>
          </h2>
          <p className="text-xs font-semibold text-ink-light">
            {isAr
              ? "لحظات من أسبوعكِ تستحق أن تبقى وتُحفظ بحب 🌸"
              : "A few moments worth keeping, beautifully remembered 🌸"}
          </p>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="cursor-pointer px-3 py-1.5 rounded-full border border-border text-xs font-bold text-ink-light hover:text-ink flex items-center gap-1 active:scale-95"
        >
          {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          <span>{isAr ? "اليوميات" : "Journal"}</span>
        </button>
      </div>

      {/* Week Selector Bar */}
      <div className="p-3 rounded-2xl bg-surface/80 border border-border/80 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="cursor-pointer p-1.5 rounded-xl border border-border text-ink-light hover:text-ink bg-card active:scale-95"
          aria-label="Previous week"
        >
          {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-black text-ink">
              {weekInfo.formattedRange}
            </span>
            {weekInfo.isCurrentWeek && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-hotpink/10 text-hotpink">
                {isAr ? "هذا الأسبوع" : "Current Week"}
              </span>
            )}
            {weekInfo.isFutureWeek && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {isAr ? "أسبوع قادم" : "Upcoming"}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-ink-light block mt-0.5">
            {weekInfo.weekStartDate} — {weekInfo.weekEndDate}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="cursor-pointer px-2 py-1 rounded-xl text-[10.5px] font-black text-hotpink bg-hotpink/10 hover:bg-hotpink/20"
            >
              {isAr ? "اليوم" : "Today"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="cursor-pointer p-1.5 rounded-xl border border-border text-ink-light hover:text-ink bg-card active:scale-95"
            aria-label="Next week"
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* If No Keepsake yet for this week */}
      {!activeKeepsake ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card space-y-4 shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 text-pink-600">
            <Sparkles size={32} />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-black text-ink">
              {isAr
                ? "في كل أسبوع شيء يستحق أن يبقى 🌷"
                : "Every week holds something worth keeping 🌷"}
            </h3>
            <p className="text-xs text-ink-light leading-relaxed">
              {isAr
                ? "اختاري لحظة، أو درسًا، أو أمنية صغيرة للأسبوع القادم، واصنعي بطاقة تذكارية مميزة لأيامكِ."
                : "Choose a moment, a lesson, or a little hope for next week, and create a keepsake of your days."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartNewKeepsake}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full grad-theme text-white px-6 py-3 text-xs font-black shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>{isAr ? "اصنعي تذكاراً لهذا الأسبوع" : "Create a Keepsake for this Week"}</span>
          </button>
        </div>
      ) : (
        /* Active Keepsake Editor & Live Canvas */
        <div className="space-y-4">
          {/* Controls Bar: Layout & Theme Selectors */}
          <div className="p-4 rounded-3xl bg-card border border-border/80 space-y-3 shadow-xs">
            {/* Title Input */}
            <div>
              <label className="text-[11px] font-extrabold text-ink-light block mb-1">
                {isAr ? "عنوان التذكار (اختياري)" : "Keepsake Title (Optional)"}
              </label>
              <input
                type="text"
                value={activeKeepsake.title}
                onChange={(e) =>
                  setActiveKeepsake({ ...activeKeepsake, title: e.target.value })
                }
                placeholder={isAr ? "أسبوعي يزهر 🌷" : "My Week in Bloom 🌷"}
                className="w-full text-xs font-black p-2.5 rounded-2xl border border-border bg-surface text-ink outline-none"
              />
            </div>

            {/* Layouts Switcher */}
            <div>
              <label className="text-[11px] font-extrabold text-ink-light block mb-1.5">
                {isAr ? "التصميم والشكل" : "Layout Style"}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() =>
                      setActiveKeepsake({ ...activeKeepsake, layout: l.id })
                    }
                    className={`cursor-pointer py-2 px-1.5 rounded-2xl text-xs font-black flex flex-col items-center justify-center gap-1 border transition-all ${
                      activeKeepsake.layout === l.id
                        ? "bg-hotpink text-white border-hotpink shadow-rose-xs"
                        : "bg-surface border-border/70 text-ink-light hover:text-ink"
                    }`}
                  >
                    <span>{l.emoji}</span>
                    <span className="text-[10px] truncate max-w-full">
                      {isAr ? l.labelAr : l.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Palettes */}
            <div>
              <label className="text-[11px] font-extrabold text-ink-light block mb-1.5">
                {isAr ? "لوحة الألوان الناعمة" : "Pastel Theme"}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() =>
                      setActiveKeepsake({ ...activeKeepsake, theme: th.id })
                    }
                    className={`cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                      activeKeepsake.theme === th.id
                        ? "border-pink-600 ring-2 ring-pink-500/30"
                        : "border-border/80"
                    }`}
                    style={{ backgroundColor: th.bgHex, color: th.textHex }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: th.accentHex }}
                    />
                    <span className="text-[11px] font-bold">
                      {isAr ? th.nameAr : th.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Toggle Button */}
            <div className="pt-2 flex items-center justify-between border-t border-border/50">
              <button
                type="button"
                onClick={() => setIsPreviewMode((prev) => !prev)}
                className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border transition-all ${
                  isPreviewMode
                    ? "bg-hotpink text-white border-hotpink shadow-rose-xs"
                    : "bg-surface border-border text-ink-light hover:text-ink"
                }`}
              >
                {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>
                  {isPreviewMode
                    ? isAr
                      ? "إظهار لوحة التعديل"
                      : "Edit Blocks"
                    : isAr
                    ? "معاينة البطاقة بالكامل"
                    : "Full Preview"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="cursor-pointer inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-black bg-pink-50/70 dark:bg-pink-950/20 text-hotpink border border-pink-200 dark:border-pink-900/40 hover:bg-pink-100 transition-all active:scale-95"
              >
                <Download size={14} />
                <span>{isAr ? "تصدير كصورة 🖼️" : "Export PNG 🖼️"}</span>
              </button>
            </div>
          </div>

          {/* Canvas Live Preview Card */}
          <div className="rounded-3xl shadow-sm overflow-hidden">
            <BloomCardPreview keepsake={activeKeepsake} isAr={isAr} />
          </div>

          {/* Block Editors (Shown when not in full preview) */}
          {!isPreviewMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">
                  {isAr ? "أقسام ومحتويات التذكار" : "Keepsake Blocks"}
                </h3>
                <span className="text-[11px] font-semibold text-ink-light">
                  {isAr ? "يمكنكِ تحريك أو إخفاء أي قسم" : "Reorder or hide any block"}
                </span>
              </div>

              {activeKeepsake.blocks.map((block, idx) => (
                <BloomBlockEditor
                  key={block.id}
                  block={block}
                  index={idx}
                  totalBlocks={activeKeepsake.blocks.length}
                  isAr={isAr}
                  onUpdate={handleUpdateBlock}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  onOpenSourcePicker={handleOpenSourcePicker}
                />
              ))}
            </div>
          )}

          {/* Bottom Persistent Actions Bar */}
          <div className="sticky bottom-16 sm:bottom-20 z-20 p-3.5 rounded-3xl bg-card/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(true)}
                className="cursor-pointer p-2 rounded-2xl text-ink-light hover:text-rose-500 hover:bg-rose-50/50 active:scale-95 transition-all"
                aria-label="Delete keepsake"
                title={isAr ? "حذف" : "Delete"}
              >
                <Trash2 size={16} />
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                className="cursor-pointer p-2 rounded-2xl text-ink-light hover:text-ink hover:bg-surface active:scale-95 transition-all"
                aria-label="Duplicate keepsake"
                title={isAr ? "تكرار" : "Duplicate"}
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="cursor-pointer px-4 py-2 rounded-full border border-border text-xs font-bold text-ink hover:bg-surface active:scale-95 transition-all"
              >
                {saveStatus === "saving"
                  ? isAr
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : isAr
                  ? "حفظ مسودة"
                  : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2 text-xs font-black shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
              >
                {saveStatus === "saved" ? (
                  <>
                    <Check size={14} />
                    <span>{isAr ? "تم الحفظ في اليوميات! 🌸" : "Saved to Journal! 🌸"}</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={14} />
                    <span>{isAr ? "حفظ في اليوميات 🌸" : "Save to Journal 🌸"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Selection Modal */}
      <ChooseFromWeekModal
        isOpen={sourcePickerOpen}
        onClose={() => setSourcePickerOpen(false)}
        weekInfo={weekInfo}
        isAr={isAr}
        targetBlockType={targetBlockType}
        onSelectContent={handleSelectSourceContent}
      />

      {/* Export Preview Modal */}
      {activeKeepsake && (
        <BloomExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          keepsake={activeKeepsake}
          isAr={isAr}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xl max-w-xs w-full text-center space-y-4">
            <h4 className="text-sm font-black text-ink">
              {isAr ? "حذف هذا التذكار؟" : "Delete this keepsake?"}
            </h4>
            <p className="text-xs text-ink-light">
              {isAr
                ? "هل أنتِ متأكدة من حذف هذا التذكار؟ لن يؤثر هذا على مهامكِ أو مراجعاتكِ الأصلية."
                : "Are you sure? This will not affect your original tasks or reflections."}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(false)}
                className="cursor-pointer px-4 py-2 rounded-full border border-border text-xs font-bold text-ink"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="cursor-pointer px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-black shadow-xs hover:bg-rose-600"
              >
                {isAr ? "نعم، حذف" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
