import React, { useState } from "react";
import { ChevronDown, ChevronUp, Palette } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  CANONICAL_MOODS,
  type MoodPalette,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface MoodLegendProps {
  palette: MoodPalette;
}

export const MoodLegend: React.FC<MoodLegendProps> = ({ palette }) => {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="px-4">
      <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-rose-sm">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-ink"
        >
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-pink-500" />
            <span>{t("moodLegendTitle") || (isAr ? "دليل ألوان المشاعر" : "Mood Legend")}</span>
            <span className="text-[11px] font-normal text-ink-light">({palette.nameEn})</span>
          </div>

          <div className="flex items-center gap-1 text-ink-light">
            <span className="text-[11px] font-medium">{isExpanded ? (isAr ? "طي" : "Less") : (isAr ? "عرض" : "More")}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {/* Compact preview row when collapsed */}
        {!isExpanded && (
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pt-2">
            {CANONICAL_MOODS.map((m) => {
              const color = palette.moodColors[m.id] || m.defaultColor;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-1 text-[11px] font-medium text-ink flex-shrink-0"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span>{m.emoji}</span>
                  <span className="text-[10px] text-ink-light">{isAr ? m.labelAr : m.labelEn}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Expanded Details Grid */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-border/40 mt-2">
            {CANONICAL_MOODS.map((m) => {
              const color = palette.moodColors[m.id] || m.defaultColor;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border/40"
                >
                  <div
                    className="w-6 h-6 rounded-lg shadow-sm flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <span>{m.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink block leading-tight">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                    <span className="text-[10px] text-ink-light leading-snug line-clamp-1">
                      {isAr ? m.descriptionAr : m.descriptionEn}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
