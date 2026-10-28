import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  Check,
  Eye,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type SomedayWish } from "@/lib/somedayGardenEngine";
import { type VisionBoard } from "@/lib/visionEngine";

interface AddWishToVisionBoardModalProps {
  isOpen: boolean;
  wish: SomedayWish | null;
  onClose: () => void;
  onAdded: (boardId: string, itemId: string) => void;
}

export function AddWishToVisionBoardModal({
  isOpen,
  wish,
  onClose,
  onAdded,
}: AddWishToVisionBoardModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { state, addWishToVisionBoard } = useApp();

  const visionBoards: VisionBoard[] = (state.visionBoards || []).filter(
    (b) => b.status === "active"
  );

  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    visionBoards[0]?.id || ""
  );
  const [caption, setCaption] = useState(wish?.personalReason || wish?.title || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !wish || visionBoards.length === 0) return null;

  const handleConfirm = () => {
    if (!selectedBoardId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const createdItemId = addWishToVisionBoard(wish.id, selectedBoardId, caption);
      onAdded(selectedBoardId, createdItemId);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vision-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#FFFBFD] dark:bg-[#1E141B] rounded-t-3xl sm:rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-xl max-h-[85vh] flex flex-col overflow-hidden text-[#3B1238] dark:text-pink-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-hotpink">
              <Layers size={18} />
            </span>
            <div>
              <h2 id="vision-modal-title" className="text-base font-black text-[#3B1238] dark:text-pink-100">
                {isAr ? "إضافة إلى لوحة الرؤية 🌸" : "Add to Vision Board 🌸"}
              </h2>
              <p className="text-[11px] font-semibold text-[#6E4268] dark:text-pink-300">
                {isAr ? "ضعي أمنيتكِ في مساحة رؤيتكِ البصرية" : "Place this wish onto your visual vision board"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#6E4268] dark:text-pink-300 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 transition-all cursor-pointer"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Card Preview */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200/80 dark:border-pink-900/60 shadow-xs flex items-center gap-3">
            {wish.imageUrl ? (
              <img
                src={wish.imageUrl}
                alt={wish.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-pink-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 flex items-center justify-center text-2xl shrink-0">
                🌱
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[#3B1238] dark:text-pink-100 truncate">{wish.title}</p>
              {wish.category && (
                <span className="text-[10px] font-bold text-hotpink">{wish.category}</span>
              )}
            </div>
          </div>

          {/* Select Vision Board */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1.5">
              {isAr ? "اختاري لوحة الرؤية" : "Select Vision Board"}
            </label>
            <div className="space-y-1.5">
              {visionBoards.map((board) => {
                const isSelected = selectedBoardId === board.id;
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => setSelectedBoardId(board.id)}
                    className={cn(
                      "cursor-pointer w-full text-start p-3 rounded-2xl border transition-all flex items-center justify-between min-h-[48px]",
                      isSelected
                        ? "bg-pink-50 dark:bg-pink-950/40 border-hotpink text-[#3B1238] dark:text-pink-100 ring-1 ring-hotpink"
                        : "bg-white dark:bg-[#281825] border-pink-200/80 dark:border-pink-900/60 text-[#6E4268] dark:text-pink-200 hover:bg-pink-50"
                    )}
                  >
                    <span className="text-xs font-bold truncate">{board.title}</span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hotpink text-white shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Caption */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "العبارة التوضيحية على البطاقة (اختياري)" : "Visual Card Caption (optional)"}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isAr ? "عبارة ملهمة تظهر تحت الصورة..." : "A short affirmation or caption..."}
              className="w-full h-11 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-bold text-[#3B1238] dark:text-pink-100 outline-none focus:border-hotpink shadow-inner transition-all"
            />
            <p className="mt-1 text-[10px] text-[#6E4268] dark:text-pink-300">
              {isAr
                ? "تعديل هذه العبارة يخص لوحة الرؤية فقط ولا يغير نص أمنيتكِ الأصلية."
                : "Editing this caption only affects the vision board item and leaves your original wish untouched."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-100 dark:border-pink-900/40 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer min-h-[44px] px-4 py-2.5 rounded-full border border-pink-200 dark:border-pink-900 text-xs font-black text-[#6E4268] dark:text-pink-200 hover:bg-pink-50 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedBoardId || isSubmitting}
            className="cursor-pointer min-h-[44px] flex-1 py-2.5 px-5 rounded-full grad-theme text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Sparkles size={14} />
            <span>
              {isSubmitting
                ? isAr
                  ? "جاري الإضافة..."
                  : "Adding..."
                : isAr
                ? "إضافة إلى اللوحة 🌸"
                : "Add to Board 🌸"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
