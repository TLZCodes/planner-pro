import { useState, useMemo, memo } from "react";
import {
  Plus, Search, Play, BookOpen, GraduationCap, Zap, CheckCircle2,
  Filter, MoreHorizontal, Layers, ChevronRight, LayoutGrid, LayoutList
} from "lucide-react";
import { useApp, type LearningItem, type LearningItemType, type LearningItemStatus } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

interface LearningSubjectsTabProps {
  onOpenItemDetail: (item: LearningItem) => void;
  onOpenNewItem: (type?: LearningItemType) => void;
  onStartFocus: (item: LearningItem) => void;
}

export const LearningSubjectsTab = memo(function LearningSubjectsTab({
  onOpenItemDetail, onOpenNewItem, onStartFocus,
}: LearningSubjectsTabProps) {
  const { state } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [filterType, setFilterType] = useState<"all" | LearningItemType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | LearningItemStatus>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const items = state.learningItems || [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchAuthor = item.author?.toLowerCase().includes(q);
        const matchPlatform = item.platform?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAuthor && !matchPlatform) return false;
      }
      return true;
    });
  }, [items, filterType, filterStatus, searchQuery]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Search & New Item Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث في المواد، الكتب، الدورات..." : "Search subjects, courses, books..."}
            className="w-full rounded-2xl bg-card border border-border/70 pl-10 pr-4 py-2.5 text-xs text-ink outline-none focus:border-hotpink shadow-xs font-sans"
          />
        </div>
        <button
          onClick={() => onOpenNewItem(filterType === "all" ? undefined : filterType)}
          className="px-3.5 py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 flex items-center justify-center gap-1 shrink-0"
        >
          <Plus size={14} />
          <span>{isAr ? "هدف جديد" : "New"}</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: isAr ? "الكل" : "All" },
          { id: "subject", label: isAr ? "المواد" : "Subjects" },
          { id: "course", label: isAr ? "الدورات" : "Courses" },
          { id: "book", label: isAr ? "الكتب" : "Books" },
          { id: "skill", label: isAr ? "المهارات" : "Skills" },
          { id: "exam_prep", label: isAr ? "الاختبارات" : "Exam Prep" },
        ].map((tp) => (
          <button
            key={tp.id}
            onClick={() => setFilterType(tp.id as any)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
              filterType === tp.id
                ? "border-hotpink bg-hotpink/15 text-hotpink shadow-xs"
                : "border-border/60 bg-card text-ink-light hover:text-ink"
            )}
          >
            {tp.label}
          </button>
        ))}
      </div>

      {/* Status Bar & View Mode Toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex gap-1.5 text-xs font-bold text-ink-light overflow-x-auto no-scrollbar">
          {[
            { id: "active", label: isAr ? "النشطة" : "Active" },
            { id: "completed", label: isAr ? "المكتملة" : "Completed" },
            { id: "paused", label: isAr ? "المتوقفة" : "Paused" },
            { id: "all", label: isAr ? "الكل" : "All" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                filterStatus === st.id ? "bg-ghost font-black text-ink" : "hover:text-ink"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-ghost rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === "list" ? "bg-card text-hotpink shadow-xs" : "text-ink-light hover:text-ink"
            )}
            title={isAr ? "عرض قائمة" : "List view"}
          >
            <LayoutList size={14} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === "grid" ? "bg-card text-hotpink shadow-xs" : "text-ink-light hover:text-ink"
            )}
            title={isAr ? "عرض شبكة" : "Grid view"}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Items Container */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 rounded-3xl bg-card border border-border/60 p-6">
          <BookOpen className="mx-auto text-ink-light mb-2 opacity-50" size={36} />
          <p className="text-sm font-bold text-ink font-sans">{isAr ? "لا توجد عناصر مطابقة" : "No items found"}</p>
          <p className="text-xs text-ink-light mt-1">
            {isAr ? "جرّبي تغيير كلمات البحث أو تصنيف الفلترة." : "Try adjusting your search terms or filters."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* ─── Modern Spacious List Layout ─── */
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItemDetail(item)}
              className="p-4 rounded-3xl bg-card border border-border/70 shadow-xs hover:border-hotpink/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0 shadow-xs"
                  style={{ background: item.color + "25", border: `1.5px solid ${item.color}50` }}
                >
                  {item.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border",
                        item.status === "completed"
                          ? "bg-mint/15 text-islamic border-mint/40"
                          : item.status === "paused"
                          ? "bg-gold/15 text-gold border-gold/40"
                          : item.status === "archived"
                          ? "bg-ghost text-ink-light border-border/60"
                          : "bg-hotpink/15 text-hotpink border-hotpink/30"
                      )}
                    >
                      {t(`type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                    </span>
                    <span className="font-extrabold font-mono text-xs text-hotpink">{item.progress}%</span>
                  </div>

                  <h3 className="text-sm font-bold text-ink truncate group-hover:text-hotpink transition-colors font-sans mt-1">
                    {item.title}
                  </h3>

                  {item.author && <p className="text-xs text-ink-light truncate mt-0.5 font-sans">✍️ {item.author}</p>}
                  {item.platform && <p className="text-xs text-ink-light truncate mt-0.5 font-sans">🎓 {item.platform}</p>}
                  {item.description && !item.author && !item.platform && (
                    <p className="text-xs text-ink-light line-clamp-1 mt-0.5 font-sans">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Progress & Action Bar */}
              <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-ink-light font-sans">
                  <span>
                    {item.progressMethod === "pages_read"
                      ? `${item.currentPage || 0}/${item.totalPages || 0} pages`
                      : item.progressMethod === "lessons_completed"
                      ? `${item.completedLessons || 0}/${item.totalLessons || 0} lessons`
                      : `${item.currentValue || 0} mins study`}
                  </span>
                  {item.targetDate && <span>🎯 {item.targetDate}</span>}
                </div>
                <ProgressBar value={item.progress} />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-ink-light font-sans">
                    {item.weeklyTargetMinutes ? `⏳ ${item.weeklyTargetMinutes}m/week` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartFocus(item);
                    }}
                    className="px-4 py-1.5 rounded-xl grad-theme text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-rose-sm hover:shadow-rose transition-all font-sans"
                  >
                    <Play size={11} className="fill-white" />
                    <span>{t("studyNow")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Clean 2-Column Grid Layout (Never 3!) ─── */
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItemDetail(item)}
              className="p-3.5 rounded-3xl bg-card border border-border/70 shadow-xs hover:border-hotpink/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl shrink-0 shadow-xs"
                    style={{ background: item.color + "25", border: `1.5px solid ${item.color}50` }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md border",
                      item.status === "completed"
                        ? "bg-mint/15 text-islamic border-mint/40"
                        : item.status === "paused"
                        ? "bg-gold/15 text-gold border-gold/40"
                        : "bg-hotpink/15 text-hotpink border-hotpink/30"
                    )}
                  >
                    {t(`type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-ink truncate group-hover:text-hotpink transition-colors font-sans">
                  {item.title}
                </h3>
                {item.author && <p className="text-[10px] text-ink-light truncate mt-0.5 font-sans">✍️ {item.author}</p>}
                {item.platform && <p className="text-[10px] text-ink-light truncate mt-0.5 font-sans">🎓 {item.platform}</p>}
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/40 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-ink-light font-sans truncate">
                    {item.progressMethod === "pages_read"
                      ? `${item.currentPage || 0}/${item.totalPages || 0}p`
                      : item.progressMethod === "lessons_completed"
                      ? `${item.completedLessons || 0}/${item.totalLessons || 0}l`
                      : `${item.currentValue || 0}m`}
                  </span>
                  <span className="font-extrabold font-mono text-hotpink">{item.progress}%</span>
                </div>
                <ProgressBar value={item.progress} />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartFocus(item);
                  }}
                  className="w-full py-1.5 rounded-xl grad-theme text-white text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 shadow-xs font-sans mt-1"
                >
                  <Play size={10} className="fill-white" />
                  <span>{t("studyNow")}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
