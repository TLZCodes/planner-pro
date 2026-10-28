import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Sparkles, Brain, Paperclip, Mic, Tag, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  BRAIN_DUMP_LABELS,
  type BrainDumpLabel,
  getBrainDumpDraft,
  saveBrainDumpDraft,
  clearBrainDumpDraft,
  type BrainDumpDraft,
} from "@/lib/brainDumpEngine";
import { VoiceCaptureInline } from "./VoiceCaptureInline";

interface QuickCaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

export function QuickCaptureSheet({ isOpen, onClose, onSaved }: QuickCaptureSheetProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { addBrainDumpItem } = useApp();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<BrainDumpLabel | undefined>(undefined);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [audioDurationSec, setAudioDurationSec] = useState<number | undefined>(undefined);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Restore draft when opened
  useEffect(() => {
    if (isOpen) {
      const draft = getBrainDumpDraft();
      if (draft && (draft.content || draft.title || draft.audioDataUrl)) {
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setSelectedLabel(draft.label);
        setAudioDataUrl(draft.audioDataUrl);
        setAudioDurationSec(draft.audioDurationSeconds);
        if (draft.audioDataUrl) setShowVoiceRecorder(true);
        if (draft.title) setShowTitleInput(true);
        setDraftRestored(true);
      } else {
        setDraftRestored(false);
      }
      // Focus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!isOpen) return;
    if (content.trim() || title.trim() || audioDataUrl) {
      const draft: BrainDumpDraft = {
        title,
        content,
        label: selectedLabel,
        audioDataUrl,
        audioDurationSeconds: audioDurationSec,
        updatedAt: new Date().toISOString(),
      };
      saveBrainDumpDraft(draft);
    }
  }, [isOpen, title, content, selectedLabel, audioDataUrl, audioDurationSec]);

  const handleSave = useCallback(async () => {
    if (isSubmitting) return;
    const trimmedContent = content.trim();
    if (!trimmedContent && !audioDataUrl) return;

    setIsSubmitting(true);
    try {
      const newId = addBrainDumpItem({
        title: title.trim() || undefined,
        content: trimmedContent,
        label: selectedLabel,
        audioDataUrl,
        audioDurationSeconds: audioDurationSec,
        status: "unsorted",
      });

      // Clear draft on successful save
      clearBrainDumpDraft();
      setTitle("");
      setContent("");
      setSelectedLabel(undefined);
      setAudioDataUrl(undefined);
      setAudioDurationSec(undefined);
      setShowVoiceRecorder(false);
      setShowTitleInput(false);

      if (onSaved) onSaved(newId);
      onClose();
    } catch (e) {
      console.error("Failed to save thought", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, content, audioDataUrl, addBrainDumpItem, title, selectedLabel, audioDurationSec, onSaved, onClose]);

  const handleDiscardDraft = useCallback(() => {
    clearBrainDumpDraft();
    setTitle("");
    setContent("");
    setSelectedLabel(undefined);
    setAudioDataUrl(undefined);
    setAudioDurationSec(undefined);
    setShowVoiceRecorder(false);
    setShowTitleInput(false);
    setDraftRestored(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const canSave = Boolean(content.trim() || audioDataUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#FFF8FA] dark:bg-card border-t border-pink-200 dark:border-pink-900/60 p-4 pt-3 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Washi tape aesthetic decorative strip */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-pink-300/60 dark:bg-pink-700/60 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-pink-900/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/50 text-[#FF1493]">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2b1727] dark:text-pink-100">
                {t("brainDump")}
              </h3>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {t("brainDumpSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {draftRestored && (
              <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800 flex items-center gap-1">
                <RotateCcw size={10} />
                {isAr ? "مسودة مسترجعة" : "Draft restored"}
              </span>
            )}
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 transition-colors cursor-pointer"
              title={isAr ? "إغلاق ومسح المسودة" : "Discard & Close"}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {/* Optional Title Field */}
          {showTitleInput ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("optionalTitle")}
              className="w-full rounded-xl bg-white dark:bg-stone-900/50 px-3.5 py-2 text-sm font-semibold text-[#2b1727] dark:text-pink-100 border border-pink-200/80 dark:border-pink-900/50 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30"
              maxLength={120}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowTitleInput(true)}
              className="text-[11px] text-[#FF1493] dark:text-pink-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>+</span>
              <span>{isAr ? "إضافة عنوان اختياري" : "Add optional title"}</span>
            </button>
          )}

          {/* Main Thought Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("thoughtPlaceholder")}
            rows={4}
            className="w-full rounded-2xl bg-white dark:bg-stone-900/50 p-3.5 text-sm leading-relaxed text-[#2b1727] dark:text-pink-100 placeholder:text-muted-foreground/70 border border-pink-200/80 dark:border-pink-900/50 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30 resize-none font-sans"
          />

          {/* Voice Note Section */}
          {showVoiceRecorder ? (
            <VoiceCaptureInline
              initialAudioUrl={audioDataUrl}
              initialDurationSec={audioDurationSec}
              onAudioReady={(dataUrl, duration, transcript) => {
                setAudioDataUrl(dataUrl);
                setAudioDurationSec(duration);
                if (transcript && !content.trim()) {
                  setContent(transcript);
                }
              }}
              onDiscard={() => {
                setAudioDataUrl(undefined);
                setAudioDurationSec(undefined);
                setShowVoiceRecorder(false);
              }}
              className="bg-white/70 dark:bg-stone-900/40 border-pink-200/70 dark:border-pink-900/40"
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100/80 dark:bg-pink-900/30 text-[#FF1493] dark:text-pink-300 text-xs font-semibold hover:bg-pink-200/80 transition-colors cursor-pointer"
              >
                <Mic size={14} />
                <span>{isAr ? "تسجيل ملاحظة صوتية" : "Voice note"}</span>
              </button>
            </div>
          )}

          {/* Labels Pill Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-stone-600 dark:text-pink-200">
              <Tag size={12} />
              <span>{isAr ? "وسم الفكرة (اختياري):" : "Label (optional):"}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BRAIN_DUMP_LABELS.map((meta) => {
                const isSelected = selectedLabel === meta.key;
                return (
                  <button
                    key={meta.key}
                    type="button"
                    onClick={() =>
                      setSelectedLabel(isSelected ? undefined : meta.key)
                    }
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer",
                      isSelected
                        ? "bg-[#FF1493] text-white border-[#FF1493] shadow-xs scale-102"
                        : cn(
                            meta.bgLight,
                            meta.textColor,
                            meta.borderLight,
                            meta.darkBg,
                            meta.darkBorder,
                            "hover:opacity-90"
                          )
                    )}
                  >
                    <span>{meta.emoji}</span>
                    <span>{isAr ? meta.labelAr : meta.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-pink-100 dark:border-pink-900/30">
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="px-4 py-2.5 rounded-2xl text-stone-500 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
          >
            {isAr ? "إلغاء ومسح" : "Discard"}
          </button>

          <button
            type="button"
            disabled={!canSave || isSubmitting}
            onClick={handleSave}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer",
              canSave && !isSubmitting
                ? "bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white hover:brightness-105 active:scale-97 shadow-pink-500/25"
                : "bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
            )}
          >
            <Send size={14} className={isAr ? "rotate-180" : ""} />
            <span>{isSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : t("saveToInbox")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
