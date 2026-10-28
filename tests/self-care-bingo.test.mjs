import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultBingoBoard,
  populateBoardWithActivities,
  calculateCompletedLines,
  matchCompletionsForWeek,
  normalizeBingoBoard,
  formatCareCount,
  BINGO_THEMES,
  STARTER_BINGO_IDEAS,
} from "../src/lib/selfCareBingoEngine.ts";

test("AYXA Self-care Bingo (بينغو العناية بنفسي 🌸) Engine & Verification Suite", async (t) => {
  // ── 1. Themes & Starter Ideas ─────────────────────────────────────────────
  await t.test("1. Themes & Starter Ideas", async (t) => {
    await t.test("provides 5 required pastel themes with dark plum typography", () => {
      const expectedThemes = ["blush", "lavender", "mint", "yellow", "blue"];
      expectedThemes.forEach((key) => {
        const theme = BINGO_THEMES[key];
        assert.ok(theme, `Theme ${key} should exist`);
        assert.ok(theme.bgHex.startsWith("#"), `Theme ${key} bgHex valid`);
        assert.ok(theme.boardBgHex.startsWith("#"), `Theme ${key} boardBgHex valid`);
        assert.ok(theme.darkPlumText.startsWith("#"), `Theme ${key} darkPlumText valid`);
      });
    });

    await t.test("provides curated pressure-free starter ideas with no medical claims", () => {
      assert.ok(STARTER_BINGO_IDEAS.length >= 9, "Should provide at least 9 starter ideas");
      STARTER_BINGO_IDEAS.forEach((idea) => {
        assert.ok(idea.id, "Idea has ID");
        assert.ok(idea.titleEn && idea.titleEn.length > 0, "Idea has English title");
        assert.ok(idea.titleAr && idea.titleAr.length > 0, "Idea has Arabic title");
        assert.ok(idea.icon, "Idea has emoji icon");
        assert.ok(["simple", "duration", "quantity", "hydration"].includes(idea.activityType), "Valid activity type");
        assert.ok(idea.defaultTargetValue >= 1, "Valid target value");
      });
    });
  });

  // ── 2. Board Creation & Size Switching ────────────────────────────────────
  await t.test("2. Board Creation & Size Switching", async (t) => {
    await t.test("creates default 3x3 board with 9 empty tiles", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      assert.equal(board.size, 3);
      assert.equal(board.tiles.length, 9);
      assert.equal(board.theme, "blush");
      assert.equal(board.celebrationsEnabled, true);
      assert.equal(board.tiles.every((t) => t.completed === false), true);
    });

    await t.test("creates default 4x4 board with 16 empty tiles", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 4, "lavender");
      assert.equal(board.size, 4);
      assert.equal(board.tiles.length, 16);
      assert.equal(board.theme, "lavender");
    });

    await t.test("populates board with user activities and fills remaining with ideas", () => {
      const mockActivities = [
        {
          id: "act_1",
          userId: "u1",
          title: "Evening Herbal Tea",
          titleAr: "شاي الأعشاب المسائي",
          icon: "☕",
          category: "body",
          recurrenceRule: "daily",
          status: "active",
          sourceType: "custom",
          estimatedDurationMinutes: 10,
          createdAt: "2026-10-10",
          updatedAt: "2026-10-10",
        },
      ];

      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      const populated = populateBoardWithActivities(board, mockActivities);

      assert.equal(populated.tiles[0].activityId, "act_1");
      assert.equal(populated.tiles[0].title, "Evening Herbal Tea");
      assert.equal(populated.tiles[0].activityType, "duration");
      assert.equal(populated.tiles[0].targetValue, 10);

      // Remaining tiles filled with ideas
      assert.ok(populated.tiles[1].activityId.startsWith("idea_"));
      assert.ok(populated.tiles[8].activityId.startsWith("idea_"));
    });
  });

  // ── 3. Normalization & Fallbacks ──────────────────────────────────────────
  await t.test("3. Normalization & Fallbacks", async (t) => {
    await t.test("handles null or undefined safely with default 3x3 board", () => {
      const normalized = normalizeBingoBoard(null, "2026-10-10", "2026-10-16");
      assert.ok(normalized);
      assert.equal(normalized.size, 3);
      assert.equal(normalized.tiles.length, 9);
      assert.equal(normalized.theme, "blush");
    });

    await t.test("clamps invalid theme or size to safe fallbacks", () => {
      const raw = {
        size: 5, // invalid
        theme: "neon-glitch", // invalid
        tiles: [{ id: "t1", title: "Valid Tile" }],
      };
      const normalized = normalizeBingoBoard(raw, "2026-10-10", "2026-10-16");
      assert.equal(normalized.size, 3);
      assert.equal(normalized.theme, "blush");
      assert.equal(normalized.tiles.length, 9);
      assert.equal(normalized.tiles[0].title, "Valid Tile");
    });

    await t.test("truncates excess tiles when normalizing a shrunk board", () => {
      const raw = {
        size: 3,
        theme: "mint",
        tiles: new Array(16).fill(null).map((_, i) => ({ id: `t_${i}`, title: `Tile ${i}` })),
      };
      const normalized = normalizeBingoBoard(raw, "2026-10-10", "2026-10-16");
      assert.equal(normalized.tiles.length, 9);
    });
  });

  // ── 4. Line Calculation & Celebrations ────────────────────────────────────
  await t.test("4. Line Calculation & Celebrations", async (t) => {
    await t.test("detects completed row on 3x3 board", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      board.tiles[0].completed = true;
      board.tiles[0].title = "Care 1";
      board.tiles[1].completed = true;
      board.tiles[1].title = "Care 2";
      board.tiles[2].completed = true;
      board.tiles[2].title = "Care 3";

      const stats = calculateCompletedLines(board.tiles, 3);
      assert.equal(stats.completedLinesCount, 1);
      assert.equal(stats.completedTilesCount, 3);
      assert.equal(stats.isFullBoardCompleted, false);
      assert.equal(stats.lines[0].isCompleted, true); // Row 0
    });

    await t.test("detects completed diagonal on 3x3 board", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      board.tiles[0].completed = true;
      board.tiles[0].title = "Care 1";
      board.tiles[4].completed = true;
      board.tiles[4].title = "Care 5";
      board.tiles[8].completed = true;
      board.tiles[8].title = "Care 9";

      const stats = calculateCompletedLines(board.tiles, 3);
      const diagMain = stats.lines.find((l) => l.type === "diagonal" && l.index === 0);
      assert.ok(diagMain?.isCompleted);
    });

    await t.test("detects full board completion on 4x4 board", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 4, "lavender");
      board.tiles.forEach((t, i) => {
        t.title = `Activity ${i}`;
        t.completed = true;
      });

      const stats = calculateCompletedLines(board.tiles, 4);
      assert.equal(stats.isFullBoardCompleted, true);
      assert.equal(stats.completedTilesCount, 16);
      // 4 rows + 4 columns + 2 diagonals = 10 completed lines
      assert.equal(stats.completedLinesCount, 10);
    });
  });

  // ── 5. Deterministic Completion Matching Policy ───────────────────────────
  await t.test("5. Deterministic Completion Matching Policy", async (t) => {
    await t.test("matches completed plan items strictly within week window", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      board.tiles[0].activityId = "act_tea";
      board.tiles[0].title = "Evening Tea";

      const planItems = [
        {
          id: "plan_old",
          activityId: "act_tea",
          localDate: "2026-10-05", // Prior week - MUST NOT MATCH
          status: "completed",
        },
        {
          id: "plan_current",
          activityId: "act_tea",
          localDate: "2026-10-12", // Inside week - MUST MATCH
          status: "completed",
        },
      ];

      const matched = matchCompletionsForWeek(board, planItems);
      assert.equal(matched.tiles[0].completed, true);
      assert.equal(matched.tiles[0].planItemId, "plan_current");
      assert.equal(matched.tiles[0].completedDate, "2026-10-12");
    });

    await t.test("does not satisfy tile when completion is pending or skipped", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      board.tiles[0].activityId = "act_stretch";
      board.tiles[0].title = "Gentle Stretch";

      const planItems = [
        {
          id: "plan_pending",
          activityId: "act_stretch",
          localDate: "2026-10-12",
          status: "pending",
        },
      ];

      const matched = matchCompletionsForWeek(board, planItems);
      assert.equal(matched.tiles[0].completed, false);
    });

    await t.test("prevents one completion from satisfying multiple tiles", () => {
      const board = createDefaultBingoBoard("2026-10-10", "2026-10-16", 3, "blush");
      // Activity appears on tile 0 and tile 1
      board.tiles[0].activityId = "act_read";
      board.tiles[0].occurrenceIndex = 0;
      board.tiles[0].title = "Read Chapter 1";

      board.tiles[1].activityId = "act_read";
      board.tiles[1].occurrenceIndex = 1;
      board.tiles[1].title = "Read Chapter 2";

      const planItems = [
        {
          id: "plan_read_1",
          activityId: "act_read",
          localDate: "2026-10-11",
          status: "completed",
        },
      ];

      const matched = matchCompletionsForWeek(board, planItems);
      assert.equal(matched.tiles[0].completed, true);
      assert.equal(matched.tiles[0].planItemId, "plan_read_1");
      // Tile 1 remains uncompleted because only one completion occurred
      assert.equal(matched.tiles[1].completed, false);
    });
  });

  // ── 6. Progress Language & Formatting ─────────────────────────────────────
  await t.test("6. Progress Language & Formatting", async (t) => {
    await t.test("formats care moments without competitive ranking or streak loss in English", () => {
      assert.equal(formatCareCount(0, false), "Self-care Bingo 🌸");
      assert.equal(formatCareCount(1, false), "1 moment of care 🌸");
      assert.equal(formatCareCount(4, false), "4 moments of care 🌸");
    });

    await t.test("formats care moments with feminine warm phrasing in Arabic", () => {
      assert.equal(formatCareCount(0, true), "بينغو العناية بنفسي 🌸");
      assert.equal(formatCareCount(1, true), "لحظة عناية واحدة 🌸");
      assert.equal(formatCareCount(2, true), "لحظتان للعناية بنفسكِ 🌸");
      assert.equal(formatCareCount(4, true), "4 لحظات للعناية بنفسكِ 🌸");
      assert.equal(formatCareCount(12, true), "12 لحظة للعناية بنفسكِ 🌸");
    });
  });
});
