import React from "react";
import { Sparkles, Trophy, Award, Flame, Crown, Star } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { type ProgressionOverview, type UserProgressSettings } from "@/lib/progressionEngine";
import { cn } from "@/lib/utils";

interface ProgressHeroCardProps {
  overview: ProgressionOverview;
  userName?: string;
  userAvatar?: string;
  isGuest?: boolean;
  unlockedBadgesCount: number;
  settings?: UserProgressSettings;
}

export function ProgressHeroCard({
  overview,
  userName = "AYXA Member",
  userAvatar = "🌸",
  isGuest = false,
  unlockedBadgesCount = 0,
  settings,
}: ProgressHeroCardProps) {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const showXp = settings?.showXp ?? true;
  const showLevel = settings?.showLevel ?? true;
  const showTier = settings?.showTier ?? true;
  const reducedGamification = settings?.reducedGamification ?? false;

  const {
    totalXp,
    level,
    xpIntoLevel,
    xpToNextLevel,
    levelPct,
    tier,
    nextTier,
    xpToNextTier,
    tierPct,
  } = overview;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-5 text-white shadow-rose-md">
      {/* Background soft glow blobs */}
      <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <span className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

      <div className="relative z-10 space-y-4">
        {/* Top Row: User Avatar, Name, and Badges Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl shadow-inner border border-white/30">
              {userAvatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[16px] font-black truncate leading-tight">
                  {isGuest ? (isAr ? "ضيفتنا العزيزة ✨" : "Guest ✨") : userName}
                </p>
              </div>
              <p className="text-[12px] font-bold text-pink-100 flex items-center gap-1.5 mt-0.5">
                {showLevel && (
                  <span>
                    {isAr ? `المستوى ${level}` : `Level ${level}`}
                  </span>
                )}
                {showLevel && showTier && <span className="opacity-70">•</span>}
                {showTier && (
                  <span className="flex items-center gap-1">
                    <span>{isAr ? tier.labelAr : tier.label}</span>
                    <span>{tier.emoji}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Badges Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[11px] font-extrabold text-white shrink-0">
            <Trophy size={13} className="text-amber-200" />
            <span>
              {unlockedBadgesCount} {isAr ? "شارات" : "badges"}
            </span>
          </div>
        </div>

        {/* Primary XP & Level Progress */}
        {!reducedGamification && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[12px] font-black text-pink-100">
              {showXp && (
                <span className="font-mono text-[14px] text-white font-bold tracking-tight">
                  {totalXp.toLocaleString()} {isAr ? "نقطة خبرة" : "XP"}
                </span>
              )}
              {showLevel && (
                <span className="text-[11.5px] font-bold text-pink-100">
                  {isAr
                    ? `${xpToNextLevel.toLocaleString()} نقطة للوصول للمستوى ${level + 1}`
                    : `${xpToNextLevel.toLocaleString()} XP to Level ${level + 1}`}
                </span>
              )}
            </div>

            {/* Level Progress Bar (Primary - 250 XP cycle) */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/25 p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 transition-all duration-700"
                style={{ width: `${levelPct}%` }}
                role="progressbar"
                aria-valuenow={levelPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={isAr ? `تقدم المستوى: ${levelPct}%` : `Level progress: ${levelPct}%`}
              />
            </div>
          </div>
        )}

        {/* Secondary Tier Progress Info (Qualitative Rank) */}
        {showTier && (
          <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-3 text-[11.5px]">
            <div className="flex items-center gap-1.5 text-pink-100 font-semibold min-w-0">
              <Star size={13} className="text-amber-200 shrink-0" />
              <span className="truncate">
                {nextTier ? (
                  isAr ? (
                    <>
                      {xpToNextTier.toLocaleString()} نقطة للوصول إلى رتبة{" "}
                      <strong className="text-white font-black">{nextTier.labelAr}</strong> {nextTier.emoji}
                    </>
                  ) : (
                    <>
                      {xpToNextTier.toLocaleString()} XP to{" "}
                      <strong className="text-white font-black">{nextTier.label}</strong> {nextTier.emoji}
                    </>
                  )
                ) : (
                  <span className="text-amber-200 font-black">
                    {isAr ? "أعلى رتبة مكتملة — أسطورة 👑" : "Top Tier Achieved — Legend 👑"}
                  </span>
                )}
              </span>
            </div>

            {nextTier && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-[10.5px] font-black text-amber-200">
                {tierPct}%
              </span>
            )}
          </div>
        )}

        {/* Gentle Encouragement Message */}
        <p className="text-[11px] text-pink-100/90 italic pt-0.5 leading-snug">
          {isAr
            ? "«كل خطوة صغيرة تخطينها تصنع أثرًا عميقًا في رحلتكِ الجميلة.»"
            : "“Every small step you take quietly shapes your extraordinary journey.”"}
        </p>
      </div>
    </div>
  );
}
