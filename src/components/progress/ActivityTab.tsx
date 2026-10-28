import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowUpRight,
  Filter,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  Target,
  BookHeart,
  Heart,
  Flame,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type XPEvent, getPrivacySafeLabel } from "@/lib/progressionEngine";
import { cn } from "@/lib/utils";

type LedgerFilter =
  | "all"
  | "earned"
  | "reversed"
  | "task"
  | "habit"
  | "routine"
  | "focus"
  | "learning"
  | "goal"
  | "journal"
  | "selfcare"
  | "challenge";

const PAGE_SIZE = 25;

export function ActivityTab() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { state } = useApp();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<LedgerFilter>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const filters: { id: LedgerFilter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "earned", label: t("filterEarned") },
    { id: "reversed", label: t("filterReversed") },
    { id: "task", label: isAr ? "المهام" : "Tasks" },
    { id: "habit", label: isAr ? "العادات" : "Habits" },
    { id: "routine", label: isAr ? "الروتين" : "Routines" },
    { id: "focus", label: isAr ? "التركيز" : "Focus" },
    { id: "learning", label: isAr ? "التعلم" : "Learning" },
    { id: "goal", label: isAr ? "الأهداف" : "Goals" },
    { id: "journal", label: isAr ? "المفكرة" : "Journal" },
    { id: "selfcare", label: isAr ? "العناية" : "Self-Care" },
    { id: "challenge", label: isAr ? "التحديات" : "Challenges" },
  ];

  // Filter and sort ledger
  const filteredEvents = useMemo(() => {
    const raw = [...(state.xpLedger || [])].reverse();

    return raw.filter((item) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "earned") return item.state === "active";
      if (activeFilter === "reversed") return item.state === "reversed";
      if (activeFilter === "task") return item.sourceType === "task";
      if (activeFilter === "habit") return item.sourceType === "habit";
      if (activeFilter === "routine") return item.sourceType.startsWith("routine");
      if (activeFilter === "focus") return item.sourceType === "focus";
      if (activeFilter === "learning")
        return item.sourceType === "learning" || item.sourceType === "flashcard" || item.sourceType === "study";
      if (activeFilter === "goal") return item.sourceType === "goal";
      if (activeFilter === "journal") return item.sourceType === "journal" || item.sourceType === "mood";
      if (activeFilter === "selfcare")
        return item.sourceType === "selfcare" || item.sourceType === "care";
      if (activeFilter === "challenge") return item.sourceType === "challenge";
      return true;
    });
  }, [state.xpLedger, activeFilter]);

  const pagedEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  const hasMore = visibleCount < filteredEvents.length;

  const handleSourceNav = (sourceType: string) => {
    switch (sourceType) {
      case "task":
        navigate({ to: "/tasks" });
        break;
      case "habit":
        navigate({ to: "/habits" });
        break;
      case "routine":
      case "routine_step":
        navigate({ to: "/routines" });
        break;
      case "focus":
        navigate({ to: "/focus" });
        break;
      case "learning":
      case "flashcard":
      case "study":
        navigate({ to: "/learning" });
        break;
      case "goal":
        navigate({ to: "/goals" });
        break;
      case "journal":
        navigate({ to: "/journal" });
        break;
      case "mood":
        navigate({ to: "/year-in-pixels" });
        break;
      case "selfcare":
      case "care":
        navigate({ to: "/selfcare", search: {} } as any);
        break;
      case "challenge":
        navigate({ to: "/challenges" });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setActiveFilter(f.id);
                setVisibleCount(PAGE_SIZE);
              }}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-3 py-1 text-[11.5px] font-extrabold border transition-all active:scale-95",
                isActive
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface text-ink-light hover:text-ink border-border/70"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Ledger Entries List */}
      {pagedEvents.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/70 p-8 text-center space-y-2 shadow-rose-sm">
          <span className="text-3xl">🌱</span>
          <h3 className="text-[14px] font-bold text-ink">{t("emptyLedgerTitle")}</h3>
          <p className="text-[12px] text-ink-light max-w-xs mx-auto">
            {t("emptyLedgerDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pagedEvents.map((event) => {
            const isReversed = event.state === "reversed";
            const dateStr = event.localDate || event.createdAt.slice(0, 10);
            const label = getPrivacySafeLabel(event, isAr);

            return (
              <div
                key={event.id}
                className={cn(
                  "rounded-2xl border p-3 flex items-center justify-between gap-3 transition-all shadow-2xs",
                  isReversed
                    ? "bg-ghost/40 border-border/40 opacity-70"
                    : "bg-card border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-inner",
                      isReversed
                        ? "bg-stone-500/10 text-stone-500"
                        : "bg-hotpink/10 text-hotpink"
                    )}
                  >
                    {isReversed ? (
                      <RotateCcw size={15} />
                    ) : (
                      <Sparkles size={15} className="text-amber-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className={cn(
                          "text-[12.5px] font-bold text-ink truncate",
                          isReversed && "line-through text-ink-light"
                        )}
                      >
                        {label}
                      </p>
                      {isReversed && (
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-stone-500/10 text-stone-600">
                          {isAr ? "تم التراجع" : "Reversed"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-ink-light mt-0.5">
                      {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "font-mono text-[13.5px] font-black tracking-tight",
                      isReversed ? "text-stone-400 line-through" : "text-hotpink"
                    )}
                  >
                    {isReversed ? `+${event.amount}` : `+${event.amount} XP`}
                  </span>

                  {event.sourceType !== "opening_balance" && !isReversed && (
                    <button
                      type="button"
                      onClick={() => handleSourceNav(event.sourceType)}
                      className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-full bg-surface border border-border/70 text-ink-light hover:text-ink hover:bg-card active:scale-90 transition-all"
                      title={isAr ? "فتح المصدر" : "Open Source"}
                      aria-label={isAr ? "فتح المصدر" : "Open Source"}
                    >
                      <ArrowUpRight size={13} className="rtl:-rotate-90" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="cursor-pointer px-5 py-2.5 rounded-full bg-card border border-border/80 text-[12px] font-black text-ink hover:bg-surface active:scale-95 transition-all shadow-xs"
          >
            {isAr ? "تحميل المزيد من الأنشطة" : "Load More Activity"}
          </button>
        </div>
      )}
    </div>
  );
}
