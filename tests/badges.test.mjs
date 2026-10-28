import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  BADGE_DEFINITIONS,
  getBadgeDefinitions,
  getBadgeDefinitionById,
  calculateRawCriterionValue,
  calculateBadgeProgress,
  calculateAllBadgeProgress,
  evaluateEligibleBadges,
  reconcileAndMigrateBadges,
} from "../src/lib/badgeEngine.ts";

import {
  getTotalActiveXp,
  getProgressionOverview,
  getLevelProgress,
  getCurrentTier,
} from "../src/lib/progressionEngine.ts";

function createMockState(overrides = {}) {
  return {
    user: { id: "usr_test", name: "Sara", email: "sara@example.com" },
    xp: 0,
    xpLedger: [],
    badgeAwards: [],
    unlockedBadges: [],
    achievements: [],
    tasks: [],
    habits: [],
    routines: {},
    routineCompletionsByDate: {},
    goals: [],
    books: [],
    focusSessions: [],
    reviewSessions: [],
    dailyHydration: {},
    hydrationEvents: [],
    journal: [],
    businessInvoices: [],
    financialTransactions: [],
    businessActivityEvents: [],
    quranHistory: [],
    prayerLogs: {},
    ...overrides,
  };
}

describe("AYXA Planner Pro — Badges & Achievements Engine", () => {
  it("should have 16 active badges across 7 categories and 2 deactivated badges", () => {
    const activeDefs = getBadgeDefinitions({ includeInactive: false });
    const allDefs = getBadgeDefinitions({ includeInactive: true });
    
    assert.equal(activeDefs.length, 16, "Must have exactly 16 active badges");
    assert.equal(allDefs.length, 18, "Must have exactly 18 total badges");

    const zenMode = getBadgeDefinitionById("zen_mode");
    assert.ok(zenMode);
    assert.equal(zenMode.active, false, "Zen Mode must be inactive");

    const empire = getBadgeDefinitionById("empire");
    assert.ok(empire);
    assert.equal(empire.active, false, "Empire must be inactive");
  });

  it("should correctly calculate raw criterion values for productivity, habits, routines and goals", () => {
    const defFirstStep = getBadgeDefinitionById("first_step");
    const defTaskMachine = getBadgeDefinitionById("task_machine");
    const defTaskQueen = getBadgeDefinitionById("task_queen");
    const defWeekWarrior = getBadgeDefinitionById("week_warrior");
    const defOnFire = getBadgeDefinitionById("on_fire");
    const defEarlyBird = getBadgeDefinitionById("early_bird");
    const defEveningPeace = getBadgeDefinitionById("evening_peace");
    const defGoalCrusher = getBadgeDefinitionById("goal_crusher");

    const mockTasks = Array.from({ length: 30 }, (_, i) => ({
      id: `task_${i}`,
      title: `Task ${i}`,
      done: i < 25, // 25 done, 5 undone
    }));

    const mockState = createMockState({
      tasks: mockTasks,
      habits: [
        { id: "h1", name: "Gym", streak: 32, bestStreak: 32, status: "active" },
        { id: "h2", name: "Drink Water", streak: 7, status: "active" },
        { id: "h3", name: "Old Habit", streak: 50, status: "archived" }, // archived habits ignored
      ],
      routineCompletionsByDate: {
        "2026-09-01": ["id-1", "id-2"],
        "2026-09-02": ["id-1"],
        "2026-09-03": ["id-1", "id-2"],
        "2026-09-04": ["id-2"],
        "2026-09-05": ["id-1"],
        "2026-09-06": ["id-1", "id-2"],
        "2026-09-07": ["id-1"],
      },
      goals: [
        { id: "g1", title: "Goal 1", status: "completed", progress: 100 },
        { id: "g2", title: "Goal 2", status: "active", progress: 60 },
      ],
    });

    assert.equal(calculateRawCriterionValue(defFirstStep, mockState), 25);
    assert.equal(calculateRawCriterionValue(defTaskMachine, mockState), 25);
    assert.equal(calculateRawCriterionValue(defTaskQueen, mockState), 25);
    assert.equal(calculateRawCriterionValue(defWeekWarrior, mockState), 32);
    assert.equal(calculateRawCriterionValue(defOnFire, mockState), 32);
    assert.equal(calculateRawCriterionValue(defEarlyBird, mockState), 7);
    assert.equal(calculateRawCriterionValue(defEveningPeace, mockState), 7);
    assert.equal(calculateRawCriterionValue(defGoalCrusher, mockState), 1);
  });

  it("should calculate focus, learning, wellness, business and faith accurately", () => {
    const defDeepFocus = getBadgeDefinitionById("deep_focus_5");
    const defBookworm = getBadgeDefinitionById("bookworm");
    const defMemoryMaster = getBadgeDefinitionById("memory_master_50");
    const defHydration = getBadgeDefinitionById("hydration_queen_7");
    const defJournal = getBadgeDefinitionById("consistent_writer_7");
    const defFirstSale = getBadgeDefinitionById("first_sale");
    const defQuran = getBadgeDefinitionById("quran_journey_7");
    const defAthkar = getBadgeDefinitionById("athkar_routine_7");

    const mockState = createMockState({
      focusSessions: [
        { id: "f1", status: "completed", actualFocusSeconds: 1500 },
        { id: "f2", status: "completed", actualFocusSeconds: 1500 },
        { id: "f3", status: "completed", actualFocusSeconds: 1800 },
        { id: "f4", status: "completed", actualFocusSeconds: 1800 },
        { id: "f5", status: "completed", actualFocusSeconds: 1500 },
        { id: "f6", status: "cancelled", actualFocusSeconds: 100 }, // short/cancelled
      ],
      books: [
        { id: "b1", title: "Book 1", status: "completed" },
        { id: "b2", title: "Book 2", status: "completed" },
        { id: "b3", title: "Book 3", totalPages: 100, readPages: 100 },
        { id: "b4", title: "Book 4", status: "completed" },
        { id: "b5", title: "Book 5", status: "completed" },
        { id: "b6", title: "Book 6", status: "reading", readPages: 20 },
      ],
      reviewSessions: [
        { id: "r1", cardsReviewedCount: 30 },
        { id: "r2", cardsReviewedCount: 25 },
      ],
      dailyHydration: {
        "2026-09-01": { consumedMl: 2000, targetMl: 2000 },
        "2026-09-02": { consumedMl: 2200, targetMl: 2000 },
        "2026-09-03": { consumedMl: 2000, targetMl: 2000 },
        "2026-09-04": { consumedMl: 2500, targetMl: 2000 },
        "2026-09-05": { consumedMl: 2000, targetMl: 2000 },
        "2026-09-06": { consumedMl: 3000, targetMl: 2000 },
        "2026-09-07": { consumedMl: 2100, targetMl: 2000 },
      },
      journal: [
        { id: "j1", date: "2026-09-01T10:00:00Z", body: "Private 1" },
        { id: "j2", date: "2026-09-02T10:00:00Z", body: "Private 2" },
        { id: "j3", date: "2026-09-03T10:00:00Z", body: "Private 3" },
        { id: "j4", date: "2026-09-04T10:00:00Z", body: "Private 4" },
        { id: "j5", date: "2026-09-05T10:00:00Z", body: "Private 5" },
        { id: "j6", date: "2026-09-06T10:00:00Z", body: "Private 6" },
        { id: "j7", date: "2026-09-07T10:00:00Z", body: "Private 7" },
      ],
      businessInvoices: [
        { id: "inv1", status: "paid", totalAmountMinor: 150000 },
      ],
      quranHistory: [
        { id: "q1", localDate: "2026-09-01", amount: 4 },
        { id: "q2", localDate: "2026-09-02", amount: 4 },
        { id: "q3", localDate: "2026-09-03", amount: 4 },
        { id: "q4", localDate: "2026-09-04", amount: 4 },
        { id: "q5", localDate: "2026-09-05", amount: 4 },
        { id: "q6", localDate: "2026-09-06", amount: 4 },
        { id: "q7", localDate: "2026-09-07", amount: 4 },
      ],
      prayerLogs: {
        "2026-09-01_fajr": { localDate: "2026-09-01", prayerKey: "fajr" },
        "2026-09-02_fajr": { localDate: "2026-09-02", prayerKey: "fajr" },
        "2026-09-03_fajr": { localDate: "2026-09-03", prayerKey: "fajr" },
        "2026-09-04_fajr": { localDate: "2026-09-04", prayerKey: "fajr" },
        "2026-09-05_fajr": { localDate: "2026-09-05", prayerKey: "fajr" },
        "2026-09-06_fajr": { localDate: "2026-09-06", prayerKey: "fajr" },
        "2026-09-07_fajr": { localDate: "2026-09-07", prayerKey: "fajr" },
      },
    });

    assert.equal(calculateRawCriterionValue(defDeepFocus, mockState), 5);
    assert.equal(calculateRawCriterionValue(defBookworm, mockState), 5);
    assert.equal(calculateRawCriterionValue(defMemoryMaster, mockState), 55);
    assert.equal(calculateRawCriterionValue(defHydration, mockState), 7);
    assert.equal(calculateRawCriterionValue(defJournal, mockState), 7);
    assert.equal(calculateRawCriterionValue(defFirstSale, mockState), 1);
    assert.equal(calculateRawCriterionValue(defQuran, mockState), 7);
    assert.equal(calculateRawCriterionValue(defAthkar, mockState), 7);
  });

  it("should unlock eligible badges idempotently with deterministic reward keys and exact XP amounts", () => {
    const mockState = createMockState({
      tasks: [
        { id: "t1", title: "Task 1", done: true },
      ],
      goals: [
        { id: "g1", title: "Goal 1", status: "completed", progress: 100 },
      ],
    });

    const eval1 = evaluateEligibleBadges(mockState);
    assert.equal(eval1.newAwards.length, 2, "Should unlock first_step and goal_crusher");

    const awardIds = eval1.newAwards.map((a) => a.badgeId).sort();
    assert.deepEqual(awardIds, ["first_step", "goal_crusher"]);

    // Verify ledger XP events
    const firstStepXp = eval1.updatedXpLedger.find((e) => e.rewardKey === "badge.unlock:first_step:1");
    assert.ok(firstStepXp, "Must have XP ledger entry for first_step");
    assert.equal(firstStepXp.amount, 10);

    const goalCrusherXp = eval1.updatedXpLedger.find((e) => e.rewardKey === "badge.unlock:goal_crusher:1");
    assert.ok(goalCrusherXp, "Must have XP ledger entry for goal_crusher");
    assert.equal(goalCrusherXp.amount, 50);

    // Total XP must equal 60
    assert.equal(eval1.newTotalXp, 60);

    // Progression overview calculation
    const overview = getProgressionOverview(eval1.newTotalXp);
    assert.equal(overview.level, 1);
    assert.equal(overview.totalXp, 60);
    assert.equal(overview.tier.id, "beginner");

    // Second evaluation on the updated state must be completely idempotent (0 new awards, same XP)
    const stateAfterEval = {
      ...mockState,
      badgeAwards: eval1.updatedAwards,
      xpLedger: eval1.updatedXpLedger,
      xp: eval1.newTotalXp,
    };

    const eval2 = evaluateEligibleBadges(stateAfterEval);
    assert.equal(eval2.newAwards.length, 0, "Second evaluation must yield 0 new awards");
    assert.equal(eval2.newTotalXp, 60, "XP must remain identical");
  });

  it("should perform retroactive migration of historical data without duplicate unlocks", () => {
    const legacyState = createMockState({
      unlockedBadges: ["first_step"],
      tasks: [
        { id: "t1", title: "Task 1", done: true },
        { id: "t2", title: "Task 2", done: true },
      ],
      habits: [
        { id: "h1", name: "Streak habit", streak: 7, status: "active" },
      ],
    });

    const reconciled = reconcileAndMigrateBadges(legacyState);
    assert.ok(reconciled.unlockedBadges.includes("first_step"), "Migrated first_step award preserved");
    assert.ok(reconciled.unlockedBadges.includes("week_warrior"), "Retroactively evaluated week_warrior");

    const awardMap = new Set(reconciled.badgeAwards.map((a) => a.badgeId));
    assert.equal(awardMap.size, reconciled.badgeAwards.length, "All award badgeIds must be unique");
  });

  it("should respect privacy classifications for sensitive faith and business badges", () => {
    const faithBadge = getBadgeDefinitionById("quran_journey_7");
    const businessBadge = getBadgeDefinitionById("first_sale");
    const taskBadge = getBadgeDefinitionById("first_step");

    assert.equal(faithBadge.privacyClassification, "private_by_default");
    assert.equal(businessBadge.privacyClassification, "private_by_default");
    assert.equal(taskBadge.privacyClassification, "public_safe");
  });
});
