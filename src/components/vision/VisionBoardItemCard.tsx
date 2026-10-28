import React, { useState } from "react";
import {
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Edit2,
  Trash2,
  Sparkles,
  Target,
  ExternalLink,
  Heart,
  Star,
  Plus,
} from "lucide-react";
import {
  type VisionBoardItem,
  type VisionBoard,
  WASHI_TAPE_CLASSES,
} from "@/lib/visionEngine";
import { type Goal } from "@/lib/store";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

interface VisionBoardItemCardProps {
  item: VisionBoardItem;
  board: VisionBoard;
  linkedGoal?: Goal;
  isAr: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down" | "top" | "bottom") => void;
  onTurnIntoGoal?: (item: VisionBoardItem) => void;
}

export function VisionBoardItemCard({
  item,
  board,
  linkedGoal,
  isAr,
  onEdit,
  onDelete,
  onMove,
  onTurnIntoGoal,
}: VisionBoardItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const washiClass =
    WASHI_TAPE_CLASSES[item.washiColor || "pink"] || WASHI_TAPE_CLASSES.pink;

  const tiltStyle =
    board.layout === "scrapbook" && item.rotation
      ? { transform: `rotate(${item.rotation}deg)` }
      : undefined;

  const stickerEmoji = {
    flower: "🌸",
    star: "⭐",
    bow: "🎀",
    sparkle: "✨",
    heart: "💖",
    none: "",
  }[item.sticker || "flower"];

  return (
    <div
      style={tiltStyle}
      className={cn(
        "group relative flex flex-col rounded-3xl border bg-white dark:bg-card shadow-sm transition-all duration-200 hover:shadow-md",
        board.layout === "scrapbook" ? "hover:scale-[1.01] hover:z-10" : "",
        item.accentColor ? `border-[${item.accentColor}]` : "border-pink-100/90 dark:border-pink-900/40"
      )}
    >
      {/* Decorative Washi Tape (if decorations enabled) */}
      {board.showDecorations && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
          <div
            className={cn(
              "h-4 w-16 -rotate-1 rounded-xs backdrop-blur-xs flex items-center justify-center text-[9px] font-bold tracking-wider opacity-90",
              washiClass
            )}
          >
            {stickerEmoji && <span className="text-[10px] scale-90">{stickerEmoji}</span>}
          </div>
        </div>
      )}

      {/* Card Header with item type badge and action controls */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
        <div className="flex items-center gap-1.5">
          {item.type === "photo" && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-500 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-200/60 dark:border-pink-800">
              {isAr ? "صورة 📷" : "Photo 📷"}
            </span>
          )}
          {item.type === "wish" && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800 flex items-center gap-1">
              <span>✨</span>
              <span>{isAr ? "أمنية" : "Wish"}</span>
            </span>
          )}
          {item.type === "text" && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800">
              {isAr ? "توكيد ✍️" : "Affirmation ✍️"}
            </span>
          )}
          {item.type === "linked_goal" && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800 flex items-center gap-1">
              <span>🎯</span>
              <span>{isAr ? "هدف متصل" : "Goal Link"}</span>
            </span>
          )}
        </div>

        {/* Reorder and Menu Controls */}
        <div className="flex items-center gap-0.5">
          {/* Quick Move Up/Down Controls for Mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove("up");
            }}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-light hover:text-hotpink hover:bg-surface active:scale-90 transition-all"
            title={isAr ? "تحريك لأعلى" : "Move up"}
            aria-label="Move item up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMove("down");
            }}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-light hover:text-hotpink hover:bg-surface active:scale-90 transition-all"
            title={isAr ? "تحريك لأسفل" : "Move down"}
            aria-label="Move item down"
          >
            <ArrowDown size={13} />
          </button>

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg text-ink-light hover:text-ink hover:bg-surface active:scale-90 transition-all"
              aria-label="Item options"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-8 z-30 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-lg animate-fade-in text-xs font-bold text-ink space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                  >
                    <Edit2 size={13} />
                    <span>{isAr ? "تعديل البطاقة" : "Edit Item"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMove("top");
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                  >
                    <ArrowUpToLine size={13} />
                    <span>{isAr ? "نقل إلى البداية" : "Move to Top"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMove("bottom");
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                  >
                    <ArrowDownToLine size={13} />
                    <span>{isAr ? "نقل إلى النهاية" : "Move to Bottom"}</span>
                  </button>

                  {(item.type === "wish" || item.type === "text") && onTurnIntoGoal && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onTurnIntoGoal(item);
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-hotpink text-start border-t border-border/50"
                    >
                      <Target size={13} />
                      <span>{isAr ? "حوّليها إلى هدف 🎯" : "Turn into Goal 🎯"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-start border-t border-border/50"
                  >
                    <Trash2 size={13} />
                    <span>{isAr ? "حذف البطاقة" : "Delete Item"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Body based on Item Type */}
      <div className="px-3.5 pb-3 pt-1 space-y-2">
        {/* TYPE 1: PHOTO */}
        {item.type === "photo" && (
          <div className="space-y-2">
            {item.imageUrl ? (
              <div
                className={cn(
                  "overflow-hidden rounded-2xl bg-surface border border-border/60 relative",
                  item.imageAspectRatio === "landscape" && "aspect-4/3",
                  item.imageAspectRatio === "portrait" && "aspect-3/4",
                  (!item.imageAspectRatio || item.imageAspectRatio === "square") && "aspect-square"
                )}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title || item.caption || "Vision item"}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-dashed border-pink-200 dark:border-pink-800 text-ink-light">
                <span className="text-3xl mb-1">🖼️</span>
                <span className="text-xs font-semibold">{isAr ? "لا توجد صورة" : "No image"}</span>
              </div>
            )}

            {item.title && (
              <h4 className="text-sm font-bold text-ink leading-snug line-clamp-2">
                {item.title}
              </h4>
            )}

            {board.showCaptions && item.caption && (
              <p className="text-xs font-medium text-ink-light italic leading-relaxed">
                "{item.caption}"
              </p>
            )}
          </div>
        )}

        {/* TYPE 2: AFFIRMATION / TEXT */}
        {item.type === "text" && (
          <div className="py-2 px-1 space-y-2">
            {item.title && (
              <h4 className="text-sm font-extrabold text-ink leading-tight">
                {item.title}
              </h4>
            )}
            <blockquote className="rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border-l-3 rtl:border-l-0 rtl:border-r-3 border-purple-400 p-3 text-[13px] font-semibold text-purple-900 dark:text-purple-200 leading-relaxed italic">
              {item.content || "Every day, in every way, I am becoming her."}
            </blockquote>
            {board.showCaptions && item.caption && (
              <p className="text-[11px] font-medium text-ink-light text-end">
                — {item.caption}
              </p>
            )}
          </div>
        )}

        {/* TYPE 3: WISH / INTENTION */}
        {item.type === "wish" && (
          <div className="py-2 px-1 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0 mt-0.5">✨</span>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-sm font-black text-ink leading-snug">
                  {item.title || (isAr ? "أمنيتي القادمة" : "My Wish")}
                </h4>
                {item.content && (
                  <p className="text-xs font-medium text-ink-light leading-relaxed">
                    {item.content}
                  </p>
                )}
              </div>
            </div>

            {board.showCaptions && item.caption && (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <span>📅</span>
                <span>{item.caption}</span>
              </div>
            )}

            {/* Turn into Goal button */}
            {onTurnIntoGoal && (
              <button
                type="button"
                onClick={() => onTurnIntoGoal(item)}
                className="cursor-pointer w-full mt-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 py-1.5 text-[11px] font-extrabold text-hotpink hover:bg-pink-100 transition-colors"
              >
                <Target size={12} />
                <span>{isAr ? "حوّليها إلى هدف حقيقي" : "Turn into a real goal"}</span>
              </button>
            )}
          </div>
        )}

        {/* TYPE 4: LINKED GOAL */}
        {item.type === "linked_goal" && (
          <div className="space-y-2.5 py-1">
            {linkedGoal ? (
              <div className="rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 p-3 space-y-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{linkedGoal.icon || "🎯"}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-ink truncate leading-tight">
                      {linkedGoal.title}
                    </h4>
                    <p className="text-[10px] font-semibold text-ink-light truncate mt-0.5">
                      {linkedGoal.target} • {linkedGoal.area}
                    </p>
                  </div>
                </div>

                {board.showGoalProgress && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-ink-light">{isAr ? "التقدم الحالي" : "Current Progress"}</span>
                      <span className="font-mono text-hotpink">{linkedGoal.progress}%</span>
                    </div>
                    <ProgressBar
                      value={linkedGoal.progress}
                      className="h-2"
                      barClass="grad-theme"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface border border-dashed border-border/80 p-3 text-center space-y-1">
                <span className="text-xl">⚠️</span>
                <p className="text-xs font-bold text-ink-light">
                  {isAr ? "الهدف المرتبط غير متوفر" : "Linked Goal Unavailable"}
                </p>
                <p className="text-[10px] text-ink-light/70">
                  {isAr
                    ? "قد يكون الهدف قد حُذف، ولكن هذه البطاقة محفوظة في لوحتكِ."
                    : "The original goal was removed, but this vision card remains safe."}
                </p>
              </div>
            )}

            {item.caption && board.showCaptions && (
              <p className="text-[11px] font-medium text-ink-light italic">
                "{item.caption}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-card border border-border p-5 shadow-xl space-y-3">
            <div className="text-center space-y-1">
              <span className="text-3xl block">🗑️</span>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "حذف هذه البطاقة؟" : "Delete this card?"}
              </h3>
              <p className="text-xs text-ink-light">
                {item.type === "linked_goal"
                  ? isAr
                    ? "سيتم حذف البطاقة من اللوحة فقط، ولن يتأثر هدفكِ الأساسي إطلاقاً."
                    : "This removes the card from your board only. Your actual goal is never touched."
                  : isAr
                  ? "لن تتمكني من استرجاعها بعد الحذف."
                  : "This will remove it from your vision board."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="cursor-pointer py-2 rounded-xl bg-surface border border-border text-xs font-bold text-ink"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="cursor-pointer py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600"
              >
                {isAr ? "نعم، حذف" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
