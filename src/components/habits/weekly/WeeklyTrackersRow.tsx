import React from "react";
import { Droplet, Smile, Zap, Star } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { DailyMoodRecord, DailyHydrationRecord } from "../../../lib/store";
import {
  type WeekInfo,
  type HabitWeekDensity,
  getWaterStatusForDate,
  getMoodStatusForDate,
} from "../../../lib/weeklyHabitEngine";

interface WeeklyTrackersRowProps {
  weekInfo: WeekInfo;
  dailyHydration?: Record<string, DailyHydrationRecord>;
  dailyMoods?: Record<string, DailyMoodRecord>;
  showWater?: boolean;
  showMood?: boolean;
  showEnergy?: boolean;
  showDayRating?: boolean;
  density?: HabitWeekDensity;
  isAr: boolean;
}

export const WeeklyTrackersRow: React.FC<WeeklyTrackersRowProps> = ({
  weekInfo,
  dailyHydration = {},
  dailyMoods = {},
  showWater = true,
  showMood = true,
  showEnergy = true,
  showDayRating = true,
  density = "comfortable",
  isAr,
}) => {
  const hasAnyTracker = showWater || showMood || showEnergy || showDayRating;
  if (!hasAnyTracker) return null;

  const isCompact = density === "compact";

  return (
    <div className="overflow-hidden rounded-3xl bg-card border border-pink-200/60 dark:border-pink-900/40 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-start min-w-[580px]">
          <thead>
            <tr className="border-b border-pink-100 dark:border-pink-950/60 bg-pink-50/40 dark:bg-pink-950/20">
              <th
                colSpan={8}
                className="py-2 px-3 text-start text-[11px] font-extrabold text-pink-700 dark:text-pink-300"
              >
                <span>{isAr ? "سجلات العافية والانسجام (متزامنة تلقائياً 🌿)" : "Wellness & Mood Rhythms (Synced Across Modules 🌿)"}</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pink-100/50 dark:divide-pink-950/40 text-[11px]">
            {/* ── 1. Water Intake Row ── */}
            {showWater && (
              <tr className="hover:bg-cyan-50/30 dark:hover:bg-cyan-950/10 transition-colors">
                <td
                  className={cn(
                    "sticky start-0 z-10 bg-card/95 backdrop-blur-xs py-2 px-3 border-e border-pink-100 dark:border-pink-950/60 font-bold text-ink",
                    isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                    <Droplet className="h-3.5 w-3.5 fill-cyan-500/20 shrink-0" />
                    <span className="truncate">{isAr ? "شرب الماء" : "Hydration"}</span>
                  </div>
                </td>

                {weekInfo.days.map((day) => {
                  const water = getWaterStatusForDate(day.dateStr, dailyHydration);
                  const hasData = water.consumedMl > 0;

                  return (
                    <td
                      key={day.dateStr}
                      className={cn(
                        "py-1.5 px-1 text-center",
                        day.isToday && "bg-cyan-50/20 dark:bg-cyan-950/15"
                      )}
                    >
                      {hasData ? (
                        <div
                          className={cn(
                            "mx-auto rounded-xl flex flex-col items-center justify-center p-1 border transition-all",
                            water.isMet
                              ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300"
                              : "bg-surface border-border/70 text-ink"
                          )}
                          title={`${water.consumedMl} / ${water.targetMl} ml`}
                        >
                          <span className="text-[10px] font-extrabold">{water.percentage}%</span>
                          <span className="text-[9px] text-ink-light opacity-75 truncate max-w-[45px]">
                            {water.consumedMl}ml
                          </span>
                        </div>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* ── 2. Mood Rhythm Row ── */}
            {showMood && (
              <tr className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors">
                <td
                  className={cn(
                    "sticky start-0 z-10 bg-card/95 backdrop-blur-xs py-2 px-3 border-e border-pink-100 dark:border-pink-950/60 font-bold text-ink",
                    isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <Smile className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{isAr ? "شعور اليوم" : "Daily Mood"}</span>
                  </div>
                </td>

                {weekInfo.days.map((day) => {
                  const moodInfo = getMoodStatusForDate(day.dateStr, dailyMoods);

                  return (
                    <td
                      key={day.dateStr}
                      className={cn(
                        "py-1.5 px-1 text-center",
                        day.isToday && "bg-rose-50/20 dark:bg-rose-950/15"
                      )}
                    >
                      {moodInfo.hasRecord ? (
                        <span
                          className="text-base inline-block hover:scale-110 transition-transform cursor-default select-none"
                          title={moodInfo.mood}
                        >
                          {moodInfo.emoji}
                        </span>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* ── 3. Energy Level Row ── */}
            {showEnergy && (
              <tr className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                <td
                  className={cn(
                    "sticky start-0 z-10 bg-card/95 backdrop-blur-xs py-2 px-3 border-e border-pink-100 dark:border-pink-950/60 font-bold text-ink",
                    isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Zap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{isAr ? "مستوى الطاقة" : "Energy Rhythm"}</span>
                  </div>
                </td>

                {weekInfo.days.map((day) => {
                  const moodInfo = getMoodStatusForDate(day.dateStr, dailyMoods);
                  const energy = moodInfo.energy;

                  return (
                    <td
                      key={day.dateStr}
                      className={cn(
                        "py-1.5 px-1 text-center",
                        day.isToday && "bg-amber-50/20 dark:bg-amber-950/15"
                      )}
                    >
                      {energy ? (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase",
                            energy === "high"
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                              : energy === "medium"
                              ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                              : "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                          )}
                          title={`Energy: ${energy}`}
                        >
                          {energy === "high"
                            ? isAr ? "عالية" : "High"
                            : energy === "medium"
                            ? isAr ? "متوسطة" : "Med"
                            : isAr ? "هادئة" : "Low"}
                        </span>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* ── 4. Day Rating Row ── */}
            {showDayRating && (
              <tr className="hover:bg-yellow-50/30 dark:hover:bg-yellow-950/10 transition-colors">
                <td
                  className={cn(
                    "sticky start-0 z-10 bg-card/95 backdrop-blur-xs py-2 px-3 border-e border-pink-100 dark:border-pink-950/60 font-bold text-ink",
                    isCompact ? "w-36 min-w-[144px] sm:w-44 sm:min-w-[176px]" : "w-36 min-w-[144px] sm:w-48 sm:min-w-[192px]"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                    <Star className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{isAr ? "تقييم اليوم" : "Day Rating"}</span>
                  </div>
                </td>

                {weekInfo.days.map((day) => {
                  const moodInfo = getMoodStatusForDate(day.dateStr, dailyMoods);
                  const rating = moodInfo.dayRating;

                  return (
                    <td
                      key={day.dateStr}
                      className={cn(
                        "py-1.5 px-1 text-center",
                        day.isToday && "bg-yellow-50/20 dark:bg-yellow-950/15"
                      )}
                    >
                      {rating && rating > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-500">
                          <span>{rating}</span>
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        </span>
                      ) : (
                        <span className="text-border text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
