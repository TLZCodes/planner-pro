import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Type,
  Target,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import {
  type VisionBoardItem,
  type VisionBoardItemType,
  WASHI_TAPE_CLASSES,
} from "@/lib/visionEngine";
import { type Goal } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AddEditVisionItemModalProps {
  boardId: string;
  itemToEdit?: VisionBoardItem | null;
  goals: Goal[];
  isAr: boolean;
  onSave: (payload: Omit<VisionBoardItem, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

export function AddEditVisionItemModal({
  boardId,
  itemToEdit,
  goals,
  isAr,
  onSave,
  onClose,
}: AddEditVisionItemModalProps) {
  const [type, setType] = useState<VisionBoardItemType>(itemToEdit?.type || "photo");
  const [title, setTitle] = useState(itemToEdit?.title || "");
  const [content, setContent] = useState(itemToEdit?.content || "");
  const [imageUrl, setImageUrl] = useState(itemToEdit?.imageUrl || "");
  const [imageAspectRatio, setImageAspectRatio] = useState<"square" | "portrait" | "landscape">(
    itemToEdit?.imageAspectRatio || "square"
  );
  const [caption, setCaption] = useState(itemToEdit?.caption || "");
  const [linkedGoalId, setLinkedGoalId] = useState(itemToEdit?.linkedGoalId || (goals[0]?.id || ""));
  const [sticker, setSticker] = useState<VisionBoardItem["sticker"]>(itemToEdit?.sticker || "flower");
  const [washiColor, setWashiColor] = useState<VisionBoardItem["washiColor"]>(itemToEdit?.washiColor || "pink");
  const [rotation, setRotation] = useState<number>(itemToEdit?.rotation ?? 0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload & convert to persistent base64 data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      boardId,
      type,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      imageUrl: type === "photo" ? imageUrl : undefined,
      imageAspectRatio: type === "photo" ? imageAspectRatio : undefined,
      caption: caption.trim() || undefined,
      linkedGoalId: type === "linked_goal" ? linkedGoalId : undefined,
      sticker,
      washiColor,
      rotation,
      order: itemToEdit?.order ?? 0,
    });
    onClose();
  };

  const canSave =
    (type === "photo" && (imageUrl || title.trim())) ||
    (type === "text" && (content.trim() || title.trim())) ||
    (type === "wish" && (title.trim() || content.trim())) ||
    (type === "linked_goal" && linkedGoalId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-3.5 bg-surface/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {itemToEdit
                  ? isAr
                    ? "تعديل بطاقة الرؤية"
                    : "Edit Vision Card"
                  : isAr
                  ? "إضافة بطاقة جديدة للوحة ✨"
                  : "Add New Vision Card ✨"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? "اجعلي أحلامكِ مرئية وملهمة" : "Make your dreams visible and felt"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 1. Item Type Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">
              {isAr ? "نوع البطاقة" : "Card Type"}
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-surface border border-border">
              {[
                { id: "photo", labelEn: "Photo", labelAr: "صورة", icon: "📷" },
                { id: "wish", labelEn: "Wish", labelAr: "أمنية", icon: "✨" },
                { id: "text", labelEn: "Text", labelAr: "توكيد", icon: "✍️" },
                { id: "linked_goal", labelEn: "Goal", labelAr: "هدف", icon: "🎯" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setType(tab.id as VisionBoardItemType)}
                  className={cn(
                    "cursor-pointer py-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1",
                    type === tab.id
                      ? "grad-theme text-white shadow-xs"
                      : "text-ink-light hover:text-ink"
                  )}
                >
                  <span>{tab.icon}</span>
                  <span className="text-[11px]">{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. PHOTO SECTION */}
          {type === "photo" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "الصورة" : "Image"}
                </label>
                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-border bg-surface aspect-video max-h-48 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-white text-ink text-xs font-bold shadow-md"
                      >
                        {isAr ? "تغيير الصورة" : "Change Image"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md"
                      >
                        {isAr ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-pink-300 dark:border-pink-800 bg-pink-50/40 dark:bg-pink-950/20 p-6 text-center hover:bg-pink-50/70 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card shadow-xs text-hotpink">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-ink">
                        {isAr ? "اضغطي لاختيار صورة من جهازكِ" : "Tap to pick a photo from device"}
                      </p>
                      <p className="text-[11px] font-medium text-ink-light mt-0.5">
                        {isAr ? "PNG, JPG, WebP تحفظ بأمان دون فقدان" : "PNG, JPG, WebP stored securely"}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-light">
                  {isAr ? "نسبة العرض" : "Aspect Ratio"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "square", labelEn: "Square (1:1)", labelAr: "مربع (1:1)" },
                    { id: "portrait", labelEn: "Portrait (3:4)", labelAr: "طولي (3:4)" },
                    { id: "landscape", labelEn: "Landscape (4:3)", labelAr: "عرضي (4:3)" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio.id as any)}
                      className={cn(
                        "cursor-pointer py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center",
                        imageAspectRatio === ratio.id
                          ? "border-hotpink bg-pink-50 dark:bg-pink-950/50 text-hotpink"
                          : "border-border bg-surface text-ink-light hover:text-ink"
                      )}
                    >
                      {isAr ? ratio.labelAr : ratio.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. WISH OR INTENTION SECTION */}
          {type === "wish" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "ما هي أمنيتكِ أو نيتكِ؟ ✨" : "What is your wish or intention? ✨"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: استقرار منزلي دافئ، رحلة إلى الريف السويسري..."
                      : "e.g. A peaceful cozy home studio, traveling to Kyoto..."
                  }
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "تفاصيل أو مشاعر ترتبط بالأمنية" : "Details or feeling linked to this wish"}
                </label>
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isAr
                      ? "اكتبي ما الذي يعنيه لكِ هذا الحلم وكيف تشعرين عند تحققه..."
                      : "Describe how it feels when this dream unfolds..."
                  }
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-hotpink resize-none"
                />
              </div>
            </div>
          )}

          {/* 4. TEXT / AFFIRMATION SECTION */}
          {type === "text" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "عنوان التوكيد (اختياري)" : "Title (Optional)"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? "مثال: ثقتي بنفسي، توكلي على الله..." : "e.g. Unshakable Calm, Trusting My Path..."}
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "نص التوكيد أو الاقتباس ✍️" : "Affirmation or Quote ✍️"}
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isAr
                      ? "«كل خطوة صغيرة تأخذني إلى نسختي الأفضل والأكثر نقاءً وسلاماً»"
                      : "“I am patient, kind to myself, and growing into the woman I am meant to be.”"
                  }
                  className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-hotpink resize-none"
                />
              </div>
            </div>
          )}

          {/* 5. LINKED GOAL SECTION */}
          {type === "linked_goal" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">
                  {isAr ? "اختاري هدفاً من أهدافكِ الحالية 🎯" : "Select an existing goal 🎯"}
                </label>
                {goals.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setLinkedGoalId(g.id)}
                        className={cn(
                          "cursor-pointer flex items-center justify-between p-3 rounded-2xl border transition-all",
                          linkedGoalId === g.id
                            ? "border-hotpink bg-pink-50/70 dark:bg-pink-950/40 text-hotpink"
                            : "border-border bg-surface text-ink hover:border-hotpink/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{g.icon || "🎯"}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold truncate">{g.title}</p>
                            <span className="text-[10px] font-semibold text-ink-light">
                              {g.area} • {g.progress}%
                            </span>
                          </div>
                        </div>
                        {linkedGoalId === g.id && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-hotpink text-white">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs font-bold text-ink-light">
                    {isAr ? "لا توجد أهداف مسجلة بعد" : "No goals recorded yet"}
                  </div>
                )}
                <p className="text-[11px] text-ink-light/80 italic">
                  {isAr
                    ? "ستعرض البطاقة تقدم هذا الهدف بصورة حية. حذف هذه البطاقة لا يحذف هدفكِ الأساسي."
                    : "This card reflects live progress. Deleting this card will never touch your real goal."}
                </p>
              </div>
            </div>
          )}

          {/* Title input for Photo type */}
          {type === "photo" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink">
                {isAr ? "عنوان الصورة (اختياري)" : "Photo Title (Optional)"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? "مثال: مكتبي المستقبلي، حفل التخرج..." : "e.g. Dream Studio, Graduation Day..."}
                className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-hotpink"
              />
            </div>
          )}

          {/* Caption / Note input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-ink">
              {type === "wish"
                ? isAr
                  ? "الإطار الزمني أو التاريخ المستهدف"
                  : "Target Timeframe / Horizon"
                : isAr
                ? "تعليق أو ملاحظة دافئة"
                : "Caption / Gentle Note"}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={
                type === "wish"
                  ? isAr
                    ? "مثال: صيف 2027، الخطوة القادمة..."
                    : "e.g. Summer 2027, Next Chapter..."
                  : isAr
                  ? "كلمات تعبّر عن شعوركِ تجاه هذه الصورة..."
                  : "A few words that feel like you..."
              }
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-hotpink"
            />
          </div>

          {/* Decorative Washi Tape & Sticker Accents */}
          <div className="rounded-2xl border border-border/80 bg-surface/50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink">
                {isAr ? "زينة شريط الواشي" : "Washi Tape Tint"}
              </span>
              <div className="flex items-center gap-1.5">
                {(["pink", "lavender", "butter", "mint", "stripes"] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setWashiColor(color)}
                    className={cn(
                      "cursor-pointer h-5 w-7 rounded-sm border transition-all",
                      WASHI_TAPE_CLASSES[color],
                      washiColor === color ? "ring-2 ring-hotpink scale-110" : "opacity-70 hover:opacity-100"
                    )}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
              <span className="text-[11px] font-bold text-ink">
                {isAr ? "الرمز التعبيري / الملصق" : "Sticker Stamp"}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: "flower", icon: "🌸" },
                  { id: "star", icon: "⭐" },
                  { id: "bow", icon: "🎀" },
                  { id: "sparkle", icon: "✨" },
                  { id: "heart", icon: "💖" },
                  { id: "none", icon: "🚫" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSticker(st.id as any)}
                    className={cn(
                      "cursor-pointer h-7 w-7 rounded-xl flex items-center justify-center text-sm border transition-all",
                      sticker === st.id
                        ? "border-hotpink bg-pink-50 dark:bg-pink-950/50 shadow-xs"
                        : "border-border bg-surface hover:border-hotpink/40"
                    )}
                  >
                    {st.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-border px-5 py-3.5 bg-card flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer py-2.5 px-4 rounded-xl border border-border bg-surface text-xs font-bold text-ink hover:bg-muted transition-colors"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={cn(
              "cursor-pointer py-2.5 px-5 rounded-xl grad-theme text-xs font-black text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5",
              !canSave && "opacity-50 cursor-not-allowed"
            )}
          >
            <span>{isAr ? "حفظ البطاقة ✨" : "Save Card ✨"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
