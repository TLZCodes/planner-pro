import React from "react";
import {
  X,
  Target,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Layers,
  Link as LinkIcon,
  Unlink,
  Sparkles,
  Heart,
  Footprints,
  Calendar,
  AlertCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp, type Goal } from "@/lib/store";
import {
  type SomedayWish,
  deriveGrowthStage,
} from "@/lib/somedayGardenEngine";

interface WishDetailModalProps {
  isOpen: boolean;
  wish: SomedayWish | null;
  onClose: () => void;
  onEdit: (wish: SomedayWish) => void;
  onTurnIntoGoal: (wish: SomedayWish) => void;
  onLinkGoal: (wish: SomedayWish) => void;
  onAddToVisionBoard?: (wish: SomedayWish) => void;
  onOpenLinkedGoal?: (goalId: string) => void;
}

export function WishDetailModal({
  isOpen,
  wish,
  onClose,
  onEdit,
  onTurnIntoGoal,
  onLinkGoal,
  onAddToVisionBoard,
  onOpenLinkedGoal,
}: WishDetailModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { state, archiveSomedayWish, restoreSomedayWish, deleteSomedayWish, unlinkWishGoal } = useApp();

  if (!isOpen || !wish) return null;

  const linkedGoal = wish.linkedGoalId
    ? (state.goals || []).find((g) => g.id === wish.linkedGoalId)
    : null;

  const growthInfo = deriveGrowthStage(wish, linkedGoal);
  const isArchived = Boolean(wish.archivedAt);
  const visionBoards = (state.visionBoards || []).filter((b) => b.status === "active");
  const canAddToVision = Boolean(onAddToVisionBoard && visionBoards.length > 0);

  const handleArchiveToggle = () => {
    if (isArchived) {
      restoreSomedayWish(wish.id);
    } else {
      archiveSomedayWish(wish.id);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذه الأمنية؟" : "Are you sure you want to delete this wish?")) {
      deleteSomedayWish(wish.id);
      onClose();
    }
  };

  const handleUnlink = () => {
    if (window.confirm(isAr ? "هل ترغبين بإلغاء ربط الهدف؟ (لن يُحذف الهدف)" : "Unlink goal? (The goal will not be deleted)")) {
      unlinkWishGoal(wish.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wish-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FFFBFD] dark:bg-[#1E141B] rounded-t-3xl sm:rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-xl max-h-[92vh] flex flex-col overflow-hidden text-[#3B1238] dark:text-pink-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-2xl" aria-hidden="true">
              {growthInfo.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-hotpink">
                  {isAr ? growthInfo.labelAr : growthInfo.labelEn}
                </span>
                {isArchived && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {isAr ? "مؤرشفة" : "Archived"}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#6E4268] dark:text-pink-300">
                {isAr ? growthInfo.descAr : growthInfo.descEn}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Cover Photo */}
          {wish.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-pink-200/80 dark:border-pink-900/60 shadow-xs max-h-56">
              <img
                src={wish.imageUrl}
                alt={wish.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {wish.category && (
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-hotpink border border-pink-200 dark:border-pink-900/60">
                  {wish.category}
                </span>
              )}
            </div>
            <h1 id="wish-detail-title" className="text-xl font-black text-[#3B1238] dark:text-pink-100 leading-snug">
              {wish.title}
            </h1>
          </div>

          {/* Description */}
          {wish.description && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200/80 dark:border-pink-900/60 text-xs font-medium leading-relaxed text-[#5A2C54] dark:text-pink-200 whitespace-pre-wrap">
              {wish.description}
            </div>
          )}

          {/* Why this matters */}
          {wish.personalReason && (
            <div className="p-3.5 rounded-2xl bg-[#FFF5F8] dark:bg-[#2D1A29] border border-pink-200/60 dark:border-pink-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-hotpink">
                <Heart size={14} className="fill-hotpink/20" />
                <span>{isAr ? "لماذا تعنيني هذه الأمنية" : "Why this matters to me"}</span>
              </div>
              <p className="text-xs font-medium text-[#5A2C54] dark:text-pink-200 leading-normal">
                {wish.personalReason}
              </p>
            </div>
          )}

          {/* Next gentle step */}
          {wish.nextSmallStepNote && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                <Footprints size={14} />
                <span>{isAr ? "خطوة رقيقة مقترحة" : "Next gentle step"}</span>
              </div>
              <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200 leading-normal">
                {wish.nextSmallStepNote}
              </p>
            </div>
          )}

          {/* Linked Goal Card */}
          {wish.linkedGoalId ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                    <Target size={16} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                      {isAr ? "مرتبطة بهدف رسمي 🎯" : "Linked to Canonical Goal 🎯"}
                    </p>
                    <p className="text-xs font-black text-teal-950 dark:text-teal-100 truncate max-w-[200px]">
                      {linkedGoal ? linkedGoal.title : (isAr ? "الهدف لم يعد متاحًا" : "Goal Unavailable")}
                    </p>
                  </div>
                </div>

                {linkedGoal && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white dark:bg-[#1E141B] text-teal-700 dark:text-teal-300 border border-teal-200 font-mono">
                    {typeof linkedGoal.progress === "number" ? Math.round(linkedGoal.progress) : 0}%
                  </span>
                )}
              </div>

              {/* Progress bar if goal exists */}
              {linkedGoal && (
                <div className="w-full h-2 rounded-full bg-teal-200/60 dark:bg-teal-900/60 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, linkedGoal.progress || 0))}%` }}
                  />
                </div>
              )}

              {/* Goal action buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-teal-200/60 dark:border-teal-900/40">
                {linkedGoal && onOpenLinkedGoal ? (
                  <button
                    type="button"
                    onClick={() => onOpenLinkedGoal(linkedGoal.id)}
                    className="cursor-pointer text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>{isAr ? "عرض تفاصيل الهدف" : "Open Goal"}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    {isAr ? "تم حذف الهدف المرتبط" : "Linked goal was deleted"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleUnlink}
                  className="cursor-pointer text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Unlink size={13} />
                  <span>{isAr ? "إلغاء الربط" : "Unlink Goal"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Conversion & Linking prompt when NOT linked */
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200/80 dark:border-pink-900/60 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-[#3B1238] dark:text-pink-100">
                  {isAr ? "هل حان وقت التنفيذ؟" : "Ready to take action?"}
                </p>
                <p className="text-[11px] text-[#6E4268] dark:text-pink-300">
                  {isAr ? "يمكنكِ تحويل الأمنية إلى هدف أو ربطها بهدف موجود." : "Convert into a goal or link to an existing one."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onTurnIntoGoal(wish)}
                  className="cursor-pointer px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <Target size={13} />
                  <span>{isAr ? "تحويل لهدف" : "To Goal"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLinkGoal(wish)}
                  className="cursor-pointer px-2.5 py-2 rounded-xl border border-pink-200 dark:border-pink-900 text-[#3B1238] dark:text-pink-200 text-xs font-bold hover:bg-pink-50 flex items-center gap-1 active:scale-95 transition-all"
                  title={isAr ? "ربط بهدف موجود" : "Link existing goal"}
                >
                  <LinkIcon size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Destination References (e.g. Vision Board, Brain Dump) */}
          {wish.destinationRefs && wish.destinationRefs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-[#6E4268] dark:text-pink-300">
                {isAr ? "روابط متصلة:" : "Connected references:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wish.destinationRefs.map((ref, idx) => (
                  <span
                    key={`${ref.type}-${ref.id}-${idx}`}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 flex items-center gap-1"
                  >
                    <span>{ref.type === "vision_board" ? "🌸" : "💡"}</span>
                    <span>{ref.title}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-pink-100 dark:border-pink-900/40 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
              title={isAr ? "حذف الأمنية" : "Delete Wish"}
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              onClick={handleArchiveToggle}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl border border-pink-200 dark:border-pink-900 text-[#6E4268] dark:text-pink-300 hover:bg-pink-50 active:scale-95 transition-all"
              title={isArchived ? (isAr ? "استعادة" : "Restore") : (isAr ? "أرشفة" : "Archive")}
            >
              {isArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
            </button>

            {canAddToVision && (
              <button
                type="button"
                onClick={() => onAddToVisionBoard?.(wish)}
                className="cursor-pointer flex h-10 items-center gap-1.5 px-3 rounded-2xl border border-pink-200 dark:border-pink-900 text-[#3B1238] dark:text-pink-200 text-xs font-bold hover:bg-pink-50 active:scale-95 transition-all"
                title={isAr ? "إضافة إلى لوحة الرؤية" : "Add to Vision Board"}
              >
                <Layers size={14} className="text-hotpink" />
                <span className="hidden sm:inline">{isAr ? "لوحة الرؤية" : "Vision Board"}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onEdit(wish);
              onClose();
            }}
            className="cursor-pointer min-h-[44px] px-5 py-2.5 rounded-full grad-theme text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Edit2 size={14} />
            <span>{isAr ? "تعديل الأمنية" : "Edit Wish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
