import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeSomedayWish,
  createDefaultWish,
  deriveGrowthStage,
  findPotentialGoalMatches,
  filterAndSortWishes,
  SOMEDAY_WISH_CATEGORIES,
} from "../src/lib/somedayGardenEngine.ts";

test("Someday Garden - Normalization & Defaults", () => {
  const emptyWish = normalizeSomedayWish(null, 5);
  assert.equal(typeof emptyWish.id, "string");
  assert.equal(emptyWish.title, "Untitled Wish");
  assert.equal(emptyWish.status, "dreaming");
  assert.equal(emptyWish.order, 5);
  assert.equal(emptyWish.archivedAt, undefined);
  assert.equal(emptyWish.linkedGoalId, undefined);

  const populated = normalizeSomedayWish({
    id: "wish-1",
    title: "Learn Moroccan Pottery",
    category: "Things to learn",
    personalReason: "A soothing creative tactile practice",
    nextSmallStepNote: "Watch 1 tutorial video",
    status: "exploring",
  });
  assert.equal(populated.id, "wish-1");
  assert.equal(populated.title, "Learn Moroccan Pottery");
  assert.equal(populated.category, "Things to learn");
  assert.equal(populated.status, "exploring");
  assert.equal(populated.personalReason, "A soothing creative tactile practice");
});

test("Someday Garden - Seed to Flower Growth Stage Derivation", () => {
  // 1. Dreaming wish -> seed 🌱
  const dreamingWish = createDefaultWish("Write a poetry zine", { status: "dreaming" });
  const seedStage = deriveGrowthStage(dreamingWish, null);
  assert.equal(seedStage.stage, "seed");
  assert.equal(seedStage.icon, "🌱");
  assert.equal(seedStage.isGoalCompleted, false);
  assert.equal(seedStage.isGoalMissing, false);

  // 2. Exploring wish -> sprout 🌿
  const exploringWish = createDefaultWish("Visit Chefchaouen", { status: "exploring" });
  const sproutStage = deriveGrowthStage(exploringWish, null);
  assert.equal(sproutStage.stage, "sprout");
  assert.equal(sproutStage.icon, "🌿");

  // 3. Linked active Goal -> growing plant 🪴
  const linkedWish = createDefaultWish("Launch artisanal tea shop", {
    status: "linked_goal",
    linkedGoalId: "goal-tea-1",
  });
  const activeGoal = { id: "goal-tea-1", status: "active", progress: 45, title: "Artisanal Tea" };
  const plantStage = deriveGrowthStage(linkedWish, activeGoal);
  assert.equal(plantStage.stage, "plant");
  assert.equal(plantStage.icon, "🪴");
  assert.equal(plantStage.progressPercent, 45);
  assert.equal(plantStage.isGoalCompleted, false);

  // 4. Linked completed Goal -> blooming flower 🌸
  const completedGoal = { id: "goal-tea-1", status: "completed", progress: 100, title: "Artisanal Tea" };
  const flowerStage = deriveGrowthStage(linkedWish, completedGoal);
  assert.equal(flowerStage.stage, "flower");
  assert.equal(flowerStage.icon, "🌸");
  assert.equal(flowerStage.progressPercent, 100);
  assert.equal(flowerStage.isGoalCompleted, true);

  // 5. Linked Goal deleted / unavailable
  const missingGoalStage = deriveGrowthStage(linkedWish, null);
  assert.equal(missingGoalStage.stage, "plant");
  assert.equal(missingGoalStage.isGoalMissing, true);
  assert.equal(missingGoalStage.labelEn, "Goal Unavailable");
});

test("Someday Garden - Search & Category Filters", () => {
  const wishes = [
    createDefaultWish("Stargaze in the Sahara", { category: "Experiences", status: "dreaming", order: 1 }),
    createDefaultWish("Bake sourdough bread", { category: "Home", status: "exploring", order: 2 }),
    createDefaultWish("Visit Andalusia gardens", { category: "Places to visit", status: "dreaming", order: 3 }),
    createDefaultWish("Vintage calligraphy set", { category: "Something to save for", status: "dreaming", order: 4, archivedAt: "2026-10-01" }),
  ];

  // Search query filter
  const searchResults = filterAndSortWishes(wishes, { query: "sourdough" });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].title, "Bake sourdough bread");

  // Category filter
  const placesResults = filterAndSortWishes(wishes, { category: "Places to visit" });
  assert.equal(placesResults.length, 1);
  assert.equal(placesResults[0].title, "Visit Andalusia gardens");

  // Status filter
  const exploringResults = filterAndSortWishes(wishes, { statusFilter: "exploring" });
  assert.equal(exploringResults.length, 1);
  assert.equal(exploringResults[0].title, "Bake sourdough bread");

  // Archived filter
  const activeWishes = filterAndSortWishes(wishes, { showArchived: false });
  assert.equal(activeWishes.length, 3);

  const archivedWishes = filterAndSortWishes(wishes, { showArchived: true });
  assert.equal(archivedWishes.length, 1);
  assert.equal(archivedWishes[0].title, "Vintage calligraphy set");
});

test("Someday Garden - Potential Goal Match Detection", () => {
  const existingGoals = [
    { id: "g-1", title: "Learn Classical Arabic", area: "Study" },
    { id: "g-2", title: "Complete Marathon 2027", area: "Health" },
  ];

  // Exact / strong overlap
  const matches = findPotentialGoalMatches("Learn Classical Arabic at home", existingGoals);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, "g-1");

  // Unrelated wish
  const noMatches = findPotentialGoalMatches("Learn Hand Pottery", existingGoals);
  assert.equal(noMatches.length, 0);
});

test("Someday Garden - Separation from Active Goals & Zero XP Guarantees", () => {
  // A wish has status dreaming or exploring, not active Goal
  const wish = createDefaultWish("Design handmade ceramic mugs");
  assert.notEqual(wish.status, "active");
  assert.equal(wish.linkedGoalId, undefined);

  // Verify categories include all 7 canonical groups
  assert.equal(SOMEDAY_WISH_CATEGORIES.length, 7);
  const keys = SOMEDAY_WISH_CATEGORIES.map((c) => c.key);
  assert.ok(keys.includes("Places to visit"));
  assert.ok(keys.includes("Things to learn"));
  assert.ok(keys.includes("Projects to explore"));
  assert.ok(keys.includes("Experiences"));
  assert.ok(keys.includes("Home"));
  assert.ok(keys.includes("Personal"));
  assert.ok(keys.includes("Something to save for"));
});

test("Someday Garden - Sorting Strategies", () => {
  const wishes = [
    createDefaultWish("Alpha Wish", { order: 2, createdAt: "2026-10-10T10:00:00Z" }),
    createDefaultWish("Beta Wish", { order: 1, createdAt: "2026-10-12T10:00:00Z" }),
    createDefaultWish("Gamma Wish", { order: 0, createdAt: "2026-10-08T10:00:00Z" }),
  ];

  const sortedByOrder = filterAndSortWishes(wishes, { sortBy: "order" });
  assert.equal(sortedByOrder[0].title, "Gamma Wish");
  assert.equal(sortedByOrder[1].title, "Beta Wish");
  assert.equal(sortedByOrder[2].title, "Alpha Wish");

  const sortedByNewest = filterAndSortWishes(wishes, { sortBy: "newest" });
  assert.equal(sortedByNewest[0].title, "Beta Wish");

  const sortedByOldest = filterAndSortWishes(wishes, { sortBy: "oldest" });
  assert.equal(sortedByOldest[0].title, "Gamma Wish");

  const sortedByTitle = filterAndSortWishes(wishes, { sortBy: "title" });
  assert.equal(sortedByTitle[0].title, "Alpha Wish");
});
