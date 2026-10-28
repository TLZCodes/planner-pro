import React from "react";
import { Calendar, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, RotateCcw, Check, Sparkles } from "lucide-react";
import {
  type SelfCareBingoBoard,
  BINGO_THEMES,
  formatCareCount,
  calculateCompletedLines,
} from "@/lib/selfCareBingoEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface BingoHistoryViewProps {
  boards: SelfCareBingoBoard[];
  onSelectBoard: (board: SelfCareBingoBoard) => void;
  onRepeatLayout: (board: SelfCareBingoBoard) => void;
  onBack: () => void;
}

export const BingoHistoryView: React.FC<BingoHistoryViewProps> = ({
  boards,
  onSelectBoard,
  onRepeatLayout,
  onBack,
}) => {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  // Sort boards by weekStartDate descending
  const sortedBoards = [...boards].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

  return (
    <div className="space-y-4 px-4 py-2 animate-fade-in max-w-md mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 transition-colors"
      >
        {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        <span>{isAr ? "العودة للوحة الأسبوع" : "Back to Current Board"}</span>
      </button>

      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-black text-ink font-display flex items-center gap-2">
            <span>{isAr ? "سجل لوحات البينغو 🌸" : "Past Bingo Boards 🌸"}</span>
          </h2>
          <p className="text-xs text-ink-light">
            {isAr
              ? "استرجعي لحظات عنايتكِ في الأسابيع الماضية."
              : "Revisit your moments of care across past weeks."}
          </p>
        </div>
      </div>

      {sortedBoards.length === 0 ? (
        <div className="p-8 rounded-3xl bg-card border border-border/60 text-center space-y-2">
          <span className="text-3xl">🌸</span>
          <p className="text-xs text-ink-light">
            {t("noBingoHistory") || (isAr ? "لا توجد لوحات بينغو سابقة مسجلة بعد." : "No past Bingo boards recorded yet.")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBoards.map((board) => {
            const themeDef = BINGO_THEMES[board.theme] || BINGO_THEMES.blush;
            const { completedTilesCount, totalTilesCount, completedLinesCount } =
              calculateCompletedLines(board.tiles, board.size);

            return (
              <div
                key={board.id}
                className="p-4 rounded-3xl border transition-all shadow-xs hover:shadow-md bg-card text-ink flex flex-col gap-3"
                style={{ borderColor: themeDef.tileBorderHex }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-pink-500" />
                    <span className="text-xs font-bold text-ink">
                      {board.weekStartDate} — {board.weekEndDate}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-ink-light font-bold">
                      {board.size}×{board.size}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-full">
                    {formatCareCount(completedTilesCount, isAr)}
                  </span>
                </div>

                {/* Mini Visual Preview of the Board */}
                <div
                  className={cn(
                    "grid gap-1 p-2 rounded-xl",
                    board.size === 3 ? "grid-cols-3" : "grid-cols-4"
                  )}
                  style={{ backgroundColor: themeDef.boardBgHex }}
                >
                  {board.tiles.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className={cn(
                        "h-8 rounded-lg flex items-center justify-center text-xs border",
                        t.completed
                          ? "bg-hotpink text-white border-hotpink font-bold"
                          : "bg-white/80 border-black/5 text-ink/70"
                      )}
                      title={(isAr && t.titleAr) ? t.titleAr : t.title}
                    >
                      <span>{t.completed ? "✓" : t.icon || "•"}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onSelectBoard(board)}
                    className="font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                  >
                    <span>{isAr ? "عرض التفاصيل" : "View board"}</span>
                    {isAr ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                  </button>

                  <button
                    onClick={() => onRepeatLayout(board)}
                    className="px-3 py-1 rounded-full text-[11px] font-bold border border-border bg-surface text-ink hover:bg-card hover:border-pink-300 transition-all flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    <span>{isAr ? "استخدام هذا التنسيق" : "Use this layout"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
