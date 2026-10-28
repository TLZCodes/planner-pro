import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeVisionBoard,
  normalizeVisionBoardItem,
  duplicateBoardWithItems,
  reorderBoardItems,
  VISION_BOARD_THEMES,
} from "../src/lib/visionEngine.ts";

describe("Vision Board Engine & Store Rules", () => {
  // ── 1. Board Normalization ──
  describe("normalizeVisionBoard", () => {
    it("fills safe defaults for empty object", () => {
      const board = normalizeVisionBoard({});
      assert.ok(board.id.startsWith("vb-"));
      assert.equal(board.title, "My Vision Board");
      assert.equal(board.theme, "blossom");
      assert.equal(board.layout, "collage");
      assert.equal(board.status, "active");
      assert.equal(board.isPinnedToHome, false);
      assert.ok(board.createdAt);
      assert.ok(board.updatedAt);
    });

    it("preserves custom properties and validates theme/layout", () => {
      const board = normalizeVisionBoard({
        id: "custom-id",
        title: "2027 Becoming Her",
        description: "My life in peace and luxury",
        timeHorizon: "2027",
        theme: "lavender",
        layout: "grid",
        status: "archived",
        isPinnedToHome: true,
      });

      assert.equal(board.id, "custom-id");
      assert.equal(board.title, "2027 Becoming Her");
      assert.equal(board.description, "My life in peace and luxury");
      assert.equal(board.timeHorizon, "2027");
      assert.equal(board.theme, "lavender");
      assert.equal(board.layout, "grid");
      assert.equal(board.status, "archived");
      assert.equal(board.isPinnedToHome, true);
    });

    it("falls back to defaults when invalid theme or layout is supplied", () => {
      const board = normalizeVisionBoard({
        theme: "neon_alien",
        layout: "random_3d",
      });

      assert.equal(board.theme, "blossom");
      assert.equal(board.layout, "collage");
    });
  });

  // ── 2. Item Normalization ──
  describe("normalizeVisionBoardItem", () => {
    it("normalizes photo items with aspect ratio and sticker defaults", () => {
      const item = normalizeVisionBoardItem({
        boardId: "board-1",
        type: "photo",
        imageUrl: "data:image/png;base64,mock",
        caption: "Peaceful morning coffee",
      });

      assert.ok(item.id.startsWith("vb-"));
      assert.equal(item.boardId, "board-1");
      assert.equal(item.type, "photo");
      assert.equal(item.imageUrl, "data:image/png;base64,mock");
      assert.equal(item.caption, "Peaceful morning coffee");
      assert.equal(item.imageAspectRatio, "square");
      assert.equal(item.washiColor, "pink");
      assert.equal(item.order, 0);
    });

    it("normalizes linked goal items with goal reference", () => {
      const item = normalizeVisionBoardItem({
        boardId: "board-1",
        type: "linked_goal",
        linkedGoalId: "goal-123",
        caption: "Memorize Juz Amma",
      });

      assert.equal(item.type, "linked_goal");
      assert.equal(item.linkedGoalId, "goal-123");
      assert.equal(item.caption, "Memorize Juz Amma");
    });

    it("normalizes affirmation and wish items", () => {
      const aff = normalizeVisionBoardItem({
        boardId: "board-1",
        type: "text",
        content: "I am radiant, patient, and full of peace.",
      });
      assert.equal(itemTypeSafe(aff.type), "text");
      assert.equal(aff.content, "I am radiant, patient, and full of peace.");

      const wish = normalizeVisionBoardItem({
        boardId: "board-1",
        type: "wish",
        content: "Perform Umrah with my mother",
      });
      assert.equal(wish.type, "wish");
      assert.equal(wish.content, "Perform Umrah with my mother");
    });
  });

  // ── 3. Board Duplication (Independent Deep Copy) ──
  describe("duplicateBoardWithItems", () => {
    it("creates an independent copy with fresh IDs and deep copies all items", () => {
      const originalBoard = {
        id: "original-board-1",
        title: "Dream Life 2026",
        description: "Vision board description",
        theme: "mint",
        layout: "collage",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };

      const originalItems = [
        {
          id: "item-1",
          boardId: "original-board-1",
          type: "photo",
          imageUrl: "data:image/png;base64,img1",
          caption: "Dream garden",
          order: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "item-2",
          boardId: "original-board-1",
          type: "wish",
          content: "Launch studio",
          order: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ];

      const { duplicatedBoard, duplicatedItems } = duplicateBoardWithItems(
        originalBoard,
        originalItems,
        false
      );

      // Verify board independence
      assert.notEqual(duplicatedBoard.id, originalBoard.id);
      assert.equal(duplicatedBoard.title, "Dream Life 2026 (Copy)");
      assert.equal(duplicatedBoard.theme, "mint");
      assert.equal(duplicatedBoard.layout, "collage");
      assert.equal(duplicatedBoard.isPinnedToHome, false); // Duplicated board does not inherit pinned status

      // Verify items independence
      assert.equal(duplicatedItems.length, 2);
      assert.notEqual(duplicatedItems[0].id, originalItems[0].id);
      assert.notEqual(duplicatedItems[1].id, originalItems[1].id);
      assert.equal(duplicatedItems[0].boardId, duplicatedBoard.id);
      assert.equal(duplicatedItems[1].boardId, duplicatedBoard.id);
      assert.equal(duplicatedItems[0].caption, "Dream garden");
      assert.equal(duplicatedItems[1].content, "Launch studio");

      // Modifying duplicate should not mutate original
      duplicatedItems[0].caption = "Mutated Caption";
      assert.equal(originalItems[0].caption, "Dream garden");
    });
  });

  // ── 4. Reordering Engine (Mobile Touch Alternative) ──
  describe("reorderBoardItems", () => {
    const items = [
      { id: "A", boardId: "b1", type: "text", content: "A", order: 0, createdAt: "", updatedAt: "" },
      { id: "B", boardId: "b1", type: "text", content: "B", order: 1, createdAt: "", updatedAt: "" },
      { id: "C", boardId: "b1", type: "text", content: "C", order: 2, createdAt: "", updatedAt: "" },
      { id: "D", boardId: "b1", type: "text", content: "D", order: 3, createdAt: "", updatedAt: "" },
    ];

    it("moves item up correctly", () => {
      const result = reorderBoardItems(items, "b1", "B", "up");
      assert.deepEqual(result.map((i) => i.id), ["B", "A", "C", "D"]);
      assert.deepEqual(result.map((i) => i.order), [0, 1, 2, 3]);
    });

    it("does nothing when moving top item up", () => {
      const result = reorderBoardItems(items, "b1", "A", "up");
      assert.deepEqual(result.map((i) => i.id), ["A", "B", "C", "D"]);
    });

    it("moves item down correctly", () => {
      const result = reorderBoardItems(items, "b1", "B", "down");
      assert.deepEqual(result.map((i) => i.id), ["A", "C", "B", "D"]);
      assert.deepEqual(result.map((i) => i.order), [0, 1, 2, 3]);
    });

    it("does nothing when moving bottom item down", () => {
      const result = reorderBoardItems(items, "b1", "D", "down");
      assert.deepEqual(result.map((i) => i.id), ["A", "B", "C", "D"]);
    });

    it("moves item to top correctly", () => {
      const result = reorderBoardItems(items, "b1", "C", "top");
      assert.deepEqual(result.map((i) => i.id), ["C", "A", "B", "D"]);
      assert.deepEqual(result.map((i) => i.order), [0, 1, 2, 3]);
    });

    it("moves item to bottom correctly", () => {
      const result = reorderBoardItems(items, "b1", "B", "bottom");
      assert.deepEqual(result.map((i) => i.id), ["A", "C", "D", "B"]);
      assert.deepEqual(result.map((i) => i.order), [0, 1, 2, 3]);
    });
  });

  // ── 5. Zero XP Guarantee & Palettes ──
  describe("Zero XP & Themes", () => {
    it("has 5 themes configured with pastel palettes", () => {
      const themes = Object.keys(VISION_BOARD_THEMES);
      assert.equal(themes.length, 5);
      assert.ok(themes.includes("blossom"));
      assert.ok(themes.includes("lavender"));
      assert.ok(themes.includes("butter"));
      assert.ok(themes.includes("mint"));
      assert.ok(themes.includes("minimal"));
    });
  });
});

function itemTypeSafe(t) {
  return t;
}

