import React, { useState, memo } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewRoutineModalProps {
  isOpen: boolean;
  isAr: boolean;
  onSave: (payload: {
    title: string;
    type: string;
    emoji: string;
    color: string;
  }) => void;
  onCancel: () => void;
}

export const NewRoutineModal = memo(function NewRoutineModal({
  isOpen,
  isAr,
  onSave,
  onCancel,
}: NewRoutineModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"morning" | "evening" | "day" | "weekly" | "custom">("morning");
  const [emoji, setEmoji] = useState("🌸");
  const [color, setColor] = useState("from-pink-500 via-rose-500 to-amber-400");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      emoji,
      color,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h3 className="text-[17px] font-bold text-ink">
              {isAr ? "إنشاء روتين مخصص جديد ✨" : "Create Custom Routine ✨"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer p-1.5 rounded-full hover:bg-surface text-ink-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "اسم الروتين *" : "Routine Name *"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: روتين العناية الأسبوعي..." : "e.g. Weekly Reset Routine..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              dir="auto"
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm font-bold text-ink outline-none focus:border-hotpink"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "نوع الروتين" : "Routine Type"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { key: "morning", titleAr: "صباحي ☀️", titleEn: "Morning ☀️" },
                { key: "evening", titleAr: "مسائي 🌙", titleEn: "Evening 🌙" },
                { key: "day", titleAr: "نهاري 📚", titleEn: "Day 📚" },
                { key: "weekly", titleAr: "أسبوعي 📅", titleEn: "Weekly 📅" },
                { key: "custom", titleAr: "مخصص 🌸", titleEn: "Custom 🌸" },
              ].map((rt) => (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => setType(rt.key as any)}
                  className={cn(
                    "cursor-pointer p-2 rounded-xl text-center border text-[11.5px] font-bold transition-colors",
                    type === rt.key
                      ? "bg-hotpink/10 border-hotpink text-hotpink"
                      : "bg-surface border-border text-ink-light"
                  )}
                >
                  {isAr ? rt.titleAr : rt.titleEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "الأيقونة" : "Icon"}
            </label>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 text-lg">
              {["🌸", "✨", "☀️", "🌙", "🕌", "📚", "🧘‍♀️", "💅", "🥑", "🎯", "🕯️", "🤍"].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border",
                    emoji === e && "ring-2 ring-hotpink scale-110 bg-pink-50 dark:bg-pink-950/60"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-ink block mb-1">
              {isAr ? "لون البطاقة" : "Card gradient theme"}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "from-pink-500 via-rose-500 to-amber-400", name: "Rose Sunset" },
                { key: "from-purple-600 via-indigo-600 to-pink-500", name: "Spiritual Purple" },
                { key: "from-amber-400 via-orange-400 to-rose-500", name: "Morning Amber" },
                { key: "from-teal-600 via-emerald-600 to-amber-500", name: "Emerald Serenity" },
              ].map((g) => (
                <div
                  key={g.key}
                  onClick={() => setColor(g.key)}
                  className={cn(
                    "cursor-pointer h-10 rounded-xl bg-gradient-to-br transition-all flex items-center justify-center",
                    g.key,
                    color === g.key && "ring-2 ring-hotpink ring-offset-2 scale-105"
                  )}
                >
                  {color === g.key && <Check className="h-4 w-4 text-white stroke-[3]" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="cursor-pointer flex-1 py-3.5 rounded-2xl grad-theme text-white font-extrabold text-[14px] shadow-rose-sm active:scale-98 transition-transform"
            >
              {isAr ? "أنشئي روتيني ✨" : "Create my routine ✨"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-5 py-3.5 rounded-2xl bg-surface text-ink-light font-bold text-[13.5px] border border-border hover:bg-card"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
