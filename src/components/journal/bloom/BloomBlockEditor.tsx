import React, { useRef } from "react";
import {
  type WeekInBloomBlock,
  type BloomBlockType,
  formatDurationLabel,
} from "@/lib/weekInBloomEngine";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface BloomBlockEditorProps {
  block: WeekInBloomBlock;
  index: number;
  totalBlocks: number;
  isAr?: boolean;
  onUpdate: (updated: WeekInBloomBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenSourcePicker: (type: BloomBlockType) => void;
}

export function BloomBlockEditor({
  block,
  index,
  totalBlocks,
  isAr = false,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onOpenSourcePicker,
}: BloomBlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blockLabels: Record<BloomBlockType, { en: string; ar: string; emoji: string }> = {
    photo: { en: "Photo of the week", ar: "صورة الأسبوع", emoji: "📸" },
    accomplishments: { en: "Accomplishments worth remembering", ar: "إنجازات أودّ تذكّرها", emoji: "✨" },
    lovely_moment: { en: "A lovely moment", ar: "لحظة جميلة", emoji: "🤍" },
    supported_habit: { en: "A habit that supported me", ar: "عادة دعمتني", emoji: "🌱" },
    focus_study: { en: "Focus or study time", ar: "وقت التركيز أو الدراسة", emoji: "⏱️" },
    lesson: { en: "A lesson from the week", ar: "ما تعلّمته هذا الأسبوع", emoji: "🌿" },
    gratitude: { en: "Gratitude", ar: "شيء أشعر بالامتنان له", emoji: "🌸" },
    next_intention: { en: "Intention for next week", ar: "نيّتي للأسبوع القادم", emoji: "🕊️" },
  };

  const meta = blockLabels[block.type] || { en: "Block", ar: "قسم", emoji: "📝" };
  const displayLabel = block.titleCustom || (isAr ? meta.ar : meta.en);

  const handleToggleVisible = () => {
    onUpdate({ ...block, visible: !block.visible });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({
        ...block,
        content: {
          url: reader.result as string,
          caption: block.content?.caption || "",
          description: file.name,
          focalPoint: "center",
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`p-4 rounded-3xl border transition-all ${
        block.visible
          ? "bg-card border-border/80 shadow-xs"
          : "bg-surface/50 border-border/40 opacity-70"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Block Header: Type, Title, Move up/down, Visibility toggle */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{meta.emoji}</span>
          <span className="text-xs font-black text-ink truncate">
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Accessible Reorder buttons */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="cursor-pointer p-1 rounded-lg text-ink-light hover:text-ink disabled:opacity-20 active:scale-95"
            aria-label="Move block up"
            title={isAr ? "تحريك لأعلى" : "Move up"}
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            className="cursor-pointer p-1 rounded-lg text-ink-light hover:text-ink disabled:opacity-20 active:scale-95"
            aria-label="Move block down"
            title={isAr ? "تحريك لأسفل" : "Move down"}
          >
            <ChevronDown size={16} />
          </button>

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={handleToggleVisible}
            className={`cursor-pointer p-1.5 rounded-xl border text-xs transition-all ${
              block.visible
                ? "bg-hotpink/10 border-hotpink/30 text-hotpink"
                : "bg-surface border-border text-ink-light"
            }`}
            aria-label={block.visible ? "Hide block" : "Show block"}
            title={block.visible ? (isAr ? "إخفاء" : "Hide") : (isAr ? "إظهار" : "Show")}
          >
            {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>

      {/* Block Content Inputs if visible */}
      {block.visible && (
        <div className="pt-3 space-y-3">
          {/* Action bar for picking from week */}
          {block.type !== "photo" && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onOpenSourcePicker(block.type)}
                className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-hotpink bg-hotpink/5 border border-hotpink/20 hover:bg-hotpink/10 transition-all"
              >
                <Sparkles size={12} />
                <span>{isAr ? "اختيار من سجلات الأسبوع" : "Choose from this week"}</span>
              </button>
            </div>
          )}

          {/* 1. Photo Block */}
          {block.type === "photo" && (
            <div className="space-y-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {block.content?.url ? (
                <div className="space-y-2">
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-border/80 bg-pink-50/50">
                    <img
                      src={block.content.url}
                      alt="Selected preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: block.content.focalPoint || "center" }}
                    />
                    <button
                      type="button"
                      onClick={() => onUpdate({ ...block, content: null })}
                      className="cursor-pointer absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={block.content.caption || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...block,
                        content: { ...block.content, caption: e.target.value },
                      })
                    }
                    placeholder={isAr ? "أضيفي تعليقاً لطيفاً على الصورة..." : "Add a lovely photo caption..."}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-border bg-surface text-ink outline-none"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer w-full py-6 rounded-2xl border-2 border-dashed border-pink-200/80 hover:border-hotpink/60 bg-pink-50/20 text-center flex flex-col items-center justify-center gap-1 text-ink-light transition-all"
                >
                  <Upload size={20} className="text-hotpink" />
                  <span className="text-xs font-bold text-ink">
                    {isAr ? "اختيار صورة من جهازكِ" : "Choose a photo from your device"}
                  </span>
                  <span className="text-[10.5px]">
                    {isAr ? "JPEG أو PNG تُحفظ محلياً بأمان" : "JPEG or PNG saved locally"}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* 2. Accomplishments Block */}
          {block.type === "accomplishments" && (
            <div className="space-y-2">
              {Array.isArray(block.content) &&
                block.content.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...block.content];
                        next[idx] = e.target.value;
                        onUpdate({ ...block, content: next });
                      }}
                      className="flex-1 text-xs font-semibold p-2 rounded-xl border border-border bg-surface text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = block.content.filter((_: any, i: number) => i !== idx);
                        onUpdate({ ...block, content: next });
                      }}
                      className="cursor-pointer p-1.5 text-ink-light hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={() => {
                  const next = Array.isArray(block.content) ? [...block.content, ""] : [""];
                  onUpdate({ ...block, content: next });
                }}
                className="cursor-pointer inline-flex items-center gap-1 text-xs font-black text-hotpink hover:underline pt-1"
              >
                <Plus size={14} />
                <span>{isAr ? "إضافة إنجاز آخر" : "Add another accomplishment"}</span>
              </button>
            </div>
          )}

          {/* 3. Text Areas: Lovely moment, Lesson, Gratitude, Next Intention */}
          {["lovely_moment", "lesson", "gratitude", "next_intention"].includes(block.type) && (
            <textarea
              rows={3}
              value={typeof block.content === "string" ? block.content : ""}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder={
                isAr
                  ? `اكتبي هنا ${meta.ar}...`
                  : `Write your ${meta.en.toLowerCase()} here...`
              }
              className="w-full text-xs font-medium p-2.5 rounded-2xl border border-border bg-surface text-ink outline-none resize-none leading-relaxed"
            />
          )}

          {/* 4. Supported Habit */}
          {block.type === "supported_habit" && (
            <div className="space-y-2">
              <input
                type="text"
                value={block.content?.title || ""}
                onChange={(e) =>
                  onUpdate({
                    ...block,
                    content: { ...block.content, title: e.target.value },
                  })
                }
                placeholder={isAr ? "اسم العادة (مثال: الورد الصباحي، شرب الماء)..." : "Habit name (e.g., Morning hydration)..."}
                className="w-full text-xs font-semibold p-2 rounded-xl border border-border bg-surface text-ink outline-none"
              />
              <input
                type="text"
                value={block.content?.note || ""}
                onChange={(e) =>
                  onUpdate({
                    ...block,
                    content: { ...block.content, note: e.target.value },
                  })
                }
                placeholder={isAr ? "ملاحظة أو عدد الأيام المستمرة..." : "Note or days consistency..."}
                className="w-full text-xs p-2 rounded-xl border border-border bg-surface text-ink outline-none"
              />
            </div>
          )}

          {/* 5. Focus & Study */}
          {block.type === "focus_study" && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-ink-light block mb-1">
                  {isAr ? "الوصف" : "Label"}
                </label>
                <input
                  type="text"
                  value={block.content?.label || ""}
                  onChange={(e) =>
                    onUpdate({
                      ...block,
                      content: { ...block.content, label: e.target.value },
                    })
                  }
                  placeholder={isAr ? "وقت التركيز" : "Focus time"}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-border bg-surface text-ink outline-none"
                />
              </div>
              <div className="w-28">
                <label className="text-[10px] font-bold text-ink-light block mb-1">
                  {isAr ? "المدة (بالدقائق)" : "Minutes"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={block.content?.minutes || 0}
                  onChange={(e) =>
                    onUpdate({
                      ...block,
                      content: { ...block.content, minutes: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full text-xs font-black p-2 rounded-xl border border-border bg-surface text-ink outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
