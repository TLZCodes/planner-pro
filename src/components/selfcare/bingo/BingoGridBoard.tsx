import React from "react";
import { Sparkles } from "lucide-react";
import {
  type SelfCareBingoBoard,
  type SelfCareBingoTile,
  calculateCompletedLines,
  BINGO_THEMES,
} from "@/lib/selfCareBingoEngine";
import { BingoTileCell } from "./BingoTileCell";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoGridBoardProps {
  board: SelfCareBingoBoard;
  onTileClick: (tile: SelfCareBingoTile) => void;
  onInfoClick?: (tile: SelfCareBingoTile) => void;
  isFutureWeek?: boolean;
}

export const BingoGridBoard: React.FC<BingoGridBoardProps> = ({
  board,
  onTileClick,
  onInfoClick,
  isFutureWeek = false,
}) => {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const themeDef = BINGO_THEMES[board.theme] || BINGO_THEMES.blush;

  const { lines, completedLinesCount, completedTilesCount, totalTilesCount, isFullBoardCompleted } =
    calculateCompletedLines(board.tiles, board.size);

  // Set of tile indices that belong to any completed line
  const completedLineTileIndices = React.useMemo(() => {
    if (!board.celebrationsEnabled) return new Set<number>();
    const set = new Set<number>();
    lines.forEach((line) => {
      if (line.isCompleted) {
        line.tileIndices.forEach((idx) => set.add(idx));
      }
    });
    return set;
  }, [lines, board.celebrationsEnabled]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative Scrapbook Header Accent (Washi Tape) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-28 h-6 bg-pink-200/70 border border-pink-300/60 rounded shadow-xs rotate-[-1deg] pointer-events-none backdrop-blur-xs flex items-center justify-center">
        <span className="text-[10px] tracking-widest uppercase font-bold text-pink-700/80">
          {board.size}×{board.size} BINGO
        </span>
      </div>

      {/* Main Board Surface */}
      <div
        className={cn(
          "relative p-3.5 sm:p-5 rounded-3xl border shadow-sm transition-all",
          "border-pink-200/80"
        )}
        style={{
          backgroundColor: themeDef.boardBgHex,
        }}
      >
        {/* Lines Completed Celebration Banner */}
        {board.celebrationsEnabled && completedLinesCount > 0 && (
          <div className="mb-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-rose-500/15 to-pink-500/10 border border-pink-300/60 flex items-center justify-center gap-1.5 text-xs font-bold text-pink-700 animate-fade-in">
            <Sparkles size={14} className="text-pink-500 animate-spin-slow" />
            <span>
              {isAr
                ? `${completedLinesCount} ${completedLinesCount === 1 ? "خط بينغو مكتمل!" : "خطوط بينغو مكتملة!"} 🌸`
                : `${completedLinesCount} Bingo ${completedLinesCount === 1 ? "line" : "lines"} completed! 🌸`}
            </span>
          </div>
        )}

        {/* Grid Container */}
        <div
          role="grid"
          aria-label={isAr ? "لوحة بينغو العناية بنفسي" : "Self-care Bingo Board"}
          className={cn(
            "grid gap-2 sm:gap-3",
            board.size === 3 ? "grid-cols-3" : "grid-cols-4"
          )}
        >
          {board.tiles.map((tile, idx) => (
            <BingoTileCell
              key={tile.id || `tile-${idx}`}
              tile={tile}
              theme={board.theme}
              isCompact={board.size === 4}
              isInCompletedLine={completedLineTileIndices.has(idx)}
              onTileClick={onTileClick}
              onInfoClick={onInfoClick}
              disabled={isFutureWeek}
            />
          ))}
        </div>

        {/* Board Footer Summary */}
        <div className="mt-4 pt-3 border-t border-pink-200/60 flex items-center justify-between text-xs text-ink-light font-medium px-1">
          <span className="flex items-center gap-1 font-bold text-pink-700">
            <span>🌸</span>
            <span>
              {completedTilesCount} / {totalTilesCount}{" "}
              {isAr ? "لحظات عناية" : "moments done"}
            </span>
          </span>

          {isFullBoardCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-full">
              <span>✨</span>
              <span>{isAr ? "أسبوعكِ مليء بالعناية 🌸" : "Full board complete 🌸"}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
