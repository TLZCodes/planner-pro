import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowLeft,
  ArrowRight,
  Share2,
  FolderPlus,
  Heart,
} from "lucide-react";
import {
  getYearMonthKey,
  formatMonthName,
  getAdjacentMonthKey,
  getBarakahNotesForMonth,
  pickRandomBlessing,
  PAPER_COLORS,
  FLOWER_STYLES,
  formatBlessingDate,
  type PaperColor,
  type FlowerStyle,
} from "@/lib/barakahJarEngine";
import { useApp, todayKey, type JournalEntry } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BarakahJarSvg } from "./BarakahJarSvg";
import { AddBlessingSheet } from "./AddBlessingSheet";
import { BarakahNoteCard } from "./BarakahNoteCard";
import { MonthlyReadingRitualModal } from "./MonthlyReadingRitualModal";
import { ChooseFromJournalModal } from "./ChooseFromJournalModal";

interface BarakahJarViewProps {
  onReturnToJournal: () => void;
}

export const BarakahJarView: React.FC<BarakahJarViewProps> = ({
  onReturnToJournal,
}) => {
  const { state } = useApp();
  const journal = state.journal || [];
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const currentMonthKey = useMemo(() => getYearMonthKey(todayKey()), []);
  const [selectedMonth, setSelectedMonth] = useState<string | "all">(currentMonthKey);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [isChooseFromJournalOpen, setIsChooseFromJournalOpen] = useState(false);

  // Selected note card state
  const [readingEntryId, setReadingEntryId] = useState<string | null>(null);
  const [isRandomPick, setIsRandomPick] = useState(false);

  // Get notes for current filter
  const activeNotes = useMemo(() => {
    return getBarakahNotesForMonth(journal, selectedMonth);
  }, [journal, selectedMonth]);

  // Reading note pagination
  const readingIndex = useMemo(() => {
    if (!readingEntryId) return -1;
    return activeNotes.findIndex((n) => n.id === readingEntryId);
  }, [activeNotes, readingEntryId]);

  const activeReadingEntry = useMemo(() => {
    if (readingIndex >= 0) return activeNotes[readingIndex];
    return null;
  }, [activeNotes, readingIndex]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === "all") setSelectedMonth(currentMonthKey);
    else setSelectedMonth((prev) => getAdjacentMonthKey(prev, -1));
  };

  const handleNextMonth = () => {
    if (selectedMonth === "all") setSelectedMonth(currentMonthKey);
    else setSelectedMonth((prev) => getAdjacentMonthKey(prev, 1));
  };

  const handleTodayClick = () => {
    setSelectedMonth(currentMonthKey);
  };

  const handleToggleAll = () => {
    setSelectedMonth((prev) => (prev === "all" ? currentMonthKey : "all"));
  };

  // Random pick handler
  const handlePickRandom = () => {
    const picked = pickRandomBlessing(activeNotes, readingEntryId || undefined);
    if (picked) {
      setIsRandomPick(true);
      setReadingEntryId(picked.id);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Modals & Sheets */}
      <AddBlessingSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultDate={selectedMonth === "all" ? todayKey() : `${selectedMonth}-01`}
        onSaved={(newId) => {
          setReadingEntryId(newId);
          setIsRandomPick(false);
        }}
      />

      <BarakahNoteCard
        isOpen={Boolean(activeReadingEntry)}
        onClose={() => {
          setReadingEntryId(null);
          setIsRandomPick(false);
        }}
        entry={activeReadingEntry}
        isPickRandom={isRandomPick}
        currentIndex={readingIndex}
        totalCount={activeNotes.length}
        hasNext={readingIndex >= 0 && readingIndex < activeNotes.length - 1}
        hasPrev={readingIndex > 0}
        onNext={() => {
          if (readingIndex < activeNotes.length - 1) {
            setReadingEntryId(activeNotes[readingIndex + 1].id);
          }
        }}
        onPrev={() => {
          if (readingIndex > 0) {
            setReadingEntryId(activeNotes[readingIndex - 1].id);
          }
        }}
      />

      <MonthlyReadingRitualModal
        isOpen={isRitualOpen}
        onClose={() => setIsRitualOpen(false)}
        notes={activeNotes}
        monthKey={selectedMonth === "all" ? currentMonthKey : selectedMonth}
      />

      <ChooseFromJournalModal
        isOpen={isChooseFromJournalOpen}
        onClose={() => setIsChooseFromJournalOpen(false)}
      />

      {/* Top Breadcrumb & Return to Journal */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onReturnToJournal}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-black text-ink-light hover:text-ink transition-colors bg-surface/80 py-1.5 px-3 rounded-2xl border border-border/60"
        >
          {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span>{t("backToJournal") || (isAr ? "العودة لليوميات" : "Return to Journal")}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsChooseFromJournalOpen(true)}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50/70 dark:bg-rose-950/30 py-1.5 px-3 rounded-2xl border border-rose-200/60 transition-all"
        >
          <FolderPlus size={13} />
          <span>{t("chooseFromJournal") || (isAr ? "إضافة من دفتر اليوميات" : "Choose from Journal")}</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100/80 dark:bg-rose-950/40 text-rose-600 mb-1 shadow-2xs">
          <span className="text-2xl">🤍</span>
        </div>
        <h1 className="text-xl font-black text-ink tracking-tight font-handwriting">
          {t("barakahJar") || (isAr ? "جرّة النِّعم 🤍" : "Barakah Jar 🤍")}
        </h1>
        <p className="text-xs text-ink-light max-w-sm mx-auto font-medium">
          {t("barakahJarSubtitle") ||
            (isAr
              ? "نِعَم صغيرة تستحق أن نتذكّرها."
              : "Little blessings, lovingly remembered.")}
        </p>
      </div>

      {/* Month Navigator Controls */}
      <div className="bg-card p-3 rounded-3xl border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          {/* Previous Month */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="cursor-pointer p-2 rounded-2xl border border-border/70 hover:bg-surface text-ink transition-colors"
            title={isAr ? "الشهر السابق" : "Previous Month"}
          >
            {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Current Month Display & Picker */}
          <div className="text-center">
            <h2 className="text-sm font-black text-ink">
              {selectedMonth === "all"
                ? isAr
                  ? "جميع التدوينات"
                  : "All Blessings"
                : formatMonthName(selectedMonth, isAr)}
            </h2>
            <p className="text-[10px] font-bold text-ink-light">
              {isAr
                ? `${activeNotes.length} نعمة محفوظة`
                : `${activeNotes.length} saved blessing${activeNotes.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Next Month */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="cursor-pointer p-2 rounded-2xl border border-border/70 hover:bg-surface text-ink transition-colors"
            title={isAr ? "الشهر القادم" : "Next Month"}
          >
            {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Quick Toggles: Today / All Notes */}
        <div className="flex items-center justify-center gap-2 pt-1 border-t border-border/40">
          <button
            type="button"
            onClick={handleTodayClick}
            className={cn(
              "cursor-pointer text-[11px] font-black py-1 px-3 rounded-xl border transition-all",
              selectedMonth === currentMonthKey
                ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                : "border-border text-ink-light hover:text-ink hover:bg-surface"
            )}
          >
            {isAr ? "هذا الشهر" : "This Month"}
          </button>

          <button
            type="button"
            onClick={handleToggleAll}
            className={cn(
              "cursor-pointer text-[11px] font-black py-1 px-3 rounded-xl border transition-all flex items-center gap-1",
              selectedMonth === "all"
                ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                : "border-border text-ink-light hover:text-ink hover:bg-surface"
            )}
          >
            <Layers size={12} />
            <span>{isAr ? "كل النِّعم" : "All Notes"}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Jar & Interaction Center */}
      <div className="rounded-3xl border border-pink-200/70 dark:border-pink-900/40 bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30 dark:from-rose-950/20 dark:via-card dark:to-pink-950/10 p-6 flex flex-col items-center shadow-xs">
        {/* Jar SVG Illustration */}
        <div className="my-2 cursor-pointer" onClick={handlePickRandom}>
          <BarakahJarSvg
            notes={activeNotes}
            isAr={isAr}
            onJarClick={handlePickRandom}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="w-full max-w-sm mt-4 flex flex-col sm:flex-row gap-2">
          {/* Primary Action: Add Blessing */}
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="cursor-pointer flex-1 py-3 px-4 rounded-2xl bg-hotpink text-white text-xs font-black shadow-rose-sm hover:bg-pink-600 active:scale-98 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            <span>{t("addBlessing") || (isAr ? "أضيفي نعمة" : "Add a blessing")}</span>
          </button>

          {/* Secondary Action: Pick a note for me */}
          {activeNotes.length > 0 && (
            <button
              type="button"
              onClick={handlePickRandom}
              className="cursor-pointer flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-card border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-black shadow-2xs hover:bg-rose-50/50 active:scale-98 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles size={14} />
              <span>{t("pickForMe") || (isAr ? "سحب نعمة عشوائية ✨" : "Pick a note for me ✨")}</span>
            </button>
          )}
        </div>

        {/* Monthly Reading Ritual Trigger */}
        {activeNotes.length > 0 && (
          <button
            type="button"
            onClick={() => setIsRitualOpen(true)}
            className="cursor-pointer mt-3 text-xs font-bold text-ink-light hover:text-rose-600 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white/80 transition-colors"
          >
            <BookOpen size={13} className="text-rose-500" />
            <span>
              {t("openMonthJar") || (isAr ? "قراءة حصاد الشهر 📖" : "Open this month's jar 📖")}
            </span>
          </button>
        )}
      </div>

      {/* Accessible Chronological List Alternative */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-bold text-ink-light">
          <span>{isAr ? "قائمة التدوينات" : "Chronological Notes"}</span>
          <span>{activeNotes.length}</span>
        </div>

        {activeNotes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-card/60 py-12 px-5 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 text-2xl">
              🌸
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-ink">
                {t("barakahJarEmptyTitle") ||
                  (isAr
                    ? "جرّتكِ بانتظار أول نعمة 🌸"
                    : "Your jar is ready for its first little blessing 🌸")}
              </h3>
              <p className="text-xs text-ink-light max-w-xs mx-auto">
                {t("barakahJarEmptySubtitle") ||
                  (isAr
                    ? "كلمة طيّبة، أو لحظة هادئة، أو شيء تشعرين بالامتنان له."
                    : "A kind word, a peaceful moment, or something you are grateful for.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="cursor-pointer mt-2 px-5 py-2.5 rounded-2xl bg-hotpink text-white text-xs font-black shadow-rose-xs hover:bg-pink-600 active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{t("addBlessing") || (isAr ? "أضيفي نعمة" : "Add a blessing")}</span>
            </button>
          </div>
        ) : (
          /* Notes Cards Stream */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeNotes.map((entry) => {
              const colorCfg = (PAPER_COLORS as any)[entry.paperColor || "blush"] || PAPER_COLORS.blush;
              const flowerCfg = (FLOWER_STYLES as any)[entry.flowerStyle || "sakura"] || FLOWER_STYLES.sakura;

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    setIsRandomPick(false);
                    setReadingEntryId(entry.id);
                  }}
                  className={cn(
                    "cursor-pointer p-4 rounded-3xl border transition-all text-start flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-[0.99] relative overflow-hidden",
                    colorCfg.bgClass,
                    colorCfg.borderClass
                  )}
                >
                  {/* Top Note Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{flowerCfg.emoji}</span>
                    <span className="text-[10px] font-bold text-ink-light flex items-center gap-1">
                      <Calendar size={11} className="text-rose-500" />
                      <span>{formatBlessingDate(entry.date, isAr)}</span>
                    </span>
                  </div>

                  {/* Body Content Preview */}
                  <div className="space-y-1 mb-2">
                    {entry.title && (
                      <h4 className="text-xs font-black text-ink line-clamp-1">
                        {entry.title}
                      </h4>
                    )}
                    <p className="text-xs text-ink/90 font-medium line-clamp-2 leading-relaxed">
                      {entry.body}
                    </p>
                  </div>

                  {/* Attachment indicator if present */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-ink-light">
                      <span>📸</span>
                      <span>{isAr ? "صورة مرفقة" : "Photo attached"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
