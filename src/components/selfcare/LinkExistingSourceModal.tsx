import React, { useState } from "react";
import { X, Search, Check, Link as LinkIcon, Compass } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type CareSourceType, type CareCategory } from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface LinkExistingSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkExistingSourceModal: React.FC<LinkExistingSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, lang } = useLang();
  const { state, linkSourceToCare } = useApp();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<CareSourceType | "all">("all");

  if (!isOpen) return null;

  // Gather items from Habits, Routines, Tasks, Deen
  const habits = (state.habits || []).map((h) => ({
    id: h.id,
    sourceType: "habit" as CareSourceType,
    title: h.name,
    icon: h.emoji || "🌸",
    category: "body" as CareCategory,
    sourceLabel: isAr ? "عادة" : "Habit",
  }));

  const routinesList: {
    id: string;
    sourceType: CareSourceType;
    title: string;
    icon: string;
    category: CareCategory;
    sourceLabel: string;
  }[] = [];

  if (state.routines) {
    Object.entries(state.routines).forEach(([rKey, steps]: [string, any[]]) => {
      steps.forEach((st) => {
        routinesList.push({
          id: st.id,
          sourceType: "routine" as CareSourceType,
          title: isAr ? st.titleAr || st.title : st.title,
          icon: st.emoji || "✨",
          category: "rest" as CareCategory,
          sourceLabel: isAr ? `روتين: ${rKey}` : `Routine: ${rKey}`,
        });
      });
    });
  }

  const tasks = (state.tasks || [])
    .filter((t) => !t.done)
    .map((t) => ({
      id: t.id,
      sourceType: "task" as CareSourceType,
      title: t.title,
      icon: "📋",
      category: "custom" as CareCategory,
      sourceLabel: isAr ? "مهمة" : "Task",
    }));

  const allAvailable = [...habits, ...routinesList, ...tasks];

  // Already linked check
  const existingSourceIds = new Set(
    (state.selfCareActivities || [])
      .filter((a) => a.sourceId)
      .map((a) => a.sourceId)
  );

  const filtered = allAvailable.filter((item) => {
    if (sourceFilter !== "all" && item.sourceType !== sourceFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return item.title.toLowerCase().includes(q) || item.sourceLabel.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelect = (item: (typeof allAvailable)[0]) => {
    linkSourceToCare(
      item.sourceType,
      item.id,
      item.title,
      item.icon,
      item.category
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-pink-500" />
            <h3 className="text-base font-bold text-ink">
              {isAr ? "ربط عنصر موجود بالعناية" : "Link Existing Source"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Explain Note */}
        <p className="text-xs text-ink-light leading-relaxed">
          {isAr
            ? "عند إكمال العنصر المرتبط من العناية، سيتم تحديث حالته الأصلية تلقائيًا دون تكرار نقاط الخبرة."
            : "Completing a linked item from Self-care also completes its original source without duplicate XP."}
        </p>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-ink-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحثي في العادات والروتين والمهام..." : "Search habits, routines, tasks..."}
            className="w-full rounded-2xl bg-surface border border-border/60 pl-10 pr-4 py-2.5 text-xs text-ink outline-none focus:border-pink-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: "all", label: isAr ? "الكل" : "All" },
            { key: "habit", label: isAr ? "العادات" : "Habits" },
            { key: "routine", label: isAr ? "الروتينات" : "Routines" },
            { key: "task", label: isAr ? "المهام" : "Tasks" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setSourceFilter(f.key as any)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                sourceFilter === f.key
                  ? "bg-hotpink text-white border-hotpink"
                  : "bg-surface border-border/50 text-ink-light"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-ink-light">
              {isAr ? "لا توجد عناصر مطابقة متاحة للربط" : "No eligible items found"}
            </p>
          ) : (
            filtered.map((item) => {
              const isAlreadyLinked = existingSourceIds.has(item.id);

              return (
                <div
                  key={`${item.sourceType}_${item.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border/50 hover:border-pink-300 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xl">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-ink truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-ink-light font-medium">
                        {item.sourceLabel}
                      </span>
                    </div>
                  </div>

                  {isAlreadyLinked ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={12} strokeWidth={3} />
                      <span>{isAr ? "مرتبط بالفعل" : "Linked"}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(item)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 active:scale-95 transition-all"
                    >
                      {isAr ? "ربط" : "Link"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
