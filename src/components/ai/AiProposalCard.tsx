import React, { useState } from "react";
import { Sparkles, Check, Zap, Sliders } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type AiProposal, applyProposalToStore } from "@/lib/aiPlannerEngine";

interface AiProposalCardProps {
  proposals: AiProposal[];
  onReview: () => void;
  isApplied?: boolean;
}

const DEST_ICONS: Record<string, string> = {
  tasks: "📋",
  habits: "🌸",
  routines: "✨",
  goals: "🎯",
  learning: "📚",
  wellness: "💧",
  deen: "🕌",
  journal: "🤍",
  finance: "💳",
  inbox: "💭",
  travel: "✈️",
  business: "💼",
};

export function AiProposalCard({
  proposals,
  onReview,
  isApplied: externalApplied,
}: AiProposalCardProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const appActions = useApp();
  const [instantApplied, setInstantApplied] = useState(Boolean(externalApplied));
  const [appliedCount, setAppliedCount] = useState(0);

  if (!proposals || proposals.length === 0) return null;

  const handleInstantApplyAll = () => {
    if (instantApplied) return;
    const appliedSet = new Set<string>();
    let count = 0;
    for (const p of proposals) {
      const res = applyProposalToStore(p, appActions as any, appliedSet, appActions.state);
      if (res.success) count++;
    }
    setAppliedCount(count);
    setInstantApplied(true);
  };

  return (
    <div className="mt-3.5 rounded-2xl border border-pink-300/70 dark:border-pink-800/60 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-fuchsia-500/10 p-3.5 shadow-rose-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-hotpink">
          <Sparkles size={14} />
          {isAr
            ? `إجراءات جاهزة للتنفيذ في تطبيقكِ (${proposals.length})`
            : `Omni-App Actions Ready (${proposals.length})`}
        </span>
        <span className="text-[10px] font-extrabold text-hotpink bg-pink-500/15 px-2.5 py-0.5 rounded-full">
          {instantApplied
            ? isAr
              ? `تم التنفيذ (${appliedCount || proposals.length}) ✓`
              : `Executed (${appliedCount || proposals.length}) ✓`
            : isAr
              ? "تحكم ذكي ✨"
              : "Smart Sync ✨"}
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        {proposals.slice(0, 5).map((p, idx) => (
          <div
            key={p.id || idx}
            className="flex items-center justify-between gap-2 rounded-xl bg-card/90 px-3 py-2 border border-pink-200/50 dark:border-pink-900/40 text-ink"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm shrink-0">
                {p.emoji || DEST_ICONS[p.destination] || "🌸"}
              </span>
              <span className="font-bold truncate">{p.title}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {p.amount !== undefined && (
                <span className="text-[10px] font-bold text-hotpink bg-pink-500/10 px-2 py-0.5 rounded-full">
                  {p.amount}
                </span>
              )}
              {p.clockTime && (
                <span className="text-[10px] text-ink-light font-mono">
                  {p.clockTime}
                </span>
              )}
            </div>
          </div>
        ))}
        {proposals.length > 5 && (
          <p className="text-[11px] text-center text-ink-light font-medium">
            {isAr
              ? `+ ${proposals.length - 5} إجراءات إضافية...`
              : `+ ${proposals.length - 5} more actions...`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {instantApplied ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 py-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
            <Check size={14} />
            <span>
              {isAr
                ? "تم تطبيق الإجراءات في مخططكِ بنجاح ♡"
                : "Applied directly to your planner ♡"}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstantApplyAll}
            className="flex-1 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-rose hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Zap size={13} fill="currentColor" />
            <span>
              {isAr ? "تنفيذ فوري في التطبيق ⚡" : "Apply All Now ⚡"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onReview}
          className="flex items-center justify-center gap-1 rounded-xl border border-pink-300/60 dark:border-pink-800/50 bg-card px-3 py-2.5 text-xs font-bold text-ink hover:border-hotpink hover:text-hotpink active:scale-95 transition-all cursor-pointer shrink-0"
          title={isAr ? "مراجعة وتعديل التفاصيل" : "Customize & Review"}
        >
          <Sliders size={13} />
          <span>{isAr ? "تخصيص" : "Edit"}</span>
        </button>
      </div>
    </div>
  );
}
