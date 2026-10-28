/**
 * useGamification — Custom hook bound directly to central AYXA Planner Store
 */
import { useCallback, useMemo } from "react";
import {
  type XpEvent,
  ACHIEVEMENTS,
  CHALLENGES,
  XP_EVENTS,
  getDailyChallenges,
  getLevelProgress,
  getTierProgress,
  todayStr,
} from "@/lib/gamification";
import { useApp } from "@/lib/store";

export function useGamification() {
  const { state, addXP: storeAddXP, unlockBadge } = useApp();

  const xp = typeof state.xp === "number" ? state.xp : 0;
  const levelInfo = useMemo(() => getLevelProgress(xp), [xp]);
  const tierInfo = useMemo(() => getTierProgress(xp), [xp]);

  const addXP = useCallback(
    (event: XpEvent, overrideAmount?: number) => {
      const amount = overrideAmount ?? XP_EVENTS[event] ?? 10;
      const res = storeAddXP(event, `manual_${Date.now()}`, amount, todayStr());
      const newInfo = getLevelProgress(res.newTotalXP);
      const leveledUp = newInfo.level > levelInfo.level;
      return { leveledUp, newLevel: newInfo.tier, level: newInfo.level };
    },
    [storeAddXP, levelInfo.level]
  );

  const unlockAchievement = useCallback(
    (id: string): boolean => {
      return unlockBadge ? unlockBadge(id) : false;
    },
    [unlockBadge]
  );

  const completeChallenge = useCallback(
    (challengeId: string): boolean => {
      const ch = CHALLENGES.find((c) => c.id === challengeId);
      if (!ch) return false;
      const res = storeAddXP("challenge", challengeId, ch.xpReward, todayStr());
      return res.awarded;
    },
    [storeAddXP]
  );

  const todaysChallenges = useMemo(() => getDailyChallenges(todayStr()), []);

  const challengesDoneToday = useMemo(() => {
    return (state.xpLedger || [])
      .filter((e) => e.sourceType === "challenge" && e.localDate === todayStr())
      .map((e) => e.sourceId);
  }, [state.xpLedger]);

  const unlockedBadges = state.unlockedBadges || [];
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => unlockedBadges.includes(a.id));
  }, [unlockedBadges]);

  const lockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => !unlockedBadges.includes(a.id));
  }, [unlockedBadges]);

  // Aggregate 14-day XP history from xpLedger
  const xpHistory = useMemo(() => {
    const historyMap: Record<string, number> = {};
    const ledger = state.xpLedger || [];
    for (const item of ledger) {
      if (item.localDate) {
        historyMap[item.localDate] = (historyMap[item.localDate] || 0) + (item.amount || 0);
      }
    }
    return Object.entries(historyMap)
      .map(([date, xpVal]) => ({ date, xp: xpVal }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [state.xpLedger]);

  return {
    xp,
    level: tierInfo.currentTier,
    numericLevel: levelInfo.level,
    tier: tierInfo.currentTier,
    xpProgress: {
      pct: levelInfo.pct,
      current: levelInfo.xpIntoLevel,
      needed: levelInfo.xpToNextLevel,
      nextLevelThreshold: levelInfo.nextLevelThreshold,
    },
    todaysChallenges,
    challengesDoneToday,
    unlockedAchievements,
    lockedAchievements,
    xpHistory,
    game: {
      xp,
      achievements: state.unlockedBadges || [],
      flashcardsReviewed: state.totalFlashcardsReviewed || 0,
      challengesDoneToday,
      lastChallengeDate: todayStr(),
      loginStreak: 1,
      lastLoginDate: todayStr(),
      xpHistory,
    },
    xpToNextLevel: levelInfo.xpToNextLevel,
    xpToNextTier: tierInfo.xpToNextTier,
    progressPct: levelInfo.pct,
    tierProgressPct: tierInfo.pct,
    addXP,
    unlockAchievement,
    completeChallenge,
    dailyChallenges: todaysChallenges,
    achievementsList: ACHIEVEMENTS,
  };
}
