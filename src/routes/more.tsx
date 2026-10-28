import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Settings as SettingsIcon,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
  Check,
  X,
  User as UserIcon,
  Flame,
  Trophy,
  Zap,
  Bookmark,
  Compass,
  Moon,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, ProgressBar } from "@/components/kit";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { getProgressionOverview } from "@/lib/progressionEngine";
import {
  ALL_MORE_MODULES,
  MORE_CATEGORIES,
  DEFAULT_PINNED_MODULE_IDS,
  type ModuleDefinition,
  type ModuleCategory,
} from "@/lib/moreRegistry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "Explore AYXA ✨ — Central Hub & Planners" },
      {
        name: "description",
        content: "Discover and organize all AYXA tools: Islamic worship, habits, routines, goals, learning, finance, wellness, bujo studio, and personal achievements.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { state, updateMorePreferences, trackModuleVisit, resetMorePreferences } = useApp();
  const { t, lang, dir } = useLang();
  const navigate = useNavigate();

  const isAr = lang === "ar";
  const xp = state.xp || 0;
  const overview = getProgressionOverview(xp);
  const unlockedBadgesCount = (state.unlockedBadges || []).length;

  // Search & Filter State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ModuleCategory>("all");

  // Customize Modal State
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [draftPinnedIds, setDraftPinnedIds] = useState<string[]>([]);
  const [draftHiddenIds, setDraftHiddenIds] = useState<string[]>([]);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Preference Values
  const morePrefs = state.morePreferences || {
    pinnedModuleIds: DEFAULT_PINNED_MODULE_IDS,
    hiddenModuleIds: [],
    customModuleOrder: [],
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  };

  const pinnedIds = morePrefs.pinnedModuleIds || DEFAULT_PINNED_MODULE_IDS;
  const hiddenIds = morePrefs.hiddenModuleIds || [];
  const customOrder = morePrefs.customModuleOrder || [];

  // Open Customize Dialog with fresh snapshot
  const handleOpenCustomize = () => {
    setDraftPinnedIds([...pinnedIds]);
    setDraftHiddenIds([...hiddenIds]);
    setDraftOrder(
      customOrder.length > 0
        ? [...customOrder]
        : ALL_MORE_MODULES.map((m) => m.id)
    );
    setShowResetConfirm(false);
    setCustomizeOpen(true);
  };

  // Save Customization
  const handleSaveCustomize = () => {
    updateMorePreferences({
      pinnedModuleIds: draftPinnedIds,
      hiddenModuleIds: draftHiddenIds,
      customModuleOrder: draftOrder,
    });
    setCustomizeOpen(false);
  };

  // Reset to Default
  const handleConfirmReset = () => {
    resetMorePreferences();
    setDraftPinnedIds([...DEFAULT_PINNED_MODULE_IDS]);
    setDraftHiddenIds([]);
    setDraftOrder(ALL_MORE_MODULES.map((m) => m.id));
    setShowResetConfirm(false);
    setCustomizeOpen(false);
  };

  // Reorder Item within draft
  const handleMoveDraftItem = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= draftOrder.length) return;
    const next = [...draftOrder];
    const [moved] = next.splice(index, 1);
    next.splice(newIdx, 0, moved);
    setDraftOrder(next);
  };

  // Toggle Pin inside draft
  const handleToggleDraftPin = (id: string) => {
    if (draftPinnedIds.includes(id)) {
      setDraftPinnedIds(draftPinnedIds.filter((pId) => pId !== id));
    } else {
      if (draftPinnedIds.length >= 4) {
        // Replace oldest or cap at 4
        setDraftPinnedIds([...draftPinnedIds.slice(1), id]);
      } else {
        setDraftPinnedIds([...draftPinnedIds, id]);
      }
    }
  };

  // Toggle Hide inside draft
  const handleToggleDraftHide = (id: string) => {
    if (draftHiddenIds.includes(id)) {
      setDraftHiddenIds(draftHiddenIds.filter((hId) => hId !== id));
    } else {
      setDraftHiddenIds([...draftHiddenIds, id]);
      // Also unpin if hidden
      setDraftPinnedIds(draftPinnedIds.filter((pId) => pId !== id));
    }
  };

  // Quick Access Modules (Pinned -> Recent -> Defaults, capped at 4, deduplicated)
  const quickAccessModules = useMemo(() => {
    const result: ModuleDefinition[] = [];
    const addedIds = new Set<string>();

    // 1. User Pinned items
    for (const pId of pinnedIds) {
      if (hiddenIds.includes(pId)) continue;
      const mod = ALL_MORE_MODULES.find((m) => m.id === pId);
      if (mod && !addedIds.has(mod.id)) {
        result.push(mod);
        addedIds.add(mod.id);
      }
      if (result.length >= 4) break;
    }

    // 2. Recently visited items if less than 4
    if (result.length < 4) {
      const recent = state.recentModuleVisits || [];
      for (const r of recent) {
        if (hiddenIds.includes(r.moduleId)) continue;
        const mod = ALL_MORE_MODULES.find((m) => m.id === r.moduleId);
        if (mod && !addedIds.has(mod.id)) {
          result.push(mod);
          addedIds.add(mod.id);
        }
        if (result.length >= 4) break;
      }
    }

    // 3. Fallback to default pinned modules
    if (result.length < 4) {
      for (const defId of DEFAULT_PINNED_MODULE_IDS) {
        if (hiddenIds.includes(defId)) continue;
        const mod = ALL_MORE_MODULES.find((m) => m.id === defId);
        if (mod && !addedIds.has(mod.id)) {
          result.push(mod);
          addedIds.add(mod.id);
        }
        if (result.length >= 4) break;
      }
    }

    return result.slice(0, 4);
  }, [pinnedIds, hiddenIds, state.recentModuleVisits]);

  // Filtered & Ordered Modules for Search & Display
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return ALL_MORE_MODULES.filter((m) => {
      if (selectedCategory !== "all" && m.categoryId !== selectedCategory) return false;
      const titleMatch =
        m.titleEn.toLowerCase().includes(q) ||
        m.titleAr.toLowerCase().includes(q);
      const descMatch =
        m.descEn.toLowerCase().includes(q) ||
        m.descAr.toLowerCase().includes(q);
      const aliasMatch =
        m.aliasesEn.some((a) => a.toLowerCase().includes(q)) ||
        m.aliasesAr.some((a) => a.toLowerCase().includes(q));
      return titleMatch || descMatch || aliasMatch;
    });
  }, [searchQuery, selectedCategory]);

  // Navigate & Track
  const handleModuleClick = (mod: ModuleDefinition) => {
    trackModuleVisit(mod.id);
    if (mod.canonicalRoute.includes("?")) {
      const [path, queryString] = mod.canonicalRoute.split("?");
      const searchObj: Record<string, string> = {};
      const params = new URLSearchParams(queryString);
      params.forEach((val, key) => {
        searchObj[key] = val;
      });
      navigate({ to: path, search: searchObj as any });
    } else {
      navigate({ to: mod.canonicalRoute });
    }
  };

  return (
    <MobileShell>
      <Screen className="explore-ayxa-page min-h-screen bg-canvas text-ink font-sans pb-32">
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── 1. HEADER (NO BACK ARROW — PRIMARY BOTTOM TAB) ───────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/70 px-4 pt-4 pb-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-black tracking-tight text-ink flex items-center gap-1.5 truncate font-display">
                <span>{isAr ? "اكتشفي AYXA ✨" : "Explore AYXA ✨"}</span>
              </h1>
              <p className="text-[11.5px] font-semibold text-ink-light truncate mt-0.5">
                {isAr
                  ? "كل ما تحتاجينه، منظّم وجميل في مكان واحد."
                  : "Everything you need, beautifully organized."}
              </p>
            </div>

            {/* Action Buttons: Search, Customize, Settings */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className={cn(
                  "cursor-pointer flex h-9.5 w-9.5 items-center justify-center rounded-full border transition-all active:scale-95",
                  searchOpen || searchQuery
                    ? "bg-hotpink/10 border-hotpink text-hotpink"
                    : "bg-surface border-border/80 text-ink-light hover:text-ink"
                )}
                aria-label={t("searchTools")}
                title={t("searchTools")}
              >
                <Search size={16} />
              </button>

              <button
                type="button"
                onClick={handleOpenCustomize}
                className="cursor-pointer flex h-9.5 w-9.5 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink active:scale-95 transition-all"
                aria-label={t("customize")}
                title={t("customize")}
              >
                <SlidersHorizontal size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/settings" })}
                className="cursor-pointer flex h-9.5 w-9.5 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink active:scale-95 transition-all"
                aria-label={t("settings")}
                title={t("settings")}
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar when toggled */}
          {searchOpen && (
            <div className="mt-3.5 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 rounded-2xl border border-hotpink/50 bg-surface px-3.5 py-2 shadow-inner">
                <Search size={15} className="text-hotpink shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchTools")}
                  className="w-full bg-transparent text-xs font-bold text-ink outline-none placeholder:text-ink-light/60"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-ink-light hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills inside search */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "cursor-pointer shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold border transition-all",
                    selectedCategory === "all"
                      ? "grad-theme text-white border-transparent shadow-xs"
                      : "bg-surface border-border text-ink-light hover:text-ink"
                  )}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                {MORE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={cn(
                      "cursor-pointer shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold border transition-all",
                      selectedCategory === c.id
                        ? "grad-theme text-white border-transparent shadow-xs"
                        : "bg-surface border-border text-ink-light hover:text-ink"
                    )}
                  >
                    {isAr ? c.titleAr : c.titleEn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── 2. CANONICAL PROFILE & XP PROGRESS CARD ─────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="px-4 mt-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-4.5 text-white shadow-rose-md">
            <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
            <span className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-amber-300/20 blur-xl" />

            <div className="relative z-10 space-y-3.5">
              {/* Profile Top row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl shadow-inner border border-white/30">
                    {state.user?.avatar || state.user?.emoji || "🌸"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-black truncate leading-tight">
                      {state.user?.isGuest
                        ? isAr
                          ? "ضيفة ✨"
                          : "Guest ✨"
                        : state.user?.name || "AYXA Member"}
                    </p>
                    <p className="text-[12px] font-bold text-pink-100 flex items-center gap-1 mt-0.5">
                      <span>
                        {isAr
                          ? `المستوى ${overview.level} • ${overview.tier.labelAr}`
                          : `Level ${overview.level} • ${overview.tier.label}`}
                      </span>
                      <span>{overview.tier.emoji}</span>
                    </p>
                  </div>
                </div>

                {/* Badges Pill */}
                <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 text-[11px] font-extrabold text-white shrink-0">
                  <Trophy size={13} className="text-amber-200" />
                  <span>
                    {unlockedBadgesCount} {isAr ? "شارات" : "badges"}
                  </span>
                </div>
              </div>

              {/* Progress to Next Level Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11.5px] font-extrabold text-pink-100">
                  <span>
                    {xp.toLocaleString()} {isAr ? "نقطة خبرة" : "XP"}
                  </span>
                  <span>
                    {isAr
                      ? `${overview.xpToNextLevel} نقطة للمستوى ${overview.level + 1}`
                      : `${overview.xpToNextLevel} XP to Level ${overview.level + 1}`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/20 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-200 transition-all duration-700"
                    style={{ width: `${overview.levelPct}%` }}
                  />
                </div>
              </div>

              {/* Action Button: View My Progress */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/progress" })}
                  className="cursor-pointer flex-1 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs font-black flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Zap size={14} className="text-amber-200 fill-amber-200" />
                  <span>{isAr ? "عرض تقدّمي ✨" : "View My Progress ✨"}</span>
                </button>

                {state.user?.isGuest && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/signup" })}
                    className="cursor-pointer px-3 py-2 rounded-xl bg-white text-hotpink text-[11.5px] font-black shadow-xs active:scale-98 transition-all"
                  >
                    {isAr ? "حفظ الحساب" : "Save Account"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── 3. SEARCH RESULTS (WHEN ACTIVE) ──────────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {searchResults !== null ? (
          <div className="px-4 mt-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-ink-light">
                {isAr
                  ? `نتائج البحث (${searchResults.length})`
                  : `Search Results (${searchResults.length})`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="text-xs font-bold text-hotpink hover:underline"
              >
                {isAr ? "إغلاق البحث" : "Close Search"}
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="rounded-3xl bg-card border border-border/80 p-8 text-center space-y-3 shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border text-3xl">
                  🔍
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">
                    {t("noMatchingTools")}
                  </h3>
                  <p className="text-xs text-ink-light font-medium mt-1">
                    {t("noMatchingToolsSub")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="cursor-pointer px-4 py-2 rounded-full bg-surface border border-border text-xs font-extrabold text-ink hover:border-hotpink active:scale-95 transition-all"
                >
                  {isAr ? "مسح البحث" : "Clear Search"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((mod) => {
                  const Icon = mod.icon;
                  const stat = mod.getDynamicStat?.(state, isAr);
                  const catDef = MORE_CATEGORIES.find((c) => c.id === mod.categoryId);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleModuleClick(mod)}
                      className="group cursor-pointer rounded-2xl bg-card border border-border/80 p-3.5 shadow-xs hover:border-hotpink/50 active:scale-[0.99] transition-all space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm group-hover:scale-105 transition-transform",
                            mod.gradient
                          )}
                        >
                          <Icon size={20} className="stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "text-[9.5px] font-black px-2 py-0.2 rounded-full border",
                                catDef?.badgeBg || "bg-surface text-ink-light border-border"
                              )}
                            >
                              {isAr ? catDef?.titleAr : catDef?.titleEn}
                            </span>
                          </div>
                          <h3 className="text-[14px] font-extrabold text-ink group-hover:text-hotpink transition-colors truncate mt-1">
                            {isAr ? mod.titleAr : mod.titleEn}
                          </h3>
                          <p className="text-[11px] text-ink-light font-medium line-clamp-1 mt-0.5">
                            {isAr ? mod.descAr : mod.descEn}
                          </p>
                        </div>
                      </div>

                      {stat && (
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10.5px] font-bold text-ink-light">
                          <span className="truncate">{stat}</span>
                          <ArrowUpRight size={13} className="text-hotpink shrink-0" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── 4. QUICK ACCESS SECTION ──────────────────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <section className="px-4 mt-5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Bookmark size={14} className="text-hotpink fill-hotpink" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-ink-light">
                    {t("quickAccess")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCustomize}
                  className="text-[11.5px] font-extrabold text-hotpink hover:underline cursor-pointer"
                >
                  {t("customize")}
                </button>
              </div>

              {quickAccessModules.length === 0 ? (
                <div className="rounded-2xl bg-card border border-dashed border-border/80 p-4 text-center">
                  <p className="text-xs font-bold text-ink-light">
                    {t("emptyQuickAccess")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {quickAccessModules.map((mod) => {
                    const Icon = mod.icon;
                    const stat = mod.getDynamicStat?.(state, isAr);
                    const isPinned = pinnedIds.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleModuleClick(mod)}
                        className="group cursor-pointer rounded-2xl bg-card border border-border/80 p-3 shadow-xs hover:border-hotpink/50 active:scale-[0.98] transition-all flex items-center gap-2.5 relative overflow-hidden"
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs group-hover:scale-105 transition-transform",
                            mod.gradient
                          )}
                        >
                          <Icon size={18} className="stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h3 className="text-[13px] font-extrabold text-ink truncate group-hover:text-hotpink transition-colors">
                              {isAr ? mod.titleAr : mod.titleEn}
                            </h3>
                            {isPinned && (
                              <Pin size={10} className="text-hotpink shrink-0 fill-hotpink" />
                            )}
                          </div>
                          <p className="text-[10px] text-ink-light font-bold truncate mt-0.5">
                            {stat || (isAr ? mod.descAr : mod.descEn)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── 5. CATEGORY SECTIONS & MODULE GRIDS ──────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="space-y-6 px-4 mt-6">
              {MORE_CATEGORIES.map((category) => {
                // Get visible modules in category
                const catModules = ALL_MORE_MODULES.filter(
                  (m) => m.categoryId === category.id && !hiddenIds.includes(m.id)
                );

                if (catModules.length === 0) return null;

                const featuredDeen = catModules.find((m) => m.id === "my-deen");
                const standardModules = catModules.filter((m) => m.id !== "my-deen");

                return (
                  <section key={category.id} className="space-y-3">
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-xs font-black uppercase tracking-wider text-ink-light flex items-center gap-2">
                        <span>{isAr ? category.titleAr : category.titleEn}</span>
                      </h2>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.2 rounded-full border",
                          category.badgeBg
                        )}
                      >
                        {catModules.length} {isAr ? "أدوات" : "tools"}
                      </span>
                    </div>

                    {/* FEATURED MY DEEN FULL-WIDTH CARD */}
                    {featuredDeen && (
                      <div
                        onClick={() => handleModuleClick(featuredDeen)}
                        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-4.5 text-white shadow-emerald-500/25 shadow-md active:scale-[0.99] transition-all border border-emerald-400/40"
                      >
                        <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-xl" />
                        <span className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-300/20 blur-xl" />

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl shadow-inner border border-white/30 group-hover:scale-105 transition-transform">
                              <Moon size={26} className="text-amber-200 fill-amber-200" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10.5px] font-black uppercase tracking-widest text-emerald-100 bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
                                  {isAr ? "الركن الإيماني 🌙" : "FAITH PILLAR 🌙"}
                                </span>
                              </div>
                              <h3 className="text-[17px] font-black text-white mt-1 truncate font-display">
                                {isAr ? featuredDeen.titleAr : featuredDeen.titleEn}
                              </h3>
                              <p className="text-[11.5px] text-emerald-100 font-medium line-clamp-1 mt-0.5">
                                {isAr ? featuredDeen.descAr : featuredDeen.descEn}
                              </p>
                            </div>
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/30 text-white group-hover:bg-white group-hover:text-emerald-700 transition-all">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>

                        {/* Wird & Athkar Banner */}
                        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-extrabold text-emerald-100">
                          <span>{isAr ? "القرآن، الأذكار، الصلوات، الصدقة والسبحة" : "Quran, Athkar, Prayers & Tasbih"}</span>
                          <span className="text-amber-200 font-black">{isAr ? "ابدئي الآن ←" : "Open Hub →"}</span>
                        </div>
                      </div>
                    )}

                    {/* Standard 2-Column Grid */}
                    {standardModules.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {standardModules.map((mod) => {
                          const Icon = mod.icon;
                          const stat = mod.getDynamicStat?.(state, isAr);
                          return (
                            <div
                              key={mod.id}
                              onClick={() => handleModuleClick(mod)}
                              className="group cursor-pointer rounded-2xl bg-card border border-border/80 p-3.5 shadow-xs hover:border-hotpink/50 active:scale-[0.99] transition-all flex flex-col justify-between space-y-2.5"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xs group-hover:scale-105 transition-transform",
                                    mod.gradient
                                  )}
                                >
                                  <Icon size={20} className="stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-[14px] font-extrabold text-ink group-hover:text-hotpink transition-colors truncate">
                                    {isAr ? mod.titleAr : mod.titleEn}
                                  </h3>
                                  <p className="text-[11px] text-ink-light font-medium line-clamp-1 mt-0.5">
                                    {isAr ? mod.descAr : mod.descEn}
                                  </p>
                                </div>
                              </div>

                              {stat && (
                                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10.5px] font-bold text-ink-light">
                                  <span className="truncate">{stat}</span>
                                  <ArrowUpRight size={13} className="text-hotpink shrink-0" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ── 6. ACCESSIBLE CUSTOMIZE MODAL / BOTTOM SHEET ─────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {customizeOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
            onClick={() => setCustomizeOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-card border-t sm:border border-border/80 shadow-2xl animate-slide-up text-ink font-sans"
            >
              {/* Modal Top Handle */}
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 shrink-0">
                <div>
                  <h3 className="text-[16px] font-black text-ink">
                    {isAr ? "تخصيص صفحة الاستكشاف ✨" : "Customize Explore Hub ✨"}
                  </h3>
                  <p className="text-[11px] font-semibold text-ink-light mt-0.5">
                    {isAr
                      ? `المثبتة (${draftPinnedIds.length}/4) • يمكنكِ إعادة الترتيب والإخفاء`
                      : `Pinned (${draftPinnedIds.length}/4) • Reorder, pin & hide modules`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomizeOpen(false)}
                  className="cursor-pointer p-1.5 rounded-full bg-surface text-ink-light hover:text-ink active:scale-90"
                  aria-label={t("cancel")}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-border/50">
                {draftOrder.map((modId, idx) => {
                  const mod = ALL_MORE_MODULES.find((m) => m.id === modId);
                  if (!mod) return null;
                  const Icon = mod.icon;
                  const isPinned = draftPinnedIds.includes(mod.id);
                  const isHidden = draftHiddenIds.includes(mod.id);
                  const canHide = mod.canBeHidden !== false;

                  return (
                    <div
                      key={mod.id}
                      className={cn(
                        "flex items-center justify-between gap-3 pt-3 first:pt-0 transition-opacity",
                        isHidden && "opacity-45"
                      )}
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-xs",
                            mod.gradient
                          )}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[13px] font-extrabold text-ink truncate">
                              {isAr ? mod.titleAr : mod.titleEn}
                            </h4>
                            {isPinned && (
                              <span className="text-[9.5px] font-black bg-pink-500/10 text-hotpink px-1.5 py-0.2 rounded-md">
                                {isAr ? "مثبت" : "Pinned"}
                              </span>
                            )}
                            {isHidden && (
                              <span className="text-[9.5px] font-black bg-zinc-500/10 text-zinc-500 px-1.5 py-0.2 rounded-md">
                                {isAr ? "مخفي" : "Hidden"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-ink-light font-medium truncate">
                            {isAr ? mod.descAr : mod.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions (Pin, Move Up/Down, Hide) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reorder Buttons */}
                        <div className="flex items-center bg-surface border border-border rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveDraftItem(idx, "up")}
                            disabled={idx === 0}
                            className="cursor-pointer p-1 text-ink-light hover:text-ink disabled:opacity-30 active:scale-90"
                            aria-label="Move Up"
                            title="Move Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDraftItem(idx, "down")}
                            disabled={idx === draftOrder.length - 1}
                            className="cursor-pointer p-1 text-ink-light hover:text-ink disabled:opacity-30 active:scale-90"
                            aria-label="Move Down"
                            title="Move Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Pin Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleDraftPin(mod.id)}
                          disabled={isHidden}
                          className={cn(
                            "cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border transition-all disabled:opacity-30",
                            isPinned
                              ? "bg-hotpink border-hotpink text-white shadow-xs"
                              : "bg-surface border-border text-ink-light hover:text-ink"
                          )}
                          aria-label={isPinned ? t("unpin") : t("pin")}
                          title={isPinned ? t("unpin") : t("pin")}
                        >
                          {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                        </button>

                        {/* Hide / Show Button */}
                        {canHide && (
                          <button
                            type="button"
                            onClick={() => handleToggleDraftHide(mod.id)}
                            className={cn(
                              "cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border transition-all",
                              isHidden
                                ? "bg-zinc-800 text-white border-zinc-700"
                                : "bg-surface border-border text-ink-light hover:text-ink"
                            )}
                            aria-label={isHidden ? t("show") : t("hide")}
                            title={isHidden ? t("show") : t("hide")}
                          >
                            {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset Confirmation Banner */}
              {showResetConfirm && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-200 dark:border-rose-900 text-center space-y-2 shrink-0 animate-fade-in">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    {t("resetConfirm")}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmReset}
                      className="cursor-pointer px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs active:scale-95"
                    >
                      {isAr ? "نعم، استعادة الافتراضي" : "Yes, Reset to Default"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-ink active:scale-95"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between gap-2 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] sm:pb-4 border-t border-border/70 bg-surface/50 rounded-b-3xl shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="cursor-pointer px-3 py-2.5 rounded-xl bg-surface border border-border text-ink-light hover:text-ink text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw size={13} />
                  <span>{t("resetDefault")}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomizeOpen(false)}
                    className="cursor-pointer px-4 py-2.5 rounded-xl bg-surface border border-border text-ink text-xs font-bold active:scale-95 transition-all"
                  >
                    {t("cancel")}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustomize}
                    className="cursor-pointer px-5 py-2.5 rounded-xl grad-theme text-white text-xs font-black shadow-rose-sm flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Check size={14} className="stroke-[3]" />
                    <span>{t("save")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </MobileShell>
  );
}
