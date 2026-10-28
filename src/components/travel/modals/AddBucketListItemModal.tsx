import React, { useState } from "react";
import { X, Globe, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import type { DesiredSeason, PriorityLevel } from "@/lib/travelEngine";

interface AddBucketListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBucketListItemModal({ isOpen, onClose }: AddBucketListItemModalProps) {
  const { state, addBucketListItem } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [destination, setDestination] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [desiredSeason, setDesiredSeason] = useState<DesiredSeason>("flexible");
  const [targetYear, setTargetYear] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [personalReason, setPersonalReason] = useState("");
  const [budgetStr, setBudgetStr] = useState("");
  const [currency, setCurrency] = useState(state.prefs?.currency || "MAD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !destination.trim()) return;
    setIsSubmitting(true);

    try {
      const budgetMinor = budgetStr ? Math.round(parseFloat(budgetStr) * 100) : undefined;
      const yearNum = targetYear ? parseInt(targetYear) : undefined;

      addBucketListItem({
        destination: destination.trim(),
        countryCode: countryCode.trim() || undefined,
        desiredSeason,
        targetYear: yearNum,
        priority,
        personalReason: personalReason.trim() || undefined,
        estimatedBudgetMinor: budgetMinor,
        currency,
        status: "active",
        order: state.bucketListItems?.length || 0,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface-cream text-ink border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <Globe size={16} className="text-hotpink" />
            <span>{t("addBucketDestination")}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-full text-ink-light hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Destination */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الوجهة أو المدينة *" : "Destination / City *"}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Amalfi Coast, Zurich, Granada"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
              required
              autoFocus
            />
          </div>

          {/* Season & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "الفصل المفضل" : "Desired Season"}
              </label>
              <select
                value={desiredSeason}
                onChange={(e) => setDesiredSeason(e.target.value as DesiredSeason)}
                className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
              >
                <option value="flexible">{isAr ? "مرن 🌈" : "Flexible 🌈"}</option>
                <option value="spring">{isAr ? "الربيع 🌸" : "Spring 🌸"}</option>
                <option value="summer">{isAr ? "الصيف ☀️" : "Summer ☀️"}</option>
                <option value="autumn">{isAr ? "الخريف 🍂" : "Autumn 🍂"}</option>
                <option value="winter">{isAr ? "الشتاء ❄️" : "Winter ❄️"}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-light block mb-1">
                {isAr ? "السنة المستهدفة" : "Target Year"}
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                placeholder="2027"
                min="2025"
                max="2035"
                className="w-full rounded-2xl bg-surface px-3 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الأولوية" : "Priority"}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full rounded-2xl bg-surface px-4 py-2 text-xs font-bold text-ink outline-none border border-border focus:border-hotpink"
            >
              <option value="high">{isAr ? "أولوية عالية ⭐" : "High Priority ⭐"}</option>
              <option value="medium">{isAr ? "متوسطة" : "Medium"}</option>
              <option value="low">{isAr ? "هادئة / في أي وقت" : "Low / Someday"}</option>
            </select>
          </div>

          {/* Personal Reason */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "لماذا تحبين زيارة هذه الوجهة؟" : "Why do you want to visit?"}
            </label>
            <input
              type="text"
              value={personalReason}
              onChange={(e) => setPersonalReason(e.target.value)}
              placeholder={isAr ? "مثال: هدوء الطبيعة، تجربة طعام جديدة..." : "Peaceful sunsets, historic streets..."}
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs font-bold text-ink-light block mb-1">
              {isAr ? "الميزانية التقريبية (اختياري)" : "Approximate Budget (Optional)"}
            </label>
            <input
              type="number"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              placeholder="10000"
              className="w-full rounded-2xl bg-surface px-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !destination.trim()}
              className="cursor-pointer w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isAr ? "إضافة إلى قائمة الأمنيات ✨" : "Add to Bucket List ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
