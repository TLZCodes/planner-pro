import React, { useState, useRef } from "react";
import { X, Download, Shield, Sparkles, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  getDaysInMonth,
  formatDayKey,
  CANONICAL_MOODS,
  type MoodPalette,
  type DailyMoodRecord,
  type MoodSummaryStats,
} from "@/lib/pixelsEngine";

interface ExportPixelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  palette: MoodPalette;
  dailyMoods: Record<string, DailyMoodRecord>;
  stats: MoodSummaryStats;
}

export const ExportPixelsModal: React.FC<ExportPixelsModalProps> = ({
  isOpen,
  onClose,
  year,
  palette,
  dailyMoods,
  stats,
}) => {
  const { t, lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";
  const previewRef = useRef<HTMLDivElement>(null);

  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeName, setIncludeName] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `AYXA_Year_in_Pixels_${year}.png`;
      a.click();

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Export error:", err);
      setIsExporting(false);
    }
  };

  const MONTHS_LIST = [
    { en: "Jan", ar: "يناير" },
    { en: "Feb", ar: "فبراير" },
    { en: "Mar", ar: "مارس" },
    { en: "Apr", ar: "أبريل" },
    { en: "May", ar: "مايو" },
    { en: "Jun", ar: "يونيو" },
    { en: "Jul", ar: "يوليو" },
    { en: "Aug", ar: "أغسطس" },
    { en: "Sep", ar: "سبتمبر" },
    { en: "Oct", ar: "أكتوبر" },
    { en: "Nov", ar: "نوفمبر" },
    { en: "Dec", ar: "ديسمبر" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-pink-500" />
            <h3 className="text-base font-bold text-ink">
              {t("exportYearTitle") || (isAr ? "تصدير لوحة السنة بالألوان" : "Export Year in Pixels")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options Toggles */}
        <div className="p-3 rounded-2xl bg-surface border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={includeLegend}
              onChange={(e) => setIncludeLegend(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
            />
            <span>{isAr ? "دليل الألوان" : "Legend"}</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={includeStats}
              onChange={(e) => setIncludeStats(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
            />
            <span>{isAr ? "الملخص السنوي" : "Summary"}</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={includeName}
              onChange={(e) => setIncludeName(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
            />
            <span>{isAr ? "اسم المستخدم" : "Name"}</span>
          </label>
        </div>

        {/* Printable Canvas Element Preview */}
        <div className="border border-border/70 rounded-2xl p-4 bg-white text-slate-900 overflow-x-auto shadow-inner">
          <div ref={previewRef} className="p-4 bg-white min-w-[320px] space-y-4">
            {/* Header in image */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black tracking-tight text-slate-900 font-display">
                AYXA Planner — Year in Pixels 🌈
              </h2>
              <p className="text-xs text-slate-500">
                {year} {includeName && state.user.name ? `• ${state.user.name}` : ""}
              </p>
            </div>

            {/* Pixels Matrix: 12 rows or columns */}
            <div className="space-y-1.5 pt-2">
              {MONTHS_LIST.map((mObj, mIdx) => {
                const daysInM = getDaysInMonth(year, mIdx);
                return (
                  <div key={mObj.en} className="flex items-center gap-1.5 text-[9px]">
                    <span className="w-7 font-bold text-slate-400 text-left font-mono">
                      {isAr ? mObj.ar : mObj.en}
                    </span>
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 31 }).map((_, dIdx) => {
                        const dayNum = dIdx + 1;
                        if (dayNum > daysInM) {
                          return <div key={dIdx} className="w-2 h-2 rounded-xs bg-transparent" />;
                        }
                        const k = formatDayKey(year, mIdx, dayNum);
                        const rec = dailyMoods[k];
                        const color = rec ? palette.moodColors[rec.mood] || "#F472B6" : "#E2E8F0";

                        return (
                          <div
                            key={k}
                            style={{ backgroundColor: color }}
                            className="w-2 h-2 rounded-xs flex-shrink-0"
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Legend */}
            {includeLegend && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 text-[9px] text-slate-600">
                {CANONICAL_MOODS.map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: palette.moodColors[m.id] }}
                    />
                    <span>{m.emoji} {isAr ? m.labelAr : m.labelEn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Stats */}
            {includeStats && (
              <div className="text-center text-[10px] text-slate-400 pt-1">
                {stats.daysLoggedYear} days checked in out of {stats.totalDaysInYear} days
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 flex items-start gap-2 text-xs text-ink-light">
          <Shield size={14} className="text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
          <p>
            {t("exportPrivacyNotice") ||
              (isAr
                ? "تُنشأ الصورة محليًا على جهازكِ دون رفع أي بيانات."
                : "The image is created locally on your device and is never uploaded.")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-ink-light hover:text-ink hover:bg-surface"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-rose-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            <span>{isExporting ? (isAr ? "جارٍ الإنشاء…" : "Creating…") : t("exportAsImage") || (isAr ? "حفظ كصورة (PNG)" : "Save as Image (PNG)")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
