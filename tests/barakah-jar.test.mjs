import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PAPER_COLORS,
  FLOWER_STYLES,
  isBarakahJarEntry,
  getYearMonthKey,
  formatMonthName,
  getAdjacentMonthKey,
  getBarakahNotesForMonth,
  getAvailableBarakahMonths,
  pickRandomBlessing,
  deriveJarVisualTokens,
  MAX_VISIBLE_TOKENS,
  formatBlessingDate,
} from "../src/lib/barakahJarEngine.ts";

describe("AYXA Barakah Jar (جرّة النِّعم 🤍) Engine & Verification Suite", () => {
  describe("1. Palettes & Visual Tokens", () => {
    it("provides the 5 required soft pastel paper colors", () => {
      const keys = Object.keys(PAPER_COLORS);
      assert.deepEqual(keys.sort(), ["blush", "butter", "lavender", "mint", "sky"].sort());
      for (const key of keys) {
        const color = PAPER_COLORS[key];
        assert.ok(color.hex.startsWith("#"));
        assert.ok(color.fillHex.startsWith("#"));
        assert.ok(color.labelEn);
        assert.ok(color.labelAr);
      }
    });

    it("provides the 5 required flower accents", () => {
      const keys = Object.keys(FLOWER_STYLES);
      assert.deepEqual(keys.sort(), ["chamomile", "jasmine", "lavender", "rose", "sakura"].sort());
      for (const key of keys) {
        const flower = FLOWER_STYLES[key];
        assert.ok(flower.emoji);
        assert.ok(flower.labelEn);
        assert.ok(flower.labelAr);
      }
    });

    it("derives visual tokens for empty jar honestly", () => {
      const visual = deriveJarVisualTokens([]);
      assert.equal(visual.exactCount, 0);
      assert.equal(visual.isAggregated, false);
      assert.equal(visual.tokens.length, 0);
      assert.equal(visual.fillPercentage, 0);
    });

    it("derives discrete tokens up to MAX_VISIBLE_TOKENS without aggregating", () => {
      const notes = Array.from({ length: 5 }, (_, i) => ({
        id: `note-${i}`,
        paperColor: "blush",
        flowerStyle: "sakura",
      }));
      const visual = deriveJarVisualTokens(notes);
      assert.equal(visual.exactCount, 5);
      assert.equal(visual.isAggregated, false);
      assert.equal(visual.tokens.length, 5);
      assert.ok(visual.tokens[0].x >= 30 && visual.tokens[0].x <= 140);
      assert.ok(visual.tokens[0].y >= 90 && visual.tokens[0].y <= 220);
    });

    it("aggregates visual fill honesty when notes exceed MAX_VISIBLE_TOKENS", () => {
      const notes = Array.from({ length: 45 }, (_, i) => ({
        id: `overflow-${i}`,
        paperColor: "mint",
        flowerStyle: "chamomile",
      }));
      const visual = deriveJarVisualTokens(notes);
      assert.equal(visual.exactCount, 45);
      assert.equal(visual.isAggregated, true);
      assert.equal(visual.tokens.length, MAX_VISIBLE_TOKENS);
      assert.equal(visual.fillPercentage, 100);
    });
  });

  describe("2. Entry Classification & Membership", () => {
    it("detects Barakah Jar entry via isBarakahJar flag", () => {
      assert.equal(isBarakahJarEntry({ isBarakahJar: true }), true);
      assert.equal(isBarakahJarEntry({ isBarakahJar: false }), false);
      assert.equal(isBarakahJarEntry({}), false);
    });

    it("detects Barakah Jar entry via explicit barakah_jar tag", () => {
      assert.equal(isBarakahJarEntry({ tags: ["gratitude", "barakah_jar"] }), true);
      assert.equal(isBarakahJarEntry({ tags: ["barakah"] }), true);
      assert.equal(isBarakahJarEntry({ tags: ["work", "personal"] }), false);
    });
  });

  describe("3. Month Keys & Navigation", () => {
    it("extracts YYYY-MM correctly from date strings", () => {
      assert.equal(getYearMonthKey("2026-10-15"), "2026-10");
      assert.equal(getYearMonthKey("2025-01-01"), "2025-01");
    });

    it("formats human-readable month names in English and Arabic", () => {
      assert.equal(formatMonthName("2026-10", false), "October 2026");
      assert.equal(formatMonthName("2026-10", true), "أكتوبر 2026");
      assert.equal(formatMonthName("2026-04", false), "April 2026");
      assert.equal(formatMonthName("2026-04", true), "أبريل 2026");
    });

    it("computes adjacent months across calendar years correctly", () => {
      assert.equal(getAdjacentMonthKey("2026-01", -1), "2025-12");
      assert.equal(getAdjacentMonthKey("2026-12", 1), "2027-01");
      assert.equal(getAdjacentMonthKey("2026-05", -1), "2026-04");
      assert.equal(getAdjacentMonthKey("2026-05", 1), "2026-06");
    });
  });

  describe("4. Filtering, Summaries & All Notes View", () => {
    const mockJournal = [
      { id: "j1", date: "2026-10-02", isBarakahJar: true, tags: [] },
      { id: "j2", date: "2026-10-10", isBarakahJar: true, tags: [] },
      { id: "j3", date: "2026-09-15", isBarakahJar: true, tags: [] },
      { id: "j4", date: "2026-10-05", isBarakahJar: false, tags: ["work"] }, // not in jar
      { id: "j5", date: "2026-08-20", isBarakahJar: false, tags: ["barakah_jar"] }, // in jar via tag
    ];

    it("filters notes for a specific month and orders newest first", () => {
      const oct = getBarakahNotesForMonth(mockJournal, "2026-10");
      assert.equal(oct.length, 2);
      assert.equal(oct[0].id, "j2");
      assert.equal(oct[1].id, "j1");
    });

    it("returns all notes across all months when monthKey is 'all'", () => {
      const all = getBarakahNotesForMonth(mockJournal, "all");
      assert.equal(all.length, 4); // j1, j2, j3, j5
      assert.equal(all[0].id, "j2"); // newest
      assert.equal(all[all.length - 1].id, "j5"); // oldest
    });

    it("computes available months summary with counts", () => {
      const months = getAvailableBarakahMonths(mockJournal);
      assert.deepEqual(months, [
        { key: "2026-10", count: 2 },
        { key: "2026-09", count: 1 },
        { key: "2026-08", count: 1 },
      ]);
    });
  });

  describe("5. Random Note Selection ('Pick a note for me')", () => {
    it("returns null for empty collection", () => {
      const picked = pickRandomBlessing([]);
      assert.equal(picked, null);
    });

    it("returns single element if collection has only one item", () => {
      const item = { id: "solo", title: "Peaceful morning" };
      const picked = pickRandomBlessing([item]);
      assert.equal(picked?.id, "solo");
    });

    it("selects only from real saved entries and avoids excludeId when multiple choices exist", () => {
      const items = [
        { id: "item-1", title: "Family tea" },
        { id: "item-2", title: "Gentle rain" },
      ];
      // When excluding item-1, it must pick item-2
      const picked = pickRandomBlessing(items, "item-1");
      assert.equal(picked?.id, "item-2");
    });
  });

  describe("6. Date Formatting for Cards", () => {
    it("formats local dates safely", () => {
      const formattedEn = formatBlessingDate("2026-10-15", false);
      assert.ok(formattedEn.includes("2026"));
      assert.ok(formattedEn.includes("Oct"));

      const formattedAr = formatBlessingDate("2026-10-15", true);
      assert.ok(formattedAr.length > 5);
    });

    it("falls back gracefully for invalid or empty dates", () => {
      assert.equal(formatBlessingDate("", false), "");
      assert.equal(formatBlessingDate("invalid", false), "invalid");
    });
  });
});
