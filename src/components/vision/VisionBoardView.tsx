import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Download,
  MoreVertical,
  Layers,
  LayoutGrid,
  Scissors,
  Palette,
  Pin,
  PinOff,
  Copy,
  Archive,
  Trash2,
  Edit2,
  Sparkles,
  Camera,
  Target,
  Check,
} from "lucide-react";
import {
  type VisionBoard,
  type VisionBoardItem,
  type VisionBoardTheme,
  type VisionBoardLayout,
  VISION_BOARD_THEMES,
} from "@/lib/visionEngine";
import { type Goal } from "@/lib/store";
import { VisionBoardItemCard } from "./VisionBoardItemCard";
import { AddEditVisionItemModal } from "./AddEditVisionItemModal";
import { ExportVisionBoardModal } from "./ExportVisionBoardModal";
import { cn } from "@/lib/utils";

interface VisionBoardViewProps {
  board: VisionBoard;
  items: VisionBoardItem[];
  goals: Goal[];
  isAr: boolean;
  onBack: () => void;
  onUpdateBoard: (updates: Partial<VisionBoard>) => void;
  onDuplicateBoard: () => void;
  onArchiveBoard: () => void;
  onDeleteBoard: () => void;
  onAddItem: (item: Omit<VisionBoardItem, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateItem: (id: string, updates: Partial<VisionBoardItem>) => void;
  onDeleteItem: (id: string) => void;
  onMoveItem: (itemId: string, direction: "up" | "down" | "top" | "bottom") => void;
  onTurnIntoGoal: (item: VisionBoardItem) => void;
}

export function VisionBoardView({
  board,
  items,
  goals,
  isAr,
  onBack,
  onUpdateBoard,
  onDuplicateBoard,
  onArchiveBoard,
  onDeleteBoard,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onTurnIntoGoal,
}: VisionBoardViewProps) {
  // Modal states
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionBoardItem | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(board.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const theme = VISION_BOARD_THEMES[board.theme] || VISION_BOARD_THEMES.blossom;
  const boardItems = items
    .filter((it) => it.boardId === board.id)
    .sort((a, b) => a.order - b.order);

  const handleSaveTitle = () => {
    if (draftTitle.trim() && draftTitle.trim() !== board.title) {
      onUpdateBoard({ title: draftTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className={cn("min-h-screen flex flex-col font-sans transition-colors duration-300", theme.canvasBg)}>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
          {/* Back & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface border border-border text-ink hover:text-hotpink active:scale-90 transition-all shadow-xs"
              aria-label="Back to boards"
            >
              <ArrowLeft size={18} className="rtl:rotate-180" />
            </button>

            <div className="min-w-0 flex-1 overflow-hidden">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    onBlur={handleSaveTitle}
                    autoFocus
                    className="w-full text-sm font-extrabold text-ink bg-surface px-2 py-1 rounded-xl border border-hotpink outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="cursor-pointer p-1 rounded-lg grad-theme text-white text-xs font-bold shrink-0"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 min-w-0">
                  <h1
                    onClick={() => {
                      setDraftTitle(board.title);
                      setIsEditingTitle(true);
                    }}
                    className="text-[14px] sm:text-[16px] font-extrabold text-ink truncate cursor-pointer hover:text-hotpink transition-colors flex items-center gap-1 min-w-0"
                    title={isAr ? "اضغطي لتعديل الاسم" : "Click to edit title"}
                  >
                    <span className="shrink-0">🌸</span>
                    <span className="truncate">{board.title}</span>
                  </h1>
                  {board.isPinnedToHome && (
                    <span className="hidden xs:inline-block text-[9.5px] text-hotpink bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 px-1.5 py-0.2 rounded-full shrink-0">
                      📌
                    </span>
                  )}
                </div>
              )}
              {board.timeHorizon && (
                <p className="text-[10px] font-semibold text-ink-light truncate">
                  📅 {board.timeHorizon}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Add Item, Layout, Export, Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme Picker Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemePickerOpen(!themePickerOpen)}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink active:scale-95 transition-all"
                title={isAr ? "لون الثيم" : "Theme Color"}
                aria-label="Theme Color"
              >
                <Palette size={16} style={{ color: theme.accentHex }} />
              </button>

              {themePickerOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setThemePickerOpen(false)} />
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 top-10 z-30 w-48 rounded-2xl border border-border bg-card p-2 shadow-lg animate-fade-in space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-light block px-2 py-0.5">
                      {isAr ? "ثيم اللوحة" : "Board Theme"}
                    </span>
                    {Object.values(VISION_BOARD_THEMES).map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          onUpdateBoard({ theme: th.id });
                          setThemePickerOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors text-start",
                          board.theme === th.id ? "bg-surface text-ink" : "text-ink-light hover:text-ink"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: th.accentHex }} />
                          <span>{isAr ? th.nameAr : th.nameEn}</span>
                        </div>
                        {board.theme === th.id && <Check size={12} className="text-hotpink stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Layout Switcher Pill */}
            <div className="flex items-center rounded-full bg-surface border border-border p-0.5">
              {[
                { id: "collage" as VisionBoardLayout, icon: Layers, label: "Collage" },
                { id: "grid" as VisionBoardLayout, icon: LayoutGrid, label: "Grid" },
                { id: "scrapbook" as VisionBoardLayout, icon: Scissors, label: "Scrapbook" },
              ].map((l) => {
                const Icon = l.icon;
                const isSelected = board.layout === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onUpdateBoard({ layout: l.id })}
                    className={cn(
                      "cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-full transition-all",
                      isSelected
                        ? "grad-theme text-white shadow-xs"
                        : "text-ink-light hover:text-ink"
                    )}
                    title={l.label}
                    aria-label={l.label}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>

            {/* Export High-Res Image Button */}
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-hotpink active:scale-95 transition-all"
              title={isAr ? "تصدير اللوحة" : "Export Board"}
              aria-label="Export Board"
            >
              <Download size={15} />
            </button>

            {/* Prominent Add Item (+) */}
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setAddItemModalOpen(true);
              }}
              className="cursor-pointer flex h-9 items-center gap-1 px-3 rounded-full grad-theme text-white text-xs font-black shadow-xs active:scale-95 transition-all"
            >
              <Plus size={15} className="stroke-[3]" />
              <span className="hidden sm:inline">{isAr ? "إضافة" : "Add"}</span>
            </button>

            {/* Options Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink active:scale-95 transition-all"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>

              {optionsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setOptionsMenuOpen(false)} />
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 top-10 z-30 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-lg animate-fade-in text-xs font-bold text-ink space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setIsEditingTitle(true);
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      <Edit2 size={13} />
                      <span>{isAr ? "إعادة تسمية اللوحة" : "Rename Board"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onUpdateBoard({ isPinnedToHome: !board.isPinnedToHome });
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      {board.isPinnedToHome ? <PinOff size={13} /> : <Pin size={13} />}
                      <span>
                        {board.isPinnedToHome
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
                        setOptionsMenuOpen(false);
                        onUpdateBoard({ showDecorations: !board.showDecorations });
                      }}
                      className="cursor-pointer flex w-full items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      <div className="flex items-center gap-2">
                        <span>🎀</span>
                        <span>{isAr ? "أشرطة الواشي والزينة" : "Washi & Stickers"}</span>
                      </div>
                      <span className="text-[10px] text-hotpink">{board.showDecorations ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onUpdateBoard({ showCaptions: !board.showCaptions });
                      }}
                      className="cursor-pointer flex w-full items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>{isAr ? "إظهار الملاحظات" : "Show Captions"}</span>
                      </div>
                      <span className="text-[10px] text-hotpink">{board.showCaptions ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onUpdateBoard({ showGoalProgress: !board.showGoalProgress });
                      }}
                      className="cursor-pointer flex w-full items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      <div className="flex items-center gap-2">
                        <span>🎯</span>
                        <span>{isAr ? "إظهار تقدم الأهداف" : "Show Goal Progress"}</span>
                      </div>
                      <span className="text-[10px] text-hotpink">{board.showGoalProgress ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onDuplicateBoard();
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start border-t border-border/50"
                    >
                      <Copy size={13} />
                      <span>{isAr ? "تكرار اللوحة (نسخة مستقلة)" : "Duplicate Board"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onArchiveBoard();
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-surface text-ink text-start"
                    >
                      <Archive size={13} />
                      <span>{isAr ? "أرشفة اللوحة" : "Archive Board"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-start border-t border-border/50"
                    >
                      <Trash2 size={13} />
                      <span>{isAr ? "حذف اللوحة" : "Delete Board"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Canvas */}
      <main className={cn("flex-1 px-4 py-6 max-w-4xl mx-auto w-full", theme.patternClass)}>
        {boardItems.length === 0 ? (
          /* Empty State for an empty board */
          <div className="text-center py-16 px-4 rounded-3xl bg-white/70 dark:bg-card/70 border border-dashed border-border max-w-md mx-auto space-y-4 shadow-xs animate-fade-in">
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

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setAddItemModalOpen(true);
                }}
                className="cursor-pointer px-4 py-2.5 rounded-2xl grad-theme text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>{isAr ? "أضيفي أول بطاقة 🌸" : "Add first card 🌸"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Render Items with Selected Layout */
          <div
            className={cn(
              board.layout === "collage" && "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max",
              board.layout === "grid" && "grid grid-cols-2 md:grid-cols-3 gap-3.5",
              board.layout === "scrapbook" && "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-3"
            )}
          >
            {boardItems.map((item) => {
              const linkedGoal = item.linkedGoalId
                ? goals.find((g) => g.id === item.linkedGoalId)
                : undefined;
              return (
                <VisionBoardItemCard
                  key={item.id}
                  item={item}
                  board={board}
                  linkedGoal={linkedGoal}
                  isAr={isAr}
                  onEdit={() => {
                    setEditingItem(item);
                    setAddItemModalOpen(true);
                  }}
                  onDelete={() => onDeleteItem(item.id)}
                  onMove={(dir) => onMoveItem(item.id, dir)}
                  onTurnIntoGoal={onTurnIntoGoal}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Button for Mobile when populated */}
      {boardItems.length > 0 && (
        <div className="fixed bottom-24 right-5 rtl:right-auto rtl:left-5 z-20">
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setAddItemModalOpen(true);
            }}
            className="cursor-pointer flex h-14 w-14 items-center justify-center rounded-full grad-theme text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Add card"
          >
            <Plus size={24} className="stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {addItemModalOpen && (
        <AddEditVisionItemModal
          boardId={board.id}
          itemToEdit={editingItem}
          goals={goals}
          isAr={isAr}
          onSave={(payload) => {
            if (editingItem) {
              onUpdateItem(editingItem.id, payload);
            } else {
              onAddItem(payload);
            }
            setAddItemModalOpen(false);
            setEditingItem(null);
          }}
          onClose={() => {
            setAddItemModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Export Board Modal */}
      {exportModalOpen && (
        <ExportVisionBoardModal
          board={board}
          items={boardItems}
          goals={goals}
          isAr={isAr}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {/* Delete Board Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-card border border-border p-5 shadow-xl space-y-3">
            <div className="text-center space-y-1">
              <span className="text-3xl block">🗑️</span>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "حذف هذه اللوحة نهائياً؟" : "Permanently delete board?"}
              </h3>
              <p className="text-xs text-ink-light">
                {isAr
                  ? `سيتم حذف لوحة «${board.title}» وجميع بطاقاتها. لا يمكن التراجع عن هذه الخطوة.`
                  : `This will delete "${board.title}" and its cards. This action cannot be undone.`}
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
                  onDeleteBoard();
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
