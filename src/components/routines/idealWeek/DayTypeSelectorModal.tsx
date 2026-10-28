import { useState } from "react";
import {
  type DayTypeConfig,
  STARTER_DAY_TYPES,
} from "@/lib/idealWeekEngine";
import { cn } from "@/lib/utils";
import { Plus, Check, Sparkles, X } from "lucide-react";

interface DayTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (dayTypeId: string) => void;
  customTypes: DayTypeConfig[];
  onAddCustomType?: (newType: DayTypeConfig) => void;
  isAr: boolean;
  weekdayName: string;
}

export function DayTypeSelectorModal({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  customTypes,
  onAddCustomType,
  isAr,
  weekdayName,
}: DayTypeSelectorModalProps) {
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [customNameEn, setCustomNameEn] = useState("");
  const [customNameAr, setCustomNameAr] = useState("");
  const [customIcon, setCustomIcon] = useState("✨");

  if (!isOpen) return null;

  const allTypes = [...STARTER_DAY_TYPES, ...customTypes];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameEn.trim()) return;
    const id = `custom_${Date.now()}`;
    const newConfig: DayTypeConfig = {
      id,
      nameEn: customNameEn.trim(),
      nameAr: customNameAr.trim() || customNameEn.trim(),
      icon: customIcon || "✨",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      isCustom: true,
    };
    onAddCustomType?.(newConfig);
    onSelect(id);
    setShowCreateCustom(false);
    setCustomNameEn("");
    setCustomNameAr("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/70 bg-surface/50">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-hotpink">
              {isAr ? `تخصيص نمط اليوم • ${weekdayName}` : `Day Type • ${weekdayName}`}
            </span>
            <h3 className="text-base font-black text-ink">
              {isAr ? "اختاري طبيعة اليوم 🌸" : "Choose Day Rhythm 🌸"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface text-ink-light hover:text-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          <p className="text-xs text-ink-light font-medium pb-1">
            {isAr
              ? "أنماط الأيام تساعدكِ في تصميم إيقاع مرن يناسب ظروف عملكِ ودراستكِ وأيام راحتكِ دون افتراضات مسبقة."
              : "Day types allow you to build an intentional rhythm tailored to your shifts, studies, and rest days."}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {allTypes.map((dt) => {
              const isSelected = dt.id === selectedId;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => {
                    onSelect(dt.id);
                    onClose();
                  }}
                  className={cn(
                    "cursor-pointer w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.99]",
                    isSelected
                      ? "border-hotpink bg-pink-50/70 dark:bg-pink-950/30 shadow-xs"
                      : "border-border/70 hover:border-border hover:bg-surface/60 bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex items-center justify-center w-10 h-10 rounded-xl bg-surface border border-border/50">
                      {dt.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-ink">
                          {isAr ? dt.nameAr : dt.nameEn}
                        </span>
                        {dt.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                            {isAr ? "مخصص" : "Custom"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-light line-clamp-1">
                        {isAr ? dt.descriptionAr : dt.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-hotpink text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add custom day type toggle */}
          {!showCreateCustom ? (
            <button
              type="button"
              onClick={() => setShowCreateCustom(true)}
              className="cursor-pointer w-full mt-2 flex items-center justify-center gap-1.5 p-3 rounded-2xl border border-dashed border-hotpink/40 text-hotpink text-xs font-bold hover:bg-hotpink/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{isAr ? "+ إنشاء نمط يوم مخصص" : "+ Create Custom Day Type"}</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="mt-3 p-3 rounded-2xl bg-surface border border-border/80 space-y-3">
              <span className="text-xs font-black text-ink block">
                {isAr ? "إضافة نمط مخصص جديد" : "Add New Custom Day Type"}
              </span>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="✨"
                  className="p-2 text-center rounded-xl border border-border bg-card text-lg"
                />
                <input
                  type="text"
                  value={customNameEn}
                  onChange={(e) => setCustomNameEn(e.target.value)}
                  placeholder={isAr ? "الاسم بالإنجليزية" : "English name"}
                  className="col-span-3 p-2 text-xs rounded-xl border border-border bg-card font-medium"
                  required
                />
              </div>
              <input
                type="text"
                value={customNameAr}
                onChange={(e) => setCustomNameAr(e.target.value)}
                placeholder={isAr ? "الاسم بالعربية" : "Arabic name (optional)"}
                className="w-full p-2 text-xs rounded-xl border border-border bg-card font-medium"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateCustom(false)}
                  className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold text-ink-light hover:bg-card"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-1.5 rounded-xl grad-theme text-white text-xs font-bold shadow-xs"
                >
                  {isAr ? "حفظ النمط" : "Save Type"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
