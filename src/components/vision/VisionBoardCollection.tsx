import React, { useState } from "react";
import {
  Plus,
  Sparkles,
  Layers,
  LayoutGrid,
  Scissors,
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Pin,
  PinOff,
  Eye,
  Calendar,
  X,
  Check,
} from "lucide-react";
import {
  type VisionBoard,
  type VisionBoardItem,
  type VisionBoardTheme,
  type VisionBoardLayout,
  VISION_BOARD_THEMES,
} from "@/lib/visionEngine";
import { LayoutPreviewModal } from "./LayoutPreviewModal";
import { cn } from "@/lib/utils";

interface VisionBoardCollectionProps {
  boards: VisionBoard[];
  items: VisionBoardItem[];
  isAr: boolean;
  onOpenBoard: (boardId: string) => void;
  onCreateBoard: (payload: Partial<VisionBoard> & { title: string }) => string;
  onUpdateBoard: (id: string, updates: Partial<VisionBoard>) => void;
  onDuplicateBoard: (id: string) => void;
  onArchiveBoard: (id: string) => void;
  onRestoreBoard: (id: string) => void;
  onDeleteBoard: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function VisionBoardCollection({
  boards,
  items,
  isAr,
  onOpenBoard,
  onCreateBoard,
  onUpdateBoard,
  onDuplicateBoard,
  onArchiveBoard,
  onRestoreBoard,
  onDeleteBoard,
  onTogglePin,
}: VisionBoardCollectionProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<VisionBoard | null>(null);

  // Form state for creating / editing board
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [theme, setTheme] = useState<VisionBoardTheme>("blossom");
  const [layout, setLayout] = useState<VisionBoardLayout>("collage");

  // Menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteConfirmBoardId, setDeleteConfirmBoardId] = useState<string | null>(null);

  const activeBoards = boards.filter((b) => (b.status || "active") === "active");
  const archivedBoards = boards.filter((b) => b.status === "archived");
  const displayBoards = showArchived ? archivedBoards : activeBoards;

  const handleOpenCreateModal = (preselectedLayout?: VisionBoardLayout) => {
    setEditingBoard(null);
    setTitle(isAr ? "لوحة أحلامي 2027 ✨" : "My 2027 Vision ✨");
    setDescription("");
    setTimeHorizon("2027");
    setTheme("blossom");
    setLayout(preselectedLayout || "collage");
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (board: VisionBoard) => {
    setEditingBoard(board);
    setTitle(board.title);
    setDescription(board.description || "");
    setTimeHorizon(board.timeHorizon || "");
    setTheme(board.theme);
    setLayout(board.layout);
    setCreateModalOpen(true);
  };

  const handleSaveBoard = () => {
    if (!title.trim()) return;

    if (editingBoard) {
      onUpdateBoard(editingBoard.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        timeHorizon: timeHorizon.trim() || undefined,
        theme,
        layout,
      });
    } else {
      const newId = onCreateBoard({
        title: title.trim(),
        description: description.trim() || undefined,
        timeHorizon: timeHorizon.trim() || undefined,
        theme,
        layout,
      });
      onOpenBoard(newId);
    }

    setCreateModalOpen(false);
    setEditingBoard(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Vision Board Header */}
      <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-gradient-to-br from-[#FFF5F7] via-[#FFF0F4] to-[#FDF4FF] dark:from-[#1F141A] dark:to-[#171324] p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-card/80 border border-pink-200/60 dark:border-pink-800 text-hotpink text-xs font-black">
              <span>🌸</span>
              <span>{isAr ? "لوحة رؤيتي" : "Vision Board"}</span>
            </div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight">
              {isAr ? "لوحة رؤيتي 🌸" : "Vision Board 🌸"}
            </h2>
            <p className="text-xs font-semibold text-ink-light leading-relaxed">
              {isAr
                ? "مساحة صغيرة للحياة التي ترغبين في بنائها."
                : "A little space for the life you want to build."}
            </p>
          </div>

          {/* Header Action Buttons (Only shown when boards exist) */}
          {displayBoards.length > 0 && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="cursor-pointer py-2 px-3 rounded-xl bg-white/80 dark:bg-card/80 border border-border text-xs font-bold text-ink hover:text-hotpink hover:border-hotpink/40 shadow-xs transition-all flex items-center gap-1.5"
              >
                <Eye size={13} />
                <span>{isAr ? "معاينة التنسيقات" : "Preview layouts"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateModal()}
                className="cursor-pointer py-2 px-3.5 rounded-xl grad-theme text-xs font-black text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>{isAr ? "لوحة جديدة ✨" : "New Board ✨"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Active vs Archived Sub-toggle (if archived boards exist) */}
        {archivedBoards.length > 0 && (
          <div className="flex items-center justify-between border-t border-pink-200/40 dark:border-pink-900/40 pt-2.5 text-xs font-bold">
            <span className="text-ink-light">
              {isAr ? `${activeBoards.length} لوحة نشطة` : `${activeBoards.length} active boards`}
            </span>
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="cursor-pointer text-hotpink hover:underline"
            >
              {showArchived
                ? isAr
                  ? "عرض اللوحات النشطة"
                  : "View active boards"
                : isAr
                ? `عرض المؤرشفة (${archivedBoards.length})`
                : `View archived (${archivedBoards.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Board Collection Content */}
      {displayBoards.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-card border border-dashed border-border p-6 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 dark:bg-pink-950/50 text-hotpink text-2xl mx-auto shadow-inner">
            ✨
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-ink">
              {isAr
                ? "رؤيتكِ تبدأ بلمعة صغيرة ✨"
                : "Your vision starts with one little spark ✨"}
            </h3>
            <p className="text-xs font-semibold text-ink-light max-w-xs mx-auto leading-relaxed">
              {isAr
                ? "أضيفي صورة، أو أمنية، أو كلمات تعبّر عنكِ."
                : "Add a photo, a wish, or a few words that feel like you."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="cursor-pointer py-2.5 px-5 rounded-2xl grad-theme text-xs font-black text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>{isAr ? "أنشئي لوحتي 🌸" : "Create my board 🌸"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="cursor-pointer py-2.5 px-4 rounded-2xl bg-surface border border-border text-xs font-bold text-ink hover:text-hotpink hover:border-hotpink/40 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>{isAr ? "معاينة التنسيقات" : "Preview layouts"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Vision Boards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayBoards.map((b) => {
            const boardTheme = VISION_BOARD_THEMES[b.theme] || VISION_BOARD_THEMES.blossom;
            const boardItems = items.filter((it) => it.boardId === b.id);
            const photoItems = boardItems.filter((it) => it.type === "photo" && it.imageUrl);

            return (
              <div
                key={b.id}
                onClick={() => onOpenBoard(b.id)}
                className="group relative cursor-pointer rounded-3xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-hotpink/50 space-y-3 overflow-hidden flex flex-col justify-between"
              >
                {/* Board Card Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base">🌸</span>
                      <h3 className="text-sm font-extrabold text-ink truncate group-hover:text-hotpink transition-colors">
                        {b.title}
                      </h3>
                      {b.isPinnedToHome && (
                        <span className="text-[10px] text-hotpink bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 px-1.5 py-0.2 rounded-full shrink-0">
                          📌
                        </span>
                      )}
                    </div>
                    {b.timeHorizon && (
                      <p className="text-[11px] font-semibold text-ink-light">
                        📅 {b.timeHorizon}
                      </p>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === b.id ? null : b.id);
                      }}
                      className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-ink-light hover:text-ink hover:bg-surface transition-all"
                      aria-label="Board options"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {activeMenuId === b.id && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }}
                        />
                        <div
                          className="absolute right-0 rtl:right-auto rtl:left-0 top-8 z-30 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl animate-fade-in text-xs font-bold text-ink space-y-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onOpenBoard(b.id);
                            }}
                            className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                          >
                            <Eye size={13} />
                            <span>{isAr ? "فتح اللوحة" : "Open Board"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleOpenEditModal(b);
                            }}
                            className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                          >
                            <Edit2 size={13} />
                            <span>{isAr ? "تعديل الإعدادات" : "Edit Settings"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onTogglePin(b.id);
                            }}
                            className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                          >
                            {b.isPinnedToHome ? <PinOff size={13} /> : <Pin size={13} />}
                            <span>
                              {b.isPinnedToHome
                                ? isAr
                                  ? "إلغاء التثبيت في الرئيسية"
                                  : "Unpin from Home"
                                : isAr
                                ? "تثبيت في الرئيسية 📌"
                                : "Pin to Home 📌"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDuplicateBoard(b.id);
                            }}
                            className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start border-t border-border/50"
                          >
                            <Copy size={13} />
                            <span>{isAr ? "تكرار اللوحة" : "Duplicate Board"}</span>
                          </button>

                          {b.status === "archived" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onRestoreBoard(b.id);
                              }}
                              className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                            >
                              <RotateCcw size={13} />
                              <span>{isAr ? "استعادة اللوحة" : "Restore Board"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onArchiveBoard(b.id);
                              }}
                              className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface text-ink text-start"
                            >
                              <Archive size={13} />
                              <span>{isAr ? "أرشفة اللوحة" : "Archive Board"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteConfirmBoardId(b.id);
                            }}
                            className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-start border-t border-border/50"
                          >
                            <Trash2 size={13} />
                            <span>{isAr ? "حذف اللوحة" : "Delete Board"}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Visual Collage Preview Banner */}
                <div
                  className={cn(
                    "rounded-2xl p-2.5 border transition-all h-28 flex items-center justify-center overflow-hidden",
                    boardTheme.canvasBg,
                    boardTheme.patternClass,
                    boardTheme.borderClass
                  )}
                >
                  {photoItems.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5 w-full h-full">
                      {photoItems.slice(0, 3).map((ph, idx) => (
                        <div
                          key={ph.id || idx}
                          className="rounded-xl overflow-hidden bg-white/80 border border-white/60 shadow-xs h-full"
                        >
                          <img
                            src={ph.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {photoItems.length < 3 && (
                        <div className="rounded-xl bg-white/40 dark:bg-card/40 border border-dashed border-border/60 flex items-center justify-center text-xs text-ink-light">
                          ✨
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <span className="text-2xl block">🎨</span>
                      <p className="text-[11px] font-bold text-ink-light">
                        {isAr ? "ابدئي بإضافة بطاقات لرؤيتكِ" : "Ready for your vision cards"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Board Card Footer Details */}
                <div className="flex items-center justify-between text-[11px] font-bold text-ink-light pt-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: boardTheme.accentHex }}
                      />
                      <span>{isAr ? boardTheme.nameAr : boardTheme.nameEn}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {isAr
                        ? `${boardItems.length} بطاقات`
                        : `${boardItems.length} items`}
                    </span>
                  </div>

                  <span className="text-hotpink group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    {isAr ? "افتحي اللوحة ←" : "Open board →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Layout Preview Modal */}
      {previewModalOpen && (
        <LayoutPreviewModal
          isAr={isAr}
          onSelectLayout={(selectedLayout) => {
            setPreviewModalOpen(false);
            handleOpenCreateModal(selectedLayout);
          }}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}

      {/* Create / Edit Board Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-3.5 bg-surface/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <div>
                  <h3 className="text-sm font-black text-ink">
                    {editingBoard
                      ? isAr
                        ? "تعديل إعدادات اللوحة"
                        : "Edit Board Settings"
                      : isAr
                      ? "إنشاء لوحة رؤية جديدة ✨"
                      : "Create New Vision Board ✨"}
                  </h3>
                  <p className="text-[11px] font-semibold text-ink-light">
                    {isAr ? "مساحتكِ المخصصة للأحلام والطموحات" : "Your space for dreams and intentions"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink transition-all"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "عنوان اللوحة" : "Board Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? "مثال: لوحة أحلامي 2027، بيتي المثالي..." : "e.g. My 2027 Vision, Dream Home..."}
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
                />
              </div>

              {/* Time Horizon */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "الإطار الزمني أو السنة" : "Time Horizon / Year"}
                </label>
                <input
                  type="text"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  placeholder={isAr ? "مثال: 2027، النصف الأول من العام..." : "e.g. 2027, Next 6 Months, Summer..."}
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-hotpink"
                />
              </div>

              {/* Theme Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "ثيم الألوان والورق" : "Paper & Color Theme"}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.values(VISION_BOARD_THEMES).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id)}
                      className={cn(
                        "cursor-pointer p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1",
                        theme === th.id
                          ? "border-hotpink bg-pink-50 dark:bg-pink-950/50 shadow-xs"
                          : "border-border bg-surface hover:border-hotpink/30"
                      )}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: th.accentHex }}
                      />
                      <span className="text-[10px] font-bold text-ink truncate w-full">
                        {isAr ? th.nameAr.split(" ")[0] : th.nameEn.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "تنسيق العرض" : "Display Layout"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "collage" as VisionBoardLayout, icon: Layers, labelEn: "Collage", labelAr: "كولاج" },
                    { id: "grid" as VisionBoardLayout, icon: LayoutGrid, labelEn: "Grid", labelAr: "شبكة" },
                    { id: "scrapbook" as VisionBoardLayout, icon: Scissors, labelEn: "Scrapbook", labelAr: "سجل ورقي" },
                  ].map((l) => {
                    const Icon = l.icon;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLayout(l.id)}
                        className={cn(
                          "cursor-pointer p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1",
                          layout === l.id
                            ? "border-hotpink bg-pink-50 dark:bg-pink-950/50 text-hotpink shadow-xs"
                            : "border-border bg-surface text-ink-light hover:text-ink"
                        )}
                      >
                        <Icon size={16} />
                        <span className="text-[11px] font-bold">
                          {isAr ? l.labelAr : l.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-3.5 bg-card flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="cursor-pointer py-2.5 px-4 rounded-xl border border-border bg-surface text-xs font-bold text-ink hover:bg-muted transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={!title.trim()}
                onClick={handleSaveBoard}
                className={cn(
                  "cursor-pointer py-2.5 px-5 rounded-xl grad-theme text-xs font-black text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5",
                  !title.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                <Sparkles size={14} />
                <span>
                  {editingBoard
                    ? isAr
                      ? "حفظ التعديلات"
                      : "Save Changes"
                    : isAr
                    ? "إنشاء اللوحة 🌸"
                    : "Create Board 🌸"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Board Confirmation Dialog */}
      {deleteConfirmBoardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-card border border-border p-5 shadow-xl space-y-3">
            <div className="text-center space-y-1">
              <span className="text-3xl block">🗑️</span>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "حذف اللوحة نهائياً؟" : "Permanently delete board?"}
              </h3>
              <p className="text-xs text-ink-light">
                {isAr
                  ? "سيتم حذف اللوحة وجميع بطاقاتها. لا يمكن التراجع عن هذا الإجراء."
                  : "This will remove the board and all its items. This cannot be undone."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmBoardId(null)}
                className="cursor-pointer py-2 rounded-xl bg-surface border border-border text-xs font-bold text-ink"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBoard(deleteConfirmBoardId);
                  setDeleteConfirmBoardId(null);
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
