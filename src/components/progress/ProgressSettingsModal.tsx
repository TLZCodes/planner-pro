import React from "react";
import { X, Check, Shield, Heart, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { type UserProgressSettings, DEFAULT_PROGRESS_SETTINGS } from "@/lib/progressionEngine";
import { cn } from "@/lib/utils";

interface ProgressSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProgressSettingsModal({ open, onClose }: ProgressSettingsModalProps) {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { state, updateUserProgressSettings } = useApp();

  if (!open) return null;

  const currentSettings: UserProgressSettings = {
    ...DEFAULT_PROGRESS_SETTINGS,
    ...(state.userProgressSettings || {}),
  };

  const handleToggle = (key: keyof UserProgressSettings) => {
    updateUserProgressSettings({
      [key]: !currentSettings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/80 p-5 space-y-4.5 shadow-rose-md max-h-[85vh] overflow-y-auto overscroll-contain no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-hotpink">
              ⚙️
            </span>
            <h3 className="text-[15.5px] font-black text-ink">
              {t("progressSettingsTitle")}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface hover:bg-card border border-border text-ink-light hover:text-ink active:scale-95 transition-all"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X size={16} />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {/* Show XP */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-border/60">
            <div>
              <p className="text-[13px] font-bold text-ink">{t("showXpToggle")}</p>
              <p className="text-[11px] text-ink-light">
                {isAr ? "إظهار أو إخفاء رقم النقاط الإجمالي" : "Show or hide numerical XP values"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("showXp")}
              className={cn(
                "cursor-pointer w-12 h-6 rounded-full transition-colors relative p-0.5",
                currentSettings.showXp ? "bg-hotpink" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform shadow-xs",
                  currentSettings.showXp ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Show Numeric Level */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-border/60">
            <div>
              <p className="text-[13px] font-bold text-ink">{t("showLevelToggle")}</p>
              <p className="text-[11px] text-ink-light">
                {isAr ? "المستوى الرقمي المتقدم (كل 250 نقطة)" : "Advancing number (every 250 XP)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("showLevel")}
              className={cn(
                "cursor-pointer w-12 h-6 rounded-full transition-colors relative p-0.5",
                currentSettings.showLevel ? "bg-hotpink" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform shadow-xs",
                  currentSettings.showLevel ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Show Growth Tier */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-border/60">
            <div>
              <p className="text-[13px] font-bold text-ink">{t("showTierToggle")}</p>
              <p className="text-[11px] text-ink-light">
                {isAr ? "الرتبة التقديرية (مبتدئة، باحثة، متقنة…)" : "Named ranks (Beginner, Scholar, Master…)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("showTier")}
              className={cn(
                "cursor-pointer w-12 h-6 rounded-full transition-colors relative p-0.5",
                currentSettings.showTier ? "bg-hotpink" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform shadow-xs",
                  currentSettings.showTier ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Reduced Gamification */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-border/60">
            <div>
              <p className="text-[13px] font-bold text-ink">{t("reducedGamificationToggle")}</p>
              <p className="text-[11px] text-ink-light">
                {isAr ? "التركيز على الإنجاز اللطيف بدون أشرطة رقمية" : "Calm milestones without numerical pressure"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("reducedGamification")}
              className={cn(
                "cursor-pointer w-12 h-6 rounded-full transition-colors relative p-0.5",
                currentSettings.reducedGamification ? "bg-hotpink" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform shadow-xs",
                  currentSettings.reducedGamification ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Show Faith Category */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/70 border border-border/60">
            <div>
              <p className="text-[13px] font-bold text-ink">{isAr ? "إظهار الجانب الروحي" : "Show Faith Area"}</p>
              <p className="text-[11px] text-ink-light">
                {isAr ? "عرض بطاقة ملخص العبادات الخاصة" : "Display spiritual consistency area"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("showFaithCategory")}
              className={cn(
                "cursor-pointer w-12 h-6 rounded-full transition-colors relative p-0.5",
                currentSettings.showFaithCategory ? "bg-hotpink" : "bg-stone-300"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform shadow-xs",
                  currentSettings.showFaithCategory ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Privacy & Spiritual Ethical Guarantees */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-2.5">
            <Shield size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
              {t("privacyPromiseText")}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5">
            <Heart size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
              {t("faithSafeText")}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full py-2.5 rounded-xl grad-theme text-white text-xs font-black shadow-rose-xs active:scale-95 transition-all"
          >
            {isAr ? "حفظ وإغلاق" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
