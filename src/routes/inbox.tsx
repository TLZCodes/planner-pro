import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Brain,
  Plus,
  Search,
  X,
  Filter,
  CheckCircle2,
  Archive,
  Inbox as InboxIcon,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Mic,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen } from "@/components/kit";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  type BrainDumpItem,
  type BrainDumpStatus,
  type BrainDumpLabel,
  BRAIN_DUMP_LABELS,
  type BrainDumpDestinationRef,
} from "@/lib/brainDumpEngine";
import { InboxItemCard } from "@/components/inbox/InboxItemCard";
import { QuickCaptureSheet } from "@/components/inbox/QuickCaptureSheet";
import { OrganizeModal } from "@/components/inbox/OrganizeModal";
import { SplitThoughtModal } from "@/components/inbox/SplitThoughtModal";
import { ThoughtDetailModal } from "@/components/inbox/ThoughtDetailModal";

interface InboxSearchCriteria {
  tab?: "unsorted" | "organized" | "archived";
  capture?: boolean;
}

export const Route = createFileRoute("/inbox")({
  validateSearch: (search: Record<string, unknown>): InboxSearchCriteria => {
    return {
      tab:
        search.tab === "organized" || search.tab === "archived" || search.tab === "unsorted"
          ? search.tab
          : "unsorted",
      capture: Boolean(search.capture),
    };
  },
  head: () => ({
    meta: [
      { title: "Brain Dump Inbox — AYXA Planner Pro" },
      {
        name: "description",
        content: "Give your thoughts a little place to land before intentionally organizing them.",
      },
    ],
  }),
  component: BrainDumpInboxPage,
});

function BrainDumpInboxPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const { state } = useApp();
  const searchParams = (Route.useSearch() || {}) as InboxSearchCriteria;

  const [activeTab, setActiveTab] = useState<BrainDumpStatus>(
    searchParams.tab || "unsorted"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<BrainDumpLabel | "all">("all");

  // Modal states
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(Boolean(searchParams.capture));
  const [organizeModalItem, setOrganizeModalItem] = useState<BrainDumpItem | null>(null);
  const [splitModalItem, setSplitModalItem] = useState<BrainDumpItem | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<BrainDumpItem | null>(null);

  const allItems: BrainDumpItem[] = state.brainDumpItems || [];

  // Sync tab with search params if changed
  useEffect(() => {
    if (searchParams.tab && searchParams.tab !== activeTab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams.tab]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      unsorted: allItems.filter((i) => i.status === "unsorted").length,
      organized: allItems.filter((i) => i.status === "organized").length,
      archived: allItems.filter((i) => i.status === "archived").length,
    };
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Tab filter
      if (item.status !== activeTab) return false;

      // Label filter
      if (selectedLabelFilter !== "all" && item.label !== selectedLabelFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesLabel = item.label?.toLowerCase().includes(q);
        const matchesDestination = item.destination?.title.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesLabel && !matchesDestination) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, activeTab, selectedLabelFilter, searchQuery]);

  const handleBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        navigate({ to: "/more" });
      }
    } catch {
      navigate({ to: "/more" });
    }
  };

  return (
    <MobileShell>
      <Screen className="pb-28 bg-[#FFF8FA] dark:bg-background">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#FFF8FA]/90 dark:bg-background/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-pink-100/80 dark:border-pink-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white dark:bg-card border border-pink-200/80 dark:border-pink-900/60 text-[#2b1727] dark:text-pink-100 shadow-xs hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
                title={isAr ? "رجوع" : "Back"}
              >
                {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              </button>
              <div>
                <h1 className="text-lg font-extrabold text-[#2b1727] dark:text-pink-100 flex items-center gap-1.5 font-serif">
                  <span>{t("brainDump")}</span>
                </h1>
                <p className="text-[11px] text-muted-foreground line-clamp-1 font-sans">
                  {t("brainDumpSubtitle")}
                </p>
              </div>
            </div>

            {/* Quick Capture Button */}
            <button
              type="button"
              onClick={() => setQuickCaptureOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>{isAr ? "فكرة جديدة" : "Add Thought"}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search
              size={15}
              className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحثي في أفكاركِ المسجلة..." : "Search captured thoughts..."}
              className="w-full rounded-2xl bg-white dark:bg-card pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2 text-xs font-medium text-[#2b1727] dark:text-pink-100 border border-pink-200/70 dark:border-pink-900/50 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs (Unsorted, Organized, Archived) */}
          <div className="mt-3 flex rounded-2xl bg-pink-100/60 dark:bg-pink-950/40 p-1 border border-pink-200/60 dark:border-pink-900/40">
            <button
              type="button"
              onClick={() => setActiveTab("unsorted")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                activeTab === "unsorted"
                  ? "bg-white dark:bg-card text-[#FF1493] shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <InboxIcon size={13} />
              <span>{t("unsortedTab")}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100 text-[#FF1493] dark:bg-pink-900/50">
                {counts.unsorted}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("organized")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                activeTab === "organized"
                  ? "bg-white dark:bg-card text-emerald-600 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 size={13} />
              <span>{t("organizedTab")}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                {counts.organized}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                activeTab === "archived"
                  ? "bg-white dark:bg-card text-stone-700 dark:text-stone-200 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Archive size={13} />
              <span>{t("archivedTab")}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800">
                {counts.archived}
              </span>
            </button>
          </div>

          {/* Label Filters Horizontal Pill Scroll */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedLabelFilter("all")}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer",
                selectedLabelFilter === "all"
                  ? "bg-[#2b1727] dark:bg-pink-100 text-white dark:text-[#2b1727] border-transparent shadow-xs"
                  : "bg-white dark:bg-card text-muted-foreground border-pink-200/60 dark:border-pink-900/40"
              )}
            >
              {isAr ? "الكل" : "All"}
            </button>

            {BRAIN_DUMP_LABELS.map((lbl) => {
              const isSelected = selectedLabelFilter === lbl.key;
              return (
                <button
                  key={lbl.key}
                  type="button"
                  onClick={() =>
                    setSelectedLabelFilter(isSelected ? "all" : lbl.key)
                  }
                  className={cn(
                    "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#FF1493] text-white border-[#FF1493] shadow-xs"
                      : cn(lbl.bgLight, lbl.textColor, lbl.borderLight, lbl.darkBg, lbl.darkBorder)
                  )}
                >
                  <span>{lbl.emoji}</span>
                  <span>{isAr ? lbl.labelAr : lbl.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Collection Area */}
        <div className="p-4 space-y-3">
          {filteredItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-100/80 dark:bg-pink-950/40 text-[#FF1493] mx-auto border border-pink-200/70 dark:border-pink-900/60 shadow-xs">
                {activeTab === "unsorted" ? (
                  <Brain size={32} />
                ) : activeTab === "organized" ? (
                  <CheckCircle2 size={32} className="text-emerald-500" />
                ) : (
                  <Archive size={32} className="text-stone-400" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2b1727] dark:text-pink-100">
                  {activeTab === "unsorted"
                    ? t("emptyInboxTitle")
                    : activeTab === "organized"
                    ? t("emptyOrganizedTitle")
                    : t("emptyArchivedTitle")}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                  {activeTab === "unsorted"
                    ? t("emptyInboxSub")
                    : activeTab === "organized"
                    ? t("emptyOrganizedSub")
                    : t("emptyArchivedSub")}
                </p>
              </div>

              {activeTab === "unsorted" && (
                <button
                  type="button"
                  onClick={() => setQuickCaptureOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer mt-2"
                >
                  <Plus size={15} />
                  <span>{isAr ? "دوّني فكرتكِ الأولى 🌸" : "Capture your first thought 🌸"}</span>
                </button>
              )}
            </div>
          ) : (
            /* Cards List */
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <InboxItemCard
                  key={item.id}
                  item={item}
                  onOpenDetail={(i) => setDetailModalItem(i)}
                  onEdit={(i) => setDetailModalItem(i)}
                  onOrganize={(i) => setOrganizeModalItem(i)}
                  onSplit={(i) => setSplitModalItem(i)}
                />
              ))}
            </div>
          )}
        </div>
      </Screen>

      {/* Quick Capture Sheet */}
      <QuickCaptureSheet
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onSaved={() => {
          setActiveTab("unsorted");
        }}
      />

      {/* Organize Modal */}
      <OrganizeModal
        isOpen={Boolean(organizeModalItem)}
        item={organizeModalItem}
        onClose={() => setOrganizeModalItem(null)}
        onOrganized={() => {
          setOrganizeModalItem(null);
        }}
      />

      {/* Split Thought Modal */}
      <SplitThoughtModal
        isOpen={Boolean(splitModalItem)}
        item={splitModalItem}
        onClose={() => setSplitModalItem(null)}
        onSplitCompleted={() => {
          setSplitModalItem(null);
          setActiveTab("unsorted");
        }}
      />

      {/* Thought Detail Modal */}
      <ThoughtDetailModal
        isOpen={Boolean(detailModalItem)}
        item={detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onOrganize={(i) => {
          setDetailModalItem(null);
          setOrganizeModalItem(i);
        }}
        onSplit={(i) => {
          setDetailModalItem(null);
          setSplitModalItem(i);
        }}
      />
    </MobileShell>
  );
}
