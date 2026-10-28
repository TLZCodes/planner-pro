import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  List,
  History,
  Settings2,
  Plus,
  CheckCircle2,
  Clock,
  Droplet,
  Hash,
} from "lucide-react";
import {
  type SelfCareBingoBoard,
  type SelfCareBingoTile,
  type BingoTheme,
  BINGO_THEMES,
  formatCareCount,
  matchCompletionsForWeek,
  calculateCompletedLines,
  createDefaultBingoBoard,
  populateBoardWithActivities,
} from "@/lib/selfCareBingoEngine";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import { getWeekDaysInfo, formatLocalDateStr } from "@/lib/weeklyHabitEngine";
import { BingoGridBoard } from "./BingoGridBoard";
import { BingoTileDetailsModal } from "./BingoTileDetailsModal";
import { BingoProgressModal } from "./BingoProgressModal";
import { BingoSetupWizardModal } from "./BingoSetupWizardModal";
import { BingoHistoryView } from "./BingoHistoryView";
import { cn } from "@/lib/utils";

export const SelfCareBingoTab: React.FC = () => {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const {
    state,
    saveBingoBoard,
    deleteBingoBoard,
    toggleBingoTile,
    updateBingoTileProgress,
    repeatBingoBoardForWeek,
    addCareActivity,
  } = useApp();

  const tz = state.wellnessSettings?.timezone;
  const today = todayKey(tz);
  const firstDay = state.habitWeekPreferences?.firstDayOfWeek || "saturday";

  // Week navigation offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // View mode: grid vs list
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Show history view
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Modals
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [detailsTile, setDetailsTile] = useState<SelfCareBingoTile | null>(null);
  const [progressTile, setProgressTile] = useState<SelfCareBingoTile | null>(null);

  // Undo notification state
  const [undoToast, setUndoToast] = useState<{ tileId: string; title: string } | null>(null);

  // Compute current week information
  const weekInfo = useMemo(() => {
    return getWeekDaysInfo(new Date(), weekOffset, firstDay, isAr);
  }, [weekOffset, firstDay, isAr]);

  const weekStartDate = weekInfo.days[0].dateStr;
  const weekEndDate = weekInfo.days[6].dateStr;

  const isCurrentWeek = weekOffset === 0;
  const isFutureWeek = weekStartDate > today;
  const isPastWeek = weekEndDate < today;

  // Find board for currently viewed week
  const currentBoard = useMemo(() => {
    const raw = (state.selfCareBingoBoards || []).find(
      (b) => b.weekStartDate === weekStartDate
    );
    if (!raw) return null;

    // Apply deterministic matching against canonical plan items & logs
    return matchCompletionsForWeek(raw, state.selfCarePlanItems || [], {
      habits: state.habits,
      wellnessWaterCups: state.wellness?.waterLog,
    });
  }, [state.selfCareBingoBoards, state.selfCarePlanItems, state.habits, state.wellness, weekStartDate, weekEndDate]);

  // Tile completion counts & lines
  const lineStats = useMemo(() => {
    if (!currentBoard) return null;
    return calculateCompletedLines(currentBoard.tiles, currentBoard.size);
  }, [currentBoard]);

  // Handle tile click
  const handleTileClick = (tile: SelfCareBingoTile) => {
    if (isFutureWeek) return;

    if (!tile.activityId && !tile.title) {
      // Empty tile tapped -> open wizard
      setShowWizard(true);
      return;
    }

    // For duration or quantity activities, offer stepper progress modal if not yet completed
    if ((tile.activityType === "duration" || tile.activityType === "quantity") && !tile.completed) {
      setProgressTile(tile);
      return;
    }

    // Otherwise toggle directly
    if (currentBoard) {
      toggleBingoTile(currentBoard.id, tile.id, isPastWeek ? weekEndDate : today);
      if (!tile.completed) {
        setUndoToast({ tileId: tile.id, title: (isAr && tile.titleAr) ? tile.titleAr : tile.title });
        setTimeout(() => setUndoToast(null), 4000);
      }
    }
  };

  // Quick undo from toast
  const handleUndoRecent = () => {
    if (currentBoard && undoToast) {
      toggleBingoTile(currentBoard.id, undoToast.tileId);
      setUndoToast(null);
    }
  };

  // Quick initialize a default board with user activities & starter ideas
  const handleCreateDefaultBoard = () => {
    const newBoard = createDefaultBingoBoard(weekStartDate, weekEndDate, 3, "blush");
    const populated = populateBoardWithActivities(newBoard, state.selfCareActivities || []);
    saveBingoBoard(populated);
  };

  // Repeat layout to next week
  const handleRepeatNextWeek = () => {
    if (!currentBoard) return;
    const nextWeekInfo = getWeekDaysInfo(new Date(), weekOffset + 1, firstDay, isAr);
    const targetStart = nextWeekInfo.days[0].dateStr;
    const targetEnd = nextWeekInfo.days[6].dateStr;
    repeatBingoBoardForWeek(currentBoard.id, targetStart, targetEnd, true);
    setWeekOffset((prev) => prev + 1);
  };

  if (showHistory) {
    return (
      <BingoHistoryView
        boards={state.selfCareBingoBoards || []}
        onSelectBoard={(b) => {
          // Find week offset for selected board
          const diffMs = new Date(b.weekStartDate).getTime() - new Date().getTime();
          const approxOffset = Math.round(diffMs / (7 * 86400000));
          setWeekOffset(approxOffset);
          setShowHistory(false);
        }}
        onRepeatLayout={(b) => {
          repeatBingoBoardForWeek(b.id, weekStartDate, weekEndDate, true);
          setShowHistory(false);
        }}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  const themeDef = currentBoard ? BINGO_THEMES[currentBoard.theme] || BINGO_THEMES.blush : BINGO_THEMES.blush;

  return (
    <div className="space-y-4 px-4 py-2 animate-fade-in max-w-md mx-auto select-none pb-12">
      {/* 1. Week Navigation Strip */}
      <div className="flex items-center justify-between bg-card/90 border border-border/70 rounded-3xl p-2.5 shadow-xs">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="p-2 rounded-full hover:bg-surface text-ink-light hover:text-ink active:scale-95 transition-all"
          aria-label={isAr ? "الأسبوع السابق" : "Previous Week"}
        >
          {isAr ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>

        <div className="text-center px-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold text-ink">
              {weekStartDate} — {weekEndDate}
            </span>
            {isCurrentWeek && (
              <span className="text-[10px] font-bold text-hotpink bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                {isAr ? "الأسبوع الحالي" : "Current"}
              </span>
            )}
            {isFutureWeek && (
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {isAr ? "قادم 🌿" : "Future 🌿"}
              </span>
            )}
            {isPastWeek && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {isAr ? "سابق" : "Past"}
              </span>
            )}
          </div>
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[11px] font-bold text-pink-600 hover:underline mt-0.5 block mx-auto"
            >
              {isAr ? "العودة للأسبوع الحالي" : "Return to current week"}
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="p-2 rounded-full hover:bg-surface text-ink-light hover:text-ink active:scale-95 transition-all"
          aria-label={isAr ? "الأسبوع التالي" : "Next Week"}
        >
          {isAr ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
        </button>
      </div>

      {/* 2. Top Controls: View Switcher (Grid/List) & Action Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 bg-surface border border-border/60 rounded-2xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-xl transition-all",
              viewMode === "grid"
                ? "bg-card text-hotpink shadow-xs font-bold"
                : "text-ink-light hover:text-ink"
            )}
            aria-label={isAr ? "عرض الشبكة" : "Grid view"}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-xl transition-all",
              viewMode === "list"
                ? "bg-card text-hotpink shadow-xs font-bold"
                : "text-ink-light hover:text-ink"
            )}
            aria-label={isAr ? "عرض القائمة" : "List view"}
          >
            <List size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {currentBoard && (
            <button
              onClick={() => setShowWizard(true)}
              className="p-2 rounded-2xl bg-card border border-border/70 text-ink-light hover:text-ink hover:bg-surface shadow-xs transition-all active:scale-95"
              aria-label={isAr ? "تعديل اللوحة" : "Edit Board"}
            >
              <Settings2 size={15} />
            </button>
          )}

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-2xl bg-card border border-border/70 text-ink-light hover:text-ink hover:bg-surface shadow-xs transition-all active:scale-95"
            aria-label={isAr ? "سجل اللوحات" : "Past Boards"}
          >
            <History size={15} />
          </button>
        </div>
      </div>

      {/* Future Week Banner Notice */}
      {isFutureWeek && (
        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
          <span className="text-base">🌿</span>
          <p className="leading-snug">
            {t("futureWeekNotice") || (isAr ? "أسبوع قادم: جهّزي لوحتكِ الآن، واحتفلي بالإنجاز مع بداية الأسبوع." : "Future week: prepare your board now, complete when the week begins.")}
          </p>
        </div>
      )}

      {/* 3. Empty State or Board Display */}
      {!currentBoard ? (
        <div className="p-8 rounded-3xl bg-card border border-pink-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-3xl">
            🌸
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-ink">
              {t("bingoEmptyTitle") || (isAr ? "للعناية بكِ مساحة في أسبوعكِ 🌸" : "A little care can fit into your week 🌸")}
            </h2>
            <p className="text-xs text-ink-light leading-relaxed max-w-xs mx-auto">
              {t("bingoEmptyDesc") || (isAr ? "اختاري أشياء بسيطة تناسبكِ." : "Choose a few things that feel good for you.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setShowWizard(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-rose-sm hover:opacity-95 active:scale-95 transition-all"
            >
              {t("createMyBoard") || (isAr ? "إنشاء لوحتي" : "Create my board")}
            </button>

            <button
              onClick={handleCreateDefaultBoard}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold border border-pink-200 text-pink-700 bg-pink-50/60 hover:bg-pink-100 transition-all active:scale-95"
            >
              {t("chooseExistingActivities") || (isAr ? "ملء سريع بالأنشطة" : "Quick auto-fill")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Header Badge */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🌸</span>
              <span className="text-xs font-bold text-ink">
                {formatCareCount(lineStats?.completedTilesCount || 0, isAr)}
              </span>
            </div>

            <button
              onClick={handleRepeatNextWeek}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50/80 px-2.5 py-1 rounded-full border border-pink-200/60 active:scale-95 transition-all"
            >
              <RotateCcw size={11} />
              <span>{t("useLayoutNextWeek") || (isAr ? "تكرار للأسبوع القادم" : "Use next week")}</span>
            </button>
          </div>

          {/* Grid View */}
          {viewMode === "grid" ? (
            <BingoGridBoard
              board={currentBoard}
              onTileClick={handleTileClick}
              onInfoClick={(tile) => setDetailsTile(tile)}
              isFutureWeek={isFutureWeek}
            />
          ) : (
            /* Accessible List View */
            <div className="space-y-2">
              {currentBoard.tiles.map((tile, idx) => {
                const title = (isAr && tile.titleAr) ? tile.titleAr : tile.title;
                if (!title) return null;
                return (
                  <div
                    key={tile.id || idx}
                    onClick={() => handleTileClick(tile)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer bg-card text-ink shadow-xs",
                      tile.completed ? "border-pink-300 bg-pink-50/40" : "border-border hover:border-pink-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tile.icon || "🌸"}</span>
                      <div>
                        <span className={cn("text-xs font-bold block", tile.completed && "line-through opacity-70")}>
                          {title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-ink-light">
                          <span className="capitalize">{tile.category}</span>
                          {tile.activityType === "duration" && (
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} />
                              {tile.targetValue}m
                            </span>
                          )}
                          {tile.activityType === "hydration" && (
                            <span className="flex items-center gap-0.5 text-blue-500">
                              <Droplet size={10} />
                              {tile.currentValue || 0}/{tile.targetValue} cups
                            </span>
                          )}
                          {tile.completedDate && (
                            <span className="text-pink-600 font-semibold">{tile.completedDate}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border",
                        tile.completed
                          ? "bg-hotpink border-hotpink text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {tile.completed && <CheckCircle2 size={15} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Undo Toast on recent completion */}
      {undoToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-ink text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 text-xs animate-slide-up">
          <span>{isAr ? `تم تسجيل: ${undoToast.title} 🌸` : `Logged: ${undoToast.title} 🌸`}</span>
          <button
            onClick={handleUndoRecent}
            className="text-pink-300 hover:text-pink-200 font-bold underline"
          >
            {isAr ? "تراجع" : "Undo"}
          </button>
        </div>
      )}

      {/* Wizard Modal */}
      <BingoSetupWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        existingBoard={currentBoard}
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        activities={state.selfCareActivities || []}
        onSaveBoard={(b) => saveBingoBoard(b)}
        onAddCustomActivity={(act) =>
          addCareActivity({
            title: act.title,
            icon: act.icon,
            category: act.category,
            recurrenceRule: "none",
            estimatedDurationMinutes: act.estimatedDurationMinutes,
            status: "active",
            sourceType: "custom",
          })
        }
      />

      {/* Tile Details Modal */}
      <BingoTileDetailsModal
        isOpen={Boolean(detailsTile)}
        onClose={() => setDetailsTile(null)}
        tile={detailsTile}
        onReplaceTile={(t) => {
          setShowWizard(true);
        }}
        onRemoveTile={(tId) => {
          if (currentBoard) {
            const updatedTiles = currentBoard.tiles.map((t) =>
              t.id === tId
                ? {
                    ...t,
                    activityId: "",
                    title: "",
                    completed: false,
                    completedAt: undefined,
                    completedDate: undefined,
                  }
                : t
            );
            saveBingoBoard({ ...currentBoard, tiles: updatedTiles });
          }
        }}
        onToggleComplete={(tId) => {
          if (currentBoard) {
            toggleBingoTile(currentBoard.id, tId, isPastWeek ? weekEndDate : today);
          }
        }}
      />

      {/* Progress Logger Modal for duration / quantity */}
      <BingoProgressModal
        isOpen={Boolean(progressTile)}
        onClose={() => setProgressTile(null)}
        tile={progressTile}
        onSaveProgress={(tId, val) => {
          if (currentBoard) {
            updateBingoTileProgress(currentBoard.id, tId, val, isPastWeek ? weekEndDate : today);
          }
        }}
      />
    </div>
  );
};
