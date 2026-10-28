import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  BLOOM_THEMES,
  createDefaultBloomBlocks,
  createNewBloomKeepsake,
  normalizeWeekInBloomKeepsake,
  extractResetSourceItems,
  extractTaskAccomplishments,
  extractFocusStudyMetrics,
  formatDurationLabel,
} from "../src/lib/weekInBloomEngine.ts";

describe("AYXA My Week in Bloom (أسبوعي يزهر 🌷) Engine & Verification Suite", () => {
  describe("1. Palettes & Themes", () => {
    it("provides the 4 required pastel themes", () => {
      const keys = Object.keys(BLOOM_THEMES);
      assert.deepEqual(keys.sort(), ["blush", "cream", "lavender", "mint"].sort());
      for (const key of keys) {
        const theme = BLOOM_THEMES[key];
        assert.ok(theme.bgHex.startsWith("#"));
        assert.ok(theme.cardBgHex.startsWith("#"));
        assert.ok(theme.borderHex.startsWith("#"));
        assert.ok(theme.accentHex.startsWith("#"));
        assert.ok(theme.nameEn);
        assert.ok(theme.nameAr);
      }
    });
  });

  describe("2. Default Blocks & Keepsake Factory", () => {
    it("creates 8 default blocks with visibility enabled", () => {
      const blocks = createDefaultBloomBlocks();
      assert.equal(blocks.length, 8);
      const expectedTypes = [
        "photo",
        "accomplishments",
        "lovely_moment",
        "supported_habit",
        "focus_study",
        "lesson",
        "gratitude",
        "next_intention",
      ];
      assert.deepEqual(
        blocks.map((b) => b.type).sort(),
        expectedTypes.sort()
      );
      for (const b of blocks) {
        assert.equal(b.visible, true);
      }
    });

    it("creates new keepsake with valid default state and draft status", () => {
      const keepsake = createNewBloomKeepsake({
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        title: "My Special Week",
      });

      assert.ok(keepsake.id.startsWith("bloom-"));
      assert.equal(keepsake.weekStartDate, "2026-10-10");
      assert.equal(keepsake.weekEndDate, "2026-10-16");
      assert.equal(keepsake.title, "My Special Week");
      assert.equal(keepsake.layout, "scrapbook");
      assert.equal(keepsake.theme, "blush");
      assert.equal(keepsake.isDraft, true);
      assert.equal(keepsake.showAyxaSignature, true);
      assert.equal(keepsake.showDateRange, true);
      assert.equal(keepsake.blocks.length, 8);
    });
  });

  describe("3. Normalization & Fallbacks", () => {
    it("handles null and undefined gracefully without throwing", () => {
      const normNull = normalizeWeekInBloomKeepsake(null);
      assert.ok(normNull.id);
      assert.equal(normNull.layout, "scrapbook");
      assert.equal(normNull.theme, "blush");
      assert.equal(normNull.blocks.length, 8);

      const normEmpty = normalizeWeekInBloomKeepsake({});
      assert.ok(normEmpty.id);
      assert.equal(normEmpty.isDraft, true);
    });

    it("clamps invalid layout or theme to valid fallbacks", () => {
      const norm = normalizeWeekInBloomKeepsake({
        id: "test-1",
        layout: "nonexistent_layout",
        theme: "neon_green",
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
      });
      assert.equal(norm.layout, "scrapbook");
      assert.equal(norm.theme, "blush");
    });

    it("preserves custom user blocks and fills missing default blocks", () => {
      const raw = {
        id: "test-2",
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        blocks: [
          {
            id: "lovely_moment",
            type: "lovely_moment",
            visible: true,
            content: "Sipping matcha in morning stillness.",
          },
        ],
      };
      const norm = normalizeWeekInBloomKeepsake(raw);
      assert.equal(norm.blocks.length, 8);
      const moment = norm.blocks.find((b) => b.type === "lovely_moment");
      assert.equal(moment.content, "Sipping matcha in morning stillness.");
    });
  });

  describe("4. Canonical Source Extractors", () => {
    it("extracts items from Weekly Reset reflection without mutating original record", () => {
      const resetNote = {
        accomplishments: [
          { text: "Organized the client presentation", done: true },
          { text: "Began Arabic calligraphy course", done: true },
        ],
        reflectionAnswers: {
          went_well: "Waking up before sunrise peacefully",
          gratitude: "Good health and warm family tea times",
          adjust: "Gentle boundaries with screen time after 9 PM",
          supported_me: "Evening walks and peppermint tea",
        },
        nextWeekIntention: "Speak with calmness and move gently.",
      };

      const extracted = extractResetSourceItems(resetNote);
      assert.equal(extracted.accomplishments.length, 2);
      assert.equal(extracted.accomplishments[0], "Organized the client presentation");
      assert.equal(extracted.gratitude, "Good health and warm family tea times");
      assert.equal(extracted.lesson, "Gentle boundaries with screen time after 9 PM");
      assert.equal(extracted.nextWeekIntention, "Speak with calmness and move gently.");
      assert.equal(extracted.supportedMe, "Evening walks and peppermint tea");
    });

    it("extracts task accomplishments strictly within the week window", () => {
      const tasks = [
        { id: "t1", title: "Task Inside Week", done: true, doneDate: "2026-10-12" },
        { id: "t2", title: "Task Outside Week (Past)", done: true, doneDate: "2026-10-01" },
        { id: "t3", title: "Task Outside Week (Future)", done: true, doneDate: "2026-10-25" },
        { id: "t4", title: "Task Not Done", done: false, dueDate: "2026-10-12" },
      ];

      const weekStart = "2026-10-10";
      const weekEnd = "2026-10-16";
      const done = extractTaskAccomplishments(tasks, weekStart, weekEnd);

      assert.equal(done.length, 1);
      assert.equal(done[0].id, "t1");
      assert.equal(done[0].title, "Task Inside Week");
    });

    it("aggregates focus and study metrics truthfully and avoids double counting", () => {
      const focusSessions = [
        {
          id: "f1",
          localDate: "2026-10-11",
          status: "completed",
          actualFocusSeconds: 1800, // 30 min pure focus
          sourceType: "general",
        },
        {
          id: "f2",
          localDate: "2026-10-12",
          status: "completed",
          actualFocusSeconds: 1200, // 20 min subject study focus
          sourceType: "subject",
        },
      ];

      const studySessions = [
        { id: "s1", date: "2026-10-12", minutes: 45 },
      ];

      const metricsCurrent = extractFocusStudyMetrics(
        focusSessions,
        studySessions,
        "2026-10-10",
        "2026-10-16",
        true // isCurrentWeek
      );

      assert.ok(metricsCurrent);
      // Pure focus 30 min + study 45 min = 75 min (overlap session avoided)
      assert.equal(metricsCurrent.minutes, 75);
      assert.equal(metricsCurrent.isSoFar, true);
    });

    it("returns null if no focus or study recorded (zero fabrication)", () => {
      const empty = extractFocusStudyMetrics(
        [],
        [],
        "2026-10-10",
        "2026-10-16",
        false
      );
      assert.equal(empty, null);
    });
  });

  describe("5. Duration Formatting (Bilingual)", () => {
    it("formats minutes and hours properly in English and Arabic", () => {
      assert.equal(formatDurationLabel(25, false), "25 min");
      assert.equal(formatDurationLabel(25, true), "25 دقيقة");

      assert.equal(formatDurationLabel(60, false), "1 hr");
      assert.equal(formatDurationLabel(60, true), "ساعة واحدة");

      assert.equal(formatDurationLabel(120, false), "2 hrs");
      assert.equal(formatDurationLabel(120, true), "ساعتان");

      assert.equal(formatDurationLabel(90, false), "1h 30m");
      assert.equal(formatDurationLabel(90, true), "1 س و 30 د");
    });
  });
});
