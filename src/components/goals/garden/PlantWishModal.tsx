import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Camera,
  Trash2,
  Check,
  Tag,
  Heart,
  ArrowRight,
  Sprout,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import {
  type SomedayWish,
  type SomedayWishStatus,
  SOMEDAY_WISH_CATEGORIES,
} from "@/lib/somedayGardenEngine";

interface PlantWishModalProps {
  isOpen: boolean;
  wishToEdit?: SomedayWish | null;
  onClose: () => void;
  onSave: (wishData: {
    title: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    personalReason?: string;
    nextSmallStepNote?: string;
    status: SomedayWishStatus;
  }) => void;
}

export function PlantWishModal({
  isOpen,
  wishToEdit,
  onClose,
  onSave,
}: PlantWishModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>("Personal");
  const [personalReason, setPersonalReason] = useState("");
  const [nextSmallStepNote, setNextSmallStepNote] = useState("");
  const [status, setStatus] = useState<SomedayWishStatus>("dreaming");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (wishToEdit) {
        setTitle(wishToEdit.title || "");
        setDescription(wishToEdit.description || "");
        setImageUrl(wishToEdit.imageUrl);
        setCategory(wishToEdit.category || "Personal");
        setPersonalReason(wishToEdit.personalReason || "");
        setNextSmallStepNote(wishToEdit.nextSmallStepNote || "");
        setStatus(wishToEdit.status === "exploring" ? "exploring" : "dreaming");
      } else {
        setTitle("");
        setDescription("");
        setImageUrl(undefined);
        setCategory("Personal");
        setPersonalReason("");
        setNextSmallStepNote("");
        setStatus("dreaming");
      }
      setIsSubmitting(false);
      setErrorMsg("");
    }
  }, [isOpen, wishToEdit]);

  if (!isOpen) return null;

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(isAr ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)" : "Image too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setImageUrl(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg(isAr ? "يرجى كتابة عنوان للأمنية" : "Please give your wish a title");
      return;
    }

    setIsSubmitting(true);
    try {
      onSave({
        title: trimmedTitle,
        description: description.trim() || undefined,
        imageUrl,
        category: category || undefined,
        personalReason: personalReason.trim() || undefined,
        nextSmallStepNote: nextSmallStepNote.trim() || undefined,
        status,
      });
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plant-wish-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FFFBFD] dark:bg-[#1E141B] rounded-t-3xl sm:rounded-3xl border border-pink-200/80 dark:border-pink-900/60 shadow-xl max-h-[90vh] flex flex-col overflow-hidden text-[#3B1238] dark:text-pink-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-hotpink">
              <Sprout size={18} />
            </span>
            <div>
              <h2 id="plant-wish-title" className="text-base font-black text-[#3B1238] dark:text-pink-100">
                {wishToEdit ? (isAr ? "تعديل الأمنية 🌿" : "Edit Wish 🌿") : (isAr ? "ازرعي أمنية 🌱" : "Plant a Wish 🌱")}
              </h2>
              <p className="text-[11px] font-semibold text-[#6E4268] dark:text-pink-300">
                {isAr ? "مساحة هادئة لأحلامكِ دون قيود المواعيد" : "A quiet space for dreams without deadlines"}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "عنوان الأمنية *" : "Wish Title *"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder={isAr ? "مثال: تعلّم صنع الفخار باليد، زيارة كيوتو..." : "e.g. Learn hand pottery, visit Kyoto in autumn..."}
              className="w-full h-11 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-sm font-bold text-[#3B1238] dark:text-pink-100 placeholder:text-pink-300 dark:placeholder:text-pink-800 outline-none focus:border-hotpink shadow-inner transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "تفاصيل إضافية (اختياري)" : "Details or ideas (optional)"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "صورة في خيالكِ، تفاصيل تودين تذكرها..." : "A feeling, specific places or things you'd love to try..."}
              className="w-full p-3 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 placeholder:text-pink-300 dark:placeholder:text-pink-800 outline-none focus:border-hotpink shadow-inner resize-none transition-all"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1.5">
              {isAr ? "التصنيف" : "Category"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SOMEDAY_WISH_CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={cn(
                      "cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 min-h-[36px]",
                      isSelected
                        ? "bg-hotpink text-white border-hotpink shadow-xs"
                        : "bg-white dark:bg-[#281825] text-[#6E4268] dark:text-pink-200 border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-50"
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Selection */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "صورة ملهمة (اختياري)" : "Inspiration Photo (optional)"}
            </label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-pink-200 dark:border-pink-900/60 max-h-48 group">
                <img
                  src={imageUrl}
                  alt={title || "Wish preview"}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(undefined)}
                  className="absolute top-2 end-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all cursor-pointer"
                  title={isAr ? "إزالة الصورة" : "Remove photo"}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer w-full h-18 rounded-2xl border-2 border-dashed border-pink-200 dark:border-pink-900/60 hover:border-hotpink bg-white/60 dark:bg-[#281825]/60 flex flex-col items-center justify-center gap-1 text-[#6E4268] dark:text-pink-300 transition-all"
                >
                  <Camera size={18} className="text-hotpink" />
                  <span className="text-xs font-bold">
                    {isAr ? "اختاري صورة من جهازكِ 📸" : "Choose a photo from device 📸"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Why this matters (Personal Reason) */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "لماذا تعنيني هذه الأمنية؟ (اختياري)" : "Why this matters to me (optional)"}
            </label>
            <input
              type="text"
              value={personalReason}
              onChange={(e) => setPersonalReason(e.target.value)}
              placeholder={isAr ? "مثال: شعور بالسكينة، رغبة في استكشاف شغف قديم..." : "e.g. Brings me peace, honoring my creative side..."}
              className="w-full h-10 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 placeholder:text-pink-300 dark:placeholder:text-pink-800 outline-none focus:border-hotpink shadow-inner transition-all"
            />
          </div>

          {/* Next gentle step */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1">
              {isAr ? "خطوة رقيقة قادمة (اختياري)" : "Next gentle step (optional note)"}
            </label>
            <input
              type="text"
              value={nextSmallStepNote}
              onChange={(e) => setNextSmallStepNote(e.target.value)}
              placeholder={isAr ? "مثال: حفظ فيديو توضيحي، قراءة مقال واحد..." : "e.g. Bookmark one beginner guide, watch a short tutorial..."}
              className="w-full h-10 px-3.5 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-medium text-[#3B1238] dark:text-pink-100 placeholder:text-pink-300 dark:placeholder:text-pink-800 outline-none focus:border-hotpink shadow-inner transition-all"
            />
          </div>

          {/* Growth Status Initial Choice: Dreaming 🌱 vs Exploring 🌿 */}
          <div>
            <label className="block text-xs font-black text-[#3B1238] dark:text-pink-200 mb-1.5">
              {isAr ? "حالة الأمنية في الحديقة" : "Initial Garden State"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("dreaming")}
                className={cn(
                  "cursor-pointer p-3 rounded-2xl border text-start transition-all flex items-center gap-2.5",
                  status === "dreaming"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-400"
                    : "bg-white dark:bg-[#281825] border-pink-200/80 dark:border-pink-900/60 text-[#6E4268] dark:text-pink-300"
                )}
              >
                <span className="text-xl">🌱</span>
                <div>
                  <p className="text-xs font-black">{isAr ? "أحلم بها" : "Dreaming"}</p>
                  <p className="text-[10px] text-[#6E4268] dark:text-pink-300">
                    {isAr ? "بذرة تستريح دافئة" : "A patient seed resting"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus("exploring")}
                className={cn(
                  "cursor-pointer p-3 rounded-2xl border text-start transition-all flex items-center gap-2.5",
                  status === "exploring"
                    ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 text-teal-900 dark:text-teal-200 shadow-xs ring-1 ring-teal-400"
                    : "bg-white dark:bg-[#281825] border-pink-200/80 dark:border-pink-900/60 text-[#6E4268] dark:text-pink-300"
                )}
              >
                <span className="text-xl">🌿</span>
                <div>
                  <p className="text-xs font-black">{isAr ? "أستكشفها" : "Exploring"}</p>
                  <p className="text-[10px] text-[#6E4268] dark:text-pink-300">
                    {isAr ? "برعم رقيق ينبت" : "A sprout taking shape"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-pink-100 dark:border-pink-900/40 bg-white/70 dark:bg-[#251822]/70 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer min-h-[44px] px-4 py-2.5 rounded-full border border-pink-200 dark:border-pink-900 text-xs font-black text-[#6E4268] dark:text-pink-200 hover:bg-pink-50 dark:hover:bg-pink-950/40 active:scale-95 transition-all"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer min-h-[44px] flex-1 py-2.5 px-5 rounded-full grad-theme text-white text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>
              {isSubmitting
                ? isAr
                  ? "جاري الزراعة..."
                  : "Planting..."
                : wishToEdit
                ? isAr
                  ? "حفظ التعديلات"
                  : "Save Changes"
                : isAr
                ? "ازرعي أمنية 🌱"
                : "Plant a Wish 🌱"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
