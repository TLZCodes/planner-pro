import React, { useState, useRef, useCallback } from "react";
import {
  MoreVertical,
  Play,
  Pause,
  Volume2,
  Calendar,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit3,
  Scissors,
  CheckCircle2,
  Lock,
  Tag,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type BrainDumpItem,
  BRAIN_DUMP_LABELS,
  formatAudioSeconds,
  type BrainDumpLabel,
} from "@/lib/brainDumpEngine";

interface InboxItemCardProps {
  item: BrainDumpItem;
  onOpenDetail: (item: BrainDumpItem) => void;
  onEdit: (item: BrainDumpItem) => void;
  onOrganize: (item: BrainDumpItem) => void;
  onSplit: (item: BrainDumpItem) => void;
}

export function InboxItemCard({
  item,
  onOpenDetail,
  onEdit,
  onOrganize,
  onSplit,
}: InboxItemCardProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const {
    state,
    deleteBrainDumpItem,
    archiveBrainDumpItem,
    restoreBrainDumpItem,
    updateBrainDumpItem,
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Label meta
  const labelMeta = item.label
    ? BRAIN_DUMP_LABELS.find((l) => l.key === item.label)
    : undefined;

  // Toggle voice playback
  const togglePlayAudio = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!item.audioDataUrl) return;

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
    },
    [item.audioDataUrl, isPlayingAudio]
  );

  // Destination route lookup
  const getDestinationRoute = (type: string) => {
    switch (type) {
      case "task":
      case "shopping_task":
        return "/tasks";
      case "goal":
        return "/goals";
      case "journal":
        return "/journal";
      case "business_project":
        return "/business";
      case "travel_trip":
        return "/travel";
      case "learning_note":
      case "learning_item":
        return "/learning";
      default:
        return "/more";
    }
  };

  const handleNavigateDestination = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.destination) return;
    const route = getDestinationRoute(item.destination.type);
    navigate({ to: route });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBrainDumpItem(item.id);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === "archived") {
      restoreBrainDumpItem(item.id);
    } else {
      archiveBrainDumpItem(item.id);
    }
    setShowMenu(false);
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString(
    isAr ? "ar-EG" : "en-US",
    { month: "short", day: "numeric" }
  );

  return (
    <div
      onClick={() => onOpenDetail(item)}
      className="relative group rounded-3xl bg-white dark:bg-card border border-pink-100/90 dark:border-pink-900/40 p-4 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer overflow-hidden space-y-2.5"
    >
      {/* Pastel washi tape strip at top */}
      <div className="absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 opacity-60" />

      {/* Header: Label + Date + Overflow Menu */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {labelMeta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                labelMeta.bgLight,
                labelMeta.textColor,
                labelMeta.borderLight,
                labelMeta.darkBg,
                labelMeta.darkBorder
              )}
            >
              <span>{labelMeta.emoji}</span>
              <span>{isAr ? labelMeta.labelAr : labelMeta.labelEn}</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <span>🌸</span>
              <span>{isAr ? "فكرة حرة" : "Note"}</span>
            </span>
          )}

          {item.destination && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={11} />
              <span>{isAr ? "مرتبة" : "Organized"}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-[11px] font-medium">{formattedDate}</span>

          {/* Menu button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="p-1 rounded-full hover:bg-pink-100/60 dark:hover:bg-pink-900/40 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 rtl:right-auto rtl:left-0 top-7 z-30 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-pink-900/60 shadow-xl py-1.5 text-xs animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetail(item);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-left font-semibold cursor-pointer"
                >
                  <Edit3 size={14} className="text-pink-500" />
                  <span>{isAr ? "عرض وتعديل" : "Open & Edit"}</span>
                </button>

                {item.status !== "organized" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onOrganize(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-left font-semibold cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#FF1493]" />
                    <span>{t("organizeAction")}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onSplit(item);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-left font-semibold cursor-pointer"
                >
                  <Scissors size={14} className="text-purple-500" />
                  <span>{t("splitThought")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleArchive}
                  className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 dark:text-pink-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-left font-semibold cursor-pointer"
                >
                  {item.status === "archived" ? (
                    <>
                      <ArchiveRestore size={14} className="text-teal-500" />
                      <span>{isAr ? "استعادة" : "Restore"}</span>
                    </>
                  ) : (
                    <>
                      <Archive size={14} className="text-stone-500" />
                      <span>{isAr ? "أرشفة" : "Archive"}</span>
                    </>
                  )}
                </button>

                <div className="h-px bg-pink-100 dark:bg-pink-900/40 my-1" />

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-semibold cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{isAr ? "حذف" : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title (if present) */}
      {item.title && (
        <h4 className="text-sm font-bold text-[#2b1727] dark:text-pink-100 line-clamp-1">
          {item.title}
        </h4>
      )}

      {/* Body preview */}
      <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 line-clamp-3 font-sans">
        {item.content || (isAr ? "(ملاحظة صوتية)" : "(Voice note)")}
      </p>

      {/* Voice note indicator & mini player */}
      {item.audioDataUrl && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/50"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF1493] text-white shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlayingAudio ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2b1727] dark:text-pink-200">
              <Volume2 size={13} className="text-[#FF1493]" />
              <span>{isAr ? "تسجيل صوتي" : "Voice Note"}</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-muted-foreground bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md">
            {formatAudioSeconds(item.audioDurationSeconds || 0)}
          </span>
        </div>
      )}

      {/* Destination Reference Link or Organize Action Button */}
      <div className="pt-1 flex items-center justify-between gap-2 border-t border-pink-50 dark:border-pink-900/20">
        {item.destination ? (
          <button
            type="button"
            onClick={handleNavigateDestination}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF1493] dark:text-pink-300 hover:underline cursor-pointer"
          >
            {item.destination.isProtected ? (
              <Lock size={12} className="text-pink-600" />
            ) : (
              <ExternalLink size={12} />
            )}
            <span className="line-clamp-1">
              {item.destination.isProtected
                ? t("protectedJournalEntry")
                : `${isAr ? "عرض الوجهة:" : "Open:"} ${item.destination.title}`}
            </span>
          </button>
        ) : (
          <div />
        )}

        {item.status !== "organized" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOrganize(item);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/60 text-[#FF1493] dark:text-pink-300 font-bold text-xs border border-pink-200/80 dark:border-pink-800 transition-all active:scale-95 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
          >
            <Sparkles size={13} />
            <span>{t("organizeAction")}</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 dark:bg-stone-900/95 p-4 rounded-3xl text-center space-y-2 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-bold text-stone-800 dark:text-pink-100">
            {t("deleteThoughtConfirm")}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t("deleteThoughtNotice")}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 rounded-xl text-xs font-semibold text-stone-600 border border-stone-200 hover:bg-stone-100 cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
            >
              {isAr ? "نعم، حذف" : "Yes, Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
