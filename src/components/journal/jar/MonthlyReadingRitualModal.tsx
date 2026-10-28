import React, { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Check,
  Calendar,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  PAPER_COLORS,
  FLOWER_STYLES,
  formatBlessingDate,
  formatMonthName,
} from "@/lib/barakahJarEngine";
import { type JournalEntry } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface MonthlyReadingRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: JournalEntry[];
  monthKey: string;
}

export const MonthlyReadingRitualModal: React.FC<MonthlyReadingRitualModalProps> = ({
  isOpen,
  onClose,
  notes,
  monthKey,
}) => {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || notes.length === 0) return null;

  const currentEntry = notes[currentIndex] || notes[0];
  const colorCfg = (PAPER_COLORS as any)[currentEntry.paperColor || "blush"] || PAPER_COLORS.blush;
  const flowerCfg = (FLOWER_STYLES as any)[currentEntry.flowerStyle || "sakura"] || FLOWER_STYLES.sakura;

  const handleNext = () => {
    if (currentIndex < notes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleExportAll = () => {
    const formatted = notes
      .map(
        (n, i) =>
          `[${i + 1}] ${formatBlessingDate(n.date, isAr)}\n${n.title ? `${n.title}\n` : ""}${n.body}`
      )
      .join("\n\n──────────────────\n\n");

    const header = isAr
      ? `🤍 حصاد نِعَم ${formatMonthName(monthKey, isAr)} (${notes.length} نعمة)\n\n`
      : `🤍 Barakah Harvest for ${formatMonthName(monthKey, isAr)} (${notes.length} blessings)\n\n`;

    navigator.clipboard?.writeText(header + formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-surface/90">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {isAr
                  ? `حصاد نِعَم ${formatMonthName(monthKey, isAr)}`
                  : `Blessings Harvest • ${formatMonthName(monthKey, isAr)}`}
              </h3>
              <p className="text-[10px] text-ink-light">
                {t("readingRitualSubtitle") ||
                  (isAr
                    ? "تأمّلي برفق كل نعمة ونور زرعتهِ في هذا الشهر."
                    : "Gently turn through each blessing you gathered this month.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar & Note Counter */}
        <div className="px-5 py-2.5 bg-surface/50 border-b border-border/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">
              {isAr ? "النعمة" : "Blessing"} {currentIndex + 1} {isAr ? "من" : "of"} {notes.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportAll}
            className="cursor-pointer text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            {copiedAll ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
            <span>{copiedAll ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "تصدير كل النعم" : "Export all")}</span>
          </button>
        </div>

        {/* Note Card Display */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1 flex flex-col justify-center">
          <div
            className={cn(
              "w-full rounded-3xl border p-6 shadow-sm transition-all duration-300 relative",
              colorCfg.bgClass,
              colorCfg.borderClass
            )}
          >
            {/* Flower Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{flowerCfg.emoji}</span>
              <span className="text-xs font-bold text-ink-light flex items-center gap-1">
                <Calendar size={13} className="text-rose-500" />
                <span>{formatBlessingDate(currentEntry.date, isAr)}</span>
              </span>
            </div>

            {/* Note Title */}
            {currentEntry.title && (
              <h4 className="text-base font-black text-ink mb-2 leading-snug">
                {currentEntry.title}
              </h4>
            )}

            {/* Note Body */}
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-medium">
              {currentEntry.body}
            </p>

            {/* Attachment preview if present */}
            {currentEntry.attachments && currentEntry.attachments.length > 0 && currentEntry.attachments[0].url && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-border/70 max-h-48">
                <img
                  src={currentEntry.attachments[0].url}
                  alt="Blessing memory"
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Privacy Notice Banner */}
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-[10.5px] text-amber-900 dark:text-amber-200">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>
              {t("exportPrivacyNotice") ||
                (isAr
                  ? "قد تحتوي تدوينات النعم على تأملات خاصة وشخصية جداً. احرصي على مشاركتها أو حفظها في أماكن آمنة فقط."
                  : "Barakah notes may contain personal, intimate reflections. Only share or save to secure locations.")}
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-border/60 bg-surface/90 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-2xl border border-border text-xs font-black flex items-center gap-1.5 transition-all",
              currentIndex === 0 ? "opacity-30 cursor-not-allowed text-ink-lighter" : "text-ink hover:bg-surface active:scale-95"
            )}
          >
            {isAr ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            <span>{isAr ? "السابقة" : "Previous"}</span>
          </button>

          {currentIndex === notes.length - 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-5 py-2 rounded-2xl bg-hotpink text-white text-xs font-black shadow-rose-xs hover:bg-pink-600 active:scale-95 flex items-center gap-1.5"
            >
              <span>{isAr ? "تم الحصاد 🤍" : "Complete 🤍"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="cursor-pointer px-5 py-2 rounded-2xl bg-hotpink text-white text-xs font-black shadow-rose-xs hover:bg-pink-600 active:scale-95 flex items-center gap-1.5"
            >
              <span>{isAr ? "التالية" : "Next"}</span>
              {isAr ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
