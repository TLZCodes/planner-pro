import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { type WeekInBloomKeepsake } from "@/lib/weekInBloomEngine";
import { BloomCardPreview } from "./BloomCardPreview";
import { X, Download, Share2, Sparkles, Check, Info } from "lucide-react";

interface BloomExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  keepsake: WeekInBloomKeepsake;
  isAr?: boolean;
}

export function BloomExportModal({
  isOpen,
  onClose,
  keepsake,
  isAr = false,
}: BloomExportModalProps) {
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">("portrait");
  const [showAyxaSignature, setShowAyxaSignature] = useState(keepsake.showAyxaSignature);
  const [showDateRange, setShowDateRange] = useState(keepsake.showDateRange);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const previewKeepsake: WeekInBloomKeepsake = {
    ...keepsake,
    showAyxaSignature,
    showDateRange,
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const filename = `AYXA_Week_in_Bloom_${keepsake.weekStartDate}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const filename = `AYXA_Week_in_Bloom_${keepsake.weekStartDate}.png`;
        const file = new File([blob], filename, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: keepsake.title || "My Week in Bloom",
            });
          } catch (shareErr) {
            // User cancelled share; ignore
          }
        } else {
          // Fallback to download
          handleDownloadImage();
        }
      }, "image/png");
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-rise">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-surface/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌷</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "معاينة وتصدير التذكار" : "Export Bloom Keepsake"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr
                  ? "تحميل صورة عالية الدقة لمشاركتها أو حفظها في ألبومكِ"
                  : "Save high-resolution image to your photo gallery or share"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Center Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start space-y-4 bg-muted/20">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-surface p-1 rounded-2xl border border-border/70 shadow-2xs">
            <button
              type="button"
              onClick={() => setAspectRatio("portrait")}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                aspectRatio === "portrait"
                  ? "bg-hotpink text-white shadow-rose-xs"
                  : "text-ink-light hover:text-ink"
              }`}
            >
              📱 {isAr ? "طولي (قصة)" : "Portrait (Story)"}
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("square")}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                aspectRatio === "square"
                  ? "bg-hotpink text-white shadow-rose-xs"
                  : "text-ink-light hover:text-ink"
              }`}
            >
              ⏹️ {isAr ? "مربع (منشور)" : "Square (Post)"}
            </button>
          </div>

          {/* Rendered Live Card inside scaled container */}
          <div className="w-full max-w-sm sm:max-w-md shadow-lg rounded-3xl overflow-hidden">
            <BloomCardPreview
              keepsake={previewKeepsake}
              isAr={isAr}
              aspectRatio={aspectRatio}
              innerRef={cardRef}
            />
          </div>

          {/* Export Settings Toggles */}
          <div className="w-full max-w-md p-3.5 rounded-2xl bg-card border border-border/70 space-y-2 text-xs">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-bold text-ink">
                {isAr ? "إظهار نطاق التواريخ" : "Show Date Range"}
              </span>
              <input
                type="checkbox"
                checked={showDateRange}
                onChange={(e) => setShowDateRange(e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-bold text-ink">
                {isAr ? "توقيع أيكسا (AYXA Signature)" : "AYXA Bloom Signature"}
              </span>
              <input
                type="checkbox"
                checked={showAyxaSignature}
                onChange={(e) => setShowAyxaSignature(e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Privacy & Lock Notice */}
          <div className="w-full max-w-md flex items-start gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              {isAr
                ? "ملاحظة: الصور المصدّرة أو المشتركة تُحفظ في جهازكِ خارج قفل PIN الخاص بدفتر اليوميات."
                : "Notice: Exported or shared images will be saved directly to your device storage, outside the in-app Journal PIN lock."}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/80 bg-surface/50 shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 rounded-full border border-border text-xs font-bold text-ink-light hover:text-ink"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <div className="flex items-center gap-2">
            {"share" in navigator && (
              <button
                type="button"
                onClick={handleShare}
                disabled={isExporting}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-pink-300 dark:border-pink-800 text-hotpink bg-pink-50/50 dark:bg-pink-950/20 text-xs font-extrabold hover:bg-pink-100/50 transition-all active:scale-95"
              >
                <Share2 size={14} />
                <span>{isAr ? "مشاركة" : "Share"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="cursor-pointer flex items-center gap-1.5 px-5 py-2.5 rounded-full grad-theme text-white text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
            >
              {exportSuccess ? (
                <>
                  <Check size={14} />
                  <span>{isAr ? "تم الحفظ بنجاح! 🌸" : "Saved! 🌸"}</span>
                </>
              ) : isExporting ? (
                <span>{isAr ? "جارٍ التصدير..." : "Exporting..."}</span>
              ) : (
                <>
                  <Download size={14} />
                  <span>{isAr ? "تحميل الصورة 🖼️" : "Download PNG 🖼️"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
