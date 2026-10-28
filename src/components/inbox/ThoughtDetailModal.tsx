import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Edit2,
  Check,
  Play,
  Pause,
  Volume2,
  Calendar,
  Sparkles,
  Scissors,
  Trash2,
  Tag,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type BrainDumpItem,
  type BrainDumpLabel,
  BRAIN_DUMP_LABELS,
  formatAudioSeconds,
} from "@/lib/brainDumpEngine";

interface ThoughtDetailModalProps {
  isOpen: boolean;
  item: BrainDumpItem | null;
  onClose: () => void;
  onOrganize: (item: BrainDumpItem) => void;
  onSplit: (item: BrainDumpItem) => void;
}

export function ThoughtDetailModal({
  isOpen,
  item,
  onClose,
  onOrganize,
  onSplit,
}: ThoughtDetailModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const { updateBrainDumpItem, deleteBrainDumpItem } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [label, setLabel] = useState<BrainDumpLabel | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setContent(item.content);
      setLabel(item.label);
      setIsEditing(false);
    }
  }, [item]);

  const handleSaveEdit = useCallback(() => {
    if (!item) return;
    updateBrainDumpItem(item.id, {
      title: title.trim() || undefined,
      content: content.trim(),
      label,
    });
    setIsEditing(false);
  }, [item, title, content, label, updateBrainDumpItem]);

  const togglePlayAudio = useCallback(() => {
    if (!item?.audioDataUrl) return;
    if (!audioElementRef.current) {
      const audio = new Audio(item.audioDataUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onpause = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  }, [item?.audioDataUrl, isPlayingAudio]);

  const handleDelete = useCallback(() => {
    if (!item) return;
    deleteBrainDumpItem(item.id);
    onClose();
  }, [item, deleteBrainDumpItem, onClose]);

  const handleNavigateDestination = useCallback(() => {
    if (!item?.destination) return;
    let route = "/more";
    switch (item.destination.type) {
      case "task":
      case "shopping_task":
        route = "/tasks";
        break;
      case "goal":
        route = "/goals";
        break;
      case "journal":
        route = "/journal";
        break;
      case "business_project":
        route = "/business";
        break;
      case "travel_trip":
        route = "/travel";
        break;
      case "learning_note":
      case "learning_item":
        route = "/learning";
        break;
    }
    onClose();
    navigate({ to: route });
  }, [item?.destination, navigate, onClose]);

  if (!isOpen || !item) return null;

  const currentLabelMeta = label ? BRAIN_DUMP_LABELS.find((l) => l.key === label) : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#FFF8FA] dark:bg-card border border-pink-200 dark:border-pink-900/60 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-pink-900/40">
          <div className="flex items-center gap-2">
            {currentLabelMeta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                  currentLabelMeta.bgLight,
                  currentLabelMeta.textColor,
                  currentLabelMeta.borderLight
                )}
              >
                <span>{currentLabelMeta.emoji}</span>
                <span>{isAr ? currentLabelMeta.labelAr : currentLabelMeta.labelEn}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <span>🌸</span>
                <span>{isAr ? "فكرة حرة" : "Note"}</span>
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-full hover:bg-pink-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title={isAr ? "تعديل" : "Edit"}
              >
                <Edit2 size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveEdit}
                className="p-1.5 rounded-full bg-[#FF1493] text-white hover:bg-pink-600 transition-colors cursor-pointer"
                title={isAr ? "حفظ التعديلات" : "Save"}
              >
                <Check size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-pink-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("optionalTitle")}
                className="w-full rounded-xl bg-white dark:bg-stone-900/60 px-3.5 py-2 text-sm font-bold text-[#2b1727] dark:text-pink-100 border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full rounded-2xl bg-white dark:bg-stone-900/60 p-3.5 text-sm leading-relaxed text-[#2b1727] dark:text-pink-100 border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30 resize-none font-sans"
              />

              {/* Label selector in edit mode */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-stone-600 dark:text-pink-200 block mb-1">
                  {isAr ? "تعديل الوسم:" : "Change label:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BRAIN_DUMP_LABELS.map((meta) => {
                    const isSelected = label === meta.key;
                    return (
                      <button
                        key={meta.key}
                        type="button"
                        onClick={() => setLabel(isSelected ? undefined : meta.key)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#FF1493] text-white border-[#FF1493]"
                            : cn(meta.bgLight, meta.textColor, meta.borderLight)
                        )}
                      >
                        {meta.emoji} {isAr ? meta.labelAr : meta.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {item.title && (
                <h3 className="text-base font-extrabold text-[#2b1727] dark:text-pink-100">
                  {item.title}
                </h3>
              )}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/40 border border-pink-100 dark:border-pink-900/30 text-sm leading-relaxed text-[#2b1727] dark:text-pink-100 whitespace-pre-wrap font-sans">
                {item.content}
              </div>
            </div>
          )}

          {/* Voice note full player */}
          {item.audioDataUrl && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-900/50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF1493] text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-[#2b1727] dark:text-pink-100 flex items-center gap-1.5">
                    <Volume2 size={15} className="text-[#FF1493]" />
                    <span>{isAr ? "ملاحظة صوتية مسجلة" : "Voice Recording"}</span>
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatAudioSeconds(item.audioDurationSeconds || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Destination Link info */}
          {item.destination && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.destination.isProtected ? (
                  <Lock size={16} className="text-pink-600" />
                ) : (
                  <ExternalLink size={16} className="text-emerald-600" />
                )}
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    {isAr ? "مرتبطة بالوجهة:" : "Linked Destination:"}
                  </span>
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                    {item.destination.isProtected
                      ? t("protectedJournalEntry")
                      : item.destination.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNavigateDestination}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {t("openDestination")}
              </button>
            </div>
          )}
        </div>

        {/* Action buttons footer */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-pink-100 dark:border-pink-900/40">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isAr ? "حذف" : "Delete"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSplit(item);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
            >
              <Scissors size={14} />
              <span>{t("splitThought")}</span>
            </button>

            {item.status !== "organized" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOrganize(item);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:brightness-105 active:scale-97 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{t("organizeAction")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
