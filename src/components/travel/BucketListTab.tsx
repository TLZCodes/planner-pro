import React, { useState } from "react";
import {
  Globe,
  Plus,
  PlaneTakeoff,
  Trash2,
  Calendar,
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { BucketListItem, DesiredSeason, PriorityLevel } from "@/lib/travelEngine";

interface BucketListTabProps {
  onOpenAddModal: () => void;
  onConvertItem: (item: BucketListItem) => void;
}

export function BucketListTab({ onOpenAddModal, onConvertItem }: BucketListTabProps) {
  const { state, deleteBucketListItem } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const bucketItems = state.bucketListItems || [];
  const currency = state.prefs?.currency || "MAD";

  const getSeasonLabel = (season: DesiredSeason) => {
    switch (season) {
      case "spring":
        return isAr ? "الربيع 🌸" : "Spring 🌸";
      case "summer":
        return isAr ? "الصيف ☀️" : "Summer ☀️";
      case "autumn":
        return isAr ? "الخريف 🍂" : "Autumn 🍂";
      case "winter":
        return isAr ? "الشتاء ❄️" : "Winter ❄️";
      default:
        return isAr ? "مرن 🌈" : "Flexible 🌈";
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
      case "medium":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-surface text-ink-light border-border";
    }
  };

  return (
    <div className="px-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
          <Globe size={16} className="text-hotpink" />
          <span>{t("bucketList")}</span>
        </h3>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-hotpink/10 border border-hotpink/30 px-3.5 py-1.5 text-xs font-bold text-hotpink active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>{t("addBucketDestination")}</span>
        </button>
      </div>

      {bucketItems.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-3 shadow-xs">
          <Globe size={36} className="mx-auto text-ink-light/50" />
          <h4 className="text-sm font-bold text-ink">{t("noBucketListTitle")}</h4>
          <p className="text-xs text-ink-light max-w-xs mx-auto">{t("noBucketListSubtitle")}</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95"
          >
            <Plus size={14} />
            <span>{t("addBucketDestination")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bucketItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3"
            >
              {/* Top info row */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-ink flex items-center gap-1.5">
                    <MapPin size={14} className="text-hotpink" />
                    <span>{item.destination}</span>
                  </h4>
                  {item.personalReason && (
                    <p className="text-xs text-ink-light mt-1 italic leading-relaxed">
                      "{item.personalReason}"
                    </p>
                  )}
                </div>

                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize",
                    getPriorityBadge(item.priority)
                  )}
                >
                  {item.priority}
                </span>
              </div>

              {/* Tags & meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-light pt-1 border-t border-border/40">
                <span className="rounded-full bg-surface px-2.5 py-1 border border-border text-[11px]">
                  {getSeasonLabel(item.desiredSeason)}
                </span>
                {item.targetYear && (
                  <span className="rounded-full bg-surface px-2.5 py-1 border border-border text-[11px]">
                    🗓️ {item.targetYear}
                  </span>
                )}
                {item.estimatedBudgetMinor ? (
                  <span className="rounded-full bg-surface px-2.5 py-1 border border-border text-[11px] font-bold text-ink">
                    💰 {(item.estimatedBudgetMinor / 100).toLocaleString()} {item.currency || currency}
                  </span>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => deleteBucketListItem(item.id)}
                  className="cursor-pointer text-ink-light/70 hover:text-rose-500 p-1.5 rounded-xl transition-colors"
                  title={isAr ? "حذف الوجهة" : "Delete destination"}
                >
                  <Trash2 size={15} />
                </button>

                {item.status === "converted" ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    ✓ {isAr ? "تم تحويلها إلى رحلة" : "Converted to Trip"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConvertItem(item)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
                  >
                    <PlaneTakeoff size={14} />
                    <span>{t("turnIntoTripBtn")}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
