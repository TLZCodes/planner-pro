import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  LayoutGrid,
  List,
  Sparkles,
  Target,
  Layers,
  Heart,
  Archive,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp, type Goal } from "@/lib/store";
import {
  type SomedayWish,
  type SomedayWishStatus,
  SOMEDAY_WISH_CATEGORIES,
  filterAndSortWishes,
  deriveGrowthStage,
} from "@/lib/somedayGardenEngine";
import { PlantWishModal } from "./PlantWishModal";
import { WishDetailModal } from "./WishDetailModal";
import { TurnWishIntoGoalModal } from "./TurnWishIntoGoalModal";
import { LinkExistingGoalModal } from "./LinkExistingGoalModal";
import { AddWishToVisionBoardModal } from "./AddWishToVisionBoardModal";

interface SomedayGardenTabProps {
  onOpenGoalDetails?: (goalId: string) => void;
}

export function SomedayGardenTab({ onOpenGoalDetails }: SomedayGardenTabProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const {
    state,
    addSomedayWish,
    updateSomedayWish,
  } = useApp();

  const allWishes: SomedayWish[] = state.somedayWishes || [];
  const goalsMap = useMemo(() => {
    const map = new Map<string, Goal>();
    (state.goals || []).forEach((g) => map.set(g.id, g));
    return map;
  }, [state.goals]);

  // View state
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "order">("order");
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [plantModalOpen, setPlantModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<SomedayWish | null>(null);
  const [activeWishDetail, setActiveWishDetail] = useState<SomedayWish | null>(null);
  const [turnToGoalWish, setTurnToGoalWish] = useState<SomedayWish | null>(null);
  const [linkGoalWish, setLinkGoalWish] = useState<SomedayWish | null>(null);
  const [visionBoardWish, setVisionBoardWish] = useState<SomedayWish | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered & sorted list
  const filteredWishes = useMemo(() => {
    return filterAndSortWishes(allWishes, {
      query: searchQuery,
      category: selectedCategory,
      statusFilter: selectedStatus,
      sortBy,
      showArchived,
    });
  }, [allWishes, searchQuery, selectedCategory, selectedStatus, sortBy, showArchived]);

  // Active / Archived Counts
  const counts = useMemo(() => {
    const active = allWishes.filter((w) => !w.archivedAt).length;
    const archived = allWishes.filter((w) => Boolean(w.archivedAt)).length;
    return { active, archived };
  }, [allWishes]);

  return (
    <div className="someday-garden-container px-4 py-3 space-y-4 max-w-xl mx-auto w-full font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-24 start-1/2 -translate-x-1/2 z-50 bg-[#3B1238] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce-in"
        >
          <Sparkles size={14} className="text-hotpink" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Garden Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F8] to-[#FFF0F5] dark:from-[#251722] dark:to-[#1C121A] border border-pink-200/80 dark:border-pink-900/60 p-4.5 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background seeds */}
        <div className="absolute top-2 end-3 text-4xl opacity-15 select-none pointer-events-none" aria-hidden="true">
          🌱
        </div>

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#3B1238] dark:text-pink-100 flex items-center gap-1.5">
              <span>🌱</span>
              <span>{isAr ? "حديقة أمنياتي" : "Someday Garden"}</span>
            </h2>
            <p className="text-xs font-medium text-[#6E4268] dark:text-pink-300 mt-1 leading-relaxed">
              {isAr
                ? "بعض الأمنيات تحتاج مساحة قبل أن تحتاج موعدًا."
                : "Some dreams need room before they need a deadline."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingWish(null);
              setPlantModalOpen(true);
            }}
            className="cursor-pointer min-h-[44px] shrink-0 flex items-center gap-1.5 px-4 rounded-full grad-theme text-white text-xs font-black shadow-sm active:scale-95 transition-all"
            aria-label={isAr ? "ازرعي أمنية" : "Plant a wish"}
          >
            <Plus size={16} className="stroke-[3]" />
            <span>{isAr ? "ازرعي أمنية" : "Plant a wish"}</span>
          </button>
        </div>

        {/* View Mode & Archive Toggle Toolbar */}
        <div className="mt-4 pt-3 border-t border-pink-200/50 dark:border-pink-900/40 flex items-center justify-between gap-2 text-xs">
          {/* Active / Archive Switcher */}
          <div className="flex items-center gap-1 bg-white/70 dark:bg-[#2C1A27]/70 p-0.5 rounded-full border border-pink-200/60 dark:border-pink-900/40">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={cn(
                "cursor-pointer px-3 py-1.5 rounded-full font-bold transition-all min-h-[36px]",
                !showArchived
                  ? "bg-hotpink text-white shadow-xs"
                  : "text-[#6E4268] dark:text-pink-300 hover:text-ink"
              )}
            >
              <span>{isAr ? "النشطة" : "Active"}</span>
              <span className="ms-1 text-[10px] opacity-80">({counts.active})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={cn(
                "cursor-pointer px-3 py-1.5 rounded-full font-bold transition-all min-h-[36px]",
                showArchived
                  ? "bg-hotpink text-white shadow-xs"
                  : "text-[#6E4268] dark:text-pink-300 hover:text-ink"
              )}
            >
              <span>{isAr ? "المؤرشفة" : "Archived"}</span>
              <span className="ms-1 text-[10px] opacity-80">({counts.archived})</span>
            </button>
          </div>

          {/* Card vs List Mode */}
          <div className="flex items-center gap-1 bg-white/70 dark:bg-[#2C1A27]/70 p-0.5 rounded-full border border-pink-200/60 dark:border-pink-900/40">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={cn(
                "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full transition-all",
                viewMode === "card"
                  ? "bg-hotpink text-white shadow-xs"
                  : "text-[#6E4268] dark:text-pink-300 hover:text-ink"
              )}
              title={isAr ? "عرض الحديقة" : "Garden Card View"}
              aria-label={isAr ? "عرض الحديقة" : "Garden Card View"}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full transition-all",
                viewMode === "list"
                  ? "bg-hotpink text-white shadow-xs"
                  : "text-[#6E4268] dark:text-pink-300 hover:text-ink"
              )}
              title={isAr ? "قائمة مدمجة" : "Compact List View"}
              aria-label={isAr ? "قائمة مدمجة" : "Compact List View"}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2 px-3.5 h-11 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 shadow-xs">
            <Search size={15} className="text-[#6E4268] dark:text-pink-300 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحثي في أمنياتكِ وملاحظاتكِ..." : "Search wishes, notes..."}
              className="flex-1 bg-transparent text-xs font-bold text-[#3B1238] dark:text-pink-100 outline-none placeholder:text-pink-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer text-[#6E4268] dark:text-pink-300 hover:text-ink p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-11 px-3 rounded-2xl bg-white dark:bg-[#281825] border border-pink-200 dark:border-pink-900/60 text-xs font-bold text-[#3B1238] dark:text-pink-100 outline-none shadow-xs cursor-pointer"
            aria-label={isAr ? "ترتيب حسب" : "Sort by"}
          >
            <option value="order">{isAr ? "ترتيبي الخاص" : "Custom Order"}</option>
            <option value="newest">{isAr ? "الأحدث زراعة" : "Newest"}</option>
            <option value="oldest">{isAr ? "الأقدم زراعة" : "Oldest"}</option>
            <option value="title">{isAr ? "أبجديًا" : "Alphabetical"}</option>
          </select>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { key: "all", labelEn: "All States", labelAr: "الكل" },
            { key: "dreaming", labelEn: "Dreaming 🌱", labelAr: "أحلم بها 🌱" },
            { key: "exploring", labelEn: "Exploring 🌿", labelAr: "أستكشفها 🌿" },
            { key: "linked_goal", labelEn: "Linked Goal 🪴", labelAr: "مرتبطة بهدف 🪴" },
          ].map((st) => {
            const isSelected = selectedStatus === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={cn(
                  "cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap min-h-[36px]",
                  isSelected
                    ? "bg-[#3B1238] text-white border-[#3B1238] shadow-xs"
                    : "bg-white dark:bg-[#281825] text-[#6E4268] dark:text-pink-200 border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-50"
                )}
              >
                {isAr ? st.labelAr : st.labelEn}
              </button>
            );
          })}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "cursor-pointer text-[11px] font-bold px-3 py-1 rounded-full border transition-all whitespace-nowrap min-h-[32px]",
              selectedCategory === "all"
                ? "bg-hotpink text-white border-hotpink shadow-xs"
                : "bg-white dark:bg-[#281825] text-[#6E4268] dark:text-pink-200 border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-50"
            )}
          >
            {isAr ? "جميع التصنيفات" : "All Categories"}
          </button>
          {SOMEDAY_WISH_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={cn(
                  "cursor-pointer text-[11px] font-bold px-3 py-1 rounded-full border transition-all whitespace-nowrap min-h-[32px] flex items-center gap-1",
                  isSelected
                    ? "bg-hotpink text-white border-hotpink shadow-xs"
                    : "bg-white dark:bg-[#281825] text-[#6E4268] dark:text-pink-200 border-pink-200/80 dark:border-pink-900/60 hover:bg-pink-50"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {filteredWishes.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-6 text-center rounded-3xl bg-white/70 dark:bg-[#251722]/70 border border-dashed border-pink-300 dark:border-pink-900/60 space-y-4">
          <div className="flex justify-center text-5xl select-none" aria-hidden="true">
            🌱
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-black text-[#3B1238] dark:text-pink-100">
              {isAr
                ? "هنا مساحة لأمنياتكِ القادمة 🌱"
                : "There is room here for your someday dreams 🌱"}
            </h3>
            <p className="text-xs font-medium text-[#6E4268] dark:text-pink-300 leading-relaxed">
              {isAr
                ? "ازرعي أمنية، واختاري خطوتها التالية حين تكونين مستعدة."
                : "Plant a wish. You can decide what comes next later."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingWish(null);
              setPlantModalOpen(true);
            }}
            className="cursor-pointer min-h-[44px] inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full grad-theme text-white text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>{isAr ? "ازرعي أول أمنية" : "Plant my first wish"}</span>
          </button>
        </div>
      ) : viewMode === "card" ? (
        /* Garden Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredWishes.map((wish) => {
            const linkedGoal = wish.linkedGoalId ? goalsMap.get(wish.linkedGoalId) : null;
            const growth = deriveGrowthStage(wish, linkedGoal);

            return (
              <div
                key={wish.id}
                onClick={() => setActiveWishDetail(wish)}
                className="cursor-pointer group relative rounded-3xl bg-white dark:bg-[#251822] border border-pink-200/80 dark:border-pink-900/60 p-4 shadow-xs hover:shadow-md hover:border-pink-300 transition-all flex flex-col justify-between overflow-hidden text-start"
              >
                {/* Washi tape header accent */}
                <div className="absolute top-0 inset-x-8 h-1.5 bg-pink-200/80 dark:bg-pink-900/50 rounded-b-md" />

                <div>
                  {/* Top Bar: Growth Icon & Category */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-lg shadow-2xs"
                      aria-hidden="true"
                    >
                      {growth.icon}
                    </span>

                    {wish.category && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100/70 dark:bg-pink-950/50 text-hotpink truncate max-w-[140px]">
                        {wish.category}
                      </span>
                    )}
                  </div>

                  {/* Optional Image Preview */}
                  {wish.imageUrl && (
                    <div className="mb-2.5 rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-900/40 h-28 w-full bg-pink-50/50">
                      <img
                        src={wish.imageUrl}
                        alt={wish.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-sm font-black text-[#3B1238] dark:text-pink-100 leading-snug line-clamp-2">
                    {wish.title}
                  </h3>

                  {/* Personal Reason snippet if present */}
                  {wish.personalReason && (
                    <p className="mt-1 text-[11px] text-[#6E4268] dark:text-pink-300 line-clamp-2 flex items-start gap-1">
                      <Heart size={12} className="text-hotpink shrink-0 mt-0.5 fill-hotpink/20" />
                      <span>{wish.personalReason}</span>
                    </p>
                  )}
                </div>

                {/* Bottom Footer: State badge or Goal Progress */}
                <div className="mt-3 pt-2.5 border-t border-pink-100 dark:border-pink-900/40 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#6E4268] dark:text-pink-300">
                    {isAr ? growth.labelAr : growth.labelEn}
                  </span>

                  {growth.isGoalCompleted ? (
                    <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>{isAr ? "مكتمل" : "Completed"}</span>
                    </span>
                  ) : typeof growth.progressPercent === "number" ? (
                    <span className="font-black text-teal-700 dark:text-teal-300 font-mono">
                      {growth.progressPercent}%
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Accessible Compact List View */
        <div className="space-y-2">
          {filteredWishes.map((wish) => {
            const linkedGoal = wish.linkedGoalId ? goalsMap.get(wish.linkedGoalId) : null;
            const growth = deriveGrowthStage(wish, linkedGoal);

            return (
              <div
                key={wish.id}
                onClick={() => setActiveWishDetail(wish)}
                className="cursor-pointer p-3.5 rounded-2xl bg-white dark:bg-[#251822] border border-pink-200/80 dark:border-pink-900/60 shadow-xs hover:border-pink-300 transition-all flex items-center justify-between gap-3 min-h-[56px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-xl shrink-0"
                    aria-hidden="true"
                  >
                    {growth.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#3B1238] dark:text-pink-100 truncate">
                      {wish.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#6E4268] dark:text-pink-300">
                      <span>{isAr ? growth.labelAr : growth.labelEn}</span>
                      {wish.category && (
                        <>
                          <span>•</span>
                          <span className="truncate">{wish.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {growth.isGoalCompleted ? (
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      🌸 100%
                    </span>
                  ) : typeof growth.progressPercent === "number" ? (
                    <span className="text-[11px] font-black text-teal-700 dark:text-teal-300 font-mono">
                      {growth.progressPercent}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-pink-400">
                      {isAr ? "أمنية" : "Wish"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ── */}
      {/* 1. Plant / Edit Wish Modal */}
      <PlantWishModal
        isOpen={plantModalOpen}
        wishToEdit={editingWish}
        onClose={() => {
          setPlantModalOpen(false);
          setEditingWish(null);
        }}
        onSave={(wishData) => {
          if (editingWish) {
            updateSomedayWish(editingWish.id, wishData);
            showToast(isAr ? "تم حفظ التعديلات بنجاح ✨" : "Wish updated successfully ✨");
          } else {
            addSomedayWish(wishData);
            showToast(isAr ? "تمت زراعة أمنيتكِ الجديدة 🌱" : "New wish planted in your garden 🌱");
          }
        }}
      />

      {/* 2. Wish Detail Modal */}
      <WishDetailModal
        isOpen={Boolean(activeWishDetail)}
        wish={activeWishDetail}
        onClose={() => setActiveWishDetail(null)}
        onEdit={(w) => {
          setEditingWish(w);
          setPlantModalOpen(true);
        }}
        onTurnIntoGoal={(w) => {
          setActiveWishDetail(null);
          setTurnToGoalWish(w);
        }}
        onLinkGoal={(w) => {
          setActiveWishDetail(null);
          setLinkGoalWish(w);
        }}
        onAddToVisionBoard={(w) => {
          setActiveWishDetail(null);
          setVisionBoardWish(w);
        }}
        onOpenLinkedGoal={(goalId) => {
          setActiveWishDetail(null);
          if (onOpenGoalDetails) {
            onOpenGoalDetails(goalId);
          }
        }}
      />

      {/* 3. Turn into Goal Modal */}
      <TurnWishIntoGoalModal
        isOpen={Boolean(turnToGoalWish)}
        wish={turnToGoalWish}
        onClose={() => setTurnToGoalWish(null)}
        onGoalCreated={(goalId) => {
          showToast(isAr ? "تم تحويل الأمنية إلى هدف رسمي 🎯" : "Turned into a Goal successfully! 🎯");
        }}
        onLinkExistingInstead={(goalId) => {
          if (turnToGoalWish) {
            updateSomedayWish(turnToGoalWish.id, { linkedGoalId: goalId, status: "linked_goal" });
            showToast(isAr ? "تم ربط الأمنية بالهدف القائم 🌱" : "Linked wish to existing goal 🌱");
          }
        }}
      />

      {/* 4. Link Existing Goal Modal */}
      <LinkExistingGoalModal
        isOpen={Boolean(linkGoalWish)}
        wish={linkGoalWish}
        onClose={() => setLinkGoalWish(null)}
        onGoalLinked={(goalId) => {
          showToast(isAr ? "تم ربط الأمنية بالهدف بنجاح 🔗" : "Linked to Goal successfully! 🔗");
        }}
      />

      {/* 5. Add to Vision Board Modal */}
      <AddWishToVisionBoardModal
        isOpen={Boolean(visionBoardWish)}
        wish={visionBoardWish}
        onClose={() => setVisionBoardWish(null)}
        onAdded={() => {
          showToast(isAr ? "تمت إضافة الأمنية إلى لوحة الرؤية 🌸" : "Wish added to Vision Board! 🌸");
        }}
      />
    </div>
  );
}
