import React from "react";
import { Check, Clock, Droplet, Hash, Info, Sparkles } from "lucide-react";
import { type SelfCareBingoTile, type BingoTheme, BINGO_THEMES } from "@/lib/selfCareBingoEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoTileCellProps {
  tile: SelfCareBingoTile;
  theme: BingoTheme;
  isCompact?: boolean;
  isInCompletedLine?: boolean;
  onTileClick: (tile: SelfCareBingoTile) => void;
  onInfoClick?: (tile: SelfCareBingoTile) => void;
  disabled?: boolean;
}

export const BingoTileCell: React.FC<BingoTileCellProps> = ({
  tile,
  theme,
  isCompact = false,
  isInCompletedLine = false,
  onTileClick,
  onInfoClick,
  disabled = false,
}) => {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const themeDef = BINGO_THEMES[theme] || BINGO_THEMES.blush;

  const displayTitle = (isAr && tile.titleAr) ? tile.titleAr : tile.title;
  const isCompleted = tile.completed;
  const hasTarget = tile.activityType !== "simple" && tile.targetValue > 1;
  const progressRatio = hasTarget ? Math.min(1, (tile.currentValue || 0) / tile.targetValue) : (isCompleted ? 1 : 0);

  // Decorative center tile (Free space)
  if (tile.isDecorativeCenter) {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed transition-all select-none min-h-[72px] sm:min-h-[88px]",
          "bg-gradient-to-br from-pink-50/80 to-rose-100/70 border-pink-300 text-pink-700 shadow-sm"
        )}
        style={{ minWidth: 44, minHeight: 44 }}
        role="gridcell"
        aria-label={isAr ? "مساحة راحة مجانية" : "Free rest moment"}
      >
        <span className="text-2xl animate-pulse">🌸</span>
        <span className="text-[10px] font-bold text-pink-700 mt-1 uppercase tracking-wider text-center">
          {isAr ? "لحظة راحة 🌸" : "Free Care"}
        </span>
      </div>
    );
  }

  // Empty placeholder tile
  if (!tile.activityId && !tile.title) {
    return (
      <button
        onClick={() => onTileClick(tile)}
        disabled={disabled}
        className={cn(
          "relative flex flex-col items-center justify-center p-2 rounded-2xl border border-dashed transition-all select-none min-h-[72px] sm:min-h-[88px]",
          "bg-white/40 hover:bg-white/80 border-slate-300 text-slate-400 active:scale-95",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ minWidth: 44, minHeight: 44 }}
        role="gridcell"
        aria-label={isAr ? "إضافة نشاط للمربع" : "Add activity to tile"}
      >
        <span className="text-lg opacity-60">+</span>
        <span className="text-[10px] font-medium opacity-70">
          {isAr ? "اختاري نشاطاً" : "Add care"}
        </span>
      </button>
    );
  }

  return (
    <div
      role="gridcell"
      aria-checked={isCompleted}
      className={cn(
        "group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl border-2 transition-all select-none cursor-pointer",
        "min-h-[78px] sm:min-h-[96px] text-ink",
        isInCompletedLine && "ring-2 ring-pink-400 ring-offset-1 shadow-md",
        isCompleted
          ? "shadow-sm"
          : "bg-white hover:shadow-md hover:border-pink-300 active:scale-[0.98]",
        disabled && "opacity-75 cursor-default"
      )}
      style={{
        backgroundColor: isCompleted ? themeDef.completedBgHex : themeDef.tileBgHex,
        borderColor: isCompleted ? themeDef.completedBorderHex : themeDef.tileBorderHex,
        minWidth: 44,
        minHeight: 44,
      }}
      onClick={() => !disabled && onTileClick(tile)}
    >
      {/* Top Header Row: Icon + Completion Badge / Info */}
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="text-xl sm:text-2xl leading-none" role="img" aria-hidden="true">
          {tile.icon || "🌸"}
        </span>

        <div className="flex items-center gap-1">
          {onInfoClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(tile);
              }}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-full text-ink-light hover:text-ink hover:bg-black/5 transition-opacity"
              aria-label={isAr ? `معلومات ${displayTitle}` : `Details for ${displayTitle}`}
            >
              <Info size={13} />
            </button>
          )}

          {/* Completion Check Badge */}
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-all border",
              isCompleted
                ? "bg-hotpink border-hotpink text-white shadow-sm"
                : "bg-white/80 border-slate-300 text-transparent group-hover:border-pink-400"
            )}
            aria-hidden="true"
          >
            <Check size={12} strokeWidth={3} className={cn("transition-transform", isCompleted ? "scale-100" : "scale-0")} />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="my-1 flex-1 flex items-center">
        <p
          className={cn(
            "text-[11px] sm:text-xs font-bold leading-snug line-clamp-2 text-left",
            isAr && "text-right font-arabic",
            isCompleted && "line-through opacity-80"
          )}
          style={{ color: themeDef.darkPlumText }}
        >
          {displayTitle}
        </p>
      </div>

      {/* Bottom Metadata & Progress */}
      <div className="w-full pt-1 flex items-center justify-between text-[10px] text-ink-light font-medium">
        {/* Type Indicator */}
        <div className="flex items-center gap-1">
          {tile.activityType === "duration" && (
            <span className="inline-flex items-center gap-0.5 text-slate-500">
              <Clock size={10} />
              <span>{tile.targetValue}m</span>
            </span>
          )}
          {tile.activityType === "hydration" && (
            <span className="inline-flex items-center gap-0.5 text-blue-500">
              <Droplet size={10} />
              <span>{tile.currentValue || 0}/{tile.targetValue}</span>
            </span>
          )}
          {tile.activityType === "quantity" && (
            <span className="inline-flex items-center gap-0.5 text-slate-500">
              <Hash size={10} />
              <span>{tile.currentValue || 0}/{tile.targetValue}</span>
            </span>
          )}
        </div>

        {/* Completion Date Tag if completed */}
        {isCompleted && tile.completedDate && (
          <span className="text-[9px] text-pink-600 font-bold bg-pink-100/80 px-1 rounded">
            {tile.completedDate.slice(5)}
          </span>
        )}
      </div>

      {/* Progress Bar for Partial Duration or Quantity */}
      {hasTarget && !isCompleted && progressRatio > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-hotpink transition-all duration-300"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>
      )}

      {/* Gentle Line Sparkle if in completed line */}
      {isInCompletedLine && (
        <div className="absolute -top-1 -right-1 text-pink-500 animate-pulse">
          <Sparkles size={12} />
        </div>
      )}
    </div>
  );
};
