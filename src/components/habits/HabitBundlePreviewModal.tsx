import React, { memo } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HabitBundlePreviewModalProps {
  bundle: any | null;
  selectedTemplateIds: string[];
  isAr: boolean;
  onToggleTemplate: (id: string) => void;
  onImportSelected: () => void;
  onCancel: () => void;
}

export const HabitBundlePreviewModal = memo(function HabitBundlePreviewModal({
  bundle,
  selectedTemplateIds,
  isAr,
  onToggleTemplate,
  onImportSelected,
  onCancel,
}: HabitBundlePreviewModalProps) {
  if (!bundle) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{bundle.emoji}</span>
            <div>
              <h3 className="text-[16px] font-bold text-ink">
                {isAr ? bundle.titleAr : bundle.titleEn}
              </h3>
              <p className="text-[11.5px] text-ink-light">
                {isAr ? bundle.descAr : bundle.descEn}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-ink hover:text-hotpink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {bundle.templates.map((tmpl: any) => {
            const isSelected = selectedTemplateIds.includes(tmpl.id);
            return (
              <div
                key={tmpl.id}
                onClick={() => onToggleTemplate(tmpl.id)}
                className={cn(
                  "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                  isSelected
                    ? "bg-hotpink/10 border-hotpink shadow-rose-sm"
                    : "bg-surface border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl">{tmpl.emoji}</span>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-ink">
                      {isAr ? tmpl.nameAr : tmpl.nameEn}
                    </h4>
                    <span className="text-[11px] text-ink-light">
                      {tmpl.category}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors",
                    isSelected
                      ? "bg-hotpink text-white border-transparent"
                      : "bg-card border-border text-transparent"
                  )}
                >
                  ✓
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onImportSelected}
            className="w-full py-3.5 px-4 rounded-2xl grad-theme text-white font-extrabold text-[14px] shadow-rose-md active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{isAr ? "أضيفي العادات المحددة ✨" : "Add Selected Habits ✨"}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
