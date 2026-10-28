import React, { useState } from "react";
import { X, CheckSquare, Sparkles, Check, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CHECKLIST_TEMPLATES, type ChecklistCategory } from "@/lib/travelEngine";

interface ChecklistTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export function ChecklistTemplateModal({
  isOpen,
  onClose,
  tripId,
}: ChecklistTemplateModalProps) {
  const { state, importChecklistTemplate } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [activeTemplateId, setActiveTemplateId] = useState<string>("international_trip");
  const [selectedItemIndices, setSelectedItemIndices] = useState<Record<number, boolean>>({});

  const existingItems = (state.travelChecklistItems || []).filter((c) => c.tripId === tripId);
  const existingTitles = new Set(existingItems.map((c) => c.title.toLowerCase().trim()));

  const template = CHECKLIST_TEMPLATES.find((tpl) => tpl.id === activeTemplateId) || CHECKLIST_TEMPLATES[0];

  if (!isOpen) return null;

  // Toggle item selection
  const toggleItem = (index: number) => {
    setSelectedItemIndices((prev) => ({
      ...prev,
      [index]: prev[index] !== undefined ? !prev[index] : false, // Default is true, so undefined -> false
    }));
  };

  const isSelected = (index: number) => {
    return selectedItemIndices[index] !== undefined ? selectedItemIndices[index] : true;
  };

  const handleImport = () => {
    const itemsToImport = template.items
      .filter((_, idx) => isSelected(idx))
      .map((item) => ({
        category: item.category,
        title: isAr ? item.titleAr : item.titleEn,
        required: item.required,
      }));

    if (itemsToImport.length > 0) {
      importChecklistTemplate(tripId, itemsToImport);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-card text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <CheckSquare size={16} className="text-hotpink" />
            <span>{t("importTemplatesBtn")}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CHECKLIST_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setActiveTemplateId(tpl.id);
                setSelectedItemIndices({});
              }}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all border",
                activeTemplateId === tpl.id
                  ? "bg-hotpink text-white border-hotpink shadow-xs"
                  : "bg-surface text-ink-light border-border hover:text-ink"
              )}
            >
              {isAr ? tpl.nameAr : tpl.nameEn}
            </button>
          ))}
        </div>

        <p className="text-xs text-ink-light leading-relaxed">
          {isAr ? template.descriptionAr : template.descriptionEn}
        </p>

        {/* Template Items List with Duplicate Warnings */}
        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          {template.items.map((item, idx) => {
            const itemTitle = isAr ? item.titleAr : item.titleEn;
            const alreadyExists = existingTitles.has(itemTitle.toLowerCase().trim());
            const checked = isSelected(idx) && !alreadyExists;

            return (
              <div
                key={idx}
                onClick={() => !alreadyExists && toggleItem(idx)}
                className={cn(
                  "flex items-start gap-2.5 rounded-2xl p-2.5 border text-xs transition-all",
                  alreadyExists
                    ? "bg-surface/50 border-border/40 opacity-60 cursor-not-allowed"
                    : "bg-card border-border cursor-pointer hover:border-hotpink/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border mt-0.5 text-[10px] text-white",
                    checked
                      ? "border-hotpink bg-hotpink"
                      : alreadyExists
                      ? "border-border bg-surface"
                      : "border-border"
                  )}
                >
                  {checked ? "✓" : ""}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-ink", alreadyExists && "line-through")}>
                    {itemTitle}
                  </p>
                  {alreadyExists && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-semibold">
                      <AlertCircle size={10} />
                      <span>{isAr ? "موجود مسبقاً في القائمة" : "Already in checklist"}</span>
                    </p>
                  )}
                </div>

                <span className="text-[9px] font-bold text-ink-light bg-surface px-2 py-0.5 rounded-full border border-border shrink-0">
                  {item.category}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleImport}
            className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all"
          >
            {isAr ? "استيراد البنود المحددة إلى القائمة ✨" : "Import Selected Items ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
