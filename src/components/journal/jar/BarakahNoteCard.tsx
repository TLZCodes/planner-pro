import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookmarkMinus,
  Share2,
  Calendar,
  Check,
  AlertTriangle,
  Flower2,
} from "lucide-react";
import {
  PAPER_COLORS,
  FLOWER_STYLES,
  formatBlessingDate,
  type PaperColor,
  type FlowerStyle,
} from "@/lib/barakahJarEngine";
import { type JournalEntry, useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BarakahNoteCardProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  currentIndex?: number;
  totalCount?: number;
  isPickRandom?: boolean;
}

export const BarakahNoteCard: React.FC<BarakahNoteCardProps> = ({
  isOpen,
  onClose,
  entry,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalCount,
  isPickRandom = false,
}) => {
  const { editJournal, removeJournal } = useApp();
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen || !entry) return null;

  const colorCfg = (PAPER_COLORS as any)[entry.paperColor || "blush"] || PAPER_COLORS.blush;
  const flowerCfg = (FLOWER_STYLES as any)[entry.flowerStyle || "sakura"] || FLOWER_STYLES.sakura;

  const handleRemoveFromJarOnly = () => {
    editJournal(entry.id, { isBarakahJar: false });
    onClose();
  };

  const handleConfirmPermanentDelete = () => {
    removeJournal(entry.id);
    setConfirmDelete(false);
    onClose();
  };

  const handleCopyText = () => {
    const textToCopy = `${entry.title ? `${entry.title}\n\n` : ""}${entry.body}\n\n— ${formatBlessingDate(entry.date, isAr)}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Permanent Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 border border-border shadow-xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-ink">
                {t("deleteBlessingConfirm") || (isAr ? "هل ترغبين بحذف هذه التدوينة نهائياً؟" : "Permanently delete this journal entry?")}
              </h4>
              <p className="text-xs text-ink-light">
                {t("deleteBlessingNotice") ||
                  (isAr
                    ? "سيتم حذف هذه التدوينة نهائياً من جرّة النعم ومن دفتر اليوميات."
                    : "This will permanently remove the record from both the Barakah Jar and your Journal.")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer flex-1 py-2.5 rounded-2xl border border-border text-xs font-black text-ink hover:bg-surface"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="cursor-pointer flex-1 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-black shadow-xs hover:bg-rose-700"
              >
                {isAr ? "حذف نهائي" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Unfolded Card Modal */}
      <div
        className={cn(
          "w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300",
          colorCfg.bgClass,
          colorCfg.borderClass
        )}
      >
        {/* Washi Tape Header Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-white/70 dark:bg-card/70 border-b border-rose-200/60 rounded-b-md shadow-2xs" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{flowerCfg.emoji}</span>
            {isPickRandom ? (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 border border-rose-300/60">
                {isAr ? "سحب عشوائي ✨" : "Random Blessing ✨"}
              </span>
            ) : typeof currentIndex === "number" && typeof totalCount === "number" ? (
              <span className="text-[11px] font-bold text-ink-light">
                {currentIndex + 1} / {totalCount}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyText}
              title={isAr ? "نسخ النعمة" : "Copy note"}
              className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-white/60 dark:hover:bg-card/60 transition-colors"
            >
              {copiedNotice ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-white/60 dark:hover:bg-card/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Note Content Area */}
        <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto no-scrollbar">
          {/* Date Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-light">
            <Calendar size={13} className="text-rose-500" />
            <span>{formatBlessingDate(entry.date, isAr)}</span>
          </div>

          {/* Title if present */}
          {entry.title && (
            <h3 className="text-base font-black text-ink leading-snug tracking-tight">
              {entry.title}
            </h3>
          )}

          {/* Full Note Body */}
          <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-medium">
            {entry.body}
          </div>

          {/* Attached Photo if available */}
          {entry.attachments && entry.attachments.length > 0 && entry.attachments[0].url && (
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-xs max-h-52">
              <img
                src={entry.attachments[0].url}
                alt="Blessing memory"
                className="w-full h-auto max-h-52 object-cover"
              />
            </div>
          )}
        </div>

        {/* Footer: Pagination Navigation & Actions */}
        <div className="px-5 py-3 border-t border-border/50 bg-white/50 dark:bg-card/50 flex items-center justify-between">
          {/* Navigation (Next / Prev) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onPrev}
              className={cn(
                "cursor-pointer p-2 rounded-xl border border-border/60 bg-white dark:bg-card transition-all",
                !hasPrev ? "opacity-30 cursor-not-allowed" : "hover:border-rose-300 active:scale-95 text-ink"
              )}
              title={isAr ? "السابق" : "Previous"}
            >
              {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onNext}
              className={cn(
                "cursor-pointer p-2 rounded-xl border border-border/60 bg-white dark:bg-card transition-all",
                !hasNext ? "opacity-30 cursor-not-allowed" : "hover:border-rose-300 active:scale-95 text-ink"
              )}
              title={isAr ? "التالي" : "Next"}
            >
              {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Actions: Unlink from jar vs Permanent delete */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemoveFromJarOnly}
              title={
                isAr
                  ? "إزالة من الجرّة والاحتفاظ بالتدوينة في اليوميات"
                  : "Remove from jar only (keeps in Journal)"
              }
              className="cursor-pointer text-[11px] font-bold text-ink-light hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center gap-1"
            >
              <BookmarkMinus size={13} />
              <span>{isAr ? "إزالة من الجرّة" : "Remove from jar"}</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title={isAr ? "حذف نهائي من اليوميات" : "Delete permanently from Journal"}
              className="cursor-pointer text-[11px] font-bold text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
