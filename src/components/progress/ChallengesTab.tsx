import React, { useState, useMemo } from "react";
import { Check, Sparkles, Trophy, Flame, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CHALLENGES, type Challenge } from "@/lib/gamification";
import { cn } from "@/lib/utils";

type ChallengeFilter = "all" | "active" | "completed" | "available";

export function ChallengesTab() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { state, addXP } = useApp();

  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>("all");

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Determine completed challenge IDs from active ledger entries
  const completedChallengeIds = useMemo(() => {
    const set = new Set<string>();
    for (const item of state.xpLedger || []) {
      if (item.sourceType === "challenge" && item.state === "active") {
        set.add(item.sourceId);
      }
    }
    return set;
  }, [state.xpLedger]);

  const handleCompleteChallenge = (ch: Challenge) => {
    if (completedChallengeIds.has(ch.id)) return;
    addXP(
      "challenge",
      ch.id,
      ch.xpReward,
      todayStr,
      "complete",
      `Completed challenge: ${ch.title}`,
      `إنجاز التحدي: ${ch.titleAr}`
    );
  };

  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((ch) => {
      const isDone = completedChallengeIds.has(ch.id);
      if (activeFilter === "all") return true;
      if (activeFilter === "completed") return isDone;
      if (activeFilter === "active" || activeFilter === "available") return !isDone;
      return true;
    });
  }, [activeFilter, completedChallengeIds]);

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(["all", "active", "completed"] as ChallengeFilter[]).map((f) => {
          const isActive = activeFilter === f;
          const label =
            f === "all"
              ? t("filterAll")
              : f === "active"
              ? t("filterActive")
              : t("filterCompleted");
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-4 py-1 text-[12px] font-black border transition-all active:scale-95",
                isActive
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-surface text-ink-light hover:text-ink border-border/70"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Challenges List */}
      {filteredChallenges.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/70 p-8 text-center space-y-2 shadow-rose-sm">
          <span className="text-3xl">✨</span>
          <h3 className="text-[14px] font-bold text-ink">{t("emptyChallengesTitle")}</h3>
          <p className="text-[12px] text-ink-light max-w-xs mx-auto">
            {t("emptyChallengesDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((ch) => {
            const isDone = completedChallengeIds.has(ch.id);

            return (
              <div
                key={ch.id}
                className={cn(
                  "rounded-3xl border p-4 flex items-center justify-between gap-3.5 transition-all shadow-rose-xs",
                  isDone
                    ? "bg-card/70 border-emerald-500/30"
                    : "bg-card border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner border",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-surface border-border/70"
                    )}
                  >
                    {ch.emoji}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[13.5px] font-black text-ink truncate">
                        {isAr ? ch.titleAr : ch.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface border border-border/70 text-ink-light">
                        {ch.type === "daily" ? (isAr ? "يومي" : "Daily") : (isAr ? "أسبوعي" : "Weekly")}
                      </span>
                    </div>

                    <p className="text-[11.5px] font-medium text-ink-light line-clamp-2">
                      {isAr ? ch.descriptionAr : ch.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-[13px] font-black text-amber-500">
                    +{ch.xpReward} XP
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCompleteChallenge(ch)}
                    disabled={isDone}
                    className={cn(
                      "cursor-pointer flex h-9.5 w-9.5 items-center justify-center rounded-full border transition-all active:scale-90 text-sm font-black shadow-xs",
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                        : "bg-surface border-hotpink/80 text-hotpink hover:bg-hotpink hover:text-white"
                    )}
                    aria-label={isDone ? (isAr ? "مكتمل" : "Completed") : (isAr ? "إكمال التحدي" : "Complete Challenge")}
                  >
                    {isDone ? <Check size={16} /> : "○"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
