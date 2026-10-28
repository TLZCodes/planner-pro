import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeBrainDumpItem,
  splitThoughtContent,
  findPotentialDuplicates,
  formatAudioSeconds,
  BRAIN_DUMP_LABELS,
  DRAFT_STORAGE_KEY,
} from "../src/lib/brainDumpEngine.ts";

describe("AYXA Brain Dump Inbox Engine & Verification Suite", () => {
  describe("1. Item Normalization & Safe Defaults", () => {
    it("normalizes an empty item with robust defaults", () => {
      const item = normalizeBrainDumpItem({});
      assert.ok(item.id.startsWith("bd-"));
      assert.equal(item.content, "");
      assert.equal(item.status, "unsorted");
      assert.equal(item.label, undefined);
      assert.ok(item.createdAt);
      assert.ok(item.updatedAt);
    });

    it("preserves title, content, custom label, and timestamps", () => {
      const now = "2026-10-14T10:00:00.000Z";
      const item = normalizeBrainDumpItem({
        id: "bd-custom-123",
        title: "  Study for exam  ",
        content: "Remember chapter 4 on biology",
        label: "learning",
        status: "organized",
        createdAt: now,
        updatedAt: now,
      });

      assert.equal(item.id, "bd-custom-123");
      assert.equal(item.title, "Study for exam");
      assert.equal(item.content, "Remember chapter 4 on biology");
      assert.equal(item.label, "learning");
      assert.equal(item.status, "organized");
      assert.equal(item.createdAt, now);
      assert.equal(item.updatedAt, now);
    });

    it("handles durable base64 audio payload and audio duration", () => {
      const fakeDataUrl = "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=";
      const item = normalizeBrainDumpItem({
        content: "Voice note recorded during morning walk",
        audioDataUrl: fakeDataUrl,
        audioDurationSeconds: 42,
        transcript: "Voice note recorded during morning walk",
        transcriptSource: "web_speech",
      });

      assert.equal(item.audioDataUrl, fakeDataUrl);
      assert.equal(item.audioDurationSeconds, 42);
      assert.equal(item.transcript, "Voice note recorded during morning walk");
      assert.equal(item.transcriptSource, "web_speech");
    });
  });

  describe("2. Labels & Metadata", () => {
    it("contains all 9 canonical pastel labels", () => {
      const labelKeys = BRAIN_DUMP_LABELS.map((l) => l.key);
      const expected = [
        "task",
        "idea",
        "goal",
        "shopping",
        "project",
        "journal",
        "travel",
        "learning",
        "other",
      ];
      assert.deepEqual(labelKeys, expected);
    });

    it("provides complete bilingual metadata for every label", () => {
      for (const meta of BRAIN_DUMP_LABELS) {
        assert.ok(meta.emoji, `Label ${meta.key} missing emoji`);
        assert.ok(meta.labelEn, `Label ${meta.key} missing English label`);
        assert.ok(meta.labelAr, `Label ${meta.key} missing Arabic label`);
        assert.ok(meta.bgLight, `Label ${meta.key} missing bgLight`);
        assert.ok(meta.textColor, `Label ${meta.key} missing textColor`);
      }
    });
  });

  describe("3. Splitting Thoughts Logic", () => {
    it("returns empty array for empty content", () => {
      assert.deepEqual(splitThoughtContent(""), []);
      assert.deepEqual(splitThoughtContent("   \n\n  "), []);
    });

    it("splits multiline content cleanly and strips bullet markers", () => {
      const raw = `
- Call Sarah about catering
- 1. Buy lavender diffuser oils
* Book flight tickets to Istanbul
Review biology flashcards
      `;

      const parts = splitThoughtContent(raw);
      assert.equal(parts.length, 4);
      assert.equal(parts[0], "Call Sarah about catering");
      assert.equal(parts[1], "Buy lavender diffuser oils");
      assert.equal(parts[2], "Book flight tickets to Istanbul");
      assert.equal(parts[3], "Review biology flashcards");
    });
  });

  describe("4. Duplicate Detection across Destination Systems", () => {
    const mockState = {
      tasks: [
        { id: "t-1", title: "Review biology flashcards", tag: "Study" },
        { id: "t-2", title: "Renew passport for Summer", tag: "Personal" },
      ],
      goals: [
        { id: "g-1", title: "Launch marketing campaign", category: "Career" },
      ],
      businessProjects: [
        { id: "p-1", title: "Planner Pro E-Commerce Store" },
      ],
      travelTrips: [
        { id: "tr-1", destination: "Tokyo & Kyoto Sakura" },
      ],
    };

    it("detects task duplicates matching query", () => {
      const matches = findPotentialDuplicates("biology", mockState);
      assert.equal(matches.length, 1);
      assert.equal(matches[0].type, "task");
      assert.equal(matches[0].id, "t-1");
      assert.equal(matches[0].title, "Review biology flashcards");
    });

    it("detects goal duplicates matching query", () => {
      const matches = findPotentialDuplicates("marketing campaign", mockState);
      assert.equal(matches.length, 1);
      assert.equal(matches[0].type, "goal");
      assert.equal(matches[0].id, "g-1");
    });

    it("detects travel duplicates matching query", () => {
      const matches = findPotentialDuplicates("Tokyo", mockState);
      assert.equal(matches.length, 1);
      assert.equal(matches[0].type, "travel_trip");
      assert.equal(matches[0].id, "tr-1");
    });

    it("returns empty array when query is too short or doesn't match", () => {
      assert.deepEqual(findPotentialDuplicates("hi", mockState), []);
      assert.deepEqual(findPotentialDuplicates("completely unrelated text", mockState), []);
    });
  });

  describe("5. Audio Seconds Formatter", () => {
    it("formats seconds accurately into mm:ss", () => {
      assert.equal(formatAudioSeconds(0), "00:00");
      assert.equal(formatAudioSeconds(9), "00:09");
      assert.equal(formatAudioSeconds(65), "01:05");
      assert.equal(formatAudioSeconds(360), "06:00");
    });
  });

  describe("6. Architectural Boundaries & Data Integrity", () => {
    it("draft key constant is stable", () => {
      assert.equal(DRAFT_STORAGE_KEY, "ayxa_braindump_draft");
    });

    it("preserves status as organized when destination exists", () => {
      const item = normalizeBrainDumpItem({
        content: "Need to launch branding guide",
        status: "organized",
        destination: {
          type: "business_project",
          id: "p-100",
          title: "Branding Guide",
          createdAt: "2026-10-14T12:00:00.000Z",
        },
      });

      assert.equal(item.status, "organized");
      assert.ok(item.destination);
      assert.equal(item.destination.type, "business_project");
      assert.equal(item.destination.id, "p-100");
    });

    it("supports protected destination indicator for locked Journal entries", () => {
      const item = normalizeBrainDumpItem({
        content: "Deep reflections from today",
        status: "organized",
        destination: {
          type: "journal",
          id: "j-555",
          title: "Protected Journal Entry 🔒",
          createdAt: "2026-10-14T12:00:00.000Z",
          isProtected: true,
        },
      });

      assert.equal(item.destination.isProtected, true);
      assert.equal(item.destination.title, "Protected Journal Entry 🔒");
    });
  });
});
