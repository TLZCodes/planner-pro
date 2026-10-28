import React from "react";
import { X, Trash2, RefreshCw, CheckCircle2, Clock, Droplet, Hash } from "lucide-react";
import { type SelfCareBingoTile } from "@/lib/selfCareBingoEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoTileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile: SelfCareBingoTile | null;
  onReplaceTile: (tile: SelfCareBingoTile) => void;
  onRemoveTile: (tileId: string) => void;
  onToggleComplete: (tileId: string) => void;
}

export const BingoTileDetailsModal: React.FC<BingoTileDetailsModalProps> = ({
  isOpen,
  onClose,
  tile,
  onReplaceTile,
  onRemoveTile,
  onToggleComplete,
}) => {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  if (!isOpen || !tile) return null;

  const displayTitle = (isAr && tile.titleAr) ? tile.titleAr : tile.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card border border-border/80 shadow-2xl p-5 text-ink animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{tile.icon || "🌸"}</span>
            <div>
              <h3 className="text-base font-bold text-ink leading-tight">{displayTitle}</h3>
              <span className="text-[11px] text-pink-600 font-semibold uppercase tracking-wider">
                {tile.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Body */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/80 border border-border/50 text-xs">
            <span className="text-ink-light">{isAr ? "الحالة" : "Status"}</span>
            <span
              className={cn(
                "font-bold flex items-center gap-1",
                tile.completed ? "text-emerald-600" : "text-amber-600"
              )}
            >
              <CheckCircle2 size={14} />
              {tile.completed
                ? isAr ? "مكتمل في هذا الأسبوع 🌸" : "Completed this week 🌸"
                : isAr ? "قيد الانتظار" : "Pending"}
            </span>
          </div>

          {tile.completedDate && (
            <div className="flex items-center justify-between px-3 text-xs text-ink-light">
              <span>{isAr ? "تاريخ الإنجاز" : "Completion date"}</span>
              <span className="font-bold text-ink">{tile.completedDate}</span>
            </div>
          )}

          {tile.activityType === "duration" && (
            <div className="flex items-center justify-between px-3 text-xs text-ink-light">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{isAr ? "المدة المستهدفة" : "Target duration"}</span>
              </span>
              <span className="font-bold text-ink">{tile.targetValue} min</span>
            </div>
          )}

          {tile.activityType === "hydration" && (
            <div className="flex items-center justify-between px-3 text-xs text-ink-light">
              <span className="flex items-center gap-1">
                <Droplet size={12} />
                <span>{isAr ? "ترطيب الماء" : "Hydration"}</span>
              </span>
              <span className="font-bold text-ink">{tile.currentValue || 0} / {tile.targetValue} cups</span>
            </div>
          )}

          {/* Educational notice */}
          <p className="text-[11px] text-ink-muted leading-relaxed px-1">
            {isAr
              ? "إزالة النشاط من اللوحة أو استبداله لا يحذف سجلكِ التاريخي أو أي إنجاز تم تسجيله مسبقاً."
              : "Removing or replacing this tile does not delete its historical activity log or previous completions."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <button
            onClick={() => {
              onToggleComplete(tile.id);
              onClose();
            }}
            className={cn(
              "w-full py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm",
              tile.completed
                ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                : "text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-rose-sm"
            )}
          >
            {tile.completed
              ? isAr ? "إلغاء التحديد (تراجع) ↩️" : "Unmark completion ↩️"
              : isAr ? "تم الإنجاز! ✨" : "Mark as completed! ✨"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onReplaceTile(tile);
              }}
              className="flex-1 py-2 px-3 rounded-2xl text-xs font-semibold border border-border text-ink hover:bg-surface flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} />
              <span>{isAr ? "استبدال" : "Replace"}</span>
            </button>

            <button
              onClick={() => {
                onRemoveTile(tile.id);
                onClose();
              }}
              className="py-2 px-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1.5 transition-all"
              aria-label={isAr ? "إزالة من اللوحة" : "Remove from board"}
            >
              <Trash2 size={13} />
              <span>{isAr ? "إزالة" : "Remove"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
