import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Scissors, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type BrainDumpItem, splitThoughtContent } from "@/lib/brainDumpEngine";

interface SplitThoughtModalProps {
  isOpen: boolean;
  item: BrainDumpItem | null;
  onClose: () => void;
  onSplitCompleted?: () => void;
}

export function SplitThoughtModal({
  isOpen,
  item,
  onClose,
  onSplitCompleted,
}: SplitThoughtModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { splitBrainDumpItem } = useApp();

  const [rawText, setRawText] = useState("");
  const [splitDelimiter, setSplitDelimiter] = useState<"lines" | "double_lines">("lines");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setRawText(item.content);
    }
  }, [item]);

  // Derive resulting note segments
  const segments = useMemo(() => {
    if (!rawText.trim()) return [];
    if (splitDelimiter === "double_lines") {
      return rawText
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return splitThoughtContent(rawText);
  }, [rawText, splitDelimiter]);

  const handleConfirmSplit = useCallback(() => {
    if (!item || segments.length <= 1 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      splitBrainDumpItem(item.id, segments);
      if (onSplitCompleted) onSplitCompleted();
      onClose();
    } catch (e) {
      console.error("Failed to split thought", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [item, segments, isSubmitting, splitBrainDumpItem, onSplitCompleted, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#FFF8FA] dark:bg-card border border-pink-200 dark:border-pink-900/60 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-pink-900/40">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-900/50 text-[#FF1493]">
              <Scissors size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2b1727] dark:text-pink-100">
                {t("splitThought")}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t("splitThoughtPrompt")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content editor */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-pink-200 mb-1 block">
              {isAr ? "نص الفكرة الكامل:" : "Original Thought Content:"}
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={4}
              className="w-full rounded-2xl bg-white dark:bg-stone-900/60 p-3 text-xs leading-relaxed text-[#2b1727] dark:text-pink-100 border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30 resize-none font-sans"
            />
          </div>

          {/* Delimiter mode */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-stone-600 dark:text-pink-200">
              {isAr ? "طريقة التقسيم:" : "Split by:"}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSplitDelimiter("lines")}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  splitDelimiter === "lines"
                    ? "bg-[#FF1493] text-white border-[#FF1493]"
                    : "bg-white dark:bg-stone-900 text-stone-600 border-stone-200"
                )}
              >
                {isAr ? "كل سطر ملاحظة" : "Each line"}
              </button>
              <button
                type="button"
                onClick={() => setSplitDelimiter("double_lines")}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  splitDelimiter === "double_lines"
                    ? "bg-[#FF1493] text-white border-[#FF1493]"
                    : "bg-white dark:bg-stone-900 text-stone-600 border-stone-200"
                )}
              >
                {isAr ? "فقرات متباعدة" : "Paragraphs"}
              </button>
            </div>
          </div>

          {/* Preview of resulting notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-stone-700 dark:text-pink-200">
              <Eye size={13} className="text-[#FF1493]" />
              <span>
                {isAr
                  ? `معاينة النتيجة (${segments.length} ملاحظات جديدة):`
                  : `Preview (${segments.length} new notes):`}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {segments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  {isAr ? "لا توجد أسطر للتقسيم" : "No lines to split"}
                </p>
              ) : (
                segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-stone-900/50 border border-pink-100 dark:border-pink-900/40 text-xs text-[#2b1727] dark:text-pink-100 shadow-2xs flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] font-bold text-[#FF1493] bg-pink-50 dark:bg-pink-950/40 px-1.5 py-0.5 rounded-md shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="line-clamp-2">{seg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-pink-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>

          <button
            type="button"
            disabled={segments.length <= 1 || isSubmitting}
            onClick={handleConfirmSplit}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer",
              segments.length > 1 && !isSubmitting
                ? "bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white hover:brightness-105 active:scale-97 shadow-pink-500/25"
                : "bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
            )}
          >
            <Check size={15} />
            <span>{isSubmitting ? (isAr ? "جارٍ التقسيم..." : "Splitting...") : t("splitConfirm")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
