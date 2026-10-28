import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_WHEEL_AREAS,
  WHEEL_REFLECTION_PROMPTS,
  getYearMonth,
  getAdjacentYearMonth,
  isMonthInFuture,
  isMonthPast,
  formatMonthLabel,
  normalizeWheelAreas,
  normalizeWheelRecord,
  calculateWheelMetrics,
  compareMonthRecords,
  generateWheelSvgGeometry,
  findExistingGoalMatch,
} from "../src/lib/wheelOfBecomingEngine.ts";

test("Wheel of Becoming - Default Areas Initialization & Stable IDs", () => {
  const areas = normalizeWheelAreas();
  assert.equal(areas.length, 10, "Should have exactly 10 default starting areas");

  const expectedIds = [
    "faith",
    "health",
    "mental_wellbeing",
    "personal_growth",
    "learning",
    "money",
    "work_business",
    "relationships",
    "rest_joy",
    "home",
  ];

  for (let i = 0; i < expectedIds.length; i++) {
    assert.equal(areas[i].id, expectedIds[i], `Area index ${i} should have stable ID ${expectedIds[i]}`);
    assert.ok(areas[i].nameEn, `Area ${expectedIds[i]} must have English label`);
    assert.ok(areas[i].nameAr, `Area ${expectedIds[i]} must have Arabic label`);
    assert.ok(areas[i].color.startsWith("#"), `Area ${expectedIds[i]} must have pastel hex color`);
  }
});

test("Wheel of Becoming - Truthful Ratings: Unrated vs Zero Semantics", () => {
  // A record with no ratings
  const emptyRecord = normalizeWheelRecord(null, "2026-10");
  assert.equal(Object.keys(emptyRecord.ratings).length, 0, "Initial record must have NO ratings (not zero, not midpoint)");

  // Attempting to pass 0 or out-of-range ratings
  const invalidRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: {
        faith: 0, // Invalid: should be omitted
        health: 7, // Valid
        money: 11, // Invalid: should be omitted
        learning: -3, // Invalid: should be omitted
        home: 10, // Valid
      },
    },
    "2026-10"
  );

  assert.equal(invalidRecord.ratings.faith, undefined, "Rating of 0 must be excluded (not treated as 0)");
  assert.equal(invalidRecord.ratings.money, undefined, "Rating > 10 must be excluded");
  assert.equal(invalidRecord.ratings.learning, undefined, "Negative rating must be excluded");
  assert.equal(invalidRecord.ratings.health, 7, "Valid rating 7 should be preserved");
  assert.equal(invalidRecord.ratings.home, 10, "Valid rating 10 should be preserved");
});

test("Wheel of Becoming - Partial Check-ins & Truthful Metrics", () => {
  const partial = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: {
        faith: 8,
        mental_wellbeing: 6,
      },
      notes: {
        faith: "Feeling closer and at peace.",
      },
      focusAreaId: "faith",
      focusIntention: "Dedicate 10 minutes of quiet morning prayer",
    },
    "2026-10"
  );

  const metrics = calculateWheelMetrics(partial);
  assert.equal(metrics.totalAreasCount, 10);
  assert.equal(metrics.activeAreasCount, 10);
  assert.equal(metrics.ratedCount, 2);
  assert.equal(metrics.unratedCount, 8);
  assert.equal(metrics.isFullyRated, false);
  assert.equal(metrics.hasSufficientDataForPolygon, false, "2 ratings is insufficient for a full polygon");
  assert.equal(metrics.hasAnyReflection, true);
});

test("Wheel of Becoming - Historical Area Definitions Preservation", () => {
  // User had a custom area definition in August 2026
  const pastAreas = [
    { id: "faith", nameEn: "Spiritual Connection", nameAr: "صلتي الروحية", icon: "Moon", color: "#F472B6", order: 0 },
    { id: "health", nameEn: "Physical Vitality", nameAr: "حيوية الجسد", icon: "Apple", color: "#34D399", order: 1 },
  ];

  const pastRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-08",
      areas: pastAreas,
      ratings: { faith: 9, health: 8 },
    },
    "2026-08"
  );

  assert.equal(pastRecord.areas.length, 2, "Historical record must preserve its exact past area snapshot");
  assert.equal(pastRecord.areas[0].nameEn, "Spiritual Connection", "Should preserve historical custom label");

  // Re-normalizing with current default areas should NOT overwrite historical areas
  const reNormalized = normalizeWheelRecord(pastRecord, "2026-08", DEFAULT_WHEEL_AREAS);
  assert.equal(reNormalized.areas.length, 2);
  assert.equal(reNormalized.areas[0].nameEn, "Spiritual Connection");
});

test("Wheel of Becoming - Month Navigation & Timing", () => {
  assert.equal(getAdjacentYearMonth("2026-10", -1), "2026-09", "Previous month of 2026-10 is 2026-09");
  assert.equal(getAdjacentYearMonth("2026-10", 1), "2026-11", "Next month of 2026-10 is 2026-11");
  assert.equal(getAdjacentYearMonth("2026-01", -1), "2025-12", "Previous month of Jan crosses year boundary to Dec");
  assert.equal(getAdjacentYearMonth("2025-12", 1), "2026-01", "Next month of Dec crosses year boundary to Jan");

  assert.equal(isMonthPast("2026-09", "2026-10"), true, "September is past relative to October");
  assert.equal(isMonthInFuture("2026-11", "2026-10"), true, "November is future relative to October");

  const enLabel = formatMonthLabel("2026-10", false);
  assert.ok(enLabel.includes("October") && enLabel.includes("2026"), "Should format English month and year");

  const arLabel = formatMonthLabel("2026-10", true);
  assert.ok(arLabel.includes("أكتوبر") || arLabel.includes("2026") || arLabel.includes("٢٠٢٦"), "Should format Arabic month and year");
});

test("Wheel of Becoming - Backfilled Status Detection", () => {
  // Check-in for past month with ratings should be marked backfilled
  const backfilled = normalizeWheelRecord(
    {
      yearMonth: "2026-07",
      ratings: { faith: 7, health: 6 },
    },
    "2026-07"
  );

  assert.equal(backfilled.isBackfilled, true, "Past month with ratings must be identified as backfilled");
  assert.ok(backfilled.enteredAt, "Backfilled record must record enteredAt timestamp");
});

test("Wheel of Becoming - Neutral Month Comparison (Zero Life Scores)", () => {
  const prevRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-09",
      ratings: { faith: 6, health: 7, money: 5 },
    },
    "2026-09"
  );

  const currRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: { faith: 8, health: 7, learning: 9 }, // money is unrated, learning is new
    },
    "2026-10"
  );

  const comparison = compareMonthRecords(currRecord, prevRecord);
  assert.equal(comparison.hasPreviousRecord, true);
  assert.equal(comparison.previousYearMonth, "2026-09");
  assert.equal(comparison.currentYearMonth, "2026-10");

  const faithComp = comparison.areaComparisons.find((c) => c.areaId === "faith");
  assert.ok(faithComp);
  assert.equal(faithComp.isComparable, true);
  assert.equal(faithComp.neutralTextEn, "Previously 6, now 8");
  assert.equal(faithComp.neutralTextAr, "سابقاً 6، والآن 8");

  const healthComp = comparison.areaComparisons.find((c) => c.areaId === "health");
  assert.ok(healthComp);
  assert.equal(healthComp.isComparable, true);
  assert.equal(healthComp.neutralTextEn, "Previously 7, now 7 (Unchanged)");

  const learningComp = comparison.areaComparisons.find((c) => c.areaId === "learning");
  assert.ok(learningComp);
  assert.equal(learningComp.isComparable, false);
  assert.equal(learningComp.neutralTextEn, "Now 9 (Previously unrated)");

  const moneyComp = comparison.areaComparisons.find((c) => c.areaId === "money");
  assert.ok(moneyComp);
  assert.equal(moneyComp.isComparable, false);
  assert.equal(moneyComp.neutralTextEn, "Previously 5 (Not rated this month)");

  // Confirm NO aggregate grade or percentage is produced
  assert.equal(comparison.overallScore, undefined, "Must NOT calculate an overall score");
  assert.equal(comparison.percentage, undefined, "Must NOT calculate an overall percentage");
});

test("Wheel of Becoming - Focus Selection Independent of Ratings & Goal Match", () => {
  // User selects an area with high rating or no rating as focus
  const record = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: { health: 9 }, // Highest rated
      focusAreaId: "health", // Allowed! Focus does not have to be lowest rated
      focusIntention: "Drink 2L water daily and sleep by 10pm",
      gentleAction: "Keep a filled carafe by my bedside",
    },
    "2026-10"
  );

  assert.equal(record.focusAreaId, "health");
  assert.equal(record.focusIntention, "Drink 2L water daily and sleep by 10pm");

  // Search existing goals
  const existingGoals = [
    { id: "g1", title: "Complete French B1 course", category: "Learning" },
    { id: "g2", title: "Hydrate and sleep consistently", category: "Health" },
  ];

  const match = findExistingGoalMatch(existingGoals, "Hydrate and sleep consistently");
  assert.ok(match);
  assert.equal(match.id, "g2");

  const noMatch = findExistingGoalMatch(existingGoals, "Climb Mount Everest");
  assert.equal(noMatch, null);
});

test("Wheel of Becoming - SVG Geometry & Partial Data Fallback", () => {
  // With 2 ratings (insufficient for closed polygon)
  const partialRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: { faith: 5, health: 8 },
    },
    "2026-10"
  );

  const partialGeo = generateWheelSvgGeometry(partialRecord, 130, 160);
  assert.equal(partialGeo.hasSufficientData, false, "2 ratings is insufficient");
  assert.equal(partialGeo.wedges.length, 10, "Should generate wedges for all 10 active areas");

  // With 5 ratings (sufficient for polygon)
  const fullRecord = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: { faith: 8, health: 7, mental_wellbeing: 6, learning: 9, home: 7 },
    },
    "2026-10"
  );

  const fullGeo = generateWheelSvgGeometry(fullRecord, 130, 160);
  assert.equal(fullGeo.hasSufficientData, true);
  assert.ok(fullGeo.polygonPoints.length > 0, "Polygon points should be generated");
});

test("Wheel of Becoming - Guided Reflection Prompts Library", () => {
  assert.equal(WHEEL_REFLECTION_PROMPTS.length, 4, "Must offer exactly 4 guided reflection prompts");
  assert.equal(WHEEL_REFLECTION_PROMPTS[0].promptEn, "What feels supportive?");
  assert.equal(WHEEL_REFLECTION_PROMPTS[0].promptAr, "ما الذي يدعمني؟");
  assert.equal(WHEEL_REFLECTION_PROMPTS[1].promptEn, "What needs more space?");
  assert.equal(WHEEL_REFLECTION_PROMPTS[1].promptAr, "ما الذي يحتاج مساحة أكبر؟");
  assert.equal(WHEEL_REFLECTION_PROMPTS[2].promptEn, "What would I like to approach differently?");
  assert.equal(WHEEL_REFLECTION_PROMPTS[2].promptAr, "ما الذي أرغب في التعامل معه بطريقة مختلفة؟");
  assert.equal(WHEEL_REFLECTION_PROMPTS[3].promptEn, "What can remain as it is?");
  assert.equal(WHEEL_REFLECTION_PROMPTS[3].promptAr, "ما الذي أودّ الإبقاء عليه كما هو؟");
});

test("Wheel of Becoming - Monthly Record Uniqueness & Idempotent Update", () => {
  const firstSave = normalizeWheelRecord(
    {
      id: "wheel_2026-10_abc",
      yearMonth: "2026-10",
      ratings: { faith: 7 },
    },
    "2026-10"
  );

  // Subsequent edit to the same month reuses the existing ID and updates fields
  const secondSave = normalizeWheelRecord(
    {
      id: firstSave.id,
      yearMonth: "2026-10",
      ratings: { ...firstSave.ratings, health: 8 },
      focusAreaId: "health",
    },
    "2026-10"
  );

  assert.equal(secondSave.id, firstSave.id, "Reopening a month must preserve its canonical record ID");
  assert.equal(secondSave.yearMonth, "2026-10");
  assert.equal(secondSave.ratings.faith, 7);
  assert.equal(secondSave.ratings.health, 8);
  assert.equal(secondSave.focusAreaId, "health");
});

test("Wheel of Becoming - Strictly 0 Extra Bookshelf or Wheel XP Guarantee", () => {
  // Wheel of Becoming is a subjective wellness reflection, never gamified or scored with XP
  const record = normalizeWheelRecord(
    {
      yearMonth: "2026-10",
      ratings: {
        faith: 10,
        health: 10,
        mental_wellbeing: 10,
        personal_growth: 10,
        learning: 10,
        money: 10,
        work_business: 10,
        relationships: 10,
        rest_joy: 10,
        home: 10,
      },
    },
    "2026-10"
  );

  assert.equal(record.ratings.faith, 10);
  // Ensure the engine does not produce any xp field
  assert.equal((record).xpAwarded, undefined);
  assert.equal((record).xp, undefined);
});
