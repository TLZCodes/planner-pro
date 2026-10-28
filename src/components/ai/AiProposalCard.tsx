import React from "react";
import { Sparkles, Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { type AiProposal } from "@/lib/aiPlannerEngine";

interface AiProposalCardProps {
  proposals: AiProposal[];
  onReview: () => void;
  isApplied?: boolean;
}

export function AiProposalCard({
  proposals,
  onReview,
  isApplied,
}: AiProposalCardProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  if (!proposals || proposals.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-pink-200/90 dark:border-pink-900/60 bg-gradient-to-br from-pink-50/60 via-card to-pink-50/30 dark:from-pink-950/30 dark:to-card p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-hotpink">
          <Sparkles size={14} />
          {isAr
            ? `مقترح خطة قابلة للإضافة (${proposals.length} عناصر)`
            : `Actionable Plan Ready (${proposals.length} items)`}
        </span>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
          0 XP
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        {proposals.slice(0, 4).map((p, idx) => (
          <div
            key={p.id || idx}
            className="flex items-center justify-between gap-2 rounded-xl bg-card/80 px-2.5 py-1.5 border border-border/50 text-ink"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs">
                {p.destination === "routines"
                  ? "🌸"
                  : p.destination === "goals"
                  ? "🎯"
                  : p.destination === "learning"
                  ? "📚"
                  : "📋"}
              </span>
              <span className="font-semibold truncate">{p.title}</span>
            </div>

            {p.clockTime && (
              <span className="text-[10px] text-ink-light shrink-0 font-mono">
                {p.clockTime}
              </span>
            )}
          </div>
        ))}
        {proposals.length > 4 && (
          <p className="text-[11px] text-center text-ink-light">
            {isAr
              ? `+ ${proposals.length - 4} عناصر أخرى...`
              : `+ ${proposals.length - 4} more items...`}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onReview}
        className="w-full grad-theme flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-white shadow-rose active:scale-95 transition-transform cursor-pointer"
      >
        <span>
          {isApplied
            ? (isAr ? "مراجعة العناصر المحفوظة 📋" : "View Saved Items 📋")
            : (isAr ? "مراجعة الخطة وإضافتها (0 XP) ✨" : "Review & Add to Planner (0 XP) ✨")}
        </span>
        {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
      </button>
    </div>
  );
}
