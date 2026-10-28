import React, { useState } from "react";
import { X, Check, Sparkles, LayoutGrid, Layers, Scissors } from "lucide-react";
import { type VisionBoardLayout } from "@/lib/visionEngine";
import { cn } from "@/lib/utils";

interface LayoutPreviewModalProps {
  isAr: boolean;
  onSelectLayout: (layout: VisionBoardLayout) => void;
  onClose: () => void;
}

export function LayoutPreviewModal({
  isAr,
  onSelectLayout,
  onClose,
}: LayoutPreviewModalProps) {
  const [selectedLayout, setSelectedLayout] = useState<VisionBoardLayout>("collage");

  const layouts = [
    {
      id: "collage" as VisionBoardLayout,
      titleEn: "Soft Collage 🌸",
      titleAr: "كولاج رقيق 🌸",
      descEn: "Fluid scrapbook collage with varied image sizes, soft shadows, and gentle washi tape accents.",
      descAr: "تنسيق كولاج حر وأنيق بأحجام متناغمة وظلال ناعمة ولمسات شريط واشي.",
      icon: Layers,
    },
    {
      id: "grid" as VisionBoardLayout,
      titleEn: "Clean Grid 🔲",
      titleAr: "شبكة متوازنة 🔲",
      descEn: "Structured, balanced grid layout for an organized, modern planner look.",
      descAr: "شبكة مرتبة ومتوازنة لأناقة عصرية وتخطيط متناسق ونظيف.",
      icon: LayoutGrid,
    },
    {
      id: "scrapbook" as VisionBoardLayout,
      titleEn: "Paper Scrapbook ✂️",
      titleAr: "سجل ورقي يدوي ✂️",
      descEn: "Playful artistic feel with gentle card tilts, decorative stamps, and scrapbook stickers.",
      descAr: "طابع فني عفوي مع ميلان لطيف للبطاقات وطوابع وملصقات ورقية ساحرة.",
      icon: Scissors,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {isAr ? "معاينة التنسيقات الفنية" : "Preview Board Layouts"}
              </h3>
              <p className="text-[11px] font-semibold text-ink-light">
                {isAr ? "اختاري النمط الذي يناسب رؤيتكِ" : "Choose the aesthetic that feels like you"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-ink-light hover:text-ink transition-all"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Layout Options */}
        <div className="space-y-3">
          {layouts.map((l) => {
            const Icon = l.icon;
            const isSelected = selectedLayout === l.id;
            return (
              <div
                key={l.id}
                onClick={() => setSelectedLayout(l.id)}
                className={cn(
                  "cursor-pointer rounded-2xl border p-3.5 transition-all space-y-2",
                  isSelected
                    ? "border-hotpink bg-pink-50/60 dark:bg-pink-950/40 shadow-xs"
                    : "border-border bg-surface hover:border-hotpink/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        isSelected
                          ? "grad-theme text-white shadow-xs"
                          : "bg-card text-ink border border-border"
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-ink">
                        {isAr ? l.titleAr : l.titleEn}
                      </h4>
                      <p className="text-[10.5px] font-medium text-ink-light leading-snug">
                        {isAr ? l.descAr : l.descEn}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-hotpink text-white shrink-0">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Visual Mini Mockup */}
                <div className="rounded-xl border border-border/70 bg-white dark:bg-card/70 p-2 overflow-hidden">
                  {l.id === "collage" && (
                    <div className="grid grid-cols-3 gap-1.5 h-16">
                      <div className="col-span-2 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-[10px] text-pink-700 dark:text-pink-300 font-bold">
                        🌸 Photo & Title
                      </div>
                      <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                        ✍️ Note
                      </div>
                      <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                        ✨ Wish
                      </div>
                      <div className="col-span-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                        🎯 Linked Goal
                      </div>
                    </div>
                  )}

                  {l.id === "grid" && (
                    <div className="grid grid-cols-2 gap-1.5 h-16">
                      <div className="rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-[10px] text-pink-700 dark:text-pink-300 font-bold">
                        📷 Square Card
                      </div>
                      <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                        ✍️ Affirmation
                      </div>
                    </div>
                  )}

                  {l.id === "scrapbook" && (
                    <div className="relative h-16 bg-[#FFF9F5] dark:bg-[#1f1a18] rounded-lg p-1.5 overflow-hidden flex items-center justify-around">
                      <div className="w-16 h-12 rounded-lg bg-pink-200 dark:bg-pink-900/60 shadow-xs -rotate-3 flex items-center justify-center text-[9px] font-bold text-pink-800 dark:text-pink-200">
                        🌸 Washi Tilt
                      </div>
                      <div className="w-16 h-12 rounded-lg bg-amber-200 dark:bg-amber-900/60 shadow-xs rotate-2 flex items-center justify-center text-[9px] font-bold text-amber-800 dark:text-amber-200">
                        ⭐ Scrap Stamp
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer py-2.5 px-4 rounded-xl border border-border bg-surface text-xs font-bold text-ink hover:bg-muted transition-colors"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectLayout(selectedLayout);
              onClose();
            }}
            className="cursor-pointer py-2.5 px-5 rounded-xl grad-theme text-xs font-black text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>{isAr ? "أنشئي لوحتي بهذا التنسيق 🌸" : "Use this layout 🌸"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
