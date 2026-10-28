import React, { useState, useRef } from "react";
import { X, Download, Share2, Sparkles, Check, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import {
  type VisionBoard,
  type VisionBoardItem,
  VISION_BOARD_THEMES,
  WASHI_TAPE_CLASSES,
} from "@/lib/visionEngine";
import { type Goal } from "@/lib/store";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

interface ExportVisionBoardModalProps {
  board: VisionBoard;
  items: VisionBoardItem[];
  goals: Goal[];
  isAr: boolean;
  onClose: () => void;
}

export function ExportVisionBoardModal({
  board,
  items,
  goals,
  isAr,
  onClose,
}: ExportVisionBoardModalProps) {
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeCaptions, setIncludeCaptions] = useState(board.showCaptions);
  const [includeGoalProgress, setIncludeGoalProgress] = useState(board.showGoalProgress);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const theme = VISION_BOARD_THEMES[board.theme] || VISION_BOARD_THEMES.blossom;

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const filename = `AYXA-Vision-Board-${board.title.replace(/\s+/g, "_")}.png`;

      // Trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error("Export vision board failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!exportRef.current || !navigator.share) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `AYXA-Vision-Board-${board.title}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: board.title,
            text: isAr ? "لوحة رؤيتي في AYXA Planner 🌸" : "My Vision Board in AYXA Planner 🌸",
            files: [file],
          });
        }
      }, "image/png");
    } catch (err) {
      console.warn("Share failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-fade-in">
      <div
        className="w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-3.5 bg-surface/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "تصدير لوحة الرؤية بصورة عالية الدقة" : "Export High-Res Vision Board"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? "احفظيها كخلفية لهاتفكِ أو شاركيها" : "Save as phone wallpaper or keepsake"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options Toggles */}
        <div className="border-b border-border/60 bg-surface/30 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-ink">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTitle}
              onChange={(e) => setIncludeTitle(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
            <span>{isAr ? "تضمين عنوان اللوحة" : "Include Title"}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCaptions}
              onChange={(e) => setIncludeCaptions(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
            <span>{isAr ? "تضمين الملاحظات والتعليقات" : "Include Captions"}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeGoalProgress}
              onChange={(e) => setIncludeGoalProgress(e.target.checked)}
              className="h-4 w-4 rounded accent-hotpink cursor-pointer"
            />
            <span>{isAr ? "تضمين تقدم الأهداف" : "Include Goal Progress"}</span>
          </label>
        </div>

        {/* Export Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/40">
          <div
            ref={exportRef}
            className={cn(
              "w-full rounded-3xl p-5 shadow-sm border space-y-4",
              theme.canvasBg,
              theme.patternClass,
              theme.borderClass
            )}
            style={{ direction: isAr ? "rtl" : "ltr" }}
          >
            {/* Board Header in Export */}
            {includeTitle && (
              <div className="text-center space-y-1 pb-2 border-b border-border/50">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-card/80 shadow-xs border border-pink-200/50">
                  <span className="text-xs">🌸</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
                    AYXA Planner Pro
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-ink tracking-tight">
                  {board.title}
                </h2>
                {board.timeHorizon && (
                  <span className="inline-block text-[11px] font-bold text-ink-light bg-surface px-2.5 py-0.5 rounded-full border border-border">
                    📅 {board.timeHorizon}
                  </span>
                )}
                {board.description && (
                  <p className="text-xs font-medium text-ink-light max-w-sm mx-auto pt-0.5">
                    {board.description}
                  </p>
                )}
              </div>
            )}

            {/* Items Grid / Collage */}
            <div className="grid grid-cols-2 gap-3">
              {sortedItems.map((it) => {
                const linkedGoal = it.linkedGoalId ? goals.find((g) => g.id === it.linkedGoalId) : undefined;
                const washiClass = WASHI_TAPE_CLASSES[it.washiColor || "pink"] || WASHI_TAPE_CLASSES.pink;
                return (
                  <div
                    key={it.id}
                    className="relative rounded-2xl border border-pink-100/80 bg-white/95 dark:bg-card/95 p-3 shadow-xs space-y-2 overflow-hidden"
                  >
                    {/* Washi */}
                    {board.showDecorations && (
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
                        <div className={cn("h-3 w-12 rounded-xs opacity-90", washiClass)} />
                      </div>
                    )}

                    {it.type === "photo" && it.imageUrl && (
                      <div className="overflow-hidden rounded-xl aspect-square bg-surface border border-border/40">
                        <img
                          src={it.imageUrl}
                          alt={it.title || "Vision item"}
                          className="h-full w-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}

                    {it.title && (
                      <h4 className="text-xs font-bold text-ink line-clamp-2">
                        {it.title}
                      </h4>
                    )}

                    {it.type === "text" && it.content && (
                      <blockquote className="rounded-xl bg-purple-50/70 p-2 text-xs font-semibold text-purple-900 italic border-l-2 border-purple-400">
                        {it.content}
                      </blockquote>
                    )}

                    {it.type === "wish" && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50/80 p-2 rounded-xl">
                        <span>✨</span>
                        <span>{it.content || it.title}</span>
                      </div>
                    )}

                    {it.type === "linked_goal" && linkedGoal && (
                      <div className="rounded-xl bg-rose-50/60 p-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                          <span>{linkedGoal.icon || "🎯"}</span>
                          <span className="truncate">{linkedGoal.title}</span>
                        </div>
                        {includeGoalProgress && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] font-mono font-bold text-hotpink">
                              <span>{linkedGoal.progress}%</span>
                            </div>
                            <ProgressBar value={linkedGoal.progress} className="h-1.5" barClass="grad-theme" />
                          </div>
                        )}
                      </div>
                    )}

                    {includeCaptions && it.caption && (
                      <p className="text-[10px] font-medium text-ink-light italic">
                        "{it.caption}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer watermark */}
            <div className="pt-2 text-center text-[10px] font-bold text-ink-light/60">
              Designed with AYXA Planner Pro ✨
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border px-5 py-3.5 bg-card flex items-center justify-between gap-2.5">
          {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
            <button
              type="button"
              disabled={isExporting}
              onClick={handleShare}
              className="cursor-pointer py-2.5 px-3.5 rounded-xl border border-border bg-surface text-xs font-bold text-ink hover:bg-muted flex items-center gap-1.5"
            >
              <Share2 size={14} />
              <span>{isAr ? "مشاركة" : "Share"}</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer py-2.5 px-4 rounded-xl border border-border bg-surface text-xs font-bold text-ink hover:bg-muted transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="cursor-pointer py-2.5 px-5 rounded-xl grad-theme text-xs font-black text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isAr ? "جارٍ التحميل..." : "Generating..."}</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>{isAr ? "تم التحميل بنجاح ✨" : "Saved ✨"}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>{isAr ? "تحميل الصورة عالية الدقة 📥" : "Download High-Res 📥"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
