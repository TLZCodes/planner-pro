import React, { memo } from "react";
import {
  Lock,
  Edit2,
  Trash2,
  MoreVertical,
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";
import { type JournalEntry } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface JournalCardProps {
  entry: JournalEntry;
  isLocked: boolean;
  isAr: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const JournalCard = memo(function JournalCard({
  entry,
  isLocked,
  isAr,
  menuOpenId,
  setMenuOpenId,
  onOpen,
  onEdit,
  onDelete,
}: JournalCardProps) {
  const isMenuOpen = menuOpenId === entry.id;

  return (
    <>
      <div
        className="group relative rounded-3xl bg-card p-4 border border-border/80 shadow-sm hover:border-hotpink/40 transition-all space-y-3"
      >
        {/* Card Header: Mood, Title, Date & 3-dots */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border text-2xl shadow-xs">
              {entry.mood || "🌸"}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-black text-ink truncate">
                {isLocked ? (isAr ? "تدوينة سرية 🔒" : "Locked Entry 🔒") : (entry.title || (isAr ? "بدون عنوان" : "Untitled"))}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-light mt-0.5">
                <span>{entry.date}</span>
                <span>•</span>
                <span>{entry.time || "12:00"}</span>
                {entry.wordCount ? (
                  <>
                    <span>•</span>
                    <span>{entry.wordCount} {isAr ? "كلمة" : "words"}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action button & Lock Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isLocked && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Lock size={13} />
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(isMenuOpen ? null : entry.id);
              }}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/60 text-ink-light hover:text-ink transition-all active:scale-90"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Entry Body Preview */}
        {isLocked ? (
          <div className="rounded-2xl bg-surface/80 border border-dashed border-border/70 p-3 text-center">
            <p className="text-xs font-bold text-ink-light flex items-center justify-center gap-1.5">
              <Lock size={13} className="text-amber-500" />
              <span>{isAr ? "محتوى محمي بكلمة مرور" : "Content is password protected"}</span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-ink/80 leading-relaxed font-medium line-clamp-2">
            {entry.body}
          </p>
        )}

        {/* Meta tags & Sticker */}
        {!isLocked && (
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.isBarakahJar && (
                <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-black flex items-center gap-1">
                  <span>🤍</span>
                  <span>{isAr ? "جرّة النِّعم" : "Barakah Jar"}</span>
                </span>
              )}
              {entry.tags?.map((t) => (
                <span key={t} className="rounded-full bg-pink-500/10 text-hotpink px-2.5 py-0.5 text-[10px] font-bold">
                  #{t}
                </span>
              ))}
              {entry.attachments && entry.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-ink-light bg-surface border border-border/60 rounded-full px-2 py-0.5">
                  <ImageIcon size={10} />
                  <span>{entry.attachments.length}</span>
                </span>
              )}
            </div>
            <span className="text-base">{entry.sticker || "✨"}</span>
          </div>
        )}
      </div>

      {/* Full-Screen Action Sheet */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpenId(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border-t sm:border border-border/80 p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl space-y-2 animate-slide-up text-ink font-sans max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
              <span className="text-sm font-extrabold truncate max-w-[280px] text-ink">
                {entry.title || (isAr ? "تدوينة يومية" : "Journal Entry")}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpenId(null)}
                className="cursor-pointer p-1.5 rounded-full bg-surface text-ink-light hover:text-ink active:scale-90"
              >
                <X size={16} />
              </button>
            </div>


            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(null);
                onDelete();
              }}
              className="cursor-pointer flex w-full items-center gap-3 rounded-2xl p-3.5 text-[13.5px] font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-98 transition-all text-start"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <Trash2 size={17} />
              </span>
              <span>{isAr ? "حذف التدوينة نهائياً" : "Delete Entry"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});
