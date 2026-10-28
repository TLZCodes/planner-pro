import React, { useState } from "react";
import {
  Clock,
  Sparkles,
  Plus,
  Play,
  Check,
  Compass,
  Repeat,
  Info,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import {
  CURATED_CARE_IDEAS,
  CARE_CATEGORIES,
  filterCareIdeas,
  type SelfCareIdea,
  type CareCategory,
} from "@/lib/selfCareEngine";
import { cn } from "@/lib/utils";

interface IdeasLibraryTabProps {
  initialNeedFilter?: string;
  onStartNowIdea: (idea: SelfCareIdea) => void;
  onAddIdeaForToday: (idea: SelfCareIdea) => void;
  onMakeRecurring: (idea: SelfCareIdea) => void;
}

export const IdeasLibraryTab: React.FC<IdeasLibraryTabProps> = ({
  initialNeedFilter,
  onStartNowIdea,
  onAddIdeaForToday,
  onMakeRecurring,
}) => {
  const { t, lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const [selectedNeed, setSelectedNeed] = useState<string>(initialNeedFilter || "all");
  const [selectedTime, setSelectedTime] = useState<"5m" | "15m" | "30m" | "any">("any");
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | "all">("all");
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const availableNeeds: { key: string; label: string; icon: string }[] = [
    { key: "all", label: isAr ? "الكل" : "All Needs", icon: "✨" },
    { key: "rest", label: t("needRest") || (isAr ? "الراحة" : "Rest"), icon: "🌙" },
    { key: "calm", label: t("needCalm") || (isAr ? "الهدوء" : "Calm"), icon: "🕊️" },
    { key: "movement", label: t("needMovement") || (isAr ? "الحركة" : "Movement"), icon: "🤸‍♀️" },
    { key: "hydration", label: t("needHydration") || (isAr ? "شرب الماء" : "Hydration"), icon: "💧" },
    { key: "fresh_air", label: t("needFreshAir") || (isAr ? "الهواء الطلق" : "Fresh air"), icon: "🌿" },
    { key: "joy", label: t("needJoy") || (isAr ? "الفرح" : "Joy"), icon: "🌸" },
    { key: "connection", label: t("needConnection") || (isAr ? "التواصل" : "Connection"), icon: "💬" },
    { key: "spiritual", label: t("needSpiritual") || (isAr ? "وقفة إيمانية" : "Spiritual pause"), icon: "🤲" },
  ];

  const filteredIdeas = filterCareIdeas(
    CURATED_CARE_IDEAS,
    selectedNeed === "all" ? [] : [selectedNeed],
    selectedTime,
    selectedCategory
  );

  const handleAddForToday = (idea: SelfCareIdea) => {
    onAddIdeaForToday(idea);
    setAddedIds((prev) => [...prev, idea.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== idea.id));
    }, 2000);
  };

  return (
    <div className="space-y-4 px-4 pt-2 pb-28 animate-fade-in">
      {/* Needs Filter Bar */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-light px-1">
          {isAr ? "حسب ما تحتاجينه الآن" : "Filter by Need"}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {availableNeeds.map((need) => (
            <button
              key={need.key}
              onClick={() => setSelectedNeed(need.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5",
                selectedNeed === need.key
                  ? "bg-hotpink text-white border-hotpink shadow-sm font-bold"
                  : "bg-card border-border/60 text-ink-light hover:text-ink"
              )}
            >
              <span>{need.icon}</span>
              <span>{need.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time & Category Filter Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedTime("any")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[11px] border",
              selectedTime === "any"
                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 font-bold"
                : "bg-surface border-border/40 text-ink-light"
            )}
          >
            {isAr ? "أي وقت" : "Any Time"}
          </button>
          <button
            onClick={() => setSelectedTime("5m")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[11px] border",
              selectedTime === "5m"
                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 font-bold"
                : "bg-surface border-border/40 text-ink-light"
            )}
          >
            ≤ 5 {isAr ? "دقائق" : "min"}
          </button>
          <button
            onClick={() => setSelectedTime("15m")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[11px] border",
              selectedTime === "15m"
                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 font-bold"
                : "bg-surface border-border/40 text-ink-light"
            )}
          >
            ≤ 15 {isAr ? "دقيقة" : "min"}
          </button>
          <button
            onClick={() => setSelectedTime("30m")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[11px] border",
              selectedTime === "30m"
                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 font-bold"
                : "bg-surface border-border/40 text-ink-light"
            )}
          >
            15-30+ {isAr ? "دقيقة" : "min"}
          </button>
        </div>
      </div>

      {/* Ideas Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredIdeas.map((idea) => {
          const isAdded = addedIds.includes(idea.id);
          const cat = CARE_CATEGORIES.find((c) => c.key === idea.category);

          return (
            <div
              key={idea.id}
              className="p-4 rounded-3xl bg-card border border-border/70 shadow-rose-sm flex flex-col justify-between space-y-3 hover:border-pink-300/60 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-2xl bg-surface border border-border/40">
                    {idea.icon}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-light font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{idea.durationMinutes} {isAr ? "د" : "min"}</span>
                    </span>
                    <span>•</span>
                    <span>{isAr ? cat?.labelAr : cat?.labelEn}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-ink leading-snug">
                  {isAr ? idea.titleAr : idea.titleEn}
                </h4>
                <p className="text-xs text-ink-light leading-relaxed">
                  {isAr ? idea.descriptionAr : idea.descriptionEn}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onStartNowIdea(idea)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Play size={12} fill="currentColor" />
                  <span>{isAr ? "ابدئي الآن" : "Do now"}</span>
                </button>

                <button
                  onClick={() => handleAddForToday(idea)}
                  className={cn(
                    "flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1",
                    isAdded
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-surface border border-border/60 text-ink hover:bg-ghost"
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} strokeWidth={3} />
                      <span>{isAr ? "أُضيفت ✓" : "Added ✓"}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>{isAr ? "لليوم" : "For Today"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onMakeRecurring(idea)}
                  className="p-1.5 rounded-xl text-ink-light hover:text-ink hover:bg-surface border border-border/40 transition-all"
                  title={isAr ? "جعلها متكررة" : "Make recurring"}
                  aria-label="Make recurring"
                >
                  <Repeat size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
