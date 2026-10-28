import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Check,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useApp, type JournalEntry } from "@/lib/store";
import { isBarakahJarEntry, formatBlessingDate } from "@/lib/barakahJarEngine";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ChooseFromJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinked?: (count: number) => void;
}

export const ChooseFromJournalModal: React.FC<ChooseFromJournalModalProps> = ({
  isOpen,
  onClose,
  onLinked,
}) => {
  const { state, editJournal } = useApp();
  const journal = state.journal || [];
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter candidates: entries that are NOT yet in Barakah Jar
  const candidateEntries = useMemo(() => {
    return journal.filter((e) => !isBarakahJarEntry(e));
  }, [journal]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return candidateEntries;
    const q = searchQuery.toLowerCase();
    return candidateEntries.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [candidateEntries, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLinkSelected = () => {
    let count = 0;
    selectedIds.forEach((id) => {
      editJournal(id, { isBarakahJar: true });
      count++;
    });
    setSelectedIds(new Set());
    if (onLinked) onLinked(count);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-surface/90">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div>
              <h3 className="text-sm font-black text-ink">
                {t("chooseFromJournal") || (isAr ? "إضافة من دفتر اليوميات" : "Choose from Journal")}
              </h3>
              <p className="text-[10px] text-ink-light">
                {isAr
                  ? "اربطي تدويناتكِ السابقة بالجرّة دون تكرار النص"
                  : "Link your existing reflections without duplicating text"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border/40 bg-surface/40">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحثي في اليوميات..." : "Search journal entries..."}
              className="w-full pl-8 pr-3 py-2 rounded-2xl border border-border/70 bg-white/90 dark:bg-card/90 text-xs text-ink placeholder:text-ink-lighter focus:outline-hidden focus:border-rose-400"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 no-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen size={28} className="mx-auto text-ink-lighter" />
              <p className="text-xs font-bold text-ink-light">
                {searchQuery
                  ? isAr
                    ? "لا توجد نتائج مطابقة لبحثكِ"
                    : "No matching journal entries found"
                  : isAr
                  ? "جميع تدويناتكِ مدرجة بالفعل في جرّة النِّعم 🌸"
                  : "All your existing entries are already in your Barakah Jar 🌸"}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = selectedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  onClick={() => toggleSelect(entry.id)}
                  className={cn(
                    "cursor-pointer p-3 rounded-2xl border transition-all flex items-start gap-3 select-none",
                    isSelected
                      ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 ring-1 ring-rose-400/50 shadow-2xs"
                      : "bg-surface/70 border-border/70 hover:bg-surface"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-rose-500 border-rose-600 text-white"
                        : "border-border bg-white dark:bg-card"
                    )}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-ink-light font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-rose-500" />
                        <span>{formatBlessingDate(entry.date, isAr)}</span>
                      </span>
                      {entry.templateId && (
                        <span className="px-1.5 py-0.2 rounded-md bg-surface border border-border/50 text-[9px] uppercase">
                          {entry.templateId}
                        </span>
                      )}
                    </div>
                    {entry.title && (
                      <h4 className="text-xs font-black text-ink truncate mb-0.5">
                        {entry.title}
                      </h4>
                    )}
                    <p className="text-xs text-ink-light line-clamp-2 leading-relaxed">
                      {entry.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 bg-surface/90 flex items-center justify-between">
          <span className="text-xs font-bold text-ink-light">
            {isAr
              ? `المحدد: ${selectedIds.size}`
              : `Selected: ${selectedIds.size}`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 rounded-2xl border border-border text-xs font-black text-ink-light hover:text-ink"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleLinkSelected}
              className={cn(
                "cursor-pointer px-5 py-2 rounded-2xl bg-hotpink text-white text-xs font-black shadow-rose-xs transition-all flex items-center gap-1.5",
                selectedIds.size === 0
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-pink-600 active:scale-95"
              )}
            >
              <Sparkles size={13} />
              <span>
                {isAr
                  ? `إضافة للجرّة (${selectedIds.size})`
                  : `Add to Jar (${selectedIds.size})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
